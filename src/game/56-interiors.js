/* ---- interiors: a separate little scene, entered with a fade; furnished to suit whoever lives there ---- */
const roomScene=new T.Scene();roomScene.background=new T.Color(0x2e2430);
roomScene.add(new T.HemisphereLight(0xfff4e0,0x6a5a7a,0.55));{const d=new T.DirectionalLight(0xfff0d8,0.42);d.position.set(2,6,4);roomScene.add(d);}
const ROOM_HEMI=roomScene.children.find(o=>o.isHemisphereLight),ROOM_DIR=roomScene.children.find(o=>o.isDirectionalLight);
const roomLamp=new T.PointLight(0xffd8a0,0.5,14);roomLamp.position.set(0,2.3,0.4);roomScene.add(roomLamp);
const roomCam=new T.PerspectiveCamera(40,1,NEAR,FAR);const roomWinMat=new T.MeshBasicMaterial({color:0x9fd4ff});
let inside=null;
const ROOM_STYLE={sailor:{wall:0xdce8f2,trim:0x2f4f7a,floor:[0xb8905e,0xa8804e],rug:0x2f4f7a},dreamer:{wall:0xe4dcf4,trim:0x8a7ac8,floor:[0xe8dcc8,0xdccfb8],rug:0x9a8ad8},
  tinkerer:{wall:0xe8dcc4,trim:0x8a5a2a,floor:[0x8a6040,0x7a5236],rug:0xd8903a},homebody:{wall:0xf6ecd8,trim:0xd8b088,floor:[0xd8b088,0xc8a078],rug:0x9ad0a0},
  explorer:{wall:0xdcecd8,trim:0x5a8a5a,floor:[0xc8a878,0xb89868],rug:0xd86a3a},scholar:{wall:0xe8d8c8,trim:0x6a3a3a,floor:[0x7a5236,0x6a4428],rug:0x8a3a4a},
  home:{wall:0xf6ead0,trim:0xc8905a,floor:[0xc8905a,0xb8804a],rug:0x5fae44}};
function furn(k,c){const p=[],gl=[];
  switch(k){
    case'bed':p.push(P(BOX,0x8a5a3a,0,0.18,0,0,0,0,1.0,0.36,1.6),P(BOX,0xf6f2ea,0,0.4,0.05,0,0,0,0.92,0.12,1.44),P(BOX,c,0,0.48,0.25,0,0,0,0.96,0.06,1.02),P(BOX,new T.Color(c).multiplyScalar(0.85).getHex(),0,0.49,0.25,0,0,0,0.97,0.05,0.12),P(ICO2,0xffffff,0,0.52,-0.5,0,0,0,0.62,0.14,0.3),P(BOX,0x7a4a2a,0,0.55,-0.78,0,0,0,1.02,0.72,0.08));break;
    case'table':p.push(P(CYL12,0xa8744a,0,0.55,0,0,0,0,0.9,0.06,0.9),P(CYL8,0x7a5230,0,0.27,0,0,0,0,0.1,0.54,0.1),P(CYL12,0x7a5230,0,0.02,0,0,0,0,0.44,0.04,0.44),P(CYL12,0xf4f0ea,0.12,0.6,0.05,0,0,0,0.24,0.03,0.24),P(CYL12,0xf6f2ea,-0.16,0.64,-0.1,0,0,0,0.1,0.12,0.1),P(ICO2,0xe0303a,0.12,0.64,0.05,0,0,0,0.08,0.07,0.08));break;
    case'chair':p.push(P(BOX,c,0,0.3,0,0,0,0,0.4,0.06,0.4),P(BOX,c,0,0.58,-0.18,0,0,0,0.4,0.5,0.05));for(const [x,z] of [[-0.17,-0.17],[0.17,-0.17],[-0.17,0.17],[0.17,0.17]])p.push(P(BOX,0x6a4428,x,0.14,z,0,0,0,0.05,0.28,0.05));break;
    case'lamp':p.push(P(CYL8,0x5a4a3a,0,0.62,0,0,0,0,0.05,1.2,0.05),P(CYL12,0x5a4a3a,0,0.02,0,0,0,0,0.3,0.04,0.3));gl.push(P(CONE12,0xfff0c8,0,1.28,0,0,0,0,0.44,0.34,0.44));break;
    case'shelf':p.push(P(BOX,0x8a5a3a,0,0.75,0,0,0,0,0.9,1.5,0.32));for(let i=0;i<3;i++){p.push(P(BOX,0x6a4428,0,0.3+i*0.45,0.02,0,0,0,0.82,0.03,0.3));for(let j=0;j<6;j++)p.push(P(BOX,[0xd8453a,0x5a8ae0,0x6ab84a,0xf6d04a,0x9a6ad0,0xf4f0ea][(i*2+j)%6],-0.32+j*0.12,0.42+i*0.45,0.04,0,0,j%3?0:0.12,0.09,0.22,0.22));}break;
    case'plant':p.push(P(CYL12,0xc8704a,0,0.15,0,0,0,0,0.3,0.3,0.3),P(CYL12,0x5a3a2a,0,0.3,0,0,0,0,0.26,0.02,0.26));for(let i=0;i<9;i++)lf(p,GREENS[i%4],0,0.3,0,i*0.7,0.8+(i%3)*0.2,0.34,0.14);break;
    case'tv':p.push(P(BOX,0x6a4428,0,0.22,0,0,0,0,1.0,0.44,0.44),P(BOX,0x2b2b34,0,0.7,0,0,0,0,0.9,0.56,0.12),P(BOX,0x2b2b34,0,0.47,0,0,0,0,0.2,0.08,0.1));gl.push(P(BOX,0x7ab8f0,0,0.7,0.065,0,0,0,0.8,0.46,0.01));break;
    case'beanbag':p.push(P(ICO2,c,0,0.2,0,0,0,0,0.8,0.42,0.8),P(ICO2,c,0,0.36,-0.22,0,0,0,0.62,0.4,0.36));break;
    case'armchair':p.push(P(BOX,c,0,0.25,0,0,0,0,0.8,0.3,0.7),P(BOX,c,0,0.6,-0.3,0,0,0,0.8,0.6,0.14),P(BOX,c,-0.36,0.45,0,0,0,0,0.12,0.3,0.7),P(BOX,c,0.36,0.45,0,0,0,0,0.12,0.3,0.7),P(BOX,new T.Color(c).lerp(new T.Color(0xffffff),0.3).getHex(),0,0.42,0.04,0,0,0,0.58,0.06,0.5));break;
    case'weights':p.push(P(BOX,0x5a5a6a,0,0.3,0,0,0,0,0.9,0.05,0.3));for(const x of [-0.3,0,0.3]){p.push(P(CYL8,0x8a8e98,x,0.4,0,0,0,1.57,0.03,0.3,0.03),P(CYL12,0x2b2b34,x-0.13,0.4,0,0,0,1.57,0.14,0.05,0.14),P(CYL12,0x2b2b34,x+0.13,0.4,0,0,0,1.57,0.14,0.05,0.14));}for(const x of [-0.4,0.4])p.push(P(BOX,0x5a5a6a,x,0.15,0,0,0,0,0.05,0.3,0.3));break;
    case'bag':p.push(P(CYL12,0xd8453a,0,1.0,0,0,0,0,0.36,0.8,0.36),P(CYL8,0x5a5a6a,0,1.6,0,0,0,0,0.02,0.4,0.02),P(CYL12,0x2b2b34,0,0.02,0,0,0,0,0.4,0.04,0.4));break;
    case'counter':p.push(P(BOX,0xf4f0ea,0,0.4,0,0,0,0,1.4,0.8,0.5),P(BOX,0xa8744a,0,0.82,0,0,0,0,1.44,0.05,0.54),P(BOX,0x3a3440,0.4,0.84,0,0,0,0,0.5,0.02,0.4),P(CYL12,0x5a5a6a,0.28,0.9,0,0,0,0,0.24,0.1,0.24),P(CYL12,0xd8453a,-0.35,0.9,0.05,0,0,0,0.2,0.12,0.2));for(const x of [-0.45,0,0.45])p.push(P(ICO2,0xd8b078,x,0.84,0.2,0,0,0,0.06,0.02,0.06));break;
    case'piano':p.push(P(BOX,0x1e1a22,0,0.5,0,0,0,0,1.3,0.9,0.5),P(BOX,0xf8f4ee,0,0.62,0.28,0,0,0,1.2,0.04,0.12),P(BOX,0x1e1a22,0,0.25,0.5,0,0,0,0.6,0.08,0.3));for(let i=0;i<8;i++)p.push(P(BOX,0x1e1a22,-0.5+i*0.14,0.645,0.25,0,0,0,0.05,0.02,0.07));break;
    case'stereo':p.push(P(BOX,0xf2a6c8,0,0.3,0,0,0,0,0.5,0.6,0.3),P(BOX,0xf2a6c8,-0.45,0.35,0,0,0,0,0.3,0.7,0.3),P(BOX,0xf2a6c8,0.45,0.35,0,0,0,0,0.3,0.7,0.3));for(const x of [-0.45,0.45])p.push(P(CYL12,0x2b2b34,x,0.4,0.16,1.57,0,0,0.2,0.02,0.2));gl.push(P(BOX,0x9ae0f0,0,0.45,0.16,0,0,0,0.3,0.1,0.01));break;
    case'vanity':p.push(P(BOX,0xf8f4ee,0,0.35,0,0,0,0,0.9,0.7,0.4),P(CYL12,0xf6d04a,0,1.05,-0.12,1.57,0,0,0.6,0.04,0.7));gl.push(P(CYL12,0xd8ecf4,0,1.05,-0.09,1.57,0,0,0.5,0.02,0.6));break;
    case'fireplace':p.push(P(BOX,0xa0523a,0,0.6,0,0,0,0,1.2,1.2,0.4),P(BOX,0x2b1e2e,0,0.35,0.12,0,0,0,0.6,0.5,0.2),P(BOX,0xf4f0ea,0,1.22,0.04,0,0,0,1.3,0.06,0.48));gl.push(P(CONE4,0xffa040,0,0.3,0.15,0,0.4,0,0.3,0.34,0.2),P(CONE4,0xffe070,0.05,0.26,0.18,0,0,0,0.16,0.22,0.12));break;
    case'fishtank':p.push(P(BOX,0x6a4428,0,0.3,0,0,0,0,0.9,0.6,0.4),P(BOX,0x6a4428,0,1.02,0,0,0,0,0.92,0.04,0.42));gl.push(P(BOX,0x7ac8e8,0,0.8,0,0,0,0,0.86,0.4,0.36));p.push(P(ICO2,0xf08a2a,-0.15,0.82,0.1,0,0,0,0.12,0.07,0.04),P(ICO2,0xe0303a,0.2,0.76,0.12,0,0,0,0.1,0.06,0.04));break;
    case'workbench':p.push(P(BOX,0xb8804a,0,0.5,0,0,0,0,1.2,0.08,0.6));for(const [x,z] of [[-0.52,-0.24],[0.52,-0.24],[-0.52,0.24],[0.52,0.24]])p.push(P(BOX,0x7a5230,x,0.25,z,0,0,0,0.08,0.5,0.08));
      p.push(P(BOX,0x8a8e98,-0.3,0.58,0.05,0,0.4,0,0.3,0.05,0.08),P(BOX,0x7a5230,-0.3,0.58,0.15,0,0.4,0,0.06,0.04,0.22),P(BOX,0xc8905a,0.25,0.58,0,0,0,0,0.3,0.06,0.2),P(CYL8,0x6a4428,0.3,0.12,0,0,0,0,0.04,0.2,0.04),P(BOX,0x7a5230,0,0.18,0,0,0,0,1.0,0.04,0.4));break;
    case'dresser':p.push(P(BOX,0xa8744a,0,0.45,0,0,0,0,0.9,0.9,0.45));for(let i=0;i<3;i++)p.push(P(BOX,0xc8905a,0,0.2+i*0.27,0.23,0,0,0,0.8,0.2,0.01),P(ICO2,0xf6d04a,0,0.2+i*0.27,0.24,0,0,0,0.04,0.04,0.03));p.push(P(CYL12,0xf2a6c8,0.25,0.98,0,0,0,0,0.12,0.14,0.12));break;}
  return{p,gl};}
function buildRoom(kind,n){if(kind==='shop')return buildShop();if(kind==='cafe')return buildCafe();/* 56d */if(kind==='home'||kind==='vh')return buildDiorama(kind,n);/* 56b */const st=ROOM_STYLE[kind==='home'?'home':n.pers],RW=kind==='home'?4.6+S.house*0.6:5.2,RD=4.4,p=[],gl=[];
  for(let i=0;i<Math.round(RW/0.5);i++)p.push(P(BOX,st.floor[i%2],-RW/2+0.25+i*0.5,-0.05,0,0,0,0,0.5,0.1,RD));
  p.push(P(BOX,st.wall,0,1.3,-RD/2-0.05,0,0,0,RW+0.2,2.6,0.1),P(BOX,st.wall,-RW/2-0.05,1.3,0,0,0,0,0.1,2.6,RD+0.1),P(BOX,st.wall,RW/2+0.05,1.3,0,0,0,0,0.1,2.6,RD+0.1));
  for(let i=0;i<Math.round(RW/0.4);i++)p.push(P(BOX,new T.Color(st.wall).lerp(new T.Color(0xffffff),0.25).getHex(),-RW/2+0.2+i*0.4,1.3,-RD/2+0.005,0,0,0,0.12,2.5,0.01));
  p.push(P(BOX,st.trim,0,0.08,-RD/2+0.01,0,0,0,RW,0.16,0.03),P(BOX,st.trim,0,2.55,-RD/2+0.01,0,0,0,RW,0.1,0.04),P(BOX,st.trim,-RW/2+0.01,0.08,0,0,0,0,0.03,0.16,RD),P(BOX,st.trim,RW/2-0.01,0.08,0,0,0,0,0.03,0.16,RD));
  // window with curtains, a picture, a rug and a door mat
  p.push(P(BOX,0xfbf8f0,0.9,1.5,-RD/2+0.02,0,0,0,1.0,0.8,0.04),P(BOX,0xfbf8f0,0.9,1.5,-RD/2+0.065,0,0,0,0.05,0.7,0.01),P(BOX,0xfbf8f0,0.9,1.5,-RD/2+0.065,0,0,0,0.9,0.05,0.01),P(BOX,st.rug,0.34,1.5,-RD/2+0.08,0,0,0,0.2,0.92,0.03),P(BOX,st.rug,1.46,1.5,-RD/2+0.08,0,0,0,0.2,0.92,0.03),P(BOX,st.trim,0.9,1.97,-RD/2+0.09,0,0,0,1.3,0.05,0.05));
  p.push(P(BOX,0x8a5a3a,-1.2,1.6,-RD/2+0.03,0,0,0,0.6,0.46,0.03),P(BOX,[0x9ad0f0,0xf6d04a,0xf39ab0][(kind==='home'?0:n.i)%3],-1.2,1.6,-RD/2+0.05,0,0,0,0.5,0.36,0.01),P(ICO2,0x6ab84a,-1.28,1.52,-RD/2+0.06,0,0,0,0.2,0.12,0.01));
  p.push(P(CYL12,st.rug,0,0.01,0.1,0,0,0,2.2,0.02,1.6),P(CYL12,new T.Color(st.rug).lerp(new T.Color(0xffffff),0.35).getHex(),0,0.02,0.1,0,0,0,1.5,0.02,1.0),P(BOX,0xd8453a,0,0.01,RD/2-0.35,0,0,0,0.9,0.02,0.45),P(BOX,0xf4f0ea,0,0.02,RD/2-0.35,0,0,0,0.7,0.02,0.25));
  const win=new T.Mesh(merge([P(BOX,0xffffff,0.9,1.5,-RD/2+0.05,0,0,0,0.86,0.66,0.01)]),roomWinMat);
  const props=[{x:0,z:RD/2-0.35,w:1.0,d:0.6,label:'exit'}];
  const put=(k,x,z,ry,label,c)=>{const f=furn(k,c||st.rug);p.push(...shift(f.p,x,0,z,ry));gl.push(...shift(f.gl,x,0,z,ry));props.push({x,z,w:1.0,d:1.0,label,k});};
  const L=RW/2-0.7,B=-RD/2+0.6;
  if(kind==='home'){put('bed',-L,B+0.4,0,'bed',0x5a8ae0);put('workbench',L,B,0,'workbench');put('table',0.3,0.3,0,'table');put('chair',-0.4,0.3,1.57,'chair',0xc8905a);put('lamp',-L,1.2,0,'lamp');put('plant',L,1.3,0,'plant');
    if(S.house>=2)put('fireplace',0,B-0.1,0,'fireplace');if(S.house>=1)put('fishtank',L,0.2,-1.57,'fish tank');}
  else{const P0=n.pers;put('bed',-L,B+0.4,0,'bed',st.rug);put('lamp',L,B,0,'lamp');put('table',0.4,0.4,0,'table');put('chair',-0.35,0.4,1.57,'chair',st.trim);put('plant',-L,1.4,0,'plant');
    const extra={sailor:['fishtank','armchair'],dreamer:['stereo','beanbag'],tinkerer:['workbench','shelf'],homebody:['counter','fireplace'],explorer:['bag','tv'],scholar:['shelf','piano']}[P0];
    put(extra[0],L-0.2,0.9,-1.57,extra[0],st.rug);put(extra[1],0.2,B,0,extra[1],st.rug);}
  const g=new T.Group();g.add(M(p));if(gl.length){const m=M(gl,glowMat);m.castShadow=false;g.add(m);}g.add(win);return{g,props,RW,RD};}
function enterHouse(kind,b,n){if(inside)return;$('fade').classList.add('on');SFX.ui();
  setTimeout(()=>{if(kind==='home')roomInit();/* 56c */const r=buildRoom(kind,n);roomScene.add(r.g);const pm=cloneBody(villager.children[0]);const me=new T.Group();me.add(pm);r.g.add(me);
    let who=null;if(n&&(n.state==='home'||S.hour>=21||S.hour<6.5)){who=n.g.clone(true);who.visible=true;who.position.set(0.9,0,0.2);who.rotation.y=0.4;r.g.add(who);}
    inside={kind,b,n,room:r,me,who,wl:who?limbsOf(who):null,ml:null,x:0,y:0,lv:0,tlv:0,path:null,z:r.RD/2-0.8,tx:0,tz:r.RD/2-0.8,face:Math.PI,title:r.title||(kind==='home'?'Your '+HOUSES[S.house].toLowerCase():n.name+'’s house')};
    if(kind==='home')syncRoomItems();
    ctxSig='';updateCtx();updateHUD();$('fade').classList.remove('on');
    if(kind==='shop')setTimeout(()=>toast('Hazel: “Welcome to the General Store! Come to the counter whenever you’re ready.”','',ICON.shop),350);
    if(kind==='cafe')setTimeout(()=>toast('The smell of fresh coffee and warm buns. Order at the counter.','',ICON.shop),350);
    if(kind==='vh'&&!who)toast(`${n.name} is out. You peek around the cosy ${n.pers==='scholar'?'study':n.pers==='tinkerer'?'workshop':'room'}.`);
    else if(who)setTimeout(()=>showTalk(n,`Oh! Welcome to my home! Make yourself comfortable.`),350);},450);}
function leaveHouse(){if(!inside)return;if(deco)decoClose();roomScene.background.setHex(0x2e2430);$('fade').classList.add('on');SFX.ui();clearAction();
  setTimeout(()=>{roomScene.remove(inside.room.g);for(const c of inside.room.g.children)if(c.isMesh)c.geometry.dispose();inside=null;ctxSig='';updateCtx();updateHUD();$('fade').classList.remove('on');},420);}
function roomPoint(cx,cy,y0=0){ndc.set(cx/window.innerWidth*2-1,-(cy/window.innerHeight)*2+1);ray.setFromCamera(ndc,roomCam);let y=y0,pt=null;
  for(let i=0;i<5;i++){_plane.constant=-y;if(!ray.ray.intersectPlane(_plane,_hit))return null;pt=_hit.clone();y=y0-curveDropFor(roomCam,pt.x,pt.z);}return pt;}
function roomTap(cx,cy){const I=inside;if(deco){decoTap(cx,cy);return;}if(I.who&&I.n){_pv.set(I.who.position.x,0.5-curveDropFor(roomCam,I.who.position.x,I.who.position.z),I.who.position.z).project(roomCam);
    const sx=(_pv.x+1)/2*window.innerWidth,sy=(1-_pv.y)/2*window.innerHeight;if(Math.hypot(sx-cx,sy-cy)<55){if(I.room.dio)dioRoute(I,0,I.who.position.x,I.who.position.z+0.7);else{I.tx=I.who.position.x;I.tz=I.who.position.z+0.7;}setTimeout(()=>showTalk(I.n,npcLine(I.n)),0);return;}}
  if(I.room.dio){const R=I.room,D=R.dio,pxu=window.innerHeight/(2*Math.tan(roomCam.fov*Math.PI/360)*roomCam.position.length());let pr=null,bd=1e9;
    for(const q of R.props){_pv.set(q.x,q.y-curveDropFor(roomCam,q.x,q.z),q.z).project(roomCam);const d=Math.hypot((_pv.x+1)/2*window.innerWidth-cx,(1-_pv.y)/2*window.innerHeight-cy);if(d<bd){bd=d;pr=q;}}
    if(pr&&bd<Math.max(26,pxu*0.62)){if(pr.label==='exit'){leaveHouse();return;}
      if(pr.lv)dioRoute(I,1,pr.x,pr.z+0.75);else{const r=Math.hypot(pr.x,pr.z)||1;dioRoute(I,0,pr.x-pr.x/r*0.85,pr.z-pr.z/r*0.85);}roomUse(pr,I);return;}
    const up=roomPoint(cx,cy,D.LY);if(up&&up.z<D.ZL&&Math.hypot(up.x,up.z)<D.R){dioRoute(I,1,up.x,up.z);return;}
    const pt=roomPoint(cx,cy,0);if(pt)dioRoute(I,0,pt.x,pt.z);return;}
  const pt=roomPoint(cx,cy);if(!pt)return;const R=I.room;
  const pr=R.props.find(q=>Math.abs(pt.x-q.x)<q.w/2+0.1&&Math.abs(pt.z-q.z)<q.d/2+0.1);
  if(pr&&pr.label==='exit'){leaveHouse();return;}
  if(pr&&pr.info){I.tx=clamp(pr.x+(pr.x<-1?1:pr.x>1?-1:0)*(pr.w/2+0.35),-R.RW/2+0.35,R.RW/2-0.35);I.tz=clamp(pr.z+(Math.abs(pr.x)>1?0:pr.d/2+0.4),-R.RD/2+0.4,R.RD/2-0.3);setTimeout(pr.info,0);return;}
  I.tx=clamp(pt.x,-R.RW/2+0.35,R.RW/2-0.35);I.tz=clamp(pt.z,-R.RD/2+0.4,R.RD/2-0.3);
  if(pr){I.tx=clamp(pr.x+(pr.x<0?0.8:-0.8)*(Math.abs(pr.x)>1?1:0),-R.RW/2+0.35,R.RW/2-0.35);I.tz=clamp(pr.z+(Math.abs(pr.x)>1?0:0.8),-R.RD/2+0.4,R.RD/2-0.3);
    roomUse(pr,I);}}
// what tapping a piece of furniture does
function roomUse(pr,I){{
    if(pr.k==='workbench'){setTimeout(()=>openSheet('craft'),250);}
    else if(pr.k==='bed'&&I.kind==='home'){if(S.hour>=19||S.hour<5)setTimeout(()=>setAction('Snuggle in and sleep until morning?',[{label:'Sleep',cls:'go',fn:sleep},{label:'Not yet',fn:clearAction}],'Bed'),0);else toast('Not sleepy yet. Come back after 7 pm.');}
    else{const T0={bed:'A cosy bed with a patchwork quilt.',table:'Tea for two, and a shiny red apple.',lamp:'It glows warmly.',plant:'Lovingly watered.',tv:'It’s showing a documentary about deep-sea lanternfish.',beanbag:'Squishy. Dangerously comfy.',
      armchair:'A well-worn favourite.',shelf:'Books, books and more books.',weights:'Heavy! Very heavy.',bag:'Thwump!',counter:'Something smells delicious.',piano:'You play a little tune. ♪',stereo:'An old sea shanty crackles from the speakers.',
      vanity:'You look fabulous.',fireplace:'Crackle, crackle.',fishtank:'Two little fish wave hello.',dresser:'Full of neatly folded clothes.',chair:'A sturdy chair.',sofa:'You sink right in.',dresser:'Neatly folded jumpers.',fridge:'Leftover pumpkin pie. Tempting.',stove:'Something’s simmering.',bathtub:'Bubbles! A rubber duck bobs past.',
      bookstack:'You were going to read these.',candles:'They smell of vanilla.',teddy:'Soft, and a little worn from hugs.',catbed:'The cat opens one eye, then purrs.',globe:'You spin it and point: there. One day.',
      telescope:'You spot a far island… and a gull looking back.',easel:'A painting of your island, half finished.',guitar:'You strum a chord. ♪',clock:'Tick… tock…',lavalamp:'Blobs rise and fall. Mesmerising.',
      drums:'Ba-dum-tss!',arcade:'You play a round of Coral Blaster. High score!',jukebox:'The jukebox drops a record: a sea shanty!',discoball:'Party time!',throne:'You feel very important.',lantern:'It glows softly.',gnome:'He’s guarding the room.',flowerpot:'Cheerful blooms.'};
      toast(T0[pr.k]||'Nice!');if(pr.k==='piano'||pr.k==='guitar'||pr.k==='jukebox'||pr.k==='arcade'||pr.k==='discoball'){const nt=pr.k==='arcade'?[880,988,1175,1568]:pr.k==='discoball'?[523,659,784,1047,784,1047]:[523,659,784];nt.forEach((f,i)=>setTimeout(()=>tone(f,0.18,pr.k==='arcade'?'square':'triangle',0.04),i*170));}
      if(pr.k==='drums'){tone(110,0.12,'sine',0.08);setTimeout(()=>tone(160,0.1,'sine',0.06),150);setTimeout(()=>tone(2400,0.25,'square',0.015),300);}
      if(pr.k&&pr.k.startsWith('pot_'))toast(((RI[pr.k]||{}).n||'A plant')+'. Lovingly watered.');}}}
function updateRoom(dt,tt){const I=inside;if(!I)return;let walking=false,climb=false;
  if(I.path){const w=I.path[0],dx=w[0]-I.x,dy=w[1]-I.y,dz=w[2]-I.z,d=Math.hypot(dx,dy,dz);climb=Math.abs(dy)>0.02;
    if(d<0.03){I.path.shift();I.lv=w[1]>0.1?1:0;if(!I.path.length){I.path=null;I.lv=I.tlv;}}
    else{const sp=Math.min(d,dt*(climb?1.7:2.6));I.x+=dx/d*sp;I.y+=dy/d*sp;I.z+=dz/d*sp;walking=true;I.face=climb?Math.PI:Math.atan2(dx,dz);}
    I.tx=I.x;I.tz=I.z;}
  else{const dx=I.tx-I.x,dz=I.tz-I.z,d=Math.hypot(dx,dz);walking=d>0.04;if(walking){const sp=Math.min(d,dt*2.6);I.x+=dx/d*sp;I.z+=dz/d*sp;I.face=Math.atan2(dx,dz);}}
  {const an=I.me.children[0]&&I.me.children[0].userData.anim;if(an)an.update(dt,walking?(climb?1.7:2.6):0,false);/* a character walks on its own clip */
  I.me.position.set(I.x,(I.y||0)+(walking&&!an?Math.abs(Math.sin(tt*(climb?9:14)))*0.06:0),I.z);}I.me.rotation.y+=angDiff(I.me.rotation.y,I.face)*Math.min(1,dt*8);
  if(I.who){I.who.rotation.y+=angDiff(I.who.rotation.y,Math.atan2(I.x-I.who.position.x,I.z-I.who.position.z))*Math.min(1,dt*3);I.who.position.y=Math.sin(tt*2)*0.01;}
  roomCam.aspect=camera.aspect;roomCam.fov=I.room.fov||40;
  // a room's own light (cosy rooms are lit low and warm, mostly by their lamps) and, if it has one, its own camera
  {const L=I.room.light;ROOM_HEMI.intensity=L?L[0]:0.55;ROOM_DIR.intensity=L?L[1]:0.42;ROOM_HEMI.color.setHex(L&&L[2]||0xfff4e0);ROOM_HEMI.groundColor.setHex(L&&L[3]||0x6a5a7a);}
  if(I.room.cam)I.room.cam(I,dt);else if(I.room.follow){/* big rooms: the camera follows you, staying close so the world curve stays gentle */const cx=clamp(I.x,-I.room.RW/2+3,I.room.RW/2-3),cz=clamp(I.z,-I.room.RD/2+2.2,I.room.RD/2-2.2);I.cx=I.cx===undefined?cx:lerp(I.cx,cx,Math.min(1,dt*3));I.cz=I.cz===undefined?cz:lerp(I.cz,cz,Math.min(1,dt*3));const k=camera.aspect<0.8?1.55:1;/* stand further back on a tall phone */roomCam.position.set(I.cx,7.2*k,I.cz+6.8*k);roomCam.lookAt(I.cx,0.4,I.cz-0.9);}
  else if(I.room.dio){fitRoomCam(I.room.dio);roomScene.background.copy(skyZen).lerp(skyHz,0.45).lerp(_c.set(0x1a1830),nightF*0.55);}
  else{roomCam.position.set(0,6.2,I.room.RD/2+4.6);roomCam.lookAt(0,0.4,-0.2);}roomCam.updateProjectionMatrix();if(I.room.tick)I.room.tick(dt,tt);if(I.kind==='home')decoTick(dt,tt);
  roomWinMat.color.setHex(nightF>0.5?0x2a3a6a:S.rain?0x9aa8b8:S.hour<7||S.hour>18?0xf4b890:0x9fd4ff);roomLamp.intensity=0.25+nightF*0.5;}
function townTap(f,x,z){const b=TOWN.bld.find(q=>x>=q.x&&x<=q.x+1&&z>=q.z&&z<=q.z+1);
  if(f==='shop'){goTo(b.door[0]+0.5,b.door[1]+0.6,()=>enterHouse('shop',b));return true;}
  if(f==='lodge'){lodgeTap(b);return true;}
  if(f==='cafe'){goTo(b.door[0]+0.5,b.door[1]+0.6,()=>enterHouse('cafe',b));return true;}
  if(f==='lighthouse'){walkTo(x,z+1);toast('The old lighthouse. At night its beam sweeps the sea, so you can always find your way home.','',ICON.boat);return true;}
  if(f==='hall'){walkTo(b.door[0]+0.5,b.door[1]);openSheet('orders');return true;}
  if(f==='vh'){const n=npcs.find(q=>q.b===b);if(!n)return true;goTo(b.door[0]+0.5,b.door[1]+0.2,()=>enterHouse('vh',b,n));return true;}
  if(f==='board'){walkTo(x,z+1);boardNews();return true;}
  if(f==='plot'){walkTo(b.door[0]+0.5,b.door[1]);plotTap(b);return true;}
  if(f==='tree'){walkTo(x,z+1);const nx=nextUnlock();toast(S.scratch?`<b>${TOWN.name}'s Island Heart</b>, level ${level()}. It grows as you farm, fish, catch bugs, decorate and restore other islands.${nx?` Next at level ${nx.lv}: <b>${nx.name.toLowerCase()}</b>.`:' It is fully grown!'}`:`The ${TOWN.name} town tree. Villagers say it's older than the island itself.`,'',ICON.sprout);return true;}
  if(f==='decor'){if(TOWN.res.has(K(x,z))){gatherRes(x,z);return true;}goTo(x,z);return true;}
  return false;}
function gatherRes(x,z){const k=K(x,z),t=TOWN.res.get(k),sh=S.shook[k]||{d:0,n:0};if(sh.d!==S.day){sh.d=S.day;sh.n=0;}S.shook[k]=sh;walkTo(x,z);vil.hop=0.2;const y=topY(x,z);
  if(t==='tree'){noise(0.25,0.05,1400);burst(x,y+1.4,z,0x6ab84a,12,1.2,0.07,3);
    if(sh.n>=1){toast('Only leaves fall now. Try again tomorrow.');return;}sh.n++;const r=Math.random();
    if(r<0.6){const n=1+(Math.random()<0.35?1:0);gain('m:wood',n);floatText(x,y+1.2,z,'+'+n+' Wood','gold');SFX.pop();}
    else if(r<0.72){const n=40+Math.floor(Math.random()*90);S.shells+=n;floatText(x,y+1.2,z,'+'+n+' shells!','gold');SFX.coin();}
    else if(r<0.8){gain('m:fiber',2);floatText(x,y+1.2,z,'+2 Fiber','gold');SFX.pop();}
    else toast('Rustle rustle… nothing fell out.');}
  else{if(sh.n>=3){toast('That rock is all chipped out for today.');return;}sh.n++;tone(200,0.06,'square',0.05);noise(0.05,0.05,2600);burst(x,y+0.3,z,0xb8b4ac,8,1.2,0.06);
    const n=Math.random()<0.3?2:1;gain('m:stone',n);floatText(x,y+0.9,z,'+'+n+' Stone','gold');if(sh.n===3&&Math.random()<0.2){S.shells+=60;floatText(x,y+1.3,z,'+60 shells (an old coin!)','gold');}}
  addXP(1);updateHUD();}
function boardNews(){const w=npcs.map(n=>{const d=S.npc[n.i]||{};return d.wish&&!d.wish.done&&d.wish.day===S.day?`${n.name} wants ${nameOf(d.wish.k)}`:null;}).filter(Boolean);
  setAction(`<b>${TOWN.name} Bulletin</b><br>Market: <b>${CROPS[S.demand].name}</b> sells for 1.5× today. ${S.rain?'Rain today — crops are watered.':'Sunny skies — water your crops!'}${w.length?'<br>'+w.join(' · '):''}`,[{label:'Close',fn:clearAction}],'Notice Board');}


/* ---- the harbour café: a drink gives a small boost for the rest of the day ---- */
const CAFE=[{k:'tail',name:'Tailwind cocoa',cost:60,desc:'walk and sail faster for the rest of the day'},{k:'friend',name:'Friendship blend',cost:40,desc:'villagers warm up to you twice as fast today'}];
const buffOn=k=>S.buff&&S.buff[k]===S.day;
function cafeMenu(){setAction(`<b>The Harbour Café</b><br>${CAFE.map(c=>`${c.name} · ${c.cost} shells — ${c.desc}${buffOn(c.k)?' <b>(enjoying it)</b>':''}`).join('<br>')}`,
  [...CAFE.map(c=>({label:c.name.split(' ')[0],cls:'go',disabled:buffOn(c.k)||S.shells<c.cost,fn:()=>{S.shells-=c.cost;S.buff=S.buff||{};S.buff[c.k]=S.day;clearAction();SFX.coin();hearts(vil.x,1.1,vil.z);toast(`You sip your ${c.name.toLowerCase()}. Lovely!`,'',ICON.shop);updateHUD();}})),{label:'Bye',fn:clearAction}],'Café');}
