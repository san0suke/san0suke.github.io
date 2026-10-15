import {calculateExperience,saoPauloDate} from './experience.js';
import {technologies} from './data.js?v=20261014-10';
import {prepareScrollVideo} from './video.js';
import {installChapterNavigation} from './navigation.js?v=20261015-17';
import {installResponsiveLayout,installInfoDialogs} from './responsive.js?v=20261014-15';
import {installCareerTimeline} from './timeline.js?v=20261014-15';
import {installSectionMotion} from './motion.js?v=20261015-18';
import {resolveLanguage,languageUrl,text,localizedTechnology} from './i18n.js?v=20261015-18';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const body=document.body, media=$('#journey'), film=$('.film');
body.classList.add('js');
let languagePreference=null;try{languagePreference=localStorage.getItem('robson-language');}catch{}
let language=resolveLanguage(location.search,languagePreference);
function applyLanguage(){
 document.documentElement.lang=language==='pt'?'pt-BR':'en';
 document.title=language==='pt'?'Robson Cesar de Siqueira — Engenharia & experiência':'Robson Cesar de Siqueira — Engineering & experience';
 const description=document.querySelector('meta[name="description"]');
 if(description)description.content=language==='pt'?'Engenheiro de software com experiência em iOS, Android, produtos financeiros e SDKs. Conheça a trajetória e as tecnologias de Robson Cesar de Siqueira.':'Software engineer experienced in iOS, Android, financial products, and SDKs. Explore Robson Cesar de Siqueira’s career and technologies.';
 const ogTitle=document.querySelector('meta[property="og:title"]');if(ogTitle)ogTitle.content=language==='pt'?'Robson Siqueira — Engenharia & experiência':'Robson Siqueira — Engineering & experience';
 const ogDescription=document.querySelector('meta[property="og:description"]');if(ogDescription)ogDescription.content=language==='pt'?'Engenharia mobile. Experiências que conectam.':'Mobile engineering. Experiences that connect.';
 $$('[data-i18n]').forEach(el=>{el.innerHTML=text(language,el.dataset.i18n);});
 $$('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',text(language,el.dataset.i18nAria));});
 $$('[data-i18n-roledescription]').forEach(el=>{el.setAttribute('aria-roledescription',text(language,el.dataset.i18nRoledescription));});
 $$('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
 $('#calculation-copy').innerHTML=text(language,'calculation');
 $('#loader-status').textContent=loaded?text(language,'loaderReady'):text(language,'loaderStatus');
 $('#reduce-motion').textContent=text(language,reduced?'enableMotion':'reduceMotion');
 format=new Intl.NumberFormat(language==='pt'?'pt-BR':'en-US');
 if(counts){['years','days','hours'].forEach(key=>{if(counterStarted||loaded)$(`[data-count="${key}"]`).textContent=format.format(counts[key]);});}
 $$('.metric-echo').forEach(el=>{const key=el.closest('.metric').id==='metric-days'?'days':el.closest('.metric').id==='metric-years'?'years':'hours';el.dataset.echo=format.format(counts[key])+(key==='days'?'':'+');});
 if(counts)setCalculationDate();
 describe?.(describedIndex??0);
 refreshTechnologySamples?.();
 sectionMotion?.refreshLabel();
 layout.refresh();
}
function changeLanguage(next){language=next;try{localStorage.setItem('robson-language',language);}catch{}history.replaceState(history.state,'',languageUrl(location.href,language));applyLanguage();}
$$('[data-language]').forEach(button=>button.addEventListener('click',()=>changeLanguage(button.dataset.language)));
addEventListener('popstate',()=>{const next=resolveLanguage(location.search,language);if(next!==language){language=next;applyLanguage();}});
const layout=installResponsiveLayout();
installCareerTimeline();
installInfoDialogs();
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let storedMotion=null;try{storedMotion=localStorage.getItem('robson-reduced-motion');}catch{}
let reduced=storedMotion===null?systemMotion.matches:storedMotion==='true';
let cubeController=null,sectionMotion=null;
function applyMotion(){body.classList.toggle('reduced-motion',reduced);$('#reduce-motion').setAttribute('aria-pressed',String(reduced));$('#reduce-motion').textContent=text(language,reduced?'enableMotion':'reduceMotion');cubeController?.setReducedMotion(reduced);sectionMotion?.refresh();}
$('#reduce-motion').addEventListener('click',()=>{reduced=!reduced;storedMotion=String(reduced);try{localStorage.setItem('robson-reduced-motion',String(reduced));}catch{}applyMotion();onScroll();});
systemMotion.addEventListener('change',e=>{if(storedMotion===null){reduced=e.matches;applyMotion();}});
$('#current-year').textContent=new Date().getFullYear();

const menu=$('#menu-toggle'),nav=$('#navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
nav.addEventListener('focusout',e=>{if(!nav.contains(e.relatedTarget)&&e.relatedTarget!==menu)closeMenu();});
document.addEventListener('click',e=>{if(!$('#header').contains(e.target))closeMenu();});

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.13});
$$('.reveal').forEach(el=>observer.observe(el));
const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){$$('.navigation a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-25% 0px -55% 0px'});
['sobre','experiencia','numeros','tecnologias','projetos','contato'].forEach(id=>sectionObserver.observe($('#'+id)));

// The page only opens after download, decoder warmup and a verified seek.
const loader=$('#loader');loader.hidden=false;body.classList.add('is-loading');
let loaded=false,videoController=null,scrollFrame=0,loadGeneration=0,loadAbort=null;
let timeoutTimer,skipTimer;
function finishLoading(){if(loaded)return;loaded=true;clearTimeout(timeoutTimer);clearTimeout(skipTimer);$('#loader-progress').style.transform='scaleX(1)';$('#loader-status').textContent=text(language,'loaderReady');loader.classList.add('leaving');body.classList.remove('is-loading');$('main').removeAttribute('aria-busy');setTimeout(()=>{loader.hidden=true;},650);onScroll();}
function showProgress(value){const percent=Math.round(value*100);$('#loader-progress').style.transform=`scaleX(${Math.max(.02,value)})`;$('#loader-percent').textContent=percent;$('.loader-track').setAttribute('aria-valuenow',percent);}
async function loadExperience(){
 const generation=++loadGeneration;loadAbort?.abort();loadAbort=new AbortController();
 $('#loader-retry').hidden=true;$('#loader-skip').hidden=true;$('#loader-status').textContent=text(language,'loaderPreparing');showProgress(0);
 clearTimeout(skipTimer);clearTimeout(timeoutTimer);
 skipTimer=setTimeout(()=>{$('#loader-skip').hidden=false;$('#loader-status').textContent=text(language,'loaderWait');},8000);
 timeoutTimer=setTimeout(()=>loadAbort.abort(),45000);
 try{
  const ready=await prepareScrollVideo(media,media.dataset.src,{signal:loadAbort.signal,onProgress:value=>{if(generation===loadGeneration)showProgress(value);}});
  if(generation!==loadGeneration){ready.destroy();return;}
  videoController=ready;film.classList.add('video-ready');finishLoading();
 }catch(error){
  if(generation!==loadGeneration)return;
  clearTimeout(timeoutTimer);clearTimeout(skipTimer);
  $('#loader-status').textContent=text(language,'loaderError');
  $('#loader-retry').hidden=false;$('#loader-skip').hidden=false;
 }
}
$('#loader-retry').addEventListener('click',loadExperience);
$('#loader-skip').addEventListener('click',()=>{loadGeneration++;loadAbort?.abort();finishLoading();});
function updateScroll(){scrollFrame=0;const y=window.scrollY;$('#header').classList.toggle('scrolled',y>30);const max=document.documentElement.scrollHeight-innerHeight;$('#page-progress').style.transform=`scaleX(${Math.max(0,Math.min(1,y/Math.max(1,max)))})`;
 const career=$('#experiencia');const length=career.offsetTop+career.offsetHeight-innerHeight*.75;
 const progress=Math.max(0,Math.min(1,y/Math.max(1,length)));
 videoController?.seek(reduced?0:progress);
}
function onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
addEventListener('pageshow',()=>{videoController?.refresh();onScroll();});
new ResizeObserver(onScroll).observe(document.querySelector('main'));
const chapters=installChapterNavigation({isReady:()=>loaded,isReduced:()=>reduced,onStep:closeMenu});
loadExperience();

let format=new Intl.NumberFormat(language==='pt'?'pt-BR':'en-US');let counts=calculateExperience(),counterStarted=false,counterGeneration=0;
function setCalculationDate(){const dateElement=$('#calculation-date');if(!dateElement)return;dateElement.textContent=new Intl.DateTimeFormat(language==='pt'?'pt-BR':'en-US',{dateStyle:'long',timeZone:'UTC'}).format(new Date(counts.asOf+'T12:00:00Z'));}
setCalculationDate();
function animateNumber(el,target,delay,generation){setTimeout(()=>{
 if(generation!==counterGeneration)return;
 const metric=el.closest('.metric');
 const trail=document.createElement('span');trail.className='metric-echo';trail.setAttribute('aria-hidden','true');trail.dataset.echo=format.format(target)+(el.dataset.count==='days'?'':'+');el.closest('.metric-value').append(trail);
 metric.classList.add('shown','counting');
 if(reduced){el.textContent=format.format(target);metric.classList.remove('counting');metric.classList.add('landed');return;}
 const start=performance.now(),duration=el.dataset.count==='hours'?2300:1600;
 function frame(time){
  if(generation!==counterGeneration)return;
  const t=Math.min(1,(time-start)/duration);
  el.textContent=format.format(Math.round(target*(1-Math.pow(1-t,4))));
  if(t<1)requestAnimationFrame(frame);
  else{metric.classList.remove('counting');metric.classList.add('landed');}
 }
 requestAnimationFrame(frame);
 },reduced?0:delay);}
function startCounts(){counterStarted=true;const generation=++counterGeneration;['years','days','hours'].forEach((key,i)=>animateNumber($(`[data-count="${key}"]`),counts[key],i*620,generation));}
const metricObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)&&!counterStarted)startCounts();},{threshold:.2});
metricObserver.observe($('#metrics'));
sectionMotion=installSectionMotion({isReduced:()=>reduced,text:key=>text(language,key),onChange:()=>layout.refresh(),onEnable:()=>{
 reduced=false;storedMotion='false';try{localStorage.setItem('robson-reduced-motion','false');}catch{}
 applyMotion();
}});
function refreshCounts(){const now=saoPauloDate();if(counts.asOf!==now){counts=calculateExperience(now);setCalculationDate();if(counterStarted){counterGeneration++;$$('.metric').forEach(el=>{el.classList.remove('counting');el.classList.add('shown','landed');});['years','days','hours'].forEach(key=>$(`[data-count="${key}"]`).textContent=format.format(counts[key]));}}}
setInterval(refreshCounts,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshCounts();onScroll();}});

// HTML selection and descriptions stay usable while WebGL initializes, or if unavailable.
const technologyEyebrow=(tech,index)=>`${String(index+1).padStart(2,'0')} / ${String(technologies.length).padStart(2,'0')} · ${tech.area}`;
// Let CSS size this region from ALL descriptions, including before the first
// swipe. These samples are never displayed or announced by screen readers.
const detailSizes=document.createElement('div');
detailSizes.className='tech-detail-sizes';detailSizes.setAttribute('aria-hidden','true');detailSizes.setAttribute('inert','');
function refreshTechnologySamples(){
 detailSizes.replaceChildren();
 technologies.forEach((source,index)=>{const tech=localizedTechnology(source,language);
  const sample=document.createElement('div');sample.className='tech-detail-size';
  const eyebrow=document.createElement('span');eyebrow.className='detail-eyebrow';eyebrow.textContent=technologyEyebrow(tech,index);
  const title=document.createElement('h3');title.textContent=tech.title;
  const description=document.createElement('p');description.textContent=tech.description;
  sample.append(eyebrow,title,description);detailSizes.append(sample);
 });
}
refreshTechnologySamples();
$('#tech-detail').append(detailSizes);layout.refresh();
let selectedIndex=0,describedIndex=null;
function describe(index){
 if(index===describedIndex)return;
 describedIndex=index;
 const tech=localizedTechnology(technologies[index],language);
 $('#detail-title').textContent=tech.title;
 $('#detail-description').textContent=tech.description;
 $('#detail-eyebrow').textContent=technologyEyebrow(tech,index);
}
describe(0);
function selectTechnology(index){selectedIndex=(index+technologies.length)%technologies.length;describe(selectedIndex);cubeController?.select(selectedIndex);if(fallback)renderFallback();}
$('#tech-prev').addEventListener('click',()=>selectTechnology(selectedIndex-1));$('#tech-next').addEventListener('click',()=>selectTechnology(selectedIndex+1));
$('#cube-stage').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();selectTechnology(selectedIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();selectTechnology(selectedIndex+1);}if(e.key==='Home'){e.preventDefault();selectTechnology(0);}if(e.key==='End'){e.preventDefault();selectTechnology(technologies.length-1);}});
let fallback=false;
function renderFallback(){const stage=$('#cube-stage');stage.querySelectorAll('canvas,.stage-status,.fallback-tech').forEach(el=>el.remove());const item=technologies[selectedIndex];const div=document.createElement('div');div.className='fallback-tech';const img=document.createElement('img');img.src=`./assets/icons/${item.id}.svg`;img.alt='';const name=document.createElement('p');name.textContent=item.name;div.append(img,name);stage.append(div);}
let cubesLoading=false;
const cubesObserver=new IntersectionObserver(async entries=>{if(!entries.some(e=>e.isIntersecting)||cubesLoading)return;cubesLoading=true;cubesObserver.disconnect();try{const {createCarousel}=await import('./cubes.js?v=20261014-12');cubeController=await createCarousel($('#cube-stage'),technologies,{reduced,onSelect:index=>{selectedIndex=index;describe(index);},onPreview:index=>describe(index??selectedIndex),onFailure:()=>{fallback=true;renderFallback();}});cubeController.select(selectedIndex);$('#stage-status')?.remove();}catch(error){console.warn('Cena 3D indisponível',error);fallback=true;renderFallback();}},{rootMargin:'800px'});cubesObserver.observe($('#tecnologias'));
applyMotion();onScroll();
applyLanguage();
