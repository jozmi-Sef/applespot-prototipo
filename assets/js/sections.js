/* AppleSpot · Bloques reutilizables entre páginas */
(() => {
const { $, $$, fmt, wa } = AS;
const C = AS.config;
AS.sections = {
  /* Videos de clientes: reemplazar src por los videos reales (9:16) */
  reels(el) {
    const list = [
      ['tiktok', 'Unboxing iPhone 17 Pro Max', 'Cliente en Castilla, Piura'],
      ['instagram', 'Unboxing iPhone 16 Pro', 'Entrega en tienda'],
      ['tiktok', 'Unboxing iPhone 17 Pro', 'Envío a Sullana'],
      ['instagram', 'Unboxing iPhone 15', 'Veintiséis de Octubre']
    ];
    el.innerHTML = list.map(([n, t, s]) => `<a class="reel rv" href="${n === 'tiktok' ? C.tiktok : C.instagram}" target="_blank" rel="noopener" aria-label="Ver ${t}"><span class="reel-top"><i class="ph ph-${n}-logo"></i>@apple.spot1</span><span class="play"><i class="ph-fill ph-play"></i></span><span class="reel-cap">${t}<small>${s}</small></span></a>`).join('');
  },
  combos(el) {
    el.innerHTML = AS.combos.map(c => {
      const items = c.items.map(AS.findAny);
      const reg = items.reduce((s, a) => s + a.price, 0);
      return `<li><span class="l"><i class="ph ph-${c.icon}"></i><span>${c.name}<small>${items.map(a => a.name).join(' + ')}</small></span></span><span class="r"><span><b>${fmt(c.price)}</b><s>${fmt(reg)}</s></span><button class="add-mini" data-combo="${c.id}" aria-label="Agregar ${c.name} al carrito"><i class="ph ph-plus"></i></button></span></li>`;
    }).join('');
    el.addEventListener('click', e => { const b = e.target.closest('[data-combo]'); if (b) AS.Cart.add(AS.combos.find(c => c.id === b.dataset.combo)); });
  },
  signup(form) {
    form.innerHTML = `<div><div class="pct">10%</div><h3>de descuento en tu primera compra de accesorios</h3><p>Déjanos tu WhatsApp y te enviamos tu código al instante.</p></div>
      <div class="field">
        <label for="wa">Número de WhatsApp</label>
        <div class="input-row" id="waRow"><span class="prefix">+51</span><input id="wa" type="tel" inputmode="numeric" placeholder="9XX XXX XXX" autocomplete="tel" aria-describedby="waMsg"><button class="btn btn-primary btn-sm" type="submit" style="padding:8px 16px">Quiero mi código</button></div>
        <p class="msg" id="waMsg" role="status"></p>
        <label class="check" style="color:#9B9B9B;font-weight:500"><input type="checkbox" id="waOk">Acepto recibir promociones por WhatsApp según la <a href="legal.html#privacidad" style="color:#fff">política de privacidad</a>.</label>
      </div>`;
    const input = $('#wa', form), row = $('#waRow', form), msg = $('#waMsg', form), ok = $('#waOk', form);
    const err = t => { row.classList.add('err'); msg.className = 'msg e'; msg.textContent = t; };
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = input.value.replace(/\D/g, '');
      if (!v) return err('Ingresa tu número de WhatsApp para recibir el código.');
      if (!/^9\d{8}$/.test(v)) return err('El número debe tener 9 dígitos y empezar con 9.');
      if (!ok.checked) { msg.className = 'msg e'; msg.textContent = 'Marca la casilla para aceptar recibir el código por WhatsApp.'; return; }
      row.classList.remove('err'); msg.className = 'msg ok';
      msg.innerHTML = `Listo. Tu código es <b>${C.coupon.code}</b>. También lo enviamos al ${v.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}.`;
      localStorage.setItem('as_coupon', JSON.stringify(C.coupon.code));
      input.value = '';
    });
    input.addEventListener('input', () => { row.classList.remove('err'); if (msg.classList.contains('e')) msg.textContent = ''; });
  },
  /* Galería: reemplazar por miniaturas reales o un widget de Instagram/TikTok */
  gallery(el) {
    el.innerHTML = Array.from({ length: 6 }, (_, i) => {
      const ig = i % 2 === 0;
      return `<a class="g" href="${ig ? C.instagram : C.tiktok}" target="_blank" rel="noopener" aria-label="${ig ? 'Publicación de Instagram' : 'Video de TikTok'}"><i class="ph ph-${ig ? 'image' : 'video'}"></i><span><i class="ph ph-${ig ? 'instagram' : 'tiktok'}-logo"></i></span></a>`;
    }).join('');
  },
  faq(el, list = AS.faq, grouped = false) {
    let last = '';
    el.innerHTML = list.map((f, i) => {
      const head = grouped && f.g !== last ? `<p class="faq-group">${(last = f.g)}</p>` : '';
      return `${head}<details${i === 0 ? ' open' : ''}><summary>${f.q}<i class="ph ph-plus"></i></summary><p>${f.a}</p></details>`;
    }).join('');
  },
  visit(el, full = false) {
    el.innerHTML = `<div class="visit-card rv">
        <p class="kicker">Tienda física</p><h3 style="margin-top:12px">Visítanos en Piura</h3>
        <div class="vrow"><i class="ph ph-map-pin"></i><div><b>${C.address}</b><span>${C.addressRef}</span></div></div>
        <div class="vrow"><i class="ph ph-clock"></i><div><b>${C.hours[0]}</b><span>${C.hours[1]}</span></div></div>
        <div class="vrow"><i class="ph ph-whatsapp-logo"></i><div><b>${C.whatsappLabel}</b><span>Atención y consultas por WhatsApp</span></div></div>
        ${full ? `<div class="vrow"><i class="ph ph-wrench"></i><div><b>Garantía y revisión técnica</b><span>Trae tu equipo con su boleta en horario de atención.</span></div></div>` : ''}
        <div class="ctas" style="justify-content:flex-start">${full ? `<a href="https://maps.google.com/?q=Jr.+Arequipa+147,+Piura" target="_blank" rel="noopener" class="btn btn-primary">Abrir en Google Maps <i class="ph ph-arrow-up-right"></i></a><a href="${wa('Hola, quiero visitar la tienda')}" target="_blank" rel="noopener" class="btn btn-line">Escríbenos</a>` : `<a href="tienda.html" class="btn btn-primary">Cómo llegar <i class="ph ph-arrow-right"></i></a>`}</div>
      </div>
      <a class="map rv" href="https://maps.google.com/?q=Jr.+Arequipa+147,+Piura" target="_blank" rel="noopener" aria-label="Abrir ubicación en Google Maps">
        <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g style="stroke:var(--d5)" stroke-width="14" fill="none" stroke-linecap="round"><path d="M-20 120 L620 90"/><path d="M-20 300 L620 260"/><path d="M140 -20 L180 420"/><path d="M420 -20 L380 420"/></g>
          <g style="stroke:var(--d4)" stroke-width="6" fill="none"><path d="M-20 200 L620 175"/><path d="M280 -20 L300 420"/><path d="M520 -20 L500 420"/><path d="M40 -20 L60 420"/></g>
          <path d="M-20 360 C 120 330, 220 390, 360 350 S 560 330, 620 360" stroke="#3B2A14" stroke-width="28" fill="none"/>
          <path d="M300 330 L300 380" stroke="#B33A2A" stroke-width="10"/>
        </svg>
        <div class="pin"><div class="tile"><img src="assets/isotipo.png" alt=""></div><small>AppleSpot · ${C.address}</small></div>
      </a>`;
  },
  /* Comparador de los equipos estrella (datos en AS.compare) */
  compare(el) {
    const list = Object.keys(AS.compare).map(id => ({ p: AS.findAny(id), s: AS.compare[id] }));
    const gift = AS.util.launchActive();
    const rows = [
      ['Pantalla', x => x.s.screen], ['Chip', x => x.s.chip], ['Cámaras', () => 'Triple cámara Pro'],
      ['Batería', x => x.s.battery], ['Tamaño', x => x.s.size], ['Garantía', () => '1 año'],
      ...(gift ? [['Regalo de lanzamiento', x => x.p.airpods ? 'AirPods + cubo 20W' : 'Cubo 20W']] : []),
      ['Ideal para', x => x.s.ideal]
    ];
    el.innerHTML = `<table class="cmp"><caption class="sr">Comparación de iPhone 18 Pro Max, 18 Pro, 17 Pro Max y 17 Pro</caption>
      <thead><tr><th scope="col"><span class="sr">Característica</span></th>${list.map(({ p }) => `<th scope="col"><div class="cmp-art" aria-hidden="true">${AS.phoneSVG(p.finishes[0], 'back', '', AS.util.camsFor(p))}</div><b>${p.name}</b><small>Desde ${fmt(AS.util.minPrice(p))}</small></th>`).join('')}</tr></thead>
      <tbody>${rows.map(([t, f]) => `<tr><th scope="row">${t}</th>${list.map(x => `<td>${f(x)}</td>`).join('')}</tr>`).join('')}
      <tr><th scope="row"><span class="sr">Comprar</span></th>${list.map(({ p }) => `<td><a class="btn btn-dark btn-sm" href="producto.html?id=${p.id}">Compra ahora</a></td>`).join('')}</tr></tbody></table>`;
  },
  /* Banner de promoción para páginas internas */
  promoBanner(p) {
    return `<div class="promo-banner rv"><div><p class="kicker">${p.kicker}</p><h2 style="margin-top:12px">${p.title}</h2><p>${p.sub}</p>${p.countdown ? AS.countdownHTML : ''}<div class="ctas" style="margin-top:24px"><a href="${p.href}" class="btn btn-primary">${p.cta} <i class="ph ph-arrow-right"></i></a></div></div>${p.visual === 'phones'
      ? `<div class="art-phones banner-art">${AS.phoneSVG('cosmic', 'front', 'b')}${AS.phoneSVG(p.color || 'cosmic', 'back', 'f')}</div>`
      : `<div class="banner-icons">${(p.visual === 'gift' ? ['device-mobile', 'plug', 'headphones'] : ['plug', 'lightning', 'device-mobile', 'usb']).map(i => `<span><i class="ph ph-${i}"></i></span>`).join('')}</div>`}</div>`;
  }
};
})();
