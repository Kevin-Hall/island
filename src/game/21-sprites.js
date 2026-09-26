/* =========================================================
   Pixel sprites (UI icons)
   ========================================================= */
const PAL={k:'#2b1e2e',g:'#5f9e3a',G:'#3d6e2c',l:'#9fd060',r:'#dc4034',R:'#962a2e',p:'#f39ab0',o:'#f08a2a',O:'#b85a1e',
  y:'#f6d04a',Y:'#c8952a',w:'#f7f2e6',W:'#c9c4d8',b:'#8a5a3a',B:'#5a3a2a',n:'#cfa46e',u:'#5a8ae0',U:'#3a5ab0',
  c:'#a8e6f4',v:'#9a6ad0',V:'#6a3a9a',m:'#d4b2f2',e:'#a4a4b4',E:'#5c5c6c',s:'#e8d4a8'};
/* Sprites are authored as small character grids, then upgraded when drawn, to match cute 16-bit item icons:
   Scale2x smooths the stair-steps, each shape gets a light rim along its top-left and a shaded bottom-right,
   and the outline takes a dark tint of the colour it wraps instead of flat black. The result is painted
   at 3× so the browser can scale it down smoothly (icons read as fine pixel art, not chunky blocks). */
const rgbOf=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255];};
function scale2x(g,w,h){const at=(x,y)=>x<0||y<0||x>=w||y>=h?null:g[y][x],o=[];
  for(let y=0;y<h;y++){const r1=[],r2=[];for(let x=0;x<w;x++){const P=g[y][x],A=at(x,y-1),B=at(x+1,y),C=at(x-1,y),D=at(x,y+1);let e1=P,e2=P,e3=P,e4=P;
    if(C===A&&C!==D&&A!==B)e1=A;if(A===B&&A!==C&&B!==D)e2=B;if(D===C&&D!==B&&C!==A)e3=C;if(B===D&&B!==A&&D!==C)e4=D;r1.push(e1,e2);r2.push(e3,e4);}o.push(r1,r2);}
  return o;}
const SPRITE_PX=3;
function sprite(rows,pal={}){
  const h0=rows.length,w0=Math.max(...rows.map(r=>r.length));
  const g0=rows.map(r=>[...Array(w0)].map((_,x)=>{const ch=r[x];return ch&&ch!=='.'?(pal[ch]||PAL[ch]||'#f0f'):null;}));
  const g=scale2x(g0,w0,h0),W=w0*2,H=h0*2,at=(x,y)=>x<0||y<0||x>=W||y>=H?null:g[y][x];
  const cv=document.createElement('canvas');cv.width=(W+2)*SPRITE_PX;cv.height=(H+2)*SPRITE_PX;const cx=cv.getContext('2d');
  const put=(x,y,[r,gg,b])=>{cx.fillStyle=`rgb(${r|0},${gg|0},${b|0})`;cx.fillRect((x+1)*SPRITE_PX,(y+1)*SPRITE_PX,SPRITE_PX,SPRITE_PX);};
  for(let y=-1;y<=H;y++)for(let x=-1;x<=W;x++){const c=at(x,y);
    if(c){let rgb=rgbOf(c);const lum=rgb[0]*0.3+rgb[1]*0.59+rgb[2]*0.11,tl=!at(x,y-1)||!at(x-1,y),br=!at(x,y+1)||!at(x+1,y);
      if(lum>70){if(tl&&!br)rgb=rgb.map(v=>v+(255-v)*0.28);else if(br&&!tl)rgb=rgb.map(v=>v*0.84);}
      put(x,y,rgb);}
    else{const n=at(x,y-1)||at(x-1,y)||at(x+1,y)||at(x,y+1);if(n){const rgb=rgbOf(n);put(x,y,rgb.map((v,i)=>v*0.3+[43,30,46][i]*0.55));}}}
  return cv.toDataURL();
}
const SPR={
turnip:['....g..g....','...glg.gl...','....gG.g....','.....Ggg....','....mmmmm...','...mvmmmmm..','..wwwwwwwww.','..wwwwwwwWw.','..wwwwwwwWw.','...wwwwwWw..','....wwwWw...','......w.....'],
carrot:['.........gg.','.......glg..','........Gg.l','.......oGgl.','......oooG..','.....oooOo..','....oooOo...','...oooOo....','..oooOo.....','..ooOo......','.oOo........','.o..........'],
potato:['............','....nnnn....','..nnnnnnnn..','.nnnbnnnnnn.','.nnnnnnnbnb.','nnbnnnnnnnnb','nnnnnnbnnnnb','.nnnnnnnnnb.','.bnnnbnnnbb.','..bbnnnnbb..','....bbbb....'],
strawberry:['....g.g.....','...gGgGg....','..rrgggrr...','.rryrrrryr..','.rrrryrrrr..','.ryrrrryrR..','..rrryrrR...','..ryrrrrR...','...rrryR....','....rrR.....','.....R......'],
tomato:['.....G......','...gGgGg....','..rrgGgrr...','.rrrrrrrrr..','rrwrrrrrrrr.','rwrrrrrrrrR.','rrrrrrrrrrR.','rrrrrrrrrRR.','.rrrrrrrRR..','..rRRRRRR...'],
corn:['.........yy.','........yyyy','..g....yyyYy','..gg..yyyYy.','...gGyyyYyy.','...gGyyYyy..','..ggGyYyy...','.gg.gGyy....','.g..gGg.....','....gG......','...gG.......','..gG........'],
sunflower:['...y.yy.y...','..yyyyyyyy..','.yyyBBBByy..','yyyBBbBBByy.','.yyBbBbBByy.','yyyBBBbBByy.','.yyyBBBByy..','..yyyyyyyy..','...y.gy.y...','..lg.g......','..glgG......','.....g......'],
pumpkin:['.....bB.....','....gb......','..oooOooo...','.ooOoOoOoo..','ooOooOooOoo.','ooOooOooOoO.','ooOooOooOoO.','ooOooOooOoO.','.oOooOooOO..','..OOOOOOO...'],
moonflower:['.....c......','....cwc.....','..c.cwc.c...','.cwccwccwc..','..cwwwwwc...','cwwwwuwwwwc.','..cwwwwwc...','.cwccwccwc..','..c.cwc.c...','....cgc.....','.....g......','....Gg......'],
starfruit:['.....y......','.....yy.....','....yyyy....','yyyyyYyyyyy.','.yyyyYyyyy..','..yyyYyyy...','...yyyYyy...','..yyyy.yyy..','.yyy....yyy.','.yy......yy.'],
radish:['....g.g.....','...glglg....','....gGg.....','.....G......','....pppp....','...prrrrp...','..prrrrrrr..','..rwrrrrrR..','..rrrrrrrR..','...rrrrRR...','....rRR.....','.....w......'],
lettuce:['....llll....','..llglllgl..','.lglllgllll.','lllgllllglll','lgllGllllgll','llllllGlllll','.lgllllllgl.','..GllgllGl..','...GGGGGG...'],
onion:['.....g.g....','.....g.g....','.....gGg....','......g.....','.....mm.....','....mvmm....','...mvvvmm...','..mvvvvvmm..','..mvvvvvvm..','...mvvvvm...','....mmmm....','.....ss.....'],
cabbage:['...gglgg....','..glllllg...','.glGllGllg..','gllGlGllllg.','glllGGllllg.','gllGllGlllg.','.gllllllllg.','..ggllllgg..','....gggg....'],
wheat:['.y....y...y.','yYy..yYy.yYy','.y....y...y.','yYy..yYy.yYy','.y....y...y.','yYy..yYy.yYy','.Y....Y...Y.','.Y....Y...Y.','..Y...Y..Y..','...Y..Y.Y...','....YYYY....','....YYYY....'],
peas:['.........G..','........G...','....lllGl...','..llgllgll..','.lgggggggl..','lgglgglggl..','lggggggggl..','.llgglggl...','..lllll.....'],
pepper:['.....G......','.....gG.....','...oogGoo...','..oooooooo..','.owoooooooO.','.owoooooooO.','.ooooooooOO.','.oooOooOooO.','..ooOooOoO..','...OO..OO...'],
tulip:['...p.p.p....','..ppppppp...','..prppprp...','..pppppppp..','...pppppp...','....pppp....','.....g......','..l..g..l...','..gl.g.lg...','...glglg....','....ggg.....','.....g......'],
eggplant:['......gG....','.....gggG...','....VgggV...','...VVvVVV...','..VVvVVVVV..','..VvVVVVVV..','.VVvVVVVVV..','.VVVVVVVVV..','.VVVVVVVVV..','..VVVVVVV...','...VVVVV....'],
blueberry:['....g.......','...gGg.gg...','..gg.uugg...','...uuuwuu...','..uwuuuuuu..','..uuuuUuuU..','...uuUuuUuu.','..uuuuuuwuU.','..uUuuuuuUu.','...uUUuUUU..'],
lavender:['..v....v....','.vVv..vVv.v.','..v..v.v.vVv','.vVv.vVv..v.','..v...v..vVv','..g..vVv..v.','..g...g...g.','..g...g..g..','...g..g.g...','....g.g.g...','.....ggg....','......g.....'],
watermelon:['...gGgGgG...','..gGgGgGgG..','.gGgGgGgGgG.','gGgGgGgGgGgG','gGlGgGgGgGgG','gGlGgGgGgGgG','.gGgGgGgGgG.','..gGgGgGgG..','...GGGGGG...'],
grape:['.....B......','....gB.g....','...ggBggg...','...vVvVv....','..vVvVvVv...','...vVvVv....','....vVvV....','....vVv.....','.....vV.....','.....v......'],
peach:['.....b.g....','.....bggl...','...pppgg....','..ppppppp...','.poopppppp..','.poooppppp..','.pooopppRp..','.ppopppppR..','..pppppRR...','...pRRRR....'],
dragonfruit:['.....l......','...l.p.l....','..lpppppl...','...pppppp...','.lpppwppppl.','..ppppppp...','.lppppppppl.','..pppwpppp..','...ppppp....','..l.ppp.l...','.....l......'],
mystery:['..nnnnnnnn..','..nwwwwwwn..','..nwvvvvwn..','..nwvwwvwn..','..nwwwwvwn..','..nwwwvvwn..','..nwwwvwwn..','..nwwwwwwn..','..nwwwvwwn..','..nwwwwwwn..','..nnnnnnnn..'],
shell:['.....ww.....','...wpwwpw...','..wpwpwpwp..','.wpwpwpwpww.','.wpwpwpwpwp.','.wpwpwpwpwp.','..wpwpwpwp..','...wwwwww...','....pwwp....'],
bag:['....BBBB....','...B....B...','..bnnnnnnb..','.bnnnnnnnnb.','.bnnnnnnnnb.','.bnnbbbbnnb.','.bnnnnnnnnb.','.bnnnnnnnnb.','.bnnnnnnnnb.','..bbbbbbbb..'],
shop:['.rwrwrwrwrw.','rwrwrwrwrwrw','rwrwrwrwrwrw','.b........b.','.b........b.','.b.yy.rr..b.','.bbbbbbbbbb.','.bnnnnnnnnb.','.bnnnnnnnnb.','.bbbbbbbbbb.'],
dex:['.RRRRRRRRRR.','RrrrrrrrrrrR','RrrrrwwrrrrR','RrrrwEEwrrrR','RRRRwEEwRRRR','RwwwwwwwwwwR','RwwwwwwwwwwR','RwwwwwwwwwwR','.RRRRRRRRRR.'],
chart:['nnnnnnnnnnnn','nuuuuuuuguun','nuuggguuuuun','nuugggguuuun','nuuuggurruun','nuuuuuurruun','nuggguuuuuun','nugggguuygun','nuuuuuuuuuun','nnnnnnnnnnnn'],
hammer:['.EEEEEE.....','EeeeeeeE....','.EEEEEEE....','...bb.......','...bb.......','...bb.......','...bb.......','...bb.......','...bb.......','...BB.......'],
sprout:['....l...l...','...lgl.lgl..','....lgGgl...','......G.....','......G.....','....bbbbb...','...bBbBbBb..','..bbbbbbbbb.'],
star:['.....y.....','.....y.....','....yyy....','yyyyyyyyyyy','.yyyyyyyyy.','..yyyyyyy..','..yyyyyyy..','.yyy...yyy.','.yy.....yy.'],
boat:['.....w......','.....ww.....','.....wwr....','.....wwww...','.....b......','bbbbbbbbbbbb','.bnnnnnnnnb.','..bbbbbbbb..'],
task:['.nnnnnnnn.','nbwwwwwwbn','.nwEEEEwn.','.nwwwwwwn.','.nwEEEwwn.','.nwwwwwwn.','.nwEEEEwn.','nbwwwwwwbn','.nnnnnnnn.'],
rod:['..........E','.........E.','........b..','.......b..u','......b...u','.....b....u','....b.....r','...B.......','..B........'],
menu:['.rrr...uuu.','rrrrr.uuuuu','rrrrr.uuuuu','rrrrr.uuuuu','.rrr...uuu.','...........','.ggg...yyy.','ggggg.yyyyy','ggggg.yyyyy','ggggg.yyyyy','.ggg...yyy.'],
hand:['.pp...pp...pp.','pppp.pppp.pppp','pppp.pppp.pppp','.pp...pp...pp.','..............','....pppppp....','...pppppppp...','..pppppppppp..','..pppppppppp..','..ppppp.pppp..','...ppp...ppp..'],
shovel:['....bbbb....','....b..b....','.....bb.....','.....bb.....','.....bb.....','.....bb.....','.....Bb.....','...eeeeee...','...eeeeee...','...eeeeeE...','....eeeE....','.....eE.....'],
axe:['.......eee..','......eeeee.','.....bbeeeeE','....bb.eeeE.','...bb...eE..','..bb........','.bb.........','bb..........','B...........'],
net:['...wwwww....','..wWwWwWw...','.wWwWwWwWw..','.wwWwWwWww..','.wWwWwWwWw..','..wWwWwWw...','...wwwww....','.....bb.....','.....bb.....','.....bb.....','.....bb.....','.....BB.....'],
can:['....EEE.....','...E...E....','.OOOOOOOOE..','OOOOOOOOOOE.','.OoooooOO..O','.OOOOOOOOOOO','.OOOOOOOO...','..OOOOOO....'],
};
const ICON={};for(const k in SPR)ICON[k]=sprite(SPR[k]);
ICON['m:wood']=sprite(['...bbbbbbb..','..bBBBBBBBn.','.bBbbbbbbBnn','.bBbbbbbbBnB','.bBbbbbbbBnn','..bBBBBBBBn.','...bbbbbbb..']);
ICON['m:stone']=sprite(['....eeee....','..eewweeee..','.eewweeeEe..','eeweeeeeeEE.','eeeeeeeeeEE.','.eeeeeeEEE..','..EEEEEEE...']);
ICON['x:fert']=sprite(['...BBBBB....','..BnnnnnB...','.BnbnnnbnB..','.BnnnnnnnB..','.BngggggnB..','.BnglglgnB..','.BnnnnnnnB..','.BnnnnnnnB..','..BBBBBBB...']);
ICON['x:bait']=sprite(['.....E......','....E.......','...ppp......','..pprpp.....','..ppppp.....','...ppp......','....p.......','...r.r......']);
ICON['m:fiber']=sprite(['.l...l...l..','.gl..gl..g..','..g..g..gl..','..gl.g.lg...','...ggggg....','...nBnBn....','...ggggg....','....ggg.....']);
const TSPR={
fish:['.....ff.....','....fAAf....','..aaaaaaa..f','.aeaaaaaaaff','aaaaaaaaaaf.','.AAaaaaaaaff','..AAAAAAA..f','....fAf.....'],
puffer:['..f.f.f.....','.aaaaaaa....','aaaaaaaaa.f.','aeaAaAaaaff.','aaaaaaaaaaf.','aaAaAaAaa.f.','.aaaaaaa....','..f.f.f.....'],
squid:['....a....','...aaa...','..aaaaa..','..aAaAa..','..aaaaa..','..aeaea..','..aaaaa..','.a.a.a.a.','a.a...a.a','.a.....a.'],
jelly:['..aaaaa..','.aaaaaaa.','aaAaaaAaa','AAAAAAAAA','.a.a.a.a.','.a..a..a.','a..a..a..','..a....a.'],
octo:['...aaaa...','..aaaaaa..','.aaaaaaaa.','.aewaaewa.','.aaaaaaaa.','aAaAaAaAa.','a.a.a.a.a.','.a.a.a.a.a'],
boot:['..bbbb....','..bBBb....','..bbbb....','..bbbb....','..bbbbbbb.','.bbbbbbbbb','.BBBBBBBBB'],
ray:['.....aa.....','...aaaaaa...','.aaaaaaaaaa.','aaaaeaaeaaaa','.aaaaaaaaaa.','...aaAAaa...','.....AA.....','.....A......','.....A......'],
eel:['.aaaa.......','aeaaaa....aa','aaAA.aa..aaA','......aaaaA.','.......AAA..'],
narwhal:['W...........','.W..........','..W..aaaa...','...aaaaaaaa.','..aeaaaaaaaf','..aaaAAAaaff','...AAAAAAA.f'],
axo:['A.A.........','.aaaa.......','aeaeaa......','aaaaaaaaaa..','A.aaaaaaaaaa','..a.a..a.a..'],
fly:['aa......aa','aAa.bb.aAa','aaaabbaaaa','.aaabbaaa.','..AabbaA..','.aAabbaAa.','.aa.bb.aa.'],
crawl:['...b..b...','....bb....','..aaAAaa..','b.aaaAaa.b','.aaaaAaaa.','b.aaaAaa.b','.aaaaAaaa.','b.aaaAaa.b','..aaaAaa..'],
drag:['....bb....','aa..bb..aa','aaaabbaaaa','.aaabbaaa.','aaaabbaaaa','aa..AA..aa','....AA....','....AA....','....AA....','....A.....'],
berry:['...gg.gg...','..gGggGgg..','.gaagGgaag.','.gaAgggaAg.','ggggaagggg.','.gGgaAgGg..','..gggggg...','....bb.....'],
flower:['...a.a....','..aaaaa...','.aaacaaa..','..aaaaa...','...a.a....','....g..gg.','.gg.g.gg..','..ggggg...','....g.....'],
mushroom:['...aaaa...','.aaWaaWaa.','aaaaaaaaaa','aAAAAAAAAa','...wwww...','...wwww...','...wwWw...','..gwwwwg..'],
fruit:['.....bg...','....bgg...','..aaaaaa..','.aaWaaaaA.','.aWaaaaaA.','.aaaaaaaA.','..aaaaAA..','...AAAA...'],
ground:['...g.g.g...','....ggg....','...aaaaa...','..aAaAaAa..','..aaaaaaa..','..aAaAaAa..','..aaaaaaa..','...aAaAa...','....aaa....'],
clover:['..aa.aa...','.aaaaaaa..','.aaacaaa..','..aaaaa...','.aaaaaaa..','.aa.a.aa..','....A.....','....A.....'],
};
for(const k in FISH){const F=FISH[k];ICON['f:'+k]=sprite(TSPR[F.spr||'fish'],{a:F.col||'#8a6a4a',A:F.dk||'#5a3a2a',f:F.fin||F.dk||'#5a3a2a',e:'#1a1420'});}
for(const k in BUGS){const B=BUGS[k];ICON['b:'+k]=sprite(TSPR[B.kind||'fly'],{a:B.col,A:B.dk,b:'#2b1e2e'});}
for(const k in PLANTS){const Pd=PLANTS[k];ICON['p:'+k]=sprite(TSPR[Pd.kind],{a:Pd.col,A:Pd.dk,c:Pd.c||'#f6d04a',W:'#fff6e2'});}
const FIND_SPR={
'g:conch':['....nnn.....','..nnwwnn....','.nwwnnwwn...','nwwnppnwwn..','nwnpppwnwwn.','.nwppwnnwwwn','..nnwwwwwnn.','....nnnnn...'],
'g:dollar':['...ssss...','..sWssWs..','.ssswWsss.','.sWwwwwWs.','.ssswWsss.','..sWssWs..','...ssss...'],
'g:glass':['...cc.....','..cccc....','.cwcccl...','.ccccll...','..cllll...','...ll.....'],
'g:star':['....o....','...ooo...','oooooOooo','.ooOoOoo.','..ooooo..','.oo...oo.','oo.....oo'],
'g:pearl':['..wwww..','.wwcwww.','wwcwwwWw','wwwwwWWw','.wWWWWw.','..wwww..'],
'g:drift':['..........bb','.......bbnb.','....bbnnbb..','.bbnnbbb....','bnbbb.......','.b..........'],
'g:bottle':['......bb','.....cub','....ccu.','.cuuwwu.','ccwwwuu.','cuwwuu..','.uuuu...'],
'g:feather':['.........E','.......EEE','.....EEeE.','...EEeEE..','..EeEE....','.EE.......','E.........'],
'g:coral':['.p...p..p.','.pp.pp.pp.','..ppp.pp..','p..pppp...','pp..pp....','.ppppp....','...pp.....','...pp.....'],
'g:obsidianshard':['....V.....','...VkV....','..VkkVV...','.VkkVkkV..','.VkVkkkV..','..VkkkV...','...VVV....'],
'g:amber':['...OO....','..OyyO...','.OyyyyO..','.OyBByO..','.OyyyyO..','..OyyO...','...OO....'],
'g:frostshell':['.....ww.....','...wcwwcw...','..wcwcwcwc..','.wcwcwcwcww.','.wcwcwcwcwc.','..wcwcwcwc..','...wwwwww...'],
'g:driftseed':['....cc....','...cwwc...','..cwccwc..','.cwcggcwc.','.ccgllgcc.','.cgllllgc.','..cgllgc..','...cggc...','....cc....'],
'g:hermit':['...nnnn...','..nwwnnn..','.nwnnwnnn.','.nnwnnwnn.','..nnnnnn..','.oo.oo.oo.','o.oo..oo.o','.r.r..r.r.'],
'g:anemone':['.p.p.p.p.','.p.p.p.p..','..ppppp...','.ppwppwp..','.ppppppp..','..mmmmm...','.mmmmmmm..'],
'g:starfrag':['....y....','...ywy...','yyyywyyyy','.yywwwyy.','..yywyy..','.yy...yy.','y.......y'],
'g:fossil':['...eeee...','..eWWWWe..','.eWeeeeWe.','.eWeWWeWe.','.eWeWeeWe.','.eWeeWWe..','..eWWe....','...ee.....']};
for(const k in FIND_SPR)ICON[k]=sprite(FIND_SPR[k]);
ICON['g:shell']=ICON.shell;
const seedIcon=id=>id==='mystery'?ICON.mystery:ICON[id];
const shellHTML=`<img class="px" src="${ICON.shell}" alt="">`;

