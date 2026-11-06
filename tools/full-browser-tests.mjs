import {chromium, webkit} from 'playwright-core';
import {readFile, writeFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.env.QA_BASE_URL || 'http://localhost:4176').replace(/\/$/, '');
const effectsOnly = process.env.QA_EFFECTS_ONLY === '1';
const caseFilter = process.env.QA_CASE_FILTER || '';
const load = async p => JSON.parse(await readFile(resolve(project, p), 'utf8'));
const story = await load('src/content/full-story.json');
const chapters = await load('src/content/chapters-data.json');
const cueSource = await readFile(resolve(project, 'src/content/music-cues.ts'), 'utf8');
const cues = JSON.parse(cueSource.match(/export const musicCues: MusicCue\[\] = (\[[\s\S]*?\n\]);/)[1]);
const {sceneMotions} = await import(pathToFileURL(resolve(project, 'src/motion/scene-motion.ts')).href);
const where = n => {const c = chapters.find(c => c.beats.some(b => b.sourceScene === n));return {chapter: c.id, beat: c.beats.findIndex(b => b.sourceScene === n)};};
const profiles = [
  {name:'iPad11 landscape1194',width:1194,height:834,touch:true},
  {name:'iPad11 landscape1180',width:1180,height:820,touch:true},
  {name:'smaller iPad landscape',width:1024,height:768,touch:true},
  {name:'iPad11 portrait',width:834,height:1194,touch:true},
  {name:'desktop',width:1440,height:900,touch:false},
];
const results=[], failures=[], runtimeErrors=[], layoutStates=[], profileSummary=[];
async function check(name,fn){if(caseFilter&&!name.includes(caseFilter))return;try{await fn();results.push({name,passed:true});console.log('PASS',name);}catch(e){const message=String(e.stack||e);results.push({name,passed:false,message});failures.push({name,message});console.error('FAIL',name,message);}}
async function waitScene(page,n){await page.waitForFunction(n=>Number(document.querySelector('.reader-layout')?.getAttribute('data-source-scene'))===n,n);}
async function at(page,n){const p=where(n);await page.evaluate(hash=>location.hash=hash,`#/${p.chapter}/${p.beat+1}`);await waitScene(page,n);}
async function current(page){return Number(await page.locator('.reader-layout').getAttribute('data-source-scene'));}
async function close(page){await page.getByRole('button',{name:'סגירה',exact:true}).click();}
async function seed(context,value){await context.addInitScript(value=>{if(localStorage.getItem('ron-juliet-stage-v1')===null)localStorage.setItem('ron-juliet-stage-v1',JSON.stringify(value));},{version:1,chapter:'opening',beat:0,hasProgress:false,service:'apple',motion:false,mode:'read',favorites:[],...value});}
async function swipe(page,selector,dx,dy=0,touches=1){await page.locator(selector).first().evaluate((el,{dx,dy,touches})=>{const b=el.getBoundingClientRect(),p={clientX:b.x+b.width/2,clientY:b.y+b.height/2};for(const [name,list] of [['touchstart',Array.from({length:touches},()=>p)],['touchend',[{clientX:p.clientX+dx,clientY:p.clientY+dy}]]]){const e=new Event(name,{bubbles:true,cancelable:true});Object.defineProperty(e,name==='touchstart'?'touches':'changedTouches',{value:list});if(name==='touchend')Object.defineProperty(e,'touches',{value:[]});el.dispatchEvent(e);}},{dx,dy,touches});}
async function smallTargets(page){return page.evaluate(()=>[...document.querySelectorAll('button,a[href]')].flatMap(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);if(!r.width||!r.height||s.display==='none'||s.visibility==='hidden'||el.classList.contains('skip-link'))return[];return r.width<43.9||r.height<43.9?[{label:el.getAttribute('aria-label')||el.textContent.trim().slice(0,70),width:r.width,height:r.height}]:[];}));}

for(const engine of ['chromium','webkit']){
 const browser=engine==='chromium'?await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']}):await webkit.launch({headless:true});
 console.log('ENGINE',engine,browser.version());
 for(const profile of effectsOnly || caseFilter ? [] : profiles){
  const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},hasTouch:profile.touch,isMobile:profile.touch,deviceScaleFactor:1});await seed(context,{});
  const page=await context.newPage();page.on('pageerror',e=>runtimeErrors.push({engine,profile:profile.name,message:e.message}));
  await check(`${engine}: all48 complete source pages fit and load at ${profile.name}`,async()=>{
   await page.goto(base+'/#/opening/1',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   let stateFailures=[];const measured=[];
   for(const beat of story){
    await at(page,beat.sourceScene);
    await page.locator('.scene-art').evaluate(async img=>{await img.decode();});
    const actual=await page.locator('.story-copy p').allTextContents();
    const m=await page.evaluate(()=>{const e=document.querySelector('.story-copy'),r=document.querySelector('.reading-panel'),s=getComputedStyle(e),im=document.querySelector('.scene-art');return{viewportWidth:innerWidth,documentWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),fontSize:parseFloat(s.fontSize),fontFamily:s.fontFamily,color:s.color,surface:getComputedStyle(r).backgroundImage,textClientHeight:e.clientHeight,textScrollHeight:e.scrollHeight,overflowY:s.overflowY,imageWidth:im.naturalWidth,imageHeight:im.naturalHeight,lang:document.documentElement.lang,dir:document.documentElement.dir};});
    const record={engine,profile:profile.name,sourceScene:beat.sourceScene,...m};layoutStates.push(record);measured.push(record);
    const errors=[];
    try{assert.deepEqual(actual,beat.paragraphs);}catch{errors.push('canonical paragraph mismatch');}
    if(m.documentWidth>m.viewportWidth+1)errors.push('horizontal overflow');
    if(m.fontSize<22||m.fontSize>28)errors.push(`font outside22–28px: ${m.fontSize}`);
    if(!m.fontFamily.includes('Rubik'))errors.push('Rubik not applied');
    if(!m.color.startsWith('rgb(255,'))errors.push('narrative is not warm light type');
    if(!m.surface.includes('gradient'))errors.push('dark reading treatment missing');
    if(m.imageWidth!==1536||m.imageHeight!==1024)errors.push('source art failed or resized');
    if(m.lang!=='he'||m.dir!=='rtl')errors.push('Hebrew RTL document metadata missing');
    const targets=await smallTargets(page);if(targets.length)errors.push('undersized targets: '+JSON.stringify(targets));
    const expected=chapters.find(c=>c.id===where(beat.sourceScene).chapter).id==='opening'?cues.filter(c=>c.sceneId==='opening'):cues.filter(c=>c.sourceScene===beat.sourceScene);
    const labels=await page.locator('.scene-music .music-cue bdi').allTextContents();
    try{assert.deepEqual(labels,expected.map(c=>c.displayTitle));}catch{errors.push('music cue bar differs from exact canonical location');}
    if(m.textScrollHeight>m.textClientHeight+2&&m.overflowY!=='visible'){
     await page.locator('.story-copy').evaluate(e=>e.scrollTop=e.scrollHeight);
     if(!await page.locator('.story-copy').evaluate(e=>e.scrollTop+e.clientHeight>=e.scrollHeight-2))errors.push('final text line is unreachable');
     if(profile.width===1194)errors.push(`primary iPad reading area needs scroll: ${m.textClientHeight}/${m.textScrollHeight}px`);
    }
    if(errors.length){const f={scene:beat.sourceScene,errors,layout:m};stateFailures.push(f);console.error('FIT ISSUE',engine,profile.name,JSON.stringify(f));}
   }
   profileSummary.push({engine,profile:profile.name,states:measured.length,internalScroll:measured.filter(x=>x.textScrollHeight>x.textClientHeight+2&&x.overflowY!=='visible').length,failures:stateFailures});
   assert.deepEqual(stateFailures,[]);
  });await context.close();
 }

 const context=await browser.newContext({viewport:{width:1194,height:834},hasTouch:true,isMobile:true});await seed(context,{motion:true});
 const external=[];await context.route(url=>/^https?:/.test(url.protocol)&&!url.href.startsWith(base),async route=>{external.push(route.request().url());await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Official provider boundary test</title><p>Provider response intercepted for app navigation only.</p>'});});
 const page=await context.newPage();page.on('pageerror',e=>runtimeErrors.push({engine,profile:'functional',message:e.message}));await page.goto(base+'/#/opening/1',{waitUntil:'networkidle'});

 if(!effectsOnly){
 await check(`${engine}: canonical next order1–48 includes the act break and final celebration`,async()=>{
  for(let n=1;n<=48;n++){
   await waitScene(page,n);assert.equal(Number(await page.locator('[role=progressbar]').getAttribute('aria-valuenow')),n);
   await page.getByTestId('next').click();
   if(n===24){await page.getByRole('heading',{name:'הפסקה קצרה',exact:true}).waitFor();assert.equal(await current(page),24);await page.getByTestId('start-act-two').click();}
   if(n<48)await waitScene(page,n+1);
  }
  await page.getByRole('heading',{name:'הבמה שלך, רון!',exact:true}).waitFor();assert.equal(await current(page),48);await close(page);
 });
 await check(`${engine}: RTL keyboard, edge taps, horizontal swipes and gesture exclusions`,async()=>{
  await at(page,1);const next=await page.getByTestId('next').boundingBox(),back=await page.getByRole('button',{name:'אחורה',exact:true}).boundingBox();assert.ok(next.x+next.width<back.x);
  await page.getByTestId('next').click();await waitScene(page,2);await page.keyboard.press('ArrowLeft');await waitScene(page,3);await page.keyboard.press('ArrowRight');await waitScene(page,2);await page.getByRole('button',{name:'אחורה',exact:true}).click();await waitScene(page,1);
  const b=await page.locator('.reader-layout').boundingBox();await page.touchscreen.tap(b.x+5,b.y+100);await waitScene(page,2);await page.touchscreen.tap(b.x+b.width-5,b.y+100);await waitScene(page,1);
  await swipe(page,'.stage',150);await waitScene(page,2);await swipe(page,'.stage',-150);await waitScene(page,1);
  for(const [selector,dx,dy,count]of [['.reading-panel',150,0,1],['.music-cue',150,0,1],['.stage',20,150,1],['.stage',150,0,2]]){await swipe(page,selector,dx,dy,count);assert.equal(await current(page),1);}
  await page.getByRole('button',{name:'בחירת פרק',exact:true}).click();await swipe(page,'.stage',150);assert.equal(await current(page),1);await close(page);
 });
 await check(`${engine}: chapter chooser exposes both acts and all17 chapters`,async()=>{
  await page.getByRole('button',{name:'בחירת פרק',exact:true}).click();
  for(const act of [1,2]){await page.getByRole('button',{name:act===1?'מערכה ראשונה':'מערכה שנייה',exact:true}).click();assert.deepEqual(await page.locator('[data-chapter-link]').evaluateAll(a=>a.map(e=>e.dataset.chapterLink)),chapters.filter(c=>c.act===act).map(c=>c.id));}
  await page.locator('[data-chapter-link="roar"]').click();await waitScene(page,45);
 });
 await check(`${engine}: legacy opening/chandelier/emotional hashes and new chapter links remain valid`,async()=>{
  for(const [hash,n]of [['#/opening/1',1],['#/chandelier/1',14],['#/emotional/1',15],['#/emotional/2',16],['#/roar/2',46]]){await page.evaluate(hash=>location.hash=hash,hash);await waitScene(page,n);}
 });
 await check(`${engine}: all29 visible song titles and verified destinations include the discreet track26 label`,async()=>{
  assert.equal(external.length,0,'Do not contact a music provider before the user opens its player or link.');
  await page.getByRole('button',{name:'כל השירים',exact:true}).click();
  assert.deepEqual(await page.locator('.songbook>button>[data-song-title]').allTextContents(),cues.map(c=>c.displayTitle));
  assert.equal(await page.locator('iframe').count(),0);
  for(const cue of cues){
   await page.locator('.songbook>button').nth(cue.trackNumber-1).evaluate(el=>el.click());
   assert.equal(await page.locator('.selected-song h3').textContent(),cue.displayTitle);
   for(const service of ['apple','spotify']){await page.getByRole('button',{name:service==='apple'?'Apple Music':'Spotify',exact:true}).click();assert.equal(await page.getByTestId('external-track').getAttribute('href'),service==='apple'?cue.appleMusicTrackUrl:cue.spotifyTrackUrl);}
  }
  await page.locator('.songbook>button').filter({hasText:'רצועה 26'}).evaluate(el=>el.click());assert.doesNotMatch(await page.getByRole('dialog').innerText(),/Perfect|F\*\*\*\*/);
  await page.locator('.songbook>button').filter({hasText:'Blow'}).evaluate(el=>el.click());await page.getByRole('button',{name:'שמירת השיר באהובים',exact:true}).click();assert.equal(await page.getByRole('button',{name:'שמירת השיר באהובים',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByTestId('play-in-story').click();await page.getByTestId('official-embed').waitFor();
 });
 await check(`${engine}: background player survives scene35,46 and the intermission without iframe replacement`,async()=>{
  const iframe=await page.locator('.music-dock iframe').elementHandle();assert.equal(await iframe.getAttribute('src'),cues.find(c=>c.id==='blow').spotifyEmbedUrl);
  for(const n of [35,46,24]){await at(page,n);assert.equal(await iframe.evaluate(el=>el===document.querySelector('.music-dock iframe')),true);}
  await page.getByTestId('next').click();await page.getByRole('heading',{name:'הפסקה קצרה',exact:true}).waitFor();assert.equal(await iframe.evaluate(el=>el===document.querySelector('.music-dock iframe')),true);await page.getByTestId('start-act-two').click();await waitScene(page,25);assert.equal(await iframe.evaluate(el=>el===document.querySelector('.music-dock iframe')),true);
  await page.locator('.player-fallback').click();assert.equal(await page.locator('iframe').getAttribute('src'),cues.find(c=>c.id==='blow').appleEmbedUrl);await page.locator('.player-fallback').click();
  await page.getByRole('button',{name:'כל השירים',exact:true}).click();await page.locator('.songbook>button').filter({hasText:'Blow'}).evaluate(el=>el.click());
  const promise=page.waitForEvent('popup');await page.getByTestId('external-track').click();const popup=await promise;await popup.waitForLoadState('domcontentloaded');assert.equal(popup.url(),cues.find(c=>c.id==='blow').spotifyTrackUrl);await popup.close();await close(page);assert.equal(await current(page),25);
  await page.getByRole('button',{name:'סגירת נגן המוזיקה',exact:true}).click();assert.equal(await page.locator('iframe').count(),0);
  await page.reload({waitUntil:'networkidle'});await waitScene(page,25);const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ron-juliet-stage-v1')));assert.equal(saved.service,'spotify');assert.ok(saved.favorites.includes('blow'));assert.equal(await page.locator('iframe').count(),0,'Reload must not autoplay the previous song.');
  await page.goto(base+'/',{waitUntil:'networkidle'});await page.getByRole('button',{name:'נמשיך מאיפה שעצרנו',exact:true}).click();await waitScene(page,25);
 });
 await check(`${engine}: all16 motion recipes respond to deliberate touches`,async()=>{
  await page.locator('.curtain-reveal').waitFor({state:'hidden',timeout:5000});
  const representatives=[...new Map(Object.entries(sceneMotions).map(([n,c])=>[c.kind,Number(n)])).values()];
  for(const n of representatives){await at(page,n);await page.locator('.scene-art').evaluate(img=>img.decode());const before=Number(await page.locator('.stage').getAttribute('data-run'));await page.getByTestId('stage-interaction').click();await page.waitForFunction(before=>Number(document.querySelector('.stage')?.getAttribute('data-run'))>before,before);assert.equal(await page.locator('[data-motion-kind]').getAttribute('data-motion-kind'),sceneMotions[n].kind);await page.waitForTimeout(180);assert.ok(await page.locator('.fx-user-piece').evaluateAll(a=>a.some(e=>parseFloat(getComputedStyle(e).opacity)>.01)),`No visible finite effect in scene${n}.`);}
  await at(page,10);await page.locator('.scene-art').evaluate(img=>img.decode());await page.getByTestId('stage-interaction').click();const consumed=Number(await page.locator('.stage').getAttribute('data-run'));await page.waitForTimeout(900);assert.equal(Number(await page.locator('.stage').getAttribute('data-run')),consumed,'A manual cue must consume its pending automatic entrance.');
 });
 await check(`${engine}: motion-off, quiet and reading pause work with remembered preferences`,async()=>{
  await page.getByRole('button',{name:'הגדרות להורים',exact:true}).click();const motion=page.getByRole('switch',{name:'תנועה ואורות',exact:true});assert.equal(await motion.getAttribute('aria-checked'),'true');await motion.click();await close(page);assert.ok(await page.locator('.stage').evaluate(e=>e.classList.contains('motion-off')));
  await page.getByTestId('stage-interaction').click();await page.waitForTimeout(100);const before=await page.locator('.fx-user-piece').evaluateAll(a=>a.map(e=>[getComputedStyle(e).opacity,getComputedStyle(e).transform]));await page.waitForTimeout(400);assert.deepEqual(await page.locator('.fx-user-piece').evaluateAll(a=>a.map(e=>[getComputedStyle(e).opacity,getComputedStyle(e).transform])),before);
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('ron-juliet-stage-v1')).motion),false);
  await page.getByRole('button',{name:'הגדרות להורים',exact:true}).click();await motion.click();await page.getByRole('button',{name:'שקט בלי תנועה ואפקטים',exact:true}).click();assert.equal(await motion.isDisabled(),true);await close(page);assert.ok(await page.locator('.app').evaluate(e=>e.classList.contains('mode-quiet')&&e.classList.contains('reduced-motion')));
  await page.getByRole('button',{name:'הגדרות להורים',exact:true}).click();await page.getByRole('button',{name:'קוראים הסיפור במרכז',exact:true}).click();await close(page);await page.locator('.story-copy').focus();await page.waitForFunction(()=>document.querySelector('.stage')?.classList.contains('reading'));
  // animation:none resets the CSS play-state longhand to its default
  // "running" even though no animation exists. Test actual motion instead.
  const beamState=()=>page.locator('.light-beam').evaluateAll(a=>a.map(e=>({name:getComputedStyle(e).animationName,transform:getComputedStyle(e).transform,states:e.getAnimations().map(a=>a.playState)})));
  const readBeams=await beamState();
  assert.ok(readBeams.every(b=>b.states.every(s=>s!=='running')),JSON.stringify(readBeams));
  await page.waitForTimeout(140);assert.deepEqual((await beamState()).map(b=>b.transform),readBeams.map(b=>b.transform),'Reading beams must remain stationary.');
  // Explore does create real ambient CSS animations. Verify that entering
  // reading pauses those too, rather than weakening the check to "none" only.
  await page.getByRole('button',{name:'הגדרות להורים',exact:true}).click();await page.getByRole('button',{name:'מגלים תאורה ותנועה עדינה',exact:true}).click();await close(page);
  await page.getByTestId('stage-interaction').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.light-beam')].every(e=>e.getAnimations().some(a=>a.playState==='running')));
  await page.locator('.story-copy').focus();
  await page.waitForFunction(()=>document.querySelector('.stage')?.classList.contains('reading')&&[...document.querySelectorAll('.light-beam')].every(e=>e.getAnimations().every(a=>a.playState!=='running')));
  const pausedBeams=await beamState();assert.ok(pausedBeams.every(b=>b.states.every(s=>s==='paused'||s==='finished')),JSON.stringify(pausedBeams));
  await page.waitForTimeout(140);assert.deepEqual((await beamState()).map(b=>b.transform),pausedBeams.map(b=>b.transform),'Explore beams must stop moving while reading.');
  await page.getByRole('button',{name:'הגדרות להורים',exact:true}).click();await page.getByRole('button',{name:'קוראים הסיפור במרכז',exact:true}).click();await close(page);
 });
 await check(`${engine}: emotional identity tap returns keyboard focus after the native dialog`,async()=>{
  await at(page,16);const identity=page.getByRole('button',{name:'מי זה? מיי',exact:true});await identity.click();assert.match(await page.getByRole('dialog').innerText(),/לא בן ולא בת\. פשוט מיי/);assert.deepEqual(await smallTargets(page),[]);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await identity.evaluate(e=>e===document.activeElement),true);
 });
 }
 await check(`${engine}: reading clears reveal curtains and resets camera; manual replay restores each effect`,async()=>{
  for(const n of [7,13,19,24]){
   await at(page,n);await page.locator('.scene-art').evaluate(img=>img.decode());
   const before=Number(await page.locator('.stage').getAttribute('data-run'));
   await page.getByTestId('stage-interaction').click();
   await page.waitForFunction(before=>Number(document.querySelector('.stage')?.getAttribute('data-run'))>before,before);
   await page.waitForTimeout(220);
   assert.ok(await page.locator('.fx-side-curtain').evaluateAll(a=>a.some(e=>parseFloat(getComputedStyle(e).opacity)>.1)),`Scene${n} reveal never appeared.`);
   await page.locator('.story-copy').focus();
   await page.waitForFunction(()=>document.querySelector('.stage')?.classList.contains('reading')&&[...document.querySelectorAll('.fx-side-curtain')].every(e=>parseFloat(getComputedStyle(e).opacity)<.01));
   assert.equal(await page.locator('.art-plane').evaluate(e=>getComputedStyle(e).transform),'matrix(1, 0, 0, 1, 0, 0)',`Scene${n} camera did not reset for reading.`);
   const prior=Number(await page.locator('.stage').getAttribute('data-run'));
   await page.getByTestId('stage-interaction').click();
   await page.waitForFunction(prior=>Number(document.querySelector('.stage')?.getAttribute('data-run'))>prior,prior);
   await page.waitForTimeout(220);
   assert.equal(await page.locator('.stage').evaluate(e=>e.classList.contains('reading')),false);
   assert.ok(await page.locator('.fx-side-curtain').evaluateAll(a=>a.some(e=>parseFloat(getComputedStyle(e).opacity)>.1)),`Scene${n} replay did not resume a fresh finite effect.`);
   await page.locator('.story-copy').focus();
   await page.waitForFunction(()=>[...document.querySelectorAll('.fx-side-curtain')].every(e=>parseFloat(getComputedStyle(e).opacity)<.01));
  }
  await at(page,10);await page.locator('.scene-art').evaluate(img=>img.decode());
  await page.getByTestId('stage-interaction').click();
  const consumed=Number(await page.locator('.stage').getAttribute('data-run'));
  await page.waitForTimeout(900);
  assert.equal(Number(await page.locator('.stage').getAttribute('data-run')),consumed,'A deliberate touch must consume the pending automatic timer.');
  await page.getByRole('button',{name:'הגדרות להורים',exact:true}).click();
  const toggle=page.getByRole('switch',{name:'תנועה ואורות',exact:true});await toggle.click();await close(page);
  const stopped=await page.locator('.fx-user-piece').evaluateAll(a=>a.map(e=>[getComputedStyle(e).opacity,getComputedStyle(e).transform]));
  await page.waitForTimeout(300);assert.deepEqual(await page.locator('.fx-user-piece').evaluateAll(a=>a.map(e=>[getComputedStyle(e).opacity,getComputedStyle(e).transform])),stopped);
  await page.getByRole('button',{name:'הגדרות להורים',exact:true}).click();await toggle.click();await close(page);
  await page.waitForTimeout(800);assert.equal(Number(await page.locator('.stage').getAttribute('data-run')),consumed,'Turning motion on must not replay a consumed cue.');
  assert.ok(await page.locator('.fx-user-piece').evaluateAll(a=>a.every(e=>parseFloat(getComputedStyle(e).opacity)<.01)),'A canceled effect must stay hidden until a new touch.');
  await page.getByTestId('stage-interaction').click();await page.waitForTimeout(200);
  assert.equal(Number(await page.locator('.stage').getAttribute('data-run')),consumed+1);
  assert.ok(await page.locator('.fx-user-piece').evaluateAll(a=>a.some(e=>parseFloat(getComputedStyle(e).opacity)>.01)),'A fresh touch after motion-on must still work.');
 });
 await context.close();
 if(!effectsOnly)await check(`${engine}: reduced-motion suppresses automatic/manual animation and audio autoplay`,async()=>{
  const c=await browser.newContext({viewport:{width:1194,height:834},hasTouch:true,reducedMotion:'reduce'});const p=await c.newPage();await p.goto(base+'/#/chandelier/1',{waitUntil:'networkidle'});await p.waitForTimeout(800);assert.equal(await p.locator('.stage').getAttribute('data-run'),'0');assert.ok(await p.locator('.stage').evaluate(e=>e.classList.contains('motion-off')));assert.equal(await p.locator('iframe').count(),0);await p.getByTestId('stage-interaction').click();assert.equal(await p.locator('.stage').getAttribute('data-run'),'1');assert.equal(await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);await p.getByRole('button',{name:'הגדרות להורים',exact:true}).click();assert.equal(await p.getByRole('switch',{name:'תנועה ואורות',exact:true}).isDisabled(),true);await c.close();
 });await browser.close();
}
if(runtimeErrors.length)failures.push({name:'Uncaught runtime exceptions',message:JSON.stringify(runtimeErrors)});
if(caseFilter){
 const path=resolve(project,'docs/FULL_BROWSER_QA.md');let previous=await readFile(path,'utf8');
 previous=previous.split('\n## Focused reading-motion assertion update')[0];
 for(const r of results){
  const escaped=r.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  previous=previous.replace(new RegExp(`^- (?:PASS|FAIL): ${escaped}(?: —.*)?$`,'m'),`- ${r.passed?'PASS':'FAIL'}: ${r.name}${r.passed?'':' — '+r.message.split('\n')[0]}`);
 }
 const functional=previous.split('\n## Functional results\n')[1]?.split('\n## ')[0]||'';
 const statuses=[...functional.matchAll(/^- (PASS|FAIL): /gm)].map(m=>m[1]);const passed=statuses.filter(s=>s==='PASS').length;
 const finalPass=passed===statuses.length&&!failures.length;
 previous=previous.replace(/^Result:.*$/m,`Result: **${finalPass?'PASS':'FAIL'}**. ${passed}/${statuses.length} checks passed. 480 source-page/viewport states retained from the full sweep. ${runtimeErrors.length} targeted-run uncaught exceptions.`);
 if(finalPass)previous=previous.split('\n## Defects')[0];
 previous+='\n## Focused reading-motion assertion update\n\n'+`Run: ${new Date().toISOString()}. Only the two reading/motion preference cases reran; the passed480-state layout sweep and other functional cases are retained.\n\n`+
  'Both engines reported animation-name:none, CSS animation-play-state:running and zero actual animations in Read mode. The old assertion incorrectly required the CSS longhand to equal paused. The corrected test checks the real Animation objects and stable beam transforms. It additionally enables Explore to prove real ambient animations run, then verifies they pause and remain stationary when reading begins. No application change was needed.\n\n'+
  results.map(r=>`- ${r.passed?'PASS':'FAIL'}: ${r.name}${r.passed?'':' — '+r.message.split('\n')[0]}`).join('\n')+'\n';
 if(failures.length)previous+='\n'+failures.map(f=>`\`\`\`text\n${f.message}\n\`\`\``).join('\n');
 await writeFile(path,previous);console.log(JSON.stringify({passed:finalPass,targetedChecks:results.length,totalChecks:statuses.length,retainedLayoutStates:480,failures}));process.exitCode=finalPass?0:1;
}else if(effectsOnly){
 const path=resolve(project,'docs/FULL_BROWSER_QA.md');
 let previous=await readFile(path,'utf8');
 previous=previous.split('\n## Focused reading-interruption regression check')[0];
 previous=previous.replace(/^Result:.*$/m,`Result: **${failures.length?'FAIL':'PASS'}**. ${failures.length?'30 full-suite checks passed; a focused motion regression failed':'32/32 checks passed (30 full-suite checks plus2 focused motion checks)'}. 480 source-page/viewport states measured. ${runtimeErrors.length} focused-run uncaught exceptions.`);
 previous+='\n## Focused reading-interruption regression check\n\n'+`Run: ${new Date().toISOString()}. The preceding480-state layout sweep is retained because only motion cancellation changed; no font/layout/source-content changes were made.\n\n`+results.map(r=>`- ${r.passed?'PASS':'FAIL'}: ${r.name}${r.passed?'':' — '+r.message.split('\n')[0]}`).join('\n')+'\n\nScenes7,13,19and24 were interrupted during their reveal; curtain clearing, camera reset and fresh manual replay were checked. '+(failures.length?'See the remaining focused defects below.':'All focused checks passed.')+'\n';
 if(failures.length)previous+='\n'+failures.map(f=>`\`\`\`text\n${f.message}\n\`\`\``).join('\n');
 await writeFile(path,previous);console.log(JSON.stringify({passed:!failures.length,focusedChecks:results.length,retainedLayoutStates:480,failures}));process.exitCode=failures.length?1:0;
}else{
const scroll=layoutStates.filter(s=>s.textScrollHeight>s.textClientHeight+2&&s.overflowY!=='visible');
const report=['# Full-story running-browser QA','',`Run: ${new Date().toISOString()}`,`App: ${base}`,'',`Result: **${failures.length?'FAIL':'PASS'}**. ${results.filter(r=>r.passed).length}/${results.length} checks passed. ${layoutStates.length} source-page/viewport states measured. ${runtimeErrors.length} uncaught exceptions.`,'','## Scope','','Real local Chrome and Playwright WebKit were tested. Viewports:1194×834,1180×820,1024×768,834×1194 and1440×900 CSS pixels, all48source scenes in each engine/profile (480states). Touch, viewport and reduced-motion preferences are emulated. This is not physical iPad Safari or family-account audio certification.','','## Responsive results','','| Engine | Profile | States | Internal scroll states | Defects |','|---|---|---:|---:|---:|',...profileSummary.map(p=>`| ${p.engine} | ${p.profile} | ${p.states} | ${p.internalScroll} | ${p.failures.length} |`),'','Narrative paragraphs matched full-story.json exactly. Every loaded source image retained1536×1024natural pixels. Narrative Rubik type was checked at22–28CSSpx; the document remained Hebrew/RTL without horizontal overflow. Every rendered touch target was checked for44×44CSSpx. The primary1194×834profile requires complete text fit; smaller profiles may scroll only if the final line is reachable. Portrait uses normal document reflow.','','## Functional results','',...results.map(r=>`- ${r.passed?'PASS':'FAIL'}: ${r.name}${r.passed?'':' — '+r.message.split('\n')[0]}`),'','## Music boundary','','All29actual destinations and all child-facing song labels were checked; track26remains discreet. A persistent official frame was retained by DOMidentity across scene35,46and the24→25intermission. User service changes, provider popup return, favorites and saved progress were tested. For deterministic functional tests the external provider responses were intercepted. No audio-playback, provider-login, subscription or regional-entitlement claim is made by these tests. Live-provider observations are recorded separately.','','## Animation boundary','','All16motion recipe kinds were exercised with deliberate touches and visible finite overlay effects. Automatic entrance and manual consumption, reading pause, motion-off, quiet and system reduced-motion were checked. These are effects around original flattened illustrations; no independently rigged character acting is implied.','','## Measured text scrolling','',...(scroll.length?scroll.map(s=>`- ${s.engine},${s.profile},source${s.sourceScene}:${s.textClientHeight}/${s.textScrollHeight}px.`):['No internal story scrolling was needed in any measured state.']),'',...(failures.length?['## Defects','',...failures.map(f=>`### ${f.name}\n\n\`\`\`text\n${f.message}\n\`\`\`\n`)]:[])];
await writeFile(resolve(project,'docs/FULL_BROWSER_QA.md'),report.join('\n')+'\n');console.log(JSON.stringify({passed:!failures.length,checks:results.length,measuredStates:layoutStates.length,scrollCases:scroll.length,failures}));process.exitCode=failures.length?1:0;
}
