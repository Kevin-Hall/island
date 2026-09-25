/* =========================================================
   Tool icons, painted as small shaded illustrations (gradients, a highlight, a dark tinted outline)
   rather than pixel grids, so tools read as real objects. Each tool is drawn upright around (0,0),
   then tilted 45° like an item icon. Overrides the sprite versions in ICON.
   ========================================================= */
function paintIcon(fn){const N=96,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');g.lineJoin='round';g.lineCap='round';fn(g,N);return cv.toDataURL();}
const lgrad=(g,x0,y0,x1,y1,stops)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>gr.addColorStop(o,c));return gr;};
// outline first (a fat stroke), then the fill on top, so each part gets a clean tinted edge
function part(g,path,fill,edge,w=6){g.lineWidth=w;g.strokeStyle=edge;g.stroke(path);g.fillStyle=fill;g.fill(path);}
const rrect=(x,y,w,h,r)=>{const p=new Path2D();p.roundRect?p.roundRect(x,y,w,h,r):p.rect(x,y,w,h);return p;};
const WOOD=g=>lgrad(g,-5,0,5,0,[[0,'#e2a86a'],[0.45,'#c07c44'],[1,'#8a5230']]),WOOD_E='#4a2a18';
const STEEL=(g,x0,x1)=>lgrad(g,x0,0,x1,0,[[0,'#f4f8fc'],[0.35,'#c4ccd8'],[1,'#7a8494']]),STEEL_E='#2c3240';
function tilted(fn){return paintIcon((g,N)=>{g.translate(N/2,N/2);g.rotate(Math.PI/4);fn(g);});}
function shine(g,x0,y0,x1,y1,w=3){g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();}

const TOOL_ICONS={
  shovel:tilted(g=>{
    part(g,rrect(-13,-45,26,9,4),WOOD(g),WOOD_E);part(g,rrect(-4.5,-40,9,56,3),WOOD(g),WOOD_E);
    part(g,rrect(-7,10,14,10,2),lgrad(g,-7,0,7,0,[[0,'#8a94a4'],[1,'#4a5262']]),STEEL_E);
    const b=new Path2D();b.moveTo(-15,17);b.lineTo(15,17);b.lineTo(15,31);b.quadraticCurveTo(15,43,0,48);b.quadraticCurveTo(-15,43,-15,31);b.closePath();part(g,b,STEEL(g,-15,15),STEEL_E);
    shine(g,-8,23,-8,37);shine(g,-2,-34,-2,6,2);}),
  axe:tilted(g=>{
    part(g,rrect(-4.5,-38,9,84,4),WOOD(g),WOOD_E);
    part(g,rrect(1,-40,11,15,3),lgrad(g,0,0,12,0,[[0,'#9aa2b0'],[1,'#5a6272']]),STEEL_E);
    const h=new Path2D();h.moveTo(-2,-40);h.lineTo(-17,-45);h.quadraticCurveTo(-33,-31,-18,-13);h.lineTo(-2,-21);h.closePath();part(g,h,STEEL(g,-30,-2),STEEL_E);
    g.strokeStyle='#ffffff';g.lineWidth=3.5;g.beginPath();g.moveTo(-18,-41);g.quadraticCurveTo(-29,-31,-19,-17);g.stroke();
    shine(g,-2,-12,-2,36,2);}),
  net:tilted(g=>{
    part(g,rrect(-3.5,-8,7,54,3),WOOD(g),WOOD_E);
    const hoop=new Path2D();hoop.ellipse(0,-27,19,20,0,0,Math.PI*2);g.lineWidth=11;g.strokeStyle=STEEL_E;g.stroke(hoop);
    g.save();g.clip(hoop);g.fillStyle='rgba(236,244,248,.55)';g.fill(hoop);g.strokeStyle='rgba(120,140,160,.8)';g.lineWidth=1.5;
    for(let i=-24;i<=24;i+=6){g.beginPath();g.moveTo(i-20,-47);g.lineTo(i+20,-7);g.stroke();g.beginPath();g.moveTo(i+20,-47);g.lineTo(i-20,-7);g.stroke();}g.restore();
    g.lineWidth=5;g.strokeStyle=lgrad(g,-19,0,19,0,[[0,'#f0f4f8'],[1,'#8a94a4']]);g.stroke(hoop);
    part(g,rrect(-5,-9,10,8,2),lgrad(g,-5,0,5,0,[[0,'#8a94a4'],[1,'#4a5262']]),STEEL_E,4);}),
  rod:paintIcon((g,N)=>{
    g.save();g.translate(N/2,N/2);g.rotate(Math.PI/4);
    const r=new Path2D();r.moveTo(-1.5,-46);r.lineTo(1.5,-46);r.lineTo(4,24);r.lineTo(-4,24);r.closePath();part(g,r,lgrad(g,-4,0,4,0,[[0,'#8ab4e8'],[1,'#3a5aa0']]),'#1e2a48',5);
    part(g,rrect(-5.5,20,11,24,4),lgrad(g,-5,0,5,0,[[0,'#f0d0a0'],[1,'#b88a58']]),WOOD_E,5);for(const y of [26,32,38]){g.strokeStyle='#8a5a34';g.lineWidth=1.5;g.beginPath();g.moveTo(-5,y);g.lineTo(5,y);g.stroke();}
    const reel=new Path2D();reel.arc(10,14,7,0,Math.PI*2);part(g,reel,lgrad(g,4,8,16,20,[[0,'#f4f8fc'],[1,'#7a8494']]),STEEL_E,4);
    for(const y of [-30,-12,6]){const e=new Path2D();e.arc(3,y,2.5,0,Math.PI*2);g.lineWidth=2;g.strokeStyle='#2c3240';g.stroke(e);}
    g.restore();
    g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=1.6;g.beginPath();g.moveTo(80,16);g.quadraticCurveTo(90,40,82,64);g.stroke();
    const top=new Path2D();top.arc(82,70,7,Math.PI,0);top.closePath();const bot=new Path2D();bot.arc(82,70,7,0,Math.PI);bot.closePath();
    g.lineWidth=4;g.strokeStyle='#4a1a1a';g.beginPath();g.arc(82,70,7,0,Math.PI*2);g.stroke();g.fillStyle='#e8453a';g.fill(top);g.fillStyle='#fbf8f0';g.fill(bot);}),
  can:paintIcon((g,N)=>{
    const E='#1e3a3a';
    const sp=new Path2D();sp.moveTo(58,58);sp.lineTo(80,28);sp.lineTo(86,32);sp.lineTo(66,64);sp.closePath();part(g,sp,lgrad(g,60,0,86,0,[[0,'#6ad0b8'],[1,'#2e8a78']]),E,5);
    const rose=new Path2D();rose.ellipse(84,27,8,6,-0.9,0,Math.PI*2);part(g,rose,lgrad(g,76,20,92,34,[[0,'#8ae0c8'],[1,'#3a9a84']]),E,4);
    const hd=new Path2D();hd.moveTo(22,40);hd.bezierCurveTo(20,14,58,12,58,38);g.lineWidth=12;g.strokeStyle=E;g.stroke(hd);g.lineWidth=6;g.strokeStyle='#4ab8a0';g.stroke(hd);
    const body=new Path2D();body.moveTo(14,40);body.lineTo(62,40);body.lineTo(66,78);body.quadraticCurveTo(40,86,10,78);body.closePath();part(g,body,lgrad(g,12,0,66,0,[[0,'#8ae8cc'],[0.4,'#4ab8a0'],[1,'#257a6a']]),E);
    const rim=new Path2D();rim.ellipse(38,40,25,6,0,0,Math.PI*2);part(g,rim,'#2e8a78',E,4);
    shine(g,22,48,20,72,4);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(28,54,24,4);}),
  hand:paintIcon((g,N)=>{
    const E='#6a3a3a',fur=lgrad(g,20,20,76,80,[[0,'#fffaf2'],[1,'#e8d8c8']]),bean=lgrad(g,0,20,0,80,[[0,'#ffb8c8'],[1,'#e8788e']]);
    const pad=new Path2D();pad.moveTo(48,44);pad.bezierCurveTo(72,44,80,70,66,80);pad.bezierCurveTo(56,86,40,86,30,80);pad.bezierCurveTo(16,70,24,44,48,44);part(g,pad,fur,E);
    const toes=[[22,38,9,11,-0.4],[38,24,9,12,-0.15],[58,24,9,12,0.15],[74,38,9,11,0.4]];
    for(const [x,y,rx,ry,a] of toes){const t=new Path2D();t.ellipse(x,y,rx,ry,a,0,Math.PI*2);part(g,t,fur,E);}
    g.fillStyle=bean;const pb=new Path2D();pb.moveTo(48,52);pb.bezierCurveTo(64,52,68,70,60,74);pb.bezierCurveTo(54,78,42,78,36,74);pb.bezierCurveTo(28,70,32,52,48,52);g.fill(pb);
    for(const [x,y,rx,ry,a] of toes){const t=new Path2D();t.ellipse(x,y+2,rx*0.55,ry*0.55,a,0,Math.PI*2);g.fill(t);}
    g.fillStyle='rgba(255,255,255,.7)';for(const [x,y] of [[43,58],[35,33],[55,21]]){g.beginPath();g.arc(x,y,2.4,0,Math.PI*2);g.fill();}})};
Object.assign(ICON,TOOL_ICONS);
