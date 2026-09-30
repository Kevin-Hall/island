/* =========================================================
   Floors: paving, decking and paths you lay tile by tile. A floor is its own layer under the decor (BUILD[k].floor),
   so a tile can carry a floor AND a piece of furniture on top: a bench on the brick, a parasol on the decking.
   Each floor is one flat slab with a painted, seamless texture (so neighbouring tiles join up into one surface and the
   pattern softens into an even colour from far away, with mipmaps), and syncObjs draws every tile of a kind as one
   instanced mesh: a whole plaza is a single draw call.
   ========================================================= */
const isFloor=k=>!!(BUILD[k]&&BUILD[k].floor);
const FLOOR_GEO=new T.BoxGeometry(1,0.05,1);
// the painters: each draws one 128px tile that repeats seamlessly (shapes crossing an edge are drawn again on the far side)
function floorPaint(kind){const S0=128,cv=document.createElement('canvas');cv.width=cv.height=S0;const c=cv.getContext('2d'),R=mulberry(kind.length*977+kind.charCodeAt(0));
  const wrap=(fn)=>{for(const ox of [-S0,0,S0])for(const oy of [-S0,0,S0]){c.save();c.translate(ox,oy);fn();c.restore();}};
  const pick=a=>a[Math.floor(R()*a.length)];
  const blob=(x,y,rx,ry,col,rot=0)=>wrap(()=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,6.283);c.fill();});
  const shade=(x,y,w,h,col,lip='rgba(255,255,255,0.12)',dark='rgba(0,0,0,0.14)')=>{c.fillStyle=col;c.fillRect(x,y,w,h);c.fillStyle=lip;c.fillRect(x,y,w,2);c.fillStyle=dark;c.fillRect(x,y+h-2,w,2);};
  const speck=(n,cols,a=0.25)=>{c.globalAlpha=a;for(let i=0;i<n;i++){c.fillStyle=pick(cols);c.fillRect(R()*S0,R()*S0,1+R()*2,1+R()*2);}c.globalAlpha=1;};
  switch(kind){
    case'brick':{// soft, weathered red brick in a running bond
      c.fillStyle='#857663';c.fillRect(0,0,S0,S0);const bc=['#86533f','#7c4c3b','#8e5c47','#80523f','#764838'];
      for(let r=0;r<4;r++){const y=r*32,off=r%2?32:0;for(let i=-1;i<3;i++){const x=i*64+off;wrap(()=>shade(x+2,y+2,60,28,pick(bc)));}}speck(260,['#5a3a2a','#c89a80','#6a4a3a']);break;}
    case'cobble':{// grey cobblestones set in dark joints
      c.fillStyle='#57534e';c.fillRect(0,0,S0,S0);const sc=['#8e8a84','#9a968e','#817d78','#a4a09a','#8a867e'];
      for(let r=0;r<5;r++)for(let i=0;i<5;i++){const x=i*25.6+(r%2?12.8:0)+(R()-0.5)*4,y=r*25.6+12.8+(R()-0.5)*4;blob(x,y,10.5+R()*1.5,10+R()*1.5,pick(sc),R()*3);}
      speck(200,['#3e3a36','#c0bcb4']);break;}
    case'mossy':{// old cobbles with moss creeping between them
      c.fillStyle='#4a5a3a';c.fillRect(0,0,S0,S0);const sc=['#8a8a7e','#949486','#7e8074','#9c9c8e'];
      for(let r=0;r<5;r++)for(let i=0;i<5;i++){const x=i*25.6+(r%2?12.8:0)+(R()-0.5)*5,y=r*25.6+12.8+(R()-0.5)*5;blob(x,y,10+R()*2,9+R()*2,pick(sc),R()*3);}
      for(let i=0;i<14;i++)blob(R()*S0,R()*S0,4+R()*8,3+R()*6,pick(['#5f8a3a','#6e9a44','#557e34']),R()*3);speck(240,['#3a4a2a','#b0b8a0']);break;}
    case'flagstone':{// big warm stone slabs, a little uneven
      c.fillStyle='#7e7466';c.fillRect(0,0,S0,S0);const sc=['#ad9f86','#a2957c','#b4a78e','#9c8f78'];
      const slabs=[[0,0,70,56],[70,0,58,40],[70,40,58,48],[0,56,50,72],[50,56,20,32],[50,88,78,40],[70,88,0,0]];
      for(const [x,y,w,h] of slabs)if(w)wrap(()=>shade(x+2,y+2,w-4,h-4,pick(sc),'rgba(255,255,255,0.1)','rgba(0,0,0,0.1)'));speck(300,['#8a7e6a','#e0d6c0']);break;}
    case'terracotta':{// square clay tiles with pale grout
      c.fillStyle='#d2bea0';c.fillRect(0,0,S0,S0);const tc=['#a8674a','#a06046','#ae6f51','#9a5a42'];
      for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=i*64+2,y=j*64+2;shade(x,y,60,60,pick(tc));c.fillStyle='rgba(255,220,190,0.08)';c.fillRect(x+8,y+8,44,44);}speck(160,['#7a4430','#e0a080']);break;}
    case'gravel':{// a raked gravel path
      c.fillStyle='#9a8f7a';c.fillRect(0,0,S0,S0);c.globalAlpha=0.9;for(let i=0;i<900;i++){c.fillStyle=pick(['#857a66','#ada18a','#776f60','#b8ad96','#8c8170']);const s=1.5+R()*2.5;c.fillRect(R()*S0,R()*S0,s,s);}c.globalAlpha=1;break;}
    case'deck':{// wooden boards with dark gaps, grain and nails
      const wc=['#a87a4c','#b08252','#9e7246','#b48a5a','#a47648'];for(let i=0;i<5;i++){const x=i*25.6;c.fillStyle=pick(wc);c.fillRect(x,0,25.6,S0);c.fillStyle='rgba(0,0,0,0.25)';c.fillRect(x,0,1.5,S0);
        c.globalAlpha=0.18;c.fillStyle='#5a3a20';for(let g=0;g<3;g++)c.fillRect(x+5+R()*16,0,1,S0);c.globalAlpha=1;c.fillStyle='#4a3424';for(const y of [8,72])c.fillRect(x+11,y,3,3);}
      c.fillStyle='rgba(0,0,0,0.22)';c.fillRect(0,S0*0.62,S0,1.5);break;}
    case'marble':{// a checkerboard of cream and slate marble
      for(let i=0;i<2;i++)for(let j=0;j<2;j++){c.fillStyle=(i+j)%2?'#666a72':'#d4cec0';c.fillRect(i*64,j*64,64,64);}
      c.globalAlpha=0.25;c.strokeStyle='#9a968e';c.lineWidth=1;for(let v=0;v<6;v++){c.beginPath();let x=R()*S0,y=R()*S0;c.moveTo(x,y);for(let s=0;s<6;s++){x+=(R()-0.3)*18;y+=(R()-0.5)*18;c.lineTo(x,y);}c.stroke();}c.globalAlpha=1;
      c.fillStyle='rgba(0,0,0,0.12)';c.fillRect(0,63,S0,2);c.fillRect(63,0,2,S0);c.fillRect(0,0,S0,1);c.fillRect(0,0,1,S0);break;}
    case'hextile':{// blue and white garden tiles, a little flower on each
      c.fillStyle='#c8ccc4';c.fillRect(0,0,S0,S0);for(let i=0;i<2;i++)for(let j=0;j<2;j++){const x=i*64+2,y=j*64+2;c.fillStyle='#dcdfd6';c.fillRect(x,y,60,60);const cx=x+30,cy=y+30;
        c.fillStyle='#5a82b4';for(let k=0;k<4;k++){const a=k*Math.PI/2;c.beginPath();c.ellipse(cx+Math.cos(a)*11,cy+Math.sin(a)*11,9,5,a,0,6.283);c.fill();}c.fillStyle='#e8b44a';c.beginPath();c.arc(cx,cy,4,0,6.283);c.fill();
        c.fillStyle='#5a82b4';for(const [dx,dy] of [[0,0],[60,0],[0,60],[60,60]]){c.beginPath();c.arc(x+dx,y+dy,7,0,6.283);c.fill();}}break;}
    case'stonepath':{// stepping stones on the grass (the rest of the tile is see-through)
      c.clearRect(0,0,S0,S0);const sc=['#9a968e','#8a867e','#aaa69e'];
      for(const [x,y,r] of [[40,38,24],[90,44,20],[34,94,20],[84,96,24]]){c.fillStyle='rgba(0,0,0,0.25)';c.beginPath();c.ellipse(x+2,y+3,r,r*0.8,0.3,0,6.283);c.fill();c.fillStyle=pick(sc);c.beginPath();c.ellipse(x,y,r,r*0.8,0.3,0,6.283);c.fill();
        c.fillStyle='rgba(255,255,255,0.14)';c.beginPath();c.ellipse(x-4,y-4,r*0.6,r*0.4,0.3,0,6.283);c.fill();}break;}
  }
  const tx=new T.CanvasTexture(cv);tx.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());tx.magFilter=T.NearestFilter;tx.minFilter=T.LinearMipmapLinearFilter;return tx;}
const FLOOR_MAT={};
function floorMat(kind){if(!FLOOR_MAT[kind]){const see=kind==='stonepath';FLOOR_MAT[kind]=toon({map:floorPaint(kind),transparent:see,alphaTest:see?0.5:0,depthWrite:!see});}return FLOOR_MAT[kind];}
// a single tile (for thumbnails and the placement ghost)
function floorGroup(kind,rot=0){const g=new T.Group(),m=new T.Mesh(FLOOR_GEO,floorMat(kind));m.position.y=0.005;m.receiveShadow=true;g.add(m);g.rotation.y=rot;g.userData.floor=true;return g;}
// every floor tile on the island, one instanced mesh per kind
function floorMeshes(list){const by=new Map();for(const o of list){if(!by.has(o.k))by.set(o.k,[]);by.get(o.k).push(o);}const out=[];
  for(const [k,arr] of by){const im=new T.InstancedMesh(FLOOR_GEO,floorMat(k),arr.length);
    arr.forEach((o,i)=>{_e.set(0,o.r||0,0);_q.setFromEuler(_e);_v.set(o.x,topY(o.x,o.z)+0.005,o.z);_s.set(1,1,1);_m.compose(_v,_q,_s);im.setMatrixAt(i,_m);});
    im.receiveShadow=true;im.castShadow=false;im.frustumCulled=false;im.userData.noThumb=true;out.push(im);}
  return out;}
