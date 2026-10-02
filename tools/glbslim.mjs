#!/usr/bin/env node
// Slims a single-material .glb for the game: keeps the meshes and the base colour texture (replaced by a smaller image
// you've made, e.g. a 1024px JPEG), and drops the normal, metal/roughness and any other maps (the game's toon shading
// only reads the colour). Used for AI-generated characters, whose 4K maps run to tens of MB.
// Usage: node tools/glbslim.mjs in.glb base-colour.(jpg|png) out.glb
import {readFileSync,writeFileSync} from 'node:fs';
const [inp,imgPath,out]=process.argv.slice(2);if(!out){console.error('usage: glbslim in.glb base-colour.jpg out.glb');process.exit(1);}
const b=readFileSync(inp),jl=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+jl).toString()),bin=b.subarray(20+jl+8);
const img=readFileSync(imgPath),mime=/\.png$/i.test(imgPath)?'image/png':'image/jpeg';
for(const m of g.materials||[]){const pb=m.pbrMetallicRoughness||{};m.pbrMetallicRoughness={baseColorTexture:pb.baseColorTexture?{index:0}:undefined,metallicFactor:0,roughnessFactor:1};delete m.normalTexture;delete m.occlusionTexture;delete m.emissiveTexture;delete m.extensions;}
delete g.extensionsUsed;delete g.extensionsRequired;/* (material extensions such as specular go with the maps) */
// rebuild the binary chunk from the buffer views the accessors use, plus the new image
const used=[...new Set(g.accessors.map(a=>a.bufferView))],views=[],parts=[];let off=0;const remap={};
const add=buf=>{const pad=(4-off%4)%4;if(pad){parts.push(Buffer.alloc(pad));off+=pad;}const v={buffer:0,byteOffset:off,byteLength:buf.length};parts.push(buf);off+=buf.length;views.push(v);return views.length-1;};
for(const i of used){const v=g.bufferViews[i],o=v.byteOffset||0;remap[i]=add(bin.subarray(o,o+v.byteLength));if(v.byteStride)views[remap[i]].byteStride=v.byteStride;if(v.target)views[remap[i]].target=v.target;}
for(const a of g.accessors)a.bufferView=remap[a.bufferView];
g.images=[{bufferView:add(img),mimeType:mime}];g.textures=[{source:0,sampler:g.textures&&g.textures[0]&&g.textures[0].sampler}];if(g.textures[0].sampler===undefined)delete g.textures[0].sampler;
g.bufferViews=views;let body=Buffer.concat(parts);body=Buffer.concat([body,Buffer.alloc((4-body.length%4)%4)]);g.buffers=[{byteLength:body.length}];
let json=Buffer.from(JSON.stringify(g));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);
const h=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);h.writeUInt32LE(0x46546c67,0);h.writeUInt32LE(2,4);h.writeUInt32LE(28+json.length+body.length,8);
jh.writeUInt32LE(json.length,0);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(body.length,0);bh.writeUInt32LE(0x004e4942,4);
writeFileSync(out,Buffer.concat([h,jh,json,bh,body]));console.log(`${out}: ${((28+json.length+body.length)/1024).toFixed(0)} KB`);
