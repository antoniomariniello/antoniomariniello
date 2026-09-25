
 const menu=document.querySelector<HTMLDialogElement>("#navigation")!;
 const toggle=document.querySelector<HTMLButtonElement>(".menu-toggle")!;
 const closeMenu=()=>menu.close();
 toggle.addEventListener("click",()=>{ menu.showModal();toggle.setAttribute("aria-expanded","true");document.body.classList.add("modal-open"); });
 menu.querySelector(".menu-close")!.addEventListener("click",closeMenu);
 menu.addEventListener("close",()=>{toggle.setAttribute("aria-expanded","false");document.body.classList.remove("modal-open");toggle.focus();});
 menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
