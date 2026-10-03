import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.md':'text/plain'};
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/'){res.writeHead(302,{Location:'/wrapper/'});res.end();return;}
 let path=resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!path.startsWith(resolve(root)+sep)){res.writeHead(403);res.end();return;}
 if((await stat(path)).isDirectory()){if(!url.pathname.endsWith('/')){res.writeHead(302,{Location:url.pathname+'/'+url.search});res.end();return;}path=resolve(path,'index.html');}
 const body=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found. Run npm run build in wrapper/ first.');}
}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Wrapper: http://127.0.0.1:'+ (process.env.PORT||4173)+'/wrapper/'));
