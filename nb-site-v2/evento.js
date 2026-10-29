/* NB Club Viseu — página individual de evento */
(function () {
  'use strict';

  var NB = window.NB, C = NB.CONFIG, esc = NB.esc;
  var root = document.getElementById('evRoot');
  var ARROW = '<svg class="arr" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var id = new URLSearchParams(location.search).get('id');

  function paragraphs(t) {
    return String(t || '').split(/\n{1,}/).filter(Boolean).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  }

  /* Pré-venda online até ao dia; no próprio dia, bilheteira habitual */
  function actions(e, ticket) {
    var T = C.ticketing || {};
    var isToday = e.date && e.date === NB.todayISO();
    var door = NB.safeUrl(e.doorUrl || T.doorUrl);
    if (door && !/^https?:\/\//i.test(door)) door = '';
    var prov = NB.ticketProvider(ticket);
    var presale = ticket
      ? '<a class="btn ' + (isToday ? '' : 'btn-primary') + '" href="' + esc(ticket) + '" target="_blank" rel="noopener"><span>' + (isToday ? 'PRÉ-VENDA' : 'COMPRAR BILHETES') + (prov ? ' (' + esc(prov) + ')' : '') + '</span>' + ARROW + '</a>'
      : '';
    var doorBtn = door
      ? '<a class="btn ' + (isToday ? 'btn-primary' : '') + '" href="' + esc(door) + '" target="_blank" rel="noopener"><span>BILHETEIRA ' + esc((T.doorProvider || '').toUpperCase()) + '</span>' + ARROW + '</a>'
      : '';
    var note = '<p class="demo-note left">No próprio dia do evento, a compra de bilhetes faz-se na bilheteira habitual (' + esc(T.doorProvider || 'bilheteira') + '). Esta plataforma pode mudar de evento para evento.</p>';
    if (!presale && !doorBtn) {
      presale = '<a class="btn btn-primary" href="' + esc(C.instagram) + '" target="_blank" rel="noopener"><span>RESERVAR NO INSTAGRAM</span>' + ARROW + '</a>';
    }
    return (isToday ? doorBtn + presale : presale + doorBtn) + note;
  }

  function notFound() {
    root.setAttribute('aria-busy', 'false');
    root.innerHTML = '<div class="empty ev-empty"><p class="empty-t">Evento não encontrado.</p>' +
      '<p>Este evento pode já ter terminado ou ainda não estar publicado.</p>' +
      '<a class="btn" href="index.html#eventos">VER TODOS OS EVENTOS ' + ARROW + '</a></div>';
    document.title = 'Evento não encontrado | NB Club Viseu';
  }

  NB.loadEvents().then(function (list) {
    var e = list.filter(function (x) { return x.id === id && x.published; })[0];
    if (!e) return notFound();

    var f = NB.fmtDate(e.date);
    var ticket = NB.safeUrl(e.ticketUrl);
    if (ticket && !/^https?:\/\//i.test(ticket)) ticket = '';

    document.title = e.title + ' | NB Club Viseu';
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', e.title + (e.artist ? ' com ' + e.artist : '') + ' no NB Club Viseu' + (f ? ', ' + f.long : '') + '.');

    root.setAttribute('aria-busy', 'false');
    root.innerHTML =
      '<div class="ev-poster" data-reveal>' + NB.media(e.poster, 'Poster de ' + e.title, '') + '</div>' +
      '<div class="ev-body">' +
        '<a class="back" href="index.html#eventos" data-reveal><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg> Todos os eventos</a>' +
        '<p class="eyebrow" data-reveal>' + (e.demo ? 'Conteúdo de demonstração' : (f ? esc(f.wd) : 'Em breve')) + '</p>' +
        '<h1 class="ev-title" data-split="words">' + esc(e.title) + '</h1>' +
        (e.artist ? '<p class="ev-artist" data-reveal>' + esc(e.artist) + '</p>' : '') +
        '<dl class="ev-meta" data-reveal>' +
          '<div><dt>Data</dt><dd>' + (f ? esc(f.long) : 'A anunciar') + '</dd></div>' +
          '<div><dt>Horário</dt><dd>' + (e.time ? esc(e.time) : 'A anunciar') + '</dd></div>' +
          '<div><dt>Local</dt><dd>NB Club<br>Viseu, Portugal<br><a class="link" href="' + esc(C.mapsUrl) + '" target="_blank" rel="noopener">Ver no Google Maps</a></dd></div>' +
        '</dl>' +
        '<div class="prose" data-reveal>' + paragraphs(e.description) + '</div>' +
        '<div class="ev-actions" data-reveal><p class="eyebrow">A tua próxima noite</p><h2>Encontramo-nos na pista.</h2>' + actions(e, ticket) + '</div>' +
        '<div class="ev-guide" data-reveal><div><span class="eyebrow">01 / Planeia</span><h3>Antes de sair</h3><p>Confirma a data e o horário desta noite. Consulta a plataforma de bilhetes para condições de entrada e disponibilidade.</p></div><div><span class="eyebrow">02 / Fala connosco</span><h3>Vens em grupo?</h3><p>Para reservas ou dúvidas, envia uma mensagem ao NB.</p><a class="link" href="' + esc(C.instagram) + '" target="_blank" rel="noopener">Falar no Instagram</a></div></div>' +
        (e.demo ? '<p class="demo-note left">Evento de demonstração. Não corresponde a uma festa real do NB.</p>' : '') +
      '</div>';
    window.NBUI.observe(root);

    /* Dados estruturados para pesquisa (só eventos reais com data) */
    if (f && !e.demo) {
      var ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Event', name: e.title,
        startDate: e.date + (e.time ? 'T' + e.time : ''),
        eventStatus: 'https://schema.org/EventScheduled',
        location: { '@type': 'NightClub', name: 'NB Club Viseu', address: { '@type': 'PostalAddress', addressLocality: 'Viseu', addressCountry: 'PT' } },
        description: e.description || undefined,
        performer: e.artist ? { '@type': 'PerformingGroup', name: e.artist } : undefined
      });
      document.head.appendChild(ld);
    }

    /* Outras noites */
    var others = NB.upcoming(list).filter(function (x) { return x.id !== e.id; }).slice(0, 3);
    if (others.length) {
      document.getElementById('moreList').innerHTML = others.map(function (o) {
        var of = NB.fmtDate(o.date);
        return '<a class="more-item" href="evento.html?id=' + encodeURIComponent(o.id) + '" data-reveal>' +
          '<span class="more-image">' + NB.media(o.poster, 'Poster de ' + o.title, '') + '</span><span class="more-d">' + (of ? of.d + ' ' + of.m : 'EM BREVE') + '</span>' +
          '<span class="more-t">' + esc(o.title) + '</span>' + ARROW + '</a>';
      }).join('');
      document.getElementById('evMore').hidden = false;
      window.NBUI.observe(document.getElementById('evMore'));
    }
  });
})();
