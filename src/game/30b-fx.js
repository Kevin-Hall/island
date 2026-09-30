/* =========================================================
   Visual styles (Settings → Developer → Visual style): each one re-grades the whole picture through the post shader
   (30-render), changes how many steps of light the toon shading has, and how big the pixels are. The island itself
   doesn't change, only how it's filmed. S.fx remembers the choice.
   ========================================================= */
const FX_BASE={sat:1,con:1,br:1,fade:0,tS:[1,1,1],tH:[1,1,1],edge:1,edgeC:[.36,.32,.46],dith:1,levels:22,grain:0,vig:.14,bloom:1,grade:1,pal:0,tilt:0,scan:0,paper:0,px:0,ramp:[88,160,222,255]};
const FXS={
  island:   {name:'Driftseed',  desc:'The island as it is'},
  wildworld:{name:'Wild World', desc:'Chunky handheld pixels, soft flat colour',sat:1.18,con:.96,br:1.08,fade:.05,tS:[1.02,1.02,1.06],tH:[1.04,1.02,.94],edge:.35,edgeC:[.5,.44,.52],dith:0,levels:14,vig:0,bloom:.2,grade:.5,px:2,ramp:[140,200,245,255]},
  wildsoft: {name:'Wild World Soft',desc:'A gentler Wild World: softer pixels and colour',sat:1.08,con:.98,br:1.04,fade:.03,tS:[1.01,1.01,1.03],tH:[1.02,1.01,.97],edge:.6,edgeC:[.44,.39,.49],dith:0,levels:18,vig:.06,bloom:.55,grade:.75,px:1,ramp:[112,178,232,255]},
  windwaker:{name:'Wind Waker', desc:'Bold two-tone cel shading and bright sea colours',sat:1.45,con:1.1,br:1.14,tS:[.9,.95,1.14],tH:[1.05,1.02,.95],edge:2.4,edgeC:[.1,.1,.2],dith:0,levels:64,vig:.05,bloom:2.4,px:-1,ramp:[120,120,255,255]},
  storybook:{name:'Storybook',  desc:'Soft watercolour on paper',sat:.8,con:.86,br:1.1,fade:.1,tS:[1.04,1,.94],tH:[1.05,1.02,.92],edge:.7,edgeC:[.58,.46,.4],dith:0,levels:48,grain:.015,vig:.1,bloom:1.4,grade:.7,paper:1,px:-.5,ramp:[140,185,225,250]},
  film:     {name:'35mm Film',  desc:'Grain, faded blacks, teal shadows, warm light',sat:.8,con:1.14,fade:.11,tS:[.8,1.02,1.14],tH:[1.13,1,.82],edge:.7,dith:0,levels:64,grain:.09,vig:.45,bloom:2,grade:.6,px:-.5},
  golden:   {name:'Golden Hour',desc:'Everything bathed in late sun',sat:1.15,con:1.08,br:1.02,fade:.03,tS:[1.02,.84,.88],tH:[1.26,1.02,.7],edge:.8,edgeC:[.42,.28,.3],dith:0,levels:48,vig:.26,bloom:2.6},
  diorama:  {name:'Tilt-shift', desc:'A tiny model island on a tabletop',sat:1.28,con:1.1,br:1.03,edge:.9,dith:0,levels:64,vig:.12,bloom:1.2,tilt:1,px:-.5},
  neon:     {name:'Neon Night', desc:'Vaporwave pinks and cyans, with scanlines',sat:1.3,con:1.1,tS:[.88,.78,1.28],tH:[1.22,.9,1.12],edge:1.2,edgeC:[.3,.1,.5],dith:0,levels:64,vig:.32,bloom:2.6,scan:1},
  noir:     {name:'Noir',       desc:'Black and white, with grain',con:1.28,pal:2,edge:1.4,edgeC:[.1,.1,.1],dith:0,levels:64,grain:.08,vig:.42,ramp:[60,120,200,255]},
  sepia:    {name:'Old Photo',  desc:'A faded sepia print',con:1.05,fade:.1,pal:3,edge:.9,edgeC:[.3,.24,.2],dith:0,levels:64,grain:.05,vig:.5,px:-.5},
  gameboy:  {name:'Game Boy',   desc:'Four shades of green',pal:1,edge:1.2,edgeC:[.2,.2,.2],levels:4,vig:0,bloom:0,grade:0,px:2},
};
function fxNow(){const F=Object.assign({},FX_BASE,FXS[S.fx]||FXS.island);if(S.scan!==undefined)F.scan=S.scan?1:0;/* the Scanlines switch in Settings overrides the style */return F;}
function fxPx(){try{return fxNow().px;}catch(e){return 0;}}
function applyFx(){const F=fxNow(),u=postMat.uniforms;
  u.fxA.value.set(F.sat,F.con,F.br,F.fade);u.tS.value.set(...F.tS);u.tH.value.set(...F.tH);u.edgeK.value=F.edge;u.edgeC.value.set(...F.edgeC);u.dith.value=F.dith;u.levels.value=F.levels;
  u.grain.value=F.grain;u.vig.value=F.vig;u.bloomK.value=F.bloom;u.gradeK.value=F.grade;u.pal.value=F.pal;u.tilt.value=F.tilt;u.scan.value=F.scan;u.paper.value=F.paper;
  // the toon ramp: how many bands of light and shade every surface is painted in
  const d=grad.image.data;F.ramp.forEach((v,i)=>{d[i*4]=d[i*4+1]=d[i*4+2]=v;});grad.needsUpdate=true;}
function setFx(k){S.fx=k;applyFx();resize();save();}
applyFx();
