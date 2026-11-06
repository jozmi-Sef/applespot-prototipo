/* =========================================================
   AppleSpot · Lógica compartida
   Cabecera, pie, carrito, buscador, animaciones y páginas.
   ========================================================= */
(() => {
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const C = AS.config;
const page = document.body.dataset.page || '';
const params = new URLSearchParams(location.search);

/* TEMAS DE PRUEBA (borrar al elegir uno): ?tema=a|b|c, se recuerda al navegar */
(() => {
  const q = (params.get('tema') || '').toLowerCase();
  const keys = ['a', 'b', 'd', 'e', 'c'];
  if (keys.includes(q)) localStorage.setItem('as_theme', q);
  const t = localStorage.getItem('as_theme') || 'd';
  document.documentElement.dataset.theme = t;
  const names = { a: 'Negro', b: 'Grafito cálido', d: 'Azul noche', e: 'Espresso', c: 'Portada clara' };
  const link = k => { const u = new URLSearchParams(location.search); u.set('tema', k); return '?' + u; };
  const ui = document.createElement('div');
  ui.className = 'theme-sw'; ui.setAttribute('aria-label', 'Tema de prueba');
  ui.innerHTML = `<span>Tema: ${names[t]}</span>${keys.map(k => `<a href="${link(k)}" aria-current="${k === t}" title="${names[k]}">${k.toUpperCase()}</a>`).join('')}`;
  document.body.appendChild(ui);
})();
const fmt = n => 'S/ ' + Number(n).toLocaleString('en-US');
const wa = (txt = '') => `https://wa.me/${C.whatsapp}${txt ? '?text=' + encodeURIComponent(txt) : ''}`;
const launchActive = () => new Date() < new Date(C.launchEnds);
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};
AS.$ = $; AS.$$ = $$; AS.fmt = fmt; AS.wa = wa;

/* ---------- iPhone dibujado (genérico; reemplazar por foto real) ---------- */
let uid = 0;
const camsFor = p => /Air/.test(p.name) ? 1 : /Pro/.test(p.name) ? 3 : 2;
function phoneSVG(fk = 'cosmic', side = 'back', cls = 'ph', cams = 3) {
  const f = AS.finishes[fk] || AS.finishes.cosmic, id = 'g' + (++uid);
  const defs = `<defs><linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f.a}"/><stop offset="1" stop-color="${f.b}"/></linearGradient><linearGradient id="${id}e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${f.a}"/><stop offset=".5" stop-color="${f.b}"/><stop offset="1" stop-color="${f.a}"/></linearGradient><radialGradient id="${id}l" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#3B4A6B"/><stop offset=".35" stop-color="#0D1220"/><stop offset="1" stop-color="#000"/></radialGradient><linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBCB10"/><stop offset=".5" stop-color="#F38B1A"/><stop offset="1" stop-color="#4A1A06"/></linearGradient></defs>`;
  const cam = (x, y) => `<g transform="translate(${x} ${y})"><circle r="28" fill="#1A1A1A"/><circle r="22" fill="url(#${id}l)"/><circle r="8" fill="#0A0A0A"/><circle cx="-7" cy="-7" r="4" fill="#fff" opacity=".35"/></g>`;
  const edge = `<rect x="2" y="2" width="296" height="616" rx="54" fill="url(#${id}e)"/>`;
  let body;
  if (side === 'back') {
    const lenses = cams === 3 ? cam(78, 72) + cam(78, 140) + cam(146, 106) : cams === 2 ? cam(78, 72) + cam(78, 140) : cam(78, 90);
    const plate = cams === 1 ? `<rect x="22" y="40" width="256" height="100" rx="50" fill="#000" opacity=".16"/>` : `<rect x="22" y="22" width="${cams === 3 ? 256 : 128}" height="168" rx="40" fill="#000" opacity=".16"/>`;
    body = `${edge}<rect x="8" y="8" width="284" height="604" rx="48" fill="url(#${id}a)"/>${plate}${lenses}<circle cx="${cams === 3 ? 226 : 128}" cy="${cams === 1 ? 90 : 72}" r="${cams === 3 ? 11 : 8}" fill="#F4E9D6" opacity=".9"/><circle cx="150" cy="380" r="22" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="3"/>`;
  } else {
    body = `${edge}<rect x="8" y="8" width="284" height="604" rx="48" fill="#050505"/><rect x="18" y="18" width="264" height="584" rx="40" fill="url(#${id}s)"/><rect x="112" y="34" width="76" height="22" rx="11" fill="#050505"/><text x="150" y="150" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="600" font-size="58" fill="#fff">10:47</text><text x="150" y="182" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="500" font-size="15" fill="#fff" opacity=".85">miércoles, 4 de noviembre</text><rect x="40" y="520" width="52" height="52" rx="26" fill="#fff" opacity=".2"/><rect x="208" y="520" width="52" height="52" rx="26" fill="#fff" opacity=".2"/>`;
  }
  return `<svg class="${cls}" viewBox="0 0 300 620" aria-hidden="true">${defs}${body}</svg>`;
}
AS.phoneSVG = phoneSVG;

/* ---------- Catálogo: utilidades ---------- */
const condTxt = { nuevo: 'Nuevo sellado', seminuevo: 'Seminuevo', exhibicion: 'Exhibición' };
const warrantyTxt = c => c === 'nuevo' ? 'Garantía 1 año' : 'Garantía 6 meses';
const deliveryTxt = s => s === 'pedido' ? 'A pedido, 6 a 7 días' : 'En stock, 3 a 5 días';
const minPrice = p => Math.min(...Object.values(p.prices).map(v => v[0]));
const firstOpt = p => Object.keys(p.prices)[0];
const findAny = id => AS.products.find(p => p.id === id) || AS.accessories.find(a => a.id === id);
const accIcon = a => (AS.accessorySubs[a.sub] || {}).icon || 'plug';
AS.findAny = findAny;
AS.util = { condTxt, warrantyTxt, deliveryTxt, minPrice, firstOpt, camsFor, accIcon, launchActive, params, store };

function iphoneCard(p) {
  const opt = firstOpt(p), [pr, old] = p.prices[opt], fk = p.finishes[0];
  const gift = launchActive() ? (p.airpods ? 'Cubo 20W + AirPods de regalo' : 'Cubo 20W de regalo') : '';
  return `<article class="card rv" data-id="${p.id}">
    <div class="card-media">${p.badge ? `<span class="tag ${p.airpods ? 'gold' : ''}">${p.badge}</span>` : ''}${p.stock === 'pedido' ? '<span class="tag r">A pedido</span>' : ''}${phoneSVG(fk, 'back', 'ph', camsFor(p))}</div>
    <div class="card-body">
      <h3><a href="producto.html?id=${p.id}">${p.name}</a></h3>
      <p class="meta"><span class="cond ${p.condition}"><i class="ph-fill ph-circle"></i>${condTxt[p.condition]}</span> · ${warrantyTxt(p.condition)}</p>
      <div class="swatches" role="group" aria-label="Color">${p.finishes.map((f, i) => `<button class="sw" aria-pressed="${i === 0}" style="background:${AS.finishes[f].dot}" aria-label="${AS.finishes[f].name}" data-f="${f}"></button>`).join('')}</div>
      <div class="price">${Object.keys(p.prices).length > 1 ? '<small>Desde</small>' : ''}<b>${fmt(pr)}</b><s>${fmt(old)}</s></div>
      <ul class="perks">${p.battery ? `<li><i class="ph ph-battery-high"></i>Batería ${p.battery}% · Grado ${p.grade}</li>` : ''}<li><i class="ph ph-truck"></i>Envío gratis · ${deliveryTxt(p.stock)}</li>${gift ? `<li><i class="ph ph-gift"></i>${gift}</li>` : ''}</ul>
      <div class="card-actions"><button class="btn btn-dark btn-sm" data-add="${p.id}">Agregar</button><a class="wa" href="${wa('Hola, quiero información del ' + p.name)}" target="_blank" rel="noopener" aria-label="Consultar ${p.name} por WhatsApp"><i class="ph ph-whatsapp-logo"></i></a></div>
    </div></article>`;
}
function accCard(a) {
  const off = Math.round((1 - a.price / a.old) * 100);
  return `<article class="card rv" data-id="${a.id}">
    <div class="card-media">${a.best ? '<span class="tag">Más vendido</span>' : ''}<i class="ph ph-${accIcon(a)} acc-big" aria-hidden="true"></i></div>
    <div class="card-body">
      <h3><a href="producto.html?id=${a.id}">${a.name}</a></h3>
      <p class="meta">${AS.accessorySubs[a.sub].name}</p>
      <div class="price"><b>${fmt(a.price)}</b><s>${fmt(a.old)}</s><span class="off">${off}% menos</span></div>
      <ul class="perks"><li><i class="ph ph-tag"></i>10% extra en tu primera compra</li></ul>
      <div class="card-actions"><button class="btn btn-dark btn-sm" data-add="${a.id}">Agregar</button><a class="wa" href="${wa('Hola, quiero información de: ' + a.name)}" target="_blank" rel="noopener" aria-label="Consultar por WhatsApp"><i class="ph ph-whatsapp-logo"></i></a></div>
    </div></article>`;
}
const skeletons = n => Array.from({ length: n }, () => `<div class="card skeleton" aria-hidden="true"><div class="card-media"></div><div class="sk w60"></div><div class="sk w40"></div><div class="sk h32"></div></div>`).join('');
AS.iphoneCard = iphoneCard; AS.accCard = accCard; AS.skeletons = skeletons;

/* Interacción de tarjetas (delegada) */
document.addEventListener('click', e => {
  const sw = e.target.closest('.card .sw');
  if (sw) {
    const card = sw.closest('.card'), p = findAny(card.dataset.id);
    $$('.sw', card).forEach(x => x.setAttribute('aria-pressed', x === sw));
    $('.card-media svg', card).outerHTML = phoneSVG(sw.dataset.f, 'back', 'ph', camsFor(p));
    return;
  }
  const add = e.target.closest('[data-add]');
  if (add) {
    const card = add.closest('.card'), p = findAny(add.dataset.add);
    const f = card ? $('.sw[aria-pressed="true"]', card)?.dataset.f : null;
    Cart.add(p, { finish: f });
  }
});

/* ---------- Carrito ---------- */
const Cart = {
  items: () => store.get('as_cart', []),
  save(items) { store.set('as_cart', items); Cart.paint(); },
  count: () => Cart.items().reduce((s, i) => s + i.qty, 0),
  add(p, { opt, finish, qty = 1, silent } = {}) {
    const items = Cart.items();
    let line;
    if (p.type === 'iphone') {
      opt = opt || firstOpt(p); finish = finish || p.finishes[0];
      line = { key: `${p.id}|${opt}|${finish}`, id: p.id, type: 'iphone', name: p.name, opt, finish, price: p.prices[opt][0], qty };
    } else if (p.items) {
      line = { key: p.id, id: p.id, type: 'combo', name: p.name, price: p.price, qty, icon: p.icon };
    } else {
      line = { key: p.id, id: p.id, type: 'accesorio', name: p.name, price: p.price, qty, icon: accIcon(p) };
    }
    const ex = items.find(i => i.key === line.key);
    ex ? ex.qty += qty : items.push(line);
    Cart.save(items);
    const b = $('#cartCount'); if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    if (!silent) toast(`${line.name}${line.opt ? ' de ' + line.opt : ''} agregado al carrito`, { href: 'carrito.html', label: 'Ver carrito' });
  },
  setQty(key, q) { const items = Cart.items(); const i = items.find(x => x.key === key); if (!i) return; i.qty = Math.max(1, Math.min(5, q)); Cart.save(items); },
  remove(key) { Cart.save(Cart.items().filter(i => i.key !== key)); },
  clear() { Cart.save([]); store.set('as_coupon', null); },
  gifts(items = Cart.items()) {
    if (!launchActive()) return [];
    const g = [];
    const phones = items.filter(i => i.type === 'iphone');
    const n = phones.reduce((s, i) => s + i.qty, 0);
    if (n) g.push({ name: 'Cubo 20W original', qty: n, icon: 'plug' });
    const ap = phones.filter(i => findAny(i.id)?.airpods).reduce((s, i) => s + i.qty, 0);
    if (ap) g.push({ name: 'AirPods', qty: ap, icon: 'headphones' });
    return g;
  },
  totals(shipping = null) {
    const items = Cart.items();
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
    const accSub = items.filter(i => i.type !== 'iphone').reduce((s, i) => s + i.price * i.qty, 0);
    const coupon = store.get('as_coupon', null);
    const disc = coupon === C.coupon.code ? Math.round(accSub * C.coupon.pct / 100) : 0;
    const hasPhone = items.some(i => i.type === 'iphone');
    const ship = hasPhone ? 0 : (shipping ?? null);
    return { items, sub, disc, hasPhone, ship, total: sub - disc + (ship || 0), coupon };
  },
  paint() {
    const n = Cart.count(), b = $('#cartCount');
    if (b) { b.textContent = n; b.classList.toggle('on', n > 0); }
  }
};
AS.Cart = Cart;

/* ---------- Aviso ---------- */
function toast(txt, link) {
  const t = $('#toast');
  t.innerHTML = `<i class="ph-fill ph-check-circle"></i><span>${txt}</span>${link ? `<a href="${link.href}">${link.label}</a>` : ''}`;
  t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3200);
}
AS.toast = toast;

/* ---------- Cabecera, menú, pie ---------- */
const navItems = [
  ['index.html', 'Inicio', 'home'], ['iphone.html', 'iPhone', 'iphone'], ['accesorios.html', 'Accesorios', 'accesorios'],
  ['ofertas.html', 'Ofertas', 'ofertas']
];
/* Enlaces secundarios: van en el pie y en el menú de celular, no en la cabecera */
const navMore = [['preguntas.html', 'Preguntas', 'preguntas'], ['tienda.html', 'Tienda', 'tienda'], ['nosotros.html', 'Nosotros', 'nosotros']];
function shell() {
  const cur = k => page === k ? ' aria-current="page"' : '';
  document.body.insertAdjacentHTML('afterbegin', `
  <a class="skip" href="#main">Saltar al contenido</a>
  <div class="announce" role="region" aria-label="Anuncios"><div class="announce-track">${AS.announcements.map((a, i) => `<span class="${i === 0 ? 'on' : ''}">${a}</span>`).join('')}</div></div>
  <header class="nav"><nav class="nav-bar" aria-label="Principal">
    <a href="index.html" class="brand" aria-label="AppleSpot, inicio"><span class="tile"><img src="assets/isotipo.png" alt=""></span><span><em>Apple</em>Spot</span></a>
    <ul class="nav-links">${navItems.map(([h, l, k]) => `<li><a href="${h}"${cur(k)}${k === 'ofertas' ? ' class="hot"' : ''}>${l}</a></li>`).join('')}</ul>
    <div class="nav-icons">
      <button class="icon-btn" aria-label="Buscar" id="searchBtn"><i class="ph ph-magnifying-glass"></i></button>
      <a class="icon-btn hide-m" href="cuenta.html" aria-label="Mi cuenta"${cur('cuenta')}><i class="ph ph-user"></i></a>
      <a class="icon-btn" href="carrito.html" aria-label="Carrito"${cur('carrito')}><i class="ph ph-handbag"></i><span class="badge" id="cartCount">0</span></a>
      <button class="icon-btn menu-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobilePanel" id="menuBtn"><span class="bars"><i></i><i></i><i></i></span></button>
    </div></nav></header>
  <div class="mobile-panel" id="mobilePanel" aria-hidden="true">${[...navItems, ...navMore].map(([h, l, k]) => `<a href="${h}"${cur(k)}>${l}</a>`).join('')}<a href="cuenta.html"${cur('cuenta')}>Mi cuenta</a></div>
  <div class="search-pop" id="searchPop" role="dialog" aria-modal="true" aria-label="Buscar productos"><div class="search-box"><div class="in"><i class="ph ph-magnifying-glass"></i><input id="searchIn" type="search" placeholder="Busca iPhone 17 Pro, cubo 20W, case…" autocomplete="off"><button class="icon-btn" style="color:var(--ink)" id="searchClose" aria-label="Cerrar buscador"><i class="ph ph-x"></i></button></div><div class="search-res" id="searchRes"></div></div></div>`);

  document.body.insertAdjacentHTML('beforeend', `
  <footer class="site"><div class="wrap">
    <div class="foot">
      <div><img src="assets/logo-dark.png" alt="AppleSpot"><p style="margin-top:16px;max-width:280px">Venta de iPhone y accesorios originales en Piura, con envío a todo el Perú.</p><a class="reclamo" href="reclamaciones.html"><i class="ph ph-book-open-text"></i>Libro de Reclamaciones</a></div>
      <div><h4>Tienda</h4><ul><li><a href="iphone.html">iPhone</a></li><li><a href="iphone.html?estado=nuevo">Nuevos sellados</a></li><li><a href="iphone.html?estado=seminuevo">Seminuevos</a></li><li><a href="accesorios.html">Accesorios</a></li><li><a href="ofertas.html">Ofertas</a></li></ul></div>
      <div><h4>Ayuda</h4><ul><li><a href="preguntas.html">Preguntas frecuentes</a></li><li><a href="legal.html#envios">Política de envíos</a></li><li><a href="legal.html#cambios">Garantía y devoluciones</a></li><li><a href="cuenta.html">Mi cuenta y pedidos</a></li><li><a href="tienda.html">Tienda física</a></li><li><a href="nosotros.html">Nosotros</a></li></ul></div>
      <div><h4>Contacto</h4><ul><li><a href="${wa()}" target="_blank" rel="noopener">WhatsApp ${C.whatsappLabel}</a></li><li><a href="${C.instagram}" target="_blank" rel="noopener">Instagram</a></li><li><a href="${C.tiktok}" target="_blank" rel="noopener">TikTok</a></li><li><a href="${C.facebook}" target="_blank" rel="noopener">Facebook</a></li><li><a href="tienda.html">${C.address}</a></li></ul></div>
    </div>
    <div class="legal-bar"><span>© 2026 AppleSpot · RUC ${C.ruc} · <a href="legal.html#terminos">Términos y condiciones</a> · <a href="legal.html#privacidad">Privacidad (Ley N.° 29733)</a> · <a href="reclamaciones.html">Libro de Reclamaciones</a></span><span class="legal-logos"><span>Visa</span><span>Mastercard</span><span>Culqi</span></span></div>
  </div></footer>
  ${page === 'checkout' ? '' : `<a class="wa-float" href="${wa('Hola AppleSpot, tengo una consulta')}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp"><i class="ph ph-whatsapp-logo"></i><span>¿Dudas? Escríbenos</span></a>`}
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`);

  // Menú móvil (entrada escalonada 60ms, tope 400ms)
  const menuBtn = $('#menuBtn'), panel = $('#mobilePanel');
  $$('a', panel).forEach((a, i) => a.style.transitionDelay = Math.min(i * 60, 400) + 'ms');
  const toggle = open => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    panel.setAttribute('aria-hidden', !open);
  };
  menuBtn.addEventListener('click', () => toggle(!document.body.classList.contains('menu-open')));

  // Anuncios rotativos
  const ann = $$('.announce-track span'); let ai = 0;
  if (ann.length > 1) setInterval(() => { ann[ai].classList.remove('on'); ai = (ai + 1) % ann.length; ann[ai].classList.add('on'); }, 4000);

  // Buscador
  const pop = $('#searchPop'), sin = $('#searchIn'), res = $('#searchRes');
  const all = [...AS.products.map(p => ({ n: p.name, d: condTxt[p.condition] + ' · desde ' + fmt(minPrice(p)), h: 'producto.html?id=' + p.id })),
               ...AS.accessories.map(a => ({ n: a.name, d: AS.accessorySubs[a.sub].name + ' · ' + fmt(a.price), h: 'producto.html?id=' + a.id }))];
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const run = () => {
    const q = norm(sin.value.trim());
    const list = q ? all.filter(x => norm(x.n + ' ' + x.d).includes(q)).slice(0, 8) : all.filter((x, i) => i < 4);
    res.innerHTML = list.length ? list.map(x => `<a href="${x.h}"><b>${x.n}</b><span>${x.d}</span></a>`).join('')
      : `<p class="search-empty">No encontramos “${sin.value}”. Prueba con el modelo, por ejemplo “17 Pro”, o <a href="${wa('Hola, busco: ' + sin.value)}" style="text-decoration:underline">pregúntanos por WhatsApp</a>.</p>`;
  };
  const openS = o => { pop.classList.toggle('on', o); if (o) { run(); setTimeout(() => sin.focus(), 50); } };
  $('#searchBtn').addEventListener('click', () => openS(true));
  $('#searchClose').addEventListener('click', () => openS(false));
  pop.addEventListener('click', e => { if (e.target === pop) openS(false); });
  sin.addEventListener('input', run);
  addEventListener('keydown', e => { if (e.key === 'Escape') { openS(false); toggle(false); } if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openS(true); } });

  Cart.paint();
}

/* ---------- Animaciones de entrada ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
const reveal = (root = document) => $$('.rv:not(.in)', root).forEach(el => io.observe(el));
AS.reveal = reveal;

/* Scroll compartido, limitado por requestAnimationFrame */
const scrollFns = [];
let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { scrollFns.forEach(f => f()); ticking = false; }); } }, { passive: true });
addEventListener('resize', () => scrollFns.forEach(f => f()));
AS.onScroll = f => { scrollFns.push(f); f(); };

/* Tagline palabra por palabra */
AS.tagline = el => {
  el.innerHTML = [...el.childNodes].map(n => n.nodeType === 3
    ? n.textContent.split(/(\s+)/).map(w => w.trim() ? `<span class="w">${w}</span>` : w).join('')
    : `<span class="w hl">${n.textContent}</span>`).join('');
  const words = $$('.w', el);
  AS.onScroll(() => { const line = innerHeight * .62; words.forEach(w => w.classList.toggle('on', w.getBoundingClientRect().top < line)); });
};

/* Cuenta regresiva */
AS.countdown = root => {
  const tick = () => {
    const ms = Math.max(0, new Date(C.launchEnds) - new Date());
    $$('[data-cd]', root).forEach(el => {
      const v = { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60 }[el.dataset.cd];
      el.textContent = el.dataset.cd === 'd' ? v : String(v).padStart(2, '0');
    });
  };
  tick(); setInterval(tick, 30000);
};
const countdownHTML = `<div class="countdown" aria-label="Tiempo restante de la promoción"><div><b data-cd="d">00</b><small>días</small></div><div><b data-cd="h">00</b><small>horas</small></div><div><b data-cd="m">00</b><small>min</small></div></div>`;
AS.countdownHTML = countdownHTML;

/* ---------- Carrusel de promociones ---------- */
AS.promoCarousel = (root, promos = AS.promos) => {
  const art = p => {
    if (p.visual === 'phones') return `<div class="glow"></div><div class="art-phones">${phoneSVG('cosmic', 'front', 'b')}${phoneSVG(p.color || 'cosmic', 'back', 'f')}</div>`;
    if (p.visual === 'gift') return `<div class="glow"></div><div class="art-gift"><div class="gift-card"><i class="ph ph-device-mobile"></i><div><b>Tu iPhone</b><small>Cualquier modelo</small></div></div><div class="gift-card plus">+</div><div class="gift-card"><i class="ph ph-plug"></i><div><b>Cubo 20W</b><small>Original, de regalo</small></div></div><div class="gift-card plus">+</div><div class="gift-card"><i class="ph ph-headphones"></i><div><b>AirPods</b><small>Del 17 Pro al 18 Pro Max</small></div></div></div>`;
    if (p.visual === 'accessories') return `<div class="glow"></div><div class="art-acc"><div><i class="ph ph-plug"></i></div><div><i class="ph ph-lightning"></i></div><div><i class="ph ph-device-mobile"></i></div><div><i class="ph ph-usb"></i></div></div>`;
    return '';
  };
  root.innerHTML = `<div class="promo-track">${promos.map((p, i) => {
    const H = i === 0 ? 'h1' : 'h2';
    if (p.visual === 'image') return `<div class="slide image-slide${i === 0 ? ' on' : ''}" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${promos.length}"><picture><source media="(max-width:860px)" srcset="${p.imageMobile || p.image}"><img src="${p.image}" alt="${p.title}"></picture><div class="copy"><a href="${p.href}" class="btn btn-primary">${p.cta} <i class="ph ph-arrow-right"></i></a></div></div>`;
    return `<div class="slide${i === 0 ? ' on' : ''}" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${promos.length}">
      <div class="wrap copy">
        <p class="kicker">${p.kicker}</p>
        <${H} class="t">${p.title}<span class="accent">${p.accent}</span></${H}>
        <p class="sub">${p.sub}</p>
        ${p.countdown ? countdownHTML : ''}
        <div class="ctas"><a href="${p.href}" class="btn btn-primary">${p.cta} <i class="ph ph-arrow-right"></i></a>${p.secondary ? `<a href="${p.secondary.href}" class="btn btn-ghost">${p.secondary.label} <i class="ph ph-caret-right"></i></a>` : ''}</div>
      </div>
      <div class="slide-art" aria-hidden="true">${art(p)}</div></div>`;
  }).join('')}</div>
  <div class="promo-ui"><div class="dots" role="tablist" aria-label="Promociones">${promos.map((p, i) => `<button class="dot-btn${i === 0 ? ' on' : ''}" role="tab" aria-selected="${i === 0}" aria-label="Ver promoción: ${p.title}"><i></i></button>`).join('')}</div><button class="pp" aria-label="Pausar carrusel"><i class="ph-fill ph-pause"></i></button></div>`;
  AS.countdown(root);
  const slides = $$('.slide', root), dots = $$('.dot-btn', root), pp = $('.pp', root);
  const DUR = 6500; root.style.setProperty('--dur', DUR + 'ms');
  let cur = 0, timer, paused = false, hover = false, start = 0, left = DUR;
  const go = i => {
    slides[cur].classList.remove('on'); dots[cur].classList.remove('on'); dots[cur].setAttribute('aria-selected', false);
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('on'); dots[cur].setAttribute('aria-selected', true);
    void dots[cur].offsetWidth; dots[cur].classList.add('on');
    left = DUR; schedule();
  };
  const schedule = () => { clearTimeout(timer); if (paused || hover) return; start = Date.now(); timer = setTimeout(() => go(cur + 1), left); };
  const hold = h => { hover = h; root.classList.toggle('paused', paused || hover); if (h) { clearTimeout(timer); left -= Date.now() - start; } else schedule(); };
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  pp.addEventListener('click', () => {
    paused = !paused; root.classList.toggle('paused', paused);
    pp.innerHTML = paused ? '<i class="ph-fill ph-play"></i>' : '<i class="ph-fill ph-pause"></i>';
    pp.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
    paused ? (clearTimeout(timer), left -= Date.now() - start) : schedule();
  });
  root.addEventListener('mouseenter', () => hold(true));
  root.addEventListener('mouseleave', () => hold(false));
  root.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
  let sx = null;
  root.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') sx = e.clientX; });
  root.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 48) go(cur + (dx < 0 ? 1 : -1)); sx = null; });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { paused = true; pp.innerHTML = '<i class="ph-fill ph-play"></i>'; }
  schedule();
};

/* ---------- Giro 3D con scroll ---------- */
AS.spin = root => {
  const scene = $('.spin-scene', root), end = $('.spin-end', root), intro = $('.spin-intro', root), bar = $('.spin-bar i', root);
  const calls = $$('.callout', root);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = v => Math.max(0, Math.min(1, v));
  let video = null, phone = null;
  /* Celular: sin giro con scroll. Video en bucle (C.mobileVideo) o iPhone fijo */
  if (matchMedia('(max-width: 860px)').matches) {
    root.classList.add('spin-m');
    const reduceM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    scene.innerHTML = C.mobileVideo
      ? `<video class="spin-mvideo" src="${C.mobileVideo}" muted loop playsinline preload="metadata" ${reduceM ? 'controls' : ''}></video>`
      : `<div class="spin-static">${phoneSVG('cosmic', 'back', '')}</div>`;
    const mv = $('.spin-mvideo', scene);
    if (mv && !reduceM) new IntersectionObserver(([e]) => e.isIntersecting ? mv.play().catch(() => {}) : mv.pause(), { threshold: .4 }).observe(mv);
    $$('.sw', end).forEach(b => b.addEventListener('click', () => {
      $$('.sw', end).forEach(x => x.setAttribute('aria-pressed', x === b));
      $('.spin-end small', root).textContent = AS.finishes[b.dataset.f].name;
      const st = $('.spin-static', scene); if (st) st.innerHTML = phoneSVG(b.dataset.f, 'back', '');
    }));
    return;
  }
  if (C.scrollVideo) {
    scene.outerHTML = `<video class="spin-video" src="${C.scrollVideo}" muted playsinline preload="auto"></video>`;
    video = $('.spin-video', root);
  } else {
    scene.innerHTML = `<div class="phone3d"><div class="face front">${phoneSVG('cosmic', 'front', '')}</div><div class="side l"></div><div class="side r"></div><div class="face back">${phoneSVG('cosmic', 'back', '')}</div></div>`;
    phone = $('.phone3d', scene);
  }
  $$('.sw', end).forEach(b => b.addEventListener('click', () => {
    $$('.sw', end).forEach(x => x.setAttribute('aria-pressed', x === b));
    $('.spin-end small', root).textContent = AS.finishes[b.dataset.f].name;
    if (phone) $('.back', phone).innerHTML = phoneSVG(b.dataset.f, 'back', '');
  }));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  AS.onScroll(() => {
    const r = root.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    bar.style.transform = `scaleX(${p})`;
    intro.style.opacity = p < .06 ? 1 : 0;
    const ranges = [[.08, .28], [.28, .48], [.48, .66], [.66, .84]];
    calls.forEach((c, i) => c.classList.toggle('on', p >= ranges[i][0] && p < ranges[i][1]));
    end.classList.toggle('on', p >= .86);
    if (video) { if (video.duration) video.currentTime = p * video.duration; return; }
    if (reduce) { phone.style.transform = p > .5 ? 'rotateY(180deg)' : 'none'; return; }
    const t = ease(clamp((p - .04) / .8));
    const ry = -24 + t * 204, rx = 10 - t * 10, s = .86 + Math.sin(Math.min(p, 1) * Math.PI) * .16, ty = (1 - clamp(p / .2)) * 64 - clamp((p - .8) / .15) * 96;
    phone.style.transform = `translateY(${ty}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
};

/* ---------- Validación ---------- */
const V = {
  req: v => v.trim().length > 0,
  dni: v => /^\d{8}$/.test(v.trim()),
  doc: v => /^[A-Za-z0-9]{8,12}$/.test(v.trim()),
  cel: v => /^9\d{8}$/.test(v.replace(/\D/g, '')),
  mail: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  code: v => /^\d{6}$/.test(v.trim())
};
AS.validate = form => {
  let first = null;
  $$('[data-v]', form).forEach(inp => {
    if (inp.closest('.hidden')) { inp.classList.remove('err'); const m = $('#' + inp.id + '-m'); if (m) m.textContent = ''; return; }
    const rules = inp.dataset.v.split(' ');
    let msg = '';
    for (const r of rules) {
      const v = inp.type === 'checkbox' ? (inp.checked ? 'x' : '') : inp.value;
      if (r === 'req' && !V.req(v)) { msg = inp.dataset.msgReq || 'Este campo es obligatorio.'; break; }
      if (r !== 'req' && v && V[r] && !V[r](v)) { msg = inp.dataset.msg || 'Revisa este dato.'; break; }
    }
    inp.classList.toggle('err', !!msg);
    inp.setAttribute('aria-invalid', !!msg);
    const m = $('#' + inp.id + '-m'); if (m) { m.textContent = msg; m.className = 'msg' + (msg ? ' e' : ''); }
    if (msg && !first) first = inp;
  });
  if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  return !first;
};
document.addEventListener('input', e => { if (e.target.matches?.('.inp.err')) { e.target.classList.remove('err'); const m = $('#' + e.target.id + '-m'); if (m) m.textContent = ''; } });

/* ---------- Inicio ---------- */
shell();
reveal();
document.dispatchEvent(new Event('as:ready'));
})();
