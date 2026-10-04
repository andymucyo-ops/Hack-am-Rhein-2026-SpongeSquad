// Isolated assembly: all inputs, dependencies and generated output stay in wrapper/.
import {cpSync,existsSync,mkdirSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const stage=root+'.site-workspace';
mkdirSync(stage,{recursive:true});
cpSync(root+'site',stage,{recursive:true});
// Workstream-owned media stays in its repository folder. Stage a read-only
// copy so the wrapper can publish the declared playground assets.
cpSync(root+'../explainer-videos-context',stage+'/explainer-videos-context',{recursive:true});
for(const name of ['street-workspace','street-xray','data-charter-map','sponge-catalogue','prototypes','docs','evidence-atlas','experiments','frontend']){
 const dest=stage+'/wrapper/'+name;
 // Preserve installed dependencies, but never copy generated output from source.
 cpSync(root+name,dest,{recursive:true,filter:p=>!p.split('/').some(x=>['node_modules','dist','.git'].includes(x))});
}
const run=(script)=>{const r=spawnSync(process.execPath,[stage+'/scripts/'+script],{cwd:stage,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);};
cpSync(root+'index.html',stage+'/wrapper/index.html');
run('setup.mjs');
run('build-integration.mjs');
if(process.argv.includes('--test'))run('test-all.mjs');
rmSync(root+'dist',{recursive:true,force:true});cpSync(stage+'/dist',root+'dist',{recursive:true});
console.log('Website ready in wrapper/dist/');
