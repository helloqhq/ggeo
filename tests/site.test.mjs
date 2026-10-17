import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {once} from 'node:events';
import {runInNewContext} from 'node:vm';
import {readData,validateData,root} from '../scripts/validate-data.mjs';
import {createRenderer} from '../src/templates.mjs';
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
test('escapes editorial content, discloses affiliate links and labels sponsorship',()=>{
  const data=clone();data.tools[0].name='<script>alert(1)</script>';data.tools[0].sponsored=true;assert.ok(createRenderer(data).render('en','tool',data.tools[0].slug).includes('rel="sponsored noopener noreferrer"'));data.site.affiliateLinks[data.tools[0].slug]='https://example.com/ref?x=1&y=2';
  const html=createRenderer(data).render('en','tool',data.tools[0].slug);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('rel="sponsored noopener noreferrer"'));
  assert.ok(html.includes('We may earn a commission'));
  assert.ok(html.includes('sponsor-badge'));
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
