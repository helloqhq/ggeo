import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=(await readFile(new URL('../src/cookie-consent.mjs',import.meta.url),'utf8')).replace(/^export /gm,'');
function setup({stored=null,blocked=false}={}) {
  let now=1000000,value=stored,timer;const states=[],events={},deletions=[];
  const element=(dataset={})=>({hidden:true,checked:false,open:false,dataset,listeners:{},addEventListener(name,callback){this.listeners[name]=callback;},contains(node){return node===this;},focus(){document.activeElement=this;},showModal(){this.open=true;},close(){this.open=false;},getBoundingClientRect(){return {height:100};}});
  const banner=element(),dialog=element(),opener=element({cookieAction:'settings'}),analytics=element(),main=element(),status=element({saved:'saved',session:'session only'});
  const buttons=['settings','accept','reject','save','close'].map(action=>element({cookieAction:action}));
  const nodes={'#cookie-banner':banner,'#cookie-dialog':dialog,'#cookie-settings':opener,'#cookie-analytics':analytics,'#main':main,'#cookie-status':status};
  const document={activeElement:main,visibilityState:'visible',documentElement:{style:{setProperty(){}}},querySelector:selector=>nodes[selector],querySelectorAll:()=>[...buttons,opener],addEventListener:(name,callback)=>events[name]=callback};
  Object.defineProperty(document,'cookie',{get:()=> '_ga=one; _ga_TEST=two; _gid=three; _gat_tracker=four; unrelated=keep',set:text=>deletions.push(text)});
  const api=runInNewContext(source+'\n({readCookiePreference,initCookieConsent,clearAnalyticsCookies,preferenceKey,preferenceLifetime})',{
    document,location:{hostname:'ggeo.ai',pathname:'/zh/tools/test/'},
    localStorage:{getItem(){if(blocked)throw Error('blocked');return value;},setItem(key,text){if(blocked)throw Error('blocked');value=text;}},
    Date:{now:()=>now},setTimeout:callback=>{timer=callback;return 1;},clearTimeout(){},
    window:{addEventListener:(name,callback)=>events[name]=callback},ResizeObserver:class{observe(){}}
  });
  return {...api,banner,dialog,analytics,status,states,deletions,init:()=>api.initCookieConsent(state=>states.push(state)),click:action=>buttons.find(button=>button.dataset.cookieAction===action).listeners.click(),get value(){return JSON.parse(value);},setStored:text=>value=text,advance:ms=>now+=ms,expire:()=>timer(),dispatch:(name,event)=>events[name](event)};
}

test('missing, invalid, unsupported, expired and unavailable storage never grants consent',()=>{
  for(const stored of [null,'broken','null','{}',JSON.stringify({version:2,analytics:true,expiresAt:2000000}),JSON.stringify({version:1,analytics:'true',expiresAt:2000000}),JSON.stringify({version:1,analytics:true,expiresAt:999999}),JSON.stringify({version:1,analytics:true,expiresAt:1e15})])assert.equal(setup({stored}).readCookiePreference(),null);
  assert.equal(setup({blocked:true}).readCookiePreference(),null);
});

test('custom choices are not preselected, closing does not save, and rejection lasts 180 days',()=>{
  const ui=setup();ui.init();assert.equal(ui.banner.hidden,false);assert.deepEqual(ui.states,[false]);
  ui.click('settings');assert.equal(ui.dialog.open,true);assert.equal(ui.analytics.checked,false);
  ui.analytics.checked=true;ui.click('close');assert.equal(ui.value,null);assert.deepEqual(ui.states,[false]);
  ui.click('settings');assert.equal(ui.analytics.checked,false);
  ui.click('reject');assert.equal(ui.dialog.open,false);assert.equal(ui.banner.hidden,true);
  assert.equal(ui.value.analytics,false);assert.equal(ui.value.expiresAt,1000000+ui.preferenceLifetime);
  ui.click('settings');assert.equal(ui.analytics.checked,false);
});

test('acceptance, customization, expiry and cross-tab revocation apply immediately',()=>{
  const ui=setup();ui.init();ui.click('accept');assert.equal(ui.value.analytics,true);assert.equal(ui.states.at(-1),true);
  ui.click('settings');assert.equal(ui.analytics.checked,true);ui.analytics.checked=false;ui.click('save');assert.equal(ui.states.at(-1),false);
  ui.click('accept');ui.advance(ui.preferenceLifetime+1);ui.expire();assert.equal(ui.states.at(-1),false);assert.equal(ui.banner.hidden,false);
  ui.click('accept');ui.setStored(null);ui.dispatch('storage',{key:ui.preferenceKey});assert.equal(ui.states.at(-1),false);assert.equal(ui.banner.hidden,false);
});

test('a stored preference is shared across pages; blocked storage uses page-only memory with a visible notice',()=>{
  const ui=setup();ui.init();ui.click('accept');
  const next=setup({stored:JSON.stringify(ui.value)});next.init();assert.equal(next.banner.hidden,true);assert.deepEqual(next.states,[true]);
  const blocked=setup({blocked:true});blocked.init();blocked.click('accept');assert.equal(blocked.states.at(-1),true);assert.equal(blocked.status.className,'cookie-storage-notice');
  blocked.dispatch('visibilitychange');assert.equal(blocked.states.at(-1),true);
});

test('cleanup only targets GA cookies and covers host, parent domain and visible path scopes',()=>{
  const ui=setup();ui.clearAnalyticsCookies();assert.ok(ui.deletions.length>0);
  assert.ok(ui.deletions.every(cookie=>!cookie.startsWith('unrelated=')));
  assert.ok(ui.deletions.some(cookie=>cookie.includes('Domain=ggeo.ai')));
  assert.ok(ui.deletions.some(cookie=>cookie.includes('Path=/zh/tools/test/')));
  for(const name of ['_ga','_ga_TEST','_gid','_gat_tracker'])assert.ok(ui.deletions.some(cookie=>cookie.startsWith(name+'=;')));
});
