import {mkdir,writeFile,rm,cp,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {readData,validateData,root} from './validate-data.mjs';
import {createRenderer} from '../src/templates.mjs';
import {escapeHtml as e} from '../src/components.mjs';
export async function build() {
  const data=await readData(),summary=validateData(data),{render,published}=createRenderer(data);
  for(const tool of published)if(tool.logo)await access(resolve(root,'public',tool.logo.slice(1)));
  const out=resolve(root,'dist'),stage=resolve(root,'.dist-building');
  await rm(stage,{recursive:true,force:true});await mkdir(resolve(stage,'assets'),{recursive:true});
  await cp(resolve(root,'public'),stage,{recursive:true});
  for(const name of ['styles.css','app.mjs','components.mjs'])await cp(resolve(root,'src',name),resolve(stage,'assets',name));
  await writeFile(resolve(stage,'assets/directory.json'),JSON.stringify({site:{contactEmail:data.site.contactEmail},tools:published,categories:data.categories,ui:data.ui}));
  let count=0;const urls=[];
  const emit=async(path,html,index=true)=>{const target=resolve(stage,path,'index.html');await mkdir(resolve(stage,path),{recursive:true});await writeFile(target,html);count++;if(index)urls.push('/'+path+'/');};
  for(const lang of ['en','zh']) {
    await emit(lang,render(lang,'home'));
    for(const c of data.categories)await emit(`${lang}/category/${c.slug}`,render(lang,'category',c.slug),published.some(t=>t.category===c.slug));
    for(const tool of published)await emit(`${lang}/tools/${tool.slug}`,render(lang,'tool',tool.slug));
    await emit(`${lang}/search`,render(lang,'search'),false);
    await emit(`${lang}/submit`,render(lang,'submit'));
    for(const slug of ['privacy-policy','disclaimer','contact','partner-links'])await emit(`${lang}/${slug}`,render(lang,'page',slug));
  }
  await writeFile(resolve(stage,'404.html'),render('en','404'));
  await writeFile(resolve(stage,'index.html'),render('en','home').replace('<head>','<head><meta http-equiv="refresh" content="0;url=/en/">'));
  const xml=urls.map(path=>`  <url><loc>${e(data.site.url+path)}</loc><lastmod>${data.site.updatedAt}</lastmod><xhtml:link rel="alternate" hreflang="en" href="${e(data.site.url+path.replace('/zh/','/en/'))}"/><xhtml:link rel="alternate" hreflang="zh-CN" href="${e(data.site.url+path.replace('/en/','/zh/'))}"/><xhtml:link rel="alternate" hreflang="x-default" href="${e(data.site.url+path.replace('/zh/','/en/'))}"/></url>`).join('\n');
  await writeFile(resolve(stage,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${xml}\n</urlset>\n`);
  await writeFile(resolve(stage,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${data.site.url}/sitemap.xml\n`);
  await rm(out,{recursive:true,force:true});await cp(stage,out,{recursive:true});await rm(stage,{recursive:true,force:true});
  console.log(`Built ${count+2} HTML pages; ${summary.tools} published tools; ${summary.categories} categories. Output: dist/`);
}
await build();
