/* ==========================================================
   LA SANTA PHOBIA — main.js (IIFE, no modules)
   ========================================================== */
(function () {
  'use strict';
  var BRAND = window.__BRAND__ = { name: 'La Santa Phobia' };
  var isFine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var html = document.documentElement;
  document.body.classList.add('is-loading');

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn('[' + name + '] failed:', e); }
  }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- Splash ---------- */
  function initSplash() {
    var splash = $('#splash');
    var done = false;
    function hide() {
      if (done) return; done = true;
      document.body.classList.remove('is-loading');
      if (splash) splash.classList.add('is-done');
    }
    if (document.readyState === 'complete') setTimeout(hide, 700);
    else window.addEventListener('load', function () { setTimeout(hide, 500); });
    setTimeout(hide, 2600);
  }

  /* ---------- Split words ---------- */
  function initSplit() {
    $$('[data-split]').forEach(function (el) {
      if (el.querySelector('.split-word')) return;
      var nodes = Array.prototype.slice.call(el.childNodes);
      el.innerHTML = '';
      var i = 0;
      nodes.forEach(function (n) {
        var isEm = n.nodeType === 1;
        var text = n.textContent;
        text.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(' ')); return; }
          var outer = document.createElement('span'); outer.className = 'split-word';
          var inner = document.createElement(isEm ? 'em' : 'span');
          inner.textContent = w;
          inner.style.transitionDelay = (i++ * 0.045) + 's';
          if (isEm) inner.style.display = 'inline-block';
          outer.appendChild(inner); el.appendChild(outer);
        });
      });
    });
  }

  /* ---------- Reveal ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); countUp(en.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e, i) {
      if (!e.hasAttribute('data-split')) e.style.transitionDelay = ((i % 4) * 0.08) + 's';
      io.observe(e);
    });
    setTimeout(function () { els.forEach(function (e) { e.classList.add('is-in'); }); }, 6000);
  }

  function countUp(root) {
    $$('[data-count]', root).concat(root.hasAttribute && root.hasAttribute('data-count') ? [root] : []).forEach(function (el) {
      if (el.dataset.done) return; el.dataset.done = 1;
      var end = +el.dataset.count, suf = el.dataset.suffix || '', start = end > 1000 ? end - 40 : 0, t0 = null;
      function step(t) {
        if (!t0) t0 = t; var p = Math.min((t - t0) / 1600, 1); p = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(lerp(start, end, p)) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Nav, progress, fab ---------- */
  function initNav() {
    var nav = $('#nav'), bar = $('#progressBar'), fab = $('.fab'), last = 0, ticking = false;
    function onScroll() {
      var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > last && y > 400 && !$('#menu').classList.contains('is-open'));
      if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
      if (fab) fab.classList.toggle('is-visible', y > window.innerHeight * 0.9);
      last = y; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    var burger = $('#burger'), menu = $('#menu');
    function setMenu(open) {
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!isFine) return;
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * 0.25 + 'px,' + dy * 0.35 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 3D tilt ---------- */
  function initTilt() {
    if (!isFine) return;
    $$('.tilt').forEach(function (el) {
      var glare = el.querySelector('.glare');
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.transition = 'transform .12s linear';
        el.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - py) * 12) + 'deg) rotateY(' + ((px - 0.5) * 14) + 'deg) scale(1.02)';
        if (glare) { glare.style.setProperty('--gx', px * 100 + '%'); glare.style.setProperty('--gy', py * 100 + '%'); }
      });
      el.addEventListener('mouseleave', function () { el.style.transition = ''; el.style.transform = ''; });
    });
  }

  /* ---------- Celebrity coverflow ---------- */
  function initCoverflow() {
    var root = $('#cf'), stage = $('#cfStage');
    if (!root || !stage) return;
    var items = $$('.cf__item', stage), n = items.length;
    if (!n) return;
    var dotsWrap = $('.cf__dots', root);
    var pos = 0, target = 0, spacing = 200, active = -1, rendered = null;
    var drag = false, moved = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, vx = 0, downItem = null;
    var hover = false, visible = true;

    function mod(a) { return ((a % n) + n) % n; }
    function wrap(d) { d = mod(d + n / 2) - n / 2; return d; }

    // Dots
    if (dotsWrap && !dotsWrap.children.length) {
      items.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Foto ' + (i + 1));
        b.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(b);
      });
    }
    var dots = dotsWrap ? $$('button', dotsWrap) : [];

    function goTo(i) { target += wrap(i - mod(Math.round(target))); }
    function step(dir) { target = Math.round(target) + dir; }

    function measure() {
      var w = items[0].offsetWidth;
      spacing = w * (innerWidth < 560 ? 0.62 : 0.86);
      rendered = null;
    }

    function render() {
      if (rendered !== null && Math.abs(rendered - pos) < 0.0005) return;
      rendered = pos;
      for (var i = 0; i < n; i++) {
        var d = wrap(i - pos), ad = Math.abs(d), sg = d < 0 ? -1 : 1;
        var tx = sg * (Math.min(ad, 1) * spacing + Math.max(ad - 1, 0) * spacing * 0.55);
        var tz = -Math.min(ad, 3) * 170;
        var ry = -Math.max(-1, Math.min(1, d)) * 32;
        var sc = 1 - Math.min(ad, 3) * 0.05;
        var op = ad <= 2.2 ? 1 : Math.max(0, 1 - (ad - 2.2) / 0.8);
        var el = items[i];
        el.style.transform = 'translate(-50%,-50%) translate3d(' + tx.toFixed(1) + 'px,0,' + tz.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        el.style.opacity = op.toFixed(3);
        el.style.zIndex = String(100 - Math.round(ad * 10));
        el.style.filter = 'brightness(' + (1 - Math.min(ad, 2.5) * 0.2).toFixed(3) + ')';
        el.style.pointerEvents = op < 0.05 ? 'none' : '';
        el.setAttribute('aria-hidden', ad > 0.5 ? 'true' : 'false');
      }
      var a = mod(Math.round(pos));
      if (a !== active) {
        active = a;
        items.forEach(function (el, i) { el.classList.toggle('is-active', i === a); });
        dots.forEach(function (b, i) { b.classList.toggle('is-active', i === a); b.setAttribute('aria-selected', i === a); });
      }
    }

    // Drag / swipe (pointer events, capture on stage)
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      drag = true; moved = false; startX = lastX = e.clientX; lastT = performance.now(); vx = 0;
      startPos = pos; downItem = e.target.closest ? e.target.closest('.cf__item') : null;
      stage.classList.add('is-drag');
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - startX, now = performance.now();
      if (Math.abs(dx) > 6) moved = true;
      vx = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX; lastT = now;
      pos = target = startPos - dx / spacing;
    });
    function endDrag() {
      if (!drag) return;
      drag = false; stage.classList.remove('is-drag');
      if (moved) {
        target = Math.round(pos - Math.max(-1.5, Math.min(1.5, vx * 220 / spacing)));
      } else if (downItem) {
        var i = items.indexOf(downItem);
        if (i > -1) goTo(i);
      } else {
        target = Math.round(target);
      }
      downItem = null;
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('lostpointercapture', endDrag);

    $$('.cf__btn', root).forEach(function (b) {
      b.addEventListener('click', function () { step(+b.getAttribute('data-dir')); });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    });
    root.addEventListener('mouseenter', function () { hover = true; });
    root.addEventListener('mouseleave', function () { hover = false; });
    root.addEventListener('focusin', function () { hover = true; });
    root.addEventListener('focusout', function () { hover = false; });

    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(root);
    setInterval(function () {
      if (!hover && !drag && visible && !document.hidden) step(1);
    }, 3600);

    window.addEventListener('resize', measure);
    measure(); render();
    (function loop() {
      if (visible && !drag) {
        var diff = target - pos;
        pos = Math.abs(diff) < 0.0005 ? target : pos + diff * 0.09;
      }
      if (visible) render();
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- GSAP scroll scenes ---------- */
  function initScroll() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero content drifts away
    gsap.to('.hero__content', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.about__img--a img', { yPercent: -10, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.about', scrub: true } });
    gsap.fromTo('.about__img--b', { yPercent: 20 }, { yPercent: -15, ease: 'none', scrollTrigger: { trigger: '.about', scrub: true } });
    gsap.fromTo('.about__seal', { rotate: -40 }, { rotate: 20, ease: 'none', scrollTrigger: { trigger: '.about', scrub: true } });
    gsap.fromTo('.footer__big', { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    // Horizontal gallery (desktop only)
    ScrollTrigger.matchMedia({
      '(min-width: 821px)': function () {
        var track = $('#galleryTrack'), pin = $('.gallery__pin');
        var dist = function () { return Math.max(0, pin.scrollWidth - window.innerWidth); };
        var tween = gsap.to(['.gallery__intro', track], {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: '.gallery', pin: '.gallery__pin', start: 'top top', end: function () { return '+=' + dist(); }, scrub: 0.6, invalidateOnRefresh: true }
        });
        $$('.g-item').forEach(function (it) {
          gsap.fromTo(it, { rotateY: -28, z: -120 }, {
            rotateY: 18, z: 0, ease: 'none',
            scrollTrigger: { trigger: it, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
          });
          gsap.fromTo(it.querySelector('img'), { xPercent: -8 }, {
            xPercent: 8, ease: 'none',
            scrollTrigger: { trigger: it, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
          });
        });
      }
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- Three.js — floating 3D nails ---------- */
  function initNails() {
    var canvas = $('#nails3d');
    if (!canvas || !window.THREE) return;
    var T = window.THREE;
    var renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    // Procedural studio environment for chrome reflections
    var pmrem = new T.PMREMGenerator(renderer);
    var env = new T.Scene();
    env.add(new T.Mesh(new T.SphereGeometry(20, 32, 16), new T.MeshBasicMaterial({ color: 0x120609, side: T.BackSide })));
    function box(color, w, h, x, y, z) {
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: color, side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    }
    box(0xffffff, 10, 4, 0, 9, 4);
    box(0xffd6e0, 4, 10, -10, 0, 4);
    box(0xff1d5c, 5, 12, 10, -1, 2);
    box(0xffe6a8, 8, 2, 0, -8, 6);
    box(0xffffff, 3, 3, 4, 3, 10);
    scene.environment = pmrem.fromScene(env, 0.035).texture;

    scene.add(new T.AmbientLight(0xffffff, 0.25));
    var key = new T.DirectionalLight(0xffffff, 1.2); key.position.set(3, 5, 6); scene.add(key);
    var rim = new T.PointLight(0xff2d6f, 2.2, 20); rim.position.set(-4, -2, 3); scene.add(rim);

    // Nail geometry: closed domed surface with parametric outline
    function nailGeometry(W, L, taper, curve) {
      var NU = 28, NV = 56, pos = [], uv = [], idx = [];
      function hw(v) {
        var b = 0.12;
        if (v < b) return W * Math.sqrt(Math.max(0, 1 - Math.pow((b - v) / b, 2)));
        var t = (v - b) / (1 - b);
        return W * Math.pow(Math.max(0, Math.cos(t * Math.PI / 2)), taper);
      }
      for (var side = 0; side < 2; side++) {
        for (var j = 0; j <= NV; j++) {
          var v = j / NV, h = hw(v);
          for (var i = 0; i <= NU; i++) {
            var u = i / NU * 2 - 1, s = Math.sqrt(Math.max(0, 1 - u * u));
            var th = 0.05 * (h / W) * s;
            var z = curve * h * s - 0.18 * Math.pow(v - 0.35, 2);
            pos.push(u * h, v * L - L * 0.45, side === 0 ? z + th : z - th);
            uv.push((u + 1) / 2, v);
          }
        }
      }
      var row = NU + 1, off = row * (NV + 1);
      for (var sd = 0; sd < 2; sd++) {
        for (var jj = 0; jj < NV; jj++) for (var ii = 0; ii < NU; ii++) {
          var a = sd * off + jj * row + ii, b2 = a + 1, c = a + row, d = c + 1;
          if (sd === 0) idx.push(a, b2, d, a, d, c); else idx.push(a, d, b2, a, c, d);
        }
      }
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    }

    function canvasTex(draw) {
      var c = document.createElement('canvas'); c.width = 256; c.height = 512;
      var x = c.getContext('2d'); draw(x, 256, 512);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
    }
    var frenchTex = canvasTex(function (x, w, h) {
      x.fillStyle = '#f3c7cf'; x.fillRect(0, 0, w, h);
      var g = x.createLinearGradient(0, h * 0.62, 0, h * 0.7); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, '#ffffff');
      x.fillStyle = g; x.fillRect(0, h * 0.62, w, h);
    });
    var goldTex = canvasTex(function (x, w, h) {
      x.fillStyle = '#0d0a0b'; x.fillRect(0, 0, w, h);
      for (var i = 0; i < 260; i++) {
        var yy = Math.pow(Math.random(), 0.6) * h;
        x.fillStyle = 'rgba(233,209,138,' + (0.4 + Math.random() * 0.6) + ')';
        x.beginPath(); x.arc(Math.random() * w, yy, Math.random() * 3 + 0.5, 0, 7); x.fill();
      }
    });
    var heartTex = canvasTex(function (x, w, h) {
      x.fillStyle = '#c3093e'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#ffffff'; x.font = '900 70px serif'; x.textAlign = 'center';
      x.fillText('♥', w / 2, h * 0.5); x.font = '900 34px serif'; x.fillText('✦', w * 0.3, h * 0.72); x.fillText('✦', w * 0.7, h * 0.32);
    });

    var mats = [
      new T.MeshPhysicalMaterial({ color: 0xf6dbe2, metalness: 1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6 }),
      new T.MeshPhysicalMaterial({ map: heartTex, metalness: 0.1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.2 }),
      new T.MeshPhysicalMaterial({ map: frenchTex, metalness: 0, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1 }),
      new T.MeshPhysicalMaterial({ map: goldTex, metalness: 0.4, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.3 }),
      new T.MeshPhysicalMaterial({ color: 0xe0164e, metalness: 0.85, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.5 })
    ];
    var shapes = [[0.42, 2.3, 1.1, 0.55], [0.44, 2.0, 0.75, 0.5], [0.46, 1.8, 0.45, 0.5], [0.42, 2.2, 0.9, 0.55], [0.4, 2.4, 1.25, 0.55]];

    var group = new T.Group(); scene.add(group);
    var fan = new T.Group(); group.add(fan);
    var nails = [];
    for (var n = 0; n < 5; n++) {
      var sh = shapes[n];
      var mesh = new T.Mesh(nailGeometry(sh[0], sh[1], sh[2], sh[3]), mats[n]);
      var holder = new T.Group();
      var a = (n - 2) * 0.42;
      holder.position.set(Math.sin(a) * 2.2, Math.cos(a) * 2.2 - 2.2, (2 - Math.abs(n - 2)) * 0.25);
      holder.rotation.z = -a;
      mesh.rotation.x = -0.25;
      holder.add(mesh); fan.add(holder);
      nails.push({ mesh: mesh, holder: holder, phase: n * 1.3, baseY: holder.position.y });
    }
    fan.position.y = 0.4;

    // Gems (tooth-gem crystals)
    var gemMat = new T.MeshPhysicalMaterial({ color: 0xffe9f0, metalness: 0, roughness: 0, clearcoat: 1, envMapIntensity: 3, flatShading: true, transparent: true, opacity: 0.92 });
    var gemMatRed = gemMat.clone(); gemMatRed.color = new T.Color(0xff3a72);
    var gemMatGold = new T.MeshPhysicalMaterial({ color: 0xe9d18a, metalness: 1, roughness: 0.15, envMapIntensity: 2, flatShading: true });
    var gems = [];
    var gemGeos = [new T.OctahedronGeometry(0.22, 0), new T.IcosahedronGeometry(0.16, 0), new T.OctahedronGeometry(0.12, 0)];
    for (var g = 0; g < 16; g++) {
      var gm = new T.Mesh(gemGeos[g % 3], [gemMat, gemMatRed, gemMatGold][g % 3]);
      var r = 2.2 + Math.random() * 2.2, th = Math.random() * Math.PI * 2;
      gm.position.set(Math.cos(th) * r, Math.sin(th) * r * 0.75, (Math.random() - 0.5) * 3);
      gm.userData = { s: 0.3 + Math.random() * 0.8, o: Math.random() * 6, y: gm.position.y };
      group.add(gm); gems.push(gm);
    }

    // Sparkles
    var sc = document.createElement('canvas'); sc.width = sc.height = 64;
    var sx = sc.getContext('2d'), rg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.25, 'rgba(255,200,215,.6)'); rg.addColorStop(1, 'rgba(255,200,215,0)');
    sx.fillStyle = rg; sx.fillRect(0, 0, 64, 64);
    sx.fillStyle = '#fff'; sx.fillRect(31, 0, 2, 64); sx.fillRect(0, 31, 64, 2);
    var pg = new T.BufferGeometry(), pp = [];
    for (var p = 0; p < 220; p++) pp.push((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6);
    pg.setAttribute('position', new T.Float32BufferAttribute(pp, 3));
    var sparkles = new T.Points(pg, new T.PointsMaterial({ size: 0.16, map: new T.CanvasTexture(sc), transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    scene.add(sparkles);

    // Layout
    var mobile = false;
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      mobile = w < 820;
      group.position.set(mobile ? 0.6 : 2.6, mobile ? 2.3 : 0, mobile ? -2 : 0);
      group.scale.setScalar(mobile ? 0.6 : 1);
    }
    window.addEventListener('resize', resize); resize();

    var mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    if (window.DeviceOrientationEvent) window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null) return; mx = Math.max(-1, Math.min(1, e.gamma / 30)); my = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    }, { passive: true });

    var visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(canvas);

    var clock = new T.Clock(), intro = 0;
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      var t = clock.getElapsedTime();
      intro = Math.min(1, intro + 0.012);
      var ei = 1 - Math.pow(1 - intro, 3);
      tx = lerp(tx, mx, 0.05); ty = lerp(ty, my, 0.05);
      var sp = Math.min(1, scrollY / innerHeight);

      group.rotation.y = tx * 0.5 + Math.sin(t * 0.3) * 0.25 + sp * 1.2;
      group.rotation.x = ty * 0.25 + sp * 0.4;
      fan.rotation.z = Math.sin(t * 0.5) * 0.06;
      fan.scale.setScalar(0.4 + 0.6 * ei);
      fan.rotation.y = (1 - ei) * 3;

      nails.forEach(function (o) {
        o.holder.position.y = o.baseY + Math.sin(t * 1.1 + o.phase) * 0.08;
        o.mesh.rotation.y = Math.sin(t * 0.8 + o.phase) * 0.25;
      });
      gems.forEach(function (gm) {
        var d = gm.userData;
        gm.rotation.x = t * d.s; gm.rotation.y = t * d.s * 1.3;
        gm.position.y = d.y + Math.sin(t * d.s + d.o) * 0.25;
      });
      sparkles.rotation.y = t * 0.02;
      sparkles.material.size = 0.12 + Math.sin(t * 2) * 0.04;
      camera.position.y = -sp * 1.5;
      renderer.render(scene, camera);
    })();
  }

  /* ---------- Misc ---------- */
  function initMisc() {
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = document.querySelector(id); if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - (id === '#top' ? 0 : 20), behavior: 'smooth' });
      });
    });
  }

  function boot() {
    safe(initSplash, 'splash');
    safe(initSplit, 'split');
    safe(initReveal, 'reveal');
    safe(initNav, 'nav');
    safe(initMagnetic, 'magnetic');
    safe(initTilt, 'tilt');
    safe(initCoverflow, 'coverflow');
    safe(initScroll, 'scroll');
    safe(initNails, 'nails3d');
    safe(initMisc, 'misc');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
