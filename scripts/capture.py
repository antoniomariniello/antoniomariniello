import urllib.request, json, pathlib, concurrent.futures
root=pathlib.Path(__file__).resolve().parents[1]
base="https://www.antoniomariniello.com"
def get(url):
    req=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (site migration)"})
    with urllib.request.urlopen(req,timeout=60) as r: return r.read(),dict(r.headers)
def collection(kind):
    items=[]; page=1
    while True:
        raw,headers=get(f"{base}/wp-json/wp/v2/{kind}?per_page=100&page={page}")
        batch=json.loads(raw);items.extend(batch)
        total=int(next((v for k,v in headers.items() if k.lower()=="x-wp-totalpages"),"1"))
        if page>=total: break
        page+=1
    (root/"source"/f"{kind}.json").write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding="utf8")
    print(kind,len(items),flush=True)
    return items
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    list(ex.map(collection,["pages","posts","gallery","album","collection","media","comments"]))
raw,_=get(base+"/")
(root/"source/home.html").write_bytes(raw)
print("Home saved",flush=True)
