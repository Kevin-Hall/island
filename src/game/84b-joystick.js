/* =========================================================
   An optional joystick (Settings → Joystick): drag the stick to walk; taps on things still use them
   ========================================================= */
// The stick sits low on the left. Its push is turned into a direction on the ground as the camera sees it (up on the
// stick is away from the camera), and the further you push, the faster you go (joy.mag scales your walking speed in
// 90-main). Holding it cancels any tap-walk and its errand. Arrow keys and WASD do the same on a keyboard.
const joy={on:false,x:0,y:0,mag:0,id:null,keys:new Set()};
function joyShow(){let el=$('joy');if(!el){el=document.createElement('div');el.id='joy';el.innerHTML='<i></i>';document.body.appendChild(el);
    const R=46,knob=el.firstChild,move=e=>{const b=el.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;let x=(e.clientX-cx)/R,y=(e.clientY-cy)/R;const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}
      joy.x=x;joy.y=y;knob.style.transform=`translate(${x*R}px,${y*R}px)`;};
    el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();joy.id=e.pointerId;el.setPointerCapture(e.pointerId);el.classList.add('on');move(e);});
    el.addEventListener('pointermove',e=>{if(e.pointerId!==joy.id)return;e.preventDefault();move(e);});
    const up=e=>{if(e.pointerId!==joy.id)return;joy.id=null;joy.x=joy.y=0;knob.style.transform='';el.classList.remove('on');};
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);}
  el.hidden=!S.joy;}
addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){joy.keys.add(k);if(k.startsWith('arrow'))e.preventDefault();}});
addEventListener('keyup',e=>joy.keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>joy.keys.clear());
function joyStep(dt){let x=joy.x,y=joy.y;const K0=joy.keys;
  if(K0.size){x=(K0.has('arrowright')||K0.has('d')?1:0)-(K0.has('arrowleft')||K0.has('a')?1:0);y=(K0.has('arrowdown')||K0.has('s')?1:0)-(K0.has('arrowup')||K0.has('w')?1:0);const m=Math.hypot(x,y);if(m){x/=m;y/=m;}}
  const m=Math.hypot(x,y),busy=caught||fishing||sheet||charEd||inside||placing||document.body.classList.contains('chatting');
  if(m<0.18||busy){if(joy.on){joy.on=false;vil.tx=vil.x;vil.tz=vil.z;}joy.mag=0;return;}
  // up the stick is away from the camera
  const c=Math.cos(cam.yaw),s=Math.sin(cam.yaw),mx=c*x+s*y,mz=-s*x+c*y;
  joy.on=true;joy.mag=Math.min(1,(m-0.18)/0.6+0.35);vil.path=null;vil.cb=null;vil.noReach=false;vil.idle=0;vil.tx=vil.x+mx*0.8;vil.tz=vil.z+mz*0.8;}
