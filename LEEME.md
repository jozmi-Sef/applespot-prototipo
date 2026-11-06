# AppleSpot · Prototipo de tienda

Abre `index.html` con doble clic. Todas las páginas están enlazadas entre sí.

## Páginas
| Página | Archivo |
|---|---|
| Inicio | index.html |
| Catálogo de iPhone (filtros por serie, estado y disponibilidad) | iphone.html |
| Catálogo de accesorios | accesorios.html |
| Ofertas y promociones | ofertas.html |
| Ficha de producto | producto.html?id=iphone-18-pro-max |
| Carrito | carrito.html |
| Pago (domicilio, agencia o recojo; tarjeta o transferencia) | checkout.html |
| Mi cuenta y pedidos | cuenta.html |
| Preguntas frecuentes | preguntas.html |
| Tienda física | tienda.html |
| Nosotros (texto de relleno, pendiente del cliente) | nosotros.html |
| Políticas (términos, envíos, garantía, privacidad) | legal.html |
| Libro de Reclamaciones | reclamaciones.html |
| Error 404 | 404.html |

## Qué se edita y dónde
Todo el contenido está en **assets/js/data.js**. No hace falta tocar el diseño.

- **Promociones y banners:** `AS.promos`. Cada objeto es un banner del carrusel de inicio y de la página de Ofertas.
  Si el diseñador entrega una pieza gráfica, usa `visual: 'image'` con
  `image` (escritorio, 2880 × 1200 px) e `imageMobile` (celular, 1080 × 1350 px).
- **Barra de anuncios:** `AS.announcements`.
- **Productos y precios:** `AS.products` y `AS.accessories`. Los precios actuales son **referenciales**.
- **Combos:** `AS.combos`.
- **Fin de la promoción de lanzamiento:** `AS.config.launchEnds`.
- **Cupón:** `AS.config.coupon` (por defecto PRIMERA10, 10% solo en accesorios).

## Letra Brigends Expanded
Copia el archivo de la letra en `assets/fonts/` con el nombre `BrigendsExpanded.woff2` o `BrigendsExpanded.otf`.
Mientras no esté, se muestra Unbounded, que es parecida.

## Video del giro 3D
Hoy el iPhone que gira está dibujado en código. Para usar un video real:
1. Graba o genera con IA un video de 6 a 8 segundos del iPhone girando sobre fondo negro.
2. Conviértelo para que avance de forma suave con el scroll:
   `ffmpeg -i giro.mp4 -an -vcodec libx264 -g 1 -crf 22 -pix_fmt yuv420p assets/video/iphone-giro.mp4`
3. En data.js escribe `scrollVideo: 'assets/video/iphone-giro.mp4'`.
## Pendiente del cliente
- Fotos reales de producto (fondo blanco, mínimo 1200 × 1200 px).
- Videos de clientes (formato vertical 9:16).
- Datos bancarios para transferencia.
- Llaves de Culqi para activar el pago real.
- Revisión legal de las políticas.
