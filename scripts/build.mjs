import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const dist=join(root,'dist');
const files=['index.html','rift.css','THIRD_PARTY_NOTICES.md','src/app.mjs','src/rift-game.mjs','src/rift-relay-model.mjs'];
await rm(dist,{recursive:true,force:true});
for(const file of files){const target=join(dist,file);await mkdir(dirname(target),{recursive:true});await cp(join(root,file),target)}
const html=await readFile(join(dist,'index.html'),'utf8');
for(const required of ['./rift.css','./src/app.mjs','data-challenge-id="rift-relay"','<canvas'])if(!html.includes(required))throw new Error(`Missing production reference: ${required}`);
for(const module of ['src/app.mjs','src/rift-game.mjs','src/rift-relay-model.mjs'])await stat(join(dist,module));
const runtime=await readFile(join(dist,'src/rift-game.mjs'),'utf8');
for(const required of ['requestAnimationFrame','getContext','pointerdown','pointerup'])if(!runtime.includes(required))throw new Error(`Runtime contract missing: ${required}`);
const forbidden=['orbit-lock','echo-grid','lumen-lanes','mirror-fuse'];
for(const file of ['index.html','src/app.mjs','src/rift-game.mjs','src/rift-relay-model.mjs']){const content=await readFile(join(dist,file),'utf8');for(const legacy of forbidden)if(content.includes(legacy))throw new Error(`Legacy challenge reference ${legacy} remains in ${file}`)}
console.log('Built self-contained Pulsebound runtime');
