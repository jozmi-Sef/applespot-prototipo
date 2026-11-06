/* =========================================================
   AppleSpot · Datos de la tienda
   Todo el contenido editable vive aquí: promociones, productos,
   accesorios y datos de contacto. Cambia esto, no el diseño.
   Precios REFERENCIALES: reemplazar con el Excel de productos.
   ========================================================= */
window.AS = window.AS || {};

AS.config = {
  whatsapp: '51973785590',
  whatsappLabel: '973 785 590',
  email: 'fabricioariel52@gmail.com',
  ruc: '10777929726',
  address: 'Jr. Arequipa 147, Piura',
  addressRef: 'Frente a la iglesia Cruz del Norte, por el puente rojo',
  hours: ['Lunes a viernes, 10:00 a. m. a 7:30 p. m.', 'Domingos, 10:00 a. m. a 4:00 p. m.'],
  instagram: 'https://www.instagram.com/apple.spot1',
  tiktok: 'https://www.tiktok.com/@apple.spot1',
  facebook: 'https://www.facebook.com/share/1DL5jT6W9v/',
  // Fin de la promoción de lanzamiento (primer mes)
  launchEnds: '2026-12-04T23:59:00-05:00',
  // Cupón de primera compra (solo accesorios)
  coupon: { code: 'PRIMERA10', pct: 10, appliesTo: 'accesorio' },
  // Video para el giro 3D con scroll. Déjalo vacío para usar el iPhone 3D dibujado.
  // Ejemplo: 'assets/video/iphone-18-pro-max-giro.mp4'
  scrollVideo: '',  // Costos referenciales de envío cuando el pedido NO incluye iPhone
  shippingAccessories: { piura: 8, provincias: 15 }
};

/* Barra de anuncios: rota entre mensajes */
AS.announcements = [
  '<b>10% de descuento</b> en tu primera compra de accesorios',
  '<b>Envío gratis a todo el Perú</b> por la compra de tu iPhone',
  '<b>Lanzamiento:</b> cubo 20W original de regalo con cualquier iPhone'
];

/* ---------------------------------------------------------
   BANNERS DE PROMOCIÓN (carrusel de la portada y de Ofertas)
   visual: 'phones' | 'gift' | 'accessories' | 'image'
   Si usas visual 'image', sube dos piezas:
     desktop 2880 x 1200 px · mobile 1080 x 1350 px
   --------------------------------------------------------- */
AS.promos = [
  {
    id: 'portada-18',
    kicker: 'Nuevo · Sellado · Original',
    title: 'iPhone 18 Pro Max',
    accent: 'La cámara que llevas siempre',
    sub: 'Equipos originales y sellados, con garantía de 1 año y envío gratis a todo el Perú.',
    cta: 'Compra ahora', href: 'producto.html?id=iphone-18-pro-max',
    secondary: { label: 'Ver toda la línea 18', href: 'iphone.html?serie=18' },
    visual: 'phones', color: 'cosmic'
  },
  {
    id: 'lanzamiento',
    kicker: 'Promoción de lanzamiento',
    title: 'Llévate un regalo con tu iPhone',
    accent: 'Cubo 20W original + AirPods',
    sub: 'Cubo 20W con cualquier iPhone. Del 17 Pro al 18 Pro Max, también te llevas unos AirPods. Solo el primer mes.',
    cta: 'Ver equipos con regalo', href: 'ofertas.html',
    visual: 'gift', countdown: true
  },
  {
    id: 'accesorios-10',
    kicker: 'Primera compra',
    title: '10% en accesorios',
    accent: 'Originales y certificados',
    sub: 'Cubos, cables y cases para tu iPhone. Usa el código PRIMERA10 en tu primera compra.',
    cta: 'Comprar accesorios', href: 'accesorios.html',
    visual: 'accessories'
  }
  // Ejemplo de banner con imagen diseñada:
  // { id:'cyber', title:'Cyber AppleSpot', sub:'Hasta S/ 400 menos', cta:'Ver ofertas', href:'ofertas.html',
  //   visual:'image', image:'assets/banners/cyber-desktop.jpg', imageMobile:'assets/banners/cyber-mobile.jpg' }
];

/* Paleta de acabados para los iPhone dibujados */
AS.finishes = {
  cosmic:  { name: 'Naranja cósmico', a: '#F7A54B', b: '#A9501A', dot: '#D9792C' },
  deep:    { name: 'Azul profundo',   a: '#55617A', b: '#1F2531', dot: '#3A4352' },
  silver:  { name: 'Plata',           a: '#F4F4F1', b: '#C4C4BF', dot: '#E6E6E2' },
  black:   { name: 'Negro',           a: '#3A3A3C', b: '#111111', dot: '#1E1E1E' },
  natural: { name: 'Titanio natural', a: '#D8D2C6', b: '#9C968B', dot: '#BDB6A9' },
  desert:  { name: 'Titanio desierto',a: '#E2C7A8', b: '#A68260', dot: '#C9A882' },
  white:   { name: 'Blanco',          a: '#FAFAF8', b: '#D9D9D5', dot: '#F2F2EF' },
  blue:    { name: 'Azul',            a: '#A9C3DE', b: '#5D7896', dot: '#8BA7C4' },
  pink:    { name: 'Rosado',          a: '#F4CFD3', b: '#C98E96', dot: '#E9B4BA' },
  green:   { name: 'Verde',           a: '#C9DCC6', b: '#7D9879', dot: '#A9C2A5' },
  sage:    { name: 'Salvia',          a: '#C7CDB6', b: '#89917A', dot: '#ADB49B' },
  lavender:{ name: 'Lavanda',         a: '#D9CDEB', b: '#9A8BB5', dot: '#C2B4DA' }
};

/* ---------------------------------------------------------
   iPHONE (24 modelos, del 12 al 18 Pro Max)
   condition: 'nuevo' (garantía 12 meses) | 'seminuevo' | 'exhibicion' (6 meses)
   stock: 'stock' (3 a 5 días) | 'pedido' (6 a 7 días)
   prices: precio por capacidad · old: precio anterior tachado
   --------------------------------------------------------- */
const P = (id, name, serie, condition, stock, finishes, prices, opts = {}) => ({
  id, name, serie, type: 'iphone', condition, stock, finishes, prices, ...opts
});

AS.products = [
  P('iphone-18-pro-max', 'iPhone 18 Pro Max', 18, 'nuevo', 'stock', ['cosmic','deep','silver'],
    { '256 GB': [6489, 6899], '512 GB': [7249, 7699], '1 TB': [8379, 8899] }, { star: true, badge: 'AirPods de regalo', airpods: true, isNew: true }),
  P('iphone-18-pro', 'iPhone 18 Pro', 18, 'nuevo', 'stock', ['deep','cosmic','silver'],
    { '256 GB': [5679, 6049], '512 GB': [6439, 6849], '1 TB': [7569, 7999] }, { star: true, badge: 'AirPods de regalo', airpods: true, isNew: true }),
  P('iphone-17-pro-max', 'iPhone 17 Pro Max', 17, 'nuevo', 'stock', ['silver','cosmic','deep'],
    { '256 GB': [5199, 5549], '512 GB': [5899, 6299], '1 TB': [6949, 7399] }, { star: true, badge: 'Más vendido', airpods: true }),
  P('iphone-17-pro', 'iPhone 17 Pro', 17, 'nuevo', 'stock', ['cosmic','deep','silver'],
    { '256 GB': [4579, 4899], '512 GB': [5289, 5649], '1 TB': [6319, 6749] }, { star: true, airpods: true }),
  P('iphone-air', 'iPhone Air', 17, 'nuevo', 'pedido', ['black','white','blue'],
    { '256 GB': [4189, 4459], '512 GB': [4899, 5199] }),
  P('iphone-17', 'iPhone 17', 17, 'nuevo', 'stock', ['lavender','sage','black','white'],
    { '256 GB': [3449, 3689], '512 GB': [4159, 4429] }),
  P('iphone-16e', 'iPhone 16e', 16, 'nuevo', 'pedido', ['black','white'],
    { '128 GB': [2389, 2549], '256 GB': [2779, 2949] }),
  P('iphone-16-pro-max', 'iPhone 16 Pro Max', 16, 'nuevo', 'stock', ['desert','natural','black'],
    { '256 GB': [4389, 4799], '512 GB': [5079, 5499] }),
  P('iphone-16-pro', 'iPhone 16 Pro', 16, 'nuevo', 'stock', ['desert','natural','black'],
    { '128 GB': [3689, 3999], '256 GB': [4079, 4399] }),
  P('iphone-16-plus', 'iPhone 16 Plus', 16, 'nuevo', 'pedido', ['blue','pink','black'],
    { '128 GB': [3149, 3399] }),
  P('iphone-16', 'iPhone 16', 16, 'nuevo', 'stock', ['blue','pink','white','black'],
    { '128 GB': [2849, 3049], '256 GB': [3239, 3459] }),
  P('iphone-15-pro-max', 'iPhone 15 Pro Max', 15, 'seminuevo', 'stock', ['natural','blue','black'],
    { '256 GB': [3289, 3549], '512 GB': [3689, 3949] }),
  P('iphone-15-pro', 'iPhone 15 Pro', 15, 'seminuevo', 'stock', ['natural','black','white'],
    { '128 GB': [2689, 2899], '256 GB': [2989, 3199] }),
  P('iphone-15-plus', 'iPhone 15 Plus', 15, 'exhibicion', 'pedido', ['pink','blue','black'],
    { '128 GB': [2349, 2549] }),
  P('iphone-15', 'iPhone 15', 15, 'seminuevo', 'stock', ['pink','blue','green','black'],
    { '128 GB': [2079, 2249], '256 GB': [2379, 2549] }),
  P('iphone-14-pro-max', 'iPhone 14 Pro Max', 14, 'seminuevo', 'stock', ['natural','black','silver'],
    { '128 GB': [2589, 2799], '256 GB': [2849, 3049] }),
  P('iphone-14-pro', 'iPhone 14 Pro', 14, 'seminuevo', 'stock', ['lavender','black','silver'],
    { '128 GB': [2289, 2479] }),
  P('iphone-14', 'iPhone 14', 14, 'exhibicion', 'stock', ['blue','white','black'],
    { '128 GB': [1679, 1849] }),
  P('iphone-13-pro-max', 'iPhone 13 Pro Max', 13, 'seminuevo', 'stock', ['sage','silver','deep'],
    { '128 GB': [2079, 2249], '256 GB': [2299, 2479] }),
  P('iphone-13-pro', 'iPhone 13 Pro', 13, 'seminuevo', 'pedido', ['sage','silver','blue'],
    { '128 GB': [1849, 1999] }),
  P('iphone-13', 'iPhone 13', 13, 'seminuevo', 'stock', ['pink','blue','white','black'],
    { '128 GB': [1389, 1529] }),
  P('iphone-12-pro-max', 'iPhone 12 Pro Max', 12, 'seminuevo', 'pedido', ['blue','silver','black'],
    { '128 GB': [1589, 1749] }),
  P('iphone-12-pro', 'iPhone 12 Pro', 12, 'seminuevo', 'pedido', ['blue','silver'],
    { '128 GB': [1349, 1489] }),
  P('iphone-12', 'iPhone 12', 12, 'exhibicion', 'stock', ['white','blue','black'],
    { '64 GB': [1049, 1169], '128 GB': [1189, 1299] })
];

/* ---------------------------------------------------------
   COMPARADOR (inicio). Especificaciones según fichas públicas:
   verificar con apple.com antes de publicar.
   --------------------------------------------------------- */
AS.compare = {
  'iphone-18-pro-max': { screen: '6,9"', chip: 'A20 Pro', battery: 'La mayor de la línea', size: 'Grande', ideal: 'Contenido, video y pantalla grande' },
  'iphone-18-pro':     { screen: '6,3"', chip: 'A20 Pro', battery: 'Todo el día', size: 'Compacto', ideal: 'Lo último en un tamaño cómodo' },
  'iphone-17-pro-max': { screen: '6,9"', chip: 'A19 Pro', battery: 'Muy alta', size: 'Grande', ideal: 'Pantalla grande a mejor precio' },
  'iphone-17-pro':     { screen: '6,3"', chip: 'A19 Pro', battery: 'Todo el día', size: 'Compacto', ideal: 'La opción Pro más accesible' }
};

/* ---------------------------------------------------------
   ESTADO DE SEMINUEVOS Y EXHIBICIÓN
   battery: salud de batería en % · grade: estado estético (A o B)
   VALORES REFERENCIALES: reemplazar con los datos reales de cada equipo
   --------------------------------------------------------- */
AS.grades = {
  A: { name: 'Grado A', desc: 'Como nuevo. Sin rayones ni golpes visibles.' },
  B: { name: 'Grado B', desc: 'Detalles leves de uso que no afectan el funcionamiento.' }
};
const USED = {
  'iphone-15-pro-max': [92, 'A'], 'iphone-15-pro': [90, 'A'], 'iphone-15-plus': [98, 'A'], 'iphone-15': [91, 'A'],
  'iphone-14-pro-max': [88, 'A'], 'iphone-14-pro': [87, 'B'], 'iphone-14': [96, 'A'],
  'iphone-13-pro-max': [86, 'B'], 'iphone-13-pro': [85, 'B'], 'iphone-13': [87, 'A'],
  'iphone-12-pro-max': [84, 'B'], 'iphone-12-pro': [83, 'B'], 'iphone-12': [95, 'A']
};
AS.products.forEach(p => { if (USED[p.id]) [p.battery, p.grade] = USED[p.id]; });

/* ---------------------------------------------------------
   ACCESORIOS
   sub: 'cubos-originales' | 'cables-originales' | 'cases' | 'cubos-certificados' | 'cables-certificados'
   --------------------------------------------------------- */
AS.accessorySubs = {
  'cubos-originales':    { name: 'Cubos originales',    icon: 'plug' },
  'cables-originales':   { name: 'Cables originales',   icon: 'lightning' },
  'cases':               { name: 'Cases',               icon: 'device-mobile' },
  'cubos-certificados':  { name: 'Cubos certificados',  icon: 'plug-charging' },
  'cables-certificados': { name: 'Cables certificados', icon: 'usb' }
};

const A = (id, name, sub, price, old, desc, opts = {}) => ({ id, name, sub, type: 'accesorio', price, old, desc, stock: 'stock', ...opts });

AS.accessories = [
  A('cubo-20w-original', 'Cubo 20W USB C original', 'cubos-originales', 99, 119, 'Carga rápida original para cualquier iPhone con cable USB C.', { best: true }),
  A('cubo-35w-dual-original', 'Cubo 35W doble USB C original', 'cubos-originales', 219, 249, 'Carga dos equipos a la vez. Ideal para iPhone y AirPods.'),
  A('cable-usbc-1m-original', 'Cable USB C a USB C 1 m original', 'cables-originales', 79, 95, 'Para iPhone 15 en adelante. Tejido resistente.', { best: true }),
  A('cable-usbc-lightning-original', 'Cable USB C a Lightning 1 m original', 'cables-originales', 89, 105, 'Para iPhone 12 al 14 con carga rápida.'),
  A('case-silicona-magsafe', 'Case de silicona con MagSafe', 'cases', 129, 149, 'Compatible con cargadores MagSafe. Varios colores.', { best: true }),
  A('case-transparente-magsafe', 'Case transparente con MagSafe', 'cases', 89, 109, 'Muestra el color de tu iPhone sin perder protección.'),
  A('case-antigolpes', 'Case antigolpes con esquinas reforzadas', 'cases', 59, 75, 'Protección extra para el uso diario.'),
  A('cubo-20w-certificado', 'Cubo 20W USB C certificado', 'cubos-certificados', 45, 59, 'Carga rápida certificada a un precio accesible.'),
  A('cubo-25w-certificado', 'Cubo 25W USB C certificado', 'cubos-certificados', 55, 69, 'Más potencia para equipos recientes.'),
  A('cable-usbc-certificado', 'Cable USB C a USB C certificado', 'cables-certificados', 29, 39, 'Repuesto confiable para casa u oficina.'),
  A('cable-lightning-certificado', 'Cable USB C a Lightning certificado', 'cables-certificados', 35, 45, 'Para iPhone 12 al 14.')
];

/* Combos (packs) */
AS.combos = [
  { id: 'combo-original', name: 'Combo carga original', items: ['cubo-20w-original', 'cable-usbc-1m-original'], price: 159, icon: 'plug' },
  { id: 'combo-proteccion', name: 'Combo protección', items: ['case-transparente-magsafe', 'cable-usbc-certificado'], price: 109, icon: 'shield-check' },
  { id: 'combo-economico', name: 'Combo económico certificado', items: ['cubo-20w-certificado', 'cable-usbc-certificado'], price: 65, icon: 'lightning' }
];

/* Agencias para envío a provincia (referencial) */
AS.agencies = ['Shalom', 'Olva Courier', 'Marvisur', 'Civa Cargo'];

/* Preguntas frecuentes */
AS.faq = [
  { g: 'Equipos', q: '¿Son equipos originales?', a: 'Sí. Todos nuestros equipos son 100% originales e importados. Una vez confirmado tu pago, te compartimos el IMEI por WhatsApp para que lo verifiques en OSIPTEL. Si no pasa la verificación, te cambiamos el equipo sin costo.' },
  { g: 'Equipos', q: '¿Cuentan con garantía?', a: 'Sí. Los equipos nuevos sellados tienen 1 año de garantía. Los equipos seminuevos y de exhibición tienen 6 meses.' },
  { g: 'Equipos', q: '¿Qué diferencia hay entre nuevo, seminuevo y exhibición?', a: 'Nuevo: sellado de fábrica. Seminuevo: usado previamente, revisado y en buen estado estético. Exhibición: equipo usado en vitrina, con uso mínimo.' },
  { g: 'Pagos', q: '¿Venden iPhone en cuotas?', a: 'Sí. Al pagar con tarjeta de crédito en la tienda online puedes elegir de 2 a 12 cuotas. Si hay intereses, los aplica tu banco.' },
  { g: 'Pagos', q: '¿Qué medios de pago aceptan?', a: 'Tarjetas de crédito y débito a través de Culqi, y transferencia bancaria. Todos los precios están en soles.' },
  { g: 'Pagos', q: '¿Entregan comprobante de pago?', a: 'Sí. Te enviamos tu boleta electrónica por WhatsApp una vez confirmado el pago.' },
  { g: 'Envíos', q: '¿Hacen envíos a provincia?', a: 'Sí. El envío es gratis a todo el Perú por la compra de cualquier iPhone, con entrega de 3 a 5 días. No realizamos envíos internacionales.' },
  { g: 'Envíos', q: '¿Puedo recibir mi pedido en agencia?', a: 'Sí. Al pagar eliges entre recibirlo en tu domicilio, recogerlo en agencia o recogerlo en nuestra tienda de Piura.' },
  { g: 'Envíos', q: '¿Cuánto demora un equipo a pedido?', a: 'Los productos a pedido se entregan en 6 a 7 días. Lo verás indicado en la ficha del producto antes de pagar.' },
  { g: 'Garantía', q: '¿Aceptan devoluciones?', a: 'No aceptamos devoluciones por cambio de opinión. Si tu equipo presenta una falla de fábrica, lo atendemos mediante la garantía.' },
  { g: 'Garantía', q: '¿Dónde hago válida la garantía?', a: 'En nuestra tienda de Jr. Arequipa 147, Piura, o escribiéndonos por WhatsApp si estás en provincia.' }
];
