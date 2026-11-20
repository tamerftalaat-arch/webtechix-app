const DATA_URL="https://webtechix.blogspot.com/p/webtechix-app-data.html";
const $=s=>document.querySelector(s);
function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function loadData(){
  try{
    const res=await fetch(DATA_URL,{mode:"cors",cache:"no-store"});
    if(!res.ok) throw new Error("HTTP "+res.status);
    const html=await res.text();
    const doc=new DOMParser().parseFromString(html,"text/html");
    const node=doc.querySelector("#webtechix-app-data");
    if(!node) throw new Error("لم يتم العثور على بيانات التطبيق");
    const obj=JSON.parse(node.textContent);
    return obj;
  }catch(e){
    console.info("تعذر جلب بيانات بلوجر؛ سيتم استخدام النسخة المضمنة.",e);
    const r=await fetch("./data.json"); return await r.json();
  }
}
function renderCards(selector,items,kind){
  const root=$(selector); if(!root)return;
  root.innerHTML=(items||[]).map((x,i)=>{
    const title=x.title||x.name||"";
    const image=x.image||x.imageUrl||"";
    const desc=x.description||x.subtitle||"";
    const features=Array.isArray(x.features)?`<ul class="featureList">${x.features.map(f=>`<li>${safe(f)}</li>`).join("")}</ul>`:"";
    const price=x.price?`<p>يبدأ من ${safe(x.price)} جنيه</p>`:"";
    return `<article class="item">${image?`<img loading="lazy" src="${safe(image)}" alt="${safe(title)}">`:""}<div class="itemBody"><h3>${safe(title)}</h3>${desc?`<p>${safe(desc)}</p>`:""}${features}${price}<button type="button" data-kind="${kind}" data-index="${i}">${safe(x.cta||"استفسر الآن")}</button></div></article>`;
  }).join("");
  root.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>contact(kind,items[+b.dataset.index])));
}
function contact(kind,item){
  const msg=`مرحبًا WEBTECHIX، أريد الاستفسار عن ${item?.title||"الخدمات الرقمية"}.`;
  const url=(window.APP_WHATSAPP||"https://wa.me/201027346504")+"?text="+encodeURIComponent(msg);
  window.open(url,"_blank","noopener");
}
async function start(){
  const d=await loadData();
  window.APP_WHATSAPP=d.whatsapp||d.contact?.whatsapp||"https://wa.me/201027346504";
  if(d.brand?.logo) $("#brandLogo").src=d.brand.logo;
  if(d.hero?.[0]){$(".hero").style.backgroundImage=`linear-gradient(90deg,#071b35ef,#071b35a6),url("${d.hero[0].image}")`;$(".heroText span").textContent=d.hero[0].tag||"WEBTECHIX";$(".hero h1").textContent=d.hero[0].title||"نحوّل أفكارك إلى حلول رقمية";$(".hero p").textContent=d.hero[0].description||"";}
  renderCards("#services",d.services,"service");renderCards("#packages",d.packages,"package");
const projectLinks = {
  "دار بيت الروايات": "https://betroawayat.blogspot.com/",
  "دار الصومعة": "https://elsawmaa.blogspot.com/",
  "دقائق علمية": "https://daqaeqelmia.blogspot.com/" 
};

$("#projects").innerHTML = (d.projects || []).map(p => {
  const title = p.title || p.name || "مشروع";
  const key = Object.keys(projectLinks).find(k => title.includes(k));
  const url = p.url || (key ? projectLinks[key] : "");

  return url
    ? `<a class="project" href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(title)}<small>زيارة الموقع ↗</small></a>`
    : `<div class="project">${safe(title)}</div>`;
}).join("");
  $("#aboutTitle").textContent=d.about?.headline||"نحوّل أفكارك إلى حلول رقمية";$("#aboutDesc").textContent=d.about?.description||"";
  $("#values").innerHTML=(d.about?.values||[]).map(v=>`<div class="value">${safe(v)}</div>`).join("");
  $("#why").innerHTML=(d.whyChooseUs||[]).map(w=>`<div class="whyCard"><b>${safe(w.title)}</b><p>${safe(w.description)}</p></div>`).join("");
  $("#whatsapp").href=window.APP_WHATSAPP;
}
start().catch(e=>{console.error(e);$("#app").insertAdjacentHTML("afterbegin",'<p style="padding:20px;text-align:center">تعذر تحميل بيانات التطبيق. تأكدي من اتصال الإنترنت ثم أعيدي فتحه.</p>')});
let deferredPrompt;const installBtn=$("#installBtn");
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
installBtn.addEventListener("click",async()=>{if(!deferredPrompt){alert("من قائمة المتصفح اختاري: إضافة إلى الشاشة الرئيسية.");return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.hidden=true;});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
