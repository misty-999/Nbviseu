/* NB Club Viseu — página inicial (layout v2) */
(function () {
  'use strict';

  var NB = window.NB, C = NB.CONFIG, esc = NB.esc;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ARROW = '<svg class="arr" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- Hero: vídeo opcional (fallback para fotografia) ---------- */
  (function () {
    var v = document.getElementById('heroVideo');
    if (!v) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduce || saveData) { v.remove(); return; }
    v.muted = true;
    v.addEventListener('loadeddata', function () { v.classList.add('on'); var p = v.play(); if (p && p.catch) p.catch(function () {}); });
    v.addEventListener('error', function () { v.remove(); });
    v.src = window.innerWidth < 768 ? C.media.heroVideoMobile : C.media.heroVideo;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!v.isConnected) return;
          if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
        });
      }, { threshold: 0.05 }).observe(v);
    }
  })();

  /* ---------- Eventos ---------- */
  var list = document.getElementById('evList');
  var nextBox = document.getElementById('next');
  var timer = null;

  function when(e) { return e.date ? new Date(e.date + 'T' + (e.time || '00:00') + ':00') : null; }

  function card(e, i) {
    var f = NB.fmtDate(e.date);
    var prov = NB.ticketProvider(NB.safeUrl(e.ticketUrl));
    return '<a class="ecard" href="evento.html?id=' + encodeURIComponent(e.id) + '" data-reveal style="--d:' + (Math.min(i, 5) * 0.07) + 's" ' +
      'aria-label="' + esc(e.title) + (f ? ', ' + esc(f.long) : '') + '">' +
      '<span class="ephoto">' + NB.media(e.poster, 'Poster de ' + e.title, '') +
        (e.demo ? '<span class="tag">Exemplo</span>' : '') +
        (f ? '<span class="edate"><b>' + f.d + '</b><i>' + f.m + '</i></span>' : '') +
      '</span>' +
      '<span class="ebody">' +
        '<span class="emeta">' + (f ? esc(f.wd) : 'Data a anunciar') + (e.time ? ' &middot; ' + esc(e.time) : '') + '</span>' +
        '<span class="etitle">' + esc(e.title) + '</span>' +
        (e.artist ? '<span class="eartist">' + esc(e.artist) + '</span>' : '') +
        '<span class="efoot"><span class="ebtn">VER EVENTO ' + ARROW + '</span>' + (prov ? '<span class="eprov">' + esc(prov) + '</span>' : '') + '</span>' +
      '</span></a>';
  }

  function pad(n) { return ('0' + n).slice(-2); }
  function tick(target) {
    var box = document.getElementById('cd');
    if (!box) return;
    var ms = target - Date.now();
    if (ms <= 0) { box.innerHTML = '<span class="live">Hoje &middot; a noite já começou</span>'; return; }
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    box.innerHTML = '<span><b>' + pad(d) + '</b>dias</span><span><b>' + pad(h) + '</b>horas</span><span><b>' + pad(m) + '</b>min</span><span><b>' + pad(sec) + '</b>seg</span>';
  }

  function renderNext(e) {
    var f = NB.fmtDate(e.date);
    nextBox.innerHTML =
      '<a class="next-img" href="evento.html?id=' + encodeURIComponent(e.id) + '" tabindex="-1" aria-hidden="true">' + NB.media(e.poster, '', '') + '</a>' +
      '<div class="next-body">' +
        '<p class="next-k"><i></i>Próxima noite</p>' +
        '<h2 class="next-t">' + esc(e.title) + '</h2>' +
        (e.artist ? '<p class="next-a">' + esc(e.artist) + '</p>' : '') +
        '<p class="next-d">' + esc(f.long) + (e.time ? ' &middot; ' + esc(e.time) : '') + '</p>' +
        '<div class="cd" id="cd" role="timer" aria-label="Contagem decrescente para o evento"></div>' +
        '<a class="btn btn-primary btn-sm" href="evento.html?id=' + encodeURIComponent(e.id) + '"><span>VER EVENTO</span>' + ARROW + '</a>' +
      '</div>';
    nextBox.hidden = false;
    var t = when(e);
    tick(t);
    clearInterval(timer);
    timer = setInterval(function () { tick(t); }, 1000);
  }

  NB.loadEvents().then(function (all) {
    var up = NB.upcoming(all);
    list.setAttribute('aria-busy', 'false');

    var featured = up.filter(function (e) { return e.date && !e.demo; })[0];
    if (featured) renderNext(featured);

    if (!up.length) {
      list.classList.add('is-empty');
      list.innerHTML = '<div class="empty"><p class="empty-t">Ainda não há noites anunciadas.</p>' +
        '<p>Os próximos eventos aparecem aqui assim que forem publicados. Entretanto, acompanha o NB no Instagram.</p>' +
        '<a class="btn" href="' + esc(C.instagram) + '" target="_blank" rel="noopener"><span>SEGUIR NO INSTAGRAM</span>' + ARROW + '</a></div>';
      return;
    }
    list.innerHTML = up.map(card).join('');
    window.NBUI.observe(list);
    if (C.showDemoNotes && up.some(function (e) { return e.demo; })) document.getElementById('evNote').hidden = false;
  });

  /* ---------- Galeria (bento) ---------- */
  var grid = document.getElementById('bento');
  var filters = document.getElementById('filters');
  var current = 'all', visible = [];
  var SPAN = { 'r-tall': 'tall', 'r-wide': 'wide', 'r-sq': 'sq', 'r-port': 'tall' };

  function albumLabel(a) {
    var f = NB.fmtDate(a.date);
    return a.name + (f ? ' · ' + f.d + ' ' + f.m : '');
  }
  function albumName(id) {
    var a = NB.ALBUMS.filter(function (x) { return x.id === id; })[0];
    return a ? a.name : '';
  }

  function renderFilters() {
    var items = [{ id: 'all', name: 'Todas' }].concat(NB.ALBUMS);
    filters.innerHTML = items.map(function (a) {
      return '<button type="button" class="chip" data-f="' + esc(a.id) + '" aria-pressed="' + (a.id === current) + '">' +
        esc(a.id === 'all' ? a.name : albumLabel(a)) + '</button>';
    }).join('');
  }

  function renderGrid() {
    visible = NB.PHOTOS.filter(function (p) { return current === 'all' || p.album === current; });
    grid.classList.toggle('set9', visible.length === 9);
    grid.classList.toggle('few', visible.length !== 9);
    if (!visible.length) {
      grid.innerHTML = '<div class="empty"><p class="empty-t">Ainda não há fotografias neste álbum.</p><p>Volta depois da próxima noite.</p></div>';
      return;
    }
    grid.innerHTML = visible.map(function (p, i) {
      return '<button type="button" class="bt ' + (SPAN[p.ratio] || 'sq') + '" data-i="' + i + '" data-reveal style="--d:' + ((i % 4) * 0.07) + 's" ' +
        'aria-label="Ampliar fotografia ' + (i + 1) + ' de ' + visible.length + '">' +
        NB.media(p.src, p.alt, '') +
        '<span class="bt-cap">' + esc(albumName(p.album)) + '</span>' +
        '<span class="bt-zoom" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span></button>';
    }).join('');
    window.NBUI.observe(grid);
  }

  renderFilters();
  renderGrid();
  if (C.showDemoNotes) document.getElementById('galNote').hidden = false;

  filters.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    current = b.getAttribute('data-f');
    filters.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
    grid.classList.add('swap');
    setTimeout(function () { renderGrid(); grid.classList.remove('swap'); }, reduce ? 0 : 220);
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lb');
  var fig = document.getElementById('lbFig');
  var cap = document.getElementById('lbCap');
  var idx = 0;

  function showPhoto(i) {
    if (!visible.length) return;
    idx = (i + visible.length) % visible.length;
    var p = visible[idx];
    fig.innerHTML = NB.media(p.src, p.alt, 'lb-media');
    cap.textContent = albumName(p.album) + '  —  ' + (idx + 1) + ' / ' + visible.length;
  }
  function openLb(i) {
    showPhoto(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.bt');
    if (b) openLb(+b.getAttribute('data-i'));
  });
  document.getElementById('lbPrev').addEventListener('click', function () { showPhoto(idx - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { showPhoto(idx + 1); });
  document.getElementById('lbClose').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') showPhoto(idx - 1);
    if (e.key === 'ArrowRight') showPhoto(idx + 1);
  });
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) showPhoto(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- Instagram ---------- */
  var igWrap = document.getElementById('igPosts');
  var codes = (C.instagramPosts || []).filter(function (c) { return /^[A-Za-z0-9_-]+$/.test(c); });
  if (codes.length) {
    igWrap.innerHTML = codes.map(function (c) {
      return '<iframe class="ig-embed" src="https://www.instagram.com/p/' + c + '/embed" title="Publicação do Instagram do NB" loading="lazy" allowtransparency="true" scrolling="no"></iframe>';
    }).join('');
    igWrap.hidden = false;
  }

  /* ---------- Contactos (só mostra o que está configurado) ---------- */
  var res = [];
  if (C.phone) res.push('<a class="link" href="tel:' + esc(C.phone.replace(/\s+/g, '')) + '">' + esc(C.phone) + '</a>');
  if (C.email) res.push('<a class="link" href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>');
  document.getElementById('resBody').innerHTML = res.length
    ? res.join('<br>')
    : 'Reservas de mesas e informações: envia-nos mensagem no Instagram.<br><a class="link" href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Abrir Instagram</a>';
  document.getElementById('hoursBody').textContent = C.hours || 'A divulgar. Consulta o Instagram para a informação mais recente.';
  document.getElementById('mapBtn').href = C.mapsUrl;
  if (C.facebook) document.querySelectorAll('[data-fb]').forEach(function (a) { a.href = C.facebook; a.hidden = false; });
})();
