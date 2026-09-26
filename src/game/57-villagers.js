/* ---- villagers: generated neighbours with personalities, routines, friendship and daily wishes ---- */
const SPECIES={cat:{names:['Mochi','Tabby','Olive','Miso','Pumpkin'],col:[0xf0b070,0x9a9aa8,0xf4f0ea,0x3a3440]},dog:{names:['Biscuit','Waffles','Maple','Rufus','Goldie'],col:[0xd8a868,0xf4ecd8,0x8a6040]},
  bear:{names:['Bruno','Honey','Teddy','Barley'],col:[0xa87450,0xd8b890,0x6a4a38]},rabbit:{names:['Clover','Bunnie','Mira','Coco'],col:[0xf4f0ea,0xe8c8d8,0xc8a888]},
  frog:{names:['Ribbot','Lily','Puddle','Jeremiah'],col:[0x7cc458,0x5aa0a0,0xa8c850]},duck:{names:['Pip','Quill','Daisy','Ketchup'],col:[0xf4f0ea,0xf6d04a,0xa8c8e8]},
  penguin:{names:['Flurry','Tux','Wade','Aurora'],col:[0x3a4a6a,0x5a6a8a]},squirrel:{names:['Hazel','Acorn','Nutmeg','Poppy'],col:[0xd87a3a,0xa89a8a,0xe8a860]},
  sheep:{names:['Wooly','Dolly','Muffin'],col:[0xf8f4ee,0xe8d8f0,0xf0e0c8]},koala:{names:['Eucy','Nibbs','Gum'],col:[0xa8a8b8,0xc8c0d0]},
  fox:{names:['Rusty','Ember','Juniper','Sable'],col:[0xe8783a,0xd8a060,0x8a8a98]},otter:{names:['Pebble','Brook','Marlo','Kelp'],col:[0x8a6a4a,0xa8845a,0x6a5a4a]},
  hedgehog:{names:['Bramble','Thistle','Pip','Conker'],col:[0xd8b890,0xc8a070]},deer:{names:['Fawn','Aspen','Willow','Birch'],col:[0xc8905a,0xd8a878,0xa87a50]}};
// what each personality tends to wear
const STYLE={sailor:{o:['stripe','sweater'],a:['sailorcap','beanie','none']},dreamer:{o:['dress','tee'],a:['flower','beret','bow']},tinkerer:{o:['overalls','apron'],a:['goggles','bandana']},
  homebody:{o:['apron','sweater','dress'],a:['kerchief','bow','none']},explorer:{o:['vest','tee'],a:['backpack','bandana','cap']},scholar:{o:['sweater','vest'],a:['glasses','beret']}};
/* personalities: Driftseed's own six, rooted in island life (each has a sign-off, lines, a hobby for their routine, and a room style) */
const PERS={
  sailor:{label:'Sailor',cp:['fair winds','aye','steady as she goes'],hobby:'fish',lines:['Wind’s coming round from the west. Good day to be on the water.','I can smell a storm three islands off. Nose never lies.','Tie your boat with a bowline, not a granny knot. Trust me on this one.','The tide’s out past the rocks. That’s when the crabs come looking for trouble.','Forty years at sea and I still can’t whistle. Life’s funny like that.','A calm sea never made a skilled sailor. Nor a very interesting one.','Saw a whale spout past the point this morning. Beautiful thing.','Mind the gulls. They’ll steal the bait right off your hook.']},
  dreamer:{label:'Dreamer',cp:['la la','hmm~','oh!'],hobby:'stargaze',lines:['Do you think the islands dream of us, the way we dream of them?','I counted the clouds today. Forty-two. One looked like a teapot.','The sea sounds different at night. Softer. Like it’s whispering secrets.','I wrote a poem about moss. It’s very short. It just says “soft.”','Sometimes I leave notes in bottles. Nobody’s written back… yet.','The lanterns make everything look like a painting after dusk.','If I were a flower I’d be the kind that only opens at night.','I found a sea-glass pebble exactly the colour of the sky. I’m keeping it forever.']},
  tinkerer:{label:'Tinkerer',cp:['click','whirr','right-o'],hobby:'tinker',lines:['I’m building a clock that runs on tides. Well, it runs. Sometimes.','Your watering can’s spout is a bit clogged. Tap it twice, it’ll sort itself.','Driftwood makes the best gears. Nobody believes me.','I fixed the lighthouse lamp last week. Mostly by hitting it.','Everything’s a puzzle if you look at it long enough. Even soup.','I took apart a music box to see where the music lives. Still looking.','If your boat creaks, that’s just it talking. Listen to what it says.','Got grease on my nose again, didn’t I? Occupational hazard.']},
  homebody:{label:'Homebody',cp:['dear','mm-hm','there now'],hobby:'garden',lines:['I baked seaweed scones this morning. Better than they sound, I promise!','There’s nothing a warm blanket and a good book can’t fix.','My tomatoes are coming in lovely this year. Want some? No? Next time then.','Have you eaten? You look like you haven’t eaten.','Rainy days are for knitting. Sunny days are also for knitting.','I planted marigolds by my door. They keep the grumpy crows away.','The kettle’s always on at my place. Just knock.','A tidy home is a happy home. A slightly messy one is a lived-in home.']},
  explorer:{label:'Explorer',cp:['onward','let’s go','ha!'],hobby:'wander',lines:['There’s an island out past the fog nobody’s charted yet. Not yet.','I climbed the tallest cliff on the island before breakfast. Worth it.','Every island has a secret. You just have to walk every tile of it.','I lost my compass. Found three new beaches looking for it though!','My map has more doodles than roads. That’s how you know it’s a good one.','The best trails are the ones you make yourself.','I camped on a sandbar at low tide once. Woke up in the sea. Great night.','Ever sailed to the volcano island? The ground’s warm. Your boots won’t thank you.']},
  scholar:{label:'Scholar',cp:['indeed','fascinating','hmm'],hobby:'read',lines:['Did you know hermit crabs trade shells in size order? Remarkably civilised.','I’m cataloguing every moss species on the island. There are eleven. Probably.','Butterflies taste with their feet. I think about that a lot.','The museum’s collection is coming along nicely. I’ve been taking notes.','Tides follow the moon, you know. The moon, meanwhile, follows no one.','I read that pufferfish can’t swim backwards. Imagine the embarrassment.','Fireflies glow to find each other in the dark. Rather sweet, really.','The oldest tree on the island is older than the town. Treat it kindly.']}};
const npcs=[];
/* villager bodies: every species has its own build, head, snout, ears and tail; every villager wears an outfit and accessory that
   suit their personality, and their eyes and mouth are separate little meshes (setFace) so they can blink, smile and talk */
const BUILDS={round:[0.4,0.34,0.34],slim:[0.32,0.4,0.28],stout:[0.46,0.4,0.38],tall:[0.3,0.48,0.27]};/* torso width, height, depth */
const BODY={cat:{build:'slim',head:0.5,ears:'point',snout:'muzzle',tail:'thin',whisk:1,nose:0xe07a8a},dog:{build:'round',head:0.52,ears:'flop',snout:'long',tail:'wag'},
  bear:{build:'stout',head:0.56,ears:'round',snout:'muzzle',tail:'nub'},koala:{build:'round',head:0.54,ears:'fluffy',snout:'bignose',tail:'none'},
  rabbit:{build:'round',head:0.5,ears:'lop',snout:'muzzle',tail:'puff',nose:0xe07a8a},frog:{build:'slim',head:0.56,ears:'none',snout:'frog',tail:'none'},
  duck:{build:'round',head:0.48,ears:'tuft',snout:'bill',tail:'feathers',legs:0xf6a830},penguin:{build:'round',head:0.5,ears:'none',snout:'beak',tail:'none',tux:1,legs:0xf6a830},
  squirrel:{build:'slim',head:0.48,ears:'tuft2',snout:'muzzle',tail:'bushy'},sheep:{build:'stout',head:0.48,ears:'side',snout:'sheep',tail:'puff'},
  fox:{build:'slim',head:0.5,ears:'fox',snout:'long',tail:'fox'},otter:{build:'tall',head:0.46,ears:'tiny',snout:'muzzle',tail:'otter',whisk:1},
  hedgehog:{build:'round',head:0.48,ears:'tiny',snout:'point',tail:'none',spikes:1},deer:{build:'tall',head:0.46,ears:'deer',snout:'muzzle',tail:'puff',antlers:1}};
const tint=(c,f)=>new T.Color(c).multiplyScalar(f).getHex(),lift=(c,f)=>new T.Color(c).lerp(new T.Color(0xffffff),f).getHex();
function npcModel(sp,col,shirt,acc,outfit='tee'){const B=BODY[sp]||BODY.cat,[tw,th,td]=BUILDS[B.build],p=[],dk=tint(col,0.75),hi=lift(col,0.45),sdk=tint(shirt,0.72),DEN=0x4a6a9a;
  const legH=0.14,ty=legH+th/2,top=legH+th,hs=B.head,hy=top+hs*0.4,hr=hs/2,fz=hr*0.92;
  const ring=(c,y,s=1.02,h=0.035)=>{const f=Math.max(0.2,Math.sqrt(Math.max(0,1-((y-ty)/(th/2))**2)));p.push(P(CYL12,c,0,y,0,0,0,0,tw*f*s,h,td*f*s));};
  // ---- torso and outfit ----
  let body=B.tux?col:outfit==='stripe'?0xf8f6f0:shirt,legC=B.legs||(outfit==='overalls'?DEN:outfit==='dress'||outfit==='apron'?col:tint(col,0.9)),sleeve=B.tux?col:shirt;
  p.push(P(ICO2,body,0,ty,0,0,0,0,tw,th,td));
  if(B.tux)p.push(P(ICO2,0xf4f0ea,0,ty-0.02,td*0.2,0,0,0,tw*0.72,th*0.82,td*0.7));
  else switch(outfit){
    case'stripe':for(let i=0;i<3;i++)ring(0x2f4f7a,legH+th*(0.25+i*0.22));p.push(P(BOX,0x2f4f7a,0,top-0.03,-td*0.32,0.5,0,0,tw*0.7,0.03,td*0.5),P(CONE4,0xd8453a,0,top-0.06,td*0.46,Math.PI,0.785,0,0.06,0.08,0.02));sleeve=0xf8f6f0;break;
    case'overalls':p.push(P(ICO2,DEN,0,legH+th*0.3,0,0,0,0,tw*1.03,th*0.62,td*1.03),P(BOX,DEN,0,ty+0.02,td*0.42,0,0,0,tw*0.52,th*0.42,0.04));for(const sd of [-1,1])p.push(P(BOX,DEN,sd*tw*0.24,top-0.05,0,0,0,0,0.045,0.03,td*1.0),P(ICO2,0xf6d04a,sd*tw*0.2,ty+0.1,td*0.46,0,0,0,0.035,0.035,0.02));break;
    case'dress':p.push(P(CONE12,shirt,0,legH+0.06,0,0,0,0,tw*1.45,0.3,td*1.45),P(CYL12,lift(shirt,0.5),0,legH-0.08,0,0,0,0,tw*1.46,0.025,td*1.46));ring(lift(shirt,0.4),top-0.02,0.7);break;
    case'sweater':ring(lift(shirt,0.25),legH+0.03,1.04,0.05);p.push(P(CYL12,shirt,0,top,0,0,0,0,tw*0.55,0.07,td*0.55));for(const x of [-0.06,0,0.06])p.push(P(BOX,sdk,x,ty,td*0.47,0,0,0,0.012,th*0.7,0.01));break;
    case'vest':p.push(P(ICO2,0xa08a5a,0,ty,-0.005,0,0,0,tw*1.03,th*0.96,td*1.0),P(BOX,shirt,0,ty,td*0.5,0,0,0,0.07,th*0.9,0.01));for(const sd of [-1,1])p.push(P(BOX,0x7a6a42,sd*tw*0.22,ty-0.04,td*0.46,0,0,0,0.08,0.07,0.02));break;
    case'apron':p.push(P(BOX,0xfbf8f0,0,ty-0.03,td*0.44,0,0,0,tw*0.6,th*0.72,0.03),P(BOX,lift(shirt,0.3),0,ty-0.08,td*0.46,0,0,0,tw*0.36,0.07,0.02),P(BOX,0xfbf8f0,0,ty+0.05,-td*0.4,0,0,0,0.12,0.03,0.03));break;
    default:ring(lift(shirt,0.35),top-0.02,0.6);p.push(P(ICO2,lift(shirt,0.3),tw*0.18,ty+0.05,td*0.44,0,0,0,0.06,0.06,0.02));}
  // ---- head ----
  p.push(P(ICO2,col,0,hy,0,0,0,0,hs,hs*0.9,hs*0.92),P(ICO2,0xf39ab0,-hs*0.33,hy-hs*0.12,fz-0.04,0,0,0,0.07,0.04,0.03),P(ICO2,0xf39ab0,hs*0.33,hy-hs*0.12,fz-0.04,0,0,0,0.07,0.04,0.03));
  let mouthY=hy-hs*0.22,mouthZ=fz;
  switch(B.snout){
    case'muzzle':p.push(P(ICO2,hi,0,hy-hs*0.12,fz-0.01,0,0,0,hs*0.34,hs*0.22,hs*0.18),P(ICO2,B.nose||0x2b1e2e,0,hy-hs*0.05,fz+0.04,0,0,0,0.05,0.035,0.03));mouthY=hy-hs*0.2;mouthZ=fz+0.02;break;
    case'long':p.push(P(ICO2,col,0,hy-hs*0.12,fz+0.02,0,0,0,hs*0.34,hs*0.26,hs*0.4),P(ICO2,hi,0,hy-hs*0.18,fz+0.03,0,0,0,hs*0.3,hs*0.14,hs*0.36),P(ICO2,0x2b1e2e,0,hy-hs*0.06,fz+hs*0.2,0,0,0,0.06,0.045,0.04));mouthY=hy-hs*0.26;mouthZ=fz+0.05;break;
    case'bignose':p.push(P(ICO2,0x3a3440,0,hy-hs*0.06,fz+0.02,0,0,0,0.11,0.13,0.08));mouthY=hy-hs*0.25;break;
    case'frog':p.push(P(ICO2,hi,0,hy-hs*0.2,fz-0.04,0,0,0,hs*0.7,hs*0.22,hs*0.3));for(const sd of [-1,1])p.push(P(ICO2,tint(col,0.8),sd*hs*0.34,hy-hs*0.04,-hs*0.2,0,0,0,0.06,0.05,0.04));mouthY=hy-hs*0.1;break;
    case'bill':p.push(P(ICO2,0xf6a830,0,hy-hs*0.12,fz+0.05,0,0,0,hs*0.4,hs*0.1,hs*0.34),P(ICO2,0xe08a20,0,hy-hs*0.16,fz+0.04,0,0,0,hs*0.34,hs*0.06,hs*0.3));mouthY=null;break;
    case'beak':p.push(P(CONE4,0xf6a830,0,hy-hs*0.1,fz+0.05,1.57,0.785,0,0.1,0.12,0.07),P(ICO2,0xf4f0ea,0,hy-hs*0.02,fz-0.06,0,0,0,hs*0.62,hs*0.52,hs*0.3));mouthY=null;break;
    case'sheep':p.push(P(ICO2,0x5a4a4a,0,hy-hs*0.06,fz-0.08,0,0,0,hs*0.62,hs*0.7,hs*0.34));for(let i=0;i<9;i++){const a=i/9*Math.PI*2;p.push(P(ICO2,0xfbf8f2,Math.cos(a)*hs*0.4,hy+hs*0.28+Math.sin(a)*hs*0.12,Math.sin(a)*hs*0.3-0.02,0,0,0,hs*0.34,hs*0.3,hs*0.34));}mouthY=hy-hs*0.26;mouthZ=fz-0.02;break;
    case'point':p.push(P(ICO2,hi,0,hy-hs*0.1,fz+0.03,0,0,0,hs*0.28,hs*0.22,hs*0.36),P(ICO2,0x2b1e2e,0,hy-hs*0.08,fz+hs*0.2,0,0,0,0.05,0.04,0.035));mouthY=hy-hs*0.24;mouthZ=fz+0.02;break;}
  if(B.whisk)for(const sd of [-1,1])for(let i=0;i<2;i++)p.push(P(BOX,dk,sd*hs*0.36,hy-hs*0.1+i*0.03,fz-0.01,0,sd*0.5,sd*(0.1-i*0.2),0.1,0.008,0.008));
  // ---- ears ----
  const ex=hs*0.3,ey=hy+hs*0.36;
  for(const sd of [-1,1])switch(B.ears){
    case'point':p.push(P(CONE4,col,sd*ex,ey,0,0,0.785,-sd*0.25,0.13,0.2,0.08),P(CONE4,0xf3a6b6,sd*ex,ey-0.01,0.02,0,0.785,-sd*0.25,0.06,0.11,0.04));break;
    case'fox':p.push(P(CONE4,col,sd*ex,ey+0.03,0,0,0.785,-sd*0.28,0.14,0.26,0.08),P(CONE4,0x3a2a2a,sd*(ex+0.03),ey+0.12,0,0,0.785,-sd*0.28,0.06,0.08,0.05),P(CONE4,0xfbf4ea,sd*ex,ey+0.01,0.02,0,0.785,-sd*0.28,0.06,0.13,0.04));break;
    case'flop':p.push(P(ICO2,dk,sd*hs*0.5,hy+0.02,-0.02,0,0,sd*0.35,0.1,hs*0.5,0.09));break;
    case'round':p.push(P(ICO2,col,sd*hs*0.36,hy+hs*0.36,0,0,0,0,0.12,0.12,0.06),P(ICO2,hi,sd*hs*0.36,hy+hs*0.36,0.02,0,0,0,0.065,0.065,0.03));break;
    case'fluffy':p.push(P(ICO2,col,sd*hs*0.46,hy+hs*0.24,0,0,0,0,0.2,0.2,0.08),P(ICO2,0xf4f0ea,sd*hs*0.46,hy+hs*0.24,0.03,0,0,0,0.13,0.13,0.04));break;
    case'lop':p.push(P(ICO2,col,sd*hs*0.52,hy-hs*0.08,-0.03,0,0,sd*0.22,0.11,hs*0.72,0.1),P(ICO2,0xf3a6b6,sd*hs*0.52,hy-hs*0.1,0.01,0,0,sd*0.22,0.06,hs*0.56,0.04));break;
    case'tuft':if(sd<0)p.push(P(ICO2,col,0,hy+hs*0.46,-0.02,0,0,0.3,0.05,0.1,0.04),P(ICO2,col,0.04,hy+hs*0.44,-0.02,0,0,-0.3,0.04,0.08,0.04));break;
    case'tuft2':p.push(P(CONE4,col,sd*ex,ey,0,0,0.785,-sd*0.15,0.1,0.17,0.06),P(CONE4,dk,sd*ex,ey+0.1,0,0,0.785,-sd*0.15,0.04,0.07,0.03));break;
    case'side':p.push(P(ICO2,0x5a4a4a,sd*hs*0.46,hy+0.02,0.02,0,0,sd*1.1,0.05,0.14,0.05));break;
    case'tiny':p.push(P(ICO2,dk,sd*hs*0.34,hy+hs*0.34,0,0,0,0,0.07,0.06,0.04));break;
    case'deer':p.push(P(ICO2,col,sd*hs*0.5,hy+hs*0.2,0,0,0,sd*1.0,0.07,0.16,0.05),P(ICO2,0xf3d0c0,sd*hs*0.5,hy+hs*0.2,0.02,0,0,sd*1.0,0.035,0.1,0.02));break;}
  if(B.antlers)for(const sd of [-1,1])p.push(P(CYL6,0xd8c0a0,sd*0.1,hy+hs*0.5,-0.02,0,0,-sd*0.3,0.025,0.16,0.025),P(CYL6,0xd8c0a0,sd*0.15,hy+hs*0.6,0,0.3,0,-sd*0.9,0.02,0.1,0.02));
  if(B.spikes)for(let i=0;i<14;i++){const a=(i/13-0.5)*2.4,r=i%2?0.02:0;p.push(P(CONE4,0x6a5040,Math.sin(a)*(hs*0.42+r),hy+0.02+Math.cos(a*0.8)*0.12,-hs*0.3,-0.9,0,-Math.sin(a)*0.6,0.07,0.16,0.07),P(CONE4,0x6a5040,Math.sin(a)*tw*0.4,ty+0.05,-td*0.42,-1.2,0,-Math.sin(a)*0.5,0.06,0.14,0.06));}
  // ---- tails ----
  const bz=-td*0.46;
  switch(B.tail){
    case'thin':for(let i=0;i<3;i++)p.push(P(CYL6,col,0,legH+0.12+i*0.09,bz-0.05-i*0.04+(i===2?0.03:0),-0.5+i*0.5,0,0,0.035,0.11,0.035));p.push(P(ICO2,dk,0,legH+0.36,bz-0.1,0,0,0,0.05,0.05,0.05));break;
    case'wag':p.push(P(ICO2,col,0,ty+0.02,bz-0.06,-0.7,0,0,0.06,0.18,0.06));break;
    case'nub':p.push(P(ICO2,col,0,legH+0.12,bz-0.02,0,0,0,0.08,0.08,0.08));break;
    case'puff':p.push(P(ICO2,0xfbf8f2,0,legH+0.1,bz-0.03,0,0,0,0.1,0.1,0.1));break;
    case'feathers':for(const r of [-0.4,0,0.4])p.push(P(CONE4,col,0,legH+0.1,bz-0.05,-1.2,0,r,0.06,0.12,0.03));break;
    case'bushy':for(let i=0;i<5;i++){const a=i/4;p.push(P(ICO2,i===4?hi:col,0,legH+0.1+a*0.55,bz-0.12-Math.sin(a*2.6)*0.12,0.3-a*0.6,0,0,0.16+a*0.04,0.2,0.16));}break;
    case'fox':p.push(P(ICO2,col,0,legH+0.12,bz-0.14,1.0,0,0,0.13,0.32,0.13),P(ICO2,0xfbf4ea,0,legH+0.2,bz-0.28,1.0,0,0,0.1,0.12,0.1));break;
    case'otter':p.push(P(ICO2,dk,0,legH+0.02,bz-0.16,1.3,0,0,0.09,0.36,0.07));break;}
  // ---- accessories ----
  // headwear hugs the head: domes that cover its crown, bands sized to the head's width at that height
  const ht=hy+hs*0.42,hR=dy=>hs*0.5*Math.sqrt(Math.max(0,1-(dy/(hs*0.45))**2)),band=(c,dy,h=0.045)=>{const r=hR(dy)*2.08;p.push(P(CYL12,c,0,hy+dy,0,0,0,0,r,h,r*0.94));};
  switch(acc){
    case'sailorcap':p.push(P(CYL12,0xfbf8f0,0,hy+hs*0.4,-0.01,0,0,0,hs*0.74,0.12,hs*0.72),P(ICO2,0xfbf8f0,0,hy+hs*0.47,-0.01,0,0,0,hs*0.76,0.06,hs*0.74));band(0x2f4f7a,hs*0.33,0.05);break;
    case'beanie':p.push(P(ICO2,0xd8604a,0,hy+hs*0.16,-0.01,0,0,0,hs*1.06,hs*0.74,hs*1.02),P(ICO2,0xfbf8f0,0,hy+hs*0.54,-0.01,0,0,0,0.08,0.08,0.08));band(tint(0xd8604a,0.82),hs*0.14,0.06);break;
    case'glasses':for(const sd of [-1,1])p.push(P(CYL12,0x3a2a2a,sd*hs*0.2,hy+hs*0.04,fz+0.02,1.57,0,0,0.13,0.01,0.13));p.push(P(BOX,0x3a2a2a,0,hy+hs*0.05,fz+0.025,0,0,0,0.06,0.01,0.01));break;
    case'goggles':band(0x5a4a3a,hs*0.28,0.04);for(const sd of [-1,1])p.push(P(CYL12,0xb08a50,sd*0.075,hy+hs*0.29,hR(hs*0.28)+0.01,1.3,0,0,0.1,0.05,0.1),P(CYL12,0x9ad0e0,sd*0.075,hy+hs*0.295,hR(hs*0.28)+0.035,1.3,0,0,0.075,0.01,0.075));break;
    case'backpack':p.push(P(BOX,0xa0703a,0,ty+0.03,bz-0.06,0,0,0,tw*0.7,th*0.7,0.14),P(BOX,0x7a5230,0,ty+0.1,bz-0.14,0,0,0,tw*0.6,0.06,0.04),P(CYL12,0x8a3a3a,0,ty+th*0.4,bz-0.06,0,0,1.57,0.08,tw*0.72,0.08));break;
    case'bandana':band(0xd8453a,hs*0.24,0.06);p.push(P(CONE4,0xd8453a,0,hy+hs*0.2,-hR(hs*0.2)-0.02,-1.4,0.785,0,0.08,0.12,0.03));break;
    case'cap':p.push(P(ICO2,0x5a8ae0,0,hy+hs*0.15,-0.01,0,0,0,hs*1.05,hs*0.68,hs*1.02),P(CYL12,0x5a8ae0,0,hy+hs*0.2,hR(hs*0.2)*0.9,0.15,0,0,hs*0.56,0.025,hs*0.4));break;
    case'beret':p.push(P(ICO2,0x9a6ad0,0.03,hy+hs*0.4,-0.02,0,0,0.18,hs*0.92,0.12,hs*0.88),P(CYL6,0x9a6ad0,0.03,hy+hs*0.48,-0.02,0,0,0,0.02,0.06,0.02));break;
    case'flower':bloom(p,0xf2a6c8,0xf6d04a,hs*0.32,hy+hs*0.3,hs*0.16,0.08,6,1.2);break;
    case'bow':p.push(P(ICO2,0xf39ab0,hs*0.18,ht-0.03,hs*0.1,0,0,0.5,0.1,0.07,0.05),P(ICO2,0xf39ab0,hs*0.32,ht-0.05,hs*0.1,0,0,-0.5,0.1,0.07,0.05),P(ICO2,0xd8708a,hs*0.25,ht-0.04,hs*0.12,0,0,0,0.04,0.04,0.04));break;
    case'kerchief':p.push(P(ICO2,0x6ab8a0,0,hy+hs*0.17,-0.03,0,0,0,hs*1.05,hs*0.64,hs*1.02),P(CONE4,0x6ab8a0,0,hy+hs*0.02,-hR(0)-0.02,-1.3,0.785,0,0.1,0.14,0.03));break;
    case'scarf':p.push(P(CYL12,0xd8604a,0,top,0,0,0,0,tw*0.8,0.07,td*0.8),P(BOX,0xd8604a,0.08,top-0.1,td*0.44,0.2,0,0.2,0.07,0.16,0.03));break;}
  const g=new T.Group();g.add(M(p));
  // ---- face: eyes open / blinking / happy, mouth smiling / talking ----
  const frog=B.snout==='frog',eyX=frog?hs*0.26:hs*0.2,eyY=frog?hy+hs*0.38:hy+hs*0.04,eyZ=frog?hr*0.45:fz-0.005;
  const fp={open:[],blink:[],happy:[],smile:[],talk:[]};
  for(const sd of [-1,1]){const x=sd*eyX;
    if(frog)g.add(M([P(ICO2,col,x,eyY-0.02,eyZ-0.02,0,0,0,0.16,0.14,0.14),P(ICO2,0xffffff,x,eyY,eyZ+0.03,0,0,0,0.11,0.11,0.06)]));
    fp.open.push(P(ICO2,0x2b1e2e,x,eyY,eyZ+(frog?0.06:0),0,0,0,hs*0.11,hs*0.15,0.035),P(ICO2,0xffffff,x+0.012,eyY+0.02,eyZ+(frog?0.08:0.02),0,0,0,0.022,0.028,0.01));
    fp.blink.push(P(BOX,0x2b1e2e,x,eyY-0.01,eyZ+(frog?0.06:0.005),0,0,0,hs*0.14,0.014,0.02));
    fp.happy.push(P(BOX,0x2b1e2e,x-0.018,eyY,eyZ+(frog?0.06:0.005),0,0,0.6,hs*0.08,0.014,0.02),P(BOX,0x2b1e2e,x+0.018,eyY,eyZ+(frog?0.06:0.005),0,0,-0.6,hs*0.08,0.014,0.02));}
  if(mouthY!==null){fp.smile.push(P(ICO2,0x7a2a3a,0,mouthY,mouthZ,0,0,0,frog?0.12:0.05,0.02,0.02));fp.talk.push(P(ICO2,0x6a2030,0,mouthY-0.005,mouthZ,0,0,0,0.055,0.05,0.025),P(ICO2,0xf39ab0,0,mouthY-0.02,mouthZ+0.008,0,0,0,0.035,0.02,0.015));}
  const face={};for(const k in fp){if(!fp[k].length)continue;const m=M(fp[k]);m.castShadow=false;m.visible=k==='open'||k==='smile';g.add(m);face[k]=m;}g.userData.face=face;
  // limbs on pivots so they can swing when walking
  for(const [nm,sd] of [['armL',-1],['armR',1]]){const pv=new T.Group();pv.name=nm;pv.position.set(sd*(tw/2+0.01),top-0.06,0.02);pv.rotation.z=sd*0.3;
    pv.add(M([P(ICO2,sleeve,0,-0.05,0,0,0,0,0.11,0.13,0.11),P(ICO2,B.tux?col:col,0,-0.15,0,0,0,0,0.08,0.09,0.08)]));g.add(pv);}
  for(const [nm,sd] of [['footL',-1],['footR',1]]){const pv=new T.Group();pv.name=nm;pv.position.set(sd*tw*0.22,legH,0.02);
    pv.add(M([P(CYL8,legC,0,-legH*0.45,0,0,0,0,0.1,legH,0.1),P(ICO2,B.legs||tint(col,0.7),0,-legH+0.02,0.03,0,0,0,0.13,0.07,0.17)]));g.add(pv);}
  return g;}
// eyes: 'open' | 'blink' | 'happy'; mouth: 'smile' | 'talk'
function setFace(g,eyes,mouth){const f=g.userData.face;if(!f)return;for(const k of ['open','blink','happy'])if(f[k])f[k].visible=k===eyes;for(const k of ['smile','talk'])if(f[k])f[k].visible=k===mouth;}
function limbsOf(g){return['armL','armR','footL','footR'].map(n=>g.getObjectByName(n));}
function swingLimbs(L,ph,amt){if(!L[0])return;const s=Math.sin(ph)*amt;L[0].rotation.x=s;L[1].rotation.x=-s;L[2].rotation.x=-s*0.8;L[3].rotation.x=s*0.8;}
function initNPCs(){for(const n of npcs)scene.remove(n.g);npcs.length=0;const R=mulberry((S.worldSeed|0)^0x5eed);const used=new Set(),spk=Object.keys(SPECIES),pk=Object.keys(PERS);
  for(const b of TOWN.bld.filter(b=>b.t==='vh')){let sp;do{sp=spk[Math.floor(R()*spk.length)];}while(used.has(sp)&&used.size<spk.length);used.add(sp);const S0=SPECIES[sp];
    const name=S0.names[Math.floor(R()*S0.names.length)],pers=pk[Math.floor(R()*pk.length)],cp=PERS[pers].cp[Math.floor(R()*PERS[pers].cp.length)];
    const col=S0.col[Math.floor(R()*S0.col.length)],shirt=[0x6ab8a8,0x5a8ae0,0xe8866a,0xd8b84a,0xf39ab0,0x9a8ad8,0x7aa86a,0xd8604a][Math.floor(R()*8)];
    const st=STYLE[pers],outfit=st.o[Math.floor(R()*st.o.length)],acc=st.a[Math.floor(R()*st.a.length)];const g=npcModel(sp,col,shirt,acc,outfit);g.scale.setScalar(0.92);scene.add(g);const i=npcs.length;if(!S.npc[i])S.npc[i]={f:0,talk:0,wish:null,gift5:0,gift10:0};
    const n={i,name,sp,pers,cp,b,g,limbs:limbsOf(g),x:b.door[0]+0.5,z:b.door[1]+0.3,y:topY(b.door[0],b.door[1]),path:null,state:'idle',wait:R()*4,t:0,face:0};g.position.set(n.x,n.y,n.z);npcs.push(n);npcProps(n);}shoreSpots=null;}
const npcBlock=(x,z)=>!!S.tiles[K(x,z)]||(!!objAt(x,z)&&objAt(x,z).k!=='stonepath')||(x>=HOUSE_AT.x&&x<=HOUSE_AT.x+1&&z>=HOUSE_AT.z&&z<=HOUSE_AT.z+1)||(TOWN.fixed.has(K(x,z))&&TOWN.fixed.get(K(x,z))!=='board');
function npcGo(n,tx,tz){const p=landPath(Math.round(n.x),Math.round(n.z),tx,tz,{block:npcBlock,cost:(x,z)=>TOWN.path.has(K(x,z))?0.45:1,max:3000});if(!p||p.length<2)return false;n.path=p.slice(1);n.state='walk';return true;}
function updateNPCs(dt,tt){if(!npcs.length)return;const near=Math.hypot(cam.tx,cam.tz)<70;const night=S.hour>=21||S.hour<6.5;
  for(const n of npcs){if(!near){n.g.visible=false;continue;}
    if(n.state==='home'){n.g.visible=false;if(!night){n.state='idle';n.wait=1+Math.random()*3;n.x=n.b.door[0]+0.5;n.z=n.b.door[1]+0.3;}continue;}
    n.g.visible=true;n.t+=dt;
    if(n.state==='talk'){if(!n.sit)n.face=Math.atan2(vil.x-n.x,vil.z-n.z);if(n.t>12||Math.hypot(vil.x-n.x,vil.z-n.z)>4){if(n.act)endActivity(n);n.state='idle';n.wait=2;}}
    else if(n.state==='act'){if(night)endActivity(n);else actTick(n,dt,tt);}
    else if(n.state==='walk'){const w=n.path&&n.path[0];if(!w){if(n.act&&!night)startActivity(n);else{n.state=night?'goinghome':'idle';n.wait=2+Math.random()*5;}}
      else{const tx=w[0]+(w===n.path[n.path.length-1]?0:0),dx=tx-n.x,dz=w[1]-n.z,d=Math.hypot(dx,dz);if(d<0.06)n.path.shift();else{const sp=Math.min(d,dt*1.25);n.x+=dx/d*sp;n.z+=dz/d*sp;n.face=Math.atan2(dx,dz);}}}
    else if(n.state==='goinghome'){if(Math.hypot(n.x-n.b.door[0]-0.5,n.z-n.b.door[1])<1.2){n.state='home';burst(n.x,n.y+0.4,n.z,0xfff6e2,5,0.6,0.05);}else if(!npcGo(n,n.b.door[0],n.b.door[1]))n.state='home';}
    else{n.wait-=dt;if(night){if(!npcGo(n,n.b.door[0],n.b.door[1]))n.state='home';else n.state='walk';}
      else if(n.wait<=0){n.wait=2+Math.random()*4;/* follow the daily routine (57-routines) */
        const a=chooseActivity(n);if(a&&npcGo(n,a.to[0],a.to[1]))n.act=a;else if(a&&Math.hypot(a.to[0]-n.x,a.to[1]-n.z)<0.8){n.act=a;startActivity(n);}}}
    const ty=(topY(Math.round(n.x),Math.round(n.z))||0.3)+(n.sit?0.16:0);n.y=lerp(n.y,ty,Math.min(1,dt*8));
    // face: blink every few seconds, flap the mouth while talking, happy eyes after a gift
    {n.blinkT=(n.blinkT===undefined?2+Math.random()*3:n.blinkT)-dt;let eyes='open',mouth='smile';
      if(n.happyT>0){n.happyT-=dt;eyes='happy';}else if(n.blinkT<0){eyes='blink';if(n.blinkT<-0.13)n.blinkT=2.5+Math.random()*3.5;}
      if(n.talkT>0){n.talkT-=dt;mouth=Math.sin(tt*17+n.i)>0?'talk':'smile';}
      if(eyes!==n.fe||mouth!==n.fm){n.fe=eyes;n.fm=mouth;setFace(n.g,eyes,mouth);}}
    const walking=n.state==='walk'||n.state==='goinghome';if(n.state!=='act'&&!n.sit)swingLimbs(n.limbs,tt*9+n.i,walking?0.7:0);n.g.position.set(n.x,n.y+(walking?Math.abs(Math.sin(tt*9+n.i))*0.05:Math.sin(tt*2+n.i)*0.01),n.z);
    n.g.rotation.y+=angDiff(n.g.rotation.y,n.face)*Math.min(1,dt*6);}}
function npcWish(n){const d=S.npc[n.i];if(d.wish&&d.wish.day===S.day)return d.wish;const R=mulberry(hi(S.worldSeed|0,S.day,n.i));const lv=level();let k;
  const r=R();if(r<0.5){const un=CROP_IDS.filter(id=>CROPS[id].lvl<=lv);k='c:'+un[Math.floor(R()*un.length)];}
  else{const bios=new Set(['home','any',...islands.filter(i=>S.disc[i.id]&&!i.home).map(i=>i.biome)]);const pool=[];
    for(const [pre,tab] of [['f:',FISH],['b:',BUGS],['p:',PLANTS]])for(const id in tab){const I=tab[id];if(I.junk||I.w<8)continue;if(I.bio.some(b=>bios.has(b)))pool.push(pre+id);}
    k=pool.length?pool[Math.floor(R()*pool.length)]:'c:turnip';}
  d.wish={k,day:S.day,done:false};return d.wish;}
function invFor(k){if(k.startsWith('c:')){const id=k.slice(2);return Object.keys(S.inv).find(q=>q.split('|')[0]===id&&S.inv[q]>0)||null;}return S.inv[k]>0?k:null;}
function npcLine(n){const P0=PERS[n.pers],h=S.hour;const ctx=[];
  if(S.rain)ctx.push('This rain is perfect for the flowers. And for naps.');if(h<9)ctx.push('Good morning! The early bird catches the… well, bugs, I suppose.');if(h>=18)ctx.push('The lanterns look so pretty this time of evening.');
  ctx.push(`I heard ${CROPS[S.demand].name.toLowerCase()} is selling for a fortune today!`);const d=S.npc[n.i];if(d.f>=5)ctx.push('I’m really glad you moved to '+TOWN.name+', you know?');if(d.lastGift&&S.day-d.lastGift.day<=3)ctx.push(`I’m still enjoying that ${nameOf(d.lastGift.key)} you gave me!`,`Thanks again for the ${nameOf(d.lastGift.key)}. You remembered!`);
  const r=Math.random(),special=r<0.35?activityLine(n):r<0.65?memoryLine(n):r<0.8?neighbourLine(n):null;if(special)return special;
  const all=[...P0.lines,...ctx];const line=all[Math.floor(Math.random()*all.length)];return Math.random()<0.35?`${line} ${n.cp[0].toUpperCase()+n.cp.slice(1)}!`:line;}
function talkTo(n){if(n.state==='home')return;if(n.act&&n.act.k==='chat'){const q=n.act.with;if(q&&q.act&&q.act.with===n)endActivity(q);}n.state='talk';n.t=0;n.path=null;walkTo(n.x,n.z);SFX.ui();const d=S.npc[n.i];
  if(d.talk!==S.day){d.talk=S.day;d.f=Math.min(10,d.f+1);hearts(n.x,n.y+1,n.z);}
  setTimeout(()=>showTalk(n,npcLine(n)),0);}
function showTalk(n,line){n.talkT=Math.min(2.4,0.6+line.length*0.025);const d=S.npc[n.i],w=npcWish(n),btns=[];
  let msg=`<b>${n.name}:</b> ${line}`;
  if(!w.done){const have=invFor(w.k);msg+=`<br><small>${n.name} is hoping for ${/^[aeiou]/i.test(nameOf(w.k))?'an':'a'} <b>${nameOf(w.k)}</b> today.</small>`;
    btns.push({label:have?'Give '+nameOf(have):'Need one',cls:'go',disabled:!have,fn:()=>giveWish(n,have)});}
  btns.push({label:'Chat',fn:()=>{SFX.ui();showTalk(n,npcLine(n));}},{label:'Bye',fn:()=>{clearAction();n.state='idle';n.wait=1.5;}});
  setAction(msg,btns,`${n.name} · ${PERS[n.pers].label} ${n.sp} · ♥ ${d.f}/10`);}
function giveWish(n,key){const d=S.npc[n.i];if(!key||!S.inv[key])return;d.lastGift={key,day:S.day};n.happyT=2.5;n.talkT=1.6;S.inv[key]--;if(!S.inv[key])delete S.inv[key];d.wish.done=true;d.f=Math.min(10,d.f+3);
  const pay=Math.round(priceOf(key)*2+60);S.shells+=pay;SFX.rare();hearts(n.x,n.y+1,n.z);addXP(8);let extra='';
  if(Math.random()<0.4){const ks=Object.keys(BUILD).filter(k=>BUILD[k].lvl<=level());const k=pickR(ks);S.store[k]=(S.store[k]||0)+1;extra=` and a <b>${BUILD[k].name}</b> (in your storage)`;}
  else{const id=pickR(CROP_IDS.filter(i=>CROPS[i].lvl<=level()));S.free[id]=(S.free[id]||0)+3;extra=` and <b>3 ${CROPS[id].name} seeds</b>`;}
  if(d.f>=5&&!d.gift5){d.gift5=1;S.store.lantern=(S.store.lantern||0)+1;S.shells+=500;extra+=`. ${n.name} also slips you a Lantern and 500 shells — “for being such a good friend!”`;}
  if(d.f>=10&&!d.gift10){d.gift10=1;S.store.clover=(S.store.clover||0)+1;extra+=`. Best friends! ${n.name} gives you a Lucky Clover.`;}
  setAction(`<b>${n.name}:</b> Oh, a ${nameOf(key)}! You’re a treasure! Here, take this: <b>${fmt(pay)} shells</b>${extra}.`,[{label:'Aw, thanks!',cls:'go',fn:()=>{clearAction();n.state='idle';n.wait=2;}}],`${n.name} · ♥ ${d.f}/10`);updateHUD();}

