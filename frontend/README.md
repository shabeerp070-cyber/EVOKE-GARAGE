# EVOKE GARAGE — Cinematic Automotive Website

An ultra-high-end automotive atelier website for **EVOKE GARAGE**, closely art-directed after the cinematic visual style, typography, and scrolling dynamics of [**Forge Automotive**](https://forgeautomotive.co.uk/).

---

## ⚡ Live Development Server
The development server is running and accessible at:
- **Local URL:** `http://localhost:3000/`

To start or build the application:
```bash
# Start local development server
npm run dev

# Compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🏎️ Reference Alignment: Forge Automotive Design Language

| Element | Reference Inspiration (Forge Automotive) | EVOKE GARAGE Implementation |
| :--- | :--- | :--- |
| **Color Palette** | Deep obsidian `#08080a`, dark charcoal `#0d0d10`, clean whites `#ffffff` | Pure dark-mode atelier atmosphere with subtle grain and studio vignette gradients. |
| **Typography** | Bold, spaced editorial sans with technical monospace sub-labels | High-impact headings in `Syne`, Roman accents in `Cinzel`, technical monospace in `Space Grotesk`, and body in `Inter`. |
| **Motion & Scroll** | Awwwards SOTD-level smooth momentum scrolling with ScrollTrigger | **Lenis Smooth Scroll** synced directly to **GSAP ScrollTrigger** (`useLenisAndGSAP.js`). |
| **Hero Section** | Full-screen cinematic vehicle focus with subtle zoom and minimal nav | Full-viewport hero featuring customer emblem, parallax scaling image, and entrance reveals. |
| **Services Layout** | Large-format photographic editorial split with numbered indices | `01 — CAR PAINTING`, `02 — DENTING & BODY REPAIR`, `03 — CAR A/C WORK`, `04 — AUTOMOTIVE ELECTRICAL WORK`. |
| **UI Components** | Minimalist rectangular buttons with slide-up hover fill, razor-thin borders | Custom `.btn-forge-primary` and `.btn-forge-outline` with hairline borders (`rgba(255,255,255,0.08)`). |

---

## 📍 Business & Contact Specifications

All business records are configured in a single source of truth:  
👉 [**`src/config/siteConfig.js`**](file:///c:/Users/MUHAMMED%20SHABEER%20P/OneDrive/Desktop/EVOKE_GARAGE/src/config/siteConfig.js)

```javascript
contact: {
  locationName: "EVOKE GARAGE",
  town: "Ottapalam",
  district: "Palakkad",
  state: "Kerala",
  country: "India",
  formattedAddress: "EVOKE GARAGE, Ottapalam, Palakkad, Kerala, India",

  // Configurable contact number (easily editable anytime)
  phone: "1234567890",
  whatsappNumber: "911234567890",
}
```

* **Click-to-Call**: Direct dialer shortcut linking to `tel:1234567890`.
* **WhatsApp Consultation**: Instant chat generator with pre-filled vehicle discipline details.
* **Location Section**: Workshop coordinates (Ottapalam, Palakkad, Kerala) with one-click Google Maps launcher.

---

## 🛠️ The 4 Core Disciplines Featured
1. **01 — CAR PAINTING**: Professional automotive painting and paint restoration.
2. **02 — DENTING & BODY REPAIR**: Precision dent repair and body restoration.
3. **03 — CAR A/C WORK**: Automotive air-conditioning inspection, servicing, and repair.
4. **04 — AUTOMOTIVE ELECTRICAL WORK**: Electrical diagnostics, wiring repair, and lighting systems.

---

## 📦 Project Architecture
```
EVOKE_GARAGE/
├── public/
│   ├── favicon.png             # 128x128 Favicon
│   ├── logo-circle.png         # Vintage circular muscle car emblem badge
│   ├── logo-white.png          # Transparent white graphic cutout
│   └── logo.jpg                # Original customer logo
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Minimalist art-directed navigation
│   │   ├── Hero.jsx            # Full-screen cinematic hero with GSAP ScrollTrigger zoom
│   │   ├── About.jsx           # Editorial atelier overview (Ottapalam, Palakkad, Kerala)
│   │   ├── ServicesShowcase.jsx# The 4 core services with large-format imagery
│   │   ├── WorkshopGallery.jsx # Curated workshop photography with full Lightbox
│   │   ├── ContactSection.jsx  # Location, click-to-call, WhatsApp & booking form
│   │   ├── ServiceModal.jsx    # Interactive booking dialog
│   │   ├── WhatsAppButton.jsx  # Floating WhatsApp action button
│   │   └── Footer.jsx          # Luxury automotive footer with coordinates
│   ├── config/
│   │   └── siteConfig.js       # Single central configuration file for business data
│   ├── hooks/
│   │   └── useLenisAndGSAP.js  # Lenis smooth scrolling synced with GSAP ticker
│   ├── App.jsx                 # App composition
│   ├── index.css               # Forge styling, hairline borders & typography
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```
