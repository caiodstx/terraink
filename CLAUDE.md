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
- [x] Página de producto/landing (`/`) con ejemplos (Gijón/Oviedo/Madrid
      — placeholders visuales, pendiente sustituir por fotos reales del
      producto), pasos "cómo funciona" y precios. Router añadido
      (react-router-dom): `/` landing, `/crear` editor, `/pedido/gracias`
      y `/pedido/cancelado` (las dos últimas ya las usa el backend como
      redirect de Stripe).
- [x] Emails transaccionales — ya cubierto por Resend (Fase 2).
- [x] Legal ES: sistema de `LegalModal` ampliado a 4 documentos (aviso
      legal, privacidad, condiciones de venta, desistimiento), traducido
      al español, alojado en `designs.mapagrama.com/legal/*.md` (R2).
      Contenido real escrito con los datos conocidos del negocio,
      exención de desistimiento art. 103 LGDCU incluida explícitamente.
      **Es un borrador de partida, no revisado por un profesional — hay
      que confirmarlo con un gestor/abogado antes de operar con clientes
      reales**, especialmente el NIF (dejado como placeholder, no lo
      tengo).
- [ ] Pendiente: probar el flujo de compra completo en un navegador real
      (subida real del blob generado por MapLibre, redirect a Stripe) —
      solo se ha verificado por API/curl y build limpio en esta sesión,
      no hay herramienta de navegador disponible para clic a clic.
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
- [ ] SEO local: landings por ciudad española pre-renderizadas.
- [ ] Diferenciación vs Mapiful/Grafomap: precio (producción EU),
      personalización profunda (colores hex libres, capas), nicho local.

## Convenciones de trabajo

- Idioma de código/comentarios: español en comentarios, inglés en
  identificadores.
- Commits pequeños y descriptivos. Antes de cambios grandes en el fork,
  rama nueva.
- No tocar la lógica del renderer salvo estilo de atribución — el motor
  ya funciona.
- Todo cambio de producción con pasos de rollback documentados.
