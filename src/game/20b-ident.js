/* =========================================================
   Visual identity (Settings → Look): how the whole world is drawn, not just filmed.
   - Classic: the island as it's always been
   - Clean: flat colour and soft light, pale cliffs, a calm turquoise sea with little white wave marks, no grass blades
     or clutter, crisp edges (no pixels)
   - Hike: painted streaks down the cliffs, a deep sea drawn in wavy lighter lines, warm light and a
     few soft sun rays across the screen, crisp (no chunky pixels)
   It reshapes things built as the island loads (textures 31-ground, grass 42-grass, tufts 44-terrain, undergrowth
   85d, cliff colours below, the sea shader 30-render, the visual style 30b-fx), so a change reloads the page.
   ========================================================= */
const IDENTS={
  classic:{name:'Classic',desc:'The island as it is'},
  clean:{name:'Clean',desc:'Flat colour, soft light and a calm turquoise sea',blades:false,tufts:false,flora:0.35,tex:'flat',sea:1,fx:'clean',cliffTo:0xf4f1ea,cliffK:0.82},
  hike:{name:'Hike',desc:'Painted cliffs, warm light and a sea of wavy lines',blades:false,tufts:true,flora:0.6,tex:'paint',sea:2,fx:'hike',cliffTo:0xb8a090,cliffK:0.3}};
const IDENT=IDENTS[S.ident]||IDENTS.classic;
// paler (or warmer) cliffs everywhere (BIOMES, 10-data; the frontier's own styles follow in 44b)
const identMix=(a,b,t)=>{const r=(a>>16&255)*(1-t)+(b>>16&255)*t,g=(a>>8&255)*(1-t)+(b>>8&255)*t,bl=(a&255)*(1-t)+(b&255)*t;return(Math.round(r)<<16)|(Math.round(g)<<8)|Math.round(bl);};
if(IDENT.cliffTo)for(const k in BIOMES)if(BIOMES[k].cliff!=null)BIOMES[k].cliff=identMix(BIOMES[k].cliff,IDENT.cliffTo,IDENT.cliffK);
// the ground textures, redrawn for the look (31-ground calls this on each as it makes it)
function identTex(kind,g,n,R){if(!IDENT.tex)return false;const base={grass:236,path:238,sand:244,cliff:238}[kind],sh=v=>`rgb(${v},${v},${v})`;g.fillStyle=sh(base);g.fillRect(0,0,n,n);
  if(IDENT.tex==='flat')return true;
  if(kind==='grass'){for(let i=0;i<10;i++){g.fillStyle=sh(212);const x=Math.floor(R()*n),y=Math.floor(R()*n);g.fillRect(x,y,1,2);g.fillRect(x+2,y+1,1,2);}}/* a few painted grass flicks */
  else if(kind==='cliff'){for(let i=0;i<14;i++){g.fillStyle=sh(R()<0.5?196:214);const y=Math.floor(R()*n),x=Math.floor(R()*n),w=6+Math.floor(R()*16);g.fillRect(x,y,w,2);g.fillRect((x+w)%n,y+1,4,1);}}/* brushy streaks across the rock */
  else if(kind==='sand'){for(let i=0;i<12;i++){g.fillStyle=sh(226);g.fillRect(Math.floor(R()*n),Math.floor(R()*n),1,1);}}
  else{for(let i=0;i<8;i++){g.fillStyle=sh(220);g.fillRect(Math.floor(R()*n),Math.floor(R()*n),2,1);}}
  return true;}
function setIdent(k){if(!IDENTS[k]||(S.ident||'classic')===k)return;S.ident=k;S.fx=IDENTS[k].fx||'island';save();resetting=true;location.reload();}
