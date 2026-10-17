export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const normalizeWebsite = value => {
  const url = new URL(value);
  return url.hostname.toLowerCase().replace(/^www\./, '') + url.pathname.replace(/\/+$/, '');
};
const shapes = {
  chart:'<path d="M4 19V13m5 6V9m6 10V5m5 14V2"/>',
  link:'<path d="m10 13 4-4m-6 7-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 1 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 1)"/>',
  message:'<path d="M21 11a8 8 0 0 1-8 8H6l-4 3 1-7a8 8 0 1 1 18-4Z"/><path d="M7 9h8m-8 4h5"/>',
  users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 6"/>',
  shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  document:'<path d="M14 2H5v20h14V7Z"/><path d="M14 2v6h5M8 12h8m-8 4h6"/>',
  activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  external:'<path d="M14 3h7v7m0-7L10 14m8 0v7H3V6h7"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
};
export const icon = (name, cls='') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.globe}</svg>`;
export const initial = tool => tool.name.replace(/[^\p{L}\p{N}]/gu,'').slice(0,2).toUpperCase();
export function logo(tool, large=false) {
  return tool.logo ? `<img class="tool-logo${large?' large':''}" src="${escapeHtml(tool.logo)}" alt="" width="${large?76:48}" height="${large?76:48}" loading="lazy">` : `<span class="tool-logo monogram${large?' large':''}" aria-hidden="true">${escapeHtml(initial(tool))}</span>`;
}
export function card(tool, lang, ui, categoryName='') {
  const t = key => ui[key][lang];
  return `<article class="tool-card">${categoryName?`<p class="card-category">${escapeHtml(categoryName)}</p>`:''}<div class="card-main">${logo(tool)}<div class="card-copy"><h3><a href="/${lang}/tools/${tool.slug}/">${escapeHtml(tool.name)}</a></h3><p>${escapeHtml(tool.description[lang])}</p><div class="tags">${tool.tags[lang].slice(0,3).map(tag=>`<span>${escapeHtml(tag)}</span>`).join('')}</div></div></div><div class="card-bottom"><span class="price ${tool.pricing==='Free'?'free':''}">${escapeHtml(t('price'+tool.pricing))}</span>${tool.sponsored?`<span class="sponsor-badge">${t('sponsored')}</span>`:''}<a class="details-link" href="/${lang}/tools/${tool.slug}/" aria-label="${escapeHtml(t('details')+' — '+tool.name)}">${t('details')} ${icon('arrow')}</a></div></article>`;
}
