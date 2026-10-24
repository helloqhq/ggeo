import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {once} from 'node:events';
import {runInNewContext} from 'node:vm';
import {readData,validateData,root} from '../scripts/validate-data.mjs';
import {createRenderer} from '../src/templates.mjs';
import {card,escapeHtml,icon,normalizeWebsite} from '../src/components.mjs';
const original=await readData(),clone=()=>structuredClone(original);
const read=path=>readFile(resolve(root,'dist',path),'utf8');
test('content validates with all eight canonical categories',()=>{
  assert.equal(validateData(original).tools,original.tools.filter(t=>t.status==='published').length);
  assert.equal(original.categories.length,8);
});
test('GA4 waits for consent and only loads once on production content pages',async()=>{
  const source=(await readFile(resolve(root,'src/analytics.mjs'),'utf8')).replace(/^import .*;\n/m,''),measurementId='G-TEST12345';
  const run=(hostname,pathname,initial=false,id=measurementId)=>{
    const scripts=[],window={};let change,reloads=0,cleans=0;
    const document={querySelector:()=>({dataset:{googleAnalyticsId:id,siteHostname:'ggeo.ai'}}),createElement:()=>({}),head:{append:script=>scripts.push(script)}};
    runInNewContext(source,{window,document,location:{hostname,pathname,reload:()=>reloads++},initCookieConsent:callback=>{change=callback;callback(initial);},clearAnalyticsCookies:()=>cleans++});
    return {scripts,window,change,get reloads(){return reloads;},get cleans(){return cleans;}};
  };
  for(const [hostname,pathname,id] of [['127.0.0.1','/en/'],['localhost','/zh/'],['preview.example.com','/en/'],['ggeo.ai','/'],['ggeo.ai','/en/','']]){
    const result=run(hostname,pathname,true,id);assert.equal(result.scripts.length,0);assert.equal(result.window.dataLayer,undefined);
  }
  for(const pathname of ['/en/','/zh/tools/peec-ai/','/en/search/']){
    const result=run('ggeo.ai',pathname),{scripts,window}=result;
    assert.equal(scripts.length,0);assert.equal(window.dataLayer,undefined);
    assert.equal(window[`ga-disable-${measurementId}`],true);assert.equal(result.cleans,1);
    result.change(false);assert.equal(scripts.length,0);assert.equal(result.reloads,0);
    result.change(true);result.change(true);
    assert.equal(scripts.length,1);assert.equal(scripts[0].async,true);
    assert.equal(scripts[0].src,`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
    assert.equal(window.dataLayer[0][0],'consent');assert.equal(window.dataLayer[0][2].analytics_storage,'denied');
    for(const field of ['ad_storage','ad_user_data','ad_personalization'])assert.equal(window.dataLayer[0][2][field],'denied');
    assert.equal(window.dataLayer[1][1],'update');assert.equal(window.dataLayer[1][2].analytics_storage,'granted');
    const config=Array.from(window.dataLayer[3]);
    assert.equal(config[0],'config');assert.equal(config[1],measurementId);
    assert.equal(config[2].allow_google_signals,false);assert.equal(config[2].allow_ad_personalization_signals,false);
    result.change(false);assert.equal(window[`ga-disable-${measurementId}`],true);
    assert.equal(result.reloads,1);assert.equal(scripts.length,1);
    assert.equal(window.dataLayer.length,4,'withdrawal does not queue cookieless pings');
  }
  assert.equal(run('ggeo.ai','/zh/',true).scripts.length,1,'remembered consent loads analytics');
});
test('rejects duplicate websites, missing translations, invalid references and dates',()=>{
  for(const mutate of [d=>d.tools[1].website=d.tools[0].website,d=>delete d.tools[0].description.zh,d=>d.tools[0].category='unknown',d=>d.tools[0].sources=[],d=>d.tools[0].verifiedAt='2026-02-30',d=>d.tools[0].website='javascript:alert(1)',d=>d.site.affiliateLinks['not-a-tool']='https://example.com',d=>d.site.googleAnalyticsId='G-invalid"><script>']){
    const data=clone();mutate(data);assert.throws(()=>validateData(data));
  }
});
test('incomplete drafts validate and unpublished tools stay outside the directory renderer',()=>{
  const data=clone(),slug=data.tools[0].slug;data.tools[0].status='draft';delete data.tools[0].description.zh;assert.doesNotThrow(()=>validateData(data));const {render,published}=createRenderer(data);
  assert.ok(!published.some(t=>t.slug===slug));
  assert.ok(!render('en','home').includes('/tools/'+slug+'/'));
});
test('use cases require bilingual text and evidence from the same tool',()=>{
  const example=original.tools[0].useCases[0];
  for(const mutate of [
    tool=>delete tool.useCases,
    tool=>tool.useCases={},
    tool=>tool.useCases=[null],
    tool=>delete tool.useCases[0].description.zh,
    tool=>tool.useCases[0].sourceUrls=[],
    tool=>tool.useCases[0].sourceUrls='https://example.com/',
    tool=>tool.useCases[0].sourceUrls=['https://example.com/unverified'],
    tool=>tool.useCases[0].sourceUrls=[example.sourceUrls[0],example.sourceUrls[0]],
    tool=>tool.sources=tool.sources.filter(source=>!example.sourceUrls.includes(source.url))
  ]){
    const data=clone();mutate(data.tools[0]);assert.throws(()=>validateData(data),/useCases/);
  }
  const data=clone();data.tools[0].useCases=[];
  assert.doesNotThrow(()=>validateData(data));
  assert.ok(!createRenderer(data).render('en','tool',data.tools[0].slug).includes('id="useCases"'));
  data.tools[0].status='draft';delete data.tools[0].useCases;
  assert.doesNotThrow(()=>validateData(data));
});
test('prices, limitations and selection notes reject missing evidence, invalid dates and unknown alternatives',()=>{
  for(const field of ['pricingDetails','limitations','selectionNotes'])for(const mutate of [
    tool=>delete tool[field],
    tool=>delete tool[field][0].description.en,
    tool=>tool[field][0].summary={en:'Incomplete summary'},
    tool=>tool[field][0].sourceUrls=[],
    tool=>tool[field][0].verifiedAt='2026-02-30',
    tool=>tool[field][0].verifiedAt='2099-01-01'
  ]){
    const data=clone();mutate(data.tools[0]);assert.throws(()=>validateData(data));
  }
  for(const alternativeSlug of ['not-a-tool',original.tools[0].slug]){
    const data=clone();data.tools[0].selectionNotes[0].alternativeSlug=alternativeSlug;
    assert.throws(()=>validateData(data),/alternativeSlug/);
  }
  const data=clone(),alternative=data.tools.find(tool=>tool.slug===data.tools[0].selectionNotes[0].alternativeSlug);
  alternative.status='hidden';
  const html=createRenderer(data).render('en','tool',data.tools[0].slug);
  assert.ok(!html.includes(`/tools/${alternative.slug}/`),'hidden comparisons do not produce broken detail links');
});
test('every published detail renders in static HTML with working evidence and alternative links',async()=>{
  for(const tool of original.tools.filter(tool=>tool.status==='published'))for(const lang of ['en','zh']){
    const html=await read(`${lang}/tools/${tool.slug}/index.html`);
    const comparisonFields=['pricingDetails','useCases','limitations'];
    const alternatives=tool.selectionNotes.map(entry=>entry.alternativeSlug?original.tools.find(other=>other.status==='published'&&other.slug===entry.alternativeSlug):original.tools.filter(other=>other.status==='published'&&other.category===tool.category&&other.slug!==tool.slug&&comparisonFields.every(field=>other[field].length)).sort((a,b)=>a.featuredOrder-b.featuredOrder)[0]);
    if(tool.selectionNotes.length){
      const tables=[...html.matchAll(/<table class="selection-table">([\s\S]*?)<\/table>/g)];
      assert.equal(tables.length,tool.selectionNotes.length,`${tool.slug}: selection comparison tables`);
      assert.ok(html.includes(`<th scope="col">${original.ui.comparisonSubject[lang]}</th>`),`${tool.slug}: localized table heading`);
      for(const [i,match] of tables.entries()){
        const table=match[1],alternative=alternatives[i];
        assert.equal((table.match(/scope="col"/g)||[]).length,3,`${tool.slug}: three comparison columns`);
        assert.ok(table.includes(escapeHtml(tool.name)),`${tool.slug}: current tool heading`);
        if(alternative){
          assert.ok(table.includes(escapeHtml(alternative.name)),`${tool.slug}: alternative heading`);
          for(const field of comparisonFields)for(const entry of alternative[field])assert.ok(table.includes(escapeHtml((entry.summary||entry.description)[lang])),`${tool.slug}: alternative ${field} content`);
        }
      }
    }
    const detailFields=['useCases','pricingDetails','limitations','selectionNotes'];
    const latestDate=[tool.verifiedAt,...detailFields.flatMap(field=>tool[field].map(entry=>entry.verifiedAt)),...alternatives.flatMap(alternative=>alternative?comparisonFields.flatMap(field=>alternative[field].map(entry=>entry.verifiedAt)):[])].sort().at(-1);
    assert.equal((html.match(/<time\b/g)||[]).length,1,`${tool.slug}: one verification date`);
    assert.ok(html.includes(`<time datetime="${latestDate}">${latestDate}</time>`),`${tool.slug}: latest verification`);
    if(tool.useCases.length)assert.ok(html.indexOf(`<h2>${original.ui.audience[lang]}</h2>`)<html.indexOf('id="useCases"'),`${tool.slug}: audience before use cases`);
    for(const field of ['useCases','pricingDetails','limitations'])for(const useCase of tool[field]){
      assert.ok(html.includes(escapeHtml(useCase.description[lang])),`${tool.slug}: ${lang} use case`);
      if(useCase.alternativeSlug)assert.ok(html.includes(`href="/${lang}/tools/${useCase.alternativeSlug}/"`),`${tool.slug}: alternative link`);
      for(const url of useCase.sourceUrls){
        const sourceId=`source-${tool.sources.findIndex(source=>source.url===url)+1}`;
        assert.ok(html.includes(`href="#${sourceId}"`),`${tool.slug}: source link`);
        assert.ok(html.includes(`<li id="${sourceId}">`),`${tool.slug}: source target`);
      }
    }
  }
  const data=clone();data.tools[0].useCases[0].description={en:'<script>unsafe</script>',zh:'<b>场景</b>'};
  for(const lang of ['en','zh']){
    const html=createRenderer(data).render(lang,'tool',data.tools[0].slug);
    assert.ok(html.includes(escapeHtml(data.tools[0].useCases[0].description[lang])));
    assert.ok(!html.includes(data.tools[0].useCases[0].description[lang]));
  }
});
test('search finds use-case-only phrases in either language without indexing source URLs',async()=>{
  const source=(await readFile(resolve(root,'src/app.mjs'),'utf8')).replace(/^import .*;\n/m,'');
  const data=clone(),tool=data.tools[0];
  tool.useCases[0].description={en:'Editorialhandoff workflow',zh:'季度场景复盘'};
  tool.useCases[0].sourceUrls=['https://example.com/evidenceonlytoken'];
  for(const lang of ['en','zh'])for(const query of ['Editorialhandoff','季度场景复盘','Editorialhandoff 季度场景复盘','evidenceonlytoken']){
    const results={},status={};
    const document={body:{dataset:{language:lang,page:'search'}},querySelectorAll:()=>[],querySelector:()=>({}),getElementById:id=>id==='search-results'?results:status};
    await runInNewContext(`(async()=>{${source}})()`,{document,location:{search:'?q='+encodeURIComponent(query)},URLSearchParams,fetch:async()=>({ok:true,json:async()=>data}),card,e:escapeHtml,icon,normalizeWebsite});
    if(query==='evidenceonlytoken')assert.ok(!results.innerHTML.includes(`/tools/${tool.slug}/`));
    else assert.ok(results.innerHTML.includes(`/${lang}/tools/${tool.slug}/`),`${lang}: ${query}`);
  }
});
test('escapes editorial content, discloses affiliate links and labels sponsorship',()=>{
  const data=clone();data.tools[0].name='<script>alert(1)</script>';data.tools[0].sponsored=true;assert.ok(createRenderer(data).render('en','tool',data.tools[0].slug).includes('rel="sponsored noopener noreferrer"'));data.site.affiliateLinks[data.tools[0].slug]='https://example.com/ref?x=1&y=2';
  const html=createRenderer(data).render('en','tool',data.tools[0].slug);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('rel="sponsored noopener noreferrer"'));
  assert.ok(html.includes('We may earn a commission'));
  assert.ok(html.includes('sponsor-badge'));
});
test('outbound links include UTM in both languages while preserving queries and fragments',()=>{
  const data=clone(),tool=data.tools[0],label=tool.sources[0].label;
  tool.website='https://example.com/?ref=partner%20name&token=a%2Fb%3D#pricing';
  tool.sources=[{label,url:'http://example.com/docs#section'},{label,url:'https://example.com/help?utm_source=partner#faq'}];
  for(const field of ['useCases','pricingDetails','limitations','selectionNotes'])for(const entry of tool[field])entry.sourceUrls=[tool.sources[0].url];
  data.site.partnerLinks=[
    {title:label,description:label,url:'https://example.com/partner'},
    {title:label,description:label,url:data.site.url+'/en/'}
  ];
  data.site.ads=[{enabled:true,afterCategory:data.categories[0].slug,type:'sponsored',title:label,description:label,cta:label,url:'https://example.com/ad?campaign=geo#offer'}];
  const {render}=createRenderer(data);
  for(const lang of ['en','zh']){
    const detail=render(lang,'tool',tool.slug),partners=render(lang,'page','partner-links');
    assert.ok(detail.includes('href="https://example.com/?ref=partner%20name&amp;token=a%2Fb%3D&amp;utm_source=ggeo.ai#pricing"'));
    assert.ok(detail.includes('href="http://example.com/docs?utm_source=ggeo.ai#section"'));
    assert.ok(detail.includes('href="https://example.com/help?utm_source=partner#faq"'));
    assert.ok(render(lang,'home').includes('href="https://example.com/ad?campaign=geo&amp;utm_source=ggeo.ai#offer"'));
    assert.ok(partners.includes('href="https://example.com/partner?utm_source=ggeo.ai"'));
    assert.ok(partners.includes(`href="${data.site.url}/en/"`));
    assert.ok(detail.includes(`rel="canonical" href="${data.site.url}/${lang}/tools/${tool.slug}/"`));
    assert.ok(render(lang,'page','contact').includes(`href="mailto:${data.site.contactEmail}"`));
    for(const html of [detail,partners,render(lang,'home')])assert.ok(!/href="\/[^\"]*utm_source/.test(html));
  }
  for(const [url,expected] of [
    ['https://example.com/ref?token=a%20b#start','https://example.com/ref?token=a%20b&amp;utm_source=ggeo.ai#start'],
    ['https://example.com/ref?utm_source=partner&ref=123#start','https://example.com/ref?utm_source=partner&amp;ref=123#start'],
    ['https://example.com/ref?utm_source=','https://example.com/ref?utm_source=']
  ]){
    data.site.affiliateLinks[tool.slug]=url;
    for(const lang of ['en','zh']){
      const html=createRenderer(data).render(lang,'tool',tool.slug);
      assert.ok(html.includes(`class="button visit-link" href="${expected}"`));
      assert.ok(html.includes('rel="sponsored noopener noreferrer"'));
    }
  }
});
async function htmlFiles(dir='') {
  let files=[];for(const entry of await readdir(resolve(root,'dist',dir),{withFileTypes:true})){
    const path=dir?dir+'/'+entry.name:entry.name;
    if(entry.isDirectory())files.push(...await htmlFiles(path));else if(path.endsWith('.html'))files.push(path);
  }return files;
}
test('every generated page has one H1, valid structured data, language metadata and working internal links',async()=>{
  const files=await htmlFiles();assert.equal(files.length,2*(1+original.categories.length+original.tools.filter(t=>t.status==='published').length+1+1+4)+2);
  for(const file of files){
    const html=await read(file);assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file);
    assert.equal((html.match(/src="\/assets\/analytics\.mjs"/g)||[]).length,1,file);
    for(const id of ['cookie-banner','cookie-dialog','cookie-settings','cookie-analytics'])assert.ok(html.includes(`id="${id}"`),file);
    assert.ok(!/id="cookie-analytics"[^>]*checked/.test(html),file);
    if(original.site.googleAnalyticsId)assert.ok(html.includes(`data-google-analytics-id="${original.site.googleAnalyticsId}"`),file);
    if(file.startsWith('en/')||file.startsWith('zh/')){
      assert.ok(html.includes(`lang="${file.startsWith('en/')?'en':'zh-CN'}"`),file);
      for(const tag of ['canonical','hreflang="en"','hreflang="zh-CN"','hreflang="x-default"'])assert.ok(html.includes(tag),file+': '+tag);
    }
    for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>JSON.parse(match[1]),file);
    for(const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:\?[^"#]*)?(?:#([^"#]+))?"/g)){
      const raw=match[1],hash=match[2];const target=raw.endsWith('/')?raw.slice(1)+'index.html':raw.slice(1);
      let content;try{content=await read(target||'index.html');}catch{assert.fail(`${file} has broken link: ${raw}`);}
      if(hash)assert.ok(content.includes(`id="${hash}"`),`${file}: missing anchor ${raw}#${hash}`);
    }
  }
});
test('directory pages do not advertise products for sale or unsupported reviews',async()=>{
  const allowedTypes=new Set(['WebSite','Organization','ItemList','ListItem','BreadcrumbList']);
  const check=(value,file)=>{
    if(!value||typeof value!=='object')return;
    for(const type of [value['@type']||[]].flat())assert.ok(allowedTypes.has(type),`${file}: unsupported schema type ${type}`);
    for(const key of ['offers','review','aggregateRating','shippingDetails','hasMerchantReturnPolicy'])assert.ok(!(key in value),`${file}: unsupported ${key}`);
    for(const child of Object.values(value))check(child,file);
  };
  for(const file of await htmlFiles()){
    const html=await read(file);
    assert.ok(!/\s(?:itemtype|typeof)=["'][^"']*(?:Product|Offer|Review|Rating)/i.test(html),file);
    for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))check(JSON.parse(match[1]),file);
  }
});
test('sitemap excludes search and all translated pages declare reciprocal alternates',async()=>{
  const sitemap=await read('sitemap.xml');assert.ok(!sitemap.includes('/search/'));
  for(const lang of ['en','zh'])assert.ok((await read(lang+'/search/index.html')).includes('noindex,follow'));
  for(const tool of original.tools.filter(t=>t.status==='published')){
    const en=await read(`en/tools/${tool.slug}/index.html`),zh=await read(`zh/tools/${tool.slug}/index.html`);
    assert.ok(en.includes(`hreflang="zh-CN" href="https://ggeo.ai/zh/tools/${tool.slug}/"`));
    assert.ok(zh.includes(`hreflang="en" href="https://ggeo.ai/en/tools/${tool.slug}/"`));
  }
});
test('static server returns real 404s, correct MIME types and redirects without losing queries',async()=>{
  let stderr='';
  const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'4329'},stdio:['ignore','pipe','pipe']});
  server.stderr.on('data',chunk=>stderr+=chunk);
  try{
    await Promise.race([once(server,'exit').then(()=>{throw new Error(stderr||'Server exited before ready');}),once(server.stdout,'data'),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('Server timeout')),5000);timer.unref();})]);
    const missing=await fetch('http://127.0.0.1:4329/not-a-page/');assert.equal(missing.status,404);assert.ok((await missing.text()).includes('404'));
    const redirect=await fetch('http://127.0.0.1:4329/en/search?q=hello',{redirect:'manual'});assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'/en/search/?q=hello');
    const rootRedirect=await fetch('http://127.0.0.1:4329/?q=test',{redirect:'manual'});assert.equal(rootRedirect.status,302);assert.equal(rootRedirect.headers.get('location'),'/en/?q=test');
    const js=await fetch('http://127.0.0.1:4329/assets/app.mjs');assert.equal(js.status,200);assert.match(js.headers.get('content-type'),/javascript/);
    const json=await (await fetch('http://127.0.0.1:4329/assets/directory.json')).json();assert.equal(json.tools.length,original.tools.filter(t=>t.status==='published').length);
  }finally{server.kill();}
});
