const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=require("path").join(__dirname,".."),T={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".mp4":"video/mp4"};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split("?")[0]);if(p==="/")p="/index.html";const f=path.join(ROOT,path.normalize(p));if(!f.startsWith(ROOT)){r.writeHead(403);return r.end()}
fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end("404")}const ty=T[path.extname(f)]||"application/octet-stream",m=/bytes=(\d*)-(\d*)/.exec(q.headers.range||"");
 /* Range untuk video (Safari wajib) */
 if(m){const a=m[1]?+m[1]:d.length-+m[2],b=m[1]&&m[2]?Math.min(+m[2],d.length-1):d.length-1;r.writeHead(206,{"Content-Type":ty,"Content-Range":`bytes ${a}-${b}/${d.length}`,"Accept-Ranges":"bytes","Content-Length":b-a+1,"Cache-Control":"no-store"});return r.end(d.subarray(a,b+1))}
 r.writeHead(200,{"Content-Type":ty,"Accept-Ranges":"bytes","Cache-Control":"no-store"});r.end(d)})}).listen(+process.env.PORT||8000,"127.0.0.1",()=>console.log("serving on",process.env.PORT||8000));
