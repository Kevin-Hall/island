#!/usr/bin/env node
// Smoke test: boots the built game in headless Chromium and exercises the main systems through window.DS.
// Fails on any uncaught page error or broken expectation. Screenshots go to tools/.smoke/.
// Needs Playwright (`npm i -D playwright`, or set PLAYWRIGHT_PATH). Optional env:
//   CHROME_PATH  chromium binary to use     THREE_JS  local three.min.js to serve instead of the CDN copy
import {createRequire} from 'node:module';import {mkdirSync} from 'node:fs';import {join,dirname} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'),shots=join(root,'tools/.smoke');mkdirSync(shots,{recursive:true});
const req=createRequire(import.meta.url);let pw;try{pw=req(process.env.PLAYWRIGHT_PATH||'playwright');}catch(e){console.error('Playwright not found: npm i -D playwright (or set PLAYWRIGHT_PATH)');process.exit(2);}
const b=await pw.chromium.launch({executablePath:process.env.CHROME_PATH||undefined,args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});
const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true})).newPage();
const errors=[];pg.on('pageerror',e=>errors.push(e.message));
if(process.env.THREE_JS)await pg.route('**/three.min.js',r=>r.fulfill({path:process.env.THREE_JS,contentType:'application/javascript'}));
let fails=0;const check=(ok,msg)=>{console.log((ok?'  ok   ':'  FAIL ')+msg);if(!ok)fails++;};
const ev=(f,a)=>pg.evaluate(f,a),wait=ms=>pg.waitForTimeout(ms);
await pg.goto(pathToFileURL(join(root,'index.html')).href+'?debug');await wait(3500);
check(await ev(()=>!!window.DS),'boots and exposes the debug API');
let st=await ev(()=>DS.state());check(st.buildings.length>=8,`town "${st.town}" has ${st.buildings.length} buildings`);check(st.npcs.length>=5,`${st.npcs.length} villagers`);
await ev(()=>DS.hour(10));
check((await ev(()=>DS.state())).perfPx===0,'no automatic pixel scaling');
// drag-farming across a free row
const row=await ev(()=>DS.freeRow(5));check(!!row,'found a free row of grass');
if(row){await ev(r=>DS.tp(r[0]+2,r[1]+1.5),row);check(await ev(()=>DS.tool('shovel'))==='shovel','equipped the shovel');await wait(2000);const pts=[];for(let i=0;i<5;i++)pts.push(await ev(([x,z])=>DS.screen(x,z),[row[0]+i,row[1]]));
  const before=(await ev(()=>DS.state())).tiles;await pg.mouse.move(pts[0][0],pts[0][1]);await pg.mouse.down();await wait(800);
  for(let i=1;i<5;i++)for(let k=1;k<=4;k++){await pg.mouse.move(pts[i-1][0]+(pts[i][0]-pts[i-1][0])*k/4,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*k/4);await wait(30);}
  await pg.mouse.up();await wait(500);const after=(await ev(()=>DS.state())).tiles;check(after-before>=3,`drag-tilled ${after-before} tiles`);
  // tools: tap soil with the watering can (the villager walks over, then waters)
  await ev(()=>DS.tool('can'));const p0=await ev(([x,z])=>DS.screen(x,z),[row[0]+4,row[1]]);await pg.mouse.click(p0[0],p0[1]);let wet=false;for(let i=0;i<16&&!wet;i++){await wait(500);wet=!!(await ev(([x,z])=>DS.tile(x,z),[row[0]+4,row[1]]))?.w;}
  check(wet,'watering can watered the tapped soil');
  // hands: a tap on open ground just walks there
  await ev(()=>DS.tool('hand'));const v0=await ev(()=>DS.vil());const p1=await ev(([x,z])=>DS.screen(x,z),[row[0],row[1]]);await pg.mouse.click(p1[0],p1[1]);let v1=v0;for(let i=0;i<16&&Math.hypot(v1.x-row[0],v1.z-row[1])>1;i++){await wait(500);v1=await ev(()=>DS.vil());}
  check(Math.hypot(v1.x-row[0],v1.z-row[1])<=1,`tap to walk moved the villager ${Math.hypot(v1.x-v0.x,v1.z-v0.z).toFixed(1)} tiles to the tapped tile`);}
await pg.screenshot({path:join(shots,'1-town.png')});
// inventory + crafting
await ev(()=>{DS.give();DS.sheet('bag');});await wait(500);check(await pg.locator('.cell').count()>=5,'inventory grid shows items');
await ev(()=>DS.craft(0));st=await ev(()=>DS.state());check((st.store.fence||0)>=4,'crafted fences into storage');
await ev(()=>DS.sheet('bag','craft'));await wait(400);await pg.screenshot({path:join(shots,'2-craft.png')});await ev(()=>DS.closeSheet());
// houses
await ev(()=>DS.enterHome());await wait(1500);st=await ev(()=>DS.state());check(!!st.inside,`entered ${st.inside}`);await pg.screenshot({path:join(shots,'3-home.png')});
await ev(()=>DS.leave());await wait(900);await ev(()=>DS.enterNpc(0));await wait(1500);st=await ev(()=>DS.state());check(!!st.inside,`entered ${st.inside}`);await ev(()=>DS.leave());await wait(900);
// explore: visit an island, fish there, travel home
const isl=await ev(()=>DS.islands().find(i=>!i.grand&&i.id>0));await ev(id=>DS.visit(id),isl.id);await wait(1500);
st=await ev(()=>DS.state());check(st.loc===isl.name,`visited ${isl.name}`);check(await ev(()=>DS.fish()),'started fishing');await wait(1500);
await pg.screenshot({path:join(shots,'4-island.png')});await ev(()=>DS.fastTravel(0));await wait(1800);st=await ev(()=>DS.state());check(!st.sea,'fast-travelled home');
const onLand=await ev(()=>DS.npcRouteOnLand());check(onLand===0,`villager sailboat route stays at sea (${onLand} samples on land)`);
// sail your own boat to the farthest regular island and make sure it never crosses land
const far=await ev(()=>DS.islands().filter(i=>!i.grand&&i.id>0).sort((a,b)=>Math.hypot(b.x,b.z)-Math.hypot(a.x,a.z))[0]);
check(await ev(id=>DS.sailTo(id),far.id),`set sail for ${far.name}`);let hits=0;for(let t=0;t<40;t++){await wait(500);const bt=await ev(()=>DS.boat());if(bt.onLand)hits++;if(!bt.sailing)break;}
check(hits===0,`boat never crossed land while sailing (${hits} samples on land)`);
check(errors.length===0,errors.length?`page errors: ${errors.join(' | ')}`:'no page errors');
await b.close();console.log(fails?`\n${fails} check(s) failed`:'\nall checks passed');process.exit(fails?1:0);
