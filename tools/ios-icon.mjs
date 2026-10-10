#!/usr/bin/env node
// Renders ios/art/AppIcon.svg to the app icon PNG (1024x1024, opaque, as App Store Connect requires) with Playwright.
// Usage: node tools/ios-icon.mjs   (set PLAYWRIGHT_PATH / CHROME_PATH as for tools/smoke.mjs if they aren't on the default paths)
import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const pw=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH||'playwright');
const b=await pw.chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
const pg=await (await b.newContext({viewport:{width:1024,height:1024},deviceScaleFactor:1})).newPage();
await pg.setContent(`<style>html,body{margin:0;background:#5fa8ec}</style>${readFileSync(join(root,'ios/art/AppIcon.svg'),'utf8')}`);
const out=join(root,'ios/Driftseed/Assets.xcassets/AppIcon.appiconset/AppIcon.png');
await pg.screenshot({path:out,omitBackground:false,clip:{x:0,y:0,width:1024,height:1024}});
await b.close();console.log('wrote '+out);
