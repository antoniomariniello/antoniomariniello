import site from "../data/site.json";
export function GET(){
const routes=["/","/collection/164-2/","/about/","/privacy-policy/",...site.albums.map(a=>a.path)];
return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(p=>"<url><loc>https://www.antoniomariniello.com"+p+"</loc></url>").join("")+"</urlset>",{headers:{"Content-Type":"application/xml"}});
}