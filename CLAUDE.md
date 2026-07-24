# CLAUDE.md — Tienda de mapas personalizados (print on demand)

## Qué es este proyecto

E-commerce D2C de cuadros de mapas de ciudades personalizables. El cliente
elige su ciudad, ajusta colores/capas/texto en un editor en vivo, elige
tamaño y marco, paga, y el póster se imprime y envía vía print on demand
(Gelato). Sin stock, sin logística propia, coste fijo ~0€.

Referencia visual: pósters estilo "midnight blue + gold" (fondo azul
oscuro, callejero dorado, bloque tipográfico con ciudad/país/coordenadas).

## Stack decidido

- **Motor de personalización:** fork de [terraink](https://github.com/yousifamanuel/terraink)
  — React 18 + TypeScript + Vite + MapLibre GL. Corre con Bun.
  Trae Dockerfile, docker-compose y nginx.conf.
- **Tiles:** OpenFreeMap (`https://tiles.openfreemap.org/planet`), esquema
  OpenMapTiles. Gratis, sin API key, uso comercial permitido. Cero coste
  variable por mapa.
- **Backend nuevo (a crear):** API pequeña (Node/Bun + Hono o Express)
  para upload del diseño exportado, checkout y webhooks.
- **Pagos:** Stripe Checkout.
- **POD:** Gelato API (producción local en España, sin cuota mensual).
- **Storage de diseños:** S3-compatible (Cloudflare R2, tier gratuito)
  para guardar el PDF/PNG exportado hasta que Gelato lo recoja. Dominio
  propio conectado: `designs.mapagrama.com`.
- **Hosting:** VPS propio con Docker (frontend estático + API + nginx).
- **DNS/dominio:** `mapagrama.com` migrado a Cloudflare (nameservers
  `jack`/`lily.ns.cloudflare.com`) el 2026-07-21. Registrador sigue siendo
  GoDaddy, solo se delegó el DNS.
- **Correo del dominio:** Zoho Mail no funcionaba — sustituido por
  **Cloudflare Email Routing** (gratis): `contacto@mapagrama.com` (dirección
  oficial de cara al cliente — web, legal, etc.) reenvía al Gmail personal
  del fundador. Para enviar *como* `contacto@mapagrama.com` desde Gmail
  hace falta un relay SMTP (pendiente, se puede reusar Resend para esto).
- **Emails transaccionales:** Resend, dominio verificado (DKIM vía la
  integración automática Resend↔Cloudflare, sin tocar el MX raíz que usa
  Email Routing). Remitente: `orders@mapagrama.com`.

## Restricciones legales — NO NEGOCIABLES

1. **AGPL-3.0:** terraink es AGPL-3.0-only. Al ofrecer el fork modificado
   como servicio web, hay que publicar el código fuente del fork (repo
   público en GitHub con las modificaciones). El backend de checkout/Gelato
   puede ser un servicio separado y privado si no deriva del código AGPL —
   mantenerlo en repo/proceso independiente, comunicación solo por HTTP.
2. **Marca Terraink:** eliminar TODO branding "Terraink" de UI, títulos,
   metadatos y exports (ver TRADEMARK.md del repo). No usar el nombre en
   dominio, marketing ni la web.
3. **Atribución OSM (ODbL):** obligatoria en el póster impreso. Ya se
   renderiza en `src/features/poster/infrastructure/renderer/typography.ts`
   (esquina inferior derecha, alpha 0.55–0.9). Se puede integrar en el
   diseño (mismo tono que el fondo con ~15-20% de contraste, o dentro del
   bloque tipográfico bajo las coordenadas) pero debe seguir siendo legible
   de cerca. NO eliminarla.
4. El crédito "© terraink.app" del export está detrás del flag
   `includeCredits` — desactivarlo es legítimo (no es la atribución OSM).

## Mapa del repo terraink (hallazgos ya verificados)

- `src/core/config.ts` — constantes (tamaños póster 4–45cm, zoom, defaults,
  flags de ads vía env vars `VITE_ADS_*` — dejar OFF).
- `src/features/map/infrastructure/maplibreStyle.ts` — fuente de tiles
  (OpenFreeMap planet).
- `src/features/poster/infrastructure/renderer/typography.ts` — bloque
  tipográfico del póster: título, país, coordenadas, atribución OSM y
  crédito terraink (flag `includeCredits`). Aquí se ajusta el estilo de la
  atribución.
- `src/features/export/` — exportadores: canvas PNG y
  `layeredSvgExporter.ts` (SVG por capas, ideal para imprenta).
- `src/features/theme/` — sistema de temas (colores hex editables en vivo).
- Arquitectura hexagonal por features (application/domain/infrastructure/ui).
- ~143 ficheros TS, 1.4MB de src. Fuentes empaquetadas via @fontsource.

## Flujo de compra (a construir)

1. Cliente diseña en el editor (fork terraink) → clic "Comprar".
2. Frontend genera el export final (SVG/PDF a 300dpi del tamaño elegido)
   en el navegador.
3. `POST /api/designs` → sube el fichero a R2, devuelve `designId`.
4. `POST /api/checkout` con `designId` + variante (tamaño/papel/marco) →
   crea sesión de Stripe Checkout → redirect.
5. Webhook `checkout.session.completed` → crea pedido en Gelato API con la
   URL firmada del fichero en R2 + dirección del cliente.
6. Webhooks de Gelato (producción/envío) → emails de estado al cliente.
7. Job de limpieza: borrar diseños de R2 no comprados a los 30 días.

## Catálogo y precios (verificado con cuenta Gelato real, 2026-07-21)

| Producto | Coste real (prod+envío a Madrid) | Producción | PVP | Margen bruto |
|---|---|---|---|---|
| Póster 30x40 premium matte | 7,90€ + 7,39-8,87€ envío ≈ 15,29-16,77€ | 🇪🇸 España | 29€ | ~12-14€ |
| Póster 50x70 | 18,37€ + 7,39-8,87€ envío ≈ 25,76-27,24€ | 🇪🇸 España | 44€ | ~17-18€ |
| Enmarcado 30x40 (madera natural / negro / dorado) | 21,58€ + 6,63-7,96€ envío ≈ 28,21-29,54€ | 🇪🇸 España | 59€ | ~29-31€ |
| Enmarcado 50x70 (cualquier color/material) | 41,99€ + 19,30-30,99€ envío ≈ 61,29-72,98€ | 🇩🇪 Alemania | 89€ | ~16-28€ |

- Papel: `200-gsm-uncoated` en la API de Gelato — su acabado "Premium Matte".
- Formatos: 30x40 y 50x70cm (ratio cm, no pulgadas — ojo con
  `UnifiedPaperFormat` de Gelato, que tiene tallas "30x40 inch" = 75x100cm
  bajo un nombre parecido).
- El margen fuerte está en enmarcados 30x40 — empujarlos en la UI.
- Restar comisión Stripe (~1,4% + 0,25€) y considerar IVA sobre estos
  márgenes.
- **Confirmado con `orders:quote` de la Gelato Order API:** el enmarcado
  50x70 SIEMPRE se produce en Alemania (probado con madera natural/oscura
  y aluminio en los 5 colores) — no es un problema de color, es el
  tamaño. El 30x40 SÍ produce en España, pero solo en madera natural,
  aluminio negro o aluminio dorado (aluminio plateado/cobre y madera
  oscura también salen de Alemania a ese tamaño). Decisión: se mantiene
  el 50x70 enmarcado con el margen real más bajo (~16-28€ en vez de los
  ~35-45€ estimados originalmente) en vez de subir precio o retirarlo.
- Product UIDs reales ya cargados en `mapagrama-api/src/catalog.ts`
  (repo privado). El catálogo ahora ofrece 3 colores de marco a cada
  tamaño (natural-wood/black/gold), todos al mismo precio ya que el
  coste de Gelato no varía por color dentro de un mismo tamaño.

## Fases de desarrollo

### Fase 0 — Validación (sin código) ✅ COMPLETA (2026-07-20)
- [x] Crear cuenta Gelato (descuento 30% primeras 48h) y volcar precios
      reales al catálogo de arriba.
- [x] Pedir póster de prueba con un diseño midnight blue para validar
      calidad de impresión de fondos oscuros en matte.
- [x] Elegir nombre de marca y dominio (sin "terraink") → **Mapagrama**
      (mapagrama.com).

### Fase 1 — Fork funcional en local
- [x] Fork del repo, `bun install`, `bun run dev`, verificar que corre.
- [x] Eliminar branding Terraink (UI, meta, manifest) según TRADEMARK.md →
      renombrado a Mapagrama en toda la UI, metadata e identificadores
      internos. También se eliminaron las features del modelo gratuito
      original (ads/AdSense, donaciones Ko-fi, estrellas de GitHub, prompt
      de instalación PWA) por no encajar con una tienda de pago.
- [x] Desactivar `includeCredits` por defecto; ads OFF.
- [x] Restyling de la atribución OSM: integrada en el bloque tipográfico
      (centrada, bajo la línea de coordenadas) con opacidad fija y baja
      (0.6) en vez de esquina suelta. Legible de cerca. El crédito de la
      app (`includeCredits`, opcional) se queda en la esquina inferior
      izquierda sin cambios.
- [x] Publicar el fork en GitHub (cumplimiento AGPL) con aviso de licencia
      → repo público en caiodstx/terraink.

### Fase 2 — Backend de pedidos
- [x] API: `POST /designs` (upload a R2), `POST /checkout` (Stripe),
      webhook Stripe → pedido Gelato, webhooks Gelato → emails. Repo
      `mapagrama-api` (Bun + Hono), hermano de este en `../mapagrama-api`.
- [x] Repo separado y privado. Sin código derivado de terraink.
- [x] `gelatoProductUid` reales cargados en `catalog.ts`, verificados con
      la Product Catalog API y `orders:quote` de la cuenta real (ver tabla
      de precios arriba). Catálogo ampliado a 8 variantes (2 pósteres +
      3 colores de marco × 2 tamaños).
- [x] Probado con eventos firmados reales (Stripe test mode) contra el
      servidor corriendo: `POST /checkout` crea sesión real; el webhook
      verifica firma, idempotencia y parseo de metadata correctamente.
      Encontrados y arreglados 2 bugs reales en el proceso: (1) Bun usa el
      proveedor SubtleCrypto, así que `constructEvent` síncrono siempre
      fallaba — cambiado a `constructEventAsync`; (2) el chequeo de
      idempotencia se saltaba pedidos a medio terminar tras un fallo
      transitorio (p.ej. R2 caído) en vez de reintentar — ahora solo se da
      por completado cuando `gelato_order_id` está seteado.
- [x] R2 probado con credenciales reales: upload, URL pública, movido
      `pending/` → `purchased/`, borrado del original. Todo OK.
- [x] Creación real de pedido en Gelato (`POST /v4/orders`) probada con un
      pedido real de verdad (póster 30x40, dirección real, 2026-07-21) —
      el shape de `mapagrama-api/src/lib/gelato.ts` era correcto sin
      cambios. Pedido `5770a0ab-51c0-402f-a953-b56da7ce27fa`, producción
      España, entrega estimada 27-28 julio 2026. Requiere tener la
      "company information" completa en el portal de Gelato (Settings) o
      la API rechaza el pedido con 400 antes de cobrar nada — ya
      completada.
- [x] **Confirmado: el 30% de descuento del primer pedido se aplica
      automáticamente vía API**, sin código promo en el payload (aparece
      como `discounts[].title: "txt_first_order_name"` en la respuesta).
      Precio real del pedido de prueba: 7,90€ − 2,37€ (30%) = 5,53€
      producto + 7,39€ envío = 12,92€ total.
- [x] Resend probado real: dominio `mapagrama.com` verificado (DKIM vía
      integración automática Resend↔Cloudflare, sin tocar el MX raíz que
      usa Cloudflare Email Routing), email de prueba entregado desde
      `orders@mapagrama.com`.
- [x] Docker compose: frontend + api + nginx. Vive en
      `mapagrama-api/docker-compose.yml` (build contexts `../mapagrama` +
      `.`), con reverse-proxy nginx enrutando `/api/*` al backend y el
      resto al frontend. **Desplegado en el VPS de producción**
      (Hetzner CX22, Nuremberg, `159.69.93.51`, hardening SSH/UFW/
      fail2ban aplicado) el 2026-07-21.

### Fase 3 — Capa de tienda ✅ COMPLETA (2026-07-22)
- [x] Selector tamaño/papel/marco en el flujo del editor con precios.
      Tamaño bloqueado a 30x40/50x70cm (los únicos vendibles) vía el
      sistema de layouts existente — WYSIWYG, sin recorte sorpresa al
      comprar. Nueva feature `src/features/checkout/` con `BuyModal`
      (póster/enmarcado + color de marco + precio en vivo desde
      `GET /catalog`) y `BuyFab`.
- [x] Descarga gratuita convertida en vista previa: PNG, 72dpi, marca de
      agua ("MAPAGRAMA — VISTA PREVIA"). PDF/SVG ya no son gratis.
- [x] Página de producto/landing (`/`) con ejemplos (Madrid/Barcelona/
      Gijón, fotos reales — ver entrada de diferenciación/mockups más
      abajo), pasos "cómo funciona" y precios. Router añadido
      (react-router-dom): `/` landing, `/crear` editor, `/pedido/gracias`
      y `/pedido/cancelado` (las dos últimas ya las usa el backend como
      redirect de Stripe).
- [x] Emails transaccionales — ya cubierto por Resend (Fase 2).
- [x] Legal ES: sistema de `LegalModal` ampliado a 4 documentos (aviso
      legal, privacidad, condiciones de venta, desistimiento), traducido
      al español, alojado en `designs.mapagrama.com/legal/*.md` (R2).
      Contenido real escrito con los datos conocidos del negocio,
      exención de desistimiento art. 103 LGDCU incluida explícitamente.
      **NIF real ya puesto** (verificado 2026-07-22 directamente en los
      documentos servidos desde R2). **El texto en sí sigue siendo un
      borrador de partida mío, no confirmado como revisado por un
      gestor/abogado** — pendiente de aclarar con el usuario si ya hubo
      esa revisión profesional antes de darlo por cerrado del todo.
- [x] Flujo de compra probado clic a clic en navegador real — cubierto por
      el pedido real end-to-end de Fase 4 (diseño → `BuyModal` → Stripe
      live → webhook → Gelato).
- [x] Tarjetas de ejemplo de la landing con fotos reales (Madrid/
      Barcelona/Gijón). Añadida además una segunda sección "En tu pared"
      con mockups del póster enmarcado en una habitación real (generados
      con Smartmockups — Gelato Mockup Studio no vale para esto sin tienda
      conectada), en `src/features/landing/ui/LandingPage.tsx` +
      `public/assets/examples/mockups/`.
- [x] Desplegado en el VPS de producción (2026-07-22) y verificado en
      `mapagrama.com` real: `/`, `/crear`, `/pedido/gracias`,
      `/pedido/cancelado` y `/api/catalog` responden 200.
      **Hallazgo:** el VPS Hetzner solo tiene ~1.9GB de RAM (no 4GB) y
      no tenía swap — el build de Docker moría por OOM (`SIGKILL`) al
      compilar el frontend con el bundle de MapLibre. Añadido un
      swapfile de 2GB persistente (`/etc/fstab`) como fix; con más
      código/dependencias futuras puede hacer falta revisar el tamaño
      del servidor.

### Fase 4 — Lanzamiento
- [x] Pedido real end-to-end de prueba (2026-07-22): diseño → `BuyModal` →
      Stripe live → webhook → Gelato. Encontrados y arreglados 2 bugs
      reales que dejaron el primer pedido atascado (pagado, sin llegar a
      Gelato) — recuperado a mano tras el fix, sin coste extra para el
      cliente:
      1. Esta cuenta de Stripe ya reporta la dirección de envío en
         `collected_information.shipping_details`, no en el campo legado
         `session.shipping_details` (vacío) — justo el riesgo que ya
         estaba anotado en el código. `toGelatoShippingAddress` ahora lee
         primero `collected_information`, con fallback al campo legado.
      2. El fallo anterior disparó un reintento de Stripe; para entonces
         `markDesignPurchased` ya había movido el archivo de `pending/` a
         `purchased/`, así que el reintento fallaba con `NoSuchKey` al
         no encontrar el origen. Ahora comprueba primero si el destino
         ya existe y lo trata como hecho.
- [x] Referencia de pedido legible en `/pedido/gracias` (2026-07-22):
      antes mostraba el `session_id` de Stripe en crudo (formato demasiado
      parecido a una API key). Nuevo endpoint `GET /orders/by-session/:id`
      en `mapagrama-api` + `useOrderReference` (poll corto en el frontend,
      ya que el webhook de Stripe que crea el pedido es async) — muestra
      el mismo código corto que ya usa el email de confirmación.
- [x] TLS "Full (strict)" entre Cloudflare y el VPS (2026-07-22): nginx
      sirve HTTPS con un certificado de origen de Cloudflare (15 años,
      `mapagrama-api/ssl/`, gitignored, montado por volumen — nunca en la
      imagen ni en git), puerto 80 redirige a 443. **Incidente en el
      proceso:** desplegar el redirect 80→443 *antes* de confirmar el
      cambio de modo en el dashboard de Cloudflare tumbó la web entera con
      un bucle de redirects (Cloudflare en modo "Flexible" siempre habla
      con el origen por HTTP, así que el redirect del origen a HTTPS
      creaba un bucle infinito) — status 60-90 segundos hasta el fix
      (revertir el redirect, servir contenido normal en :80). Solo se
      reactivó el redirect una vez confirmado el cambio a Full (strict).
      Lección: con Cloudflare de por medio, cualquier cambio de
      comportamiento en el puerto 80 del origen depende del modo SSL/TLS
      configurado en el dashboard, no solo de la config de nginx.
- [x] Backups diarios de la base de pedidos (2026-07-22): cron en el VPS
      (`0 3 * * *`) ejecuta `bun run backup:db` dentro del contenedor
      `api`, que hace `PRAGMA wal_checkpoint` (la db usa WAL, así que un
      copiado en frío del fichero puede perder escrituras recientes),
      comprime y sube a un bucket R2 **separado y privado**
      (`mapagrama-backups`, sin dominio público — el bucket de diseños sí
      lo tiene y no es sitio para backups con emails de clientes). Probado
      con una subida real.
- [x] Firma del webhook de Gelato (2026-07-22): Gelato no firma el cuerpo
      con HMAC como Stripe — el dashboard deja configurar una cabecera
      HTTP con un secreto compartido por webhook
      (`X-Gelato-Webhook-Secret`, verificado con `timingSafeEqual` en
      `routes/webhooks/gelato.ts`). **Hallazgo importante:** no existía
      ningún webhook de Gelato registrado hasta ahora — el código que
      procesa `printed/shipped/delivered` llevaba desde la Fase 2 sin
      recibir tráfico real, así que ningún pedido había recibido esos
      emails de seguimiento (solo el de confirmación inicial, que va por
      Stripe). Ya registrado y probado con el webhook de prueba del
      dashboard de Gelato.
- [x] Diferenciación (2026-07-22): sección "Por qué Mapagrama" en la
      landing (`src/features/landing/ui/LandingPage.tsx`). Deliberadamente
      sin nombrar a Mapiful/Grafomap — la publicidad comparativa citando
      competidor tiene requisitos legales estrictos en ES/UE — en su lugar,
      claims propios verificables (investigado: Mapiful ~45$ con temas de
      color predefinidos y producción en varios países; Grafomap ~49$ con
      ~100 combinaciones cerradas de tema×color): personalización real por
      hexadecimal (no plantillas cerradas), producción en España, precio
      desde 29€ (por debajo del ~45-50€ habitual del sector).
- [x] SEO local (2026-07-22): 10 páginas estáticas pre-renderizadas por
      ciudad española (Madrid, Barcelona, Valencia, Sevilla, Zaragoza,
      Málaga, Bilbao, Gijón, Murcia, Vigo) en `/mapa/<slug>/` — HTML real
      servido directo por nginx (no la SPA), con título/descripción/OG
      específicos por ciudad, generadas por
      `scripts/generate-city-pages.mjs` a partir de `scripts/city-data.mjs`
      (wired a `bun run build`, o `bun run seo:cities` suelto).
      `sitemap.xml` se genera del mismo script. Enlazadas desde la landing
      y entre sí. De paso corregido: `index.html` seguía con meta
      tags/JSON-LD en inglés pese a que el contenido real ya está en
      español — traducido, `lang="es"`.

### Fase 5 — SEO y adquisición ✅ COMPLETA (2026-07-22)

- [x] Google Search Console + Bing Webmaster (2026-07-22): dominio
      verificado en ambos, sitemap enviado y procesado en Search Console
      (12/12 páginas descubiertas), Bing importado directo desde Search
      Console. Bing aún en proceso de indexar (normal, tarda más).
- [x] Escalar a 70 ciudades (2026-07-22): las 52 capitales de provincia
      + ~18 grandes municipios adicionales, cada una con un párrafo
      propio (`blurb` en `src/data/cities.ts`) tejido en el hero y la
      meta description — no solo cambia el nombre de la ciudad, para
      no parecer un patrón doorway-page a ojos de un buscador.
      Refactor de paso: la lista de ciudades vivía duplicada a mano en
      `scripts/city-data.mjs` y en `LandingPage.tsx` — movida a
      `src/data/cities.ts` (dato puro sin código Node-specific, bun
      puede importar `.ts` directo), una sola fuente de verdad para
      la app Vite y el script de generación.
      **Pendiente del usuario:** reenviar el sitemap actualizado en
      Search Console (ahora 72 URLs, antes 12).
- [x] Script de render automático (2026-07-22):
      `scripts/render-city-posters.mjs`, imagen hero + og:image real por
      ciudad (las 70) generada con el motor propio del editor, no un
      mockup. Automatiza `bun run dev` con `puppeteer-core` controlando
      el Edge del sistema en headless, deep-linkeando cada ciudad y
      llamando a `window.mapagramaExportFullAsync` (nueva variante del
      bridge dev-only en `DevExportBridge.tsx` que devuelve el blob en
      base64 en vez de disparar una descarga real). **Playwright con su
      modo de lanzamiento por pipe nunca consiguió conectar por CDP en
      este entorno** (confirmado con curl que el handshake WebSocket
      funciona bien a nivel de red — el problema era específico del
      cliente de Playwright bajo Bun) — `puppeteer-core` con
      `--remote-debugging-port` + polling HTTP sí funcionó, primera
      pasada completa sin fallos (70/70). `scripts/process-examples.mjs`
      redimensiona los PNG de 300dpi a los JPEG/WebP que de verdad se
      sirven. Scripts nuevos: `bun run render:cities`,
      `bun run process:examples`.
- [x] Deep-link: `/mapa/<slug>/` → `/crear?lat=&lon=&city=&country=` con
      el mapa centrado en esa ciudad (2026-07-22, ver Fase 4 — incluyó
      arreglar una condición de carrera real donde el mapa volvía a
      Madrid nada más cargar).
- [x] Schema.org (2026-07-22): Product/AggregateOffer y FAQPage (con
      sección FAQ visible en la landing que coincide palabra por
      palabra con el JSON-LD — Google exige que el schema no esté solo
      oculto) en `LandingPage.tsx`; BreadcrumbList en cada página de
      ciudad (`scripts/generate-city-pages.mjs`).
- [x] Google Merchant Center (2026-07-22): feed real en
      `GET /api/product-feed.txt` (`mapagrama-api/src/routes/productFeed.ts`,
      generado en vivo desde `CATALOG`, mismo patrón que `/catalog` —
      Merchant Center lo vuelve a leer solo, sin subida manual).
      Configurado: España/Español, envío gratuito (confirmado en el
      código de checkout que no se cobra envío aparte — ya va incluido
      en el precio), solo devoluciones de productos defectuosos (no
      "cambió de opinión" — coherente con la exención de desistimiento
      del art. 103 LGDCU que ya redactamos), sin cambios, URL de
      política = `designs.mapagrama.com/legal/withdrawal.md`.
      **Gap conocido:** no hay foto real de marco dorado — esas
      variantes usan la foto del póster sin marco en el feed en vez de
      un marco que no existe todavía. Actualizar cuando exista un
      mockup dorado real.
- [x] Landings de intención de regalo (2026-07-22): /regalo-aniversario,
      /regalo-pareja, /regalo-mudanza — mismo patrón HTML estático que
      las páginas de ciudad (no rutas SPA), contenido propio por
      ocasión (no una plantilla con una palabra cambiada), en
      `src/data/giftIntents.ts`. Enlazadas desde una sección nueva en
      la landing (no en el footer global — ese footer compartido
      también aparece dentro del editor de pago, donde estos enlaces
      no pintan nada) y entre sí.
- [x] Pinterest Business (2026-07-22): cuenta creada, dominio verificado
      (`<meta name="p:domain_verify">` en `index.html`). Catálogo de
      productos enviado reutilizando el mismo feed de Merchant Center
      (`https://mapagrama.com/api/product-feed.txt`) — resultó que
      Pinterest pide casi las mismas columnas que Google (solo faltaba
      `product_type`, ya añadido), así que es un feed único para las
      dos plataformas. Primeros 15 pines creados (12 ciudades variadas +
      las 3 páginas de regalo), usando las imágenes ya generadas y
      copys preparados para cada uno.
- [x] Técnico (2026-07-22): cache-control 1h en `/mapa/*` (nginx.conf —
      no es 1y/immutable como `/assets/` porque no lleva hash de
      contenido en la URL), imágenes de ejemplo/mockups en WebP con
      fallback JPEG, canonical ya presente en cada página de ciudad
      desde que se crearon, confirmado que React Router no tiene
      ninguna ruta `/mapa/*` (cero riesgo de duplicar con las páginas
      estáticas).

### Fase 6 — Conversión y retención

- [x] Analítica de embudo (2026-07-24): eventos landing → /crear →
      BuyModal → checkout → pago. Decisión: **Cloudflare Zaraz**, no Umami
      autoalojado (cero infra nueva en el VPS de 1.9GB) ni GA4 (el fork
      traía un wrapper de gtag.js + Consent Mode v2 sin usar — nunca tuvo
      un `VITE_GA_MEASUREMENT_ID` real — eliminado en vez de activarlo,
      para no tener que montar un banner de cookies real). Zaraz es
      cookieless e inyectado automáticamente en el edge de Cloudflare al
      activarlo por zona, sin `<script>` en `index.html`.
      - `mapagrama/src/core/analytics/zarazAnalytics.ts` sustituye a
        `gtagAnalytics.ts` (borrado) detrás del mismo
        `trackEvent`/`setUserProperty` que ya usaban `useSessionAnalytics`
        (`app_open`), `useExport` (`poster_exported`,
        `time_to_first_export`, `export_failed`) y `useCheckout`
        (`poster_purchase_exported` en el instante de crear la sesión de
        checkout, `purchase_failed`) — instrumentación ya existente,
        simplemente estaba enviando a un gtag inerte. Añadidos
        `landing_view` (`LandingPage.tsx`) y `buy_modal_opened`
        (`BuyModal.tsx`, al abrir el modal).
      - `mapagrama-api`: tabla `events` (`db.ts`, `logEvent`/`queryFunnel`),
        endpoint `POST /events` (`routes/events.ts`) — destino al que
        apunta la Action de Zaraz para los pasos cliente. Protegido con un
        secreto (`EVENTS_INGEST_SECRET`) que viaja como query param
        (`?secret=`), no como header — la UI real del tool "HTTP Request"
        de Zaraz no expone headers custom, solo Endpoint + Method, así que
        el endpoint acepta el secreto y el nombre del evento por header
        *o* por query string (`?secret=...&name=...`). El paso
        `purchase_completed` se registra directo en `logEvent()` desde
        `webhooks/stripe.ts` (server-side, no necesita rebote por Zaraz).
        Script `bun run funnel:report [días]` — conteos por evento y día,
        pensado para consultarlo por SSH, no un dashboard.
      - **Configuración real en el dashboard de Zaraz** (más simple de lo
        planeado inicialmente): no hace falta un Trigger+Action por
        evento. Una única Action sobre el tool "HTTP Request", con
        Desencadenar activadores = solo `All Tracks` (dispara con
        cualquier `zaraz.track()`, cualquier nombre — quitado `Pageview`,
        que no lleva nombre de evento), Endpoint =
        `https://mapagrama.com/api/events?secret=<secreto>&name=` +
        variable `{{ Nombre del evento }}` insertada al final vía el
        selector "+", Method `POST`, "Include Event Properties" activado
        (así las propiedades de cada `trackEvent(name, params)` —
        `variant_id`, `price_cents`, `reason`, `layout`, `format`... —
        viajan en el body y quedan guardadas en `props` sin código
        adicional). Esta única Action cubre automáticamente cualquier
        evento nuevo que se añada en el futuro con solo llamar a
        `trackEvent()`, sin volver a tocar el dashboard.
      - **Verificado en producción** con una visita real (móvil,
        incógnito): `landing_view` → `app_open` → `buy_modal_opened` →
        `poster_purchase_exported` registrados correctamente en la tabla
        `events`, embudo completo hasta el arranque del checkout.
- [x] Recuperación de carritos (2026-07-24): webhook
      `checkout.session.expired` → email Resend con imagen del diseño
      (designId en R2, aún en `pending/` porque nunca se pagó) y enlace que
      recrea la sesión de checkout. El "a las 24h" sale gratis: es el
      tiempo de expiración por defecto de una Checkout Session de Stripe,
      no hay que programar nada aparte — el webhook ya dispara solo a esa
      hora.
      - `mapagrama-api/src/routes/webhooks/stripe.ts`: `handleExpired()`
        nuevo, ramifica antes del filtro que solo dejaba pasar
        `checkout.session.completed`. Solo puede recuperar sesiones donde
        el cliente llegó a escribir su email antes de abandonar — si cerró
        la pestaña antes de eso, Stripe no guarda nada que enlazar, no hay
        nada que recuperar por email en ese caso.
      - **Suscripción del webhook actualizada en Stripe** (vía API, no
        dashboard): el endpoint solo tenía `checkout.session.completed`
        habilitado — añadido `checkout.session.expired` sin tocar nada más
        (`enabled_events` ahora incluye ambos).
      - `mapagrama-api/src/routes/checkout.ts`: lógica de creación de
        sesión extraída a `createSessionFor()`, reutilizada por
        `POST /checkout` (compra normal) y la nueva
        `GET /checkout/resume/:sessionId` (enlace del email — lee los
        metadatos de la sesión expirada, crea una sesión nueva para el
        mismo diseño/variante y redirige 302 directo a Stripe, sin pasar
        por el frontend).
      - Eventos nuevos en la tabla `events` (mismo sistema del ítem
        anterior): `cart_recovery_email_sent`, `cart_recovery_clicked`.
      - Verificado: typecheck limpio, `GET /checkout/resume/` con un id
        inválido devuelve 410 como se espera. La verificación real de
        principio a fin (email disparado a las 24h de un carrito real
        abandonado) queda pendiente de que ocurra de forma orgánica — no
        se puede forzar sin esperar el tiempo real de expiración de Stripe.
      - **Bug de seguridad detectado y arreglado antes de desplegar** (el
        usuario lo señaló al revisar el plan): la primera versión mandaba
        en el email el archivo real de `pending/` — el PNG a 300dpi sin
        marca de agua, exactamente el mismo que se manda a imprenta. El
        enlace de recuperación habría regalado el archivo de calidad de
        imprenta gratis a quien tuviera el email. Arreglado con una
        variante nueva: `useExport.ts` gana el quality `"email-preview"`
        (baja resolución + marca de agua, igual que la vista previa
        gratuita, pero sin contar contra el límite de descargas gratis ni
        disparar su analítica — es un artefacto interno del checkout, no
        una acción del usuario). `useCheckout.ts` la genera y sube en
        segundo plano tras la compra (best-effort, nunca bloquea el pago
        si falla) a `POST /designs/:designId/preview` →
        `pendingPreviewKey()` en R2 (`pending/{designId}-preview.png`,
        clave distinta a la del archivo de compra). El email usa esa
        clave, nunca `pendingKey()`.
- [x] Captura de email (2026-07-24): banner "-10% primer pedido" en la
      landing → cupón Stripe generado al vuelo → lista propia (tabla
      `email_signups` en SQLite + `bun run emails:export` a CSV). RGPD:
      checkbox de consentimiento sin marcar por defecto, obligatorio,
      con enlace a la política de privacidad.
      - `mapagrama-api/src/lib/discount.ts`: coupon `welcome10` (10%,
        `duration: once`) creado de forma perezosa e idempotente
        (retrieve-or-create, sin script de setup aparte). Cada alta de
        email recibe su propio Promotion Code de un solo uso
        (`MAPA10-XXXXXX`, `max_redemptions: 1`) — trazable/revocable
        individualmente en el dashboard de Stripe, a diferencia de un
        código único compartido. Reenviar el mismo email devuelve el
        mismo código ya emitido en vez de crear uno nuevo cada vez
        (`findEmailSignupByEmail`).
      - `POST /email-signups` (`routes/emailSignups.ts`) exige
        `consent: true` explícito en el body — no hay fallback de
        "interés legítimo" para un código de descuento de marketing.
      - `routes/checkout.ts`: `allow_promotion_codes: true` en la sesión
        de Stripe — el cliente introduce el código en la propia página de
        Stripe, sin tener que enhebrarlo por el frontend/BuyModal.
      - `src/features/landing/ui/EmailCaptureBanner.tsx`: banner
        descartable bajo el hero de la landing (no popup con exit-intent,
        menos intrusivo), recuerda el descarte/alta en localStorage vía
        `localStorageCache` — no vuelve a aparecer una vez descartado o
        completado. Eventos `email_capture_shown/submitted/dismissed`
        sumados a la analítica de embudo del ítem 1.
      - Verificado en producción: alta real crea un Promotion Code válido
        en Stripe (`livemode: true`, ligado al coupon `welcome10`,
        `max_redemptions: 1`), reenviar el mismo email devuelve el mismo
        código sin duplicar.
- [ ] Email post-entrega (webhook delivered de Gelato, +5-7 días):
      pedir reseña + foto del cuadro colgado. Incentivo: -15% en el
      siguiente pedido.
- [ ] Sección de reseñas/fotos reales de clientes en la landing
      (con permiso explícito de uso de imagen).
- [ ] Uptime monitor externo (mapagrama.com + /api/catalog) y alerta
      si un webhook Stripe/Gelato falla repetidamente.

### SEO técnico pendiente (auditoría externa, 2026-07-24)

Revisión de otro asistente (Fable) sobre el estado del repo/producción.
Dos hallazgos ya corregidos, uno queda pendiente a propósito:

- [x] `main` (rama por defecto del repo público) estaba 50 commits por
      detrás de lo desplegado — solo tenía el rebranding inicial de Fase 1.
      Riesgo real de cumplimiento AGPL-3.0: quien clonara el repo por
      defecto no veía el código correspondiente a lo que corre en
      producción. Sincronizado con un merge de `feat/debrand-mapagrama` →
      `main` y `git push`.
- [x] `<title>` cambiado de "Mapagrama: Pósters de mapas personalizados" a
      "Póster de mapa personalizado de tu ciudad | Mapagrama" (keyword
      transaccional primero — así se busca, nadie busca "mapagrama"
      todavía por marca). Mismo cambio en `og:title`/`twitter:title` por
      consistencia. `<meta name="keywords">` eliminada (Google la ignora
      desde 2009, solo sirve para revelar la estrategia SEO a quien mire
      el código fuente).
- [ ] **Pre-renderizado de la landing** (decidido explícitamente aplazar,
      2026-07-24): el `<body>` de `/` está vacío hasta que React monta —
      el `<head>` (title/description/OG/JSON-LD) ya es HTML estático real
      y no depende de JS, que es lo que más pesa para el snippet de
      búsqueda de Google. El hueco real es para bots que no ejecutan JS.
      Arreglarlo bien (servir HTML estático real en `/` con React
      montándose encima, shell vacío distinto para `/crear` y
      `/pedido/*`) implica un build multi-entrada en Vite y tocar el
      `nginx.conf` que enruta los redirects reales de Stripe tras el
      pago — no es un cambio para hacer de pasada entre otras tareas.
      Pendiente de dedicarle una sesión propia con verificación a fondo
      del flujo de pago antes de darlo por bueno.

## Convenciones de trabajo

- Idioma de código/comentarios: español en comentarios, inglés en
  identificadores.
- Commits pequeños y descriptivos. Antes de cambios grandes en el fork,
  rama nueva.
- No tocar la lógica del renderer salvo estilo de atribución — el motor
  ya funciona.
- Todo cambio de producción con pasos de rollback documentados.
