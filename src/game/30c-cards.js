/* =========================================================
   Petal and leaf cards: thin, smooth, gently curved shapes for flowers and leaves
   A card runs up its length (local y, 0 at the base to 1 at the tip) through rows of [y, half-width] (a half-width of 0
   is a point). Rows with a width get a centre line, so the card can cup across its width (`cup`: the edges sweep back,
   leaving the front face rounded), fold along its midrib (`fold`) and curl along its length (`curl`: + bends the tip
   towards the front, - away). The front face looks along +z. Each card is smooth-shaded, and a PG part paints it from a
   deeper base to a bright tip. One-sided cards suit materials drawn from both sides (flowerMat, 42-grass); `closed`
   adds a back face, for the shared one-sided materials. Shapes are cached, so every flower shares a handful of them.
   ========================================================= */
const _cardC=new Map();
function cardGeo(rows,o={}){const key=JSON.stringify([rows,o]);let g=_cardC.get(key);if(g)return g;
  const cup=o.cup||0,fold=o.fold||0,curl=o.curl||0,mid=o.mid!==false;let wm=0;for(const r of rows)wm=Math.max(wm,r[1]);
  const pos=[],idx=[],R=[],zf=(x,y)=>{const t=Math.abs(x)/(wm||1);return-cup*t*t-fold*t+curl*y*y;};
  for(const [y,w] of rows){const xs=w<=0?[0]:mid?[-w,0,w]:[-w,w];R.push(xs.map(x=>{pos.push(x,y,zf(x,y));return pos.length/3-1;}));}
  for(let i=0;i<R.length-1;i++){const A=R[i],B=R[i+1];if(A.length===1&&B.length===1)continue;
    if(A.length===1)for(let j=0;j<B.length-1;j++)idx.push(A[0],B[j+1],B[j]);
    else if(B.length===1)for(let j=0;j<A.length-1;j++)idx.push(A[j],A[j+1],B[0]);
    else for(let j=0;j<A.length-1;j++)idx.push(A[j],A[j+1],B[j+1],A[j],B[j+1],B[j]);}
  if(o.closed){const n=pos.length/3,th=o.th||0.04,m=idx.length;for(let i=0;i<n;i++)pos.push(pos[i*3],pos[i*3+1],pos[i*3+2]-th);for(let i=0;i<m;i+=3)idx.push(idx[i]+n,idx[i+2]+n,idx[i+1]+n);}
  g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  smoothG(g);_cardC.set(key,g);return g;}
// an open, tapering tube up local y (stems, stamens): `sides` round, smooth-shaded, no caps
function tubeGeo(sides=3,taper=0.6){const key='tube'+sides+'/'+taper;let g=_cardC.get(key);if(g)return g;const pos=[],idx=[];
  for(let i=0;i<=1;i++){const r=0.5*(i?taper:1);for(let j=0;j<sides;j++){const a=j/sides*6.283;pos.push(Math.cos(a)*r,i,Math.sin(a)*r);}}
  for(let j=0;j<sides;j++){const a=j,b=(j+1)%sides,c=a+sides,d=b+sides;idx.push(a,c,b,b,c,d);}
  g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();smoothG(g);_cardC.set(key,g);return g;}
// a low dome (a flower's eye): a fan from the top round a ring, smooth-shaded so it reads as a rounded button
function domeGeo(n=6){const key='dome'+n;let g=_cardC.get(key);if(g)return g;const pos=[0,1,0],idx=[];
  for(let j=0;j<n;j++){const a=j/n*6.283;pos.push(Math.cos(a)*0.5,0,Math.sin(a)*0.5);}
  for(let j=0;j<n;j++)idx.push(0,1+(j+1)%n,1+j);
  g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();smoothG(g);_cardC.set(key,g);return g;}
// a card part whose base sits at (x,y,z), leaning out from upright by `lean` towards azimuth `a` (front face outwards),
// shaded from `base` to `tip`
function cardP(p,g,tip,base,x,y,z,a,lean,len,wid,dep=wid,roll=0){p.push(PG(g,tip,base,x,y,z,lean,a,roll,wid,len,dep));}
const _wh=new T.Color(0xffffff);
const ltc=(c,f=0.2)=>new T.Color(c).lerp(_wh,f).getHex(),mixc=(a,b,f)=>new T.Color(a).lerp(new T.Color(b),f).getHex();
