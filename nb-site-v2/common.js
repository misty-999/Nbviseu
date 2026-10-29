/* NB Club Viseu — comportamento comum (navbar, menu, reveals, cursor, transições) */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var body = document.body;
  var heroEls = [];

  /* ---------- Divisão de texto (palavras / letras) ---------- */
  function splitText(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    var letters = el.getAttribute('data-split') === 'letters';
    var full = el.textContent.replace(/\s+/g, ' ').trim();
    var idx = 0, html = '';
    var clean = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };

    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeName === 'BR') { html += '<br>'; return; }
      n.textContent.replace(/\s+/g, ' ').trim().split(' ').forEach(function (wd) {
        if (!wd) return;
        if (letters) {
          html += '<span class="word">' + wd.split('').map(function (c) {
            return '<span class="w"><span class="wi' + (c === '.' ? ' dot' : '') + '" style="--i:' + (idx++) + '">' + clean(c) + '</span></span>';
          }).join('') + '</span> ';
        } else {
          html += '<span class="w"><span class="wi" style="--i:' + (idx++) + '">' + clean(wd) + '</span></span> ';
        }
      });
    });
    el.innerHTML = '<span aria-hidden="true">' + html + '</span><span class="sr-only">' + clean(full) + '</span>';
  }

  /* ---------- Reveals ao scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }) : null;

  function observe(scope) {
    scope = scope || document;
    scope.querySelectorAll('[data-split]').forEach(splitText);
    scope.querySelectorAll('[data-reveal],[data-split]').forEach(function (el) {
      if (el.dataset.bound) return;
      el.dataset.bound = '1';
      if (el.closest('.hero')) { heroEls.push(el); if (body.classList.contains('ready')) el.classList.add('in'); return; }
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  function ready() {
    body.classList.add('ready');
    heroEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Parallax + progresso + navbar ---------- */
  var nav = document.querySelector('.nav');
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  body.appendChild(bar);
  var pnodes = [];
  var ticking = false;

  function runParallax() {
    if (reduce) return;
    pnodes.forEach(function (n) {
      var r = n.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      var c = r.top + r.height / 2 - window.innerHeight / 2;
      n.style.transform = 'translate3d(0,' + (-c * parseFloat(n.dataset.parallax)).toFixed(1) + 'px,0)';
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (nav) nav.classList.toggle('scrolled', y > 40);
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
      runParallax();
      ticking = false;
    });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!nav || !burger || !menu) return;
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    body.classList.toggle('lock', open);
    if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
  }
  if (burger && menu) {
    menu.setAttribute('inert', '');
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960) setMenu(false); });
  }

  /* ---------- Link ativo conforme a secção ---------- */
  function trackSections() {
    if (!('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (!links.length) return;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) so.observe(s);
    });
  }

  /* ---------- Cursor personalizado (só desktop) ---------- */
  if (finePointer && !reduce) {
    var ring = document.createElement('div');
    ring.className = 'cursor';
    ring.setAttribute('aria-hidden', 'true');
    body.appendChild(ring);
    var x = -100, y = -100, cx = x, cy = y;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY; ring.classList.add('on');
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      ring.classList.toggle('hot', !!(e.target.closest && e.target.closest('a,button,[data-cursor],.ph-item,.card')));
    });
    document.documentElement.addEventListener('mouseleave', function () { ring.classList.remove('on'); });
    (function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      ring.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Transições entre páginas ---------- */
  if (!reduce) {
    var curtain = document.createElement('div');
    curtain.className = 'curtain';
    curtain.setAttribute('aria-hidden', 'true');
    body.appendChild(curtain);
    try {
      if (sessionStorage.getItem('nb_t')) { sessionStorage.removeItem('nb_t'); curtain.classList.add('arrive'); }
    } catch (err) {}
    curtain.addEventListener('animationend', function () { curtain.classList.remove('arrive'); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) curtain.classList.remove('leaving'); });

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.target || a.hasAttribute('download')) return;
      var u;
      try { u = new URL(a.href, location.href); } catch (_) { return; }
      if (u.protocol !== location.protocol || u.host !== location.host) return;
      if (u.pathname === location.pathname && u.search === location.search) return; // âncora na mesma página
      e.preventDefault();
      curtain.classList.add('leaving');
      try { sessionStorage.setItem('nb_t', '1'); } catch (_) {}
      setTimeout(function () { location.href = a.href; }, 520);
    });
  }

  /* ---------- Arranque ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  observe(document);
  pnodes = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  trackSections();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  var loader = document.querySelector('.loader');
  var loaderOn = loader && getComputedStyle(loader).display !== 'none';
  setTimeout(ready, loaderOn && !reduce ? 950 : 60);

  window.NBUI = { observe: observe, reduce: reduce };
})();
