import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {watch} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
import {root} from './validate-data.mjs';
const dev=process.argv.includes('--dev'), port=Number(process.env.PORT||4321),base=resolve(root,'dist');
function rebuild(){return spawnSync(process.execPath,[resolve(root,'scripts/build.mjs')],{stdio:'inherit'}).status===0;}
if(dev&&!rebuild())process.exit(1);
try{await stat(base);}catch{console.error('Run npm run build first.');process.exit(1);}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const server=createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
  try {
    const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
    let file=resolve(base,'.'+pathname);
    if((file!==base&&!file.startsWith(base+sep))||pathname.includes('\0')){res.writeHead(400);return res.end();}
    if(pathname==='/'){res.writeHead(302,{Location:'/en/'+url.search});return res.end();}
    let info;
    try{info=await stat(file);}catch{}
    if(info?.isDirectory()){
      if(!pathname.endsWith('/')){res.writeHead(308,{Location:pathname+'/'+url.search});return res.end();}
      file=resolve(file,'index.html');
    }
    let body,status=200;
    try{body=await readFile(file);}catch{status=404;file=resolve(base,'404.html');body=await readFile(file);}
    res.writeHead(status,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(400);res.end('Bad request');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/en/`));
if(dev){let timer;for(const folder of ['data','src','public'])watch(resolve(root,folder),{recursive:true},()=>{clearTimeout(timer);timer=setTimeout(rebuild,150);});}
