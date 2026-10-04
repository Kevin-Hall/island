/* =========================================================
   Inside the shop and the café (buildRoom, 56-interiors, hands these kinds here). Both are walk-in rooms in the same
   style as the houses, staffed by a shopkeeper and a barista, with things to tap:
   - The general store: shelves of jars, tins and seed packets, a seed rack, a table of decor for sale, crates of fresh
     produce (the same produce displays you can craft, 58c), a till on the counter. Talk to Hazel at the counter to buy
     decor or plants, or to sell (your bag opens in selling mode, where you can pick several things and sell them at
     once). The seed rack and the decor table open the shop straight to their stock.
   - The harbour café: checkerboard floor, pendant lamps, a long counter with an espresso machine and a glass case of
     pastries, a chalkboard menu, little round tables (neighbours who are out and about may be sitting at them). Order
     at the counter (the café's drinks, cafeMenu), sit at a table for a moment's peace.
   ========================================================= */
function staff(sp,col,shirt,outfit){const g=npcModel(sp,col,shirt,'',outfit);g.scale.setScalar(0.92);return g;}
function shopFurn(k){const p=[],gl=[];const R=mulberry(k.length*31+7);
  switch(k){
    case'shelf':{p.push(P(BOX,0x8a5a3a,0,1.0,0,0,0,0,1.5,2.0,0.4));for(let i=0;i<4;i++){const y=0.3+i*0.46;p.push(P(BOX,0x6a4428,0,y,0.03,0,0,0,1.42,0.04,0.38));
        for(let j=0;j<7;j++){const x=-0.58+j*0.19,kind=(i+j)%3,c=[0xd8453a,0x5a8ae0,0x6ab84a,0xf6d04a,0x9a6ad0,0xe8866a,0x4ab8a8][(i*3+j)%7];
          if(kind===0)p.push(P(CYL8,0xe8f0f4,x,y+0.1,0.06,0,0,0,0.12,0.17,0.12),P(CYL8,c,x,y+0.2,0.06,0,0,0,0.13,0.04,0.13),P(CYL8,c,x,y+0.08,0.06,0,0,0,0.1,0.08,0.1));/* a jar of something */
          else if(kind===1)p.push(P(CYL8,c,x,y+0.08,0.06,0,0,0,0.12,0.14,0.12),P(CYL8,0xd8dce4,x,y+0.16,0.06,0,0,0,0.12,0.015,0.12));/* a tin */
          else p.push(P(BOX,c,x,y+0.1,0.08,0,0,0,0.13,0.18,0.03),P(BOX,0xfff6e8,x,y+0.12,0.096,0,0,0,0.09,0.08,0.005));/* a seed packet */}}break;}
    case'rack':{p.push(P(BOX,0x7a5230,0,0.8,0,0,0,0,0.9,1.6,0.12),P(BOX,0x6a4428,0,0.04,0.15,0,0,0,0.9,0.08,0.4));for(let i=0;i<5;i++)for(let j=0;j<5;j++){const c=[0xf39ab0,0xf6d04a,0xd8453a,0x6ab84a,0x9a8ad8,0xe8866a,0x5ab8e0][(i*5+j*2)%7];
        p.push(P(BOX,c,-0.32+j*0.16,0.4+i*0.27,0.08,-0.15,0,0,0.13,0.2,0.02),P(BOX,0xfffaf0,-0.32+j*0.16,0.43+i*0.27,0.093,-0.15,0,0,0.09,0.08,0.004),P(ICO,[0x6ab84a,0xd8453a,0xf6d04a][(i+j)%3],-0.32+j*0.16,0.43+i*0.27,0.097,0,0,0,0.04,0.04,0.004));}
      p.push(P(BOX,0xfff6e8,0,1.7,0.06,0,0,0,0.7,0.16,0.02),P(BOX,0x5aa844,0,1.7,0.075,0,0,0,0.5,0.05,0.005));break;}
    case'counter':{p.push(P(BOX,0xb8804a,0,0.45,0,0,0,0,2.2,0.9,0.6),P(BOX,0x8a5a3a,0,0.92,0,0,0,0,2.3,0.06,0.7));for(let i=0;i<5;i++)p.push(P(BOX,0xa87040,-0.88+i*0.44,0.45,0.305,0,0,0,0.04,0.8,0.01));
      /* the till, a bell, a jar of sweets, a little stack of paper bags */p.push(P(BOX,0x4a5a6a,0.55,1.07,0,-0.3,0,0,0.42,0.22,0.32),P(BOX,0x3a4450,0.55,1.18,-0.06,-0.3,0,0,0.38,0.06,0.2),P(BOX,0xd8dce4,0.5,1.12,0.12,-0.6,0,0,0.3,0.02,0.1));
      p.push(P(CYL12,0xf6d04a,-0.5,0.99,0.05,0,0,0,0.12,0.04,0.12),P(ICO2,0xf6d04a,-0.5,1.03,0.05,0,0,0,0.1,0.08,0.1),P(CYL8,0xe8f0f4,-0.85,1.06,0,0,0,0,0.18,0.24,0.18));
      for(let i=0;i<8;i++)p.push(P(ICO,[0xf39ab0,0xf6d04a,0x6ab8f0,0x9ae070][i%4],-0.85+(R()-0.5)*0.1,1.0+i*0.025,(R()-0.5)*0.1,0,0,0,0.045,0.045,0.045));
      p.push(P(BOX,0xc8a878,0.05,1.0,-0.1,0,0.2,0,0.3,0.1,0.22));break;}
    case'table':{p.push(P(BOX,0xa8744a,0,0.55,0,0,0,0,1.3,0.06,0.8));for(const [x,z] of [[-0.58,-0.33],[0.58,-0.33],[-0.58,0.33],[0.58,0.33]])p.push(P(BOX,0x7a5230,x,0.27,z,0,0,0,0.07,0.54,0.07));
      p.push(P(BOX,0xf4ead8,0,0.585,0,0,0,0,1.0,0.01,0.5));break;}
  }
  return{p,gl};}
function roomBox(p,RW,RD,wall,trim,floorA,floorB,checker){
  if(checker)for(let i=0;i<Math.round(RW/0.6);i++)for(let j=0;j<Math.round(RD/0.6);j++)p.push(P(BOX,(i+j)%2?floorA:floorB,-RW/2+0.3+i*0.6,-0.05,-RD/2+0.3+j*0.6,0,0,0,0.6,0.1,0.6));
  else for(let i=0;i<Math.round(RW/0.5);i++)p.push(P(BOX,i%2?floorA:floorB,-RW/2+0.25+i*0.5,-0.05,0,0,0,0,0.5,0.1,RD));
  p.push(P(BOX,wall,0,1.4,-RD/2-0.05,0,0,0,RW+0.2,2.8,0.1),P(BOX,wall,-RW/2-0.05,1.4,0,0,0,0,0.1,2.8,RD+0.1),P(BOX,wall,RW/2+0.05,1.4,0,0,0,0,0.1,2.8,RD+0.1));
  p.push(P(BOX,trim,0,0.08,-RD/2+0.01,0,0,0,RW,0.16,0.03),P(BOX,trim,0,2.72,-RD/2+0.01,0,0,0,RW,0.1,0.04),P(BOX,trim,-RW/2+0.01,0.08,0,0,0,0,0.03,0.16,RD),P(BOX,trim,RW/2-0.01,0.08,0,0,0,0,0.03,0.16,RD));
  p.push(P(BOX,0xd8453a,0,0.01,RD/2-0.35,0,0,0,1.0,0.02,0.45),P(BOX,0xf4f0ea,0,0.02,RD/2-0.35,0,0,0,0.8,0.02,0.25));}
function windowAt(p,x,y,RD,w=1.2){p.push(P(BOX,0xfbf8f0,x,y,-RD/2+0.02,0,0,0,w,0.9,0.04),P(BOX,0xfbf8f0,x,y,-RD/2+0.065,0,0,0,0.05,0.8,0.01),P(BOX,0xfbf8f0,x,y,-RD/2+0.065,0,0,0,w-0.1,0.05,0.01));
  return new T.Mesh(merge([P(BOX,0xffffff,x,y,-RD/2+0.05,0,0,0,w-0.12,0.78,0.01)]),roomWinMat);}

// ---- the general store ----
function buildShop(){const RW=6.4,RD=4.8,p=[],gl=[],props=[{x:0,z:RD/2-0.35,w:1.0,d:0.6,label:'exit'}],g=new T.Group();
  roomBox(p,RW,RD,0xf0e6cc,0x4f8a4a,0xc8905a,0xb8804a);
  const add=(f,x,z,ry=0)=>{p.push(...shift(f.p,x,0,z,ry));gl.push(...shift(f.gl,x,0,z,ry));};
  add(shopFurn('shelf'),-1.9,-RD/2+0.3);add(shopFurn('shelf'),-0.3,-RD/2+0.3);const win=windowAt(p,1.6,1.55,RD);
  // a hanging sign over the counter
  p.push(P(BOX,0x8a5a3a,0.3,2.25,-0.75,0,0,0,1.4,0.36,0.05),P(BOX,0xfff6e8,0.3,2.25,-0.72,0,0,0,1.28,0.26,0.01),P(BOX,0x4f8a4a,0.3,2.25,-0.715,0,0,0,0.9,0.06,0.005),P(CYL5,0x5a4a3a,-0.2,2.55,-0.75,0,0,0,0.02,0.3,0.02),P(CYL5,0x5a4a3a,0.8,2.55,-0.75,0,0,0,0.02,0.3,0.02));
  add(shopFurn('counter'),0.3,-0.9);
  const keeper=staff('otter',0xb08058,0x4f8a4a,'apron');keeper.position.set(0.3,0.3,-1.55);keeper.scale.setScalar(1.05);/* (on a step behind the counter, so she's seen over it) */p.push(P(BOX,0x8a5a3a,0.3,0.14,-1.55,0,0,0,1.0,0.28,0.6));g.add(keeper);
  add(shopFurn('rack'),RW/2-0.35,-0.6,-1.571);
  add(shopFurn('table'),-2.0,0.9);
  // decor for sale on the table, and crates of fresh produce along the right
  for(const [k,x,z,s] of [['lantern',-2.35,0.85,0.45],['flowerpot',-1.95,0.95,0.55],['gnome',-1.6,0.8,0.55]]){const o=objGroup(k,3,0.3);o.scale.setScalar(s);o.position.set(x,0.6,z);g.add(o);}
  {let i=0;for(const [k,f] of [['pcrate','g:apple'],['pbasket','g:berries'],['psack','potato|normal'],['pcrate','pumpkin|normal']]){const o=new T.Group();produceDisplay(o,k,mulberry(5+i),f);o.scale.setScalar(0.85);o.position.set(1.1+i*0.62,0,1.15-(i%2)*0.25);g.add(o);i++;}}
  p.push(P(CYL12,0xc8704a,RW/2-0.4,0.18,RD/2-0.9,0,0,0,0.36,0.36,0.36));{const q=[];for(let i=0;i<9;i++)lf(q,GREENS[i%4],0,0.36,0,i*0.7,0.8+(i%3)*0.2,0.4,0.16);p.push(...shift(q,RW/2-0.4,0,RD/2-0.9,0));}
  const counterUse=()=>setAction(`<b>Hazel</b>: “Welcome in! Anything catch your eye?”`,[{label:'Today’s deals',cls:'go',fn:()=>{clearAction();openSheet('shop','deals');}},{label:'Seeds',cls:'go',fn:()=>{clearAction();openSheet('shop','seeds');}},{label:'Decor',cls:'go',fn:()=>{clearAction();openSheet('shop','decor');}},
    {label:'Sell',cls:'go',fn:()=>{clearAction();openSheet('bag','all','trader');}},{label:'Bye!',fn:clearAction}],'General Store');
  props.push({x:0.3,z:-0.9,w:2.3,d:0.8,label:'counter',info:()=>{tone(1568,0.12,'sine',0.03);counterUse();}},
    {x:RW/2-0.35,z:-0.6,w:0.5,d:1.0,label:'seeds',info:()=>openSheet('shop','seeds')},{x:-2.0,z:0.9,w:1.3,d:0.8,label:'decor',info:()=>openSheet('shop','decor')},
    {x:-1.1,z:-RD/2+0.3,w:3.2,d:0.5,label:'shelves',info:()=>toast(pickR(['Jars of honey, pickled radish and sea salt.','Tins of everything. One just says “Mystery”.','Seed packets in every colour.']))},
    {x:2.0,z:1.0,w:2.6,d:0.8,label:'produce',info:()=>toast('Fresh from around the island.')});
  g.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}g.add(win);
  return{g,props,RW,RD,follow:true,title:'The General Store',tick:(dt,tt)=>{keeper.position.y=0.3+Math.abs(Math.sin(tt*1.6))*0.015;keeper.rotation.y=Math.sin(tt*0.4)*0.25;}};}

// ---- the harbour café ----
function buildCafe(){const RW=6.4,RD=4.8,p=[],gl=[],props=[{x:0,z:RD/2-0.35,w:1.0,d:0.6,label:'exit'}],g=new T.Group();
  roomBox(p,RW,RD,0xf6dcc8,0x2f4f7a,0xf4ecdc,0x6ab8a8,true);
  const win=windowAt(p,-1.9,1.55,RD,1.4),win2=windowAt(p,1.9,1.55,RD,1.0);
  // the long counter with an espresso machine, a glass case of pastries, cups and a tip jar
  const cz=-1.25;p.push(P(BOX,0x2f4f7a,0.4,0.5,cz,0,0,0,3.2,1.0,0.6),P(BOX,0xe8dcc8,0.4,1.02,cz,0,0,0,3.3,0.06,0.7));for(let i=0;i<8;i++)p.push(P(BOX,0x3a5f8a,-1.0+i*0.4,0.5,cz+0.305,0,0,0,0.04,0.86,0.01));
  p.push(P(BOX,0xc8ccd4,1.35,1.3,cz-0.05,0,0,0,0.7,0.5,0.4),P(BOX,0x9a9ea8,1.35,1.58,cz-0.05,0,0,0,0.74,0.06,0.44),P(CYL8,0x3a3440,1.2,1.12,cz+0.12,0,0,0,0.06,0.12,0.06),P(CYL8,0x3a3440,1.5,1.12,cz+0.12,0,0,0,0.06,0.12,0.06),P(CYL12,0xf6f2ea,1.2,1.07,cz+0.16,0,0,0,0.1,0.08,0.1));
  gl.push(P(BOX,0xff6a4a,1.2,1.42,cz+0.16,0,0,0,0.06,0.04,0.01),P(BOX,0x7af0a0,1.45,1.42,cz+0.16,0,0,0,0.06,0.04,0.01));
  // the pastry case: glass front, two shelves of buns, croissants, tarts
  p.push(P(BOX,0x2f4f7a,-0.5,1.06,cz,0,0,0,1.1,0.04,0.55));gl.push(P(BOX,0xe8f4ff,-0.5,1.3,cz+0.26,0,0,0,1.1,0.5,0.02));
  for(let s=0;s<2;s++)for(let i=0;i<5;i++){const x=-0.9+i*0.2,y=1.1+s*0.24,k=(i+s)%3;
    if(k===0)p.push(PG(SPH_LO,0xf0b860,0xc07a30,x,y+0.05,cz,0,0,0,0.15,0.09,0.13),P(SPH_XS,0xffffff,x,y+0.09,cz,0,0,0,0.08,0.02,0.07));/* a bun */
    else if(k===1)p.push(PG(SPH_LO,0xf6c870,0xc8803a,x,y+0.04,cz,0,0,0.4,0.17,0.07,0.08));/* a croissant */
    else p.push(P(CYL12,0xe8b870,x,y+0.03,cz,0,0,0,0.14,0.05,0.14),P(CYL12,[0xd8453a,0x9a6ad0][s],x,y+0.06,cz,0,0,0,0.11,0.02,0.11));/* a tart */}
  p.push(P(CYL8,0xe8f0f4,-1.1,1.12,cz+0.1,0,0,0,0.14,0.18,0.14),P(BOX,0xf6d04a,-1.1,1.1,cz+0.17,0,0,0,0.08,0.06,0.005));
  const barista=staff('cat',0xe8b878,0x2f4f7a,'apron');barista.position.set(0.5,0.3,cz-0.65);barista.scale.setScalar(1.05);p.push(P(BOX,0x2a3f62,0.4,0.14,cz-0.65,0,0,0,3.0,0.28,0.6));g.add(barista);
  // the chalkboard menu
  p.push(P(BOX,0x6a4428,0.4,2.05,-RD/2+0.04,0,0,0,1.5,0.85,0.04),P(BOX,0x2a3430,0.4,2.05,-RD/2+0.065,0,0,0,1.38,0.73,0.01));
  for(let i=0;i<4;i++)p.push(P(BOX,[0xf6f2ea,0xf6d04a,0xf39ab0,0x9ae0d0][i],0.2,2.3-i*0.15,-RD/2+0.075,0,0,0,0.7-(i%2)*0.2,0.035,0.004),P(BOX,0xf6f2ea,0.95,2.3-i*0.15,-RD/2+0.075,0,0,0,0.18,0.035,0.004));
  // pendant lamps over the counter
  for(const x of [-1.0,0.4,1.8]){p.push(P(CYL5,0x3a3440,x,2.55,cz+0.2,0,0,0,0.02,0.5,0.02),P(CONE12,0x2f4f7a,x,2.25,cz+0.2,0,0,0,0.34,0.2,0.34));gl.push(P(SPH_LO,0xfff0c0,x,2.13,cz+0.2,0,0,0,0.16,0.12,0.16));}
  // little round tables, two chairs each, a cup and a vase of flowers on each
  const tables=[[-2.0,0.4],[-0.3,1.1],[1.9,0.6]],seats=[];
  for(const [x,z] of tables){p.push(P(CYL12,0xf4ecdc,x,0.72,z,0,0,0,0.8,0.05,0.8),P(CYL8,0x2f4f7a,x,0.36,z,0,0,0,0.07,0.7,0.07),P(CYL12,0x2f4f7a,x,0.02,z,0,0,0,0.4,0.04,0.4));
    p.push(P(CYL12,0xf6f2ea,x+0.15,0.78,z+0.05,0,0,0,0.12,0.09,0.12),P(CYL12,0x6a4428,x+0.15,0.825,z+0.05,0,0,0,0.1,0.01,0.1),P(CYL8,0xe8f4ff,x-0.12,0.82,z-0.08,0,0,0,0.08,0.16,0.08),P(SPH_XS,[0xf39ab0,0xf6d04a,0xd8453a][seats.length%3],x-0.12,0.94,z-0.08,0,0,0,0.12,0.08,0.12));
    for(const s of [-1,1]){const cx=x+s*0.62,f=furn('chair',0xd86a4a);p.push(...shift(f.p,cx,0,z,s>0?-1.571:1.571));seats.push([cx,z,s>0?-1.571:1.571]);}}
  // potted palms in the corners
  for(const [x,z] of [[-RW/2+0.4,-RD/2+0.5],[RW/2-0.4,RD/2-0.8]]){p.push(P(CYL12,0xf4ecdc,x,0.22,z,0,0,0,0.42,0.44,0.42));const q=[];for(let i=0;i<10;i++)lf(q,GREENS[i%4],0,0.44,0,i*0.63,0.5+(i%3)*0.25,0.55,0.2);p.push(...shift(q,x,0,z,0));}
  // neighbours who are out and about may drop in for a cuppa
  const out=npcs.filter(n=>n.state!=='home');const sat=[];
  for(let i=0;i<Math.min(2,out.length);i++){const n=out[(S.day+i*3)%out.length];if(sat.includes(n))continue;sat.push(n);const s=seats[(i*3+1)%seats.length],w=n.g.clone(true);w.visible=true;w.position.set(s[0],0.12,s[1]);w.rotation.y=s[2];w.scale.setScalar(0.85);g.add(w);
    props.push({x:s[0],z:s[1],w:0.6,d:0.6,label:'friend',info:()=>showTalk(n,pickR([`Fancy meeting you here! The ${CAFE[0].name.toLowerCase()} is the best on the island.`,'I come here every afternoon. Don’t tell anyone.','Pull up a chair!']))});}
  props.push({x:0.4,z:cz,w:3.3,d:0.8,label:'counter',info:()=>{tone(1320,0.1,'sine',0.03);cafeMenu();}},{x:0.4,z:-RD/2+0.2,w:1.5,d:0.4,label:'menu',info:()=>toast(CAFE.map(c=>`${c.name} · ${c.cost} shells`).join(' · '))});
  for(const [x,z] of tables)props.push({x,z,w:0.9,d:0.9,label:'table',info:()=>{hearts(vil.x,1,vil.z);toast(pickR(['You sit for a moment and watch the boats come in.','The smell of fresh coffee and warm buns. Bliss.','Someone’s left half a croissant. You resist. Mostly.']));}});
  g.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}g.add(win,win2);
  return{g,props,RW,RD,follow:true,title:'The Harbour Café',tick:(dt,tt)=>{barista.position.x=0.5+Math.sin(tt*0.5)*0.6;barista.rotation.y=Math.cos(tt*0.5)>0?0.4:-0.4;}};}
