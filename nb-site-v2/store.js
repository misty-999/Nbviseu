/* NB Club Viseu — configuração, dados e utilitários partilhados */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIGURAÇÃO — edita aqui os dados reais do NB.
     Campos vazios NÃO aparecem inventados no site: mostram texto neutro.
  ------------------------------------------------------------------ */
  var CONFIG = {
    name: 'NB Club Viseu',
    instagram: 'https://www.instagram.com/nbclubviseu/',
    handle: '@nbclubviseu',
    facebook: '',            // ex.: 'https://www.facebook.com/...'
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=NB+Club+Viseu',
    phone: '',               // ex.: '+351 000 000 000'
    email: '',               // ex.: 'reservas@...'
    hours: '',               // ex.: 'Qui a Sáb · 23h – 06h'
    // Códigos das publicações do Instagram a incorporar.
    // Em instagram.com/p/ABC123/ o código é ABC123.
    instagramPosts: [],
    // Mostra avisos discretos nos conteúdos de demonstração (põe false quando tiveres fotos/eventos reais)
    showDemoNotes: true,
    // Bilhetes: a pré-venda é por evento (campo "ligação de bilhetes" no painel).
    // No próprio dia do evento a compra faz-se na bilheteira habitual.
    // Como a plataforma muda, a ligação pode ser definida aqui ou por evento (doorUrl).
    ticketing: {
      doorProvider: 'Ticketline',
      doorUrl: ''            // ex.: ligação da bilheteira atual; vazio = só mostra o aviso
    },
    media: {
      heroVideo: 'media/hero.mp4',
      heroVideoMobile: 'media/hero-mobile.mp4'
    }
  };

  /* Álbuns da galeria (um por festa/noite). date: 'AAAA-MM-DD' ou '' */
  var ALBUMS = [
    { id: 'a', name: 'Álbum A (exemplo)', date: '' },
    { id: 'b', name: 'Álbum B (exemplo)', date: '' },
    { id: 'c', name: 'Álbum C (exemplo)', date: '' }
  ];

  /* Fotografias de EXEMPLO geradas para o layout. Substitui os ficheiros em media/
     pelas fotografias reais do NB (mesmos nomes) e ajusta álbuns, legendas e formatos. */
  var PHOTOS = [
    { src: 'media/galeria-01.jpg', album: 'a', ratio: 'r-tall', alt: 'Imagem de exemplo: luzes e público' },
    { src: 'media/galeria-02.jpg', album: 'a', ratio: 'r-wide', alt: 'Imagem de exemplo: feixes de luz sobre a pista' },
    { src: 'media/galeria-03.jpg', album: 'b', ratio: 'r-sq', alt: 'Imagem de exemplo: ambiente da noite' },
    { src: 'media/galeria-04.jpg', album: 'c', ratio: 'r-tall', alt: 'Imagem de exemplo: luzes' },
    { src: 'media/galeria-05.jpg', album: 'b', ratio: 'r-wide', alt: 'Imagem de exemplo: pista cheia' },
    { src: 'media/galeria-06.jpg', album: 'a', ratio: 'r-sq', alt: 'Imagem de exemplo: público' },
    { src: 'media/galeria-07.jpg', album: 'c', ratio: 'r-tall', alt: 'Imagem de exemplo: feixes de luz' },
    { src: 'media/galeria-08.jpg', album: 'b', ratio: 'r-wide', alt: 'Imagem de exemplo: pista' },
    { src: 'media/galeria-09.jpg', album: 'c', ratio: 'r-wide', alt: 'Imagem de exemplo: noite' }
  ];

  /* Eventos de EXEMPLO — identificados como tal e SEM datas oficiais. */
  var DEFAULT_EVENTS = [
    {
      id: 'funkween-mc-danny', title: 'Funkween', artist: 'MC Danny',
      date: '2026-10-30', time: '23:00', poster: 'media/poster-funkween.jpg',
      ticketUrl: 'https://2ticket.pt/faveladona/events-list', doorUrl: '', published: true, demo: false,
      description: 'Funkween com MC Danny, no NB Club Viseu.'
    },
    {
      id: 'exemplo-1', title: 'Pulsar', artist: 'DJ a anunciar',
      date: '', time: '', poster: 'media/poster-exemplo-1.jpg', ticketUrl: '', published: true, demo: true,
      description: 'Conteúdo de exemplo para mostrar como aparece um evento no site. Substitui-o pelos eventos reais no painel de administração.'
    },
    {
      id: 'exemplo-2', title: 'Ritual', artist: 'Artistas a anunciar',
      date: '', time: '', poster: 'media/poster-exemplo-2.webp', ticketUrl: '', published: true, demo: true,
      description: 'Conteúdo de exemplo, sem data oficial. Não corresponde a nenhuma festa real do NB.'
    },
    {
      id: 'exemplo-3', title: 'Até tarde', artist: 'Convidados a anunciar',
      date: '', time: '', poster: 'media/poster-exemplo-3.webp', ticketUrl: '', published: true, demo: true,
      description: 'Conteúdo de exemplo. Quando existirem eventos reais, adiciona o poster, a data, o horário e a ligação para bilhetes ou reservas.'
    },
    {
      id: 'exemplo-4', title: 'Luz vermelha', artist: 'Alinhamento a anunciar',
      date: '', time: '', poster: 'media/poster-exemplo-4.webp', ticketUrl: '', published: true, demo: true,
      description: 'Evento visual de demonstração. Substitui este conteúdo quando anunciares a próxima noite.'
    },
    {
      id: 'exemplo-5', title: 'Sessão 1998', artist: 'Convidados a anunciar',
      date: '', time: '', poster: 'media/poster-exemplo-5.webp', ticketUrl: '', published: true, demo: true,
      description: 'Evento visual de demonstração. Substitui este conteúdo quando anunciares a próxima noite.'
    }
  ];

  var KEY = 'nb_events_v1';
  var MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  var MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Só permite URLs seguras (bloqueia javascript: etc.) */
  function safeUrl(u) {
    u = String(u || '').trim();
    return /^(https?:\/\/|mailto:|tel:|media\/|\.\/media\/|data:image\/)/i.test(u) ? u : '';
  }

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(y, mo - 1, d);
    if (dt.getMonth() !== mo - 1) return null;
    return {
      d: ('0' + d).slice(-2), m: MONTHS[mo - 1], y: String(y),
      wd: WEEKDAYS[dt.getDay()],
      long: d + ' de ' + MONTHS_LONG[mo - 1] + ' de ' + y
    };
  }

  function todayISO() {
    var n = new Date();
    return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2);
  }

  function sortEvents(list) {
    return list.slice().sort(function (a, b) {
      if (a.date && b.date) return (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });
  }

  /* Eventos publicados e ainda por acontecer (ou sem data) */
  function upcoming(list) {
    var t = todayISO();
    return sortEvents(list.filter(function (e) {
      return e.published && (!e.date || e.date >= t);
    }));
  }

  /* Nome da plataforma a partir da ligação (só as que conhecemos) */
  function ticketProvider(url) {
    var h = '';
    try { h = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
    if (/ticketline/i.test(h)) return 'Ticketline';
    if (/2ticket/i.test(h)) return '2Ticket';
    return '';
  }

  function uid() { return Math.random().toString(36).slice(2, 8); }

  function slug(s) {
    return String(s || 'evento').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'evento';
  }

  function readLocal() {
    try { var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; }
  }

  /* Ordem: alterações locais do admin -> events.json -> demonstração embebida */
  function loadEvents() {
    var local = readLocal();
    if (Array.isArray(local)) return Promise.resolve(local);
    return fetch('events.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (d) { return Array.isArray(d) ? d : (d.events || []); })
      .catch(function () { return DEFAULT_EVENTS.slice(); });
  }

  function loadBase() {
    return fetch('events.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (d) { return Array.isArray(d) ? d : (d.events || []); })
      .catch(function () { return DEFAULT_EVENTS.slice(); });
  }

  function saveEvents(list) { localStorage.setItem(KEY, JSON.stringify(list)); }
  function clearLocal() { try { localStorage.removeItem(KEY); } catch (e) {} }
  function hasLocal() { return readLocal() !== null; }

  /* Imagem com espaço reservado quando o ficheiro não existe */
  function media(src, alt, cls) {
    var s = safeUrl(src);
    return '<span class="media ' + (cls || '') + (s ? '' : ' is-missing') + '">' +
      (s ? '<img src="' + esc(s) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async" ' +
        'onerror="this.parentNode.classList.add(\'is-missing\');this.remove()">' : '') +
      '</span>';
  }

  window.NB = {
    CONFIG: CONFIG, ALBUMS: ALBUMS, PHOTOS: PHOTOS, DEFAULT_EVENTS: DEFAULT_EVENTS,
    esc: esc, safeUrl: safeUrl, fmtDate: fmtDate, todayISO: todayISO,
    sortEvents: sortEvents, upcoming: upcoming, ticketProvider: ticketProvider, uid: uid, slug: slug,
    loadEvents: loadEvents, loadBase: loadBase, saveEvents: saveEvents,
    clearLocal: clearLocal, hasLocal: hasLocal, media: media
  };
})();
