/* ==========================================================
   LA SANTA PHOBIA — main.js (IIFE, no modules)
   ========================================================== */
(function () {
  'use strict';
  window.__BRAND__ = { name: 'La Santa Phobia' };
  document.body.classList.add('is-loading');

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn('[' + name + '] failed:', e); }
  }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var mqDesktop = window.matchMedia('(min-width: 901px)');

  /* ---------- Splash ---------- */
  function initSplash() {
    var splash = $('#splash'), done = false;
    function hide() {
      if (done) return; done = true;
      document.body.classList.remove('is-loading');
      if (splash) splash.classList.add('is-done');
    }
    if (document.readyState === 'complete') setTimeout(hide, 600);
    else window.addEventListener('load', function () { setTimeout(hide, 400); });
    setTimeout(hide, 2600);
  }

  /* ---------- Reveal ---------- */
  function initReveal() {
    $$('.exvoto').forEach(function (el, i) { el.classList.add('reveal'); el.style.transitionDelay = (i % 3) * 0.12 + 's'; });
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); countUp(en.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add('is-in'); }); }, 6000);
  }

  function countUp(root) {
    $$('[data-count]', root).forEach(function (el) {
      if (el.dataset.done) return; el.dataset.done = 1;
      var end = +el.dataset.count, suf = el.dataset.suffix || '', start = end > 1000 ? end - 30 : 0, t0 = null;
      function step(t) {
        if (!t0) t0 = t; var p = Math.min((t - t0) / 1500, 1); p = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(lerp(start, end, p)) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Nav, menu, FAB ---------- */
  function initNav() {
    var nav = $('#nav'), fab = $('.fab'), menu = $('#menu'), burger = $('#burger'), last = 0, ticking = false;
    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 30);
      nav.classList.toggle('is-hidden', y > last && y > 500 && !menu.classList.contains('is-open'));
      if (fab) fab.classList.toggle('is-visible', y > window.innerHeight * 0.8);
      last = y; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    function setMenu(open) {
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.setAttribute('aria-hidden', !open);
      if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) { var f = menu.querySelector('a'); if (f) setTimeout(function () { f.focus(); }, 300); }
    }
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav__links a[href^="#"]'), map = {};
    links.forEach(function (a) { var t = document.querySelector(a.getAttribute('href')); if (t) map[t.id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id]; if (!a || !en.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        a.classList.add('is-active'); a.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------- Carta: accessible tabs ---------- */
  function initTabs() {
    var tabs = $$('.carta__tabs [role="tab"]');
    if (!tabs.length) return;
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-active', on); }
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0];
        if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  }

  /* ---------- Estampitas: fan deck ---------- */
  function initDeck() {
    var deck = $('#deck');
    if (!deck) return;
    var cards = $$('.card', deck), mid = (cards.length - 1) / 2;
    function layout(p) {
      var desk = mqDesktop.matches;
      cards.forEach(function (c, i) {
        var d = i - mid;
        c.style.zIndex = String(10 - Math.round(Math.abs(d)));
        c.style.setProperty('--r', desk ? (d * 9 * p).toFixed(2) + 'deg' : '0deg');
        c.style.setProperty('--x', desk ? (d * 92 * p).toFixed(1) + 'px' : '0px');
      });
    }
    layout(1);
    if (window.gsap && window.ScrollTrigger) {
      layout(0.15);
      ScrollTrigger.create({
        trigger: deck, start: 'top 85%', end: 'center 55%', scrub: 0.5,
        onUpdate: function (st) { layout(0.15 + st.progress * 0.85); },
        onRefresh: function (st) { layout(0.15 + st.progress * 0.85); }
      });
    }
    var onChange = function () { layout(1); if (window.ScrollTrigger) ScrollTrigger.refresh(); };
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', onChange);
  }

  /* ---------- GSAP scroll accents ---------- */
  function initScroll() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.arch--l', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.arch--r', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.about__seal', { rotate: -30 }, { rotate: 8, ease: 'none', scrollTrigger: { trigger: '.about', scrub: true } });
    gsap.fromTo('.footer__big', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    ScrollTrigger.matchMedia({
      '(min-width: 901px)': function () {
        $$('.exvoto:nth-child(3n+2)').forEach(function (el) {
          gsap.fromTo(el, { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: '.exvotos__grid', scrub: true } });
        });
      }
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- Three.js — nail relics in the niche ---------- */
  function initNails() {
    var canvas = $('#nails3d'), niche = $('#niche');
    if (!canvas || !niche || !window.THREE) return;
    var T = window.THREE, renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 13);

    // Warm "chapel" environment for gold reflections
    var pmrem = new T.PMREMGenerator(renderer), env = new T.Scene();
    env.add(new T.Mesh(new T.SphereGeometry(20, 32, 16), new T.MeshBasicMaterial({ color: 0x1a0508, side: T.BackSide })));
    function box(color, w, h, x, y, z) {
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: color, side: T.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    }
    box(0xfff4dc, 10, 4, 0, 9, 4);
    box(0xffd28a, 4, 10, -10, 0, 4);
    box(0x9b1c33, 5, 12, 10, -1, 2);
    box(0xe8b9a8, 8, 2, 0, -8, 6);
    box(0xffffff, 3, 3, 4, 3, 10);
    scene.environment = pmrem.fromScene(env, 0.035).texture;
    scene.add(new T.AmbientLight(0xffffff, 0.25));
    var key = new T.DirectionalLight(0xfff1d6, 1.3); key.position.set(3, 5, 6); scene.add(key);
    var rim = new T.PointLight(0xe2c071, 2, 20); rim.position.set(-4, 3, 3); scene.add(rim);

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
      draw(c.getContext('2d'), 256, 512);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
    }
    var pearlTex = canvasTex(function (x, w, h) {
      x.fillStyle = '#f4e3dc'; x.fillRect(0, 0, w, h);
      var g = x.createLinearGradient(0, h * 0.6, 0, h * 0.7); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, '#fffaf2');
      x.fillStyle = g; x.fillRect(0, h * 0.6, w, h);
    });
    var flakeTex = canvasTex(function (x, w, h) {
      x.fillStyle = '#120d0e'; x.fillRect(0, 0, w, h);
      for (var i = 0; i < 260; i++) {
        x.fillStyle = 'rgba(226,192,113,' + (0.4 + Math.random() * 0.6) + ')';
        x.beginPath(); x.arc(Math.random() * w, Math.pow(Math.random(), 0.6) * h, Math.random() * 3 + 0.5, 0, 7); x.fill();
      }
    });
    var crossTex = canvasTex(function (x, w, h) {
      x.fillStyle = '#7d1228'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#e2c071'; x.fillStyle = '#e2c071'; x.lineWidth = 4; x.lineCap = 'round';
      x.beginPath(); x.moveTo(w * 0.5, h * 0.92); x.quadraticCurveTo(w * 0.42, h * 0.55, w * 0.55, h * 0.2); x.stroke();
      for (var i = 0; i < 6; i++) {
        var yy = h * (0.82 - i * 0.11), xx = w * (0.48 + Math.sin(i) * 0.03), s = i % 2 ? 1 : -1;
        x.save(); x.translate(xx, yy); x.rotate(s * 0.9 - 0.3);
        x.beginPath(); x.ellipse(s * 22, 0, 24, 9, 0, 0, Math.PI * 2); x.fill(); x.restore();
      }
    });
    var mats = [
      new T.MeshPhysicalMaterial({ color: 0xd9a596, metalness: 0.8, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.5 }),
      new T.MeshPhysicalMaterial({ map: crossTex, metalness: 0.1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.2 }),
      new T.MeshPhysicalMaterial({ color: 0xe9c875, metalness: 1, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.7 }),
      new T.MeshPhysicalMaterial({ map: pearlTex, metalness: 0, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1 }),
      new T.MeshPhysicalMaterial({ map: flakeTex, metalness: 0.4, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.3 })
    ];
    var shapes = [[0.42, 2.1, 0.9, 0.55], [0.44, 2.3, 1.1, 0.5], [0.46, 2.55, 1.25, 0.55], [0.44, 2.3, 1.1, 0.5], [0.42, 2.1, 0.9, 0.55]];

    var group = new T.Group(); scene.add(group);
    var fan = new T.Group(); group.add(fan);
    var nails = [];
    for (var n = 0; n < 5; n++) {
      var sh = shapes[n], holder = new T.Group(), a = (n - 2) * 0.36;
      var mesh = new T.Mesh(nailGeometry(sh[0], sh[1], sh[2], sh[3]), mats[n]);
      holder.position.set(Math.sin(a) * 2.4, Math.cos(a) * 2.4 - 2.4, (2 - Math.abs(n - 2)) * 0.2);
      holder.rotation.z = -a;
      mesh.rotation.x = -0.2;
      holder.add(mesh); fan.add(holder);
      nails.push({ mesh: mesh, holder: holder, phase: n * 1.3, baseY: holder.position.y });
    }

    var gemMat = new T.MeshPhysicalMaterial({ color: 0xfff6e6, metalness: 0, roughness: 0, clearcoat: 1, envMapIntensity: 3, flatShading: true, transparent: true, opacity: 0.92 });
    var goldMat = new T.MeshPhysicalMaterial({ color: 0xe2c071, metalness: 1, roughness: 0.15, envMapIntensity: 2, flatShading: true });
    var gems = [], gemGeos = [new T.OctahedronGeometry(0.18, 0), new T.IcosahedronGeometry(0.13, 0)];
    for (var g = 0; g < 10; g++) {
      var gm = new T.Mesh(gemGeos[g % 2], g % 2 ? goldMat : gemMat);
      var r = 1.9 + Math.random() * 0.9, th = Math.PI * (0.1 + Math.random() * 0.8);
      gm.position.set(Math.cos(th) * r, Math.sin(th) * r * 0.9 - 0.2, (Math.random() - 0.5) * 1.5);
      gm.userData = { s: 0.3 + Math.random() * 0.7, o: Math.random() * 6, y: gm.position.y };
      group.add(gm); gems.push(gm);
    }

    var sc = document.createElement('canvas'); sc.width = sc.height = 64;
    var sx = sc.getContext('2d'), rg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,248,225,1)'); rg.addColorStop(0.25, 'rgba(226,192,113,.6)'); rg.addColorStop(1, 'rgba(226,192,113,0)');
    sx.fillStyle = rg; sx.fillRect(0, 0, 64, 64);
    var pg = new T.BufferGeometry(), pp = [];
    for (var p = 0; p < 120; p++) pp.push((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 3);
    pg.setAttribute('position', new T.Float32BufferAttribute(pp, 3));
    var sparkles = new T.Points(pg, new T.PointsMaterial({ size: 0.14, map: new T.CanvasTexture(sc), transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    scene.add(sparkles);

    function resize() {
      var w = niche.clientWidth, h = niche.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      var s = Math.min(1, camera.aspect / 0.62);
      group.scale.setScalar(0.92 * s);
      group.position.set(0, 0.55, 0);
    }
    window.addEventListener('resize', resize); resize();

    var mx = 0, my = 0, tx = 0, ty = 0;
    window.addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });

    var visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(niche);

    var clock = new T.Clock(), intro = 0;
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      var t = clock.getElapsedTime();
      intro = Math.min(1, intro + 0.012);
      var ei = 1 - Math.pow(1 - intro, 3);
      tx = lerp(tx, mx, 0.05); ty = lerp(ty, my, 0.05);
      group.rotation.y = tx * 0.45 + Math.sin(t * 0.35) * 0.3;
      group.rotation.x = ty * 0.2;
      fan.scale.setScalar(0.4 + 0.6 * ei);
      fan.rotation.y = (1 - ei) * 2.5;
      fan.rotation.z = Math.sin(t * 0.5) * 0.04;
      nails.forEach(function (o) {
        o.holder.position.y = o.baseY + Math.sin(t * 1.1 + o.phase) * 0.07;
        o.mesh.rotation.y = Math.sin(t * 0.8 + o.phase) * 0.22;
      });
      gems.forEach(function (gm) {
        var d = gm.userData;
        gm.rotation.x = t * d.s; gm.rotation.y = t * d.s * 1.3;
        gm.position.y = d.y + Math.sin(t * d.s + d.o) * 0.18;
      });
      sparkles.rotation.y = t * 0.03;
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
        window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - (id === '#top' ? 0 : 10), behavior: 'smooth' });
        if (id === '#top') t.focus({ preventScroll: true });
      });
    });
  }

  function boot() {
    safe(initSplash, 'splash');
    safe(initReveal, 'reveal');
    safe(initNav, 'nav');
    safe(initActiveNav, 'activeNav');
    safe(initTabs, 'tabs');
    safe(initScroll, 'scroll');
    safe(initDeck, 'deck');
    safe(initNails, 'nails3d');
    safe(initMisc, 'misc');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
