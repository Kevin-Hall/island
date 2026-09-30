/* =========================================================
   Item icons, painted smooth: every fish, bug, plant, find, crop and material in your bag gets a clean little
   illustration (soft gradient, a gentle darker outline, a gloss highlight), drawn from its own colours and a few
   hints in its name, on a 128px canvas so it stays crisp at any size. They're painted the first time they're shown
   (ICON keys become lazy getters), so the ~300 of them cost nothing at boot. Tool and HUD icons keep their own art.
   ========================================================= */
const IC=128;
const icHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
function icMix(a,b,t){const A=rgbOf(a),B=rgbOf(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
const icL=(c,t)=>icMix(c,'#ffffff',t),icD=(c,t)=>icMix(c,'#1a1020',t);
const icHex=c=>{if(typeof c==='number')return'#'+c.toString(16).padStart(6,'0');if(c&&c[0]==='#'&&c.length===4)return'#'+[...c.slice(1)].map(q=>q+q).join('');return c||'#999999';};
// fill a path with a soft top-left light, outline it a shade darker, and add a gloss highlight inside it
function icFill(x,path,col,o={}){col=icHex(col);x.save();path(x);
  const g=x.createLinearGradient(o.gx0??25,o.gy0??15,o.gx1??75,o.gy1??90);g.addColorStop(0,icL(col,o.lt??0.32));g.addColorStop(0.55,col);g.addColorStop(1,icD(col,o.dk??0.22));
  x.globalAlpha=o.a??1;x.fillStyle=o.flat?col:g;x.fill();x.globalAlpha=1;
  if(o.line!==false){x.lineWidth=o.lw??2.6;x.strokeStyle=o.stroke||icD(col,0.42);x.stroke();}
  if(o.gloss){const [cx,cy,rx,ry,r=0]=o.gloss;path(x);x.clip();x.fillStyle='rgba(255,255,255,'+(o.ga??0.35)+')';x.beginPath();x.ellipse(cx,cy,rx,ry,r,0,6.283);x.fill();}
  x.restore();}
const icEll=(cx,cy,rx,ry,r=0)=>x=>{x.beginPath();x.ellipse(cx,cy,rx,ry,r,0,6.283);};
const icCirc=(cx,cy,r)=>icEll(cx,cy,r,r);
function icEye(x,cx,cy,r){x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,r,0,6.283);x.fill();x.fillStyle='#231a2a';x.beginPath();x.arc(cx+r*0.15,cy+r*0.1,r*0.62,0,6.283);x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(cx+r*0.4,cy-r*0.25,r*0.24,0,6.283);x.fill();}
function icLine(x,col,lw,pts,close){x.strokeStyle=icHex(col);x.lineWidth=lw;x.beginPath();x.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)x.lineTo(pts[i],pts[i+1]);if(close)x.closePath();x.stroke();}
function icCurve(x,col,lw,a){x.strokeStyle=icHex(col);x.lineWidth=lw;x.beginPath();x.moveTo(a[0],a[1]);x.quadraticCurveTo(a[2],a[3],a[4],a[5]);x.stroke();}
function icLeaf(x,cx,cy,len,w,ang,col){icFill(x,q=>{q.save();q.translate(cx,cy);q.rotate(ang);q.beginPath();q.moveTo(0,0);q.quadraticCurveTo(len*0.5,-w,len,0);q.quadraticCurveTo(len*0.5,w,0,0);q.restore();},col,{lw:2});
  x.save();x.translate(cx,cy);x.rotate(ang);icLine(x,icD(icHex(col),0.3),1.2,[2,0,len*0.85,0]);x.restore();}

// ---------------- fish ----------------
function icFish(x,F,key){const col=icHex(F.col||'#8a9ab0'),dk=icHex(F.dk||icD(col,0.4)),fin=icHex(F.fin||dk),s=F.size||2,t=F.spr||'fish',R=mulberry(icHash(key));
  if(t==='puffer'){for(let i=0;i<12;i++){const a=i/12*6.283;icFill(x,q=>{q.beginPath();q.moveTo(48+Math.cos(a-0.12)*28,52+Math.sin(a-0.12)*26);q.lineTo(48+Math.cos(a)*38,52+Math.sin(a)*36);q.lineTo(48+Math.cos(a+0.12)*28,52+Math.sin(a+0.12)*26);q.closePath();},icL(dk,0.3),{lw:1.6});}
    icFill(x,q=>{q.beginPath();q.moveTo(20,52);q.lineTo(8,40);q.lineTo(10,64);q.closePath();},fin);icFill(x,icEll(48,52,30,28),col,{gloss:[40,38,14,8,-0.4]});
    x.save();icEll(48,52,30,28)(x);x.clip();x.fillStyle=icL(col,0.55);x.beginPath();x.ellipse(50,72,26,14,0,0,6.283);x.fill();x.fillStyle=icD(col,0.25);for(let i=0;i<7;i++){x.beginPath();x.arc(30+R()*34,36+R()*20,2.2,0,6.283);x.fill();}x.restore();
    icEye(x,64,44,6);icFill(x,icEll(77,56,3,4),'#e88a8a',{lw:1.4});return;}
  if(t==='squid'){for(let i=0;i<6;i++){const xx=36+i*6;icCurve(x,dk,4,[xx,62,xx+(i%2?-8:8),76,xx+(i%2?-2:4),92]);}icCurve(x,dk,3,[40,64,24,84,30,96]);icCurve(x,dk,3,[64,64,80,84,72,96]);
    icFill(x,q=>{q.beginPath();q.moveTo(50,6);q.bezierCurveTo(74,26,72,54,66,66);q.lineTo(34,66);q.bezierCurveTo(28,54,26,26,50,6);},col,{gloss:[42,26,8,16]});
    icFill(x,q=>{q.beginPath();q.moveTo(50,6);q.lineTo(30,22);q.lineTo(38,28);q.closePath();q.moveTo(50,6);q.lineTo(70,22);q.lineTo(62,28);q.closePath();},fin,{lw:1.8});icEye(x,42,54,5);icEye(x,58,54,5);return;}
  if(t==='jelly'){for(let i=0;i<5;i++){const xx=32+i*9;x.globalAlpha=0.7;icCurve(x,icL(col,0.2),3,[xx,52,xx+(i%2?7:-7),72,xx,94]);x.globalAlpha=1;}
    icFill(x,q=>{q.beginPath();q.moveTo(18,54);q.bezierCurveTo(18,14,82,14,82,54);q.quadraticCurveTo(74,60,66,54);q.quadraticCurveTo(58,60,50,54);q.quadraticCurveTo(42,60,34,54);q.quadraticCurveTo(26,60,18,54);},col,{a:0.85,gloss:[36,30,12,8,-0.4],ga:0.5});
    x.globalAlpha=0.55;for(let i=0;i<4;i++){x.strokeStyle=dk;x.lineWidth=2.4;x.beginPath();x.arc(50+(i-1.5)*9,40,4,0,6.283);x.stroke();}x.globalAlpha=1;return;}
  if(t==='octo'){const crab=/crab/.test(key);if(crab){icCrab(x,col,dk);return;}
    for(let i=0;i<6;i++){const a=0.5+i*0.43;const ex=50+Math.cos(a)*40,ey=54+Math.sin(a)*34;x.strokeStyle=col;x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(50,58);x.quadraticCurveTo(50+Math.cos(a)*22,74,ex,ey);x.stroke();
      x.strokeStyle=icD(col,0.4);x.lineWidth=1.8;x.stroke();}
    icFill(x,q=>{q.beginPath();q.moveTo(22,58);q.bezierCurveTo(16,8,84,8,78,58);q.quadraticCurveTo(50,70,22,58);},col,{gloss:[40,26,12,9,-0.4]});icEye(x,40,48,6);icEye(x,60,48,6);
    x.fillStyle=icD(col,0.25);for(let i=0;i<5;i++){x.beginPath();x.arc(34+R()*32,22+R()*14,2,0,6.283);x.fill();}return;}
  if(t==='boot'){icFill(x,q=>{q.beginPath();q.moveTo(30,12);q.lineTo(58,12);q.lineTo(58,56);q.quadraticCurveTo(88,58,90,78);q.lineTo(90,86);q.lineTo(24,86);q.lineTo(26,56);q.closePath();},'#7a5a3e',{gloss:[38,26,6,12]});
    icFill(x,q=>{q.beginPath();q.rect(22,84,70,8);},'#4a3424');icFill(x,q=>{q.beginPath();q.rect(28,10,32,8);},'#5a4030');for(let i=0;i<3;i++)icLine(x,'#e8dcc0',1.6,[34,26+i*9,52,24+i*9]);
    x.fillStyle='#6ab0d8';x.globalAlpha=0.7;x.beginPath();x.arc(70,44,4,0,6.283);x.arc(78,32,3,0,6.283);x.fill();x.globalAlpha=1;return;}
  if(t==='ray'){const flat=/plaice|sole|flounder|halibut/.test(key);
    if(flat){icFill(x,q=>{q.beginPath();q.moveTo(86,50);q.bezierCurveTo(80,20,26,18,18,50);q.bezierCurveTo(26,82,80,80,86,50);},col,{gloss:[46,32,20,8]});icFill(x,q=>{q.beginPath();q.moveTo(20,50);q.lineTo(6,38);q.lineTo(6,62);q.closePath();},fin);
      x.fillStyle=icHex(F.fin||'#e0703a');for(let i=0;i<8;i++){x.beginPath();x.arc(30+R()*44,34+R()*32,2.6,0,6.283);x.fill();}icEye(x,72,42,4.5);icEye(x,74,54,4.5);return;}
    icCurve(x,dk,3.5,[50,70,56,86,48,98]);icFill(x,q=>{q.beginPath();q.moveTo(50,18);q.bezierCurveTo(62,24,80,34,94,48);q.bezierCurveTo(80,56,62,62,50,72);q.bezierCurveTo(38,62,20,56,6,48);q.bezierCurveTo(20,34,38,24,50,18);},col,{gloss:[40,34,16,6,-0.3]});
    x.save();x.globalAlpha=0.35;x.fillStyle='#fff';x.beginPath();x.ellipse(50,52,12,10,0,0,6.283);x.fill();x.restore();icEye(x,44,36,3.5);icEye(x,56,36,3.5);return;}
  if(t==='eel'){x.lineCap='round';const pts=[[14,70],[30,52],[48,66],[66,46],[84,40]];
    for(const [w,c] of [[16,icD(col,0.4)],[13,col]]){x.strokeStyle=c;x.lineWidth=w;x.beginPath();x.moveTo(...pts[0]);for(let i=1;i<pts.length-1;i++){const [a,b]=pts[i],[c2,d]=pts[i+1];x.quadraticCurveTo(a,b,(a+c2)/2,(b+d)/2);}x.lineTo(...pts[4]);x.stroke();}
    x.strokeStyle=icL(col,0.4);x.lineWidth=3;x.globalAlpha=0.6;x.beginPath();x.moveTo(20,64);x.quadraticCurveTo(30,50,40,58);x.stroke();x.globalAlpha=1;icFill(x,icEll(86,39,9,7,-0.3),col,{lw:2});icEye(x,88,36,3.2);return;}
  if(t==='narwhal'){icLine(x,'#f4ecd8',4,[70,34,98,8]);icFill(x,q=>{q.beginPath();q.moveTo(12,56);q.lineTo(2,44);q.lineTo(4,68);q.closePath();},dk);
    icFill(x,q=>{q.beginPath();q.moveTo(80,48);q.bezierCurveTo(80,24,30,26,14,54);q.bezierCurveTo(30,74,80,74,80,48);},col,{gloss:[44,38,20,6]});x.fillStyle=icD(col,0.25);for(let i=0;i<8;i++){x.beginPath();x.arc(26+R()*44,40+R()*10,2,0,6.283);x.fill();}
    icFill(x,q=>{q.beginPath();q.moveTo(46,62);q.lineTo(38,74);q.lineTo(54,66);q.closePath();},dk,{lw:1.8});icEye(x,68,48,3.5);return;}
  if(t==='axo'){for(const [a,b] of [[-1,0],[1,0]])for(let i=0;i<3;i++){const yy=30+i*8;icFill(x,icEll(70+a*0,yy,8,3,-0.6+i*0.6),icHex(F.fin||'#e86a8a'),{lw:1.6});}
    icCurve(x,icD(col,0.3),10,[16,60,30,50,44,60]);icCurve(x,col,7,[16,60,30,50,44,60]);
    icFill(x,icEll(46,62,22,12),col,{gloss:[42,56,12,4]});icFill(x,icEll(68,50,16,14),col,{gloss:[64,42,8,5]});icEye(x,62,48,3);icEye(x,74,48,3);icCurve(x,icD(col,0.5),1.6,[64,56,68,59,72,56]);
    for(const xx of [36,54])icFill(x,icEll(xx,74,4,6),col,{lw:1.6});return;}
  // an ordinary fish, shaped by its name: long, tall, shark-like or crab-like, with stripes, spots or whiskers
  if(/craw|crab|lobster|shrimp/.test(key)){icCrab(x,col,dk);return;}
  const long=/pike|gar$|barracuda|marlin|sword|needle|oar|herring|anchovy|sardine|minnow|mullet|flying|ayu|lantern|icefish|goby|blenny|loach/.test(key),
    tall=/angel|butterfly|tang|trigger|bream|bluegill|snapper|grouper|perch|sunfish|discus|moonfish|wrasse|dawn/.test(key),shark=/shark|hammer/.test(key);
  const cx=50,cy=50,L=long?78:tall?60:66+s*2,H=long?14+s:tall?26+s:18+s*1.5,hx=cx+L/2,tx=cx-L/2+6;
  const body=q=>{q.beginPath();q.moveTo(hx,cy+2);q.bezierCurveTo(hx-2,cy-H*0.95,cx-L*0.15,cy-H,tx,cy-H*0.22);q.lineTo(tx,cy+H*0.22);q.bezierCurveTo(cx-L*0.15,cy+H,hx-2,cy+H*0.95,hx,cy+2);};
  // tail, fins
  icFill(x,q=>{q.beginPath();q.moveTo(tx+4,cy);q.quadraticCurveTo(tx-6,cy-6,tx-16,cy-(shark?22:16));q.quadraticCurveTo(tx-8,cy,tx-16,cy+(shark?10:16));q.quadraticCurveTo(tx-6,cy+6,tx+4,cy);},fin,{lw:2.2});
  icFill(x,q=>{q.beginPath();q.moveTo(cx-L*0.2,cy-H*0.85);q.quadraticCurveTo(cx-(shark?2:6),cy-H-(shark?20:tall?16:10),cx+L*(shark?0.08:0.14),cy-H*0.8);q.closePath();},fin,{lw:2});
  if(tall)icFill(x,q=>{q.beginPath();q.moveTo(cx-L*0.2,cy+H*0.85);q.quadraticCurveTo(cx-4,cy+H+14,cx+L*0.1,cy+H*0.8);q.closePath();},fin,{lw:2});
  if(/sword|marlin/.test(key))icFill(x,q=>{q.beginPath();q.moveTo(hx-2,cy-2);q.lineTo(hx+14,cy-1);q.lineTo(hx-2,cy+3);q.closePath();},dk,{lw:1.4});
  // body: dark back to pale belly
  x.save();body(x);const g=x.createLinearGradient(0,cy-H,0,cy+H);g.addColorStop(0,icMix(col,dk,0.45));g.addColorStop(0.5,col);g.addColorStop(1,icL(col,0.5));x.fillStyle=g;x.fill();
  x.clip();R();
  if(/clown|perch|lion|stickle|tiger|zebra|convict|sergeant|bass$/.test(key)){x.fillStyle=/clown/.test(key)?'#fff':icD(dk,0.1);x.globalAlpha=/clown/.test(key)?0.95:0.5;for(const f of [0.25,0.5,0.75]){const xx=tx+L*f;x.beginPath();x.ellipse(xx,cy,3.4,H,0,0,6.283);x.fill();}x.globalAlpha=1;}
  if(/koi|trout|char|salmon|goldperch|leopard|grayling/.test(key)){x.fillStyle=/koi/.test(key)?dk:icD(col,0.35);for(let i=0;i<(/koi/.test(key)?4:12);i++){const r=/koi/.test(key)?5+R()*5:1.6;x.beginPath();x.arc(tx+8+R()*(L-18),cy-H*0.6+R()*H*1.1,r,0,6.283);x.fill();}}
  if(/rainbow|trout|mahi|parrot|tang/.test(key)){x.fillStyle=icHex(F.fin||'#f08aa0');x.globalAlpha=0.5;x.beginPath();x.ellipse(cx,cy+2,L*0.45,3.2,0,0,6.283);x.fill();x.globalAlpha=1;}
  x.fillStyle='rgba(255,255,255,0.3)';x.beginPath();x.ellipse(cx+4,cy-H*0.5,L*0.26,H*0.18,-0.1,0,6.283);x.fill();x.restore();
  x.save();body(x);x.lineWidth=2.6;x.strokeStyle=icD(dk,0.3);x.stroke();x.restore();
  if(shark){for(let i=0;i<3;i++)icCurve(x,icD(col,0.45),1.4,[hx-L*0.28-i*4,cy-H*0.3,hx-L*0.26-i*4,cy,hx-L*0.28-i*4,cy+H*0.3]);}
  else icCurve(x,icD(col,0.4),1.6,[hx-L*0.24,cy-H*0.5,hx-L*0.2,cy,hx-L*0.24,cy+H*0.5]);
  icFill(x,q=>{q.beginPath();q.moveTo(cx+L*0.08,cy+H*0.25);q.quadraticCurveTo(cx-2,cy+H*0.55,cx-L*0.06,cy+H*0.62);q.quadraticCurveTo(cx+2,cy+H*0.2,cx+L*0.08,cy+H*0.25);},fin,{lw:1.6});
  if(/cat|carp|koi|loach|barbel/.test(key)){icCurve(x,dk,1.4,[hx-2,cy+3,hx+6,cy+10,hx+2,cy+16]);icCurve(x,dk,1.4,[hx-4,cy+4,hx+1,cy+12,hx-4,cy+17]);}
  if(/lantern|moon|ghost|glow/.test(key)){x.fillStyle='rgba(255,250,200,0.9)';x.beginPath();x.arc(hx-4,cy-H-4,3.4,0,6.283);x.fill();icCurve(x,dk,1.2,[hx-10,cy-H*0.7,hx-8,cy-H-6,hx-4,cy-H-4]);}
  icEye(x,hx-L*(long?0.1:0.14),cy-H*0.22,long?3.6:4.6);}
function icCrab(x,col,dk){for(const s of [-1,1]){for(let i=0;i<3;i++)icLine(x,dk,3.2,[50+s*18,60+i*5,50+s*34,66+i*8,50+s*38,78+i*6]);
    icLine(x,col,5,[50+s*20,50,50+s*32,36]);icFill(x,q=>{q.beginPath();q.moveTo(50+s*30,38);q.quadraticCurveTo(50+s*46,26,50+s*38,16);q.lineTo(50+s*33,26);q.lineTo(50+s*27,20);q.quadraticCurveTo(50+s*24,34,50+s*30,38);},col,{lw:2});}
  icFill(x,icEll(50,58,24,17),col,{gloss:[42,50,10,5]});for(const s of [-1,1]){icLine(x,dk,2,[50+s*6,44,50+s*8,34]);icEye(x,50+s*8,33,3.4);}}

// ---------------- bugs ----------------
function icBug(x,B,key){const col=icHex(B.col||'#e0a040'),dk=icHex(B.dk||icD(col,0.5)),k=B.kind||'fly',R=mulberry(icHash(key));
  if(k==='drag'){if(/skater/.test(key)){for(const s of [-1,1])for(let i=0;i<3;i++)icLine(x,dk,1.8,[50,40+i*10,50+s*(30+i*6),30+i*22,50+s*(42+i*2),26+i*28]);icFill(x,icEll(50,50,6,22),col);icEye(x,47,30,2.4);icEye(x,53,30,2.4);return;}
    x.save();x.translate(50,52);x.rotate(-0.7);for(const [yy,ln] of [[-10,40],[-4,36]])for(const s of [-1,1]){x.globalAlpha=0.55;icFill(x,icEll(s*ln*0.55,yy,ln*0.55,6,s*0.08),icL(col,0.6),{stroke:icD(col,0.2),lw:1.4});x.globalAlpha=1;}
    icFill(x,q=>{q.beginPath();q.roundRect?q.roundRect(-3.5,-8,7,52,4):q.rect(-3.5,-8,7,52);},col,{lw:2});for(let i=0;i<6;i++)icLine(x,dk,1.2,[-3.5,4+i*6.5,3.5,4+i*6.5]);
    icFill(x,icEll(0,-10,8,6),col);icEye(x,-5,-14,4);icEye(x,5,-14,4);x.restore();return;}
  if(k==='crawl'){
    if(/snail/.test(key)){icFill(x,q=>{q.beginPath();q.moveTo(10,78);q.quadraticCurveTo(40,70,82,74);q.quadraticCurveTo(92,62,84,52);q.lineTo(76,64);q.quadraticCurveTo(40,66,10,78);},'#c8b89a',{lw:2});
      icLine(x,'#8a7a60',2,[82,56,86,40]);icLine(x,'#8a7a60',2,[78,56,76,40]);icFill(x,icCirc(86,40,2.5),'#4a3a30',{lw:1});icFill(x,icCirc(76,40,2.5),'#4a3a30',{lw:1});
      icFill(x,icCirc(44,50,24),col,{gloss:[36,38,10,7,-0.5]});x.strokeStyle=dk;x.lineWidth=2.4;x.beginPath();for(let a=0;a<14;a+=0.2){const r=20-a*1.3;x.lineTo(46+Math.cos(a)*r,50+Math.sin(a)*r);}x.stroke();return;}
    if(/caterpillar|glowworm/.test(key)){for(let i=0;i<6;i++){const xx=20+i*11,yy=62-Math.sin(i*0.9)*8;icFill(x,icCirc(xx,yy,9),i===5?col:(i%2?col:icL(col,0.2)),{lw:1.8,gloss:[xx-3,yy-4,3,2]});if(/glow/.test(key)&&i<2){x.fillStyle='rgba(255,250,160,0.8)';x.beginPath();x.arc(xx,yy,6,0,6.283);x.fill();}}
      icEye(x,76,52,2.8);icLine(x,dk,1.6,[74,46,70,36]);icLine(x,dk,1.6,[80,46,84,36]);return;}
    if(/ant$|ant\b|leafcutter|woodant/.test(key)){for(const s of [-1,1])for(let i=0;i<3;i++)icLine(x,dk,2,[46+i*8,56,40+i*12+s*0,56+s*18]);
      icFill(x,icEll(28,54,14,11),col,{gloss:[24,48,5,3]});icFill(x,icEll(50,54,8,6),col);icFill(x,icCirc(66,50,9),col,{gloss:[63,46,3,2]});icLine(x,dk,1.6,[70,42,80,30]);icLine(x,dk,1.6,[66,42,68,28]);
      if(/leaf/.test(key))icLeaf(x,62,30,30,12,-0.6,'#6ab84a');return;}
    if(/grass|cricket|mantis/.test(key)){const man=/mantis/.test(key);icLine(x,dk,2.2,[40,58,26,78]);icLine(x,dk,2.2,[50,58,46,80]);
      icFill(x,q=>{q.beginPath();q.moveTo(58,56);q.lineTo(30,40);q.lineTo(20,72);q.closePath();},icD(col,0.1),{lw:2});
      icFill(x,icEll(46,54,man?26:28,man?5:9,-0.1),col,{gloss:[40,48,12,3]});icFill(x,icEll(76,48,9,8),col);icEye(x,80,45,3);icLine(x,dk,1.4,[80,40,96,22]);icLine(x,dk,1.4,[78,40,86,20]);
      if(man){icLine(x,col,3,[70,54,74,68,80,60]);}return;}
    if(/pill/.test(key)){icFill(x,icEll(50,56,30,20),col,{gloss:[40,44,14,5]});for(let i=0;i<6;i++)icCurve(x,dk,1.6,[28+i*9,40,26+i*9,56,28+i*9,72]);icEye(x,78,52,2.4);return;}
    // a beetle, top-down: shell, head, legs; horns for stags and rhinos, spots for ladybirds
    for(const s of [-1,1])for(let i=0;i<3;i++)icLine(x,'#2b1e2e',2.4,[50,44+i*12,50+s*26,40+i*14,50+s*32,48+i*14]);
    if(/stag/.test(key))for(const s of [-1,1])icFill(x,q=>{q.beginPath();q.moveTo(50+s*4,22);q.quadraticCurveTo(50+s*16,10,50+s*6,2);q.quadraticCurveTo(50+s*10,12,50+s*1,20);q.closePath();},dk,{lw:1.6});
    if(/rhino/.test(key))icFill(x,q=>{q.beginPath();q.moveTo(46,22);q.quadraticCurveTo(50,0,58,4);q.quadraticCurveTo(52,10,54,22);q.closePath();},dk,{lw:1.6});
    icFill(x,icEll(50,26,9,7),dk);icFill(x,icEll(50,38,15,8),icMix(col,dk,0.5),{lw:2});
    icFill(x,q=>{q.beginPath();q.moveTo(50,42);q.bezierCurveTo(22,42,24,92,50,90);q.bezierCurveTo(76,92,78,42,50,42);},col,{gloss:[40,54,7,12,0.2],ga:0.45});icLine(x,icD(col,0.45),1.8,[50,44,50,89]);
    if(/lady|ladybug|star|jewel/.test(key)){x.fillStyle=/star/.test(key)?'#fff6b0':'#2b1e2e';for(const [a,b,r] of [[40,56,4],[60,56,4],[38,72,3.6],[62,72,3.6],[50,82,3]]){x.beginPath();x.arc(a,b,r,0,6.283);x.fill();}}
    if(/gold|scarab|jewel|ember|magma|glow|star/.test(key)){x.fillStyle='rgba(255,255,255,0.4)';x.beginPath();x.ellipse(60,60,3,10,0.2,0,6.283);x.fill();}
    icLine(x,'#2b1e2e',1.6,[46,20,38,8]);icLine(x,'#2b1e2e',1.6,[54,20,62,8]);return;}
  // flyers: bees, moths and butterflies
  if(/bee/.test(key)){x.globalAlpha=0.6;icFill(x,icEll(36,34,14,9,-0.6),'#e8f4ff',{lw:1.4,stroke:'#9ab0c8'});icFill(x,icEll(62,34,14,9,0.6),'#e8f4ff',{lw:1.4,stroke:'#9ab0c8'});x.globalAlpha=1;
    icFill(x,icEll(50,58,22,19),col,{gloss:[42,48,8,5]});x.save();icEll(50,58,22,19)(x);x.clip();x.fillStyle='#2b1e2e';for(const yy of [52,64])x.fillRect(20,yy,60,5);x.restore();icEye(x,60,50,3);return;}
  const moth=/moth|luna|atlas|owlet|emperor|harvest|cinder|ash|aurora|ghost|winter|rosy/.test(key),fire=/firefly/.test(key);
  if(fire){icFill(x,icEll(50,62,10,16),'#f6f0a0',{gloss:[46,58,4,5]});x.fillStyle='rgba(255,250,150,0.5)';x.beginPath();x.arc(50,66,20,0,6.283);x.fill();icFill(x,icEll(50,44,11,12),col);x.globalAlpha=0.6;
    icFill(x,icEll(38,48,8,16,0.4),'#e8f4ff',{lw:1.2});icFill(x,icEll(62,48,8,16,-0.4),'#e8f4ff',{lw:1.2});x.globalAlpha=1;icLine(x,'#2b1e2e',1.4,[46,34,40,22]);icLine(x,'#2b1e2e',1.4,[54,34,60,22]);return;}
  for(const s of [-1,1]){
    // forewing
    icFill(x,q=>{q.beginPath();q.moveTo(50,46);moth?(q.bezierCurveTo(50+s*14,20,50+s*44,18,50+s*46,34),q.quadraticCurveTo(50+s*36,52,50,52)):(q.bezierCurveTo(50+s*10,14,50+s*44,6,50+s*44,26),q.bezierCurveTo(50+s*44,40,50+s*30,50,50,52));},col,{gloss:[50+s*22,30,10,5,s*-0.4],gx0:50,gx1:50+s*46});
    x.save();q0(x,s,moth);x.clip();x.strokeStyle=dk;x.lineWidth=5;q0(x,s,moth);x.stroke();x.restore();
    // hindwing
    icFill(x,q=>{q.beginPath();q.moveTo(50,52);q.bezierCurveTo(50+s*30,52,50+s*36,70,50+s*24,80);q.quadraticCurveTo(50+s*12,84,50,60);},moth?icL(col,0.15):col,{lw:2.4,stroke:icD(dk,0.2)});
    x.fillStyle=moth?icD(col,0.3):'#fff';x.globalAlpha=0.85;for(let i=0;i<2;i++){x.beginPath();x.arc(50+s*(30+i*7),22+i*8,2.6-i*0.6,0,6.283);x.fill();}x.globalAlpha=1;
    if(moth||/peacock|luna|owl/.test(key)){x.fillStyle=dk;x.beginPath();x.arc(50+s*18,66,4.5,0,6.283);x.fill();x.fillStyle='#fff6d0';x.beginPath();x.arc(50+s*18,66,2,0,6.283);x.fill();}}
  icFill(x,icEll(50,52,4.5,18),moth?icMix(col,'#8a7a6a',0.4):'#2b1e2e',{lw:1.6});
  if(moth){icCurve(x,'#5a4a3a',2.2,[48,36,40,24,34,20]);icCurve(x,'#5a4a3a',2.2,[52,36,60,24,66,20]);}
  else{icCurve(x,'#2b1e2e',1.5,[48,36,44,24,38,18]);icCurve(x,'#2b1e2e',1.5,[52,36,56,24,62,18]);icFill(x,icCirc(38,18,2.4),'#2b1e2e',{lw:1});icFill(x,icCirc(62,18,2.4),'#2b1e2e',{lw:1});}}
function q0(x,s,moth){x.beginPath();x.moveTo(50,46);if(moth){x.bezierCurveTo(50+s*14,20,50+s*44,18,50+s*46,34);x.quadraticCurveTo(50+s*36,52,50,52);}else{x.bezierCurveTo(50+s*10,14,50+s*44,6,50+s*44,26);x.bezierCurveTo(50+s*44,40,50+s*30,50,50,52);}}

// ---------------- plants (wild) ----------------
function icStem(x,x0,y0,x1,y1,col='#4f9a3a'){x.lineCap='round';x.strokeStyle=icD(col,0.25);x.lineWidth=5;x.beginPath();x.moveTo(x0,y0);x.quadraticCurveTo((x0+x1)/2+4,(y0+y1)/2,x1,y1);x.stroke();x.strokeStyle=col;x.lineWidth=3;x.stroke();}
function icBloom(x,cx,cy,r,col,cc,n=5,shape='round',rot=0){col=icHex(col);
  for(let i=0;i<n;i++){const a=rot+i/n*6.283;x.save();x.translate(cx,cy);x.rotate(a);
    icFill(x,q=>{q.beginPath();if(shape==='point'){q.moveTo(0,0);q.quadraticCurveTo(r*0.45,-r*0.4,r*1.05,0);q.quadraticCurveTo(r*0.45,r*0.4,0,0);}else if(shape==='thin'){q.ellipse(r*0.55,0,r*0.55,r*0.16,0,0,6.283);}else q.ellipse(r*0.55,0,r*0.55,r*0.34,0,0,6.283);},col,{lw:1.8,gx0:0,gy0:0,gx1:r,gy1:0,lt:0.4});x.restore();}
  icFill(x,icCirc(cx,cy,r*0.34),cc||'#f6d04a',{lw:1.6,gloss:[cx-r*0.1,cy-r*0.12,r*0.12,r*0.08]});}
function icPlant(x,Pd,key){const col=icHex(Pd.col||'#e06a8a'),dk=icHex(Pd.dk||icD(col,0.4)),c=icHex(Pd.c||'#f6d04a'),R=mulberry(icHash(key));
  switch(Pd.kind){
    case'flower':{icStem(x,50,94,50,44);icLeaf(x,50,78,24,8,-0.5,'#5aa844');icLeaf(x,50,70,22,7,Math.PI+0.5,'#4f9a3a');
      if(/bell|foxglove|snowdrop|bluebell|lily of/.test(key)){for(const [xx,yy] of [[40,40],[58,34],[46,56]]){icFill(x,q=>{q.beginPath();q.moveTo(xx-9,yy);q.quadraticCurveTo(xx-10,yy-16,xx,yy-16);q.quadraticCurveTo(xx+10,yy-16,xx+9,yy);q.quadraticCurveTo(xx+5,yy+4,xx,yy);q.quadraticCurveTo(xx-5,yy+4,xx-9,yy);},col,{gloss:[xx-3,yy-10,3,5]});}icCurve(x,'#4f9a3a',2,[50,44,48,20,40,24]);return;}
      if(/lavender|fireweed|foxglove|spike|lupin|heather/.test(key)){for(let i=0;i<9;i++){const yy=16+i*6,xx=50+(i%2?4:-4);icFill(x,icEll(xx,yy,5,4),i<3?icL(col,0.2):col,{lw:1.4});}return;}
      if(/lily|orchid|hibiscus|paradise|plumeria|fire/.test(key)){icBloom(x,50,38,26,col,c,/orchid|hibiscus|plumeria/.test(key)?5:6,'point',-1.57);return;}
      if(/daisy|aster|marigold|edelweiss|cotton|buttercup|primrose/.test(key)){icBloom(x,50,38,24,col,c,/daisy|aster/.test(key)?12:/butter|marigold|primrose/.test(key)?5:8,/daisy|aster/.test(key)?'thin':'round');return;}
      if(/tulip|poppy|clover|twin/.test(key)){icFill(x,q=>{q.beginPath();q.moveTo(34,30);q.quadraticCurveTo(32,58,50,58);q.quadraticCurveTo(68,58,66,30);q.lineTo(58,38);q.lineTo(50,26);q.lineTo(42,38);q.closePath();},col,{gloss:[42,40,4,8]});
        if(/poppy/.test(key)){x.fillStyle='#2b1e2e';x.beginPath();x.arc(50,44,5,0,6.283);x.fill();}return;}
      icBloom(x,50,38,24,col,c,5+(icHash(key)%2),'round',R());return;}
    case'berry':{if(/strawberry/.test(key)){icLeaf(x,50,30,26,9,-2.4,'#4f9a3a');icLeaf(x,50,30,26,9,-0.7,'#5aa844');icFill(x,q=>{q.beginPath();q.moveTo(50,88);q.bezierCurveTo(20,64,24,30,50,32);q.bezierCurveTo(76,30,80,64,50,88);},col,{gloss:[40,44,7,10,0.3]});
        x.fillStyle='#fff3b0';for(let i=0;i<12;i++){x.beginPath();x.ellipse(36+R()*28,40+R()*36,1.3,2,0,0,6.283);x.fill();}for(let i=0;i<5;i++)icLeaf(x,50,32,14,5,-2.8+i*0.55,'#4f9a3a');return;}
      icLeaf(x,50,40,34,12,-2.6,'#4f9a3a');icLeaf(x,50,40,34,12,-0.5,'#5aa844');icCurve(x,'#6a4a2a',2,[50,40,50,48,44,56]);
      const bs=/rasp|bramble|black/.test(key)?[[50,62,13]]:[[38,62,11],[60,60,11],[48,78,11],[64,78,9],[34,78,8]];
      for(const [a,b,r] of bs){if(bs.length===1){for(let i=0;i<14;i++){const aa=i*2.4,rr=Math.sqrt(i)*3.6;icFill(x,icCirc(a+Math.cos(aa)*rr,b+Math.sin(aa)*rr,4.2),col,{lw:1.2});}continue;}
        icFill(x,icCirc(a,b,r),col,{gloss:[a-r*0.35,b-r*0.35,r*0.3,r*0.22]});x.fillStyle=icD(col,0.4);x.beginPath();x.arc(a+r*0.3,b+r*0.4,1.4,0,6.283);x.fill();}return;}
    case'mushroom':{const morel=/morel/.test(key),puff=/puff|truffle/.test(key);
      if(puff){icFill(x,icEll(50,62,28,24),col,{gloss:[40,50,10,7,-0.4]});x.fillStyle=icD(col,0.2);for(let i=0;i<9;i++){x.beginPath();x.arc(32+R()*36,50+R()*26,1.8,0,6.283);x.fill();}return;}
      icFill(x,q=>{q.beginPath();q.moveTo(40,90);q.quadraticCurveTo(38,62,42,50);q.lineTo(58,50);q.quadraticCurveTo(62,62,60,90);q.closePath();},'#f2e8d4',{gloss:[46,70,3,10]});
      if(morel){icFill(x,q=>{q.beginPath();q.moveTo(50,10);q.bezierCurveTo(72,22,68,50,62,54);q.lineTo(38,54);q.bezierCurveTo(32,50,28,22,50,10);},col);x.strokeStyle=icD(col,0.4);x.lineWidth=1.6;for(let i=0;i<5;i++){x.beginPath();x.ellipse(50,22+i*7,12-Math.abs(i-2)*2,3,0,0,6.283);x.stroke();}return;}
      icFill(x,q=>{q.beginPath();q.moveTo(14,56);q.bezierCurveTo(14,14,86,14,86,56);q.quadraticCurveTo(50,64,14,56);},col,{gloss:[36,30,14,7,-0.3]});
      if(/agaric|fly|toad/.test(key)){x.fillStyle='#fff';for(const [a,b,r] of [[34,40,4],[52,30,4.5],[68,42,3.6],[46,48,3],[60,50,2.6]]){x.beginPath();x.arc(a,b,r,0,6.283);x.fill();}}
      if(/glow|ghost/.test(key)){x.fillStyle='rgba(220,255,250,0.5)';x.beginPath();x.arc(50,40,34,0,6.283);x.fill();}return;}
    case'fruit':{if(/coconut/.test(key)){icFill(x,icCirc(50,56,30),'#8a5a3a',{gloss:[40,44,10,7,-0.4]});x.strokeStyle='#5a3a2a';x.lineWidth=1.3;for(let i=0;i<14;i++){const a=R()*6.28,r=R()*26;x.beginPath();x.moveTo(50+Math.cos(a)*r,56+Math.sin(a)*r);x.lineTo(50+Math.cos(a)*r+4,56+Math.sin(a)*r+2);x.stroke();}
        for(const [a,b] of [[44,46],[56,46],[50,56]]){x.fillStyle='#3a2418';x.beginPath();x.arc(a,b,2.6,0,6.283);x.fill();}return;}
      if(/star/.test(key)){icFill(x,q=>{q.beginPath();for(let i=0;i<10;i++){const a=-1.57+i*0.628,r=i%2?16:38;q.lineTo(50+Math.cos(a)*r,56+Math.sin(a)*r);}q.closePath();},col,{gloss:[42,44,8,6]});return;}
      const pear=/pear/.test(key);icCurve(x,'#6a4a2a',3,[50,34,50,24,56,16]);icLeaf(x,53,22,22,8,-0.4,'#5aa844');
      icFill(x,pear?(q=>{q.beginPath();q.moveTo(50,30);q.bezierCurveTo(36,30,42,52,30,66);q.bezierCurveTo(22,92,78,92,70,66);q.bezierCurveTo(58,52,64,30,50,30);}):icEll(50,62,30,28),col,{gloss:[38,48,9,7,-0.5]});
      if(/passion|mango/.test(key)){x.fillStyle=icD(col,0.2);for(let i=0;i<6;i++){x.beginPath();x.arc(36+R()*28,54+R()*20,1.6,0,6.283);x.fill();}}return;}
    case'ground':{if(/pineapple/.test(key)){for(let i=0;i<5;i++)icLeaf(x,50,34,24,6,-2.4+i*0.4,'#4f9a3a');icFill(x,icEll(50,64,22,28),col,{gloss:[42,50,5,10]});x.strokeStyle=dk;x.lineWidth=1.4;x.save();icEll(50,64,22,28)(x);x.clip();
          for(let i=-5;i<6;i++){x.beginPath();x.moveTo(28+i*8,36);x.lineTo(72+i*8,92);x.moveTo(72-i*8,36);x.lineTo(28-i*8,92);x.stroke();}x.restore();return;}
      if(/chestnut|nut/.test(key)){icFill(x,q=>{q.beginPath();q.moveTo(50,20);q.bezierCurveTo(84,40,78,84,50,86);q.bezierCurveTo(22,84,16,40,50,20);},'#8a4a2a',{gloss:[40,44,8,14]});icFill(x,icEll(50,82,22,6),'#d8c09a',{lw:1.6});return;}
      if(/pitcher/.test(key)){icFill(x,q=>{q.beginPath();q.moveTo(36,26);q.quadraticCurveTo(30,80,50,86);q.quadraticCurveTo(70,80,64,26);q.quadraticCurveTo(50,34,36,26);},col,{gloss:[42,50,4,14]});icFill(x,icEll(50,26,14,5),dk);return;}
      icCurve(x,'#5a8a3a',4,[50,34,52,22,60,18]);icFill(x,q=>{q.beginPath();q.ellipse(50,62,34,26,0,0,6.283);},col,{gloss:[38,48,10,6,-0.4]});x.strokeStyle=icD(col,0.3);x.lineWidth=1.8;for(const r of [12,24]){x.beginPath();x.ellipse(50,62,r,26,0,0,6.283);x.stroke();}return;}
    case'clover':{x.translate(50,50);x.scale(1.45,1.45);x.translate(-50,-44);icStem(x,50,80,50,54);for(let i=0;i<4;i++){const a=i*1.57+0.785;x.save();x.translate(50,46);x.rotate(a);icFill(x,q=>{q.beginPath();q.moveTo(0,0);q.bezierCurveTo(-4,-18,-20,-14,-12,-4);q.moveTo(0,0);q.bezierCurveTo(4,-18,20,-14,12,-4);q.moveTo(-12,-4);q.quadraticCurveTo(0,6,12,-4);},col,{lw:1.8});x.restore();}
      icFill(x,icCirc(50,46,3),icD(col,0.2),{lw:1});return;}
  }
  icBloom(x,50,40,24,col,c);}

// ---------------- finds ----------------
function icShellFan(x,col,dk,cx=50,cy=56,r=36){icFill(x,q=>{q.beginPath();q.moveTo(cx,cy+r*0.9);for(let i=0;i<=8;i++){const a=Math.PI*(1.12+i*0.095),rr=r*(i%2?0.94:1);q.lineTo(cx+Math.cos(a)*rr,cy+r*0.3+Math.sin(a)*rr);}q.closePath();},col,{gloss:[cx-r*0.25,cy-r*0.25,r*0.25,r*0.14,-0.3]});
  for(let i=0;i<7;i++){const a=Math.PI*(1.17+i*0.11);icLine(x,icD(icHex(col),0.25),1.6,[cx,cy+r*0.86,cx+Math.cos(a)*r*0.9,cy+r*0.3+Math.sin(a)*r*0.9]);}
  icFill(x,q=>{q.beginPath();q.moveTo(cx-10,cy+r*0.9);q.lineTo(cx+10,cy+r*0.9);q.lineTo(cx+6,cy+r*0.72);q.lineTo(cx-6,cy+r*0.72);q.closePath();},dk||icD(icHex(col),0.2),{lw:1.6});}
function icSpiral(x,col,cx=50,cy=54,sc=1){icFill(x,q=>{q.beginPath();q.moveTo(cx+10*sc,cy-34*sc);q.bezierCurveTo(cx+36*sc,cy-12*sc,cx+30*sc,cy+30*sc,cx-4*sc,cy+36*sc);q.bezierCurveTo(cx-30*sc,cy+30*sc,cx-26*sc,cy-6*sc,cx+10*sc,cy-34*sc);},col,{gloss:[cx+4*sc,cy-6*sc,6*sc,14*sc,0.3]});
  x.strokeStyle=icD(icHex(col),0.3);x.lineWidth=1.8;for(let i=0;i<4;i++){x.beginPath();x.moveTo(cx-20*sc+i*3,cy+(-8+i*11)*sc);x.quadraticCurveTo(cx+6*sc,cy+(-14+i*11)*sc,cx+26*sc-i*2,cy+(-4+i*9)*sc);x.stroke();}}
function icFind(x,key,F){const col=icHex(F&&F.col||'#d8c8a8'),dk=icHex(F&&F.dk||icD(col,0.35)),R=mulberry(icHash(key)),k=key.slice(2);
  switch(k){
    case'shell':return icShellFan(x,'#f6c8c0','#e09a90');
    case'scallop':return icShellFan(x,col,dk);
    case'conch':case'whelk':case'nautilus':case'moonsnail':case'snailshell':return icSpiral(x,k==='conch'?'#f4d4b8':col);
    case'dollar':icFill(x,icCirc(50,52,34),'#efe0c0',{gloss:[40,40,12,8,-0.4]});for(let i=0;i<5;i++){const a=-1.57+i*1.257;x.save();x.translate(50+Math.cos(a)*14,52+Math.sin(a)*14);x.rotate(a);icFill(x,icEll(0,0,9,3.6),'#dcc8a0',{lw:1.4});x.restore();}return;
    case'star':case'starfrag':icFill(x,q=>{q.beginPath();for(let i=0;i<10;i++){const a=-1.57+i*0.628,r=i%2?16:40;q.lineTo(50+Math.cos(a)*r,54+Math.sin(a)*r);}q.closePath();},k==='star'?'#f08a4a':'#f6d04a',{gloss:[44,42,8,6]});
      x.fillStyle='rgba(255,255,255,0.5)';for(let i=0;i<10;i++){const a=R()*6.28,r=R()*28;x.beginPath();x.arc(50+Math.cos(a)*r,54+Math.sin(a)*r,1.5,0,6.283);x.fill();}return;
    case'glass':icFill(x,q=>{q.beginPath();q.moveTo(30,40);q.lineTo(58,24);q.lineTo(78,48);q.lineTo(64,78);q.lineTo(32,70);q.closePath();},'#8ad8c8',{a:0.85,gloss:[48,38,12,6,-0.5],ga:0.6});return;
    case'pearl':case'dewpearl':icShellFan(x,'#c8c0d0','#9a90a8',50,62,32);icFill(x,icCirc(50,56,13),'#f8f4f8',{gloss:[46,52,5,4],lt:0.5});return;
    case'drift':case'bogoak':icFill(x,q=>{q.beginPath();q.moveTo(10,70);q.bezierCurveTo(30,52,60,40,88,26);q.lineTo(92,36);q.bezierCurveTo(62,52,34,68,14,80);q.closePath();},k==='drift'?'#b8a08a':'#4a3a2a',{gloss:[50,46,20,3,-0.5]});
      icLine(x,'#8a7060',1.4,[26,68,54,54]);icLine(x,'#8a7060',1.4,[40,66,70,48]);return;
    case'bottle':icFill(x,q=>{q.beginPath();q.moveTo(40,90);q.lineTo(40,48);q.quadraticCurveTo(40,38,46,34);q.lineTo(46,20);q.lineTo(54,20);q.lineTo(54,34);q.quadraticCurveTo(60,38,60,48);q.lineTo(60,90);q.closePath();},'#8ac8b8',{a:0.8,gloss:[46,60,3,18],ga:0.6});
      icFill(x,q=>{q.beginPath();q.rect(45,12,10,10);},'#a07a50');icFill(x,q=>{q.beginPath();q.rect(44,52,12,26);},'#f4ecd4',{lw:1.4});icLine(x,'#c8403a',1.6,[44,64,56,64]);return;
    case'feather':case'gullfeather':case'owlfeather':case'jayfeather':{x.save();x.translate(50,50);x.rotate(-0.7);icFill(x,q=>{q.beginPath();q.moveTo(0,-40);q.bezierCurveTo(16,-20,14,20,0,40);q.bezierCurveTo(-14,20,-16,-20,0,-40);},k==='jayfeather'?'#5a8ae0':k==='owlfeather'?'#a08060':'#f0f0f0',{gloss:[-4,-16,4,12]});
      if(k==='jayfeather'){x.fillStyle='#2b3a6a';for(let i=0;i<5;i++)x.fillRect(-10,-20+i*9,20,3);}icLine(x,'#6a5a4a',2,[0,-38,0,46]);x.restore();return;}
    case'coral':case'coralbranch':x.lineCap='round';for(const [w,c] of [[11,icD('#f07a8a',0.3)],[8,'#f07a8a']]){x.strokeStyle=c;x.lineWidth=w;x.beginPath();x.moveTo(50,92);x.lineTo(50,60);x.lineTo(34,40);x.lineTo(30,20);x.moveTo(50,60);x.lineTo(66,42);x.lineTo(70,22);x.moveTo(34,40);x.lineTo(20,34);x.moveTo(66,42);x.lineTo(80,36);x.moveTo(50,72);x.lineTo(62,62);x.stroke();}return;
    case'obsidianshard':icFill(x,q=>{q.beginPath();q.moveTo(50,10);q.lineTo(74,44);q.lineTo(62,90);q.lineTo(34,84);q.lineTo(28,40);q.closePath();},'#3a2a4a',{gloss:[46,36,6,16,0.2],ga:0.5});icLine(x,'#8a6ab8',1.6,[50,10,50,84]);return;
    case'amber':icFill(x,q=>{q.beginPath();q.moveTo(50,16);q.bezierCurveTo(80,24,82,70,54,86);q.bezierCurveTo(24,88,18,40,50,16);},'#f0a830',{a:0.92,gloss:[40,36,8,12,0.3],ga:0.55});x.fillStyle='#5a3a1a';x.beginPath();x.ellipse(54,56,6,3.4,0.4,0,6.283);x.fill();return;
    case'frostshell':return icShellFan(x,'#cfeefc','#8ac0e0');
    case'driftseed':x.fillStyle='rgba(180,255,230,0.45)';x.beginPath();x.arc(50,54,40,0,6.283);x.fill();icFill(x,q=>{q.beginPath();q.moveTo(50,14);q.bezierCurveTo(78,30,78,76,50,90);q.bezierCurveTo(22,76,22,30,50,14);},'#7ad8b0',{gloss:[42,36,6,12]});
      icCurve(x,'#3a8a6a',2,[50,20,56,52,50,86]);icLeaf(x,50,16,16,6,-1.9,'#6ac84a');return;
    case'seahorse':icFill(x,q=>{q.beginPath();q.moveTo(46,16);q.quadraticCurveTo(70,14,66,30);q.lineTo(80,36);q.lineTo(66,40);q.quadraticCurveTo(70,64,54,74);q.quadraticCurveTo(42,84,52,90);q.quadraticCurveTo(64,90,58,80);q.quadraticCurveTo(38,80,40,62);q.quadraticCurveTo(34,40,46,16);},'#f6c040',{gloss:[52,30,5,8]});
      icEye(x,58,28,3.2);for(let i=0;i<4;i++)icLine(x,'#c8902a',1.4,[42+i*2,40+i*8,48+i*2,40+i*8]);return;
    case'hermit':icSpiral(x,'#e8c8a8',56,42,0.72);icFill(x,icEll(40,70,18,10),'#e86a4a',{gloss:[36,66,6,3]});icLine(x,'#e86a4a',4,[28,72,18,62]);icEye(x,34,58,3);icEye(x,42,56,3);return;
    case'anemone':for(let i=0;i<9;i++){const a=-2.8+i*0.35;icCurve(x,'#f07ab0',6,[50,60,50+Math.cos(a)*20,40+Math.sin(a)*14,50+Math.cos(a)*34,50+Math.sin(a)*34-8]);}icFill(x,icEll(50,74,22,14),'#b86aa8',{gloss:[42,68,8,3]});return;
    case'fossil':icFill(x,icCirc(50,54,34),'#c8b89a',{gloss:[38,40,10,7,-0.4]});x.strokeStyle='#8a7a5a';x.lineWidth=2.4;x.beginPath();for(let a=0;a<16;a+=0.15){const r=30-a*1.8;x.lineTo(52+Math.cos(a)*r,54+Math.sin(a)*r);}x.stroke();
      for(let i=0;i<10;i++){const a=i*0.62;icLine(x,'#9a8a6a',1.2,[52+Math.cos(a)*18,54+Math.sin(a)*18,52+Math.cos(a)*29,54+Math.sin(a)*29]);}return;
    case'kelp':for(const s of [-1,1])icLeaf(x,50,92,70,12,-1.57+s*0.25,'#5a8a3a');icLeaf(x,50,92,60,10,-1.57,'#6a9a44');return;
    case'urchin':icFill(x,icCirc(50,56,30),'#b89ad0',{gloss:[40,44,10,6,-0.4]});x.fillStyle='#8a6aa8';for(let i=0;i<20;i++){const a=i*0.9,r=8+(i%3)*7;x.beginPath();x.arc(50+Math.cos(a)*r,56+Math.sin(a)*r,1.8,0,6.283);x.fill();}return;
    case'mussel':icFill(x,q=>{q.beginPath();q.moveTo(22,76);q.bezierCurveTo(20,40,60,14,80,22);q.bezierCurveTo(84,50,56,82,22,76);},'#2a3a5a',{gloss:[46,40,14,5,-0.7],ga:0.45});return;
    case'cowrie':icFill(x,icEll(50,54,32,22),'#f0dcc0',{gloss:[42,44,12,6]});x.fillStyle='#a07050';for(let i=0;i<10;i++){x.beginPath();x.arc(28+R()*44,40+R()*22,2.2,0,6.283);x.fill();}icLine(x,'#6a4a30',2,[22,60,78,60]);return;
    case'icicle':icFill(x,q=>{q.beginPath();q.moveTo(30,14);q.lineTo(70,14);q.lineTo(52,94);q.closePath();},'#d8f0fc',{a:0.85,gloss:[44,30,4,16],ga:0.6});return;
    case'hollyberry':icLeaf(x,50,54,36,12,-2.6,'#2e7a3a');icLeaf(x,50,54,36,12,-0.5,'#3a8a44');for(const [a,b] of [[44,58],[56,60],[50,68]])icFill(x,icCirc(a,b,7),'#d8303a',{gloss:[a-2,b-2,2,1.5]});return;
    case'robinegg':icFill(x,icEll(50,56,24,30),'#9ad8e0',{gloss:[42,42,7,10,-0.2]});x.fillStyle='#6a8a9a';for(let i=0;i<8;i++){x.beginPath();x.arc(36+R()*28,40+R()*36,1.3,0,6.283);x.fill();}return;
    case'mapleleaf':case'goldleaf':{const c2=k==='goldleaf'?'#f0c040':'#e0582a';icFill(x,q=>{q.beginPath();const P=[[50,10],[58,30],[76,22],[70,44],[90,48],[72,60],[78,76],[56,68],[54,90],[46,90],[44,68],[22,76],[28,60],[10,48],[30,44],[24,22],[42,30]];q.moveTo(...P[0]);for(const p of P)q.lineTo(...p);q.closePath();},c2,{gloss:[42,36,8,6]});
      icLine(x,icD(c2,0.35),1.6,[50,90,50,20]);return;}
    case'arrowhead':icFill(x,q=>{q.beginPath();q.moveTo(50,10);q.lineTo(74,70);q.lineTo(56,62);q.lineTo(56,90);q.lineTo(44,90);q.lineTo(44,62);q.lineTo(26,70);q.closePath();},'#6a6a78',{gloss:[46,36,4,12]});return;
    case'mushroom':return icPlant(x,{kind:'mushroom',col:'#d8403a'},'agaric');
    case'truffle':icFill(x,q=>{q.beginPath();q.moveTo(20,62);q.bezierCurveTo(16,34,70,26,82,50);q.bezierCurveTo(88,76,40,86,20,62);},'#4a3a30',{gloss:[42,44,12,6,-0.3]});x.fillStyle='#6a5a48';for(let i=0;i<14;i++){x.beginPath();x.arc(26+R()*54,40+R()*36,1.6,0,6.283);x.fill();}return;
    case'acorn':icFill(x,q=>{q.beginPath();q.moveTo(50,90);q.bezierCurveTo(22,80,26,46,50,46);q.bezierCurveTo(74,46,78,80,50,90);},'#c89a5a',{gloss:[40,60,6,10]});
      icFill(x,q=>{q.beginPath();q.moveTo(24,50);q.bezierCurveTo(24,26,76,26,76,50);q.quadraticCurveTo(50,56,24,50);},'#7a5230');x.strokeStyle='#5a3a20';x.lineWidth=1.2;for(let i=0;i<5;i++){x.beginPath();x.moveTo(28+i*11,34);x.lineTo(24+i*11,50);x.stroke();}icLine(x,'#5a3a20',3.4,[50,30,54,18]);return;
    case'pinecone':for(let r=0;r<7;r++){const w=10+Math.sin((r+1)/8*Math.PI)*16;for(let c=-1;c<=1;c+=2)icFill(x,icEll(50+c*w*0.45,22+r*10,w*0.5,6,c*0.3),r%2?'#8a5a30':'#a06a3a',{lw:1.4});}icLine(x,'#5a3a20',3,[50,14,50,6]);return;
    case'berries':return icPlant(x,{kind:'berry',col:'#6a4ab0'},'berries');
    case'clover4':return icPlant(x,{kind:'clover',col:'#5aae44'},'clover4');
    case'apple':return icPlant(x,{kind:'fruit',col:'#d8403a'},'apple');
    case'clam':return icShellFan(x,'#b8b4c8','#8a86a0');
    case'geode':icFill(x,icCirc(50,54,32),'#7a7680',{gloss:[38,40,10,6,-0.4]});icFill(x,icCirc(50,54,22),'#f0ecf4',{lw:1.6});for(let i=0;i<8;i++){const a=i*0.785;icFill(x,q=>{q.beginPath();q.moveTo(50,54);q.lineTo(50+Math.cos(a-0.3)*20,54+Math.sin(a-0.3)*20);q.lineTo(50+Math.cos(a+0.3)*20,54+Math.sin(a+0.3)*20);q.closePath();},i%2?'#9a6ad0':'#b88ae8',{lw:1});}
      icFill(x,icCirc(50,54,6),'#6a3a9a',{lw:1});return;
    case'oldcoin':icFill(x,icCirc(50,54,32),'#e8b830',{gloss:[40,42,12,6,-0.4]});icFill(x,icCirc(50,54,23),'#d8a828',{lw:1.6});x.fillStyle='#a07818';x.font='bold 26px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('✦',50,55);return;
    case'button':icFill(x,icCirc(50,52,30),'#c89a40',{gloss:[40,40,10,6,-0.4]});icFill(x,icCirc(50,52,22),'#b88a30',{lw:1.4});for(const [a,b] of [[44,46],[56,46],[44,58],[56,58]]){x.fillStyle='#5a4010';x.beginPath();x.arc(a,b,3,0,6.283);x.fill();}return;
  }
  const t=F&&F.tpl;
  switch(t){
    case'shell':return icShellFan(x,col,dk);case'fan':return icShellFan(x,col,dk);case'spiral':return icSpiral(x,col);
    case'stone':icFill(x,q=>{q.beginPath();q.moveTo(20,60);q.bezierCurveTo(18,30,70,22,82,46);q.bezierCurveTo(90,72,40,86,20,60);},col,{gloss:[40,42,14,6,-0.3]});if(/agate|jasper|marble/.test(k)){x.strokeStyle=icL(col,0.4);x.lineWidth=2;for(let i=0;i<3;i++){x.beginPath();x.ellipse(52,56,24-i*7,14-i*4,-0.2,0,6.283);x.stroke();}}return;
    case'gem':icFill(x,q=>{q.beginPath();q.moveTo(30,36);q.lineTo(70,36);q.lineTo(84,50);q.lineTo(50,90);q.lineTo(16,50);q.closePath();},col,{gloss:[40,42,8,4],ga:0.55});icLine(x,icL(col,0.5),1.4,[16,50,84,50]);icLine(x,icL(col,0.5),1.4,[40,36,34,50,50,90,66,50,60,36]);return;
    case'coin':icFill(x,icCirc(50,54,32),col,{gloss:[40,42,12,6,-0.4]});icFill(x,icCirc(50,54,23),icL(col,0.1),{lw:1.6});return;
    case'tooth':icFill(x,q=>{q.beginPath();q.moveTo(24,24);q.quadraticCurveTo(50,18,76,24);q.quadraticCurveTo(60,60,50,92);q.quadraticCurveTo(40,60,24,24);},col,{gloss:[42,36,6,12]});return;
    case'bone':icFill(x,q=>{q.beginPath();q.moveTo(26,34);q.lineTo(70,70);},col);x.lineCap='round';x.strokeStyle=icD(col,0.35);x.lineWidth=15;x.beginPath();x.moveTo(28,32);x.lineTo(72,70);x.stroke();x.strokeStyle=col;x.lineWidth=11;x.stroke();
      for(const [a,b] of [[20,32],[28,24],[72,78],[80,70]])icFill(x,icCirc(a,b,9),col,{lw:2});return;
    case'feather':return icFind(x,'g:gullfeather',F);
    case'leaf':icLeaf(x,20,80,76,22,-0.8,col);return;
    case'nut':icFill(x,q=>{q.beginPath();q.moveTo(50,24);q.bezierCurveTo(80,34,78,84,50,88);q.bezierCurveTo(22,84,20,34,50,24);},col,{gloss:[40,46,7,12]});icFill(x,q=>{q.beginPath();q.ellipse(50,34,26,14,0,Math.PI,6.283);q.closePath();},dk);icLine(x,'#5a3a2a',3,[50,20,54,10]);return;
    case'cap':return icPlant(x,{kind:'mushroom',col,dk},k);
    case'egg':icFill(x,icEll(50,56,24,30),col,{gloss:[42,42,7,10,-0.2]});return;}
  icFill(x,icCirc(50,54,30),col,{gloss:[40,42,10,6,-0.4]});}

// ---------------- crops ----------------
function icCrop(x,id){const C=CROPS[id],col=icHex(C.col),R=mulberry(icHash(id));const tops=(cx,cy,n=5,len=26,c='#5aa844')=>{for(let i=0;i<n;i++)icLeaf(x,cx,cy,len,8,-1.57+(i-(n-1)/2)*0.38,i%2?c:icD(c,0.12));};
  switch(id){
    case'turnip':tops(50,40);icFill(x,q=>{q.beginPath();q.moveTo(50,90);q.bezierCurveTo(46,80,20,74,22,58);q.bezierCurveTo(24,38,76,38,78,58);q.bezierCurveTo(80,74,54,80,50,90);},'#f6f0f4',{gloss:[38,50,8,6]});
      x.save();x.beginPath();x.moveTo(20,40);x.lineTo(80,40);x.lineTo(80,54);x.quadraticCurveTo(50,62,20,54);x.clip();icFill(x,icEll(50,58,28,20),'#b46ad0',{line:false});x.restore();return;
    case'radish':tops(50,44,4);icFill(x,icCirc(50,62,20),col,{gloss:[42,54,6,5]});icLine(x,'#f0e8e0',2,[50,82,50,94]);return;
    case'carrot':tops(50,30,5,24);icFill(x,q=>{q.beginPath();q.moveTo(34,30);q.quadraticCurveTo(50,24,66,30);q.quadraticCurveTo(58,70,50,94);q.quadraticCurveTo(42,70,34,30);},col,{gloss:[44,40,4,12]});for(let i=0;i<4;i++)icLine(x,icD(col,0.3),1.4,[40+i*2,44+i*10,48+i*1,44+i*10]);return;
    case'lettuce':case'cabbage':{const cab=id==='cabbage';for(let i=0;i<7;i++){const a=i/7*6.283;icFill(x,icEll(50+Math.cos(a)*18,58+Math.sin(a)*14,18,14,a),icD(col,0.1+(i%2)*0.08),{lw:1.8});}
      icFill(x,icCirc(50,56,cab?20:16),icL(col,0.15),{gloss:[44,50,6,4]});x.strokeStyle=icL(col,0.5);x.lineWidth=1.4;for(let i=0;i<5;i++){const a=i/5*6.283;x.beginPath();x.moveTo(50,56);x.lineTo(50+Math.cos(a)*30,58+Math.sin(a)*24);x.stroke();}return;}
    case'onion':icCurve(x,'#6ab04a',4,[50,34,48,18,40,10]);icCurve(x,'#5aa844',4,[50,34,54,18,62,12]);icFill(x,q=>{q.beginPath();q.moveTo(50,30);q.bezierCurveTo(84,52,78,88,50,88);q.bezierCurveTo(22,88,16,52,50,30);},col,{gloss:[40,56,6,10]});
      for(const s of [-1,1])icCurve(x,icD(col,0.3),1.4,[50,34,50+s*18,60,50,86]);return;
    case'potato':icFill(x,q=>{q.beginPath();q.moveTo(18,58);q.bezierCurveTo(16,34,62,26,80,42);q.bezierCurveTo(92,62,70,84,44,80);q.bezierCurveTo(26,78,18,70,18,58);},col,{gloss:[38,44,12,6,-0.3]});
      x.fillStyle=icD(col,0.35);for(const [a,b] of [[36,60],[56,48],[66,66],[46,72]]){x.beginPath();x.ellipse(a,b,2.4,1.6,0.3,0,6.283);x.fill();}return;
    case'strawberry':return icPlant(x,{kind:'berry',col:C.col},'strawberry');
    case'wheat':for(let s=-1;s<=1;s++){x.save();x.translate(50,90);x.rotate(s*0.28);icLine(x,'#c8a040',2.6,[0,0,0,-56]);for(let i=0;i<6;i++)for(const d of [-1,1])icFill(x,icEll(d*4.5,-44-i*7+ (d>0?3:0),4,7,d*0.5),col,{lw:1.2});x.restore();}
      icFill(x,q=>{q.beginPath();q.rect(40,72,20,6);},'#a0402a',{lw:1.4});return;
    case'peas':icFill(x,q=>{q.beginPath();q.moveTo(12,66);q.bezierCurveTo(30,30,70,24,90,36);q.bezierCurveTo(74,58,40,76,12,66);},'#6ac04a',{gloss:[46,44,20,5,-0.4]});
      for(let i=0;i<4;i++)icFill(x,icCirc(28+i*15,58-i*7,6.5),icL(col,0.1),{lw:1.4,gloss:[26+i*15,56-i*7,2,1.5]});return;
    case'pepper':icFill(x,q=>{q.beginPath();q.moveTo(50,30);q.bezierCurveTo(88,26,86,64,70,84);q.quadraticCurveTo(60,92,50,84);q.quadraticCurveTo(40,92,30,84);q.bezierCurveTo(14,64,12,26,50,30);},col,{gloss:[36,44,6,12]});
      icCurve(x,icD(col,0.3),1.6,[50,34,52,60,50,84]);icFill(x,q=>{q.beginPath();q.moveTo(40,32);q.quadraticCurveTo(50,22,60,32);q.closePath();},'#4f8a3a',{lw:1.6});icLine(x,'#4f8a3a',4,[50,28,54,14]);return;
    case'tomato':icFill(x,icEll(50,60,32,28),col,{gloss:[38,46,10,6,-0.4]});for(let i=0;i<6;i++){const a=i/6*6.283;icLeaf(x,50,34,12,4,a,'#4f9a3a');}icLine(x,'#3a7a2a',3,[50,34,52,22]);return;
    case'tulip':icStem(x,50,94,50,52);icLeaf(x,50,86,28,9,-0.9,'#5aa844');return icPlant(x,{kind:'flower',col:C.col},'tulip');
    case'sunflower':icStem(x,50,94,50,50);icLeaf(x,50,76,24,9,-0.3,'#5aa844');icBloom(x,50,40,30,col,'#6a4228',14,'round');x.fillStyle='#4a2a18';for(let i=0;i<12;i++){const a=i*2.4,r=Math.sqrt(i)*2.6;x.beginPath();x.arc(50+Math.cos(a)*r,40+Math.sin(a)*r,1.2,0,6.283);x.fill();}return;
    case'corn':for(const s of [-1,1])icFill(x,q=>{q.beginPath();q.moveTo(50,92);q.quadraticCurveTo(50+s*30,60,50+s*10,20);q.quadraticCurveTo(50+s*14,60,50,92);},'#7ab84a',{lw:1.8});
      icFill(x,q=>{q.beginPath();q.moveTo(50,14);q.bezierCurveTo(66,24,64,78,50,86);q.bezierCurveTo(36,78,34,24,50,14);},col,{gloss:[46,30,3,12]});x.fillStyle=icD(col,0.2);for(let r=0;r<10;r++)for(let c=-1;c<=1;c++){x.beginPath();x.arc(50+c*6,24+r*6,1.4,0,6.283);x.fill();}return;
    case'eggplant':icFill(x,q=>{q.beginPath();q.moveTo(46,24);q.bezierCurveTo(80,30,86,86,56,88);q.bezierCurveTo(28,90,30,50,46,24);},col,{gloss:[46,46,5,14,-0.2],ga:0.45});
      icFill(x,q=>{q.beginPath();q.moveTo(36,30);q.quadraticCurveTo(48,16,62,28);q.lineTo(56,34);q.lineTo(48,30);q.lineTo(40,36);q.closePath();},'#4f8a3a',{lw:1.6});icLine(x,'#4f8a3a',4,[50,22,54,10]);return;
    case'blueberry':icLeaf(x,50,40,30,11,-2.5,'#4f9a3a');for(const [a,b,r] of [[36,58,12],[60,56,13],[48,76,12],[66,76,10]]){icFill(x,icCirc(a,b,r),col,{gloss:[a-r*0.35,b-r*0.35,r*0.28,r*0.2],ga:0.45});x.strokeStyle=icD(col,0.4);x.lineWidth=1.4;x.beginPath();x.arc(a+2,b-r*0.5,2.4,0,6.283);x.stroke();}return;
    case'pumpkin':icLine(x,'#6a5a2a',5,[50,30,54,16]);for(const [cx,rx] of [[32,18],[68,18],[50,20]])icFill(x,icEll(cx,60,rx,28),cx===50?icL(col,0.08):col,{lw:2});x.fillStyle='rgba(255,255,255,0.3)';x.beginPath();x.ellipse(44,46,5,10,0,0,6.283);x.fill();icLeaf(x,54,26,20,7,-0.3,'#5aa844');return;
    case'lavender':for(let s=-1;s<=1;s++){x.save();x.translate(50,94);x.rotate(s*0.25);icLine(x,'#6a9a4a',2.6,[0,0,0,-56]);for(let i=0;i<7;i++)icFill(x,icEll(0,-40-i*6,4.5,4),i<2?icL(col,0.2):col,{lw:1.2});x.restore();}return;
    case'watermelon':icFill(x,icEll(50,58,38,28),col,{gloss:[36,44,12,6,-0.3]});x.strokeStyle=icD(col,0.35);x.lineWidth=4;for(let i=-2;i<=2;i++){x.beginPath();x.ellipse(50,58,Math.abs(i)*9+2,28,0,-1.57,1.57*(i<0?-1:1)+ (i<0?0:0));x.stroke();}return;
    case'moonflower':x.fillStyle='rgba(180,200,255,0.4)';x.beginPath();x.arc(50,44,36,0,6.283);x.fill();icStem(x,50,94,50,54);icLeaf(x,50,80,24,8,-0.4,'#5aa844');icBloom(x,50,42,28,'#f4f8ff','#9ab8ff',5,'round',-1.57);return;
    case'grape':icLeaf(x,52,22,26,10,-0.5,'#5aa844');icLine(x,'#6a4a2a',3,[50,20,50,30]);let gi=0;for(let r=0;r<5;r++)for(let c=0;c<5-r;c++){const a=50+(c-(4-r)/2)*12,b=38+r*11;gi++;icFill(x,icCirc(a,b,7),col,{lw:1.4,gloss:[a-2,b-2,2,1.6],ga:0.5});}return;
    case'peach':icLeaf(x,52,26,24,9,-0.4,'#5aa844');icFill(x,icCirc(50,60,30),col,{gloss:[38,48,9,7,-0.4]});icCurve(x,icD(col,0.25),2,[50,32,42,60,50,88]);x.fillStyle='rgba(232,96,74,0.35)';x.beginPath();x.ellipse(62,62,14,20,0.2,0,6.283);x.fill();return;
    case'starfruit':return icPlant(x,{kind:'fruit',col:C.col},'star');
    case'dragonfruit':icFill(x,icEll(50,58,26,32),col,{gloss:[40,44,6,10,-0.2]});for(let i=0;i<7;i++){const a=R()*6.28,r=10+R()*14;icFill(x,q=>{q.beginPath();const px=50+Math.cos(a)*r,py=58+Math.sin(a)*r*1.2;q.moveTo(px-4,py+3);q.quadraticCurveTo(px+2,py-2,px+6,py-8);q.quadraticCurveTo(px+4,py+2,px-4,py+3);},'#8ad050',{lw:1.2});}
      icLeaf(x,50,28,14,5,-1.57,'#8ad050');return;
  }
  icFill(x,icCirc(50,56,30),col,{gloss:[40,44,10,6,-0.4]});}

// ---------------- materials and odds ----------------
function icMisc(x,k){switch(k){
    case'm:wood':for(const [a,b] of [[34,64],[66,64],[50,40]]){icFill(x,q=>{q.beginPath();q.rect(a-16,b-11,26,22);},'#a8784a',{lw:2,gloss:[a-6,b-8,8,2]});icFill(x,icEll(a+10,b,6,11),'#e8c898',{lw:2});x.strokeStyle='#b8905a';x.lineWidth=1.2;x.beginPath();x.ellipse(a+10,b,3,6,0,0,6.283);x.stroke();}return;
    case'm:stone':icFill(x,q=>{q.beginPath();q.moveTo(16,70);q.lineTo(26,38);q.lineTo(52,24);q.lineTo(78,34);q.lineTo(88,62);q.lineTo(70,84);q.lineTo(30,84);q.closePath();},'#9a9ea8',{gloss:[42,40,14,6,-0.3]});icLine(x,'#7a7e88',1.6,[52,24,50,50,88,62]);icLine(x,'#7a7e88',1.6,[50,50,30,84]);return;
    case'm:fiber':for(let i=0;i<9;i++){const a=-1.57+(i-4)*0.12;icLine(x,i%2?'#8ab850':'#6a9a3a',3,[50,86,50+Math.cos(a)*62,86+Math.sin(a)*70]);}icFill(x,q=>{q.beginPath();q.rect(38,60,24,8);},'#c8a060',{lw:1.6});return;
    case'x:fert':icFill(x,q=>{q.beginPath();q.moveTo(28,30);q.quadraticCurveTo(50,22,72,30);q.lineTo(78,82);q.quadraticCurveTo(50,92,22,82);q.closePath();},'#c8a878',{gloss:[38,44,6,14]});icFill(x,q=>{q.beginPath();q.rect(32,22,36,10);},'#a8885a',{lw:1.8});
      icLeaf(x,40,64,20,8,-0.6,'#5aa844');icLeaf(x,50,66,18,7,-1.2,'#6ab84a');return;
    case'x:bait':icFill(x,q=>{q.beginPath();q.rect(26,40,48,48);},'#a8b0bc',{gloss:[36,56,4,14]});icFill(x,icEll(50,40,24,7),'#6a4a30',{lw:1.8});
      x.lineCap='round';for(const [w,c] of [[9,'#c86a7a'],[6,'#f08a9a']]){x.strokeStyle=c;x.lineWidth=w;x.beginPath();x.moveTo(40,40);x.bezierCurveTo(30,20,56,18,54,30);x.bezierCurveTo(52,40,70,34,64,22);x.stroke();}return;
    case'shell':return icShellFan(x,'#f7b8c4','#e088a0');}}

// paint one icon (returns a data URL), or null if this key isn't one we draw
function paintItemIcon(key){const [c,x]=(()=>{const c=document.createElement('canvas');c.width=c.height=IC;const x=c.getContext('2d');x.scale(IC/100,IC/100);x.lineJoin='round';x.lineCap='round';return[c,x];})();
  try{if(key.startsWith('f:')&&FISH[key.slice(2)]){x.translate(50,50);x.scale(1.12,1.12);x.translate(-50,-50);}
    if(key.startsWith('f:')&&FISH[key.slice(2)])icFish(x,FISH[key.slice(2)],key.slice(2));
    else if(key.startsWith('b:')&&BUGS[key.slice(2)])icBug(x,BUGS[key.slice(2)],key.slice(2));
    else if(key.startsWith('p:')&&PLANTS[key.slice(2)])icPlant(x,PLANTS[key.slice(2)],key.slice(2));
    else if(key.startsWith('g:'))icFind(x,key,FINDS[key.slice(2)]);
    else if(CROPS[key])icCrop(x,key);
    else icMisc(x,key);}catch(e){console.warn('icon',key,e);return null;}
  return c.toDataURL();}
// swap the pixel icons for painted ones, lazily
{const keys=[...Object.keys(FISH).map(k=>'f:'+k),...Object.keys(BUGS).map(k=>'b:'+k),...Object.keys(PLANTS).map(k=>'p:'+k),...Object.keys(FINDS).map(k=>'g:'+k),'g:mushroom','g:truffle','g:acorn','g:pinecone','g:berries','g:clover4','g:apple','g:clam','g:geode','g:oldcoin',...CROP_IDS,'m:wood','m:stone','m:fiber','x:fert','x:bait','shell'];
  for(const k of [...new Set(keys)]){const old=ICON[k];Object.defineProperty(ICON,k,{configurable:true,enumerable:true,get(){const v=paintItemIcon(k)||old;Object.defineProperty(ICON,k,{value:v,writable:true,configurable:true,enumerable:true});return v;},set(v){/* a later pixel sprite for the same thing: keep the painted one */}});}}
shellHTML=`<img class="px" src="${ICON.shell}" alt="">`;
