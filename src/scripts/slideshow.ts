
 const slides=Array.from(document.querySelectorAll<HTMLElement>(".slide"));
 const pause=document.querySelector<HTMLButtonElement>("#pause-slides")!;
 const reduce=matchMedia("(prefers-reduced-motion: reduce)");
 let current=0,paused=reduce.matches,timer:ReturnType<typeof setInterval>|undefined,busy=false;
 function load(i:number){const img=slides[i].querySelector<HTMLImageElement>("img")!;if(!img.getAttribute("src"))img.src=img.dataset.src!;return img;}
 async function show(index:number,announce=false){
  if(busy)return;busy=true;const next=(index+slides.length)%slides.length;
  const img=load(next);try{await img.decode();}catch{}
  slides[current].classList.remove("is-active");slides[current].setAttribute("aria-hidden","true");
  slides[next].classList.add("is-active");slides[next].setAttribute("aria-hidden","false");current=next;
  document.querySelector("#slide-title")!.textContent=slides[current].dataset.title!;
  document.querySelector("#slide-index")!.textContent=String(current+1).padStart(2,"0");
  if(announce)document.querySelector("#slide-announcement")!.textContent=slides[current].dataset.title+" — "+(current+1)+" di "+slides.length;
  busy=false;
 }
 function stop(){clearInterval(timer);}
 function start(){stop();if(!paused&&!document.hidden&&!document.querySelector("dialog[open]"))timer=setInterval(()=>show(current+1),6000);}
 function reflect(){pause.textContent=paused?"▷":"Ⅱ";pause.setAttribute("aria-label",paused?"Avvia presentazione":"Pausa presentazione");pause.setAttribute("aria-pressed",String(paused));start();}
 pause.addEventListener("click",()=>{paused=!paused;reflect();});
 function manual(delta:number){paused=true;reflect();show(current+delta,true);}
 document.querySelector("#previous-slide")!.addEventListener("click",()=>manual(-1));
 document.querySelector("#next-slide")!.addEventListener("click",()=>manual(1));
 document.addEventListener("keydown",e=>{if(document.querySelector("dialog[open]"))return;if(e.key==="ArrowRight")manual(1);if(e.key==="ArrowLeft")manual(-1);});
 let x=0,y=0;
 const hero=document.querySelector<HTMLElement>(".hero")!;
 hero.addEventListener("touchstart",e=>{x=e.touches[0].clientX;y=e.touches[0].clientY;},{passive:true});
 hero.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy))manual(dx<0?1:-1);},{passive:true});
 document.addEventListener("visibilitychange",start);
 new MutationObserver(start).observe(document.querySelector("#navigation")!,{attributes:true,attributeFilter:["open"]});
 hero.addEventListener("focusin",stop);hero.addEventListener("focusout",start);
 reduce.addEventListener("change",()=>{paused=reduce.matches;reflect();});
 reflect();
