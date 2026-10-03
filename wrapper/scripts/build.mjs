import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=root+'dist/wrapper/';
rmSync(root+'dist',{recursive:true,force:true});
mkdirSync(out,{recursive:true});
for(const name of ['index.html','shell.css','street-xray','prototypes','sponge-catalogue','docs'])cpSync(root+name,out+name,{recursive:true});
for(const name of ['street-workspace','data-charter-map'])cpSync(root+name+'/dist',out+name,{recursive:true});
console.log('Built wrapper/dist: serve with npm start from wrapper/');
