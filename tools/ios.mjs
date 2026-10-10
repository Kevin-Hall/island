#!/usr/bin/env node
// Builds the offline web bundle the iOS app ships (ios/Driftseed/Web/index.html).
// The App Store wants every line of game code inside the app, and the app must work with no connection, so this
// is the normal build (characters embedded) with the two network loads swapped for files already in ios/Driftseed/Web/:
//   three.js r128 from cdnjs    -> three.min.js
//   the Google Fonts stylesheet -> fonts/fonts.css (Latin subsets, licences beside them)
// Usage: node tools/ios.mjs [--check]
//   --check  exits non-zero if the committed bundle is out of date with src/ (use in CI)
import {readFileSync,writeFileSync,existsSync,mkdtempSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
const root=join(dirname(fileURLToPath(import.meta.url)),'..'),web=join(root,'ios/Driftseed/Web'),out=join(web,'index.html');
for(const f of ['three.min.js','fonts/fonts.css'])if(!existsSync(join(web,f))){console.error(`missing ios/Driftseed/Web/${f}`);process.exit(1);}
const tmp=mkdtempSync(join(tmpdir(),'driftseed-ios-')),built=join(tmp,'index.html');
try{execFileSync(process.execPath,[join(root,'tools/build.mjs'),'--embed-chars','--out',built],{stdio:['ignore','ignore','inherit']});}
catch(e){rmSync(tmp,{recursive:true,force:true});process.exit(1);}
let html=readFileSync(built,'utf8');rmSync(tmp,{recursive:true,force:true});
const swap=(re,to,what)=>{if(!re.test(html)){console.error(`couldn't find the ${what} in src/index.html`);process.exit(1);}html=html.replace(re,to);};
swap(/<link rel="preconnect"[^>]*>\n/g,'','font preconnects');
swap(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^"]*">/,'<link rel="stylesheet" href="fonts/fonts.css">','Google Fonts link');
swap(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js"><\/script>/,'<script src="three.min.js"></script>','three.js script tag');
if(/\bsrc="https?:|\bhref="https?:/.test(html)){console.error('the iOS bundle still loads something from the network');process.exit(1);}
if(process.argv.includes('--check')){const cur=existsSync(out)?readFileSync(out,'utf8'):'';if(cur!==html){console.error('ios/Driftseed/Web/index.html is out of date: run `npm run ios`');process.exit(1);}console.log('iOS bundle is up to date');}
else{writeFileSync(out,html);console.log(`built ios/Driftseed/Web/index.html (${(html.length/1024).toFixed(0)} KB, offline)`);}
