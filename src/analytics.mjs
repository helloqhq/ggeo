import {initCookieConsent,clearAnalyticsCookies} from './cookie-consent.mjs';

const tag=document.querySelector('script[data-google-analytics-id]');
const measurementId=tag?.dataset.googleAnalyticsId;
const production=measurementId&&location.hostname===tag.dataset.siteHostname&&location.pathname!=='/';
let loaded=false;

initCookieConsent(analytics=>{
  if(!analytics) {
    if(measurementId)window[`ga-disable-${measurementId}`]=true;
    clearAnalyticsCookies();
    // Discard the loaded tag and its listeners after withdrawal, including in other tabs.
    if(loaded)location.reload();
    return;
  }
  if(!production||loaded)return;
  loaded=true;
  window[`ga-disable-${measurementId}`]=false;
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{
    analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'
  });
  window.gtag('consent','update',{analytics_storage:'granted'});
  window.gtag('js',new Date());
  window.gtag('config',measurementId,{
    allow_google_signals:false,
    allow_ad_personalization_signals:false
  });
  const script=document.createElement('script');
  script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);
});
