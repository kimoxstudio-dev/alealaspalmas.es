# Alea Las Palmas — Landing

Landing oficial de la Asociación Cultural Alea Las Palmas, portada desde el bundle de Claude Design a **Next.js 15 (App Router)**, lista para desplegar en Vercel.

## Desarrollo

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

## Build

```bash
npm run build
npm start
```

## Rutas

- `/` — Landing principal (Hero con D20, Eventos, Pasados, Cultura, Ludoteca, Colaboradores, CTA, Footer, easter eggs).
- `/calendario` — Vista de calendario mensual de eventos.

Los modales de evento usan deep-link (`#event=<id>`) para que el enlace sea compartible.

## Estructura

```
app/
├── layout.js                # Shell HTML + fuentes Google
├── globals.css              # styles.css + variant-modern.css concat
├── page.js                  # Landing (server) + Landing client component
└── calendario/page.js       # Página del calendario
components/
├── I18n.jsx                 # Provider, useI18n, LangToggle
├── Shared.jsx               # MarqueeRow, D20, MeepleHunt, Reveal, etc.
├── EventModal.jsx           # Modal con deep-link
├── Calendar.jsx             # CalendarView
├── CalendarPage.jsx         # Página completa del calendario
└── Landing.jsx              # Landing principal (modern variant)
lib/
└── data.js                  # ALEA_DATA + ALEA_I18N
```

## Despliegue en Vercel

1. Sube el repo a GitHub.
2. En Vercel: *New Project* → conecta el repo.
3. Framework Preset se detecta como **Next.js** automáticamente. No requiere configuración adicional.
4. Las imágenes externas (`alealaspalmas.es`) ya están permitidas en `next.config.mjs`.
