import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parse} from 'parse5';
const site=JSON.parse(fs.readFileSync('src/data/site.json','utf8'));
const inventory=JSON.parse(fs.readFileSync('docs/migration-inventory.json','utf8'));
const walk=(n,fn)=>{fn(n);for(const c of n.childNodes||[])walk(c,fn);};
const files=fs.readdirSync('dist',{recursive:true}).filter(p=>p.endsWith('.html'));
let references=0;
const errors=[];
for(const file of files){
 const raw=fs.readFileSync(path.join('dist',file),'utf8');
 const tree=parse(raw);
 walk(tree,n=>{
  for(const a of n.attrs||[]){
   if(!['href','src','srcset','data-src'].includes(a.name))continue;
   const urls=a.name==='srcset'?a.value.split(',').map(v=>v.trim().split(/\s+/)[0]):[a.value];
   for(const url of urls){
    if(!url.startsWith('/')||url.startsWith('//'))continue;
    const clean=decodeURIComponent(url.split(/[?#]/)[0]);
    const target=path.join('dist',clean.endsWith('/')?clean+'index.html':clean);
    if(!fs.existsSync(target))errors.push({file,url});
    references++;
   }
  }
 });
 assert(!/<(?:script|img|link)[^>]+(?:src|href)=["']https?:\/\/www\.antoniomariniello\.com\/(?:wp-includes|wp-content|wp-admin)/.test(raw),'WordPress runtime dependency '+file);
}
assert.deepEqual(errors,[],'Broken local references');
assert.deepEqual(inventory.errors,[]);
assert.equal(site.slides.length,17);
for(const album of site.albums){
 assert.equal(album.photos.length,inventory.albums[album.slug]);
 for(const route of ['album','gallery']){
  const raw=fs.readFileSync('dist/'+route+'/'+album.slug+'/index.html','utf8');
  let photos=[];
  walk(parse(raw),n=>{if(n.nodeName==='a'&&n.attrs?.some(a=>a.name==='data-photo'))photos.push(n.attrs.find(a=>a.name==='href').value);});
  assert.deepEqual(photos,album.photos.map(p=>p.src),'Album order or images differ: '+route+'/'+album.slug);
 }
 for(const p of album.photos){assert(fs.existsSync('dist'+p.src));assert(p.width>0&&p.height>0);}
}
for(const url of inventory.routes){
 const route=new URL(url).pathname;
 assert(fs.existsSync(path.join('dist',route,'index.html')),'Missing original route '+route);
}
console.log(JSON.stringify({pages:files.length,albums:site.albums.length,photos:site.albums.reduce((n,a)=>n+a.photos.length,0),homeSlides:site.slides.length,localReferences:references,broken:errors},null,2));
