/* =========================================================
   Talking with villagers: a close-up, typed-out conversation
   ========================================================= */
// talkTo (57-villagers) opens a chat: the camera eases in low beside the two of you (chatCam), the HUD fades away and a
// plain card at the bottom types out what they say, a soft blip per letter in their own voice (VOICE by species, lower
// or higher by personality). Tap to finish the line, tap again for the next. A chat is a queue of steps (chat.q):
// {say} a line from them, {me} your reply, {note} a quiet narrator line, {ask} a question with replies to pick, {menu}
// the end: chat more, give today's wish, or say goodbye. What they say comes from TALK (57c-talkbank) and the memory
// lines in 57-routines; a line's [mood] sets their face and an emote over their head.
const VOICE={cat:1.25,dog:1,bear:0.72,rabbit:1.35,frog:0.9,duck:1.3,penguin:1.1,squirrel:1.45,sheep:1.05,koala:0.85,fox:1.15,otter:1.1,hedgehog:1.3,deer:1.05};
const PVOICE={sailor:0.8,dreamer:1.15,tinkerer:1.05,homebody:1,explorer:1.1,scholar:0.9};
const PCOL={sailor:'#4a78b8',dreamer:'#a07ad0',tinkerer:'#d8843a',homebody:'#e0708a',explorer:'#3ea070',scholar:'#8a5a4a'};
const EMOTE={happy:'♪',laugh:'ha ha!',think:'…',sad:'◞‸◟',wow:'!',love:'♥',shy:'///',grump:'#'};
let chat=null,chatBack=null;const FOV0=camera.fov,CHAT_FOV=44;/* a wider lens, closer in, while you talk: fewer things can get between the camera and you two */
const pickOf=(a,R=Math.random)=>a[Math.floor(R()*a.length)];
function chatNick(n){const d=S.npc[n.i],T0=TALK[n.pers];return d.nick||(d.f>=3?T0.nick[1]:T0.nick[0]);}
function fillTok(n,s,extra={}){const q=npcQuirks(n),others=npcs.filter(o=>o!==n);
  return s.replace(/\{(\w+)\}/g,(m,k)=>k==='you'?chatNick(n):k==='name'?n.name:k==='isle'?TOWN.name:k==='cp'?n.cp[0].toUpperCase()+n.cp.slice(1):k==='pal'?(others.length?pickOf(others).name:'the lighthouse keeper')
    :k==='crop'?CROPS[S.demand].name.toLowerCase():k==='season'?season():q[k]!==undefined?q[k]:extra[k]!==undefined?extra[k]:m);}
// the opening line: first meeting, then friendship, weather or the time of day
function chatHello(n){const T0=TALK[n.pers].hello,d=S.npc[n.i],h=S.hour;
  if(!d.met){d.met=1;return pickOf(T0.first);}
  if(d.f>=8&&Math.random()<0.5)return pickOf(T0.best);if(d.f>=5&&Math.random()<0.4)return pickOf(T0.friend);if(S.rain&&Math.random()<0.6)return pickOf(T0.rain);
  return pickOf(h<5||h>=22?T0.night:h<11?T0.morning:h<18?T0.day:T0.evening);}
// something to talk about: today's wish first, then a conversation you haven't had, something they remember, a quirk, or small talk
function chatTopic(n){const T0=TALK[n.pers],d=S.npc[n.i],w=npcWish(n),out=[];
  if(d.f>=6&&!d.nick){const nk=T0.nick[2+Math.floor(Math.random()*(T0.nick.length-2))];d.nick=nk;out.push({say:`[shy]You know what? I’m going to call you “${nk}” from now on. Is that all right? Good. It suits you.`});return out;}
  if(!w.done&&d.wishAsked!==S.day){d.wishAsked=S.day;out.push({say:fillTok(n,pickOf(T0.wish),{item:nameOf(w.k)})});return out;}
  const r=Math.random(),seen=d.seen||(d.seen=[]),ok=T0.convos.map((c,i)=>i).filter(i=>(T0.convos[i].need||0)<=d.f);
  if(r<0.42&&ok.length){let fresh=ok.filter(i=>!seen.includes(i));if(!fresh.length){d.seen=[];fresh=ok;}const i=pickOf(fresh);d.seen.push(i);const c=T0.convos[i];
    for(const l of c.lines||[])out.push({say:fillTok(n,l)});out.push({ask:fillTok(n,c.ask),opts:c.opts.map(([a,b,df])=>[fillTok(n,a),fillTok(n,b),df]),ci:i});return out;}
  if(r<0.6){const s=Math.random()<0.5?activityLine(n):Math.random()<0.6?memoryLine(n):neighbourLine(n);if(s){out.push({say:s});return out;}}
  if(r<0.74){const S0=TALK[n.pers].self,ks=['fav','collect','hate'].concat(d.f>=4?['fear']:[],d.f>=7?['dream']:[]);out.push({say:fillTok(n,pickOf(S0[pickOf(ks)]))});return out;}
  const a=pickOf(T0.small);out.push({say:fillTok(n,a)});if(Math.random()<0.35){let b=pickOf(T0.small);if(b!==a)out.push({say:fillTok(n,b)});}return out;}
function startChat(n,first){if(!n)return;clearAction();const room=!!inside;
  chat={n,q:[],cur:null,shown:0,t:0,room,saved:room?null:{dist:cam.dist,pitch:cam.pitch,yaw:cam.yaw},chats:0,fx:vil.x,fz:vil.z};chatBack=null;
  chat.prev=n.state;if(!room){n.state='talk';n.t=0;n.path=null;}
  if(first)chat.q.push({say:first});else{chat.q.push({say:fillTok(n,chatHello(n))});chat.q.push(...chatTopic(n));}chat.q.push({menu:1});
  document.body.classList.add('chatting');$('chat').hidden=false;chatNext();}
function chatEnd(){if(!chat)return;const n=chat.n;if(n&&!chat.room&&n.state==='talk'){n.state='idle';n.wait=1.5;}if(chat.saved)chatBack={...chat.saved,t:0};chat=null;
  $('chat').hidden=true;document.body.classList.remove('chatting');ctxSig='';updateCtx();updateHUD();}
// show the next step
function chatNext(){if(!chat)return;const s=chat.q.shift();if(!s){chatEnd();return;}chat.cur=s;chat.shown=0;chat.t=0;const n=chat.n,d=S.npc[n.i];
  const box=$('chatBox'),opts=$('chatOpts');opts.innerHTML='';opts.hidden=true;
  let txt=s.say||s.ask||s.me||s.note||'';const m=/^\[(\w+)\]\s*/.exec(txt);if(m){txt=txt.slice(m[0].length);chatMood(n,m[1]);}
  if(s.menu){txt=fillTok(n,pickOf(['Anything else, {you}?','So… what now?','Hm?','What else is on your mind?']));}
  s.txt=txt;$('chatName').textContent=s.me?'You':s.note?'':n.name;$('chatName').style.background=s.me?'#2cc3b2':PCOL[n.pers]||'#8a6a4a';$('chatName').hidden=!!s.note;
  $('chatSub').textContent=s.me||s.note?'':`${PERS[n.pers].label} ${n.sp} · ♥ ${d.f}/10`;box.classList.toggle('narr',!!s.note);box.classList.toggle('me',!!s.me);$('chatText').textContent='';$('chatMore').hidden=true;}
function chatMood(n,m){if(['happy','laugh','love','wow'].includes(m))n.happyT=1.6;const e=EMOTE[m];if(e&&!chat.room)floatText(n.x,n.y+1.35,n.z,e);}
// the typing, the voice, the camera
function updateChat(dt,tt){
  if(chatBack&&!chat){chatBack.t+=dt;const k=Math.min(1,dt*3);camera.fov+=(FOV0-camera.fov)*k;if(chatBack.t>1.4)camera.fov=FOV0;camera.updateProjectionMatrix();cam.dist+=(chatBack.dist-cam.dist)*k;cam.pitch+=(chatBack.pitch-cam.pitch)*k;cam.yaw+=angDiff(cam.yaw,chatBack.yaw)*k;if(chatBack.t>1.4)chatBack=null;}
  if(!chat)return;const n=chat.n,s=chat.cur;if(!chat.room)n.t=0;
  if(s&&s.txt!==undefined&&chat.shown<s.txt.length){chat.t+=dt;let budget=chat.t;chat.t=0;
    while(chat.shown<s.txt.length&&budget>0){const ch=s.txt[chat.shown];const cost=/[.!?…]/.test(ch)?0.16:ch===','?0.08:0.028;if(budget<cost){chat.t=budget;break;}budget-=cost;chat.shown++;
      if(!s.me&&!s.note&&chat.shown%2===0&&/[a-z]/i.test(ch)){const v=(VOICE[n.sp]||1)*(PVOICE[n.pers]||1),f=240*v*(/[aeiouy]/i.test(ch)?1.12:0.95)*(0.92+Math.random()*0.18)*(s.ask&&chat.shown>s.txt.length-6?1.2:1);tone(f,0.045,'triangle',0.022);}}
    $('chatText').textContent=s.txt.slice(0,chat.shown);if(!s.me&&!s.note)n.talkT=0.15;if(chat.shown>=s.txt.length)chatDone();}
  if(chat.room)return;
  // face each other
  villager.rotation.y+=angDiff(villager.rotation.y,Math.atan2(n.x-vil.x,n.z-vil.z))*Math.min(1,dt*6);
  // the camera: low and close, side-on to the two of you, a little in front so you stand above the card
  const mx=(vil.x+n.x)/2,mz=(vil.z+n.z)/2,la=Math.atan2(n.x-vil.x,n.z-vil.z);
  // pick the angle to look from: side-on to the two of you, turned a little towards the villager's face (more on a tall
  // screen, so you stand closer together across it), on whichever side has the fewest trees and walls in the way
  const port0=camera.aspect<0.8,tw=port0?0.55:0.25,toMe=la+Math.PI,twist=y=>y+(Math.cos(angDiff(toMe,y+tw))>=Math.cos(angDiff(toMe,y-tw))?tw:-tw);
  chat.pk=(chat.pk||0)-dt;if(chat.pk<=0||chat.yw===undefined){chat.pk=0.8;let best=null,bs=1e9;
    for(const off of [0,Math.PI,0.45,Math.PI-0.45,-0.45,Math.PI+0.45]){const y=twist(la+Math.PI/2+off);let c=0;
      for(let t=0.9;t<13;t+=0.5)for(const w of [-0.9,0,0.9]){const x=Math.round(mx+Math.sin(y)*t+Math.cos(y)*w),z=Math.round(mz+Math.cos(y)*t-Math.sin(y)*w),h=occH(x,z);if(h>0.75+t*0.3)c+=(t<4?3:2)*(w?0.5:1);}
      const sc=c*10+Math.abs(angDiff(chat.saved.yaw,y))+Math.abs(off%Math.PI)*0.6;if(sc<bs){bs=sc;best=y;}}
    if(chat.yw===undefined||Math.abs(angDiff(chat.yw,best))>0.3)chat.yw=best;}
  const yw=chat.yw;
  const k=Math.min(1,dt*2.4),port=camera.aspect<0.8,dist=(port?9.5:8.5)*Math.tan(FOV0*Math.PI/360)/Math.tan(CHAT_FOV*Math.PI/360);camera.fov+=(CHAT_FOV-camera.fov)*k;camera.updateProjectionMatrix();cam.yaw+=angDiff(cam.yaw,yw)*k;cam.dist+=(dist-cam.dist)*k;cam.pitch+=(0.36-cam.pitch)*k;
  const lead=port?0.75:0.4;chat.fx+=(mx+Math.sin(cam.yaw)*lead-chat.fx)*k;chat.fz+=(mz+Math.cos(cam.yaw)*lead-chat.fz)*k;}
// how tall whatever stands on a tile is, for choosing a clear view (trees, buildings, lamps, decor)
function occH(x,z){const k=K(x,z);if(islMap.get(k)!==0)return 0;const e=debMesh.get(k);if(e&&e.d)return e.d.k==='tree'?3.2:SOLID_R[e.d.k]?0.7:0;
  if(TOWN.res.get(k)==='tree')return 3.2;const f=TOWN.fixed.get(k);if(f)return f==='decor'?1.4:f==='plot'?0.3:f==='lighthouse'?4:2.8;const tl=S.tiles[k];if(tl&&tl.crop)return tl.crop.p>=1?2.2:tl.crop.p*1.6;const o=objAt(x,z);if(o)return OBJ_H[o.k]?OBJ_H[o.k]*(['pine','oak','palm'].includes(o.k)?2.2:1.4):0.8;return 0;}
const chatFocus=()=>chat&&!chat.room?[chat.fx,chat.fz]:[vil.x,vil.z];
// a line finished typing: questions show their replies, the menu its choices, anything else waits for a tap
function chatDone(){const s=chat.cur,opts=$('chatOpts');if(s.done)return;s.done=true;
  if(s.ask){opts.innerHTML=s.opts.map((o,i)=>`<button data-o="${i}">${o[0]}</button>`).join('');opts.hidden=false;return;}
  if(s.menu){const n=chat.n,w=npcWish(n),have=!w.done&&invFor(w.k),bs=[];
    if(have)bs.push(`<button data-m="give" class="hi">Give ${nameOf(have)}</button>`);else if(!w.done)bs.push(`<button data-m="wish">What are you hoping for?</button>`);
    bs.push(`<button data-m="chat">Let’s chat</button>`,`<button data-m="bye">See you later</button>`);opts.innerHTML=bs.join('');opts.hidden=false;return;}
  $('chatMore').hidden=false;}
function chatTap(){if(!chat)return;const s=chat.cur;if(!s)return;
  if(s.txt!==undefined&&chat.shown<s.txt.length){chat.shown=s.txt.length;$('chatText').textContent=s.txt;chatDone();return;}
  if(s.ask||s.menu)return;/* pick a reply */chatNext();}
function chatPick(i){const s=chat.cur,n=chat.n,d=S.npc[n.i];const [mine,theirs,df]=s.opts[i];SFX.ui();
  // how you answered moves your friendship a little (at most twice a day from answers)
  if(df&&d.chatDay!==S.day){d.chatDay=S.day;d.chatN=0;}if(df&&(d.chatN||0)<2){d.chatN=(d.chatN||0)+1;d.f=clamp(d.f+df,0,10);if(df>0)hearts(n.x,n.y+1,n.z);}
  chat.q.unshift({me:mine},{say:theirs});chatNext();}
function chatMenu(m){const n=chat.n;SFX.ui();
  if(m==='bye'){chat.q=[{say:fillTok(n,pickOf(TALK[n.pers].bye)),bye:1}];chatNext();chat.cur.last=1;return;}
  if(m==='chat'){chat.chats++;const d=S.npc[n.i];
    if(chat.chats>=4&&Math.random()<0.5){chat.q.push({say:fillTok(n,pickOf(['[laugh]We’ve been nattering for ages, {you}! I should get on. Come find me later?','[think]I’d best get back to it, {you}. But this was lovely.','Oh, look at the time! Well, the sun. Look at the sun.']))},{menu:1});}
    else{chat.q.push(...chatTopic(n),{menu:1});}chatNext();return;}
  if(m==='wish'){const w=npcWish(n);chat.q.push({say:fillTok(n,pickOf(TALK[n.pers].wish),{item:nameOf(w.k)})},{menu:1});chatNext();return;}
  if(m==='give'){const w=npcWish(n),have=invFor(w.k);if(have)giveWish(n,have);}}
// after a gift: their thanks, then what they gave you back
function chatAfterGift(n,key,pay,extra){if(!chat)startChat(n,'…');chat.q=[{say:fillTok(n,pickOf(TALK[n.pers].thanks),{item:nameOf(key)})},{note:`${n.name} gives you ${fmt(pay)} shells${extra.replace(/<\/?b>/g,'')}.`},{menu:1}];n.happyT=2.5;chatNext();}
$('chat').addEventListener('click',e=>{if(!chat)return;const b=e.target.closest('button');
  if(b&&b.dataset.o!==undefined){chatPick(+b.dataset.o);return;}if(b&&b.dataset.m){chatMenu(b.dataset.m);return;}
  if(chat.cur&&chat.cur.last&&chat.shown>=chat.cur.txt.length){chatEnd();return;}chatTap();});
