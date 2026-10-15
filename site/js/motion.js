import {isMobileDevice} from './device.js';

const clamp = value => Math.max(-1, Math.min(1, value));
export function orientationOffset(sample, baseline, angle = 0) {
  const x = (sample.gamma - baseline.gamma) / 18;
  const y = (sample.beta - baseline.beta) / 22;
  const rotation = ((angle % 360) + 360) % 360;
  return rotation === 90 ? {x:clamp(y), y:clamp(-x)}
    : rotation === 270 ? {x:clamp(-y), y:clamp(x)}
    : rotation === 180 ? {x:clamp(-x), y:clamp(-y)} : {x:clamp(x), y:clamp(y)};
}

// Move content layers, not the sections themselves: scroll stops and the fixed
// header stay stable. The complete technology section is deliberately excluded.
const layerDefinitions = [
  ['#inicio .hero-copy',9], ['#inicio .hero-bottom',-3],
  ['#sobre .about-copy',10], ['#sobre .about-caption',-5],
  ['#experiencia .career-intro',8], ['#experiencia .journey',5],
  ['#numeros .numbers-heading',5], ['#numeros .metrics-world',-19],
  ['#metric-years',7,true], ['#metric-days',7,true], ['#metric-hours',13,true],
  ['#projetos > .reveal:not(.project-links)',8], ['#projetos .project-links',12],
  ['#contato > .reveal',10], ['#contato .contact-signature',-8]
];

export function installSectionMotion({isReduced, onEnable, text, onChange = () => {}}) {
  const button = document.querySelector('#motion-permission');
  const label = button.querySelector('[data-motion-label]');
  const sensor = globalThis.DeviceOrientationEvent;
  const canUseSensors = isMobileDevice(navigator) && !!sensor;
  const sections = [...document.querySelectorAll('main > .section:not(#tecnologias)')];
  const visible = new Set();
  const layers = layerDefinitions.flatMap(([selector,depth,tilt]) =>
    [...document.querySelectorAll(selector)].map(element => ({element,depth,tilt,section:element.closest('.section')})))
    .filter(layer => layer.section && layer.section.id !== 'tecnologias');
  let enabled = false, pending = false, status = null, baseline = null;
  let frame = 0, lastTime = 0, x = 0, y = 0, targetX = 0, targetY = 0;

  function clearLayer({element}) {element.style.removeProperty('translate');element.style.removeProperty('rotate');}
  function reset() {
    cancelAnimationFrame(frame);frame=0;lastTime=0;x=y=targetX=targetY=0;
    layers.forEach(clearLayer);
  }
  function refreshLabel() {
    const active = enabled && !isReduced();
    button.hidden = !canUseSensors;
    button.disabled = pending || active;
    button.setAttribute('aria-pressed',String(active));
    label.textContent = text(pending?'motionRequesting':active?'motionEnabled':status??'motionPermission');
    onChange();
  }
  function start() {if(!frame&&!isReduced()&&!document.hidden&&visible.size)frame=requestAnimationFrame(animate);}
  function animate(time) {
    frame=0;
    if(isReduced()||document.hidden||!visible.size){reset();return;}
    const dt=lastTime?Math.min(40,time-lastTime):16;lastTime=time;
    const easing=1-Math.exp(-dt/160);
    x+=(targetX-x)*easing;y+=(targetY-y)*easing;
    for(const layer of layers){
      if(!visible.has(layer.section)){clearLayer(layer);continue;}
      // Individual transforms compose with reveal/hover animations instead of
      // overwriting their transform property.
      layer.element.style.translate=`${(x*layer.depth).toFixed(3)}px ${(y*layer.depth*.8).toFixed(3)}px`;
      if(layer.tilt){
        const magnitude=Math.hypot(x,y);
        layer.element.style.rotate=magnitude<.001?'none':`${-y} ${x} 0 ${magnitude*2.5}deg`;
      }
    }
    if(Math.abs(targetX-x)+Math.abs(targetY-y)>.002)start();else lastTime=0;
  }
  const observer = new IntersectionObserver(entries=>{
    for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);}
    if(visible.size)start();else reset();
  },{threshold:0});
  sections.forEach(section=>observer.observe(section));
  document.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||isReduced())return;
    targetX=clamp(event.clientX/innerWidth*2-1);targetY=clamp(event.clientY/innerHeight*2-1);start();
  },{passive:true});
  document.addEventListener('pointerleave',()=>{targetX=targetY=0;start();});
  function orientation(event) {
    if(!enabled||isReduced()||document.hidden||!Number.isFinite(event.beta)||!Number.isFinite(event.gamma))return;
    if(!baseline)baseline={beta:event.beta,gamma:event.gamma};
    const position=orientationOffset(event,baseline,screen.orientation?.angle??window.orientation??0);
    targetX=position.x;targetY=position.y;start();
  }
  button.addEventListener('click',async()=>{
    if(!canUseSensors||pending||(enabled&&!isReduced()))return;
    pending=true;status=null;refreshLabel();
    try{
      if(!enabled&&typeof sensor.requestPermission==='function'){
        if(await sensor.requestPermission()!=='granted'){status='motionDenied';return;}
      }
      if(!enabled)addEventListener('deviceorientation',orientation,{passive:true});
      enabled=true;baseline=null;reset();onEnable();
    }catch{status='motionUnavailable';}
    finally{pending=false;refreshLabel();}
  });
  addEventListener('orientationchange',()=>{baseline=null;reset();});
  document.addEventListener('visibilitychange',()=>{baseline=null;reset();});
  refreshLabel();
  return {refreshLabel,refresh(){baseline=null;if(isReduced())reset();else start();refreshLabel();}};
}
