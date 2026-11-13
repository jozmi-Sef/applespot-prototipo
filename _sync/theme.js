/* =========================================================
   AppleSpot · Tema Shopify · Lógica compartida
   Menú, buscador, carrito (AJAX), carrusel, giro 3D, variantes.
   ========================================================= */
(() => {
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const AS = window.AS || (window.AS = {});

/* ---------- Dinero ---------- */
AS.money = cents => {
  const fmt = AS.moneyFormat || 'S/ {{amount}}';
  const n = (cents / 100);
  const two = n.toFixed(2), noDec = Number.isInteger(n) ? String(n) : two;
  const commas = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => {
    if (k === 'amount_no_decimals') return commas(String(Math.round(n)));
    if (k === 'amount_with_comma_separator') return two.replace('.', ',');
    const [i, d] = (Number.isInteger(n) ? noDec : two).split('.');
    return commas(i) + (d ? '.' + d : '');
  });
};

/* ---------- Aviso ---------- */
AS.toast = (txt, link) => {
  const t = $('#toast'); if (!t) return;
  t.innerHTML = `<i class="ph-fill ph-check-circle"></i><span></span>${link ? `<a href="${link.href}">${link.label}</a>` : ''}`;
  $('span', t).textContent = txt;
  t.classList.add('on'); clearTimeout(AS.toast.t); AS.toast.t = setTimeout(() => t.classList.remove('on'), 3200);
};

/* ---------- Carrito ---------- */
AS.paintCount = n => $$('[data-cart-count]').forEach(b => {
  b.textContent = n; b.classList.toggle('on', n > 0);
  b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
});
AS.addToCart = async (id, qty = 1, title = '') => {
  const res = await fetch((AS.routes?.cartAdd || '/cart/add') + '.js', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ items: [{ id: Number(id), quantity: qty }] })
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    AS.toast(e.description || 'No pudimos agregar el producto. Inténtalo de nuevo.');
    return false;
  }
  // Nombre + capacidad (como en el prototipo: "iPhone 18 Pro de 256 GB agregado al carrito")
  const added = (await res.json().catch(() => ({}))).items?.[0];
  let name = added?.product_title || title || 'Producto';
  const cap = (added?.options_with_values || []).find(o => !/color|colour/i.test(o.name) && o.value !== 'Default Title');
  if (cap) name += ` de ${cap.value}`;
  const cart = await (await fetch((AS.routes?.cart || '/cart') + '.js')).json();
  AS.paintCount(cart.item_count);
  AS.toast(`${name} agregado al carrito`, { href: AS.routes?.cart || '/cart', label: 'Ver carrito' });
  return true;
};

/* Tarjetas: elegir color y agregar */
document.addEventListener('click', async e => {
  const sw = e.target.closest('[data-product-card] .sw');
  if (sw) {
    const card = sw.closest('[data-product-card]');
    $$('.sw', card).forEach(x => x.setAttribute('aria-pressed', x === sw));
    const img = $('[data-card-img]', card), svg = $('.card-media svg', card);
    if (img && sw.dataset.img) { img.src = sw.dataset.img; img.removeAttribute('srcset'); }
    if (svg && sw.dataset.pa) { svg.style.setProperty('--pa', sw.dataset.pa); svg.style.setProperty('--pb', sw.dataset.pb); }
    const add = $('[data-add-variant]', card); if (add && sw.dataset.variant) add.dataset.addVariant = sw.dataset.variant;
    return;
  }
  const add = e.target.closest('[data-add-variant]');
  if (add) {
    add.disabled = true;
    await AS.addToCart(add.dataset.addVariant, 1, add.dataset.title);
    add.disabled = false;
  }
});

/* ---------- Cabecera ---------- */
function header() {
  const btn = $('[data-menu-toggle]'), panel = $('#mobilePanel');
  if (btn && panel) {
    $$('a', panel).forEach((a, i) => a.style.transitionDelay = Math.min(i * 60, 400) + 'ms');
    AS.menu = open => {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      panel.setAttribute('aria-hidden', !open);
    };
    btn.addEventListener('click', () => AS.menu(!document.body.classList.contains('menu-open')));
  }
  const ann = $$('[data-announce] .announce-track > span'); let ai = 0;
  if (ann.length > 1) setInterval(() => { ann[ai].classList.remove('on'); ai = (ai + 1) % ann.length; ann[ai].classList.add('on'); }, 4000);

  // Buscador predictivo (API de Shopify)
  const pop = $('[data-search-pop]'), inp = $('[data-search-input]'), res = $('[data-search-results]');
  if (!pop) return;
  let ctrl;
  const run = async () => {
    const q = inp.value.trim();
    if (!q) { res.innerHTML = ''; return; }
    ctrl?.abort(); ctrl = new AbortController();
    try {
      const url = `${AS.routes?.search || '/search/suggest'}.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=8`;
      const data = await (await fetch(url, { signal: ctrl.signal })).json();
      const items = data.resources?.results?.products || [];
      res.innerHTML = items.length
        ? items.map(p => `<a href="${p.url}"><b></b><span>${AS.money(Math.round(parseFloat(p.price) * 100))}</span></a>`).join('')
        : `<p class="search-empty">No encontramos “<span></span>”. Prueba con el modelo, por ejemplo “17 Pro”, o <a href="https://wa.me/${AS.whatsapp}?text=${encodeURIComponent('Hola, busco: ' + q)}" style="text-decoration:underline">pregúntanos por WhatsApp</a>.</p>`;
      if (items.length) $$('a b', res).forEach((b, i) => b.textContent = items[i].title);
      else $('.search-empty span', res).textContent = q;
    } catch (_) { /* búsqueda cancelada */ }
  };
  const open = o => { pop.classList.toggle('on', o); if (o) setTimeout(() => inp.focus(), 50); };
  $$('[data-search-open]').forEach(b => b.addEventListener('click', () => open(true)));
  $('[data-search-close]', pop)?.addEventListener('click', () => open(false));
  pop.addEventListener('click', e => { if (e.target === pop) open(false); });
  let t; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 180); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { open(false); AS.menu?.(false); }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); open(true); }
  });
}

/* ---------- Animaciones ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
AS.reveal = (root = document) => $$('.rv:not(.in)', root).forEach(el => io.observe(el));

const scrollFns = []; let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { scrollFns.forEach(f => f()); ticking = false; }); } }, { passive: true });
addEventListener('resize', () => scrollFns.forEach(f => f()));
AS.onScroll = f => { scrollFns.push(f); f(); };

/* Tagline palabra por palabra */
AS.tagline = el => {
  if (el.dataset.ready) return; el.dataset.ready = 1;
  el.innerHTML = [...el.childNodes].map(n => n.nodeType === 3
    ? n.textContent.split(/(\s+)/).map(w => w.trim() ? `<span class="w">${w}</span>` : w).join('')
    : `<span class="w hl">${n.textContent}</span>`).join('');
  const words = $$('.w', el);
  AS.onScroll(() => { const line = innerHeight * .62; words.forEach(w => w.classList.toggle('on', w.getBoundingClientRect().top < line)); });
};

/* Cuenta regresiva */
AS.countdown = el => {
  const end = new Date(el.dataset.countdown);
  const tick = () => {
    const ms = Math.max(0, end - new Date());
    $$('[data-cd]', el).forEach(b => {
      const v = { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60 }[b.dataset.cd];
      b.textContent = b.dataset.cd === 'd' ? v : String(v).padStart(2, '0');
    });
  };
  tick(); setInterval(tick, 30000);
};

/* ---------- Carrusel de promociones ---------- */
AS.carousel = root => {
  const slides = $$('.slide', root), dots = $$('.dot-btn', root), pp = $('.pp', root);
  if (slides.length < 2) return;
  const DUR = Number(root.dataset.duration || 6500); root.style.setProperty('--dur', DUR + 'ms');
  let cur = 0, timer, paused = false, hover = false, start = 0, left = DUR;
  const go = i => {
    slides[cur].classList.remove('on'); dots[cur]?.classList.remove('on'); dots[cur]?.setAttribute('aria-selected', false);
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('on'); dots[cur]?.setAttribute('aria-selected', true);
    if (dots[cur]) { void dots[cur].offsetWidth; dots[cur].classList.add('on'); }
    left = DUR; schedule();
  };
  const schedule = () => { clearTimeout(timer); if (paused || hover) return; start = Date.now(); timer = setTimeout(() => go(cur + 1), left); };
  const hold = h => { hover = h; root.classList.toggle('paused', paused || hover); if (h) { clearTimeout(timer); left -= Date.now() - start; } else schedule(); };
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  pp?.addEventListener('click', () => {
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
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { paused = true; if (pp) pp.innerHTML = '<i class="ph-fill ph-play"></i>'; }
  schedule();
};

/* ---------- Giro 3D con scroll ---------- */
AS.spin = root => {
  const end = $('.spin-end', root), intro = $('.spin-intro', root), bar = $('.spin-bar i', root);
  const calls = $$('.callout', root), video = $('.spin-video', root), phone = $('.phone3d', root);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = v => Math.max(0, Math.min(1, v));
  $$('.sw', end).forEach(b => b.addEventListener('click', () => {
    $$('.sw', end).forEach(x => x.setAttribute('aria-pressed', x === b));
    const lbl = $('small', end); if (lbl) lbl.textContent = b.getAttribute('aria-label');
    const back = $('.back svg', root); if (back && b.dataset.pa) { back.style.setProperty('--pa', b.dataset.pa); back.style.setProperty('--pb', b.dataset.pb); }
    if (b.dataset.href) $('[data-spin-cta]', root)?.setAttribute('href', b.dataset.href);
  }));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = calls.length;
  AS.onScroll(() => {
    const r = root.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (intro) intro.style.opacity = p < .06 ? 1 : 0;
    calls.forEach((c, i) => { const a = .08 + i * (.76 / n), b = a + .76 / n; c.classList.toggle('on', p >= a && p < b); });
    end?.classList.toggle('on', p >= .86);
    if (video) { if (video.duration) video.currentTime = p * video.duration; return; }
    if (!phone) return;
    if (reduce) { phone.style.transform = p > .5 ? 'rotateY(180deg)' : 'none'; return; }
    const t = ease(clamp((p - .04) / .8));
    const ry = -24 + t * 204, rx = 10 - t * 10, s = .86 + Math.sin(Math.min(p, 1) * Math.PI) * .16, ty = (1 - clamp(p / .2)) * 64 - clamp((p - .8) / .15) * 96;
    phone.style.transform = `translateY(${ty}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
};

/* ---------- Ficha de producto: variantes ---------- */
AS.productForm = root => {
  const data = JSON.parse($('[data-product-json]', root).textContent);
  const form = $('[data-pdp-form]', root), idInput = $('input[name="id"]', form);
  const price = $('[data-price]', root), compare = $('[data-compare]', root), off = $('[data-off]', root);
  const addBtn = $('[data-pdp-add]', root), buyBtn = $('[data-pdp-buy]', root), wa = $('[data-pdp-wa]', root);
  const mainImg = $('[data-main-img]', root), svg = $('.stage svg', root);
  const current = () => $$('[data-option-index]', root).map(g => $('input:checked', g)?.value);
  const update = () => {
    const sel = current();
    const v = data.variants.find(x => x.options.every((o, i) => sel[i] === undefined || o === sel[i]));
    // marcar combinaciones no disponibles
    $$('[data-option-index]', root).forEach(g => {
      const idx = Number(g.dataset.optionIndex);
      $$('input', g).forEach(inp => {
        const test = sel.slice(); test[idx] = inp.value;
        const ok = data.variants.some(x => x.available && x.options.every((o, i) => test[i] === undefined || o === test[i]));
        inp.closest('label').classList.toggle('na', !ok);
      });
      const out = $('[data-option-value]', g.closest('[data-option-wrap]')); if (out) out.textContent = sel[idx] || '';
    });
    if (!v) { addBtn.disabled = buyBtn.disabled = true; addBtn.textContent = 'No disponible'; return; }
    idInput.value = v.id;
    price.textContent = AS.money(v.price);
    const hasCmp = v.compare_at_price && v.compare_at_price > v.price;
    compare.textContent = hasCmp ? AS.money(v.compare_at_price) : '';
    off.textContent = hasCmp ? Math.round((1 - v.price / v.compare_at_price) * 100) + '% menos' : '';
    addBtn.disabled = buyBtn.disabled = !v.available;
    addBtn.textContent = v.available ? 'Agregar al carrito' : 'Agotado';
    if (wa) wa.href = `https://wa.me/${AS.whatsapp}?text=${encodeURIComponent(`Hola, quiero el ${data.title} (${v.title}). ¿Está disponible?`)}`;
    if (v.featured_image && mainImg) { mainImg.src = v.featured_image.src + (v.featured_image.src.includes('?') ? '&' : '?') + 'width=1000'; mainImg.removeAttribute('srcset'); }
    const sw = $('input:checked[data-pa]', root); if (svg && sw) { svg.style.setProperty('--pa', sw.dataset.pa); svg.style.setProperty('--pb', sw.dataset.pb); }
    const u = new URL(location.href); u.searchParams.set('variant', v.id); history.replaceState(null, '', u);
    const sticky = $('[data-sticky-price]'); if (sticky) sticky.textContent = AS.money(v.price);
  };
  root.addEventListener('change', e => { if (e.target.closest('[data-option-index]')) update(); });
  addBtn.addEventListener('click', async e => { e.preventDefault(); addBtn.disabled = true; await AS.addToCart(idInput.value, 1, data.title); addBtn.disabled = false; });
  // miniaturas
  $$('[data-thumb]', root).forEach(t => t.addEventListener('click', () => {
    $$('[data-thumb]', root).forEach(x => x.setAttribute('aria-pressed', x === t));
    if (mainImg && t.dataset.src) { mainImg.src = t.dataset.src; mainImg.removeAttribute('srcset'); }
  }));
  update();
  // barra fija "Compra ahora" en celular
  const sticky = $('[data-sticky-buy]');
  if (sticky && buyBtn) {
    $('[data-sticky-btn]', sticky).addEventListener('click', () => buyBtn.click());
    new IntersectionObserver(([e]) => {
      const show = !e.isIntersecting && e.boundingClientRect.top < 0;
      sticky.classList.toggle('on', show); sticky.setAttribute('aria-hidden', !show);
      document.body.classList.toggle('has-sticky', show);
    }).observe(buyBtn);
  }
};

/* ---------- Colección: filtros ---------- */
AS.filters = root => {
  const box = $('[data-filters]', root);
  $('[data-filters-open]', root)?.addEventListener('click', () => box.classList.add('on'));
  $$('[data-filters-close]', root).forEach(b => b.addEventListener('click', () => box.classList.remove('on')));
  $$('form[data-autosubmit]', root).forEach(f => f.addEventListener('change', () => f.requestSubmit ? f.requestSubmit() : f.submit()));
};

/* Carrito: al cambiar la cantidad a mano, actualizar */
document.addEventListener('change', e => {
  const q = e.target.closest('.qty-in'); if (!q) return;
  const form = q.form, btn = form && $('[data-cart-update]', form);
  if (btn) form.requestSubmit ? form.requestSubmit(btn) : btn.click();
});

/* ---------- Inicio ---------- */
const init = (root = document) => {
  $$('[data-carousel]', root).forEach(AS.carousel);
  $$('[data-spin]', root).forEach(AS.spin);
  $$('[data-tagline]', root).forEach(AS.tagline);
  $$('[data-countdown]', root).forEach(AS.countdown);
  $$('[data-pdp]', root).forEach(AS.productForm);
  $$('[data-collection]', root).forEach(AS.filters);
  AS.reveal(root);
};
document.addEventListener('DOMContentLoaded', () => { header(); init(); });
// Editor de temas: re-iniciar secciones al editarlas
document.addEventListener('shopify:section:load', e => init(e.target));
})();
