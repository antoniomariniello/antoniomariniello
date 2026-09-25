
const links=Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-photo]"));
const dialog=document.querySelector<HTMLDialogElement>("#lightbox")!;
const image=document.querySelector<HTMLImageElement>("#lightbox-image")!;
let index=0,opener:HTMLAnchorElement|undefined;
function show(i:number){
 index=(i+links.length)%links.length;
 const link=links[index];image.src=link.href;image.alt=link.querySelector("img")!.alt;
 document.querySelector("#lightbox-caption")!.textContent=link.dataset.caption!;
 document.querySelector("#lightbox-count")!.textContent=String(index+1).padStart(2,"0")+" / "+links.length;
}
links.forEach((link,i)=>link.addEventListener("click",e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();opener=link;show(i);dialog.showModal();document.body.classList.add("modal-open");}));
dialog.querySelector(".lightbox-close")!.addEventListener("click",()=>dialog.close());
dialog.querySelector(".lightbox-previous")!.addEventListener("click",()=>show(index-1));
dialog.querySelector(".lightbox-next")!.addEventListener("click",()=>show(index+1));
dialog.addEventListener("keydown",e=>{if(e.key==="ArrowRight"){e.preventDefault();show(index+1);}if(e.key==="ArrowLeft"){e.preventDefault();show(index-1);}});
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
dialog.addEventListener("close",()=>{document.body.classList.remove("modal-open");opener?.focus();});
let start=0;
image.addEventListener("touchstart",e=>{start=e.touches[0].clientX;},{passive:true});
image.addEventListener("touchend",e=>{const delta=e.changedTouches[0].clientX-start;if(Math.abs(delta)>55)show(index+(delta<0?1:-1));},{passive:true});
