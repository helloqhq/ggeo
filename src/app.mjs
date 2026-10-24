import {card, escapeHtml as e, icon, normalizeWebsite} from './components.mjs';
const lang=document.body.dataset.language;
const page=document.body.dataset.page;
let dataPromise;
const loadData=()=>dataPromise??=fetch('/assets/directory.json').then(r=>{if(!r.ok)throw new Error('Directory unavailable');return r.json();});
const languageLinks=document.querySelectorAll('.language-switch a');
if(page==='search') languageLinks.forEach(a=>a.href+=location.search);
if(page==='home') {
  const links=[...document.querySelectorAll('[data-category]')];
  const setActive=slug=>links.forEach(a=>{const active=a.dataset.category===slug;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  const sections=[...document.querySelectorAll('.category-section')];
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible.length)setActive(visible[0].target.id);},{rootMargin:'-80px 0px -55% 0px',threshold:0});
  sections.forEach(s=>observer.observe(s));
  links.forEach(a=>a.addEventListener('click',()=>setActive(a.dataset.category)));
}
if(page==='search') {
  const query=(new URLSearchParams(location.search).get('q')||'').trim().slice(0,160);
  const input=document.querySelector('[name="q"]');input.value=query;
  const results=document.getElementById('search-results'), status=document.getElementById('search-status');
  const empty=(heading,text)=>`<div class="empty-state">${icon('search')}<h2>${e(heading)}</h2><p>${e(text)}</p></div>`;
  try {
    const data=await loadData(), t=key=>data.ui[key][lang];
    if(!query) results.innerHTML=empty(t('emptySearch'),t('emptySearchHint'));
    else {
      const terms=query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
      const matches=data.tools.filter(tool=>{
        const c=data.categories.find(c=>c.slug===tool.category);
        const haystack=[tool.name,tool.description.en,tool.description.zh,...tool.tags.en,...tool.tags.zh,...tool.features.en,...tool.features.zh,...['useCases','pricingDetails','limitations','selectionNotes'].flatMap(field=>tool[field].flatMap(entry=>[entry.description.en,entry.description.zh])),c.name.en,c.name.zh,...tool.platforms].join(' ').toLocaleLowerCase();
        return terms.every(term=>haystack.includes(term));
      });
      document.title=`${t('resultsFor')} “${query}” | ggeo.ai`;
      status.textContent=`${matches.length} ${t('tools')} · ${t('resultsFor')} “${query}”`;
      results.innerHTML=matches.length?`<div class="tool-grid">${matches.map(tool=>card(tool,lang,data.ui,data.categories.find(c=>c.slug===tool.category).name[lang])).join('')}</div>`:empty(t('noResults'),t('noResultsHint'));
    }
  } catch {status.textContent=lang==='en'?'Search could not load. Please try again or browse the categories.':'搜索未能加载，请重试或通过分类浏览。';}
}
if(page==='submit') {
  const form=document.getElementById('submit-form'),status=document.getElementById('submission-status');
  form.querySelectorAll('button').forEach(button=>button.disabled=false);
  const fallback=lang==='en'?'Could not check the directory. Try again, or email us directly.':'无法检查目录，请重试或直接通过邮件联系。';
  async function prepare() {
    status.textContent='';
    if(!form.reportValidity()) return null;
    const values=Object.fromEntries(new FormData(form));
    if(values.fax)return null;
    if(!values.name.trim()||values.description.trim().length<20){form.querySelector(!values.name.trim()?'[name="name"]':'[name="description"]').focus();status.textContent=lang==='en'?'Enter a tool name and at least 20 characters of description.':'请填写工具名称及至少 20 字的介绍。';return null;}
    const data=await loadData(), t=key=>data.ui[key][lang];
    let url;
    try {url=new URL(values.website);if(!['http:','https:'].includes(url.protocol)||url.username||url.password||!url.hostname.includes('.')||/^(localhost|127\.|0\.|192\.168\.|10\.)/.test(url.hostname))throw new Error();}
    catch {status.textContent=t('invalidUrl');return null;}
    const duplicate=data.tools.some(tool=>normalizeWebsite(tool.website)===normalizeWebsite(url.href));
    if(duplicate){status.textContent=t('duplicate');return null;}
    return {data,t,submission:{name:values.name.trim(),website:url.href,category:values.category,description:values.description.trim(),submitterEmail:values.email.trim(),status:'pending',submittedAt:new Date().toISOString()}};
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    try {const ready=await prepare();if(!ready)return;const {data,t,submission}=ready;
      const subject=`ggeo.ai tool submission: ${submission.name}`;
      const body=`Tool submission for editorial review\n\n${JSON.stringify(submission,null,2)}\n\nThis submission is pending review and is not a published listing.`;
      const mailto=`mailto:${data.site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent=t('prepared');
      const a=document.createElement('a');a.href=mailto;a.click();
    } catch {status.textContent=fallback;}
  });
  document.getElementById('download-submission').addEventListener('click',async()=>{
    try {const ready=await prepare();if(!ready)return;const {t,submission}=ready;
      const blob=new Blob([JSON.stringify(submission,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download='ggeo-tool-submission.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent=t('downloaded');
    } catch {status.textContent=fallback;}
  });
}
