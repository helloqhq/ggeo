const tag=document.querySelector('script[data-google-analytics-id]');
const measurementId=tag?.dataset.googleAnalyticsId;
// Keep local previews and the root redirect out of production reports.
if(measurementId&&location.hostname===tag.dataset.siteHostname&&location.pathname!=='/') {
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('consent','default',{
    ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'
  });
  window.gtag('js',new Date());
  window.gtag('config',measurementId,{
    allow_google_signals:false,
    allow_ad_personalization_signals:false
  });
  const script=document.createElement('script');
  script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);
}
