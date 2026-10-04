/* =========================================================
   Produce displays: a slatted wooden crate, a woven basket and a burlap sack, crafted at the Workbench and placed like
   any decor, then filled with something from your bag: a harvested crop, fruit, berries, mushrooms, acorns or shells,
   a bunch of flowers, even a fish. Whatever you put in is heaped up in it (the item's own model, a few of them piled
   in the mouth), so a row of them makes a market stall, a pantry or a harvest festival. Tap one to fill it, swap what's
   in it, or take it back out (o.fill on the placed object; one of the item is kept in it).
   ========================================================= */
Object.assign(BUILD,{
  pcrate:{name:'Produce Crate',cost:0,lvl:1,multi:true,rot:true,craft:true,desc:'A slatted wooden crate. Tap it to fill it with something you grew or found.'},
  pbasket:{name:'Woven Basket',cost:0,lvl:1,multi:true,rot:true,craft:true,desc:'A round basket of woven straw. Tap it to fill it.'},
  psack:{name:'Burlap Sack',cost:0,lvl:1,multi:true,rot:true,craft:true,desc:'A rough sack with its top rolled down. Tap it to fill it.'}});
const DISPLAYS=new Set(['pcrate','pbasket','psack']);
Object.assign(OBJ_H,{pcrate:0.5,pbasket:0.5,psack:0.6});
RECIPES.push({out:['b','pcrate',1],in:{'m:wood':4},lvl:1},{out:['b','pbasket',1],in:{'m:fiber':6},lvl:1},{out:['b','psack',1],in:{'m:fiber':4},lvl:1});

// what can go in one: crops (harvested 'id|variety' or seeds 'c:id'), finds, wild plants, fish
const displayable=k=>k.includes('|')||/^(g|p|f):/.test(k);
// the thing itself, as a model
function itemObj(k,seed){
  if(k.includes('|')||k.startsWith('c:')){const id=k.replace(/^c:/,'').split('|')[0];if(!CROPS[id])return null;const q=cropParts(id,3,seed);return M(q.fruit.length?q.fruit:q.leaf);}
  const id=k.slice(2);
  if(k.startsWith('g:'))return FINDS[id]?findGroup(id,0):null;
  if(k.startsWith('p:'))return PLANTS[id]?plantGroup(id,seed):null;
  if(k.startsWith('f:'))return FISH[id]?fishModel(FISH[id]):null;return null;}
// scale an object to fit a w × h × w box, its base at y=0 and centred
function fitObj(o,w,h){const b=new T.Box3().setFromObject(o),s=new T.Vector3();b.getSize(s);const k=Math.min(w/Math.max(s.x,1e-3),w/Math.max(s.z,1e-3),h/Math.max(s.y,1e-3));
  const c=new T.Vector3();b.getCenter(c);const g=new T.Group();o.position.set(-c.x,-b.min.y,-c.z);g.add(o);g.scale.setScalar(k);return g;}
// the containers: [parts, inner radius, fill height]
function containerParts(kind){const p=[];
  if(kind==='pcrate'){const W=0.78,H=0.42,wd=0xb07a48,dk=0x7a5030,lt=0xc89060;
    p.push(P(BOX,dk,0,0.03,0,0,0,0,W-0.04,0.04,W-0.04));
    for(const [sx,sz,ry] of [[0,1,0],[0,-1,0],[1,0,1.571],[-1,0,1.571]])for(const y of [0.1,0.27,0.4]){const c=y===0.27?lt:wd;p.push(P(BOX,c,sx*(W/2-0.02),y,sz*(W/2-0.02),0,ry,0,W,0.11,0.035));}
    for(const [a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]])p.push(P(BOX,dk,a*(W/2-0.03),H/2,b*(W/2-0.03),0,0,0,0.06,H+0.02,0.06));
    return[p,W/2-0.06,0.36];}
  if(kind==='pbasket'){const R=0.36,H=0.42;
    for(let i=0;i<7;i++){const y=0.03+i*0.058,r=R*(0.82+0.18*Math.min(1,i/3));p.push(PG(CYL12,i%2?0xd8b070:0xc09650,i%2?0xc09650:0xa87e40,0,y,0,0,0,0,r*2,0.06,r*2));}
    for(let i=0;i<22;i++){const a=i/22*6.283;p.push(PG(SPH_LO,0xc8a058,0xa07a3c,Math.cos(a)*(R+0.01),H+0.01,Math.sin(a)*(R+0.01),0,-a,0,0.09,0.06,0.13));}/* a plaited rim */for(let i=0;i<14;i++){const a=i/14*6.283;p.push(P(BOX,0xa07a3c,Math.cos(a)*R*0.98,H*0.5,Math.sin(a)*R*0.98,0,-a,0,0.02,H,0.025));}
    return[p,R-0.04,0.44];}
  /* the sack: a plump bag, its top rolled down into a thick cuff */
  p.push(PG(SPH_LO,0xd2b48a,0xa88a62,0,0.27,0,0,0,0,0.72,0.56,0.68));for(let i=0;i<18;i++){const a=i/18*6.283;p.push(PG(SPH_LO,0xc8a878,0xa88a62,Math.cos(a)*0.28,0.52,Math.sin(a)*0.28,0,-a,0,0.13,0.12,0.16));}/* the rolled-down cuff */
  for(const [x,z] of [[0.18,0.2],[-0.2,0.12],[0.05,-0.24]])p.push(P(SPH_XS,0xb89a70,x,0.18,z,0,0,0,0.12,0.1,0.12));
  return[p,0.25,0.57];}
function produceDisplay(g,kind,R,fillAs){const [parts,ir,fy]=containerParts(kind);g.add(M(parts));
  let o=null;if(objCtx)o=S.objs.find(q=>q.x===objCtx.x&&q.z===objCtx.z&&q.k===kind);
  const fill=fillAs!==undefined?fillAs:o?o.fill:({pcrate:'g:apple',pbasket:'g:berries',psack:'g:acorn'})[kind];/* (a sample in the shop thumbnail) */
  // the dark of its inside, raised as it fills
  g.add(M([P(CYL12,0x4a3424,0,fill?fy-0.02:0.08,0,0,0,0,ir*2,0.02,ir*2)]));
  if(!fill)return;
  const base=itemObj(fill,7);if(!base)return;
  if(fill.startsWith('p:')){/* flowers stand up in a bunch */for(let i=0;i<3;i++){const b=fitObj(i?base.clone():base,ir*1.3,0.55);const a=i*2.1;b.position.set(Math.cos(a)*ir*0.35,fy-0.06,Math.sin(a)*ir*0.35);b.rotation.y=a;g.add(b);}return;}
  if(fill.startsWith('f:')){/* fish lie side by side */for(let i=0;i<3;i++){const b=fitObj(i?base.clone():base,ir*1.5,0.16);b.position.set((i-1)*ir*0.55,fy-0.04+(i===1?0.05:0),0);b.rotation.y=Math.PI/2+(i-1)*0.15;g.add(b);}return;}
  // a heap: a ring of them in the mouth, a couple more on top
  const spots=[[0,0,0],[0.55,0,0.3],[-0.5,0.1,0.2],[0.1,0.55,-0.4],[-0.15,-0.55,0.1],[0.5,-0.45,0.5],[0,0.05,0.75],[0.25,0.2,0.85]];
  const piece=ir*1.1;
  spots.forEach(([x,z,y],i)=>{const b=fitObj(i?base.clone():base,piece,piece*0.9);b.position.set(x*ir*0.8,fy-0.06+y*piece*0.55,z*ir*0.8);b.rotation.y=R()*6.283;g.add(b);});}

// tap a placed one: pick what goes in it
function displayTap(o){const B=BUILD[o.k],ks=Object.keys(S.inv).filter(k=>S.inv[k]>0&&displayable(k)).sort((a,b)=>S.inv[b]-S.inv[a]).slice(0,6);
  const btns=ks.map(k=>({label:nameOf(k).replace(/^(.{12}).+$/,'$1…'),cls:'go',fn:()=>fillDisplay(o,k)}));
  if(o.fill)btns.push({label:'Take it out',fn:()=>fillDisplay(o,null)});btns.push({label:'Close',fn:clearAction});
  setAction(`<b>${B.name}</b>${o.fill?` · holding <b>${nameOf(o.fill)}</b>`:''}<br>${ks.length?'Fill it with:':'Grow, forage or catch something to show off in it.'}`,btns,'Display');}
function fillDisplay(o,k){if(o.fill){S.inv[o.fill]=(S.inv[o.fill]||0)+1;}o.fill=null;
  if(k&&S.inv[k]>0){S.inv[k]--;if(!S.inv[k])delete S.inv[k];o.fill=k;}
  clearAction();syncObjs();SFX.pop();for(let i=0;i<5;i++)sparkle(o.x,topY(o.x,o.z)+0.6,o.z,0xfff0c0);save();
  if(k)toast(`Filled the ${BUILD[o.k].name.toLowerCase()} with ${nameOf(k)}.`,'',iconOf(k));}
