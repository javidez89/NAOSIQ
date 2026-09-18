import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const files={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8']};
const server=createServer((request,response)=>{
response.setHeader('Cache-Control','no-store');response.setHeader('X-Content-Type-Options','nosniff');
response.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'");
if(!['GET','HEAD'].includes(request.method)){response.writeHead(405);response.end();return;}
const pathname=new URL(request.url,'http://127.0.0.1').pathname;
if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
const file=files[pathname];if(!file){response.writeHead(404);response.end('Not found');return;}
response.setHeader('Content-Type',file[1]);response.writeHead(200);response.end(request.method==='HEAD'?undefined:readFileSync(resolve('preview',file[0])));
});
server.listen(4173,'127.0.0.1',()=>console.log('Synthetic preview: http://127.0.0.1:4173 (not the Next.js application)'));
process.on('SIGTERM',()=>server.close());process.on('SIGINT',()=>server.close());
