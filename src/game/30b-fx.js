/* =========================================================
   Visual styles (Settings → Developer → Visual style): each one re-grades the whole picture through the post shader
   (30-render), changes how many steps of light the toon shading has, and how big the pixels are. The island itself
   doesn't change, only how it's filmed. S.fx remembers the choice.
   ========================================================= */
// ramp: the toon bands, shadow to sunlit (leaf: foliage's); soft: how softly they melt together; warm: the glow where light
// gives way to shade; cool: how blue the shadows lean; rim: the rim light round silhouettes (30-render)
const FX_BASE={sat:1,con:1,br:1,fade:0,tS:[1,1,1],tH:[1,1,1],edge:1,edgeC:[.36,.32,.46],dith:1,levels:22,grain:0,vig:.14,bloom:1,grade:1,pal:0,tilt:0,scan:0,paper:0,px:0,ramp:[88,160,222,255],leaf:[72,140,208,255],soft:0,warm:0,cool:0,rim:1,roll:.06,yroll:.5,haze:.1,hzK:1.9,hzT:[1.02,1,.98]};
let fxHzK=1.9;
let fxRim=1;
const FXS={
  island:   {name:'Driftseed',  desc:'The island as it is',sat:1.1,con:1.04,br:1.02,tS:[.97,.98,1.04],tH:[1.04,1.01,.95],soft:.07,warm:1,cool:1},
  wildworld:{name:'Wild World', desc:'Chunky handheld pixels, soft flat colour',sat:1.16,con:1.02,br:1.04,fade:.02,tS:[1.02,1.02,1.06],tH:[1.04,1.02,.94],edge:.35,edgeC:[.5,.44,.52],dith:0,levels:14,vig:.12,bloom:.2,grade:.5,px:2,ramp:[140,200,245,255],soft:.02,rim:.6},
  wildsoft: {name:'Wild World Soft',desc:'A gentler Wild World: softer pixels and colour',sat:1.08,con:.98,br:1.04,fade:.03,tS:[1.01,1.01,1.03],tH:[1.02,1.01,.97],edge:.6,edgeC:[.44,.39,.49],dith:0,levels:18,vig:.06,bloom:.55,grade:.75,px:1,ramp:[112,178,232,255],soft:.05,warm:.6,cool:.5},
  windwaker:{name:'Wind Waker', desc:'Bold two-tone cel shading and bright sea colours',sat:1.45,con:1.1,br:1.14,tS:[.9,.95,1.14],tH:[1.05,1.02,.95],edge:2.4,edgeC:[.1,.1,.2],dith:0,levels:64,vig:.05,bloom:2.4,px:-1,ramp:[120,120,255,255],rim:1.3},
  storybook:{name:'Storybook',  desc:'Soft watercolour on paper',sat:.8,con:.86,br:1.1,fade:.1,tS:[1.04,1,.94],tH:[1.05,1.02,.92],edge:.7,edgeC:[.58,.46,.4],dith:0,levels:48,grain:.015,vig:.1,bloom:1.4,grade:.7,paper:1,px:-.5,ramp:[140,185,225,250],soft:.12,warm:.5,cool:.3},
  film:     {name:'35mm Film',  desc:'Grain, faded blacks, teal shadows, warm light',sat:.8,con:1.14,fade:.11,tS:[.8,1.02,1.14],tH:[1.13,1,.82],edge:.7,dith:0,levels:64,grain:.09,vig:.45,bloom:2,grade:.6,px:-.5,soft:.08,warm:.7,cool:.8},
  golden:   {name:'Golden Hour',desc:'Everything bathed in late sun',sat:1.15,con:1.08,br:1.02,fade:.03,tS:[1.02,.84,.88],tH:[1.26,1.02,.7],edge:.8,edgeC:[.42,.28,.3],dith:0,levels:48,vig:.26,bloom:2.6,soft:.07,warm:1.4,cool:.6},
  diorama:  {name:'Tilt-shift', desc:'A tiny model island on a tabletop',sat:1.28,con:1.1,br:1.03,edge:.9,dith:0,levels:64,vig:.12,bloom:1.2,tilt:1,px:-.5,soft:.06,warm:.7,cool:.6},
  neon:     {name:'Neon Night', desc:'Vaporwave pinks and cyans, with scanlines',sat:1.3,con:1.1,tS:[.88,.78,1.28],tH:[1.22,.9,1.12],edge:1.2,edgeC:[.3,.1,.5],dith:0,levels:64,vig:.32,bloom:2.6,scan:1,rim:1.2},
  noir:     {name:'Noir',       desc:'Black and white, with grain',con:1.28,pal:2,edge:1.4,edgeC:[.1,.1,.1],dith:0,levels:64,grain:.08,vig:.42,ramp:[60,120,200,255],rim:.6},
  sepia:    {name:'Old Photo',  desc:'A faded sepia print',con:1.05,fade:.1,pal:3,edge:.9,edgeC:[.3,.24,.2],dith:0,levels:64,grain:.05,vig:.5,px:-.5,rim:.6},
  // ambient looks: soft light, gentle haze, colour that sits together
  meadow:   {name:'Sunny Meadow',desc:'Clean, bright daylight with a soft glow',sat:1.14,con:1.06,br:1.04,tS:[.94,.99,1.08],tH:[1.06,1.03,.94],bloom:1.6,soft:.08,warm:1,cool:1,haze:.08},
  ghibli:   {name:'Painted Summer',desc:'Lush and painterly: warm sunlight, deep cool shade, a hazy distance',sat:1.22,con:1.02,br:1.04,fade:.03,tS:[.82,.95,1.16],tH:[1.1,1.04,.88],edge:.45,edgeC:[.36,.36,.5],bloom:2.4,ramp:[96,168,232,255],soft:.2,warm:1.5,cool:1.6,haze:.24,hzK:1.25,hzT:[.96,1.02,1.1],grain:.008},
  dreamy:   {name:'Dreamy Pastel',desc:'Soft pastels and a pink haze, like a memory',sat:.78,con:.86,br:1.14,fade:.14,tS:[1.05,.94,1.12],tH:[1.08,1.01,1.02],edge:.4,edgeC:[.62,.5,.64],bloom:3,ramp:[130,190,238,255],soft:.2,vig:.12,warm:.8,cool:.4,haze:.3,hzK:1.1,hzT:[1.1,.98,1.06]},
  cozyfall: {name:'Cosy Amber',desc:'Late-afternoon amber light and warm shadows',sat:1.1,con:1.06,br:1.01,tS:[.92,.84,.96],tH:[1.2,1.04,.8],edge:.8,edgeC:[.4,.28,.26],bloom:2,vig:.3,soft:.12,warm:1.7,cool:.5,grain:.015,haze:.18,hzT:[1.16,1,.8]},
  misty:    {name:'Misty Morning',desc:'Cool and quiet, soft white mist in the distance',sat:.8,con:.92,br:1.07,fade:.1,tS:[.92,.98,1.08],tH:[1.03,1.02,.99],bloom:1.6,soft:.14,vig:.14,warm:.4,cool:1.1,haze:.46,hzK:.8,hzT:[1.06,1.08,1.1]},
  bluehour: {name:'Blue Hour',desc:'Cool dusk light, warm glowing windows and lamps',sat:1.02,con:1.08,br:.88,tS:[.74,.86,1.26],tH:[1.18,1,.86],bloom:2.8,vig:.38,soft:.08,warm:1.3,cool:1.6,haze:.2,hzT:[.86,.94,1.16]},
  // the visual identities' own (20b-ident)
  clean:    {name:'Clean',desc:'Flat colour and soft light, crisp edges',sat:1.12,con:1.02,br:1.05,tS:[.96,1,1.04],tH:[1.03,1.02,.97],edge:.35,edgeC:[.4,.4,.46],dith:0,levels:64,vig:.04,bloom:.6,grade:.6,px:-1,ramp:[176,176,255,255],leaf:[160,160,250,255],soft:.04,warm:.5,cool:.5,rim:.6,haze:.06},
  hike:     {name:'Hike',desc:'Warm light, crisp edges, soft sun rays',sat:1.08,con:1.04,br:1.02,fade:.02,tS:[.94,.94,1.06],tH:[1.05,1.02,.93],edge:.3,edgeC:[.42,.32,.36],dith:0,levels:64,vig:.1,bloom:.8,grade:.6,px:-1,ramp:[136,200,245,255],soft:.03,warm:.9,cool:.8,rays:1,haze:.08},
  lofi:     {name:'Lo-fi',desc:'Muted and warm, chunky pixels and film grain',sat:.88,con:.95,fade:.1,tS:[.9,1,1.04],tH:[1.1,1.02,.88],dith:0,levels:16,px:1,grain:.05,vig:.3,bloom:1.2,soft:.06,warm:.9,cool:.6,haze:.12},
  gameboy:  {name:'Game Boy',   desc:'Four shades of green',pal:1,edge:1.2,edgeC:[.2,.2,.2],levels:4,vig:0,bloom:0,grade:0,px:2,rim:0},
};
function fxNow(){const F=Object.assign({},FX_BASE,FXS[S.fx]||FXS.island);if(S.scan!==undefined)F.scan=S.scan?1:0;/* the Scanlines switch in Settings overrides the style */return F;}
function fxPx(){try{return fxNow().px;}catch(e){return 0;}}
function applyFx(){const F=fxNow(),u=postMat.uniforms;u.rays.value=F.rays||0;
  u.fxA.value.set(F.sat,F.con,F.br,F.fade);u.tS.value.set(...F.tS);u.tH.value.set(...F.tH);u.edgeK.value=F.edge;u.edgeC.value.set(...F.edgeC);u.dith.value=F.dith;u.levels.value=F.levels;
  u.atmo.value.x=F.roll;u.atmo.value.y=F.yroll;u.atmo.value.w=F.haze;fxHzK=F.hzK;u.hzT.value.set(...F.hzT);u.grain.value=F.grain;u.vig.value=F.vig;u.bloomK.value=F.bloom;u.gradeK.value=F.grade;u.pal.value=F.pal;u.tilt.value=F.tilt;u.scan.value=F.scan;u.paper.value=F.paper;
  // the toon ramps: how many bands of light and shade every surface is painted in, and how softly
  paintRamp(grad,F.ramp,F.soft,F.warm,F.cool);paintRamp(leafGrad,F.leaf,F.soft,F.warm*0.8,F.cool);fxRim=F.rim;}
// four bands (shadow to sunlit) meeting a quarter, half and three quarters of the way along, their edges softened by
// `soft`; a warm glow just on the lit side of where light gives way to shade (`warm`) and bluer shadows (`cool`)
function paintRamp(t,vals,soft,warm,cool){const d=t.image.data,n=d.length/4;
  for(let i=0;i<n;i++){const x=(i+0.5)/n;let v=vals[0];for(let b=1;b<4;b++){const e=b*0.25;v+=(vals[b]-vals[b-1])*(soft>0?smooth(e-soft,e+soft,x):x>=e?1:0);}
    const w=Math.exp(-(((x-0.56)/0.1)**2))*warm,c=clamp(1-x*2,0,1)*cool;
    d[i*4]=clamp(v*(1+0.14*w-0.05*c),0,255);d[i*4+1]=clamp(v*(1+0.03*w-0.02*c),0,255);d[i*4+2]=clamp(v*(1-0.1*w+0.08*c),0,255);d[i*4+3]=255;}
  t.needsUpdate=true;}
function setFx(k){S.fx=k;applyFx();resize();save();}
applyFx();
