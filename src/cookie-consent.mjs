export const preferenceKey='ggeo-cookie-preferences';
export const preferenceLifetime=180*24*60*60*1000;

export function readCookiePreference() {
  try {
    const value=JSON.parse(localStorage.getItem(preferenceKey)),now=Date.now();
    if(value?.version===1&&typeof value.analytics==='boolean'&&Number.isFinite(value.expiresAt)&&value.expiresAt>now&&value.expiresAt<=now+preferenceLifetime)return value;
  } catch { /* Unavailable or invalid storage never grants consent. */ }
  return null;
}

export function clearAnalyticsCookies() {
  // GA first-party cookies may have been set on the host or a parent domain.
  const domains=location.hostname.split('.').map((_,i,parts)=>parts.slice(i).join('.'));
  const paths=['/',...location.pathname.split('/').filter(Boolean).map((_,i,parts)=>'/'+parts.slice(0,i+1).join('/'))];
  for(const cookie of document.cookie.split(';')) {
    const name=cookie.split('=')[0].trim();
    if(!/^(_ga(?:_|$)|_gid$|_gat(?:_|$))/.test(name))continue;
    for(const path of new Set(paths.flatMap(path=>[path,path.endsWith('/')?path:path+'/']))) {
      const expired=`${name}=; Max-Age=0; Path=${path}; SameSite=Lax`;
      document.cookie=expired;
      for(const domain of domains)document.cookie=`${expired}; Domain=${domain}`;
    }
  }
}

export function initCookieConsent(onChange) {
  if(location.pathname==='/')return;
  const banner=document.querySelector('#cookie-banner'),dialog=document.querySelector('#cookie-dialog');
  const opener=document.querySelector('#cookie-settings'),analytics=document.querySelector('#cookie-analytics');
  if(!banner||!dialog||!opener||!analytics)return;
  let preference=readCookiePreference(),expiryTimer,memoryOnly=false;
  const update=()=>{
    banner.hidden=Boolean(preference);
    analytics.checked=preference?.analytics===true;
    onChange(preference?.analytics===true);
    clearTimeout(expiryTimer);
    if(preference)expiryTimer=setTimeout(refresh,Math.min(preference.expiresAt-Date.now(),2147483647));
  };
  function refresh() {
    if(!memoryOnly||preference?.expiresAt<=Date.now())preference=readCookiePreference();
    update();
  }
  function save(allowed) {
    preference={version:1,analytics:allowed,expiresAt:Date.now()+preferenceLifetime};
    let persisted=true;
    try {localStorage.setItem(preferenceKey,JSON.stringify(preference));}catch{persisted=false;}
    memoryOnly=!persisted;
    const fromBanner=banner.contains(document.activeElement)||(dialog.open&&!banner.hidden);
    if(dialog.open)dialog.close();
    const status=document.querySelector('#cookie-status');
    status.textContent=status.dataset[persisted?'saved':'session'];
    status.className=persisted?'sr-only':'cookie-storage-notice';
    update();
    if(fromBanner)document.querySelector('#main').focus({preventScroll:true});
  }
  opener.hidden=false;
  for(const button of document.querySelectorAll('[data-cookie-action]'))button.addEventListener('click',()=>{
    const action=button.dataset.cookieAction;
    if(action==='settings'){
      analytics.checked=preference?.analytics===true;
      dialog.showModal();
    }else if(action==='close')dialog.close();
    else save(action==='accept'||(action==='save'&&analytics.checked));
  });
  window.addEventListener('storage',event=>{if(event.key===preferenceKey||event.key===null){memoryOnly=false;refresh();}});
  window.addEventListener('pageshow',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
  // Keep the final content and footer reachable beneath the fixed notice.
  const observer=new ResizeObserver(()=>document.documentElement.style.setProperty('--cookie-banner-space',`${banner.hidden?0:banner.getBoundingClientRect().height+16}px`));
  observer.observe(banner);
  update();
}
