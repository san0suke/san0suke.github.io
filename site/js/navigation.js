import {nearestChapterIndex} from './responsive.js?v=20261014-15';
// Long sections get intermediate stops, so chapter navigation never hides content.
export function createStops(sections, viewport, header, maximum) {
  const stops = [0], available = Math.max(120, viewport - header - 30);
  for (const {top, height, freeScroll} of sections) {
    const start = Math.max(0, top);
    const end = Math.min(maximum, Math.max(start, top + height - viewport));
    stops.push(Math.min(maximum, start));
    if (freeScroll) { stops.push(end); continue; }
    const segments = Math.ceil((end - start) / (available * .8));
    for (let part = 1; part <= segments; part++) stops.push(start + (end - start) * part / segments);
  }
  stops.push(Math.max(0, maximum));
  const sorted = [...new Set(stops.map(Math.round))].sort((a, b) => a - b);
  return sorted.reduce((result, value, index) => {
    if (!result.length || value - result.at(-1) > 28 || index === sorted.length - 1) result.push(value);
    return result;
  }, []);
}

export function nextStop(stops, current, direction) {
  return direction > 0 ? (stops.find(stop => stop > current + 30) ?? stops.at(-1))
    : ([...stops].reverse().find(stop => stop < current - 30) ?? 0);
}

// Only the interior of a continuous chapter uses native scrolling. At either
// boundary, the next gesture can enter the adjacent full-screen chapter.
export function usesNativeScroll(sections, position, viewport, direction) {
  return sections.some(({top, height, freeScroll}) => {
    if (!freeScroll) return false;
    const end = Math.max(top, top + height - viewport);
    return direction > 0 ? position >= top - 1 && position < end - 1
      : direction < 0 && position > top + 1 && position <= end + 1;
  });
}

export function navigationAnchor(sections, position, viewport) {
  const index = sections.findIndex(section => section.freeScroll && position >= section.top && position < section.top + section.height);
  if (index < 0) return {index: nearestChapterIndex(sections, position), progress: null};
  const section = sections[index];
  return {index, progress: Math.max(0, Math.min(1, (position - section.top) / Math.max(1, section.height - viewport)))};
}

export function anchorPosition(anchor, sections, viewport) {
  const section = sections[anchor.index];
  return section.top + (anchor.progress ?? 0) * Math.max(0, section.height - viewport);
}

export function installChapterNavigation({isReady, isReduced, onStep = () => {}}) {
  const sections = [...document.querySelectorAll('main > .section')];
  let stops = [], frame = 0, moving = false, destination = 0, resizeFrame = 0;
  let measuredSections = [], resizeAnchor = null, measuredViewport = innerHeight, measuredWidth = innerWidth;
  let wheelSum = 0, lastWheel = 0, direction = 0, gestureUsed = false, touch = null;
  let nativeBoundary = null;
  const headerSize = () => document.querySelector('#header').offsetHeight + 16;
  function measure() {
    measuredSections = sections.map(el => ({top: el.offsetTop, height: el.offsetHeight, freeScroll: el.hasAttribute('data-free-scroll')}));
    stops = createStops(measuredSections,
      innerHeight, headerSize(), Math.max(0, document.documentElement.scrollHeight - innerHeight));
  }
  function cancel() {cancelAnimationFrame(frame); frame = 0; moving = false;}
  function armNativeBoundary(sign) {
    if (sign < 0) {nativeBoundary = null; return;}
    if (nativeBoundary) return;
    const index = measuredSections.findIndex(section => section.freeScroll && scrollY >= section.top - 1 && scrollY < section.top + section.height);
    if (index >= 0) nativeBoundary = sections[index + 1] ?? null;
  }
  const boundaryPosition = () => Math.min(nativeBoundary.offsetTop, document.documentElement.scrollHeight - innerHeight);
  function containNativeScroll() {
    if (!nativeBoundary || !isReady()) return;
    const limit = boundaryPosition();
    if (scrollY < limit) return;
    gestureUsed = true; wheelSum = 0;
    if (touch) touch.used = true;
    // Retain this boundary after touchend: a fast swipe can keep scrolling
    // long after release. Only a fresh gesture may leave the next chapter.
    if (scrollY > limit) window.scrollTo(0, limit);
  }
  function goTo(value, {focus = null} = {}) {
    nativeBoundary = null;
    cancel();
    destination = Math.min(Math.max(0, value), document.documentElement.scrollHeight - innerHeight);
    const from = scrollY, distance = destination - from;
    onStep();
    if (isReduced() || Math.abs(distance) < 2) {window.scrollTo(0, destination); focus?.focus({preventScroll: true}); return;}
    moving = true;
    const start = performance.now(), duration = Math.min(1350, 880 + Math.abs(distance) * .1);
    function animate(time) {
      const t = Math.min(1, (time - start) / duration);
      const eased = t < .5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, from + distance * eased);
      if (t < 1) frame = requestAnimationFrame(animate);
      else {frame = 0; moving = false; focus?.focus({preventScroll: true});}
    }
    frame = requestAnimationFrame(animate);
  }
  function step(sign) {measure(); goTo(nextStop(stops, moving ? destination : scrollY, sign));}
  function interactive(target) {
    return !!document.querySelector('dialog[open]') || (target instanceof Element && !!target.closest('input,textarea,select,[contenteditable],.navigation.open,dialog,[role="dialog"]'));
  }
  function nestedScroll(target, sign) {
    for (let el = target instanceof Element ? target : null; el && el !== document.body; el = el.parentElement) {
      if (/auto|scroll/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1) {
        if (sign > 0 ? el.scrollTop < el.scrollHeight - el.clientHeight - 1 : el.scrollTop > 1) return true;
      }
    }
    return false;
  }
  function wheel(event) {
    if (event.defaultPrevented || !isReady() || event.ctrlKey || event.metaKey || interactive(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const sign = Math.sign(event.deltaY);
    if (!sign || nestedScroll(event.target, sign)) return;
    const now = performance.now();
    if (now - lastWheel > 210 || sign !== direction) {wheelSum = 0; gestureUsed = false; nativeBoundary = null;}
    lastWheel = now; direction = sign;
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    const native = !moving && usesNativeScroll(measuredSections, scrollY, innerHeight, sign);
    if (native) armNativeBoundary(sign);
    if (nativeBoundary && sign > 0 && scrollY + delta >= boundaryPosition()) {
      event.preventDefault(); gestureUsed = true; wheelSum = 0;
      if (!moving) {
        const boundary = nativeBoundary, limit = boundaryPosition();
        if (scrollY < limit) goTo(limit);
        nativeBoundary = boundary;
        containNativeScroll();
      }
      return;
    }
    if (native) {
      wheelSum = 0; gestureUsed = false;
      return;
    }
    event.preventDefault();
    // Momentum from one trackpad gesture cannot skip several chapters.
    if (moving) {gestureUsed = true; return;}
    if (gestureUsed) return;
    wheelSum += Math.abs(event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (wheelSum >= 26) {gestureUsed = true; wheelSum = 0; step(sign);}
  }
  function key(event) {
    if (!isReady() || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || interactive(event.target)) return;
    if (event.target.closest?.('button,a,summary,#cube-stage')) return;
    const sign = ['ArrowDown','PageDown',' '].includes(event.key) ? (event.shiftKey ? -1 : 1) : ['ArrowUp','PageUp'].includes(event.key) ? -1 : 0;
    if (sign) {
      nativeBoundary = null;
      if (!moving && usesNativeScroll(measuredSections, scrollY, innerHeight, sign)) return;
      event.preventDefault(); if (!moving && !event.repeat) step(sign);
    }
    if (event.key === 'Home' || event.key === 'End') {event.preventDefault();measure();goTo(event.key === 'Home' ? 0 : stops.at(-1));}
    if (event.key === 'Escape') cancel();
  }
  function startTouch(event) {
    nativeBoundary = null;
    if (event.touches.length !== 1 || interactive(event.target)) {touch = null; return;}
    touch = {x:event.touches[0].clientX, y:event.touches[0].clientY, used:false, axis:null, native:false};
  }
  function moveTouch(event) {
    if (!touch || !isReady() || event.touches.length !== 1 || interactive(event.target)) return;
    const dx = event.touches[0].clientX - touch.x, dy = event.touches[0].clientY - touch.y;
    if (!touch.axis && Math.max(Math.abs(dx),Math.abs(dy)) >= 8) touch.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (touch.axis === 'x' || Math.abs(dy) < 8 || nestedScroll(event.target, -Math.sign(dy))) return;
    // Keep the timeline native, but cap this swipe and its momentum at the
    // following chapter instead of letting it run through the whole page.
    if (!touch.used && !moving && usesNativeScroll(measuredSections, scrollY, innerHeight, -Math.sign(dy))) {
      touch.native = true; armNativeBoundary(-Math.sign(dy));
    }
    if (touch.native) {
      containNativeScroll();
      if (nativeBoundary && dy < 0 && scrollY >= boundaryPosition()) event.preventDefault();
      return;
    }
    event.preventDefault();
    if (Math.abs(dy) > 42 && !touch.used) {touch.used = true; if (!moving) step(dy < 0 ? 1 : -1);}
  }
  document.addEventListener('wheel', wheel, {passive:false});
  document.addEventListener('keydown', key);
  document.addEventListener('touchstart', startTouch, {passive:true});
  document.addEventListener('touchmove', moveTouch, {passive:false});
  document.addEventListener('touchend', () => {touch = null;}, {passive:true});
  document.addEventListener('touchcancel', () => {touch = null;}, {passive:true});
  addEventListener('scroll', containNativeScroll, {passive:true});
  document.addEventListener('pointerdown', event => {if (event.pointerType === 'mouse') nativeBoundary = null;}, {passive:true});
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || !isReady() || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();measure();
    target.setAttribute('tabindex','-1');
    history.replaceState(null,'',link.hash);
    goTo(target.id === 'inicio' ? 0 : target.offsetTop, {focus:target});
  });
  document.addEventListener('toggle', measure, true);
  const observer = new ResizeObserver(measure); sections.forEach(el => observer.observe(el));
  addEventListener('resize', () => {
    if (!resizeAnchor) {
      resizeAnchor = navigationAnchor(measuredSections, moving ? destination : scrollY, measuredViewport);
      // Mobile browser chrome can resize the viewport during an ordinary swipe.
      // Preserve its exact position; use the chapter fraction on actual rotation.
      if (resizeAnchor.progress !== null && innerWidth === measuredWidth) resizeAnchor.absolute = scrollY;
    }
    cancel(); cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      measure();
      if (isReady() && !document.querySelector('dialog[open]')) window.scrollTo(0, resizeAnchor.absolute ?? anchorPosition(resizeAnchor, measuredSections, innerHeight));
      containNativeScroll();
      measuredViewport = innerHeight; measuredWidth = innerWidth;
      resizeAnchor = null;
    });
  });
  document.addEventListener('chapterlayoutchange', measure);
  addEventListener('pageshow', () => {nativeBoundary = null;cancel();measure();});
  document.documentElement.classList.add('chapter-navigation');
  measure();
  return {refresh:measure, cancel};
}
