#!/usr/bin/env node
// Packs a .gltf with an embedded (data URI) buffer into a binary .glb: the same scene, meshes, rig and animations, only
// the container changes (JSON chunk + BIN chunk, no base64). Used for the Quaternius characters in assets/characters.
// Usage: node tools/gltf2glb.mjs in.gltf out.glb
import {readFileSync,writeFileSync} from 'node:fs';
const [inp,out]=process.argv.slice(2);if(!inp||!out){console.error('usage: gltf2glb in.gltf out.glb');process.exit(1);}
const g=JSON.parse(readFileSync(inp,'utf8'));
if(g.buffers.length!==1||!/^data:/.test(g.buffers[0].uri||'')){console.error('expected exactly one embedded buffer');process.exit(1);}
const bin=Buffer.from(g.buffers[0].uri.split(',')[1],'base64');delete g.buffers[0].uri;g.buffers[0].byteLength=bin.length;
const pad=(b,c)=>Buffer.concat([b,Buffer.alloc((4-b.length%4)%4,c)]);
const json=pad(Buffer.from(JSON.stringify(g)),0x20),body=pad(bin,0);
const hdr=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
hdr.writeUInt32LE(0x46546c67,0);hdr.writeUInt32LE(2,4);hdr.writeUInt32LE(12+8+json.length+8+body.length,8);
jh.writeUInt32LE(json.length,0);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(body.length,0);bh.writeUInt32LE(0x004e4942,4);
writeFileSync(out,Buffer.concat([hdr,jh,json,bh,body]));console.log(`${out}: ${(Buffer.concat([hdr,jh,json,bh,body]).length/1024).toFixed(0)} KB`);
