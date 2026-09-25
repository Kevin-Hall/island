/* =========================================================
   Audio (tiny synth)
   ========================================================= */
let AC=null,waves=null;
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}if(AC.state==='suspended')AC.resume();return AC;}
function tone(f,d=0.12,type='square',v=0.04,f2){if(!S.sound)return;const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+0.02);}
let noiseBuf=null;
function noise(d=0.15,v=0.05,freq=800,q=1){if(!S.sound)return;const a=ac();if(!a)return;
  if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*2,a.sampleRate);const ch=noiseBuf.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;}
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;s.buffer=noiseBuf;f.type='bandpass';f.frequency.value=freq;f.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);s.connect(f);f.connect(g);g.connect(a.destination);s.start(t,Math.random());s.stop(t+d+0.02);}
function startWaves(){const a=ac();if(!a||waves)return;noise(0.01,0.0001);if(!noiseBuf)return;
  const s=a.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=420;
  const g=a.createGain();g.gain.value=0;const lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.value=0.12;lg.gain.value=0.012;lfo.connect(lg);lg.connect(g.gain);
  s.connect(f);f.connect(g);g.connect(a.destination);s.start();lfo.start();waves={g,f};setWaveVol();}
function setWaveVol(){if(waves)waves.g.gain.value=S.sound?0.018:0;}
const SFX={
  cast:()=>noise(0.25,0.06,1800,0.7),plop:()=>{noise(0.12,0.1,700,1.2);tone(300,0.1,'sine',0.05,180);},
  bite:()=>{noise(0.22,0.14,900,1);tone(560,0.14,'square',0.045,260);},nibble:()=>tone(240,0.05,'sine',0.05),
  caw:()=>{tone(430,0.16,'sawtooth',0.025,300);setTimeout(()=>tone(400,0.2,'sawtooth',0.025,270),210);},
  catch:()=>{[523,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.12,'square',0.035),i*70));},
  till:()=>noise(0.12,0.12,380,0.8),plant:()=>{tone(520,0.07,'triangle',0.06);setTimeout(()=>tone(780,0.08,'triangle',0.05),50);},
  water:()=>noise(0.4,0.05,2600,0.6),pop:()=>tone(900,0.06,'triangle',0.03),
  harvest:()=>{tone(660,0.07,'square',0.03);setTimeout(()=>tone(990,0.09,'square',0.03),60);},
  rare:()=>{[784,988,1175,1568,1976].forEach((f,i)=>setTimeout(()=>tone(f,0.2,'triangle',0.05),i*80));},
  coin:()=>{tone(988,0.06,'square',0.03);setTimeout(()=>tone(1319,0.16,'square',0.03),60);},
  place:()=>{tone(200,0.14,'triangle',0.09,110);noise(0.08,0.06,500);},ui:()=>tone(720,0.04,'square',0.018),
  no:()=>tone(190,0.14,'square',0.03,140),level:()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.16,'square',0.035),i*110));},
  splash:()=>{noise(0.3,0.1,600,0.8);},horn:()=>{tone(220,0.35,'triangle',0.06);setTimeout(()=>tone(165,0.45,'triangle',0.06),300);},
  discover:()=>{[392,523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.22,'triangle',0.05),i*120));},
};

