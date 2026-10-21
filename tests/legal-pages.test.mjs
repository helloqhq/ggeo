import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readData,validateData} from '../scripts/validate-data.mjs';
import {createRenderer} from '../src/templates.mjs';

const original=await readData();
// User-requested legal revision baseline, 2026-10-21. Routine data updates must
// preserve these fingerprints. Change only for an explicitly requested legal revision.
const fingerprints={
  'privacy-policy':'22f53751dab9aa23caeb10c4b11575f1a4331ded43c7a9f1f11c966d1faff839',
  disclaimer:'c9d624e079a5b3c9fb127acbb574b20e1100ba049bdc7ac6e17729996059d962'
};

test('legal text, translations, references and version dates remain frozen',()=>{
  for(const [slug,fingerprint] of Object.entries(fingerprints)){
    const actual=createHash('sha256').update(JSON.stringify(original.pages[slug])).digest('hex');
    assert.equal(actual,fingerprint,`${slug}: legal content changed; routine data updates must not reset the fingerprint`);
  }
});

test('directory updates leave both languages of legal articles unchanged',()=>{
  const changed=structuredClone(original);
  changed.site.updatedAt='2030-01-01';
  changed.tools[0].verifiedAt='2030-01-01';
  changed.tools[0].description.en+=' Updated directory description.';
  changed.tools[0].featuredOrder+=100;
  changed.categories[0].description.zh+=' 目录介绍更新。';
  const before=createRenderer(original),after=createRenderer(changed);
  for(const slug of Object.keys(fingerprints))for(const lang of ['en','zh']){
    const article=html=>html.match(/<article class="prose">[\s\S]*?<\/article>/)?.[0];
    const previous=article(before.render(lang,'page',slug));
    assert.ok(previous);
    assert.equal(article(after.render(lang,'page',slug)),previous,`${lang}/${slug}`);
    assert.ok(previous.includes(`<time datetime="${original.pages[slug].updatedAt}">`));
    for(const source of original.pages[slug].sources||[]){
      assert.ok(previous.includes(`href="${source.url}"`));
      assert.ok(previous.includes(source.label[lang]));
    }
  }
});

test('legal pages require their own valid dates and valid bilingual references',()=>{
  for(const mutate of [
    d=>delete d.pages['privacy-policy'].updatedAt,
    d=>d.pages.disclaimer.updatedAt='2026-02-30',
    d=>d.pages['privacy-policy'].sources[0].url='javascript:alert(1)',
    d=>delete d.pages['privacy-policy'].sources[0].label.zh,
    d=>d.pages['privacy-policy'].sources={}
  ]){
    const data=structuredClone(original);mutate(data);
    assert.throws(()=>validateData(data),/pages\./);
  }
});
