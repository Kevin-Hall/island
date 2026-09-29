/* =========================================================
   Art for the templated finds (11-dex): a pixel icon and a small 3D model per template, in each find's own colours
   (a: main, A: shade). Icons are made here; models come from tplParts (called for them by forageParts, 77-forage).
   ========================================================= */
const FIND_TPL={
  shell:['...aaaa...','..awaaaa..','.awaAaAaa.','.aaAaAaAa.','.aAaAaAaA.','..aAaAaA..','...AAAA...'],
  fan:['..a.a.a...','.aAaAaAa..','aAaAaAaAa.','aAaAaAaAa.','.aAaAaAa..','..aAaAa...','...AAA....','...AA.....'],
  spiral:['....aaa...','...aaAaa..','..aaAwAaa.','..aAaaaAa.','..aAAAAAa.','...aaaaa..','....aAa...','.....a....'],
  stone:['...aaaa...','..awaaaa..','.awaaaaaA.','.aaaaaaaA.','.aaaaaaAA.','..AAAAAA..'],
  gem:['...awwa...','..awaaaa..','.aaaaaaaa.','..aaaaAA..','...aaAA...','....AA....'],
  coin:['...AAAA...','..AaaaaA..','.Aawaaaa A','.AaaAAaaA.','.AaaaaaaA.','..AaaaaA..','...AAAA...'],
  tooth:['...aaaa...','...awaa...','...aaaa...','....aaA...','....aaA...','.....aA...','.....A....'],
  bone:['.aa....aa.','awaaaaaaaa','.aaaaaaaa.','awaaaaaaaA','.AA....AA.'],
  feather:['.......aa.','......aaA.','.....aaA..','....aaA...','...aaA....','..aaA.....','.aA.......','A.........'],
  leaf:['....aa....','...aaaa...','..aaAaaa..','.aaaAaaaa.','.aaaAaaaa.','..aaAaaa..','...aaAa...','.....A....'],
  nut:['...AAAA...','..AAAAAA..','..aaaaaa..','.awaaaaaa.','.aaaaaaaA.','..aaaaaA..','...aaAA...'],
  cap:['...aaaa...','..awaaaa..','.aaaaaaaA.','.AAAAAAAA.','....ww....','....ww....','...wwww...'],
  egg:['....aa....','...awaa...','..awaaaa..','..aaaaaa..','..aaaaaA..','...aaAA...','....AA....'],
};
for(const k in FINDS){const F=FINDS[k];if(F.tpl&&FIND_TPL[F.tpl])ICON['g:'+k]=sprite(FIND_TPL[F.tpl].map(r=>r.replace(/ /g,'.')),{a:F.col,A:F.dk,w:'#fffdf4'});}
// the little 3D version lying on the ground
function tplParts(F,p){const c=new T.Color(F.col).getHex(),d=new T.Color(F.dk).getHex();
  switch(F.tpl){
    case'shell':p.push(PG(SPH_LO,c,d,0,0.05,0,0,0,0,0.24,0.1,0.2),P(BOX,d,0,0.09,0,0,0,0,0.03,0.02,0.18));break;
    case'fan':for(let i=0;i<5;i++){const a=(i-2)*0.32;p.push(PG(CONE4,c,d,Math.sin(a)*0.08,0.04,Math.cos(a)*0.08-0.04,1.35,a,0,0.07,0.2,0.03));}break;
    case'spiral':p.push(PG(CONE8,c,d,0,0.1,0,0,0,1.3,0.2,0.28,0.2),P(SPH_XS,d,0.12,0.08,0,0,0,0,0.08,0.08,0.08));break;
    case'stone':p.push(PG(ICO,c,d,0,0.06,0,0.3,0.5,0,0.22,0.12,0.18));break;
    case'gem':p.push(PG(ICO0,c,d,0,0.08,0,0.4,0.3,0.2,0.16,0.18,0.14),P(SPH_XS,0xffffff,0.03,0.12,0.03,0,0,0,0.04,0.04,0.04));break;
    case'coin':p.push(PG(CYL12,c,d,0,0.02,0,0,0,0,0.2,0.03,0.2),P(CYL12,d,0,0.037,0,0,0,0,0.12,0.005,0.12));break;
    case'tooth':p.push(PG(CONE6,c,d,0,0.05,0,1.4,0.4,0,0.1,0.22,0.06));break;
    case'bone':p.push(PG(SCYL,c,d,0,0.05,0,0,0.5,1.57,0.06,0.36,0.06));for(const s of [-1,1])p.push(P(SPH_XS,c,Math.cos(0.5)*s*0.18,0.05,-Math.sin(0.5)*s*0.18,0,0,0,0.1,0.08,0.1));break;
    case'feather':p.push(PG(SPH_LO,c,d,0,0.03,0,0,0.4,0,0.1,0.02,0.36),P(BOX,d,0,0.045,0,0,0.4,0,0.012,0.012,0.4));break;
    case'leaf':p.push(PG(SPH_LO,c,d,0,0.02,0,0,0.6,0,0.22,0.02,0.3),P(BOX,d,0,0.035,0,0,0.6,0,0.015,0.012,0.28));break;
    case'nut':p.push(PG(SPH_LO,c,d,0,0.07,0,0,0,0,0.16,0.15,0.16),P(SPH_LO,d,0,0.13,0,0,0,0,0.15,0.06,0.15),P(CYL5,d,0,0.17,0,0,0,0,0.015,0.05,0.015));break;
    case'cap':p.push(P(CYL6,0xf4ecd8,0,0.05,0,0,0,0,0.07,0.1,0.07),PG(SPH_LO,c,d,0,0.12,0,0,0,0,0.24,0.14,0.24));break;
    case'egg':p.push(PG(SPH_LO,c,d,0,0.08,0,0,0,0,0.13,0.17,0.13),P(SPH_XS,0x6a8aa0,0.03,0.11,0.05,0,0,0,0.02,0.02,0.02));break;}}
