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

  /* ---------- Three.js — estampita 3D de Marina ---------- */
  function initFounder() {
    var stage = $('#founderStage'), canvas = $('#founder3d');
    if (!stage || !canvas || !window.THREE) return;
    var T = window.THREE, renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(28, 1, 0.1, 100);

    // Entorno cálido para los reflejos del oro
    var pmrem = new T.PMREMGenerator(renderer), env = new T.Scene();
    env.add(new T.Mesh(new T.SphereGeometry(20, 32, 16), new T.MeshBasicMaterial({ color: 0x1a0508, side: T.BackSide })));
    [[0xfff4dc, 10, 4, 0, 9, 4], [0xffd28a, 4, 10, -10, 0, 4], [0xd9b3a6, 5, 12, 10, -1, 2], [0xe8b9a8, 8, 2, 0, -8, 6], [0xffffff, 3, 3, 4, 3, 10]].forEach(function (b) {
      var m = new T.Mesh(new T.PlaneGeometry(b[1], b[2]), new T.MeshBasicMaterial({ color: b[0], side: T.DoubleSide }));
      m.position.set(b[3], b[4], b[5]); m.lookAt(0, 0, 0); env.add(m);
    });
    scene.environment = pmrem.fromScene(env, 0.035).texture;
    scene.add(new T.AmbientLight(0xffffff, 0.3));
    var key = new T.DirectionalLight(0xfff1d6, 1.2); key.position.set(3, 5, 6); scene.add(key);
    var rim = new T.PointLight(0xe2c071, 2.2, 20); rim.position.set(-4, 2, 3); scene.add(rim);

    var W = 3, H = 4.2;
    function arch(w, h) {
      var s = new T.Shape(), r = w / 2, top = h / 2;
      s.moveTo(-r, -top); s.lineTo(r, -top); s.lineTo(r, top - r);
      s.absarc(0, top - r, r, 0, Math.PI, false); s.lineTo(-r, -top);
      return s;
    }
    function archGeo(cover) {
      var g = new T.ShapeGeometry(arch(W, H), 64), pos = g.attributes.position, uv = g.attributes.uv;
      var imgA = 1200 / 1600, shA = W / H;
      for (var i = 0; i < pos.count; i++) {
        var u = (pos.getX(i) + W / 2) / W, v = (pos.getY(i) + H / 2) / H;
        if (cover) { if (imgA > shA) u = 0.5 + (u - 0.5) * shA / imgA; else v = 0.5 + (v - 0.5) * imgA / shA; }
        uv.setXY(i, u, v);
      }
      return g;
    }

    var root = new T.Group(); scene.add(root);
    var card = new T.Group(); root.add(card);

    // Retrato (cara)
    var portraitMat = new T.MeshBasicMaterial({ color: 0x2c0710, toneMapped: false });
    var portrait = new T.Mesh(archGeo(true), portraitMat); portrait.position.z = 0.012; card.add(portrait);

    // Dorso: mano del logotipo en oro sobre granate
    var bc = document.createElement('canvas'); bc.width = 512; bc.height = 717;
    var bx = bc.getContext('2d');
    function paintBack(hand) {
      var w = bc.width, h = bc.height, cx = w / 2, cy = h * 0.42;
      var g = bx.createRadialGradient(cx, cy, 10, cx, cy, h * 0.75);
      g.addColorStop(0, '#8a1c31'); g.addColorStop(0.55, '#4a0c19'); g.addColorStop(1, '#22050c');
      bx.fillStyle = g; bx.fillRect(0, 0, w, h);
      bx.save(); bx.translate(cx, cy);
      for (var i = 0; i < 48; i++) {
        bx.rotate(Math.PI * 2 / 48); bx.fillStyle = 'rgba(226,192,113,' + (i % 2 ? 0.07 : 0.14) + ')';
        bx.beginPath(); bx.moveTo(0, 0); bx.lineTo(-7, -h); bx.lineTo(7, -h); bx.closePath(); bx.fill();
      }
      bx.restore();
      bx.strokeStyle = 'rgba(226,192,113,.85)'; bx.lineWidth = 3; bx.beginPath(); bx.arc(cx, cy, 150, 0, Math.PI * 2); bx.stroke();
      bx.setLineDash([4, 8]); bx.lineWidth = 1.5; bx.beginPath(); bx.arc(cx, cy, 168, 0, Math.PI * 2); bx.stroke(); bx.setLineDash([]);
      if (hand) {
        var hc = document.createElement('canvas'), hh = 300, hw = hh * hand.width / hand.height;
        hc.width = hw; hc.height = hh; var hx = hc.getContext('2d');
        hx.drawImage(hand, 0, 0, hw, hh); hx.globalCompositeOperation = 'source-in';
        var gg = hx.createLinearGradient(0, 0, hw, hh); gg.addColorStop(0, '#f7e3a6'); gg.addColorStop(0.5, '#e2c071'); gg.addColorStop(1, '#b8892f');
        hx.fillStyle = gg; hx.fillRect(0, 0, hw, hh);
        bx.drawImage(hc, cx - hw / 2, cy - hh / 2);
      }
      bx.textAlign = 'center'; bx.fillStyle = '#e2c071';
      bx.font = '700 46px "Grenze Gotisch", serif'; bx.fillText('La Santa Phobia', cx, h * 0.8);
      bx.font = '500 15px "Space Grotesk", sans-serif'; bx.fillStyle = '#f2eadc';
      bx.fillText('M A R I N A   D A Z A   ·   M M X I X', cx, h * 0.86);
      backTex.needsUpdate = true;
    }
    var backTex = new T.CanvasTexture(bc); backTex.encoding = T.sRGBEncoding; backTex.anisotropy = 4;
    var back = new T.Mesh(archGeo(false), new T.MeshStandardMaterial({ map: backTex, roughness: 0.45, metalness: 0.15, envMapIntensity: 0.8 }));
    back.rotation.y = Math.PI; back.position.z = -0.012; card.add(back);
    paintBack(null);
    var hand = new Image();
    hand.onload = function () {
      var go = function () { paintBack(hand); };
      if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('700 46px "Grenze Gotisch"'), document.fonts.load('500 15px "Space Grotesk"')]).then(go, go); else go();
    };
    hand.src = 'assets/img/marina-mano.png';

    // Marco de oro extruido
    var gold = new T.MeshPhysicalMaterial({ color: 0xe2c071, metalness: 1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.8 });
    var outer = arch(W + 0.34, H + 0.34); outer.holes.push(arch(W - 0.04, H - 0.04));
    var frameGeo = new T.ExtrudeGeometry(outer, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3, curveSegments: 64 });
    frameGeo.translate(0, 0, -0.07);
    card.add(new T.Mesh(frameGeo, gold));

    // Rosario de perlas alrededor del arco
    var pw = W + 0.66, ph = H + 0.66, pr = pw / 2, straight = ph - pr, total = 2 * straight + Math.PI * pr, NP = 64;
    var pearlMat = new T.MeshPhysicalMaterial({ color: 0xfff1e6, metalness: 0, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4 });
    var pearls = new T.InstancedMesh(new T.SphereGeometry(0.07, 16, 12), pearlMat, NP), dummy = new T.Object3D();
    for (var k = 0; k < NP; k++) {
      var d = (k + 0.5) / NP * total, x, y;
      if (d < straight) { x = pr; y = -ph / 2 + d; }
      else if (d < straight + Math.PI * pr) { var a = (d - straight) / pr; x = Math.cos(a) * pr; y = ph / 2 - pr + Math.sin(a) * pr; }
      else { x = -pr; y = ph / 2 - pr - (d - straight - Math.PI * pr); }
      dummy.position.set(x, y, 0); dummy.updateMatrix(); pearls.setMatrixAt(k, dummy.matrix);
    }
    card.add(pearls);

    // Brillo dorado que barre la estampa al girarla
    var sheenMat = new T.ShaderMaterial({
      uniforms: { uShift: { value: -1 }, uOpacity: { value: 0.55 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform float uShift;uniform float uOpacity;varying vec2 vUv;void main(){float d=vUv.x*0.75+vUv.y*0.55-uShift;' +
        'float band=smoothstep(0.0,0.16,d)*(1.0-smoothstep(0.16,0.42,d));vec3 c=mix(vec3(1.0,0.86,0.55),vec3(1.0,0.72,0.78),vUv.y);' +
        'gl_FragColor=vec4(c*band*uOpacity,1.0);}',
      transparent: true, blending: T.AdditiveBlending, depthWrite: false
    });
    var sheen = new T.Mesh(archGeo(false), sheenMat); sheen.position.z = 0.02; card.add(sheen);

    // Halo y resplandor detrás
    var halo = new T.Mesh(new T.TorusGeometry(2.75, 0.014, 8, 160), gold); halo.position.set(0, 0.55, -0.8); root.add(halo);
    var gc = document.createElement('canvas'); gc.width = gc.height = 256;
    var gx = gc.getContext('2d'), grd = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(255,226,160,.55)'); grd.addColorStop(0.4, 'rgba(226,150,120,.18)'); grd.addColorStop(1, 'rgba(226,150,120,0)');
    gx.fillStyle = grd; gx.fillRect(0, 0, 256, 256);
    var glow = new T.Mesh(new T.PlaneGeometry(6.4, 6.4), new T.MeshBasicMaterial({ map: new T.CanvasTexture(gc), transparent: true, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }));
    glow.position.set(0, 0.4, -1.4); root.add(glow);

    // Cristales en órbita (tooth gems)
    var gemMat = new T.MeshPhysicalMaterial({ color: 0xfff6e6, metalness: 0, roughness: 0, clearcoat: 1, envMapIntensity: 3, flatShading: true, transparent: true, opacity: 0.92 });
    var roseMat = new T.MeshPhysicalMaterial({ color: 0xe8a3a8, metalness: 0.2, roughness: 0.05, clearcoat: 1, envMapIntensity: 2.5, flatShading: true });
    var geos = [new T.OctahedronGeometry(0.17, 0), new T.IcosahedronGeometry(0.13, 0), new T.OctahedronGeometry(0.11, 0)];
    var gems = [];
    for (var gi = 0; gi < 18; gi++) {
      var gm = new T.Mesh(geos[gi % 3], gi % 3 === 0 ? gemMat : (gi % 3 === 1 ? gold : roseMat));
      gm.userData = { a: gi / 18 * Math.PI * 2, r: 2.75 + (gi % 4) * 0.18, y: -1.6 + (gi % 6) * 0.62, s: 0.6 + Math.random() * 0.8, o: Math.random() * 6 };
      root.add(gm); gems.push(gm);
    }

    // Polvo de oro que asciende
    var sc = document.createElement('canvas'); sc.width = sc.height = 64;
    var sx = sc.getContext('2d'), rg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, 'rgba(255,248,225,1)'); rg.addColorStop(0.25, 'rgba(226,192,113,.6)'); rg.addColorStop(1, 'rgba(226,192,113,0)');
    sx.fillStyle = rg; sx.fillRect(0, 0, 64, 64);
    var NS = 140, sp = new Float32Array(NS * 3);
    for (var si = 0; si < NS; si++) { sp[si * 3] = (Math.random() - 0.5) * 8; sp[si * 3 + 1] = (Math.random() - 0.5) * 7; sp[si * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5; }
    var sGeo = new T.BufferGeometry(); sGeo.setAttribute('position', new T.BufferAttribute(sp, 3));
    var dust = new T.Points(sGeo, new T.PointsMaterial({ size: 0.12, map: new T.CanvasTexture(sc), transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    root.add(dust);

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var dist = 3.6 / Math.tan(camera.fov * Math.PI / 360);
      if (camera.aspect < 0.95) dist /= camera.aspect / 0.95;
      camera.position.set(0, 0.1, dist); camera.lookAt(0, 0.1, 0);
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize); resize();

    // Interacción: inclinar con el cursor, arrastrar o pulsar para girarla
    var tx = 0, ty = 0, mx = 0, my = 0, spin = 0, spinVel = 0, dragging = false, lastX = 0, moved = 0;
    stage.addEventListener('pointermove', function (e) {
      var b = stage.getBoundingClientRect();
      mx = (e.clientX - b.left) / b.width * 2 - 1; my = (e.clientY - b.top) / b.height * 2 - 1;
      if (dragging) { var dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); spin += dx * 0.012; spinVel = dx * 0.012; }
    });
    stage.addEventListener('pointerleave', function () { mx = 0; my = 0; dragging = false; });
    stage.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; moved = 0; });
    window.addEventListener('pointerup', function () {
      if (dragging && moved < 6) spinVel = 0.32;
      dragging = false;
    });

    // Volteo de entrada: de espaldas a frente con el scroll
    var flip = 0, flipTarget = 0;
    if (window.gsap && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: stage, start: 'top 92%', end: 'center 58%', scrub: 0.8,
        onUpdate: function (st) { flipTarget = st.progress; }, onRefresh: function (st) { flipTarget = st.progress; } });
    } else flipTarget = 1;

    var visible = false;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: '120px' }).observe(stage);
    else visible = true;

    new T.TextureLoader().load('assets/img/marina.webp', function (tex) {
      tex.encoding = T.sRGBEncoding; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      portraitMat.map = tex; portraitMat.color.set(0xffffff); portraitMat.needsUpdate = true;
      renderer.render(scene, camera);
      stage.classList.add('is-3d');
    });

    var clock = new T.Clock(), TAU = Math.PI * 2;
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      var t = clock.getElapsedTime();
      flip = lerp(flip, flipTarget, 0.08);
      var ef = 1 - Math.pow(1 - Math.min(1, flip), 3);
      tx = lerp(tx, mx, 0.06); ty = lerp(ty, my, 0.06);
      if (!dragging) {
        spin += spinVel; spinVel *= 0.95;
        if (Math.abs(spinVel) < 0.004) { spinVel = 0; spin = lerp(spin, Math.round(spin / TAU) * TAU, 0.06); }
      }
      card.rotation.y = (1 - ef) * Math.PI + spin + tx * 0.38 + Math.sin(t * 0.6) * 0.06;
      card.rotation.x = -ty * 0.16 + Math.sin(t * 0.5) * 0.03;
      card.position.y = Math.sin(t * 0.9) * 0.06;
      sheenMat.uniforms.uShift.value = 0.45 + Math.sin(card.rotation.y) * 1.1 + tx * 0.35 + ((t * 0.18) % 3 > 2.4 ? ((t * 0.18) % 3 - 2.4) * 3 - 0.9 : 0);
      halo.rotation.z = t * 0.1;
      halo.rotation.x = Math.sin(t * 0.4) * 0.12;
      var speed = 0.22 + (1 - ef) * 1.6 + Math.abs(spinVel) * 6;
      gems.forEach(function (gm) {
        var u = gm.userData; u.a += speed * 0.01;
        gm.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(t * u.s + u.o) * 0.25, Math.sin(u.a) * u.r * 0.55);
        gm.rotation.x = t * u.s; gm.rotation.y = t * u.s * 1.3;
      });
      var arr = dust.geometry.attributes.position.array;
      for (var i = 1; i < arr.length; i += 3) { arr[i] += 0.006; if (arr[i] > 3.6) arr[i] = -3.6; }
      dust.geometry.attributes.position.needsUpdate = true;
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
    safe(initFounder, 'founder3d');
    safe(initMisc, 'misc');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
