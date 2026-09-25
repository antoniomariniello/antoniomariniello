import pathlib,json,re,html,urllib.request,urllib.parse,concurrent.futures,time
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1]
def read(name):return json.loads((root/"source"/(name+".json")).read_text(encoding="utf8"))
def local(url):return urllib.parse.unquote(urllib.parse.urlparse(url).path)
def text(s):return html.unescape(re.sub("<[^>]+>","",s)).strip()
urls=set()
albums=[]
for a in read("album"):
    raw=(root/"source"/f'{a["id"]}.html').read_text(encoding="utf8")
    photos=[]
    for tag in re.findall(r'<a\b[^>]*class="photo_link"[^>]*>',raw,re.S):
        attrs=dict(re.findall(r'([\w-]+)="([^"]*)"',tag))
        u=html.unescape(attrs["href"]).replace("http:","https:")
        captionid=attrs.get("data-sub-html","")[1:]
        caption=re.search(r'id="'+re.escape(captionid)+r'".*?class="[^"]*image-caption"[^>]*>(.*?)</div>',raw,re.S)
        caption=text(caption.group(1)) if caption else ""
        thumb=html.unescape(attrs.get("data-img",u)).replace("http:","https:")
        urls.update([u,thumb])
        photos.append({"src":local(u),"thumb":local(thumb),"caption":caption,"alt":caption or a["title"]["rendered"]+" — fotografia "+str(len(photos)+1)})
    print(a["slug"],len(photos),flush=True)
    albums.append({"slug":a["slug"],"title":a["title"]["rendered"],"path":"/album/"+a["slug"]+"/","photos":photos})
for m in read("media"):urls.add(m["source_url"])
home=(root/"source/home.html").read_text(encoding="utf8")
slides=[]
for title,url in re.findall(r'data-title="([^"]+)"[^>]*>\s*<div[^>]*background-image:url\(([^)]+)\)',home):
    if any(s["src"]==local(url) for s in slides):continue
    urls.add(url);slides.append({"title":title.replace("_"," ").capitalize(),"src":local(url)})
collection=(root/"source/164.html").read_text(encoding="utf8")
for slug,url in re.findall(r'href="https://www.antoniomariniello.com/album/([^/]+)/"[^>]*background-image:url\(\x27([^\x27]+)',collection):
    urls.add(url)
    next(a for a in albums if a["slug"]==slug)["cover"]=local(url)
# All non-gallery media used in page content, icons included.
for source in (root/"source").glob("*.html"):
    for u in re.findall(r'https?://www\.antoniomariniello\.com/wp-content/uploads/[^\s"\x27<>\)]+',source.read_text(encoding="utf8")):
        if re.search(r'\.(png|jpg|jpeg|webp|gif|ico)$',u,re.I):urls.add(html.unescape(u).replace("http:","https:"))
def download(u):
    p=root/"public"/local(u).lstrip("/")
    if p.exists() and p.stat().st_size:return
    p.parent.mkdir(parents=True,exist_ok=True)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(u,timeout=40) as r:p.write_bytes(r.read())
            return
        except Exception:
            if attempt==2:raise
            time.sleep(1)
print("Downloading",len(urls),"assets",flush=True)
errors=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    jobs={pool.submit(download,u):u for u in sorted(urls)}
    for i,job in enumerate(concurrent.futures.as_completed(jobs)):
        try:job.result()
        except Exception as e:errors.append({"url":jobs[job],"error":str(e)})
        if (i+1)%40==0:print("Downloaded",i+1,flush=True)
for a in albums:
    for p in a["photos"]:
        full=root/"public"/p["src"].lstrip("/")
        if full.exists():
            with Image.open(full) as im:p["width"],p["height"]=im.size
data={"albums":albums,"slides":slides,"socials":[{"name":"Instagram","url":"https://www.instagram.com/anto_9285/"},{"name":"Facebook","url":"https://www.facebook.com/antonio.mariniello.9285"},{"name":"LinkedIn","url":"https://www.linkedin.com/in/antoniomariniello/"},{"name":"X / Twitter","url":"https://twitter.com/mrantonio9285"}]}
(root/"src/data/site.json").write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf8")
(root/"docs/migration-inventory.json").write_text(json.dumps({"source":"https://www.antoniomariniello.com","captured":"2026-09-25","albums":{a["slug"]:len(a["photos"]) for a in albums},"homeSlides":len(slides),"assets":len(urls),"errors":errors,"routes":[i["link"] for k in ["pages","album","gallery","collection","posts"] for i in read(k)]},ensure_ascii=False,indent=2),encoding="utf8")
print("Finished",len(urls),"assets; errors:",errors,flush=True)
