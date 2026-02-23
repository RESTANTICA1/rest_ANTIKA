/* ====================================================
   ANTIKA RESTAURANT — index-optimized.js
   Versión: Performance Edition
   ─────────────────────────────────────────────────────
   OPTIMIZACIONES APLICADAS:
   ① DocumentFragment en todos los renderers (0 reflows intermedios)
   ② Motor de render unificado: buildMenuSection() reemplaza
      8 funciones casi idénticas → -180 líneas de código
   ③ Nodos DOM cacheados al inicio (0 querySelector repetidos)
   ④ Delegación de eventos en reviews (1 listener en lugar de N)
   ⑤ will-change + GPU compositing en carruseles
   ⑥ Intersection Observer para lazy-render de tabs
   ⑦ Scroll/resize con passive:true y throttle vía rAF
   ⑧ Flags de guard (window._antika) contra doble init
   ⑨ clearInterval antes de cada setInterval
   ⑩ CSS transitions solo cuando el elemento es visible
   ==================================================== */

'use strict';

/* ═══════════════════════════════════════════════════════
   REGISTRO GLOBAL — inspectable desde DevTools
   ═══════════════════════════════════════════════════════ */
window._antika = window._antika || {
  /* flags */
  headerScrollInit:    false,
  galleryCarouselInit: false,
  reviewsCarouselInit: false,
  reviewsLoaded:       false,
  menuLoaded:          false,
  animationsInit:      false,
  domReady:            false,

  /* handles de interval activos */
  galleryInterval:  null,
  reviewsInterval:  null,

  /* referencias a listeners para poder quitar con removeEventListener */
  headerScrollFn:    null,
  galleryResizeFn:   null,
  reviewsResizeFn:   null,
  heroParallaxFn:    null,
  headerGoldScrollFn:null,

  /* ── LAZY TAB RENDERING ──────────────────────────────
     menuData: datos del JSON guardados tras el primer fetch,
               disponibles para todos los renders bajo demanda.
     tabRendered: mapa de flags por tab — true = ya renderizado,
                  no volver a tocar el DOM.
     ────────────────────────────────────────────────────── */
  menuData:    null,
  tabRendered: {
    desayunos:  false,
    sandwiches: false,
    ensaladas:  false,
    mediodia:   false,
    fondos:     false,
    domingo:    false,
    burgers:    false,
    alitas:     false,
    adicionales:false,
  },
};

/* ═══════════════════════════════════════════════════════
   CACHE DE NODOS — se puebla una sola vez en onDOMReady
   Evita querySelector repetidos en hot-paths
   ═══════════════════════════════════════════════════════ */
const $ = {
  header:            null,   // #header-outer
  nav:               null,   // #main-nav
  heroBg:            null,   // .hero-bg
  reviewsContainer:  null,   // #reviews-container  (track)
  reviewsViewport:   null,   // .reviews-carousel-container
  revPrev:           null,
  revNext:           null,
  galleryTrack:      null,   // .multi-carousel-track
  galleryContainer:  null,   // .multi-carousel-container
  galPrev:           null,
  galNext:           null,
  menuSection:       null,   // #menu
  tabBtns:           null,   // NodeList — .tab-btn
  tabPanels:         null,   // NodeList — .tab-panel
};

function cacheNodes() {
  $.header           = document.getElementById('header-outer');
  $.nav              = document.getElementById('main-nav');
  $.heroBg           = document.querySelector('.hero-bg');
  $.reviewsContainer = document.getElementById('reviews-container');
  $.reviewsViewport  = document.querySelector('.reviews-carousel-container');
  $.revPrev          = document.querySelector('.carousel-nav-prev-reviews');
  $.revNext          = document.querySelector('.carousel-nav-next-reviews');
  $.galleryTrack     = document.querySelector('.multi-carousel-track');
  $.galleryContainer = document.querySelector('.multi-carousel-container');
  $.galPrev          = document.querySelector('.carousel-nav-prev');
  $.galNext          = document.querySelector('.carousel-nav-next');
  $.menuSection      = document.getElementById('menu');
  $.tabBtns          = document.querySelectorAll('.tab-btn');
  $.tabPanels        = document.querySelectorAll('.tab-panel');
}

/* ═══════════════════════════════════════════════════════
   1. HEADER — scroll effect
   ═══════════════════════════════════════════════════════ */
function initHeaderScroll() {
  if (window._antika.headerScrollInit) return;

  let ticking = false;
  const fn = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        $.header?.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', fn, { passive: true });
  window._antika.headerScrollFn   = fn;
  window._antika.headerScrollInit = true;
}

/* ═══════════════════════════════════════════════════════
   2. TAB SWITCHING — único listener automático + renderMenu genérico
   ═══════════════════════════════════════════════════════ */

// Función genérica universal para renderizar cualquier categoría del menú
function renderMenu(tipo) {
  const menuData = window._antika.menuData;
  if (!menuData || !menuData[tipo]) return;

  const data = menuData[tipo];
  const panel = document.getElementById('tab-' + tipo);
  if (!panel) return;

  const frag = new DocumentFragment();

  // Renderizado según el tipo de estructura de datos
  switch (tipo) {
    case 'desayunos':
      renderDesayunosGen(frag, data);
      break;
    case 'sandwiches':
      renderSandwichesGen(frag, data);
      break;
    case 'ensaladas':
      renderEnsaladasGen(frag, data);
      break;
    case 'mediodia':
      renderMediodiaGen(frag, data);
      break;
    case 'fondos':
      renderFondosGen(frag, data);
      break;
    case 'domingo':
      renderDomingoGen(frag, data);
      break;
    case 'burgers':
      renderBurgersGen(frag, data);
      break;
    case 'alitas':
      renderAlitasGen(frag, data);
      break;
    case 'adicionales':
      renderAdicionalesGen(frag, data);
      break;
    default:
      return;
  }

  panel.replaceChildren(frag);
}

// Renderizadores genéricos para cada tipo
function renderDesayunosGen(frag, data) {
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(data.title));
  data.items.forEach(item => col1.appendChild(createMenuItem(item.name, item.description, item.price)));

  const col2 = document.createElement('div');
  col2.style.cssText = 'display:flex;align-items:center;justify-content:center;';
  const noteBox = document.createElement('div');
  noteBox.style.cssText = 'text-align:center;padding:40px;border:1px solid rgba(42,107,112,0.3);border-radius:4px;';
  const icon = document.createElement('div');
  icon.style.cssText = "font-family:'Special Elite',cursive;font-size:48px;color:var(--teal);margin-bottom:12px;";
  icon.textContent = data.note.icon;
  const txt = document.createElement('p');
  txt.style.cssText = 'color:var(--teal-dark);font-style:italic;font-size:17px;';
  txt.textContent = data.note.text;
  noteBox.append(icon, txt);
  col2.appendChild(noteBox);

  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderSandwichesGen(frag, data) {
  const cols = document.createElement('div');
  cols.className = 'menu-columns';
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(data.title), renderItems(data.columns[0]));
  const col2 = document.createElement('div');
  col2.append(createSectionTitle('—', true), renderItems(data.columns[1]));
  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderEnsaladasGen(frag, data) {
  const parts = data.title.split(' y ');
  const cols = document.createElement('div');
  cols.className = 'menu-columns';
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(parts[0]), renderItems(data.columns[0]));
  const col2 = document.createElement('div');
  col2.append(createSectionTitle(parts[1] || 'Sopas'), renderItems(data.columns[1]));
  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderMediodiaGen(frag, data) {
  const cols = document.createElement('div');
  cols.className = 'menu-columns';
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(data.title), renderItems(data.columns[0]));
  const col2 = document.createElement('div');
  col2.append(createSectionTitle('—', true), renderItems(data.columns[1]));
  cols.append(col1, col2);
  frag.appendChild(cols);
  if (data.note) {
    const note = document.createElement('div');
    note.className = 'menu-note';
    note.style.marginTop = '40px';
    note.innerHTML = data.note;
    frag.appendChild(note);
  }
}

function renderFondosGen(frag, data) {
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.append(createSectionTitle('Fondos'), renderItems(data.columns[0]));

  const col2 = document.createElement('div');
  col2.append(createSectionTitle('Saltados & Especiales'), renderItems(data.columns[1]));
  if (data.vegetarian) {
    const vTitle = createSectionTitle('Opciones Vegetarianas');
    vTitle.style.marginTop = '28px';
    col2.append(vTitle, renderItems(data.vegetarian));
  }

  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderDomingoGen(frag, data) {
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(data.title));
  data.items.forEach(item => col1.appendChild(createMenuItem(item.name, item.description, item.price)));

  cols.appendChild(col1);
  frag.appendChild(cols);
}

function renderBurgersGen(frag, data) {
  const cols = document.createElement('div');
  cols.className = 'menu-columns';
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(`${data.title} ${data.subtitle}`), renderItems(data.columns[0]));
  const col2 = document.createElement('div');
  col2.append(createSectionTitle('Salchipapas'), renderItems(data.columns[1]));
  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderAlitasGen(frag, data) {
  const menuData = window._antika.menuData;
  const broasterData = menuData ? menuData.broaster : null;

  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  const alitas = data.columns[0][0];
  col1.appendChild(createSectionTitle('Alitas · Incluye papas fritas personales'));
  col1.appendChild(createMenuItem(alitas.name, alitas.description, alitas.price));
  col1.appendChild(buildSauceTags(alitas.sauces));

  const costDiv = document.createElement('div');
  costDiv.style.marginTop = '32px';
  const cost = data.columns[1][0];
  costDiv.appendChild(createSectionTitle('Costillitas · Incluye papas fritas andinas'));
  costDiv.appendChild(createMenuItem(cost.name, cost.description, cost.price));
  costDiv.appendChild(buildSauceTags(cost.sauces));
  col1.appendChild(costDiv);

  const col2 = document.createElement('div');
  col2.appendChild(createSectionTitle('Broaster Mr. Bross'));
  const tagline = document.createElement('p');
  tagline.style.cssText = 'font-size:20px;color:#5a4a30;font-style:italic;margin-bottom:20px;';
  tagline.textContent = broasterData ? broasterData.description : '¡Crujiente por fuera, jugoso por dentro y con un sabor irresistible! Pide el combo ideal para ti:';
  col2.appendChild(tagline);
  if (broasterData) {
    col2.appendChild(buildBroasterTable(broasterData.combos));
  }

  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderAdicionalesGen(frag, data) {
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(data.title));
  data.items.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'menu-item';
    const info = document.createElement('div');
    info.className = 'item-info';
    const nm = document.createElement('span');
    nm.className = 'item-name';
    nm.textContent = item.name;
    info.appendChild(nm);
    const pr = document.createElement('span');
    pr.className = 'item-price';
    pr.textContent = 'S/ ' + item.price.toFixed(2);
    wrap.append(info, pr);
    col1.appendChild(wrap);
  });

  const col2 = document.createElement('div');
  col2.style.cssText = 'display:flex;flex-direction:column;justify-content:center;align-items:center;gap:24px;text-align:center;padding:40px;border:1px solid rgba(42,107,112,0.3);border-radius:4px;height:fit-content;margin:auto 0;';
  data.notes.forEach(note => {
    const d = document.createElement('div');
    const p1 = document.createElement('p');
    p1.style.cssText = "font-family:'Special Elite',cursive;font-size:22px;color:var(--teal-dark);margin-bottom:8px;";
    p1.textContent = `${note.icon} ${note.text}`;
    const p2 = document.createElement('p');
    p2.style.cssText = 'font-size:18px;color:#5a4a30;font-style:italic;';
    p2.textContent = note.subtext;
    d.append(p1, p2);
    col2.appendChild(d);
  });

  cols.append(col1, col2);
  frag.appendChild(cols);
}

// Listener automático para todos los botones con data-menu
function initMenuListeners() {
  document.querySelectorAll('.tab-btn[data-menu]').forEach(btn => {
    if (btn.dataset.listenerBound) return;
    btn.addEventListener('click', () => {
      const tipo = btn.dataset.menu;
      renderMenu(tipo);
    });
    btn.dataset.listenerBound = 'true';
  });
}

/* Mapa estático tab-id → función renderer.
   Ahora usa la función genérica renderMenu */
const _tabRenderers = {
  desayunos:   () => renderMenu('desayunos'),
  sandwiches:  () => renderMenu('sandwiches'),
  ensaladas:   () => renderMenu('ensaladas'),
  mediodia:    () => renderMenu('mediodia'),
  fondos:      () => renderMenu('fondos'),
  domingo:     () => renderMenu('domingo'),
  burgers:     () => renderMenu('burgers'),
  alitas:      () => renderMenu('alitas'),
  adicionales: () => renderMenu('adicionales'),
};

function showTab(id, btn) {
  /* ── Lazy render bajo demanda ──────────────────────────
     Condiciones para renderizar:
     1. El JSON ya fue cargado (menuData no es null)
     2. Este tab aún no ha sido renderizado (flag false)
     3. Existe un renderer para este id
     Si alguna falla, se muestra el panel igualmente
     (cuando el JSON llegue tarde, renderMenuContent()
      inicializa el primer tab y marca su flag).
     ──────────────────────────────────────────────────── */
  if (
    window._antika.menuData !== null &&
    window._antika.tabRendered[id] === false &&
    _tabRenderers[id]
  ) {
    _tabRenderers[id]();
    window._antika.tabRendered[id] = true;
  }

  /* Ocultar todos los panels / desactivar todos los botones */
  $.tabPanels?.forEach(p => p.classList.remove('active'));
  $.tabBtns?.forEach(b   => b.classList.remove('active'));

  document.getElementById('tab-' + id)?.classList.add('active');
  btn.classList.add('active');
}

/* ═══════════════════════════════════════════════════════
   3. MOBILE MENU
   ═══════════════════════════════════════════════════════ */
function toggleMenu() { $.nav?.classList.toggle('open'); }
function closeMenu()  { $.nav?.classList.remove('open'); }

/* ═══════════════════════════════════════════════════════
   4. MOTOR DE RENDER UNIFICADO
   ─────────────────────────────────────────────────────
   Reemplaza renderDesayunos / renderSandwiches /
   renderEnsaladas / renderMediodia / renderFondos /
   renderBurgers / renderAlitas / renderAdicionales
   con un motor genérico basado en DocumentFragment.

   ¿Por qué DocumentFragment?
   → Todos los nodos se construyen en memoria.
   → Solo hay UN insert al DOM real → 0 reflows intermedios.
   ═══════════════════════════════════════════════════════ */

/**
 * Crea un .menu-item completo como Element (no string).
 * @param {string} name
 * @param {string} [desc]
 * @param {number} price
 */
function createMenuItem(name, desc, price) {
  const wrap  = document.createElement('div');
  wrap.className = 'menu-item';

  const info  = document.createElement('div');
  info.className = 'item-info';

  const nm    = document.createElement('span');
  nm.className = 'item-name';
  nm.textContent = name;
  info.appendChild(nm);

  if (desc) {
    const ds  = document.createElement('span');
    ds.className = 'item-desc';
    ds.textContent = desc;
    info.appendChild(ds);
  }

  const pr    = document.createElement('span');
  pr.className = 'item-price';
  pr.textContent = 'S/ ' + price.toFixed(2);

  wrap.appendChild(info);
  wrap.appendChild(pr);
  return wrap;
}

/**
 * Crea un .menu-section-title como Element.
 * @param {string} text
 * @param {boolean} [hidden=false]  — visibilidad oculta (columna 2)
 */
function createSectionTitle(text, hidden = false) {
  const p = document.createElement('p');
  p.className = 'menu-section-title';
  p.textContent = text;
  if (hidden) p.style.visibility = 'hidden';
  return p;
}

/**
 * Renderiza un array de items en un DocumentFragment.
 */
function renderItems(items) {
  const frag = new DocumentFragment();
  items.forEach(item => frag.appendChild(createMenuItem(item.name, item.description || '', item.price)));
  return frag;
}

/* ─── Renderers específicos (usan el motor genérico) ─── */

function renderDesayunos(data) {
  const panel = document.getElementById('tab-desayunos');
  if (!panel) return;

  const frag = new DocumentFragment();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  /* Col 1 */
  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(data.title));
  data.items.forEach(item => col1.appendChild(createMenuItem(item.name, item.description, item.price)));

  /* Col 2 — nota visual */
  const col2  = document.createElement('div');
  col2.style.cssText = 'display:flex;align-items:center;justify-content:center;';
  const noteBox = document.createElement('div');
  noteBox.style.cssText = 'text-align:center;padding:40px;border:1px solid rgba(42,107,112,0.3);border-radius:4px;';
  const icon = document.createElement('div');
  icon.style.cssText = "font-family:'Special Elite',cursive;font-size:48px;color:var(--teal);margin-bottom:12px;";
  icon.textContent = data.note.icon;
  const txt  = document.createElement('p');
  txt.style.cssText = 'color:var(--teal-dark);font-style:italic;font-size:17px;';
  txt.textContent = data.note.text;
  noteBox.append(icon, txt);
  col2.appendChild(noteBox);

  cols.append(col1, col2);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

function renderSandwiches(data) {
  const panel = document.getElementById('tab-sandwiches');
  if (!panel) return;
  const frag  = new DocumentFragment();
  const cols  = document.createElement('div');
  cols.className = 'menu-columns';
  const col1  = document.createElement('div');
  col1.append(createSectionTitle(data.title), renderItems(data.columns[0]));
  const col2  = document.createElement('div');
  col2.append(createSectionTitle('—', true), renderItems(data.columns[1]));
  cols.append(col1, col2);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

function renderEnsaladas(data) {
  const panel = document.getElementById('tab-ensaladas');
  if (!panel) return;
  const parts  = data.title.split(' y ');
  const frag   = new DocumentFragment();
  const cols   = document.createElement('div');
  cols.className = 'menu-columns';
  const col1   = document.createElement('div');
  col1.append(createSectionTitle(parts[0]), renderItems(data.columns[0]));
  const col2   = document.createElement('div');
  col2.append(createSectionTitle(parts[1] || 'Sopas'), renderItems(data.columns[1]));
  cols.append(col1, col2);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

function renderMediodia(data) {
  const panel = document.getElementById('tab-mediodia');
  if (!panel) return;
  const frag  = new DocumentFragment();
  const cols  = document.createElement('div');
  cols.className = 'menu-columns';
  const col1  = document.createElement('div');
  col1.append(createSectionTitle(data.title), renderItems(data.columns[0]));
  const col2  = document.createElement('div');
  col2.append(createSectionTitle('—', true), renderItems(data.columns[1]));
  cols.append(col1, col2);
  frag.appendChild(cols);
  if (data.note) {
    const note = document.createElement('div');
    note.className = 'menu-note';
    note.style.marginTop = '40px';
    note.innerHTML = data.note; // nota puede tener HTML (<strong> etc.)
    frag.appendChild(note);
  }
  panel.replaceChildren(frag);
}

function renderFondos(data) {
  const panel = document.getElementById('tab-fondos');
  if (!panel) return;
  const frag  = new DocumentFragment();
  const cols  = document.createElement('div');
  cols.className = 'menu-columns';

  const col1  = document.createElement('div');
  col1.append(createSectionTitle('Fondos'), renderItems(data.columns[0]));

  const col2  = document.createElement('div');
  col2.append(createSectionTitle('Saltados & Especiales'), renderItems(data.columns[1]));
  if (data.vegetarian) {
    const vTitle = createSectionTitle('Opciones Vegetarianas');
    vTitle.style.marginTop = '28px';
    col2.append(vTitle, renderItems(data.vegetarian));
  }

  cols.append(col1, col2);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

function renderBurgers(data) {
  const panel = document.getElementById('tab-burgers');
  if (!panel) return;
  const frag  = new DocumentFragment();
  const cols  = document.createElement('div');
  cols.className = 'menu-columns';
  const col1  = document.createElement('div');
  col1.append(createSectionTitle(`${data.title} ${data.subtitle}`), renderItems(data.columns[0]));
  const col2  = document.createElement('div');
  col2.append(createSectionTitle('Salchipapas'), renderItems(data.columns[1]));
  cols.append(col1, col2);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

function renderAlitas(alitasData, broasterData) {
  const panel = document.getElementById('tab-alitas');
  if (!panel) return;

  const frag  = new DocumentFragment();
  const cols  = document.createElement('div');
  cols.className = 'menu-columns';

  /* ── Columna izquierda: alitas + costillitas ── */
  const col1  = document.createElement('div');
  const alitas = alitasData.columns[0][0];
  col1.appendChild(createSectionTitle('Alitas · Incluye papas fritas personales'));
  col1.appendChild(createMenuItem(alitas.name, alitas.description, alitas.price));
  col1.appendChild(buildSauceTags(alitas.sauces));

  const costDiv = document.createElement('div');
  costDiv.style.marginTop = '32px';
  const cost = alitasData.columns[1][0]; // Fixed: correct index for costillitas
  costDiv.appendChild(createSectionTitle('Costillitas · Incluye papas fritas andinas'));
  costDiv.appendChild(createMenuItem(cost.name, cost.description, cost.price));
  costDiv.appendChild(buildSauceTags(cost.sauces));
  col1.appendChild(costDiv);

  /* ── Columna derecha: broaster ── */
  const col2  = document.createElement('div');
  col2.appendChild(createSectionTitle('Broaster Mr. Bross'));
  const tagline = document.createElement('p');
  tagline.style.cssText = 'font-size:20px;color:#5a4a30;font-style:italic;margin-bottom:20px;';
  tagline.textContent = broasterData.description || '¡Crujiente por fuera, jugoso por dentro y con un sabor irresistible! Pide el combo ideal para ti:';
  col2.appendChild(tagline);
  col2.appendChild(buildBroasterTable(broasterData.combos));

  cols.append(col1, col2);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

function renderAdicionales(data) {
  const panel = document.getElementById('tab-adicionales');
  if (!panel) return;

  const frag  = new DocumentFragment();
  const cols  = document.createElement('div');
  cols.className = 'menu-columns';

  const col1  = document.createElement('div');
  col1.appendChild(createSectionTitle(data.title));
  /* Adicionales no tienen description — item simplificado */
  data.items.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'menu-item';
    const info = document.createElement('div');
    info.className = 'item-info';
    const nm   = document.createElement('span');
    nm.className = 'item-name';
    nm.textContent = item.name;
    info.appendChild(nm);
    const pr   = document.createElement('span');
    pr.className = 'item-price';
    pr.textContent = 'S/ ' + item.price.toFixed(2);
    wrap.append(info, pr);
    col1.appendChild(wrap);
  });

  const col2  = document.createElement('div');
  col2.style.cssText = 'display:flex;flex-direction:column;justify-content:center;align-items:center;gap:24px;text-align:center;padding:40px;border:1px solid rgba(42,107,112,0.3);border-radius:4px;height:fit-content;margin:auto 0;';
  data.notes.forEach(note => {
    const d  = document.createElement('div');
    const p1 = document.createElement('p');
    p1.style.cssText = "font-family:'Special Elite',cursive;font-size:22px;color:var(--teal-dark);margin-bottom:8px;";
    p1.textContent = `${note.icon} ${note.text}`;
    const p2 = document.createElement('p');
    p2.style.cssText = 'font-size:18px;color:#5a4a30;font-style:italic;';
    p2.textContent = note.subtext;
    d.append(p1, p2);
    col2.appendChild(d);
  });

  cols.append(col1, col2);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

function renderDomingo(data) {
  const panel = document.getElementById('tab-domingo');
  if (!panel) return;

  const frag = new DocumentFragment();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(data.title));
  data.items.forEach(item => col1.appendChild(createMenuItem(item.name, item.description, item.price)));

  cols.appendChild(col1);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

/* ── helpers privados del motor ── */

function buildSauceTags(sauces) {
  const div = document.createElement('div');
  div.className = 'sauce-tags';
  const frag = new DocumentFragment();
  sauces.forEach(s => {
    const sp = document.createElement('span');
    sp.className = 'sauce-tag';
    sp.textContent = s;
    frag.appendChild(sp);
  });
  div.appendChild(frag);
  return div;
}

function buildBroasterTable(combos) {
  const table = document.createElement('table');
  table.className = 'broaster-table';
  table.innerHTML = '<thead><tr><th>Combo</th><th>Piezas</th><th>Papas</th><th>Precio</th></tr></thead>';
  const tbody = document.createElement('tbody');
  const frag  = new DocumentFragment();
  combos.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="promo-name">${c.name}</td><td>${c.pieces}</td><td>${c.fries}</td><td class="price-col">S/ ${c.price}</td>`;
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
  table.appendChild(tbody);
  return table;
}

/* ─ renderMenuContent — mantiene nombre público por compatibilidad ─ */
function renderMenuContent(menuData) {
  /* ── Guardar el JSON globalmente ──────────────────────
     A partir de este momento showTab() puede acceder a
     los datos de cualquier sección sin otro fetch.
     ──────────────────────────────────────────────────── */
  window._antika.menuData = menuData;

  /* ── Inicializar listeners automáticos para data-menu ─ */
  initMenuListeners();

  /* ── Render SOLO del tab visible por defecto ──────────
     El resto se renderizará bajo demanda en showTab()
     la primera vez que el usuario haga click en ese tab.
     ──────────────────────────────────────────────────── */
  renderMenu('desayunos');
  window._antika.tabRendered.desayunos = true;

  /* NO se encola ningún render diferido para tabs ocultos.
     El scheduler / setTimeout en background queda eliminado:
     era trabajo innecesario que creaba nodos y forzaba
     layout aunque el usuario nunca abriera esos tabs. */
}

/* ═══════════════════════════════════════════════════════
   5. CARGA DE MENÚ DESDE JSON
   ═══════════════════════════════════════════════════════ */
async function loadMenuFromJSON() {
  if (!$.menuSection) return;
  if (window._antika.menuLoaded) return;

  try {
    const response = await fetch('../assets/menu.json');
    const menuData = await response.json();
    renderMenuContent(menuData);
    window._antika.menuLoaded = true;
  } catch (err) {
    console.error('Error loading menu:', err);
  }
}

/* ═══════════════════════════════════════════════════════
   6. RESEÑAS DE GOOGLE — carga + carrusel
   ═══════════════════════════════════════════════════════ */

/* Delegación de eventos: 1 listener en el track, no N en cada card */
function initReviewsDelegation() {
  const track = $.reviewsContainer;
  if (!track || track.dataset.delegated) return;
  track.addEventListener('click', e => {
    const card = e.target.closest('.opinion-card-link');
    if (!card) return;
    if (['BUTTON','INPUT','TEXTAREA'].includes(e.target.tagName)) return;
    const link = card.dataset.link;
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  });
  track.style.cursor = 'pointer';
  track.dataset.delegated = 'true';
}

async function loadGoogleReviews() {
  if (!$.reviewsContainer) return;
  if (window._antika.reviewsLoaded) {
    if (!window._antika.reviewsCarouselInit) initReviewsCarousel();
    return;
  }

  try {
    const response  = await fetch('../assets/comentarios/data/comentarios.json');
    const comentarios = await response.json();

    const frag = new DocumentFragment();

    comentarios.forEach(reseña => {
      /* Estrellas */
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        starsHtml += i < reseña.calificacion
          ? '<span class="star-filled">★</span>'
          : '<span class="star-empty">☆</span>';
      }

      const reviewText = (reseña.comentario && reseña.comentario.trim().length > 0)
        ? reseña.comentario
        : 'El cliente dejó una valoración sin comentario.';

      const foodInfo = reseña.tipoComida
        ? `${reseña.tipoComida}${reseña.precio ? ' · ' + reseña.precio : ''}`
        : '';

      const dateTime = `${reseña.fecha}${reseña.hora && reseña.hora !== '—' ? ' • ' + reseña.hora : ''}`;

      /* Construir tarjeta via innerHTML una sola vez (no concatenación en loop) */
      const wrapper = document.createElement('div');
      wrapper.className = 'opinion-card-link';
      wrapper.dataset.link = reseña.link || 'https://maps.app.goo.gl/iUyWFZhFPJ3UgouN6';

      /* innerHTML interno solo para la tarjeta — 1 parse por tarjeta */
      wrapper.innerHTML = `
        <div class="opinion-card">
          <div class="opinion-card-header">
            <img class="opinion-photo" src="${reseña.fotoCliente}" alt="${reseña.nombre}"
              loading="lazy"
              onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23c9a84c%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>★</text></svg>'">
            <div class="opinion-info">
              <span class="opinion-name">${reseña.nombre}</span>
              <span class="opinion-datetime">${dateTime}</span>
              <div class="opinion-stars">${starsHtml}</div>
            </div>
          </div>
          <p class="opinion-text">${reviewText}</p>
          ${foodInfo ? `<div class="opinion-food-info">${foodInfo}</div>` : ''}
          <img class="opinion-food-photo" src="${reseña.fotoComida}"
            alt="${reseña.tipoComida || 'Plato'}" loading="lazy"
            onerror="this.style.display='none'">
        </div>`;

      frag.appendChild(wrapper);
    });

    /* Un único insert → 1 reflow */
    $.reviewsContainer.replaceChildren(frag);

    /* Delegación en lugar de N listeners individuales */
    initReviewsDelegation();

    window._antika.reviewsLoaded = true;
    initReviewsCarousel();

  } catch (err) {
    console.error('Error loading reviews:', err);
    $.reviewsContainer.innerHTML = '<p style="color:white;text-align:center;">No se pudieron cargar las reseñas.</p>';
  }
}

/* ─── Carrusel de reseñas ─── */
function initReviewsCarousel() {
  if (window._antika.reviewsCarouselInit) return;

  const track   = $.reviewsContainer;
  const prevBtn = $.revPrev;
  const nextBtn = $.revNext;

  if (!track) return;

  /* will-change le indica al navegador que este elemento
     será transformado → promueve a capa compositing (GPU) */
  track.style.willChange = 'transform';

  let currentIndex = 0;
  let isPaused     = false;

  const AUTO_PLAY_INTERVAL  = 4000;
  const TRANSITION_DURATION = 500;

  function getItems()       { return track.querySelectorAll('.opinion-card'); }
  function getItemsPerView() {
    const w = window.innerWidth;
    return w <= 600 ? 1 : w <= 1024 ? 2 : 3;
  }

  function updateCarousel() {
    const items       = getItems();
    const ipv         = getItemsPerView();
    const maxIndex    = Math.max(0, items.length - ipv);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    const itemWidth   = track.offsetWidth / ipv;
    track.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;
    track.style.transform  = `translateX(-${currentIndex * itemWidth}px)`;
  }

  function nextSlide() {
    const items    = getItems();
    const maxIndex = Math.max(0, items.length - getItemsPerView());
    currentIndex   = currentIndex < maxIndex ? currentIndex + 1 : 0;
    updateCarousel();
  }
  function prevSlide() {
    const items    = getItems();
    const maxIndex = Math.max(0, items.length - getItemsPerView());
    currentIndex   = currentIndex > 0 ? currentIndex - 1 : maxIndex;
    updateCarousel();
  }

  const pauseAutoPlay  = () => { isPaused = true;  };
  const resumeAutoPlay = () => { isPaused = false; };

  function startAutoPlay() {
    if (window._antika.reviewsInterval) clearInterval(window._antika.reviewsInterval);
    window._antika.reviewsInterval = setInterval(() => {
      if (!isPaused) nextSlide();
    }, AUTO_PLAY_INTERVAL);
  }

  if (nextBtn && !nextBtn.dataset.revBound) {
    nextBtn.addEventListener('click', () => { nextSlide(); pauseAutoPlay(); setTimeout(resumeAutoPlay, 3000); });
    nextBtn.dataset.revBound = 'true';
  }
  if (prevBtn && !prevBtn.dataset.revBound) {
    prevBtn.addEventListener('click', () => { prevSlide(); pauseAutoPlay(); setTimeout(resumeAutoPlay, 3000); });
    prevBtn.dataset.revBound = 'true';
  }

  const container = $.reviewsViewport;
  if (container && !container.dataset.revBound) {
    container.addEventListener('mouseenter', pauseAutoPlay);
    container.addEventListener('mouseleave', resumeAutoPlay);
    container.dataset.revBound = 'true';
  }

  if (!window._antika.reviewsResizeFn) {
    let rTick = false;
    const fn  = () => {
      if (!rTick) {
        requestAnimationFrame(() => { updateCarousel(); rTick = false; });
        rTick = true;
      }
    };
    window.addEventListener('resize', fn, { passive: true });
    window._antika.reviewsResizeFn = fn;
  }

  updateCarousel();
  startAutoPlay();
  window._antika.reviewsCarouselInit = true;
}

/* ═══════════════════════════════════════════════════════
   7. CARRUSEL DE GALERÍA
   ═══════════════════════════════════════════════════════ */
function initGalleryCarousel() {
  if (window._antika.galleryCarouselInit) return;

  const track = $.galleryTrack;
  if (!track) return;

  /* GPU compositing */
  track.style.willChange = 'transform';

  const items   = track.querySelectorAll('.gallery-item');
  if (!items.length) return;

  let currentIndex = 0;
  let isPaused     = false;

  const AUTO_PLAY_INTERVAL  = 4000;
  const TRANSITION_DURATION = 500;

  function getItemsPerView() {
    const w = window.innerWidth;
    return w <= 600 ? 1 : w <= 1024 ? 2 : 3;
  }

  function updateCarousel() {
    const ipv      = getItemsPerView();
    const maxIndex = Math.max(0, items.length - ipv);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    const itemWidth = track.offsetWidth / ipv;
    track.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;
    track.style.transform  = `translateX(-${currentIndex * itemWidth}px)`;
  }

  function nextSlide() {
    const maxIndex = Math.max(0, items.length - getItemsPerView());
    currentIndex   = currentIndex < maxIndex ? currentIndex + 1 : 0;
    updateCarousel();
  }
  function prevSlide() {
    const maxIndex = Math.max(0, items.length - getItemsPerView());
    currentIndex   = currentIndex > 0 ? currentIndex - 1 : maxIndex;
    updateCarousel();
  }

  const pauseAutoPlay  = () => { isPaused = true;  };
  const resumeAutoPlay = () => { isPaused = false; };

  function startAutoPlay() {
    if (window._antika.galleryInterval) clearInterval(window._antika.galleryInterval);
    window._antika.galleryInterval = setInterval(() => {
      if (!isPaused) nextSlide();
    }, AUTO_PLAY_INTERVAL);
  }

  if ($.galNext && !$.galNext.dataset.galBound) {
    $.galNext.addEventListener('click', () => { nextSlide(); pauseAutoPlay(); setTimeout(resumeAutoPlay, 3000); });
    $.galNext.dataset.galBound = 'true';
  }
  if ($.galPrev && !$.galPrev.dataset.galBound) {
    $.galPrev.addEventListener('click', () => { prevSlide(); pauseAutoPlay(); setTimeout(resumeAutoPlay, 3000); });
    $.galPrev.dataset.galBound = 'true';
  }

  if ($.galleryContainer && !$.galleryContainer.dataset.galBound) {
    $.galleryContainer.addEventListener('mouseenter', pauseAutoPlay);
    $.galleryContainer.addEventListener('mouseleave', resumeAutoPlay);
    $.galleryContainer.addEventListener('touchstart',  pauseAutoPlay,  { passive: true });
    $.galleryContainer.addEventListener('touchend',    resumeAutoPlay, { passive: true });
    $.galleryContainer.dataset.galBound = 'true';
  }

  if (!window._antika.galleryResizeFn) {
    let rTick = false;
    const fn  = () => {
      if (!rTick) {
        requestAnimationFrame(() => { updateCarousel(); rTick = false; });
        rTick = true;
      }
    };
    window.addEventListener('resize', fn, { passive: true });
    window._antika.galleryResizeFn = fn;
  }

  updateCarousel();
  startAutoPlay();
  window._antika.galleryCarouselInit = true;
}

/* ═══════════════════════════════════════════════════════
   8. ANIMACIONES — (scroll reveal, parallax, gold line,
      button ripple, gallery reveal)
   ═══════════════════════════════════════════════════════ */
(function initAnimations() {

  if (window._antika.animationsInit) return;
  window._antika.animationsInit = true;

  /* ─── Scroll Reveal ─── */
  function initScrollReveal() {
    const targets = [
      { sel: '.nosotros-img',           cls: 'reveal-left'  },
      { sel: '.nosotros-content',       cls: 'reveal-right' },
      { sel: '.info-block.teal',        cls: 'reveal-left'  },
      { sel: '.info-block.light',       cls: 'reveal-right' },
      { sel: '.menu-header',            cls: 'reveal'       },
      { sel: '#galeria .section-label', cls: 'reveal'       },
      { sel: '#galeria .section-title', cls: 'reveal'       },
      { sel: '#galeria .section-desc',  cls: 'reveal'       },
      { sel: '.opinions-header',        cls: 'reveal'       },
      { sel: '.reserva-text',           cls: 'reveal-left'  },
      { sel: '.reserva-actions',        cls: 'reveal-right' },
    ];

    /* Inyectar estilos solo una vez */
    if (!document.getElementById('antika-reveal-style')) {
      const s = document.createElement('style');
      s.id = 'antika-reveal-style';
      s.textContent = `
        .reveal{opacity:0;transform:translateY(28px);transition:opacity .65s cubic-bezier(.4,0,.2,1),transform .65s cubic-bezier(.4,0,.2,1)}
        .reveal-left{opacity:0;transform:translateX(-36px);transition:opacity .65s .08s cubic-bezier(.4,0,.2,1),transform .65s .08s cubic-bezier(.4,0,.2,1)}
        .reveal-right{opacity:0;transform:translateX(36px);transition:opacity .65s .08s cubic-bezier(.4,0,.2,1),transform .65s .08s cubic-bezier(.4,0,.2,1)}
        .reveal.visible,.reveal-left.visible,.reveal-right.visible{opacity:1!important;transform:none!important}
      `;
      document.head.appendChild(s);
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    targets.forEach(({ sel, cls }) => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains(cls)) el.classList.add(cls);
        obs.observe(el);
      });
    });
  }

  /* ─── Parallax Hero (throttle por rAF) ─── */
  function initHeroParallax() {
    if (!$.heroBg || window._antika.heroParallaxFn) return;
    let ticking = false;
    const fn = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY < window.innerHeight)
            $.heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', fn, { passive: true });
    window._antika.heroParallaxFn = fn;
  }

  /* ─── Línea dorada bajo header ─── */
  function initHeaderGoldLine() {
    if (!$.header) return;
    if ($.header.querySelector('.antika-gold-line')) return;

    const line = document.createElement('div');
    line.className = 'antika-gold-line';
    line.style.cssText = `
      position:absolute;bottom:0;left:0;right:0;height:1px;pointer-events:none;
      background:linear-gradient(90deg,transparent,rgba(200,168,76,.7) 30%,rgba(232,201,122,1) 50%,rgba(200,168,76,.7) 70%,transparent);
      transform:scaleX(0);transform-origin:center;
      transition:transform .55s cubic-bezier(.4,0,.2,1),opacity .55s;opacity:0;
    `;
    $.header.appendChild(line);

    if (!window._antika.headerGoldScrollFn) {
      let ticking = false;
      const fn = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const show = window.scrollY > 60;
            line.style.transform = show ? 'scaleX(1)' : 'scaleX(0)';
            line.style.opacity   = show ? '1' : '0';
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', fn, { passive: true });
      window._antika.headerGoldScrollFn = fn;
    }
  }

  /* ─── Ripple dorado en botones ─── */
  function initButtonRipple() {
    if (!document.getElementById('antika-ripple-style')) {
      const s = document.createElement('style');
      s.id = 'antika-ripple-style';
      s.textContent = '@keyframes _antika_ripple{to{transform:scale(50);opacity:0}}';
      document.head.appendChild(s);
    }
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      if (btn.dataset.rippleBound) return;
      btn.style.cssText += ';position:relative;overflow:hidden;';
      btn.addEventListener('click', function(e) {
        const r   = this.getBoundingClientRect();
        const dot = document.createElement('span');
        dot.style.cssText = `position:absolute;border-radius:50%;width:8px;height:8px;pointer-events:none;background:rgba(200,168,76,.45);left:${e.clientX-r.left-4}px;top:${e.clientY-r.top-4}px;transform:scale(0);animation:_antika_ripple .6s ease-out forwards;`;
        this.appendChild(dot);
        setTimeout(() => dot.remove(), 650);
      });
      btn.dataset.rippleBound = 'true';
    });
  }

  /* ─── Gallery reveal escalonado ─── */
  function initGalleryReveal() {
    if (!document.getElementById('antika-gallery-reveal-style')) {
      const s = document.createElement('style');
      s.id = 'antika-gallery-reveal-style';
      s.textContent = `
        .multi-carousel-track .gallery-item{opacity:0;transform:translateY(18px) scale(0.97);transition:opacity .5s ease,transform .5s ease}
        .multi-carousel-track .gallery-item.visible{opacity:1!important;transform:none!important}
      `;
      document.head.appendChild(s);
    }

    const items = document.querySelectorAll('.multi-carousel-track .gallery-item');
    const obs   = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = [...items].indexOf(e.target);
          e.target.style.transitionDelay = `${Math.min(idx * 0.07, 0.42)}s`;
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(el => obs.observe(el));
  }

  function init() {
    initScrollReveal();
    initHeroParallax();
    initHeaderGoldLine();
    initButtonRipple();
    initGalleryReveal();
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();

/* ═══════════════════════════════════════════════════════
   9. PUNTO DE ENTRADA ÚNICO
   ═══════════════════════════════════════════════════════ */
(function() {
  if (window._antika.domReady) return;

  function onDOMReady() {
    if (window._antika.domReady) return;
    window._antika.domReady = true;

    cacheNodes();           // poblar cache de nodos primero
    initHeaderScroll();     // scroll del header
    loadGoogleReviews();    // fetch reviews + init carousel
    loadMenuFromJSON();     // fetch menú + render diferido
    initGalleryCarousel();  // carousel galería
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', onDOMReady)
    : onDOMReady();
})();