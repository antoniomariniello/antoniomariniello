import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const file='src/data/site.json';
const site=JSON.parse(fs.readFileSync(file,'utf8'));
const unique=new Map();
for(const a of site.albums)for(const p of a.photos)unique.set(p.src,[640,1200,1920]);
for(const p of site.slides)unique.set(p.src,[960,1920]);
for(const a of site.albums)unique.set(a.cover,[640,1200]);
unique.set('/wp-content/uploads/2022/09/antonio_occhio.jpg',[640,960]);
fs.mkdirSync('public/images',{recursive:true});
const optimized={};
for(const [src,widths] of unique){
 const id=src.replace('/wp-content/uploads/','').replaceAll('/','-').replace(/\.[^.]+$/,'');
 const meta=await sharp('public'+src).metadata();
 const variants=[];
 for(const width of widths){
  const dest='/images/'+id+'-'+width+'.webp';
  if(!fs.existsSync('public'+dest))await sharp('public'+src).rotate().resize({width,withoutEnlargement:true}).webp({quality:85}).toFile('public'+dest);
  variants.push({src:dest,width:Math.min(width,meta.width)});
 }
 optimized[src]={variants,width:meta.width,height:meta.height};
}
fs.writeFileSync('src/data/images.json',JSON.stringify(optimized,null,2));
console.log('Optimized '+unique.size+' photographs');
