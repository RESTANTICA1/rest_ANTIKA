# Antika Restaurant - Official Website

**Version:** 1.0  
**Location:** Sicuani, Cusco - Perú  
**Website:** https://www.antikarestaurant.com (pending deployment)

---

## 📋 Project Overview

Antika Restaurant is a modern, responsive website for a Peruvian restaurant located in Sicuani, Cusco. The website showcases the restaurant's menu, location, reviews, and provides booking functionality through WhatsApp integration.

### Key Features

- **Multi-language Support:** Spanish (Español), English, Portuguese (Português)
- **Dynamic Menu System:** JSON-based menu with 10 categories
- **Google Reviews Integration:** Automated review carousel
- **WhatsApp Booking:** Direct reservation through WhatsApp
- **Responsive Design:** Mobile-first approach
- **Smooth Animations:** Scroll reveal, parallax, and carousel effects
- **Google Maps Integration:** Embedded location map

---

## 🗂 Project Structure

```
rest_ANTIKA/
├── index.html                    # Main HTML file
├── README.md                     # Project documentation
├── css/
│   ├── index.css                 # Main stylesheet (69,787 chars)
│   ├── lang.css                  # Language selector styles
│   └── spotify.css               # Spotify embed styles
├── js/
│   ├── index.js                  # Main JavaScript (59,045 chars)
│   └── lang.js                   # Internationalization system
└── assets/
    ├── menu.json                 # Restaurant menu data
    ├── icons/                    # Flag icons and logos
    │   ├── brasil.png
    │   ├── eeuu.webp
    │   ├── favicon.png
    │   ├── flag-br.svg
    │   ├── flag-pe.svg
    │   ├── flag-us.svg
    │   ├── google.avif / .png
    │   ├── peru.jpg
    │   ├── wasap.jpg / wasap2.png
    │   └── wp.avif
    ├── images/                   # Background and logo images
    │   ├── fondo.jpg
    │   ├── fonde menu.png
    │   ├── log antika.png
    │   ├── logo antika.png
    │   ├── loguito.png
    │   └── whatssapp.jpg
    ├── docs/                     # Documentation
    │   ├── CARTA CAMBIADA COMPLETA PARA IMPRESIÓN  (3).pdf
    │   └── resenas_extraccion.json
    └── comentarios/
        └── data/
            ├── comentarios.json
            └── reviews_data.json
```

---

## 🎨 Design System

### Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Wood Teal Deep | `#0d2b2a` | Primary dark background |
| Wood Teal | `#1a4a48` | Primary color |
| Wood Teal Light | `#2a7a76` | Secondary accents |
| Gold | `#c8a84c` | Accent/highlights |
| Gold Light | `#e8c97a` | Hover states |
| Gold Dark | `#8a6a1e` | Text accents |
| Parchment | `#f4ead4` | Light backgrounds |
| Cream | `#f5ede0` | Text on dark |
| Crimson | `#a02030` | Call-to-action buttons |
| Silver Light | `#dde8e6` | Muted text |

### Typography

| Font | Usage |
|------|-------|
| **Playfair Display** | Headings (serif, elegant) |
| **Crimson Text** | Body text (serif, readable) |
| **Special Elite** | Decorative/brand elements |

### CSS Variables

The project uses CSS custom properties for consistent theming:

```css
:root {
  --wood-teal-deep:   #0d2b2a;
  --gold:             #c8a84c;
  --parchment:       #f4ead4;
  --teal:            var(--wood-teal);
  --shadow-md:       0 6px 28px rgba(10,26,24,0.40);
}
```

---

## 🧩 Component Architecture

### 1. Header (Fixed Navigation)

- **Logo Area:** Brand name "ANTIKA" with icon
- **Navigation Links:** About, Reviews, Menu, Gallery
- **CTA Button:** "Reservar" (Reservation)
- **Language Selector:** Flags for ES/EN/PT
- **Mobile Hamburger Menu**

States:
- Default: Transparent background
- Scrolled: Dark background with blur effect and gold border

### 2. Hero Section

- Full viewport height (`100vh`)
- Background image with gradient overlay
- Animated text reveal (fadeInUp, fadeInDown)
- Parallax scrolling effect (disabled on mobile)
- Call-to-action buttons

### 3. About Section (Nosotros)

- Two-column grid layout
- Left: Decorative image
- Right: Story text content
- Info cards:
  - Location & Hours
  - Contact & Payment info

### 4. Reviews Section (Opiniones)

- Header with Google Reviews link
- Carousel with:
  - Customer photos
  - Star ratings (5-star system)
  - Review text
  - Food photos
- Auto-play (5 second intervals)
- Touch/swipe support for mobile
- Navigation buttons

### 5. Menu Section (La Carta)

**10 Menu Categories:**

| Tab | Spanish | English | Portuguese |
|-----|---------|---------|------------|
| 1 | Desayunos | Breakfasts | Cafés da manhã |
| 2 | Sándwiches | Sandwiches | Sanduíches |
| 3 | Ensaladas & Sopas | Salads & Soups | Saladas & Sopas |
| 4 | Medio Día | Lunch | Almoço |
| 5 | Fondos | Main Dishes | Pratos Principais |
| 6 | Vegetariana | Vegetarian | Vegetariano |
| 7 | Domingo | Sunday | Domingo |
| 8 | Burgers | Burgers | Burgers |
| 9 | Alitas | Wings | Asinhas |
| 10 | Adicionales | Extras | Extras |

**Menu Item Structure:**

```json
{
  "name": "Dish Name",
  "description": "Description in Spanish",
  "description_en": "English description",
  "description_pt": "Portuguese description",
  "price": 22.00
}
```

**Features:**
- Lazy rendering (loads on demand)
- Multi-language support
- Responsive column layout
- Section notes (e.g., breakfast hours)
- Special elements:
  - Broaster combo tables
  - Sauce tags for wings
  - Sunday specials

### 6. Gallery Section (Galería)

- Image carousel with 8 food images
- Unsplash CDN images
- Navigation arrows
- Auto-play (4 second intervals)
- Touch/swipe support
- Lazy loading

### 7. Location Map

- Google Maps embed
- Shows: Plaza Mayor de Sicuani & Restaurant location
- Jr. Comercio 250, Sicuani

### 8. Reservation Section (Reserva)

- WhatsApp booking link
- Phone call button
- Multilingual text

### 9. WhatsApp Floating Button

- Fixed position (bottom-right)
- Directs to WhatsApp booking

### 10. Footer

- 3-column grid:
  - Left: Spotify playlist embed
  - Center: Copyright
  - Right: Payment info
- Responsive (stacks on mobile)

---

## 🔧 Technical Implementation

### JavaScript Architecture

**Namespace:** `window._antika`

```javascript
window._antika = {
  headerScrollInit: false,
  galleryCarouselInit: false,
  reviewsCarouselInit: false,
  reviewsLoaded: false,
  menuLoaded: false,
  animationsInit: false,
  menuData: null,
  tabRendered: { /* flags for each tab */ }
};
```

### Key Functions

#### Menu Rendering

```javascript
// Main entry point
loadMenuFromJSON()           // Fetches and loads menu data

// Render functions
renderMenu(tipo)              // Generic renderer for any category
renderDesayunosGen()          // Breakfast-specific renderer
renderSandwichesGen()         // Sandwiches renderer
// ... etc for each category

// Helpers
createMenuItem(name, desc, price)  // Creates menu item DOM
createSectionTitle(text)           // Creates section title
renderItemsLang(items, lang)      // Renders items in specific language
```

#### Internationalization (i18n)

```javascript
// Core functions
getCurrentLanguage()          // Gets current language (ES/EN/PT)
applyStaticTranslations(lang) // Applies translations to static content
changeLanguage(lang)          // Main language switch function
refreshMenuForLanguage()      // Re-renders menu in new language
translateMenuDescriptions(lang) // Updates menu text
```

#### Carousels

```javascript
// Reviews carousel
initReviewsCarousel()         // Desktop carousel
initMobileAutoSlide()         // Mobile scroll-snap
loadGoogleReviews()           // Fetches and displays reviews

// Gallery carousel
initGalleryCarousel()         // Image carousel
```

#### Animations

```javascript
initAnimations()              // Main animation initializer
initScrollReveal()            // Elements appear on scroll
initHeroParallax()            // Hero background parallax
initHeaderGoldLine()          // Header gold underline
initButtonRipple()            // Button ripple effect
initGalleryReveal()           // Gallery staggered reveal
```

### Event Listeners

- **DOM Ready:** Initialize core functionality
- **Scroll:** Header effects, parallax, animations
- **Resize:** Responsive carousel adjustments
- **Click:** Navigation, language switching, carousel navigation
- **Touch:** Mobile swipe support

### Performance Optimizations

1. **Lazy Loading:** Menu tabs render on-demand only
2. **DocumentFragment:** DOM operations use fragments for minimal reflows
3. **requestAnimationFrame:** Scroll handlers use rAF for 60fps
4. **Passive Event Listeners:** Improved scroll performance
5. **CSS will-change:** GPU promotion for animated elements
6. **IntersectionObserver:** Efficient scroll-triggered animations
7. **Touch Support:** Passive listeners for mobile

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | ≤ 768px | Single column, scroll-snap carousels, hamburger menu |
| Tablet | ≤ 992px | 2-column carousels |
| Desktop | > 992px | Full 3-column layouts, JS carousels |

---

## 🌐 Internationalization

### Supported Languages

1. **Spanish (es)** - Default
2. **English (en)**
3. **Portuguese (pt)**

### Translation Coverage

- ✅ Navigation links
- ✅ Section headings and labels
- ✅ Menu items (names, descriptions, prices)
- ✅ Restaurant information
- ✅ Buttons and CTAs
- ✅ Reviews (where available)
- ⚠️ Static content (some hardcoded elements)

### Language Persistence

- Saved to `localStorage` as `lang`
- Applied on page reload
- Applied to `<html lang="...">` attribute

---

## 🔌 External Dependencies

### CDN Resources

1. **Google Fonts**
   - Playfair Display
   - Crimson Text
   - Special Elite

2. **Images (Unsplash)**
   - Hero background
   - Gallery images

3. **Google Maps**
   - Location embed

4. **Spotify**
   - Playlist embed in footer

---

## 📋 Data Files

### assets/menu.json

Complete restaurant menu with:
- 10 categories
- Multilingual descriptions (es/en/pt)
- Pricing in Peruvian Soles (PEN)
- Special items:
  - Broaster combos with sizes
  - Sauce options for wings
  - Sunday specials

### assets/comentarios/data/reviews_data.json

Google reviews data with:
- Customer names
- Review text
- Star ratings
- Dates
- Profile photos
- Food photos (optional)
- Google Maps links

---

## 🚀 Deployment

### Static Hosting

This is a static website that can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any web server

### Required Files

All files in the project root must be served as-is:
- `index.html`
- `css/*.css`
- `js/*.js`
- `assets/**/*`

### No Build Required

This is a pure HTML/CSS/JS project - no transpilation or bundling needed.

---

## 🔧 Customization

### Adding New Menu Items

Edit `assets/menu.json`:

```json
{
  "category_name": {
    "title": "Category Name",
    "title_en": "English Name",
    "title_pt": "Portuguese Name",
    "items": [
      {
        "name": "New Dish",
        "description": "Spanish description",
        "description_en": "English description",
        "description_pt": "Portuguese description",
        "price": 25.00
      }
    ]
  }
}
```

### Adding New Translations

Edit `js/lang.js`:

```javascript
const translations = {
  es: { /* ... */ },
  en: { newKey: "Translation" },
  pt: { newKey: "Tradução" }
};
```

Then add `data-i18n="newKey"` to the HTML element.

### Changing Colors

Edit CSS variables in `css/index.css`:

```css
:root {
  --wood-teal: #newcolor;
  --gold: #newgold;
}
```

### Updating Location

1. Edit map embed in `index.html`
2. Update address text in `js/lang.js`
3. Update WhatsApp number in links

---

## 📄 License

Copyright © 2025 Antika Restaurant - Sicuani, Cusco - Perú

All rights reserved. This website code is proprietary.

---

## 👤 Contact

- **Restaurant:** Antika Restaurant
- **Location:** Jr. Comercio 250, Sicuani, Cusco, Perú
- **Phone:** +51 999 999 999
- **WhatsApp:** +51 999 999 999

---

## 📝 Changelog

### Version 1.0 (2025)

- Initial release
- Multi-language support (ES/EN/PT)
- Dynamic menu with 10 categories
- Google Reviews integration
- WhatsApp booking
- Responsive design
- Smooth animations
- Google Maps embed
- Spotify playlist footer
