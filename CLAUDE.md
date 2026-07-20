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
- **Storage de diseños:** S3-compatible (Cloudflare R2 recomendado, tier
  gratuito) para guardar el PDF/PNG exportado hasta que Gelato lo recoja.
- **Hosting:** VPS propio con Docker (frontend estático + API + nginx).

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

## Catálogo y precios (validar costes reales con cuenta Gelato)

| Producto | Coste est. (prod+envío ES) | PVP | Margen bruto |
|---|---|---|---|
| Póster 30x40 premium matte | ~9-12€ | 29€ | ~17-19€ |
| Póster 50x70 | ~13-18€ | 44€ | ~26-30€ |
| Enmarcado madera 30x40 | ~29-38€ | 59€ | ~21-30€ |
| Enmarcado madera 50x70 | ~43-57€ | 89€ | ~35-45€ |

- Papel: Premium Matte 200gsm (best-seller de Gelato).
- Formatos con ratio consistente cm/pulgadas: 30x40, 50x70, 70x100.
- El margen fuerte está en enmarcados — empujarlos en la UI.
- Restar comisión Stripe (~1,4% + 0,25€) y considerar IVA.
- OJO: verificar que el enmarcado 50x70 se produce en España (no Alemania)
  o el envío se come el margen.

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
- [ ] API: `POST /designs` (upload a R2), `POST /checkout` (Stripe),
      webhook Stripe → pedido Gelato, webhooks Gelato → emails.
- [ ] Repo separado y privado. Sin código derivado de terraink.
- [ ] Sandbox: Stripe test mode + Gelato tiene entorno de pruebas.
- [ ] Docker compose: frontend + api + nginx en el VPS.

### Fase 3 — Capa de tienda
- [ ] Selector tamaño/papel/marco en el flujo del editor con precios.
- [ ] Página de producto/landing con ejemplos (Gijón, Oviedo, Madrid...).
- [ ] Emails transaccionales (confirmación, envío) — Resend o SMTP propio.
- [ ] Legal ES: aviso legal, RGPD, condiciones de venta, desistimiento
      (nota: producto personalizado = exento de devolución art. 103 LGDCU,
      indicarlo claramente en checkout).

### Fase 4 — Lanzamiento
- [ ] Pedido real end-to-end de prueba.
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
