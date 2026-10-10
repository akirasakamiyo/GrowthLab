const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=require("path").join(__dirname,".."),T={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml"};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split("?")[0]);if(p==="/")p="/GrowthLab_v5.html";const f=path.join(ROOT,path.normalize(p));if(!f.startsWith(ROOT)){r.writeHead(403);return r.end()}
fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end("404")}r.writeHead(200,{"Content-Type":T[path.extname(f)]||"application/octet-stream","Cache-Control":"no-store"});r.end(d)})}).listen(+process.env.PORT||8000,"127.0.0.1",()=>console.log("serving on",process.env.PORT||8000));
