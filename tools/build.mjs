#!/usr/bin/env node
// Builds the single-file game (index.html) from src/.
//   src/index.html   page template: /*@styles*/ and /*@game*/ are replaced
//   src/styles.css   all CSS
//   src/game/*.js    game modules, concatenated in filename order inside one IIFE
//   vendor/three-r128/*.js  three.js r128 add-ons (GLTFLoader, SkeletonUtils), inlined before the game: /*@vendor*/
//   assets/characters/*.glb  the player characters, loaded by the page at runtime (published beside index.html)
// Usage: node tools/build.mjs [--out path] [--check] [--embed-chars]
//   --embed-chars  inlines assets/characters/*.glb into the page (for hosts that can't serve .glb files beside it)
//   --check  exits non-zero if the built file differs from the committed one (use in CI)
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),outArg=args.indexOf('--out'),out=outArg>=0?args[outArg+1]:join(root,'index.html');
const tpl=readFileSync(join(root,'src/index.html'),'utf8');
const css=readFileSync(join(root,'src/styles.css'),'utf8').replace(/\n$/,'');
const mods=readdirSync(join(root,'src/game')).filter(f=>f.endsWith('.js')).sort();
const js=mods.map(f=>readFileSync(join(root,'src/game',f),'utf8').replace(/\n$/,'')).join('\n');
// parse (don't run) the bundle so a syntax slip fails the build instead of shipping a blank page
// two modules declaring the same top-level function would silently override each other (the later one wins): refuse
{const seen=new Map(),dup=[];for(const f of mods)for(const m of readFileSync(join(root,'src/game',f),'utf8').matchAll(/^function ([A-Za-z0-9_$]+)\(/gm)){if(seen.has(m[1]))dup.push(`${m[1]} (${seen.get(m[1])} and ${f})`);else seen.set(m[1],f);}
  if(dup.length){console.error('Duplicate top-level functions in src/game: '+dup.join(', '));process.exit(1);}}
try{new vm.Script(`(function(){'use strict';\n${js}\n})`,{filename:'game.js'});}catch(e){console.error('Syntax error in src/game:',e.message);process.exit(1);}
const vendor=readdirSync(join(root,'vendor/three-r128')).filter(f=>f.endsWith('.js')).sort().map(f=>`<script>\n${readFileSync(join(root,'vendor/three-r128',f),'utf8').replace(/\n$/,'')}\n</script>`).join('\n');
const chars=args.includes('--embed-chars')?`<script>window.CHAR_EMBED={${readdirSync(join(root,'assets/characters')).filter(f=>f.endsWith('.glb')).map(f=>`${JSON.stringify(f.slice(0,-4))}:'data:model/gltf-binary;base64,${readFileSync(join(root,'assets/characters',f)).toString('base64')}'`).join(',')}};</script>\n`:'';
const html=tpl.replace('/*@styles*/',()=>css).replace('/*@vendor*/',()=>chars+vendor).replace('/*@game*/',()=>`<script>\n(function(){\n'use strict';\n${js}\n})();\n</script>`);
if(args.includes('--check')){const cur=readFileSync(out,'utf8');if(cur!==html){console.error('index.html is out of date: run `npm run build`');process.exit(1);}console.log('index.html is up to date');}
else{writeFileSync(out,html);console.log(`built ${out} from ${mods.length} modules (${(html.length/1024).toFixed(0)} KB)`);}
