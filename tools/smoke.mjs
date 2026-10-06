#!/usr/bin/env node
// Smoke test: boots the built game in headless Chromium and exercises the main systems through window.DS.
// Fails on any uncaught page error or broken expectation. Screenshots go to tools/.smoke/.
// Needs Playwright (`npm i -D playwright`, or set PLAYWRIGHT_PATH). Optional env:
//   CHROME_PATH  chromium binary to use     THREE_JS  local three.min.js to serve instead of the CDN copy
import {createRequire} from 'node:module';import {mkdirSync,readFile} from 'node:fs';import {createServer} from 'node:http';import {join,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'),shots=join(root,'tools/.smoke');mkdirSync(shots,{recursive:true});
const req=createRequire(import.meta.url);let pw;try{pw=req(process.env.PLAYWRIGHT_PATH||'playwright');}catch(e){console.error('Playwright not found: npm i -D playwright (or set PLAYWRIGHT_PATH)');process.exit(2);}
const b=await pw.chromium.launch({executablePath:process.env.CHROME_PATH||undefined,args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});
const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true})).newPage();
const errors=[];pg.on('pageerror',e=>errors.push(e.message));
if(process.env.THREE_JS)await pg.route('**/three.min.js',r=>r.fulfill({path:process.env.THREE_JS,contentType:'application/javascript'}));
let fails=0;const check=(ok,msg)=>{console.log((ok?'  ok   ':'  FAIL ')+msg);if(!ok)fails++;};
const ev=(f,a)=>pg.evaluate(f,a),wait=ms=>pg.waitForTimeout(ms);
// poll instead of fixed waits: headless software rendering can drop to ~1 fps, which delays the game's own timers
const waitFor=async(f,ms=12000)=>{const t=Date.now();while(Date.now()-t<ms){const v=await ev(f);if(v)return v;await wait(300);}return null;};
const enter=async f=>{await ev(f);await waitFor(()=>DS.state().inside);return ev(()=>DS.state());},leave=async()=>{await ev(()=>DS.leave());await waitFor(()=>!DS.state().inside);};
// served over http (not file://), so the page can load its character models (assets/characters)
const MIME={html:'text/html',js:'application/javascript',glb:'model/gltf-binary',png:'image/png'};
const srv=createServer((q,r)=>{const f=join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html');if(!f.startsWith(root)){r.writeHead(403);r.end();return;}
  readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':MIME[f.split('.').pop()]||'application/octet-stream'});r.end(d);});});
await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
await pg.goto(`http://127.0.0.1:${srv.address().port}/index.html?debug`);await wait(2500);
// a new game starts adrift: an island seen from the sea; keep drifting to another, then make landfall on it
check(await ev(()=>!!document.querySelector('#arrive .arr h2')),'a new game starts adrift, looking at an island from the sea');
await pg.click('#arMore');await wait(2500);check(await ev(()=>!!document.querySelector('#arrive .arr h2')),'kept drifting to another island');
await pg.click('#arLand');await wait(1200);
// coming ashore: a few words in the dark, then you're on the beach (a tap hurries each line on)
check(await ev(()=>!!document.querySelector('#landfall p')),'making landfall says a few words before you step ashore');
for(let i=0;i<4;i++){if(await ev(()=>!!document.querySelector('#landfall')))await pg.click('#landfall').catch(()=>{});await wait(600);}await wait(2500);
{const mk=await ev(()=>DS.marks());check(mk.kind&&mk.marks&&mk.marks.length>0,`the island has a character (${mk.kind}) and landmarks (${(mk.marks||[]).map(m=>m.k).join(', ')})`);}
check(await ev(()=>!!window.DS),'boots and exposes the debug API');
let st=await ev(()=>DS.state());const wild=await ev(()=>DS.wild());
check(st.npcs.length===0&&st.buildings.length===0&&(wild.tree||0)>40,`lands on a wild island: no buildings or villagers, ${wild.tree} trees, ${wild.bush} bushes, ${wild.rock||0} rocks`);
check(await ev(()=>DS.goal())==='Plant your driftseed','the first goal is to plant the driftseed');
await ev(()=>DS.bp('seed'));await wait(500);await pg.getByText('Plant here').click();await pg.waitForSelector('#pkName',{timeout:90000});/* planting it pitches the tent beside the sprout, then you name the island */await pg.fill('#pkName','Testhaven');await pg.click('#huOk');await wait(600);
st=await ev(()=>DS.state());check(st.town==='Testhaven'&&st.buildings.includes('home')&&(await ev(()=>DS.heartAt())).length===2,'planted the driftseed, the tent went up beside it, and named the island');
// your first-day notes open by themselves once the tent is up: they list what to try, each with how
{const nt=await waitFor(()=>!!document.querySelector('#jrCard .fn-intro'),6000);check(nt,'your first-day notes open, with things to try and how');if(nt){await pg.click('#jrCard .x');await wait(500);}}
check(await ev(()=>DS.goal()!=='Plant your driftseed'&&DS.heartAt().length===2),'the Island Heart is growing where you planted it');await ev(()=>document.querySelectorAll('#heartUp').forEach(e=>e.remove()));
await ev(()=>DS.setLevel(3));check(/^Place/.test(await ev(()=>DS.goal())),'a level-up hands you a building kit to place');
await ev(()=>DS.setLevel(11));await ev(()=>DS.buildAll());
st=await ev(()=>DS.state());check(st.buildings.length>=8,`built up, "${st.town}" has ${st.buildings.length} buildings`);check(st.npcs.length>=5,`${st.npcs.length} villagers`);
await ev(()=>DS.hour(10));
check((await ev(()=>DS.state())).perfPx===0,'no automatic pixel scaling');
// drag-farming across a free row
await ev(()=>DS.calm());/* no forage or critters appearing under the test's taps */const row=await ev(()=>DS.freeRow(5));check(!!row,'found a free row of grass');
if(row){await ev(r=>DS.tp(r[0]+2,r[1]+1.5),row);check(await ev(()=>DS.tool('hoe'))==='hoe','equipped the hoe');await wait(2000);const pts=[];for(let i=0;i<5;i++)pts.push(await ev(([x,z])=>DS.screen(x,z),[row[0]+i,row[1]]));
  // long-press then drag; headless rendering can starve the 300ms hold timer, so hold generously and retry once
  const before=(await ev(()=>DS.state())).tiles;let after=before;
  for(let tries=0;tries<2&&after===before;tries++){await pg.mouse.move(pts[0][0],pts[0][1]);await pg.mouse.down();await wait(1500);
    for(let i=1;i<5;i++)for(let k=1;k<=4;k++){await pg.mouse.move(pts[i-1][0]+(pts[i][0]-pts[i-1][0])*k/4,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*k/4);await wait(30);}
    await pg.mouse.up();await wait(500);after=(await ev(()=>DS.state())).tiles;}check(after-before>=3,`drag-tilled ${after-before} tiles`);
  // tools: tap soil with the watering can (the villager walks over, then waters)
  await ev(()=>DS.tool('can'));let wx=row[0]+4;for(let i=4;i>=0;i--)if(await ev(([x,z])=>DS.tile(x,z),[row[0]+i,row[1]])){wx=row[0]+i;break;}
  let wet=false;for(let tries=0;tries<2&&!wet;tries++){await pg.keyboard.press('Escape');await ev(()=>document.querySelectorAll('.toast').forEach(e=>e.remove()));await ev(()=>DS.shoo());/* villagers wander onto open ground: send them home so the tap hits the soil */await wait(1500);const p0=await ev(([x,z])=>DS.screen(x,z),[wx,row[1]]);await pg.mouse.click(p0[0],p0[1]);
    for(let i=0;i<32&&!wet;i++){await wait(500);wet=!!(await ev(([x,z])=>DS.tile(x,z),[wx,row[1]]))?.w;}}
  check(wet,'watering can watered the tapped soil');await pg.keyboard.press('Escape');
  // hands: a tap on open ground just walks there
  await ev(()=>document.querySelectorAll('.toast').forEach(e=>e.remove()));await ev(()=>DS.tool('hand'));await ev(()=>DS.shoo());await ev(()=>DS.noBugs());/* a butterfly near the tap would (rightly) be caught instead */await wait(1500);/* let the camera settle before reading screen positions */const v0=await ev(()=>DS.vil());const p1=await ev(([x,z])=>DS.screen(x,z),[row[0],row[1]]);await pg.mouse.click(p1[0],p1[1]);let v1=v0;for(let i=0;i<60&&Math.hypot(v1.x-row[0],v1.z-row[1])>1;i++){await wait(500);v1=await ev(()=>DS.vil());}
  check(Math.hypot(v1.x-row[0],v1.z-row[1])<=1,`tap to walk moved the villager ${Math.hypot(v1.x-v0.x,v1.z-v0.z).toFixed(1)} tiles to the tapped tile`);}
  // tap-to-do: with bare hands, tapping a butterfly grabs the net, walks over and catches it
  {await ev(()=>DS.tool('hand'));const c0=(await ev(()=>DS.bugAt())).caught;await ev(()=>DS.bugNear());await wait(1500);const p=await ev(()=>DS.bugAt());
    await pg.mouse.click(p.x,p.y);let got=false;for(let i=0;i<40&&!got;i++){await wait(500);got=(await ev(()=>DS.bugAt())).caught>c0;}
    check(got,'tapping a butterfly with bare hands switches to the net and catches it');}
await pg.screenshot({path:join(shots,'1-town.png')});
// inventory + crafting
await ev(()=>{DS.give();DS.sheet('bag');});await wait(500);check(await pg.locator('.cell').count()>=5,'inventory grid shows items');
await ev(()=>DS.craft(0));st=await ev(()=>DS.state());check((st.store.fence||0)>=4,'crafted fences into storage');
await ev(()=>DS.sheet('bag','craft'));await wait(400);await pg.screenshot({path:join(shots,'2-craft.png')});await ev(()=>DS.closeSheet());
// houses
st=await enter(()=>DS.enterHome());check(!!st.inside,`entered ${st.inside}`);await pg.screenshot({path:join(shots,'3-home.png')});
await leave();st=await enter(()=>DS.enterNpc(0));check(!!st.inside,`entered ${st.inside}`);await leave();
// museum: walk-in hall with your catches on display
await ev(()=>DS.collectAll());st=await enter(()=>DS.enterMuseum());check(/Museum/.test(st.inside||''),`entered ${st.inside}`);await pg.screenshot({path:join(shots,'3b-museum.png')});await leave();
// explore: visit an island, fish there, travel home
const isl=await ev(()=>DS.islands().find(i=>!i.grand&&i.id>0));await ev(id=>DS.visit(id),isl.id);await wait(1500);
st=await ev(()=>DS.state());check(st.loc===isl.name,`visited ${isl.name}`);check(await ev(()=>DS.fish()),'started fishing');await wait(1500);
await pg.screenshot({path:join(shots,'4-island.png')});await ev(()=>DS.fastTravel(0));await wait(1800);st=await ev(()=>DS.state());check(!st.sea,'fast-travelled home');
const onLand=await ev(()=>DS.npcRouteOnLand());check(onLand===0,`villager sailboat route stays at sea (${onLand} samples on land)`);
{const f=await ev(()=>DS.floorTest());check(f.floor==='brick'&&f.obj==='chair'&&f.second&&f.left===1,`laid brick paving by tapping and stood a chair on it (${JSON.stringify(f)})`);}
// sail your own boat to the farthest regular island and make sure it never crosses land
const far=await ev(()=>DS.islands().filter(i=>!i.grand&&i.id>0).sort((a,b)=>Math.hypot(b.x,b.z)-Math.hypot(a.x,a.z))[0]);
check(await ev(id=>DS.sailTo(id),far.id),`set sail for ${far.name}`);let hits=0;for(let t=0;t<40;t++){await wait(500);const bt=await ev(()=>DS.boat());if(bt.onLand)hits++;if(!bt.sailing)break;}
check(hits===0,`boat never crossed land while sailing (${hits} samples on land)`);
// characters (61b): the editor loads the models; picking one swaps you at once, standing at the player's height
await ev(()=>DS.fastTravel(0));await waitFor(()=>!DS.state().sea);await wait(1500);
await ev(()=>DS.charEd());const ld=await waitFor(()=>{const l=DS.charLoad();return l.every(q=>q[1])&&l;},20000);check(!!ld,`character models loaded (${JSON.stringify(ld)})`);
{let cs=await waitFor(()=>DS.charState().loaded&&DS.charState());check(cs&&!cs.tpose&&cs.height>0.95&&cs.height<1.35,`you're a character, idling at about the player's height (ears and all) (${cs&&cs.height})`);
  for(const c of ['mochi','pip','sprig','willow','sprite']){await ev(c=>DS.charSet({c,skin:3}),c);cs=await ev(()=>DS.charState());check(cs.body&&cs.body.c===c&&cs.loaded,`picking ${c} swaps the model straight away`);}
  await pg.screenshot({path:join(shots,'5-character.png')});await pg.getByRole('button',{name:'Done'}).click();
  await wait(800);await ev(()=>DS.charSet({c:'pip',style:2}));cs=await ev(()=>DS.charState());check(cs.body&&cs.body.c==='pip'&&cs.body.style===2&&cs.loaded,'a hairstyle carries onto your character');await ev(()=>DS.charSet({c:'sprite',style:0}));
  await ev(()=>DS.charSet({top:2,shoe:0}));cs=await ev(()=>DS.charState());check(cs.body&&cs.body.top===2&&cs.body.shoe===0&&cs.loaded,'clothes colours carry onto your character');
  await ev(()=>DS.walkTest());/* (a walk past the nearest tree) */
  const run=await waitFor(()=>{const s=DS.charState();return s.weights&&s.weights[0]<0.3&&s;},6000);check(!!run,`walking plays the walk/run clips (${run&&run.weights})`);
  const idle=await waitFor(()=>{const s=DS.charState();return s.weights&&s.weights[0]>0.95&&s;},12000);check(!!idle,'standing still goes back to idle');}
check(errors.length===0,errors.length?`page errors: ${errors.join(' | ')}`:'no page errors');
await b.close();srv.close();console.log(fails?`\n${fails} check(s) failed`:'\nall checks passed');process.exit(fails?1:0);
