import test from 'node:test';
import assert from 'node:assert/strict';
import {installSectionMotion,orientationOffset} from '../_site/js/motion.js';

async function fixture({mobile=true,sensor={},reduced=false}={},check) {
 const names=['document','navigator','DeviceOrientationEvent','screen','window','innerWidth','innerHeight','IntersectionObserver','addEventListener','requestAnimationFrame','cancelAnimationFrame'];
 const saved=Object.fromEntries(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const handlers={},listeners={},frames=new Map(),layers=[];let nextFrame=0,notify,enableCount=0;
 const sections=['inicio','sobre','experiencia','numeros','tecnologias','projetos','contato'].map(id=>({id}));
 const label={textContent:''},button={hidden:true,disabled:false,attrs:{},querySelector:()=>label,setAttribute(key,value){this.attrs[key]=value;},addEventListener(name,fn){this[name]=fn;}};
 const style=()=>({transform:'reveal-animation',removeProperty(key){delete this[key];}});
 const cubes={style:style(),section:sections[4]};
 const doc={hidden:false,querySelector:()=>button,querySelectorAll(selector){
  if(selector.startsWith('main >'))return sections.filter(section=>section.id!=='tecnologias');
  const id=selector.startsWith('#metric-')?'numeros':selector.match(/^#([\w-]+)/)[1];
  const section=sections.find(item=>item.id===id);
  const layer={style:style(),closest:()=>section};layers.push(layer);return [layer];
 },addEventListener(name,fn){handlers[name]=fn;}};
 const globals={document:doc,navigator:{userAgent:mobile?'Android':'Windows',maxTouchPoints:mobile?5:0},DeviceOrientationEvent:sensor,
 screen:{orientation:{angle:0}},window:{orientation:0},innerWidth:1200,innerHeight:800,
 IntersectionObserver:class{constructor(fn){notify=fn;}observe(){}},
 addEventListener(name,fn){(listeners[name]??=[]).push(fn);},
 requestAnimationFrame(fn){frames.set(++nextFrame,fn);return nextFrame;},cancelAnimationFrame(id){frames.delete(id);}};
 function flush(){let time=0;for(let i=0;frames.size&&i<300;i++){time+=16;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));}assert.equal(frames.size,0);}
 try{
  for(const [name,value] of Object.entries(globals))Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  const controller=installSectionMotion({isReduced:()=>reduced,onEnable(){reduced=false;enableCount++;},text:key=>key});
  notify(sections.filter(s=>s.id!=='tecnologias').map(target=>({target,isIntersecting:true})));
  await check({button,label,layers,cubes,listeners,handlers,flush,controller,enableCount:()=>enableCount,setReduced(value){reduced=value;controller.refresh();}});
 }finally{for(const name of names){if(saved[name])Object.defineProperty(globalThis,name,saved[name]);else delete globalThis[name];}}
}

test('desktop has automatic mouse parallax on every requested section and no activation button',async()=>{
 await fixture({mobile:false},async({button,layers,cubes,handlers,flush})=>{
  assert.equal(button.hidden,true);
  handlers.pointermove({pointerType:'mouse',clientX:1200,clientY:800});flush();
  assert.deepEqual([...new Set(layers.map(layer=>layer.closest().id))],['inicio','sobre','experiencia','numeros','projetos','contato']);
  assert.ok(layers.every(layer=>layer.style.translate&&!layer.style.translate.startsWith('0.000px')));
  assert.ok(layers.every(layer=>layer.style.transform==='reveal-animation'),'entrance animations remain intact');
  assert.equal(cubes.style.translate,undefined);
 });
});

test('Android starts sensors from the initial button, once, and confirms activation',async()=>{
 await fixture({},async({button,label,listeners,layers,flush,enableCount})=>{
  assert.equal(button.hidden,false);assert.equal(listeners.deviceorientation,undefined);
  await button.click();await button.click();
  assert.equal(listeners.deviceorientation.length,1);assert.equal(enableCount(),1);
  assert.equal(button.disabled,true);assert.equal(label.textContent,'motionEnabled');
  listeners.deviceorientation[0]({beta:40,gamma:0});
  listeners.deviceorientation[0]({beta:51,gamma:9});flush();
  assert.ok(layers.every(layer=>layer.style.translate&&!layer.style.translate.startsWith('0.000px')));
 });
});

test('iOS permission rejection is retryable without removing the label or icon',async()=>{
 let grants=false,calls=0;
 await fixture({sensor:{requestPermission:async()=>{calls++;return grants?'granted':'denied';}}},async({button,label,listeners})=>{
  await button.click();assert.equal(label.textContent,'motionDenied');assert.equal(button.disabled,false);
  assert.equal(listeners.deviceorientation,undefined);
  grants=true;await button.click();assert.equal(calls,2);assert.equal(label.textContent,'motionEnabled');
  assert.equal(button.attrs['aria-pressed'],'true');
 });
});

test('reduced motion clears all parallax and explicit activation can enable it again',async()=>{
 await fixture({},async({button,listeners,layers,flush,setReduced})=>{
  await button.click();listeners.deviceorientation[0]({beta:40,gamma:0});listeners.deviceorientation[0]({beta:55,gamma:10});flush();
  setReduced(true);assert.ok(layers.every(layer=>layer.style.translate===undefined));
  assert.equal(button.disabled,false);await button.click();assert.equal(button.disabled,true);
  assert.equal(listeners.deviceorientation.length,1);
 });
});

test('phones without the orientation API do not show a nonfunctional action',async()=>{
 await fixture({sensor:null},async({button})=>{assert.equal(button.hidden,true);});
});

test('orientation is calibrated, bounded and follows portrait and landscape axes',()=>{
 const base={beta:40,gamma:0},sample={beta:51,gamma:9};
 assert.deepEqual(orientationOffset(base,base),{x:0,y:0});
 assert.deepEqual(orientationOffset(sample,base,90),{x:.5,y:-.5});
 assert.deepEqual(orientationOffset(sample,base,-90),{x:-.5,y:.5});
 assert.deepEqual(orientationOffset({beta:400,gamma:400},base),{x:1,y:1});
});
