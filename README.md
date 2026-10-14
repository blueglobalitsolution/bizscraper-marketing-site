# GScraper Marketing Site

A modern, high-performance marketing website engineered with rich Framer animations, interactive 3D Globe Hero, and a dedicated Launch Log CMS. The site is 100% offline-ready with zero external CDN dependencies.

---

## 📁 Directory Architecture

```text
├── index.html              # Main Landing Page entry point
├── package.json            # NPM scripts & metadata
├── README.md               # Architecture & development documentation
│
├── pages/                  # Subpages
│   ├── launch-log.html     # Launch Log / Changelog page (reads local CMS)
│   ├── contact.html        # Contact page
│   └── page.html           # Generic landing template
│
├── cms/                    # Local CMS Content Data
│   └── *.framercms         # Offline Framer CMS records & collections
│
├── globe-hero/             # Interactive 3D Globe Component
│   ├── index.html          # Embedded 3D scene canvas
│   └── scripts/            # Three.js runtime & shaders
│
├── scripts/                # Modular JavaScript & Framer Runtime Modules
│   ├── script_main.*.mjs   # Application bootstrap & hydration
│   ├── motion.*.mjs        # Motion & physics animation drivers
│   └── *.mjs               # Component chunks & isolated widgets
│
├── images/                 # Optimized Images & Vector Graphics
│   ├── *.jpg / *.png       # High-res photos (Atmospheric CTA, textures)
│   ├── *.svg               # Scalable icons & brand marks
│   └── *.woff2.bin         # Self-hosted font binary caches
│
└── fonts/                  # Self-hosted Web Fonts
    ├── Barlow/             # Condensed geometric sans-serif
    ├── Geist/              # Precision UI sans-serif
    └── GeistMono/          # Monospace developer font
```

---

## 🚀 Quick Start (Local Development)

### 1. Using Node.js (Recommended)
```bash
# Run local static server on port 3000
npx serve . -l 3000
# Or using npm
npm run dev
```

### 2. Using Python
```bash
python -m http.server 3000
# Or using npm script
npm run serve:py
```

Open your browser and navigate to:
**`http://localhost:3000/`**

---

## 🛠️ Key Features & Architecture Notes

1. **100% Offline & Zero CDN Requests:**
   - All Google Fonts (`Barlow`, `Geist`, `Geist Mono`) are served from local bundles.
   - All images, icons, and CMS collections are contained within the repository.
   - Verified 0 network leaks to external CDNs.

2. **Interactive 3D Globe Hero:**
   - Sandboxed inside `globe-hero/` as an iframe embedded at the top of `index.html`.
   - Renders procedural glowing atmosphere, orbital arcs, and smooth mouse drag controls.

3. **Launch Log CMS (`cms/`):**
   - The `pages/launch-log.html` route pulls records dynamically from the `cms/` folder.
   - Keep `cms/` in place to ensure all historical launch entries and logs render correctly.

4. **Framer Motion Engine:**
   - Stage-based Ascent Profile altimeter rail with pinned sticky scroll.
   - 3D perspective tilts and reactive hover states.
   - Accordion FAQ system and dynamic marquee ticker.
