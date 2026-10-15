import test from 'node:test';
import assert from 'node:assert/strict';
import {installChapterNavigation} from '../_site/js/navigation.js';

function navigationFixture(viewport, reduced, check) {
  const names = ['document','window','Element','ResizeObserver','addEventListener','requestAnimationFrame','cancelAnimationFrame','getComputedStyle','innerWidth','innerHeight','scrollY','performance'];
  const saved = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const handlers = {}, windowHandlers = {}, frames = new Map();
  let clock = 1000, id = 0;
  class Element {closest(){return null;}}
  const body = new Element(), target = new Element(); target.parentElement = body;
  const sections = [0,1,2,7,8,9].map((part,index) => ({
    offsetTop:part*viewport, offsetHeight:(index===2?5:1)*viewport,
    hasAttribute:()=>index===2
  }));
  const values = {
    Element, innerWidth:1200, innerHeight:viewport, scrollY:3*viewport,
    performance:{now:()=>clock},
    document:{body, documentElement:{scrollHeight:10*viewport,classList:{add(){}}},
      querySelectorAll:()=>sections, querySelector:selector=>selector==='#header'?{offsetHeight:80}:null,
      addEventListener:(name,fn)=>handlers[name]=fn},
    window:{scrollTo:(x,y)=>{globalThis.scrollY=y;}},
    addEventListener:(name,fn)=>windowHandlers[name]=fn,
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;}, cancelAnimationFrame:id=>frames.delete(id),
    getComputedStyle:()=>({overflowY:'visible'}), ResizeObserver:class{observe(){}}
  };
  const event = props => ({target, defaultPrevented:false, preventDefault(){this.defaultPrevented=true;}, ...props});
  const browserScroll = y => {globalThis.scrollY=y; windowHandlers.scroll?.();};
  const paint = () => {
    const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(clock));
  };
  const finishAnimation = () => {
    for(let tick=0;frames.size&&tick<100;tick++){clock+=16;paint();}
    assert.equal(frames.size,0,'chapter animation finishes');
  };
  const wheel = (deltaY,gap=16,deltaMode=0) => {
    clock+=gap;
    const input=event({deltaY,deltaMode,deltaX:0});handlers.wheel(input);
    if(!input.defaultPrevented) browserScroll(scrollY+deltaY*(deltaMode===1?16:deltaMode===2?viewport:1));
    paint();
    return input;
  };
  const touchStart = () => handlers.touchstart(event({touches:[{clientX:100,clientY:300}]}));
  const touchMove = () => {const input=event({touches:[{clientX:100,clientY:150}]});handlers.touchmove(input);return input;};
  try {
    for(const [name,value] of Object.entries(values))Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
    installChapterNavigation({isReady:()=>true,isReduced:()=>reduced});
    check({handlers,event,browserScroll,finishAnimation,wheel,touchStart,touchMove,sections});
  } finally {
    for(const name of names){if(saved[name])Object.defineProperty(globalThis,name,saved[name]);else delete globalThis[name];}
  }
}

for(const viewport of [390,844,900]) for(const reduced of [false,true]) {
  test(`fast wheel stops at numbers and consumes trailing events (${viewport}px, reduced=${reduced})`,()=>{
    navigationFixture(viewport,reduced,({wheel,finishAnimation})=>{
      assert.equal(wheel(70).defaultPrevented,false,'normal timeline scrolling stays native');
      const burst=wheel(20000);
      assert.equal(burst.defaultPrevented,true,'cancel native movement before it skips chapters');
      // Momentum keeps arriving during the chapter animation.
      for(let i=0;i<80;i++) assert.equal(wheel(100).defaultPrevented,true);
      finishAnimation();
      assert.equal(scrollY,7*viewport,'land at section 03, never at the footer');
      for(let i=0;i<20;i++) assert.equal(wheel(80).defaultPrevented,true);
      assert.equal(scrollY,7*viewport,'the same gesture cannot enter technologies');
      wheel(100,250);finishAnimation();
      assert.equal(scrollY,8*viewport,'a new gesture can advance normally');
    });
  });
  test(`touch fling remains bounded after finger release (${viewport}px, reduced=${reduced})`,()=>{
    navigationFixture(viewport,reduced,({handlers,browserScroll,touchStart,touchMove,finishAnimation})=>{
      touchStart();assert.equal(touchMove().defaultPrevented,false);
      browserScroll(4*viewport);assert.equal(scrollY,4*viewport);
      handlers.touchend();
      browserScroll(9*viewport);assert.equal(scrollY,7*viewport);
      for(let i=0;i<8;i++){browserScroll(scrollY+400);assert.equal(scrollY,7*viewport);}
      touchStart();assert.equal(touchMove().defaultPrevented,true);
      finishAnimation();assert.equal(scrollY,8*viewport,'a fresh swipe advances from section 03');
    });
  });
}

test('a single huge wheel event is bounded in pixel, line and page units',()=>{
  for(const mode of [0,1,2]) navigationFixture(800,true,({wheel})=>{
    assert.equal(wheel(20000,16,mode).defaultPrevented,true);
    assert.equal(scrollY,5600);
  });
});

test('the limit follows a mobile viewport layout change during momentum',()=>{
  navigationFixture(800,true,({handlers,browserScroll,touchStart,touchMove,sections})=>{
    touchStart();touchMove();handlers.touchend();
    sections[3].offsetTop=5200;
    browserScroll(7200);assert.equal(scrollY,5200);
  });
});

test('intentional End navigation is still available after stopping a fling',()=>{
  navigationFixture(800,true,({handlers,event,browserScroll,touchStart,touchMove})=>{
    touchStart();touchMove();handlers.touchend();browserScroll(7200);
    assert.equal(scrollY,5600);
    handlers.keydown(event({key:'End'}));
    assert.equal(scrollY,7200);browserScroll(scrollY);assert.equal(scrollY,7200);
  });
});
