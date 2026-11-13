/* P&L Events — site behavior. No libraries, no server: everything runs in the visitor's browser. */
(function () {
  'use strict';

  var WA_NUMBER = '18623183970'; // main WhatsApp (the number on the catalog QR)
  var GREETING = 'Hola P&L Events! Vi su catálogo en la web. / Hi! I saw your catalog online.';
  var STORE_KEY = 'pl-events-quote-v1';
  var root = document.documentElement;

  function waUrl(text, number) {
    return 'https://wa.me/' + (number || WA_NUMBER) + '?text=' + encodeURIComponent(text);
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // ---------- WhatsApp links get a friendly first message
  $$('a[data-wa]').forEach(function (a) { a.href = waUrl(GREETING, a.getAttribute('data-wa')); });

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------- quote list state (kept only in this browser)
  var catalog = {};
  $$('[data-code]').forEach(function (el) {
    catalog[el.dataset.code] = { name: el.dataset.name, es: el.dataset.es || '' };
    // Screen readers: say which item the button adds; aria-pressed tells if it is in the list.
    $$('.add, .add-mini', el).forEach(function (b) {
      b.setAttribute('aria-label', 'Add ' + el.dataset.code + ' ' + el.dataset.name + ' to your list');
    });
  });

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && Array.isArray(s.items)) {
        return {
          items: s.items.filter(function (c) { return catalog[c]; }),
          date: s.date || '', place: s.place || '', notes: s.notes || ''
        };
      }
    } catch (e) { /* storage blocked or empty */ }
    return { items: [], date: '', place: '', notes: '' };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  var state = load();

  // ---------- header + dock visibility
  var header = $('.site-header');
  var menuBtn = $('.menu-btn');
  var dock = $('#dock');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', y > 8);
    dock.classList.toggle('show', state.items.length > 0 || y > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  function setMenu(open) {
    header.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!header.classList.contains('open')); });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ---------- scroll reveal
  $$('[data-stagger]').forEach(function (group) {
    $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--rd', (i % 4) * 0.09 + 's'); });
  });
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- modal helpers
  function openModal(d) {
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else { d.setAttribute('open', ''); }
    root.classList.add('modal-open');
  }
  function closeModal(d) {
    if (typeof d.close === 'function') { if (d.open) d.close(); } else { d.removeAttribute('open'); }
    root.classList.remove('modal-open');
  }

  // ---------- quote list UI
  var sheet = $('#quote');
  var form = $('#quote-form');
  var listEl = $('#q-items');
  var sendBtn = $('#q-send');
  var countEl = $('.dock-count');
  var fields = { date: form.elements.namedItem('date'), place: form.elements.namedItem('place'), notes: form.elements.namedItem('notes') };

  function fmtDate(v) {
    var p = String(v).split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? v : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  function today() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function buildMessage() {
    var lines = [];
    if (state.items.length) {
      lines.push('Hola P&L Events! Quisiera una cotización. / Hi! I would like a quote:', '');
      state.items.forEach(function (code) { lines.push('• ' + code + ' – ' + catalog[code].name); });
    } else {
      lines.push('Hola P&L Events! Quisiera información. / Hi! I would like some information.');
    }
    var extra = [];
    if (state.date) extra.push('Fecha / Date: ' + fmtDate(state.date));
    if (state.place.trim()) extra.push('Lugar / Place: ' + state.place.trim());
    if (state.notes.trim()) extra.push('Notas / Notes: ' + state.notes.trim());
    if (extra.length) lines.push('', extra.join('\n'));
    return lines.join('\n');
  }

  var itemTpl = '<span class="q-code"></span><span class="q-name"><span></span><i class="es" lang="es"></i></span>' +
    '<button type="button" class="q-rm"><svg class="icon"><use href="#i-x"/></svg></button>';

  function render(bump) {
    $$('[data-code]').forEach(function (host) {
      var on = state.items.indexOf(host.dataset.code) !== -1;
      host.classList.toggle('picked', on);
      $$('.add, .add-mini', host).forEach(function (b) { b.setAttribute('aria-pressed', String(on)); });
    });

    var n = state.items.length;
    countEl.textContent = String(n);
    countEl.setAttribute('aria-label', n + (n === 1 ? ' item' : ' items') + ' in your list');
    dock.classList.toggle('has-items', n > 0);
    if (bump) { countEl.classList.remove('bump'); void countEl.offsetWidth; countEl.classList.add('bump'); }

    listEl.innerHTML = '';
    state.items.forEach(function (code) {
      var li = document.createElement('li');
      li.className = 'q-item';
      li.innerHTML = itemTpl;
      $('.q-code', li).textContent = code;
      $('.q-name span', li).textContent = catalog[code].name;
      $('.q-name i', li).textContent = catalog[code].es;
      var rm = $('.q-rm', li);
      rm.setAttribute('data-remove', code);
      rm.setAttribute('aria-label', 'Remove ' + code + ' from your list');
      listEl.appendChild(li);
    });
    sheet.classList.toggle('empty', n === 0);
    sendBtn.href = waUrl(buildMessage());
    onScroll();
  }

  function toggle(code) {
    var i = state.items.indexOf(code);
    if (i === -1) state.items.push(code); else state.items.splice(i, 1);
    save();
    render(i === -1);
  }

  function openSheet() {
    fields.date.value = state.date;
    fields.place.value = state.place;
    fields.notes.value = state.notes;
    fields.date.min = today();
    setMenu(false);
    openModal(sheet);
  }
  $$('[data-open-quote]').forEach(function (b) { b.addEventListener('click', openSheet); });

  form.addEventListener('input', function () {
    state.date = fields.date.value;
    state.place = fields.place.value;
    state.notes = fields.notes.value;
    save();
    sendBtn.href = waUrl(buildMessage());
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  $('.q-close').addEventListener('click', function () { closeModal(sheet); });
  $('#q-clear').addEventListener('click', function () { state.items = []; save(); render(false); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeModal(sheet); });
  sheet.addEventListener('close', function () { root.classList.remove('modal-open'); });

  // ---------- photo viewer
  var lb = $('#lightbox');
  var lbImg = $('#lb-img');
  var lbCap = $('#lb-cap');
  var lbCount = $('#lb-count');
  var gallery = [];
  var index = 0;
  var caption = '';

  function showPhoto() {
    lbImg.src = 'img/' + gallery[index] + '.webp';
    lbImg.alt = caption + (gallery.length > 1 ? ', photo ' + (index + 1) + ' of ' + gallery.length : '');
    lbImg.classList.remove('swap'); void lbImg.offsetWidth; lbImg.classList.add('swap');
    lbCount.textContent = gallery.length > 1 ? (index + 1) + ' / ' + gallery.length : '';
    lb.classList.toggle('single', gallery.length < 2);
  }
  function openPhotos(el) {
    gallery = el.getAttribute('data-photos').split(/\s+/);
    index = 0;
    var host = el.closest('[data-code]');
    caption = el.getAttribute('data-caption') || (host ? host.dataset.code + ' · ' + host.dataset.name : '');
    lbCap.textContent = caption;
    showPhoto();
    openModal(lb);
  }
  function step(d) {
    if (gallery.length < 2) return;
    index = (index + d + gallery.length) % gallery.length;
    showPhoto();
  }
  $('.lb-prev').addEventListener('click', function () { step(-1); });
  $('.lb-next').addEventListener('click', function () { step(1); });
  $('.lb-close').addEventListener('click', function () { closeModal(lb); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lb-stage')) closeModal(lb);
  });
  lb.addEventListener('close', function () { root.classList.remove('modal-open'); });
  var startX = null;
  lb.addEventListener('pointerdown', function (e) { startX = e.clientX; });
  lb.addEventListener('pointerup', function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
  });

  // ---------- one click handler for the whole page
  document.addEventListener('click', function (e) {
    var t = e.target;
    var add = t.closest('.add, .add-mini');
    if (add) { toggle(add.closest('[data-code]').dataset.code); return; }
    var rm = t.closest('[data-remove]');
    if (rm) { toggle(rm.getAttribute('data-remove')); return; }
    var media = t.closest('[data-photos]');
    if (media) { openPhotos(media); }
  });

  render(false);
  window.PL_READY = true;
})();
