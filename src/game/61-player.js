/* =========================================================
   Player looks: the original bunny, or any villager species model (npcModel), in a chosen fur and outfit colour.
   Saved as S.look {sp, fur, shirt} (a human: S.look.h, 61b-characters). The body is always villager.children[0] (rooms copy it: cloneBody), so the held tool and rod stay put.
   To add a look: an entry in LOOKS, plus a case in npcModel (57-villagers) if the species is new.
   ========================================================= */
const LOOKS={
  bunny:  {name:'Bunny',  fur:[0xf6f3ee,0xe8c8d8,0xc8a888,0x9a9aa8]},
  cat:    {name:'Cat',    fur:[0xf0b070,0x9a9aa8,0xf4f0ea,0x3a3440]},
  fox:    {name:'Fox',    fur:[0xe8783a,0xd8a060,0xf4f0ea,0x8a8a98]},
  dog:    {name:'Dog',    fur:[0xd8a868,0xf4ecd8,0x8a6040]},
  bear:   {name:'Bear',   fur:[0xa87450,0xd8b890,0x6a4a38,0xf4f0ea]},
  frog:   {name:'Frog',   fur:[0x7cc458,0x5aa0a0,0xa8c850]},
  duck:   {name:'Duck',   fur:[0xf4f0ea,0xf6d04a,0xa8c8e8]},
  penguin:{name:'Penguin',fur:[0x3a4a6a,0x5a6a8a]}};
const OUTFITS=[0xd8453a,0x5a8ae0,0x6ab84a,0xf6d04a,0xf39ab0,0x9a6ad0,0x3a3440];
const hexCss=c=>'#'+c.toString(16).padStart(6,'0');
function playerBody(L){const b=L.sp==='human'?charModel(curHuman()):L.sp==='bunny'||!LOOKS[L.sp]?bunnyBody(L.fur,L.shirt):npcModel(L.sp,L.fur,L.shirt,null,'overalls');b.traverse(o=>{if(o.isMesh)o.castShadow=true;});return b;}
let playerLimbs=null;
// a character swaps in once its model has loaded (straight away if it already has), so you're never left invisible
function applyLook(){const L=S.look;if(L.sp==='human'){const h=curHuman(),want=h.c+'|'+h.skin;applyLook.want=want;charLoad(h.c,()=>{if(applyLook.want===want&&S.look.sp==='human')setBody(playerBody(L));});return;}
  applyLook.want=null;setBody(playerBody(L));}
function setBody(b){villager.remove(villager.children[0]);villager.add(b);villager.children.unshift(villager.children.pop());
  playerLimbs=S.look.sp==='bunny'||b.userData.char?null:limbsOf(b);}
// preview thumbnails for the look picker, cached per species + colours
const lookThumbs={};
function lookThumb(sp,fur,shirt){if(sp==='human')return hThumb({});const k=sp+'|'+fur+'|'+shirt;return lookThumbs[k]||(lookThumbs[k]=snapThumb(playerBody({sp,fur,shirt}),128));}
function setLook(ch){Object.assign(S.look,ch);if(ch.sp&&!ch.fur)S.look.fur=LOOKS[ch.sp].fur[0];applyLook();hearts(vil.x,1.1,vil.z);SFX.pop();save();}
