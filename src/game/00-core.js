if(!window.THREE){ document.getElementById('bootMsg').textContent='Could not load three.js — check your connection and reload.'; return; }
const T=THREE;
const $=id=>document.getElementById(id);

/* =========================================================
   Curved world: every vertex drops away with distance from the camera
   (shadow depth passes stay flat so shadows line up with lighting)
   ========================================================= */
const CURVE=0.0042;
T.ShaderChunk.project_vertex=`
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
#if defined( DEPTH_PACKING ) || defined( DISTANCE )
	mvPosition = modelViewMatrix * mvPosition;
#else
	vec4 cw_ = modelMatrix * mvPosition;
	vec3 vt_ = viewMatrix[3].xyz;
	vec3 cp_ = -vec3( dot( viewMatrix[0].xyz, vt_ ), dot( viewMatrix[1].xyz, vt_ ), dot( viewMatrix[2].xyz, vt_ ) );
	vec2 cd_ = cw_.xz - cp_.xz;
	cw_.y -= dot( cd_, cd_ ) * ${CURVE.toFixed(5)};
	mvPosition = viewMatrix * cw_;
#endif
gl_Position = projectionMatrix * mvPosition;
`;

/* =========================================================
   Utilities
   ========================================================= */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const K=(x,z)=>x+','+z;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function hash(x,z){const h=Math.sin(x*127.1+z*311.7)*43758.5453;return h-Math.floor(h);}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hi(...a){let h=2166136261;for(const v of a){h^=(v|0)+0x9e3779b9+(h<<6)+(h>>>2);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
const pickR=a=>a[Math.floor(Math.random()*a.length)];
const fmt=n=>Math.floor(n).toLocaleString('en-US');
const shuffle=(a,R)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function pickW(table,filter=()=>true,wf=(k,v)=>v.w,rand=Math.random){let tot=0;const en=[];for(const k in table){if(!filter(k))continue;const w=wf(k,table[k]);if(w>0){en.push([k,w]);tot+=w;}}
  let r=rand()*tot;for(const [k,w] of en){if((r-=w)<=0)return k;}return en.length?en[en.length-1][0]:null;}
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;};

