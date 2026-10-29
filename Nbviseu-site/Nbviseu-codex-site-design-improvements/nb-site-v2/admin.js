/* NB Club Viseu — painel de gestão de eventos (frontend)
   AVISO: a palavra-passe e os dados ficam no navegador. Serve para gerir e
   exportar o events.json; NÃO é segurança real. Para autenticação a sério
   liga a um backend/CMS (ver README). */
(function () {
  'use strict';

  var NB = window.NB, esc = NB.esc;
  var $ = function (s) { return document.querySelector(s); };
  var PK = 'nb_admin_v1', SK = 'nb_admin_session';
  var events = [];
  var editingId = null;

  function say(msg, bad) {
    var s = $('#status');
    s.textContent = msg || '';
    s.className = 'adm-status' + (bad ? ' bad' : '');
  }

  /* ---------- Autenticação local ---------- */
  function sha(str) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (b) {
        return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      });
    }
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return Promise.resolve('x' + (h >>> 0).toString(16));
  }
  function getCred() { try { return JSON.parse(localStorage.getItem(PK)); } catch (e) { return null; } }
  function isIn() { try { return sessionStorage.getItem(SK) === '1'; } catch (e) { return false; } }

  function showGate() {
    var cred = getCred();
    $('#gate').hidden = false; $('#panel').hidden = true;
    $('#pw2Wrap').hidden = !!cred;
    $('#pw2').required = !cred;
    $('#gateBtn').textContent = cred ? 'ENTRAR' : 'CRIAR PALAVRA-PASSE';
    $('#gateHelp').textContent = cred
      ? 'Introduz a palavra-passe de administrador.'
      : 'Primeiro acesso: define uma palavra-passe de administrador (mínimo 8 caracteres).';
    $('#pw').focus();
  }

  $('#gateForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var pw = $('#pw').value, cred = getCred();
    if (!cred) {
      if (pw.length < 8) return say('A palavra-passe deve ter pelo menos 8 caracteres.', true);
      if (pw !== $('#pw2').value) return say('As palavras-passe não coincidem.', true);
      var salt = NB.uid() + NB.uid();
      sha(salt + pw).then(function (h) {
        localStorage.setItem(PK, JSON.stringify({ salt: salt, hash: h }));
        sessionStorage.setItem(SK, '1');
        say('Palavra-passe criada.');
        start();
      });
    } else {
      sha(cred.salt + pw).then(function (h) {
        if (h !== cred.hash) return say('Palavra-passe incorreta.', true);
        sessionStorage.setItem(SK, '1');
        say('');
        start();
      });
    }
  });

  $('#logoutBtn').addEventListener('click', function () {
    try { sessionStorage.removeItem(SK); } catch (e) {}
    $('#pw').value = ''; $('#pw2').value = '';
    say('Sessão terminada.');
    showGate();
  });

  /* ---------- Lista ---------- */
  function persist(okMsg) {
    try { NB.saveEvents(events); say(okMsg || 'Guardado neste navegador.'); }
    catch (e) { say('Não foi possível guardar (espaço do navegador cheio). Usa imagens mais pequenas.', true); }
    renderList();
  }

  function renderList() {
    var list = NB.sortEvents(events);
    var box = $('#list');
    if (!list.length) {
      box.innerHTML = '<div class="empty"><p class="empty-t">Ainda não há eventos.</p><p>Cria o primeiro com o botão Novo evento.</p></div>';
      return;
    }
    var today = NB.todayISO();
    box.innerHTML = list.map(function (e) {
      var f = NB.fmtDate(e.date);
      var past = e.date && e.date < today;
      return '<article class="adm-row" data-id="' + esc(e.id) + '">' +
        NB.media(e.poster, '', 'thumb') +
        '<div class="adm-info">' +
          '<h3>' + esc(e.title) + '</h3>' +
          '<p>' + (f ? esc(f.long) : 'Sem data') + (e.time ? ' · ' + esc(e.time) : '') + (e.artist ? ' · ' + esc(e.artist) : '') + '</p>' +
          '<p class="chips"><span class="st ' + (e.published ? 'on' : '') + '">' + (e.published ? 'Publicado' : 'Rascunho') + '</span>' +
          (e.demo ? '<span class="st">Demonstração</span>' : '') + (past ? '<span class="st">Terminado</span>' : '') + '</p>' +
        '</div>' +
        '<div class="adm-actions">' +
          '<button type="button" class="link" data-act="edit">Editar</button>' +
          '<button type="button" class="link" data-act="pub">' + (e.published ? 'Despublicar' : 'Publicar') + '</button>' +
          '<a class="link" href="evento.html?id=' + encodeURIComponent(e.id) + '" target="_blank" rel="noopener">Ver</a>' +
          '<button type="button" class="link danger" data-act="del">Eliminar</button>' +
        '</div></article>';
    }).join('');
  }

  $('#list').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-act]');
    if (!b) return;
    var id = b.closest('.adm-row').getAttribute('data-id');
    var e = events.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    var act = b.getAttribute('data-act');
    if (act === 'edit') openEditor(e);
    if (act === 'pub') { e.published = !e.published; persist(e.published ? 'Evento publicado.' : 'Evento passou a rascunho.'); }
    if (act === 'del') {
      if (window.confirm('Eliminar "' + e.title + '"? Esta ação não pode ser anulada.')) {
        events = events.filter(function (x) { return x.id !== id; });
        persist('Evento eliminado.');
      }
    }
  });

  /* ---------- Editor ---------- */
  function setPreview(src) {
    var p = $('#posterPrev');
    var s = NB.safeUrl(src);
    if (s) { p.innerHTML = NB.media(s, 'Pré-visualização do poster', 'thumb big') + '<button type="button" class="link danger" id="rmPoster">Remover imagem</button>'; p.hidden = false; }
    else { p.innerHTML = ''; p.hidden = true; }
  }
  $('#posterPrev').addEventListener('click', function (ev) {
    if (ev.target.id === 'rmPoster') { $('#f-poster').value = ''; $('#f-file').value = ''; setPreview(''); }
  });
  $('#f-poster').addEventListener('change', function () { setPreview(this.value); });

  $('#f-file').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file) return;
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1000, sc = Math.min(1, max / img.width);
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var data = c.toDataURL('image/jpeg', 0.82);
        $('#f-poster').value = data;
        setPreview(data);
      };
      img.onerror = function () { say('Não foi possível ler essa imagem.', true); };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  });

  function openEditor(e) {
    editingId = e ? e.id : null;
    e = e || { title: '', artist: '', date: '', time: '', poster: '', description: '', ticketUrl: '', doorUrl: '', published: true, demo: false };
    $('#ed-h').textContent = editingId ? 'EDITAR EVENTO.' : 'NOVO EVENTO.';
    $('#f-title').value = e.title; $('#f-artist').value = e.artist || '';
    $('#f-date').value = e.date || ''; $('#f-time').value = e.time || '';
    $('#f-poster').value = e.poster || ''; $('#f-file').value = '';
    $('#f-desc').value = e.description || ''; $('#f-ticket').value = e.ticketUrl || ''; $('#f-door').value = e.doorUrl || '';
    $('#f-pub').checked = !!e.published; $('#f-demo').checked = !!e.demo;
    setPreview(e.poster);
    $('#editor').hidden = false;
    $('#editor').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('#f-title').focus();
  }
  function closeEditor() { $('#editor').hidden = true; editingId = null; }

  $('#newBtn').addEventListener('click', function () { openEditor(null); });
  $('#cancelBtn').addEventListener('click', closeEditor);

  $('#editor').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var title = $('#f-title').value.trim();
    if (!title) { say('O nome do evento é obrigatório.', true); $('#f-title').focus(); return; }
    var ticket = $('#f-ticket').value.trim();
    if (ticket && !/^https?:\/\//i.test(ticket)) { say('A ligação de bilhetes deve começar por https://', true); $('#f-ticket').focus(); return; }
    var door = $('#f-door').value.trim();
    if (door && !/^https?:\/\//i.test(door)) { say('A ligação da bilheteira deve começar por https://', true); $('#f-door').focus(); return; }
    var data = {
      title: title, artist: $('#f-artist').value.trim(), date: $('#f-date').value, time: $('#f-time').value,
      poster: $('#f-poster').value.trim(), description: $('#f-desc').value.trim(), ticketUrl: ticket, doorUrl: door,
      published: $('#f-pub').checked, demo: $('#f-demo').checked
    };
    if (editingId) {
      events = events.map(function (x) { return x.id === editingId ? Object.assign({}, x, data) : x; });
    } else {
      data.id = NB.slug(title) + '-' + NB.uid();
      events.push(data);
    }
    closeEditor();
    persist('Evento guardado.');
  });

  /* ---------- Exportar / importar / repor ---------- */
  $('#exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'events.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    say('events.json exportado. Substitui o ficheiro no alojamento para publicar.');
  });

  $('#importFile').addEventListener('change', function () {
    var f = this.files && this.files[0];
    var input = this;
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var d = JSON.parse(rd.result);
        if (!Array.isArray(d)) throw new Error('formato');
        events = d.filter(function (x) { return x && x.id && x.title; });
        persist('Importados ' + events.length + ' eventos.');
      } catch (e) { say('Ficheiro inválido. Esperado: lista de eventos em JSON.', true); }
      input.value = '';
    };
    rd.readAsText(f);
  });

  $('#resetBtn').addEventListener('click', function () {
    if (!window.confirm('Descartar as alterações deste navegador e voltar ao events.json do site?')) return;
    NB.clearLocal();
    NB.loadBase().then(function (list) { events = list; renderList(); closeEditor(); say('Repostos os eventos do ficheiro.'); });
  });

  /* ---------- Arranque ---------- */
  function start() {
    $('#gate').hidden = true; $('#panel').hidden = false;
    NB.loadEvents().then(function (list) { events = list; renderList(); });
  }

  if (isIn() && getCred()) start(); else showGate();
})();
