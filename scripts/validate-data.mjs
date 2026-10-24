import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {normalizeWebsite} from '../src/components.mjs';
export const root=fileURLToPath(new URL('../',import.meta.url));
export async function readData() {
  const names=['site','categories','tools','ui','pages'];
  return Object.fromEntries(await Promise.all(names.map(async name=>[name,JSON.parse(await readFile(resolve(root,'data',name+'.json'),'utf8'))])));
}
export function validateData(data) {
  const errors=[], fail=message=>errors.push(message);
  const nonempty=v=>typeof v==='string'&&v.trim().length>0;
  const localized=(v,label,array=false)=>{
    for(const lang of ['en','zh'])if(array?(!Array.isArray(v?.[lang])||!v[lang].length||!v[lang].every(nonempty)):!nonempty(v?.[lang]))fail(`${label}.${lang}: required ${array?'nonempty string array':'text'}`);
  };
  const url=(v,label)=>{try {const u=new URL(v);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||!u.hostname.includes('.'))throw new Error();}catch{fail(`${label}: expected public HTTP(S) URL`);}};
  const slug=v=>typeof v==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
  const date=(value,label)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)fail(`${label}: invalid date`);};
  const {site,categories,tools,ui,pages}=data;
  if(!site||!Array.isArray(categories)||!Array.isArray(tools)||!ui||!pages)throw new Error('Expected site, categories, tools, ui and pages');
  url(site.url,'site.url');if(site.url.endsWith('/'))fail('site.url: omit trailing slash');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail))fail('site.contactEmail: invalid email');
  date(site.updatedAt,'site.updatedAt');
  if(site.googleAnalyticsId&&!/^G-[A-Z0-9]+$/.test(site.googleAnalyticsId))fail('site.googleAnalyticsId: expected GA4 measurement ID');
  const expected=['ai-visibility','citations','prompts','competitors','geo-audit','content-geo','ai-traffic','local-geo'];
  if(categories.map(c=>c.slug).join()!==expected.join())fail('categories: preserve the eight canonical slugs and order');
  for(const c of categories){for(const field of ['name','description','guide'])localized(c[field],`category ${c.slug}.${field}`);if(!['chart','link','message','users','shield','document','activity','pin'].includes(c.icon))fail(`category ${c.slug}: unsupported icon`);}
  const slugs=new Set(),websites=new Set();
  for(const tool of tools){
    const label=`tool ${tool.slug}`;
    if(!slug(tool.slug)||slugs.has(tool.slug))fail(`${label}: invalid or duplicate slug`);slugs.add(tool.slug);
    if(!nonempty(tool.name))fail(`${label}: name required`);
    if(!expected.includes(tool.category))fail(`${label}: unknown primary category`);
    if(!['draft','published','hidden'].includes(tool.status))fail(`${label}: unknown status`);
    url(tool.website,`${label}.website`);
    try {const key=normalizeWebsite(tool.website);if(websites.has(key))fail(`${label}: duplicate website`);websites.add(key);}catch{}
    if(!['Free','Freemium','Paid','Contact Sales','Unknown'].includes(tool.pricing))fail(`${label}: invalid pricing model`);
    if(typeof tool.sponsored!=='boolean')fail(`${label}: sponsored must be boolean`);
    if(!Number.isFinite(tool.featuredOrder))fail(`${label}: featuredOrder must be a number`);
    if(tool.logo!==null&&(!/^\/images\/[a-zA-Z0-9_./-]+$/.test(tool.logo)||tool.logo.includes('..')))fail(`${label}: logo must be null or a local /images/ path`);
    if(!Array.isArray(tool.platforms)||!tool.platforms.every(nonempty))fail(`${label}: platforms must be an array of verified names`);
    for(const lang of ['en','zh'])if(tool.tags?.[lang]?.length>3)fail(`${label}: at most three display tags per language`);
    if(tool.status==='published') {
      for(const field of ['description','audience'])localized(tool[field],`${label}.${field}`);
      for(const field of ['tags','features'])localized(tool[field],`${label}.${field}`,true);
      for(const field of ['useCases','pricingDetails','limitations','selectionNotes'])if(!Array.isArray(tool[field]))fail(`${label}.${field}: required array; use [] when unverified`);
      date(tool.verifiedAt,`${label}.verifiedAt`);
      if(tool.verifiedAt>site.updatedAt)fail(`${label}: verifiedAt cannot exceed site.updatedAt`);
      if(!Array.isArray(tool.sources)||!tool.sources.length)fail(`${label}: published tools require sources`);
    }
    for(const source of tool.sources||[]){url(source.url,`${label}.source`);localized(source.label,`${label}.source.label`);}
    for(const field of ['useCases','pricingDetails','limitations','selectionNotes']){
      if(tool[field]!==undefined&&!Array.isArray(tool[field]))fail(`${label}.${field}: expected array`);
      for(const [i,entry] of (Array.isArray(tool[field])?tool[field]:[]).entries()){
        const entryLabel=`${label}.${field}[${i}]`;
        localized(entry?.description,`${entryLabel}.description`);
        if(entry?.summary!==undefined)localized(entry.summary,`${entryLabel}.summary`);
        date(entry?.verifiedAt,`${entryLabel}.verifiedAt`);
        if(entry?.verifiedAt>site.updatedAt)fail(`${entryLabel}.verifiedAt: cannot exceed site.updatedAt`);
        if(entry?.alternativeSlug!==undefined&&(field!=='selectionNotes'||entry.alternativeSlug===tool.slug||!tools.some(other=>other.slug===entry.alternativeSlug)))fail(`${entryLabel}.alternativeSlug: expected another known tool in selectionNotes`);
        if(!Array.isArray(entry?.sourceUrls)||!entry.sourceUrls.length)fail(`${entryLabel}.sourceUrls: required nonempty array`);
        else {
          if(new Set(entry.sourceUrls).size!==entry.sourceUrls.length)fail(`${entryLabel}.sourceUrls: duplicate source`);
          for(const sourceUrl of entry.sourceUrls)if(!tool.sources?.some(source=>source.url===sourceUrl))fail(`${entryLabel}.sourceUrls: must reference this tool's sources`);
        }
      }
    }
  }
  for(const [key,value] of Object.entries(ui))localized(value,`ui.${key}`);
  const referencedKeys=['allTools','submit','search','heroTitle','searchResults','noResults','prepared','downloaded','duplicate','invalidUrl','priceFree','priceFreemium','pricePaid','priceContact Sales','priceUnknown','legalUpdatedAt','legalReferences','useCases','useCaseSource','pricingDetails','limitations','selectionNotes','comparisonSubject','comparisonPricing','comparisonUseCases','comparisonLimits','comparisonUnavailable','comparisonScroll'];
  for(const key of referencedKeys)if(!ui[key])fail(`ui.${key}: missing`);
  for(const key of ['privacy-policy','disclaimer']){
    const page=pages[key];
    localized(page?.title,`pages.${key}.title`);localized(page?.intro,`pages.${key}.intro`);
    date(page?.updatedAt,`pages.${key}.updatedAt`);
    if(!page?.sections?.length)fail(`pages.${key}: sections required`);
    for(const section of page?.sections||[]){localized(section.title,`pages.${key}.section.title`);localized(section.body,`pages.${key}.section.body`);}
    if(page?.sources!==undefined&&!Array.isArray(page.sources))fail(`pages.${key}.sources: expected array`);
    for(const source of Array.isArray(page?.sources)?page.sources:[]){url(source.url,`pages.${key}.source`);localized(source.label,`pages.${key}.source.label`);}
  }
  if(!site.affiliateLinks||typeof site.affiliateLinks!=='object'||Array.isArray(site.affiliateLinks))fail('site.affiliateLinks: expected object');
  for(const [key,value] of Object.entries(site.affiliateLinks||{})){if(!tools.some(t=>t.slug===key&&t.status==='published'))fail(`affiliate ${key}: unknown published tool`);url(value,`affiliate ${key}`);}
  if(!Array.isArray(site.ads)||!Array.isArray(site.partnerLinks))fail('site.ads and site.partnerLinks: arrays required');
  for(const ad of site.ads||[]){if(typeof ad.enabled!=='boolean')fail('ad.enabled: boolean required');if(!expected.includes(ad.afterCategory))fail('ad.afterCategory: unknown category');if(!['advertisement','sponsored'].includes(ad.type))fail('ad.type: expected advertisement or sponsored');url(ad.url,'ad.url');for(const f of ['title','description','cta'])localized(ad[f],`ad.${f}`);}
  for(const partner of site.partnerLinks||[]){url(partner.url,'partner.url');for(const f of ['title','description'])localized(partner[f],`partner.${f}`);}
  if(errors.length)throw new Error('Content validation failed:\n- '+errors.join('\n- '));
  return {tools:tools.filter(t=>t.status==='published').length,categories:categories.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {console.log('Data valid:',validateData(await readData()));}catch(error){console.error(error.message);process.exitCode=1;}
}
