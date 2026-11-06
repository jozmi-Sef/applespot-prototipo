/* AppleSpot · Lógica por página */
(() => {
const { $, $$, fmt, wa, Cart, phoneSVG, toast } = AS;
const { condTxt, warrantyTxt, deliveryTxt, minPrice, firstOpt, camsFor, accIcon, launchActive, params, store } = AS.util;
const C = AS.config;
const DEPTS = ['Piura', 'Lima', 'Callao', 'Tumbes', 'Lambayeque', 'La Libertad', 'Cajamarca', 'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Puno', 'San Martín', 'Tacna', 'Ucayali'];
const pctOff = (p, o) => Math.round((1 - p / o) * 100);
const emptyState = (icon, title, text, ctas) => `<div class="empty rv"><div class="ico"><i class="ph ph-${icon}"></i></div><h3>${title}</h3><p>${text}</p><div class="ctas">${ctas}</div></div>`;
const thumbFor = (i, cls = '') => i.type === 'iphone' ? phoneSVG(i.finish, 'back', cls, camsFor(AS.findAny(i.id) || { name: i.name })) : `<i class="ph ph-${i.icon || 'plug'}"></i>`;
const field = (id, label, attrs = '', type = 'text', opt = false) => `<div class="field"><label for="${id}">${label}${opt ? ' <span class="opt-tag">(opcional)</span>' : ''}</label><input class="inp" id="${id}" name="${id}" type="${type}" ${attrs}><p class="msg" id="${id}-m"></p></div>`;
const selectF = (id, label, opts, attrs = '') => `<div class="field"><label for="${id}">${label}</label><select class="inp" id="${id}" name="${id}" ${attrs}>${opts.map(o => `<option>${o}</option>`).join('')}</select><p class="msg" id="${id}-m"></p></div>`;

/* ---------- Catálogo genérico con filtros ---------- */
function catalog({ items, groups, render, sorts, promo, noun }) {
  const grid = $('#grid'), count = $('#count'), fBox = $('#filters'), sortSel = $('#sort');
  if (promo) { $('#promoSlot').innerHTML = AS.sections.promoBanner(promo); AS.countdown($('#promoSlot')); }
  const state = Object.fromEntries(groups.map(g => [g.k, params.get(g.k) || 'all']));
  state.sort = params.get('orden') || 'dest'; sortSel.value = state.sort;
  $('#fGroups').innerHTML = groups.map(g => `<div class="f-group"><h4>${g.label}</h4><div class="f-list">${[['all', g.all || 'Todos'], ...g.opts].map(([v, l]) => {
    const n = v === 'all' ? items.length : items.filter(it => g.test(it, v)).length;
    return `<button class="f-opt" data-k="${g.k}" data-v="${v}" aria-pressed="${state[g.k] == v}">${l}<span>${n}</span></button>`;
  }).join('')}</div></div>`).join('');
  const apply = (first) => {
    let list = items.filter(it => groups.every(g => state[g.k] === 'all' || g.test(it, state[g.k])));
    list = [...list].sort(sorts[state.sort] || sorts.dest);
    count.textContent = `${list.length} ${list.length === 1 ? noun[0] : noun[1]}`;
    const q = new URLSearchParams(); groups.forEach(g => state[g.k] !== 'all' && q.set(g.k, state[g.k])); if (state.sort !== 'dest') q.set('orden', state.sort);
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
    const paint = () => {
      grid.innerHTML = list.length ? list.map(render).join('') : `<div style="grid-column:1/-1">${emptyState('magnifying-glass', 'Sin resultados con estos filtros', 'Prueba con otra combinación o pregúntanos por WhatsApp: muchos modelos los conseguimos a pedido.', `<button class="btn btn-dark" data-reset>Limpiar filtros</button><a class="btn btn-wa" href="${wa('Hola, busco un equipo que no encuentro en la web')}" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo"></i>Consultar</a>`)}</div>`;
      AS.reveal(grid);
    };
    if (first) { grid.innerHTML = AS.skeletons(6); setTimeout(paint, 350); } else paint();
  };
  fBox.addEventListener('click', e => {
    const b = e.target.closest('.f-opt'); if (!b) return;
    state[b.dataset.k] = b.dataset.v;
    $$(`.f-opt[data-k="${b.dataset.k}"]`, fBox).forEach(x => x.setAttribute('aria-pressed', x === b));
    apply();
  });
  const reset = () => { groups.forEach(g => state[g.k] = 'all'); $$('.f-opt', fBox).forEach(x => x.setAttribute('aria-pressed', x.dataset.v === 'all')); apply(); };
  $('#resetF').addEventListener('click', reset);
  document.addEventListener('click', e => { if (e.target.closest('[data-reset]')) reset(); });
  sortSel.addEventListener('change', () => { state.sort = sortSel.value; apply(); });
  $('#openF').addEventListener('click', () => fBox.classList.add('on'));
  $('#closeF').addEventListener('click', () => fBox.classList.remove('on'));
  apply(true);
}

AS.pages = {
  iphone() {
    catalog({
      items: AS.products, noun: ['modelo', 'modelos'], render: AS.iphoneCard, promo: AS.promos[1],
      groups: [
        { k: 'serie', label: 'Serie', all: 'Todas', opts: [18, 17, 16, 15, 14, 13, 12].map(s => [String(s), 'iPhone ' + s]), test: (p, v) => String(p.serie) === v },
        { k: 'estado', label: 'Estado', opts: [['nuevo', 'Nuevo sellado'], ['seminuevo', 'Seminuevo'], ['exhibicion', 'Exhibición']], test: (p, v) => p.condition === v },
        { k: 'stock', label: 'Disponibilidad', all: 'Todas', opts: [['stock', 'En stock · 3 a 5 días'], ['pedido', 'A pedido · 6 a 7 días']], test: (p, v) => p.stock === v }
      ],
      sorts: {
        dest: (a, b) => (b.star ? 1 : 0) - (a.star ? 1 : 0) || b.serie - a.serie || minPrice(b) - minPrice(a),
        new: (a, b) => b.serie - a.serie || minPrice(b) - minPrice(a),
        asc: (a, b) => minPrice(a) - minPrice(b),
        desc: (a, b) => minPrice(b) - minPrice(a)
      }
    });
  },

  accesorios() {
    catalog({
      items: AS.accessories, noun: ['accesorio', 'accesorios'], render: AS.accCard, promo: AS.promos[2],
      groups: [{ k: 'sub', label: 'Categoría', opts: Object.entries(AS.accessorySubs).map(([k, s]) => [k, s.name]), test: (a, v) => a.sub === v }],
      sorts: { dest: (a, b) => (b.best ? 1 : 0) - (a.best ? 1 : 0), asc: (a, b) => a.price - b.price, desc: (a, b) => b.price - a.price }
    });
    AS.sections.combos($('#combos'));
    AS.sections.signup($('#signup'));
  },

  ofertas() {
    $('#banners').innerHTML = AS.promos.filter(p => p.visual !== 'image').map(AS.sections.promoBanner).join('');
    AS.countdown($('#banners'));
    $('#gifts').innerHTML = AS.products.filter(p => p.airpods).map(AS.iphoneCard).join('');
    const off = p => { const [pr, o] = p.prices[firstOpt(p)]; return o - pr; };
    $('#deals').innerHTML = AS.products.filter(p => !p.airpods).sort((a, b) => off(b) - off(a)).slice(0, 8).map(AS.iphoneCard).join('');
    AS.sections.combos($('#combos'));
    AS.sections.signup($('#signup'));
  },

  producto() {
    const p = AS.findAny(params.get('id'));
    const root = $('#pdp');
    if (!p) {
      root.innerHTML = emptyState('device-mobile', 'No encontramos este producto', 'Puede que el enlace haya cambiado o que el modelo ya no esté disponible.', `<a class="btn btn-dark" href="iphone.html">Ver iPhone</a><a class="btn btn-line" href="accesorios.html">Ver accesorios</a>`);
      $('#related').classList.add('hidden'); return;
    }
    document.title = `${p.name} | AppleSpot`;
    const isPhone = p.type === 'iphone';
    const crumbs = `<nav class="crumbs light" aria-label="Ruta"><a href="index.html">Inicio</a><span>/</span><a href="${isPhone ? 'iphone.html' : 'accesorios.html'}">${isPhone ? 'iPhone' : 'Accesorios'}</a><span>/</span><span aria-current="page">${p.name}</span></nav>`;
    const accordion = (rows) => `<div class="acc">${rows.map(([t, b], i) => `<details${i === 0 ? ' open' : ''}><summary>${t}<i class="ph ph-plus"></i></summary><div class="body">${b}</div></details>`).join('')}</div>`;

    if (isPhone) {
      let fk = params.get('color') && p.finishes.includes(params.get('color')) ? params.get('color') : p.finishes[0], opt = firstOpt(p), view = 'back', qty = 1;
      const cams = camsFor(p);
      const gift = launchActive() ? `<div class="gift-line"><i class="ph-fill ph-gift"></i><div><b>Regalo de lanzamiento:</b> cubo 20W original${p.airpods ? ' + AirPods' : ''}. Se agrega automáticamente a tu pedido.</div></div>` : '';
      root.innerHTML = `${crumbs}<div class="pdp">
        <div class="gallery-main">
          <div class="stage" id="stage"></div>
          <div class="thumbs" role="group" aria-label="Vistas del producto">
            <button class="thumb" data-view="back" aria-pressed="true" aria-label="Vista trasera">${phoneSVG(fk, 'back', '', cams)}</button>
            <button class="thumb" data-view="front" aria-pressed="false" aria-label="Vista frontal">${phoneSVG(fk, 'front', '')}</button>
            <button class="thumb" data-view="video" aria-pressed="false" aria-label="Video del producto"><i class="ph-fill ph-play-circle"></i></button>
          </div>
        </div>
        <div class="pdp-info">
          <span class="cond ${p.condition}"><i class="ph-fill ph-circle"></i>${condTxt[p.condition]}</span>
          <h1>${p.name}</h1>
          <p class="lead">${p.condition === 'nuevo' ? 'Equipo nuevo, sellado de fábrica y 100% original.' : p.condition === 'seminuevo' ? 'Equipo original seminuevo, revisado y en buen estado estético.' : 'Equipo original de exhibición, con uso mínimo en vitrina.'} ${warrantyTxt(p.condition)}.</p>
          ${p.battery ? `<div class="used-box" aria-label="Estado del equipo">
            <div class="used-row"><i class="ph ph-battery-high"></i><div><b>Salud de batería ${p.battery}%</b><div class="bat" role="img" aria-label="${p.battery}% de salud de batería"><i style="width:${p.battery}%"></i></div></div></div>
            <div class="used-row"><i class="ph ph-sparkle"></i><div><b>${AS.grades[p.grade].name}</b><span>${AS.grades[p.grade].desc}</span></div></div>
          </div>` : ''}
          <div class="opt-label">Color <span id="fName">${AS.finishes[fk].name}</span></div>
          <div class="swatches lg" role="group" aria-label="Color">${p.finishes.map(f => `<button class="sw" data-f="${f}" aria-pressed="${f === fk}" style="background:${AS.finishes[f].dot}" aria-label="${AS.finishes[f].name}"></button>`).join('')}</div>
          <div class="opt-label">Capacidad</div>
          <div class="opts" role="group" aria-label="Capacidad">${Object.entries(p.prices).map(([k, [pr]]) => `<button class="opt" data-o="${k}" aria-pressed="${k === opt}"><b>${k}</b><small>${fmt(pr)}</small></button>`).join('')}</div>
          <div class="buy-box">
            <div class="price"><b id="pr"></b><s id="old"></s><span class="off" id="off"></span></div>
            <p class="meta" style="font-size:12px;line-height:16px;color:var(--ink-2);margin-top:4px">Precio en soles, incluye IGV. Pago con tarjeta o transferencia.</p>
            ${gift}
            ${p.stock === 'pedido' ? `<div class="warn"><i class="ph-fill ph-warning"></i><div><b>Producto a pedido.</b> Se entrega en 6 a 7 días desde la confirmación del pago.</div></div>` : ''}
            <div class="buy-actions"><button class="btn btn-primary" id="buyNow">Compra ahora</button><button class="btn btn-line" id="addCart">Agregar al carrito</button><a class="btn btn-wa" id="waBtn" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo"></i>Consultar por WhatsApp</a></div>
            <div class="delivery">
              <div><i class="ph ph-truck"></i><div><b>Envío gratis a todo el Perú</b><span>Domicilio, agencia o recojo en tienda · ${deliveryTxt(p.stock)}</span></div></div>
              <div><i class="ph ph-shield-check"></i><div><b>${warrantyTxt(p.condition)}</b><span>Válida en nuestra tienda de Piura</span></div></div>
              <div><i class="ph ph-barcode"></i><div><b>IMEI verificable y garantizado</b><span>Te lo enviamos al confirmar tu pago. Si no pasa la verificación, te cambiamos el equipo</span></div></div>
            </div>
          </div>
          ${accordion([
            ['Qué incluye', `<ul>${p.condition === 'nuevo' ? '<li>iPhone sellado de fábrica</li><li>Cable USB C original</li><li>Documentación</li>' : '<li>iPhone revisado y limpio</li><li>Cable de carga</li>'}<li>Boleta electrónica por WhatsApp</li>${launchActive() ? `<li>Regalo: cubo 20W original${p.airpods ? ' y AirPods' : ''}</li>` : ''}</ul>`],
            ['Cómo verificar tu equipo', `<ol class="verify">
              <li><b>Al confirmar tu pago</b> te enviamos por WhatsApp el IMEI y el número de serie de tu equipo.</li>
              <li><b>Verifícalo tú mismo:</b> en <a href="https://www.gob.pe/1170" target="_blank" rel="noopener">Checa tu IMEI de OSIPTEL</a> confirmas que no está reportado, y en la <a href="https://checkcoverage.apple.com/" target="_blank" rel="noopener">página de cobertura de Apple</a>, con el número de serie, confirmas que es original${p.condition === 'nuevo' ? ' y que no ha sido activado' : ''}.</li>
              <li><b>Al recibirlo</b> marca *#06# y compara el número con la caja y con el que te enviamos.</li>
            </ol>
            <div class="imei-promise"><i class="ph-fill ph-seal-check"></i><div><b>Garantía de IMEI</b>Si tu IMEI no pasa la verificación de OSIPTEL, te cambiamos el equipo sin costo. <a href="legal.html#cambios">Ver condiciones</a></div></div>`],
            ['Modo de uso y cuidados', '<ul><li>Usa cargadores originales o certificados para cuidar la batería.</li><li>Evita exponerlo a temperaturas altas, como dentro del auto al sol.</li><li>Coloca un case y un protector de pantalla desde el primer día.</li><li>Mantén iOS actualizado para recibir mejoras de seguridad.</li><li>Ante humedad, apágalo y no lo cargues hasta que esté seco.</li></ul>'],
            ['Garantía', `<p>${warrantyTxt(p.condition)} por fallas de fábrica. No cubre golpes, humedad ni manipulación de terceros. Más detalles en <a href="legal.html#cambios" style="text-decoration:underline">Garantía y devoluciones</a>.</p>`],
            ['Ficha del producto', `<div class="specs"><div><span>Modelo</span><b>${p.name}</b></div><div><span>Estado</span><b>${condTxt[p.condition]}</b></div>${p.battery ? `<div><span>Salud de batería</span><b>${p.battery}%</b></div><div><span>Estado estético</span><b>${AS.grades[p.grade].name}</b></div>` : ''}<div><span>Capacidades</span><b>${Object.keys(p.prices).join(', ')}</b></div><div><span>Colores</span><b>${p.finishes.length}</b></div><div><span>Entrega</span><b>${deliveryTxt(p.stock)}</b></div><div><span>Código</span><b>IMEI al despacho</b></div></div>`]
          ])}
        </div></div>`;
      const stage = $('#stage');
      const paint = () => {
        const [pr, o] = p.prices[opt];
        $('#pr').textContent = fmt(pr); $('#old').textContent = fmt(o); $('#off').textContent = pctOff(pr, o) + '% menos';
        $('#fName').textContent = AS.finishes[fk].name;
        $('#waBtn').href = wa(`Hola, quiero el ${p.name} de ${opt} en ${AS.finishes[fk].name}. ¿Está disponible?`);
        stage.innerHTML = view === 'video'
          ? `<button class="video-ph" aria-label="Reproducir video del ${p.name}"><span class="play"><i class="ph-fill ph-play"></i></span><span class="ph-label">Video del producto generado con IA · reemplazar en Figma</span></button>`
          : phoneSVG(fk, view, 'ph', cams);
        $('.thumb[data-view="back"]').innerHTML = phoneSVG(fk, 'back', '', cams);
      };
      root.addEventListener('click', e => {
        const sw = e.target.closest('.swatches .sw'), o = e.target.closest('.opt'), th = e.target.closest('.thumb');
        if (sw) { fk = sw.dataset.f; $$('.swatches .sw', root).forEach(x => x.setAttribute('aria-pressed', x === sw)); if (view === 'video') view = 'back'; paint(); }
        if (o) { opt = o.dataset.o; $$('.opt', root).forEach(x => x.setAttribute('aria-pressed', x === o)); paint(); }
        if (th) { view = th.dataset.view; $$('.thumb', root).forEach(x => x.setAttribute('aria-pressed', x === th)); paint(); }
      });
      $('#addCart').addEventListener('click', () => Cart.add(p, { opt, finish: fk }));
      $('#buyNow').addEventListener('click', () => { Cart.add(p, { opt, finish: fk, silent: true }); location.href = 'checkout.html'; });
      paint();
      $('#pdpReviews').classList.remove('hidden');
      $('#revBtn').href = wa(`Hola, compré un ${p.name} y quiero dejar mi reseña`);
      AS.sections.reels($('#reels'));
      $('#relGrid').innerHTML = AS.accessories.filter(a => a.best).concat(AS.accessories.filter(a => a.sub === 'cubos-certificados')).slice(0, 4).map(AS.accCard).join('');
    } else {
      let qty = 1;
      const sub = AS.accessorySubs[p.sub];
      root.innerHTML = `${crumbs}<div class="pdp">
        <div class="gallery-main"><div class="stage"><i class="ph ph-${accIcon(p)}" style="font-size:200px" aria-hidden="true"></i></div></div>
        <div class="pdp-info">
          <span class="cond nuevo"><i class="ph-fill ph-circle"></i>${sub.name}</span>
          <h1>${p.name}</h1>
          <p class="lead">${p.desc}</p>
          <div class="buy-box">
            <div class="price"><b>${fmt(p.price)}</b><s>${fmt(p.old)}</s><span class="off">${pctOff(p.price, p.old)}% menos</span></div>
            <div class="gift-line"><i class="ph-fill ph-tag"></i><div><b>10% extra</b> en tu primera compra de accesorios con el código ${C.coupon.code}.</div></div>
            <div class="opt-label">Cantidad</div>
            <div class="qty" role="group" aria-label="Cantidad"><button id="qm" aria-label="Quitar uno"><i class="ph ph-minus"></i></button><span id="qv">1</span><button id="qp" aria-label="Agregar uno"><i class="ph ph-plus"></i></button></div>
            <div class="buy-actions"><button class="btn btn-primary" id="buyNow">Compra ahora</button><button class="btn btn-line" id="addCart">Agregar al carrito</button><a class="btn btn-wa" href="${wa('Hola, quiero: ' + p.name)}" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo"></i>Consultar por WhatsApp</a></div>
            <div class="delivery">
              <div><i class="ph ph-truck"></i><div><b>Envío desde ${fmt(C.shippingAccessories.piura)}</b><span>Gratis si lo compras junto con tu iPhone · 3 a 5 días</span></div></div>
              <div><i class="ph ph-storefront"></i><div><b>Recojo gratis en tienda</b><span>${C.address}</span></div></div>
            </div>
          </div>
          ${accordion([
            ['Compatibilidad', `<p>${/Lightning/.test(p.name) ? 'iPhone 12 al iPhone 14.' : /USB C a USB C/.test(p.name) ? 'iPhone 15 en adelante, iPad y Mac con USB C.' : /Case/.test(p.name) ? 'Disponible para iPhone 13 al 18 Pro Max. Indica tu modelo por WhatsApp o en la nota del pedido.' : 'Todos los iPhone con el cable correspondiente.'}</p>`],
            ['Modo de uso y cuidados', '<ul><li>No enrolles el cable de forma ajustada.</li><li>Desconecta el cubo del tomacorriente cuando no lo uses.</li><li>Limpia el case con un paño húmedo y jabón neutro.</li></ul>'],
            ['Garantía', `<p>${/original/.test(p.sub) ? 'Producto original con garantía por falla de fábrica.' : 'Producto certificado con garantía por falla de fábrica.'} Consulta las condiciones en <a href="legal.html#cambios" style="text-decoration:underline">Garantía y devoluciones</a>.</p>`]
          ])}
        </div></div>`;
      const qv = $('#qv');
      $('#qm').addEventListener('click', () => { qty = Math.max(1, qty - 1); qv.textContent = qty; });
      $('#qp').addEventListener('click', () => { qty = Math.min(5, qty + 1); qv.textContent = qty; });
      $('#addCart').addEventListener('click', () => Cart.add(p, { qty }));
      $('#buyNow').addEventListener('click', () => { Cart.add(p, { qty, silent: true }); location.href = 'checkout.html'; });
      $('#relT').textContent = 'También te puede servir';
      $('#relGrid').innerHTML = AS.accessories.filter(a => a.id !== p.id).sort((a, b) => (b.sub === p.sub) - (a.sub === p.sub)).slice(0, 4).map(AS.accCard).join('');
    }
    /* Barra fija "Compra ahora" en celular: aparece cuando el botón principal sale de la pantalla */
    document.body.insertAdjacentHTML('beforeend', `<div class="sticky-buy" id="stickyBuy" aria-hidden="true"><div><span>${p.name}</span><b id="sbPr"></b></div><button class="btn btn-primary btn-sm" id="sbBtn" tabindex="-1">Compra ahora</button></div>`);
    const sb = $('#stickyBuy'), main = $('#buyNow');
    const syncPr = () => { $('#sbPr').textContent = $('.buy-box .price b', root).textContent; };
    root.addEventListener('click', () => setTimeout(syncPr));
    $('#sbBtn').addEventListener('click', () => main.click());
    new IntersectionObserver(([e]) => {
      const show = !e.isIntersecting && e.boundingClientRect.top < 0;
      sb.classList.toggle('on', show); sb.setAttribute('aria-hidden', !show); $('#sbBtn').tabIndex = show ? 0 : -1;
      document.body.classList.toggle('has-sticky', show);
    }).observe(main);
    syncPr();
    AS.reveal();
  },

  carrito() {
    const root = $('#cart');
    const render = () => {
      const t = Cart.totals(), gifts = Cart.gifts();
      if (!t.items.length) {
        root.innerHTML = emptyState('handbag', 'Tu carrito está vacío', 'Empieza por tu próximo iPhone. Todos incluyen envío gratis y, durante el lanzamiento, un cubo 20W original de regalo.', `<a class="btn btn-dark" href="iphone.html">Ver iPhone</a><a class="btn btn-line" href="accesorios.html">Ver accesorios</a>`);
        AS.reveal(root); return;
      }
      root.innerHTML = `<div class="cart-grid">
        <div class="panel">${t.items.map(i => `<div class="line" data-key="${i.key}">
            <a class="thumb-l" href="${i.type === 'combo' ? 'accesorios.html' : `producto.html?id=${i.id}${i.finish ? '&color=' + i.finish : ''}`}" aria-hidden="true" tabindex="-1">${thumbFor(i)}</a>
            <div><h3>${i.name}</h3><p class="meta">${i.type === 'iphone' ? `${i.opt} · ${AS.finishes[i.finish].name}` : i.type === 'combo' ? 'Combo' : 'Accesorio'}</p>${i.type === 'iphone' ? '<span class="gift-tag"><i class="ph ph-truck"></i>Envío gratis</span>' : ''}</div>
            <div class="r"><b>${fmt(i.price * i.qty)}</b><div class="qty"><button data-q="-1" aria-label="Quitar uno"><i class="ph ph-minus"></i></button><span>${i.qty}</span><button data-q="1" aria-label="Agregar uno"><i class="ph ph-plus"></i></button></div><button class="rm" data-rm>Eliminar</button></div>
          </div>`).join('')}
          ${gifts.map(g => `<div class="line"><div class="thumb-l"><i class="ph ph-${g.icon}" style="color:var(--orange)"></i></div><div><h3>${g.name}</h3><p class="meta">Regalo de lanzamiento · ${g.qty} ${g.qty === 1 ? 'unidad' : 'unidades'}</p></div><div class="r"><b style="color:var(--ok)">Gratis</b></div></div>`).join('')}
        </div>
        <aside class="summary"><div class="panel">
          <h2>Resumen</h2>
          <div style="margin-top:16px">
            <div class="sum-row"><span>Subtotal</span><b>${fmt(t.sub)}</b></div>
            ${t.disc ? `<div class="sum-row disc"><span>Cupón ${C.coupon.code} (accesorios)</span><b>− ${fmt(t.disc)}</b></div>` : ''}
            <div class="sum-row"><span>Envío</span><b>${t.hasPhone ? 'Gratis' : 'Se calcula al pagar'}</b></div>
          </div>
          <div class="sum-total"><span>Total</span><b>${fmt(t.total)}</b></div>
          <form class="coupon" id="couponF" novalidate><label class="sr" for="cpn">Código de descuento</label><input class="inp" id="cpn" placeholder="Código de descuento" value="${t.coupon || ''}"><button class="btn btn-line btn-sm" type="submit">${t.coupon ? 'Quitar' : 'Aplicar'}</button></form>
          <p class="msg" id="cpn-m"></p>
          <a class="btn btn-primary btn-block" href="checkout.html" style="margin-top:8px">Continuar con la compra <i class="ph ph-arrow-right"></i></a>
          <a class="btn btn-wa btn-block" style="margin-top:8px" target="_blank" rel="noopener" href="${wa('Hola, quiero comprar:\n' + t.items.map(i => `• ${i.qty} x ${i.name}${i.opt ? ' ' + i.opt : ''}`).join('\n') + '\nTotal: ' + fmt(t.total))}"><i class="ph ph-whatsapp-logo"></i>Prefiero comprar por WhatsApp</a>
          <div class="trust"><div><i class="ph-fill ph-lock-simple"></i>Pago seguro procesado por Culqi</div><div><i class="ph-fill ph-seal-check"></i>Equipos originales con IMEI verificable</div><div><i class="ph-fill ph-truck"></i>Envío gratis a todo el Perú con tu iPhone</div></div>
        </div></aside></div>`;
    };
    root.addEventListener('click', e => {
      const line = e.target.closest('.line[data-key]'); if (!line) return;
      const key = line.dataset.key, q = e.target.closest('[data-q]');
      if (q) { const it = Cart.items().find(i => i.key === key); Cart.setQty(key, it.qty + +q.dataset.q); render(); }
      if (e.target.closest('[data-rm]')) { Cart.remove(key); render(); toast('Producto eliminado del carrito'); }
    });
    root.addEventListener('submit', e => {
      if (e.target.id !== 'couponF') return; e.preventDefault();
      const cur = store.get('as_coupon', null), v = $('#cpn').value.trim().toUpperCase();
      if (cur) { store.set('as_coupon', null); render(); return; }
      if (v !== C.coupon.code) { $('#cpn').classList.add('err'); $('#cpn-m').className = 'msg e'; $('#cpn-m').textContent = 'Este código no es válido. Revisa que esté bien escrito.'; return; }
      if (!Cart.items().some(i => i.type !== 'iphone')) { $('#cpn-m').className = 'msg e'; $('#cpn-m').textContent = 'El código aplica solo a accesorios. Agrega uno para usarlo.'; return; }
      store.set('as_coupon', v); render(); toast('Cupón aplicado a tus accesorios');
    });
    render();
  },

  /* Finalizar compra: replica el checkout predeterminado de Shopify
     (formulario a la izquierda, resumen gris a la derecha). */
  checkout() {
    const root = $('#co'), side = $('#coSum'), user = store.get('as_user', null);
    if (!Cart.items().length) {
      $('.co-grid').classList.add('empty-co');
      root.innerHTML = emptyState('handbag', 'No hay productos para pagar', 'Agrega un iPhone o accesorio a tu carrito para continuar.', `<a class="btn btn-dark" href="iphone.html">Ver iPhone</a>`); side.innerHTML = ''; AS.reveal(root); return;
    }
    const inp = (id, ph, attrs = '', type = 'text') => `<div class="sf"><label class="sr" for="${id}">${ph}</label><input class="sf-in" id="${id}" type="${type}" placeholder="${ph}" ${attrs}><p class="msg" id="${id}-m"></p></div>`;
    const sel = (id, label, opts, val) => `<div class="sf sf-sel"><label for="${id}">${label}</label><select class="sf-in" id="${id}">${opts.map(o => `<option${o === val ? ' selected' : ''}>${o}</option>`).join('')}</select><i class="ph ph-caret-down"></i></div>`;
    const radio = (name, val, checked, title, right = '', body = '') => `<label class="sr-row"><input type="radio" name="${name}" value="${val}"${checked ? ' checked' : ''}><span class="sr-t">${title}</span>${right ? `<span class="sr-r">${right}</span>` : ''}</label>${body}`;
    const cardLogos = '<span class="pay-ic">VISA</span><span class="pay-ic mc">MC</span><span class="pay-ic">AMEX</span>';

    root.innerHTML = `<form id="coForm" novalidate>
      <section class="co-sec">
        <div class="co-h"><h2>Contacto</h2>${user ? '' : '<a href="cuenta.html">Iniciar sesión</a>'}</div>
        ${inp('mail', 'Email o número de teléfono móvil', `data-v="req" autocomplete="email" value="${user?.email || ''}"`)}
        <label class="check sm"><input type="checkbox" id="news"><span>Enviarme novedades y ofertas por correo electrónico</span></label>
      </section>

      <section class="co-sec">
        <h2>Entrega</h2>
        <div class="seg" role="radiogroup" aria-label="Tipo de entrega">
          <label><input type="radio" name="mode" value="envio" checked><span><i class="ph ph-package"></i>Envío</span></label>
          <label><input type="radio" name="mode" value="retiro"><span><i class="ph ph-map-pin"></i>Retiro</span></label>
        </div>
        <div id="shipBox">
          ${sel('pais', 'País / Región', ['Perú'], 'Perú')}
          <div class="two">${inp('nom', 'Nombre', `data-v="req" autocomplete="given-name" value="${user?.name || ''}"`)}${inp('ape', 'Apellidos', 'data-v="req" autocomplete="family-name"')}</div>
          ${inp('dir', 'Dirección', 'data-v="req" autocomplete="street-address"')}
          ${inp('dis', 'Distrito', 'data-v="req"')}
          <div class="three">${inp('ciu', 'Ciudad', 'data-v="req" autocomplete="address-level2"')}${sel('reg', 'Región', DEPTS, 'Piura')}${inp('cp', 'Código postal (opcional)', 'autocomplete="postal-code"')}</div>
          ${inp('tel', 'Teléfono', 'data-v="req cel" inputmode="numeric" autocomplete="tel" data-msg="Ingresa 9 dígitos, empezando con 9."', 'tel')}
          <label class="check sm"><input type="checkbox" id="save"><span>Guardar mi información y consultar más rápidamente la próxima vez</span></label>
          <label class="check sm"><input type="checkbox" id="wapp"><span>Enviarme mensajes por WhatsApp con novedades y ofertas</span></label>
          <h3 class="co-sub">Métodos de envío</h3>
          <div class="sr-box" id="shipMethods"></div>
        </div>
        <div id="pickBox" class="hidden">
          <h3 class="co-sub">Ubicación de retiro</h3>
          <div class="sr-box">${radio('pick', 'tienda', true, `<b>AppleSpot · ${C.address}</b><small>${C.addressRef}<br>${C.hours.join(' · ')}</small>`, '<b>GRATIS</b>')}</div>
          <div class="two" style="margin-top:12px">${inp('pnom', 'Nombre', `data-v="req" value="${user?.name || ''}"`)}${inp('ptel', 'Teléfono', 'data-v="req cel" inputmode="numeric" data-msg="Ingresa 9 dígitos, empezando con 9."', 'tel')}</div>
          <p class="co-note">Te avisamos por WhatsApp cuando tu pedido esté listo para recoger (1 a 2 días).</p>
        </div>
      </section>

      <section class="co-sec">
        <h2>Pago</h2><p class="co-hint">Todas las transacciones son seguras y están encriptadas.</p>
        <div class="sr-box pay">
          ${radio('pay', 'tarjeta', true, 'Tarjeta de crédito o débito', cardLogos, `<div class="pay-body" id="payCard">
            ${inp('cnum', 'Número de tarjeta', 'inputmode="numeric" autocomplete="cc-number"')}
            <div class="two">${inp('cexp', 'Fecha de vencimiento (MM / AA)', 'inputmode="numeric" autocomplete="cc-exp"')}${inp('ccvv', 'Código de seguridad', 'inputmode="numeric" autocomplete="cc-csc"')}</div>
            ${inp('cname', 'Nombre del titular', 'autocomplete="cc-name"')}
            <div class="two">${sel('doct', 'Documento', ['DNI', 'Carné de extranjería', 'RUC'], 'DNI')}${inp('docn', 'Número de documento', 'inputmode="numeric"')}</div>
            ${sel('cuotas', 'Cuotas', ['Sin cuotas', '2 cuotas', '3 cuotas', '6 cuotas', '12 cuotas'], 'Sin cuotas')}
            <p class="co-hint">Cuotas solo con tarjeta de crédito. Si hay intereses, los aplicará y cobrará tu banco.</p>
            <label class="check sm"><input type="checkbox" checked><span>Usar la dirección de envío como dirección de facturación</span></label>
            <p class="co-hint"><i class="ph-fill ph-lock-simple"></i> Procesado por Culqi. AppleSpot no almacena los datos de tu tarjeta.</p>
          </div>`)}
          ${radio('pay', 'transferencia', false, 'Transferencia bancaria', '<i class="ph ph-bank" style="font-size:20px"></i>', `<div class="pay-body hidden" id="payBank">
            <p>Al confirmar, te mostramos la cuenta en soles (BCP, CCI y titular: <b>por confirmar</b>) y reservamos tu pedido por 24 horas. Envía la constancia al WhatsApp ${C.whatsappLabel}.</p>
          </div>`)}
        </div>
        <p class="co-hint" style="margin-top:12px"><i class="ph ph-receipt"></i> Te enviamos tu boleta electrónica por WhatsApp.</p>
        <button class="btn co-pay btn-block" type="submit" id="payBtn">Pagar ahora</button>
        <p class="co-legal">Al pagar aceptas los <a href="legal.html#terminos" target="_blank">Términos y condiciones</a> y la <a href="legal.html#privacidad" target="_blank">Política de privacidad</a>.</p>
      </section>
    </form>`;

    const form = $('#coForm');
    const mode = () => $('input[name="mode"]:checked', form).value;
    const pay = () => $('input[name="pay"]:checked', form).value;
    const ship = () => mode() === 'retiro' ? 'tienda' : ($('input[name="ship"]:checked', form)?.value || 'domicilio');
    const shipCost = () => {
      if (mode() === 'retiro') return 0;
      return $('#reg').value === 'Piura' ? C.shippingAccessories.piura : C.shippingAccessories.provincias;
    };
    const slow = () => Cart.items().some(i => AS.findAny(i.id)?.stock === 'pedido');
    const paintMethods = () => {
      const t = Cart.totals(shipCost()), days = slow() ? '6 a 7 días' : '3 a 5 días';
      const price = t.hasPhone ? 'GRATIS' : fmt(shipCost());
      const cur = $('input[name="ship"]:checked', form)?.value || 'domicilio';
      $('#shipMethods').innerHTML =
        radio('ship', 'domicilio', cur === 'domicilio', `<b>Envío a domicilio</b><small>Llega en ${days}</small>`, `<b>${price}</b>`) +
        radio('ship', 'agencia', cur === 'agencia', `<b>Recojo en agencia (${AS.agencies.slice(0, 2).join(' u ')})</b><small>Llega en ${days}. Escribe en Dirección la sede de la agencia.</small>`, `<b>${price}</b>`);
    };
    const paintSum = () => {
      const t = Cart.totals(shipCost()), gifts = Cart.gifts();
      const tax = Math.round(t.total * 18 / 118 * 100) / 100;
      side.innerHTML = `<div class="sum-lines">${t.items.map(i => `<div class="sum-l"><span class="t">${thumbFor(i)}<em>${i.qty}</em></span><div>${i.name}<small>${i.opt ? i.opt + ' · ' + AS.finishes[i.finish].name : i.type === 'combo' ? 'Combo' : 'Accesorio'}</small></div><b>${fmt(i.price * i.qty)}</b></div>`).join('')}
        ${gifts.map(g => `<div class="sum-l"><span class="t"><i class="ph ph-${g.icon}" style="color:var(--orange)"></i><em>${g.qty}</em></span><div>${g.name}<small>Regalo de lanzamiento</small></div><b>Gratis</b></div>`).join('')}</div>
        <form class="sum-cpn" id="cpnF" novalidate><label class="sr" for="cpn">Código de descuento</label><input class="sf-in" id="cpn" placeholder="Código de descuento" value="${t.coupon || ''}"><button class="btn btn-line btn-sm" type="submit">${t.coupon ? 'Quitar' : 'Aplicar'}</button></form>
        <p class="msg" id="cpn-m"></p>
        <div class="sum-r"><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
        ${t.disc ? `<div class="sum-r"><span>Descuento · ${C.coupon.code}</span><span>− ${fmt(t.disc)}</span></div>` : ''}
        <div class="sum-r"><span>Envío</span><span>${t.ship ? fmt(t.ship) : 'GRATIS'}</span></div>
        <div class="sum-r tot"><span>Total</span><span><small>PEN</small> ${fmt(t.total)}</span></div>
        <p class="sum-tax">Incluye ${fmt(tax.toFixed(2))} de impuestos</p>`;
      $('#cpnF').addEventListener('submit', e => {
        e.preventDefault();
        const cur = store.get('as_coupon', null), v = $('#cpn').value.trim().toUpperCase(), m = $('#cpn-m');
        if (cur) { store.set('as_coupon', null); return paintAll(); }
        if (v !== C.coupon.code) { m.className = 'msg e'; m.textContent = 'Este código no es válido.'; return; }
        if (!Cart.items().some(i => i.type !== 'iphone')) { m.className = 'msg e'; m.textContent = 'El código aplica solo a accesorios.'; return; }
        store.set('as_coupon', v); paintAll(); toast('Cupón aplicado a tus accesorios');
      });
      return t;
    };
    const paintAll = () => {
      $('#shipBox').classList.toggle('hidden', mode() !== 'envio');
      $('#pickBox').classList.toggle('hidden', mode() !== 'retiro');
      $('#payCard').classList.toggle('hidden', pay() !== 'tarjeta');
      $('#payBank').classList.toggle('hidden', pay() !== 'transferencia');
      $('#payBtn').textContent = pay() === 'tarjeta' ? 'Pagar ahora' : 'Completar pedido';
      paintMethods();
      return paintSum();
    };
    form.addEventListener('change', e => { if (e.target.name !== 'ship') paintAll(); else paintSum(); });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!AS.validate(form)) { toast('Revisa los campos marcados para continuar.'); return; }
      const t = paintAll(), btn = $('#payBtn');
      btn.disabled = true; btn.textContent = 'Procesando…';
      setTimeout(() => {
        const no = 'AS-' + String(Date.now()).slice(-6);
        const shipTxt = { domicilio: 'Envío a domicilio', agencia: 'Recojo en agencia', tienda: 'Retiro en tienda' }[ship()];
        const order = { no, date: new Date().toLocaleDateString('es-PE'), total: t.total, items: t.items.map(i => `${i.qty} x ${i.name}${i.opt ? ' ' + i.opt : ''}`), ship: ship(), pay: pay(), status: pay() === 'tarjeta' ? 'Pagado' : 'Esperando transferencia' };
        store.set('as_orders', [order, ...store.get('as_orders', [])]);
        Cart.clear();
        const name = (mode() === 'retiro' ? $('#pnom') : $('#nom')).value.trim();
        const msg = `Hola AppleSpot, soy ${name}. Mi pedido es ${no}:\n${order.items.map(x => '• ' + x).join('\n')}\nEntrega: ${shipTxt}\nPago: ${pay()}\nTotal: ${fmt(t.total)}`;
        $('.co-grid').classList.add('empty-co'); side.innerHTML = '';
        root.innerHTML = `<div class="panel done"><div class="ico"><i class="ph ph-check"></i></div><h2>Gracias, ${name}</h2><p>${pay() === 'tarjeta' ? 'Recibimos tu pago.' : 'Tu pedido está reservado por 24 horas. Envía la constancia de transferencia por WhatsApp para confirmarlo.'} Te escribiremos al WhatsApp con tu boleta, el IMEI y el código de seguimiento.</p><span class="order-no">${no}</span><div class="ctas"><a class="btn btn-wa" href="${wa(msg)}" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo"></i>Enviar pedido por WhatsApp</a><a class="btn btn-line" href="cuenta.html">Ver mis pedidos</a></div></div>`;
        scrollTo({ top: 0, behavior: 'smooth' });
      }, 1200);
    });
    paintAll();
  },

  cuenta() {
    const root = $('#acct');
    const render = () => {
      const user = store.get('as_user', null);
      if (user) {
        const orders = store.get('as_orders', []);
        root.innerHTML = `<div class="row-head"><div><p class="kicker">Mi cuenta</p><h1 style="font-size:48px;line-height:1;letter-spacing:-.025em;margin-top:12px">Hola, ${user.name}</h1></div><button class="btn btn-line btn-sm" id="logout">Cerrar sesión</button></div>
          <div class="panel"><h2>Mis pedidos</h2>${orders.length ? orders.map(o => `<div class="line" style="grid-template-columns:1fr auto"><div><h3>${o.no} · ${o.date}</h3><p class="meta">${o.items.join(' · ')}</p><span class="gift-tag" style="color:${o.status === 'Pagado' ? 'var(--ok)' : 'var(--ember)'}"><i class="ph-fill ph-circle"></i>${o.status}</span></div><div class="r"><b>${fmt(o.total)}</b><a class="rm" href="${wa('Hola, consulto por mi pedido ' + o.no)}" target="_blank" rel="noopener">Consultar estado</a></div></div>`).join('') : `<div style="margin-top:24px">${emptyState('package', 'Aún no tienes pedidos', 'Cuando compres, aquí verás el estado de cada pedido y su código.', '<a class="btn btn-dark" href="iphone.html">Ver iPhone</a>')}</div>`}</div>`;
        $('#logout').addEventListener('click', () => { store.set('as_user', null); render(); toast('Cerraste sesión'); });
        AS.reveal(root); return;
      }
      /* Inicio de sesión sin contraseña, como las cuentas de clientes de Shopify:
         correo → código de 6 dígitos. Si el correo no tiene cuenta, se crea sola. */
      const head = `<div class="auth-brand"><img src="assets/isotipo.png" alt="" width="40" height="40"></div>`;
      const legal = `<p class="auth-legal">Si continúas, aceptas nuestros <a href="legal.html#terminos">Términos del servicio</a> y la <a href="legal.html#privacidad">Política de privacidad</a>.</p>`;
      const stepEmail = () => {
        root.innerHTML = `<div class="auth panel">${head}
          <h1>Iniciar sesión</h1><p class="auth-sub">Inicia sesión o crea una cuenta</p>
          <button class="btn btn-shop btn-block" type="button" id="shopBtn">Continuar con Shop</button>
          <div class="auth-or"><span>o</span></div>
          <form id="mailF" novalidate>
            <label class="sr" for="amail">Correo electrónico</label>
            <div class="input-row auth-input" id="amailRow"><input id="amail" type="email" placeholder="Correo electrónico" autocomplete="email" data-v="req mail" data-msg="Revisa el formato del correo, por ejemplo nombre@gmail.com."><button type="submit" aria-label="Continuar"><i class="ph ph-arrow-right"></i></button></div>
            <p class="msg" id="amail-m"></p>
            <label class="check"><input type="checkbox" id="anews"><span>Enviarme novedades y ofertas por correo electrónico</span></label>
          </form>${legal}</div>
          <p class="auth-guest">¿Solo quieres comprar? No necesitas cuenta: puedes pagar como invitado.</p>`;
        $('#shopBtn').addEventListener('click', () => toast('En la tienda real se abre el inicio de sesión de Shop'));
        $('#mailF').addEventListener('submit', e => { e.preventDefault(); if (AS.validate(e.target)) stepCode($('#amail').value.trim()); });
      };
      const stepCode = mail => {
        root.innerHTML = `<div class="auth panel">${head}
          <h1>Ingresa el código</h1><p class="auth-sub">Lo enviamos a <b>${mail}</b></p>
          <form id="codeF" novalidate>
            <div class="field"><label class="sr" for="acode">Código de 6 dígitos</label><input class="inp auth-code" id="acode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" data-v="req code" data-msg="El código tiene 6 dígitos."><p class="msg" id="acode-m"></p></div>
            <button class="btn btn-primary btn-block" type="submit">Continuar</button>
          </form>
          <div class="auth-links"><button type="button" id="backMail">Cambiar correo</button><button type="button" id="resend">Reenviar código</button></div>
          <p class="auth-legal">Prototipo: escribe cualquier código de 6 dígitos.</p></div>`;
        $('#acode').focus();
        $('#backMail').addEventListener('click', stepEmail);
        $('#resend').addEventListener('click', () => toast('Te enviamos un código nuevo'));
        $('#codeF').addEventListener('submit', e => {
          e.preventDefault(); if (!AS.validate(e.target)) return;
          store.set('as_user', { name: mail.split('@')[0], email: mail }); render(); toast('Sesión iniciada');
        });
      };
      stepEmail();
    };
    render();
  },

  preguntas() {
    AS.sections.faq($('#faq'), AS.faq, true);
    $('#faqWa').href = wa('Hola, tengo una pregunta');
  },

  tienda() { AS.sections.visit($('#visit'), true); },

  legal() {
    const links = $$('.legal-nav a[href^="#"]');
    const mark = id => links.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + id));
    const obs = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && mark(e.target.id)), { rootMargin: '-30% 0px -60% 0px' });
    $$('.doc article').forEach(a => obs.observe(a));
    mark((location.hash || '#terminos').slice(1));
  },

  reclamaciones() {
    const root = $('#rec');
    const today = new Date().toLocaleDateString('es-PE');
    root.innerHTML = `<form class="form" id="recF" novalidate>
      <div class="panel"><div class="panel-step"><span class="n">1</span><h2>Datos del consumidor</h2></div><div class="form">
        <p class="note" style="justify-content:flex-start;margin:0"><i class="ph ph-calendar"></i>Fecha: ${today} · Hoja N.° ${String(Date.now()).slice(-6)}</p>
        <div class="two">${field('rn', 'Nombres y apellidos', 'data-v="req"')}${field('rd', 'DNI o carné de extranjería', 'data-v="req doc" data-msg="Ingresa entre 8 y 12 caracteres."')}</div>
        ${field('rdir', 'Domicilio', 'data-v="req"')}
        <div class="two">${field('rt', 'Teléfono', 'data-v="req cel" inputmode="numeric" data-msg="Ingresa 9 dígitos, empezando con 9."', 'tel')}${field('re', 'Correo', 'data-v="req mail" data-msg="Revisa el formato del correo."', 'email')}</div>
        <label class="check"><input type="checkbox" id="rmen"><span>Soy menor de edad (lo completa mi padre, madre o apoderado)</span></label>
        <div class="hidden" id="rapo">${field('rap', 'Nombre del padre, madre o apoderado', 'data-v="req"')}</div>
      </div></div>
      <div class="panel"><div class="panel-step"><span class="n">2</span><h2>Bien contratado</h2></div><div class="form">
        <div class="choice cols2"><label class="ch"><input type="radio" name="bien" value="Producto" checked><i class="ph ph-device-mobile"></i><span><b>Producto</b></span><span class="tick"><i class="ph ph-check"></i></span></label><label class="ch"><input type="radio" name="bien" value="Servicio"><i class="ph ph-wrench"></i><span><b>Servicio</b></span><span class="tick"><i class="ph ph-check"></i></span></label></div>
        <div class="two">${field('rm', 'Monto reclamado (S/)', 'inputmode="decimal"', 'text', true)}${field('rpe', 'N.° de pedido o boleta', '', 'text', true)}</div>
        <div class="field"><label for="rdesc">Descripción del producto o servicio</label><textarea class="inp" id="rdesc" data-v="req"></textarea><p class="msg" id="rdesc-m"></p></div>
      </div></div>
      <div class="panel"><div class="panel-step"><span class="n">3</span><h2>Detalle</h2></div><div class="form">
        <div class="choice cols2"><label class="ch"><input type="radio" name="tipo" value="Reclamo" checked><i class="ph ph-warning-circle"></i><span><b>Reclamo</b><small>Disconformidad con el producto o servicio</small></span><span class="tick"><i class="ph ph-check"></i></span></label><label class="ch"><input type="radio" name="tipo" value="Queja"><i class="ph ph-chat-circle-text"></i><span><b>Queja</b><small>Malestar con la atención recibida</small></span><span class="tick"><i class="ph ph-check"></i></span></label></div>
        <div class="field"><label for="rdet">Detalle del reclamo o queja</label><textarea class="inp" id="rdet" data-v="req"></textarea><p class="msg" id="rdet-m"></p></div>
        <div class="field"><label for="rped">Pedido del consumidor</label><textarea class="inp" id="rped" data-v="req" placeholder="¿Qué solución esperas?"></textarea><p class="msg" id="rped-m"></p></div>
        <div><label class="check"><input type="checkbox" id="rok" data-v="req" data-msg-req="Confirma la declaración para enviar."><span>Declaro que la información es verdadera. La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante INDECOPI.</span></label><p class="msg" id="rok-m"></p></div>
        <button class="btn btn-primary" type="submit" style="justify-self:start">Enviar reclamo</button>
        <p class="note" style="justify-content:flex-start;margin:0"><i class="ph ph-info"></i>Responderemos en un plazo máximo de 15 días hábiles al correo indicado.</p>
      </div></div></form>`;
    $('#rmen').addEventListener('change', e => $('#rapo').classList.toggle('hidden', !e.target.checked));
    $('#recF').addEventListener('submit', e => {
      e.preventDefault(); if (!AS.validate(e.target)) return;
      const code = `R-2026-${String(Date.now()).slice(-6)}`;
      root.innerHTML = `<div class="panel done"><div class="ico"><i class="ph ph-check"></i></div><h2>Registramos tu ${$('input[name="tipo"]:checked').value.toLowerCase()}</h2><p>Guardamos una copia y la enviamos a ${$('#re').value}. Te responderemos en un máximo de 15 días hábiles.</p><span class="order-no">${code}</span><div class="ctas"><a class="btn btn-line" href="index.html">Volver al inicio</a></div></div>`;
      scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};
})();
