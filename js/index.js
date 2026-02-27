/* Antika Restaurant - Optimizado para producción */
'use strict';

/* Registro global */
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

  /* Lazy tab rendering: menuData + tabRendered flags */
  menuData:    null,
  tabRendered: {
    desayunos:  false,
    sandwiches: false,
    ensaladas:  false,
    mediodia:   false,
    fondos:     false,
    vegetariana:false,
    domingo:    false,
    burgers:    false,
    alitas:     false,
    adicionales:false,
  },
};

/* Cache de nodos DOM */
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

/* Header scroll effect */
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

/* Tab switching */

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
    case 'vegetariana':
      renderVegetarianaGen(frag, data);
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
  const lang = getCurrentLang();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(getTranslatedTitle(data, lang)));
  data.items.forEach(item => {
    const desc = lang === 'es' ? item.description : (lang === 'en' ? (item.description_en || item.description) : (item.description_pt || item.description));
    col1.appendChild(createMenuItem(item.name, desc, item.price));
  });

  const col2 = document.createElement('div');
  col2.style.cssText = 'display:flex;align-items:center;justify-content:center;';
  const noteBox = document.createElement('div');
  noteBox.style.cssText = 'text-align:center;padding:40px;border:1px solid rgba(42,107,112,0.3);border-radius:4px;';
  const icon = document.createElement('div');
  icon.style.cssText = "font-family:'Special Elite',cursive;font-size:48px;color:var(--teal);margin-bottom:12px;";
  icon.textContent = data.note.icon;
  const txt = document.createElement('p');
  txt.className = 'tab-note-text';
  txt.style.cssText = 'color:var(--teal-dark);font-style:italic;font-size:17px;';
  txt.textContent = lang === 'es' ? data.note.text : (lang === 'en' ? data.note.text_en : data.note.text_pt);
  noteBox.append(icon, txt);
  col2.appendChild(noteBox);

  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderSandwichesGen(frag, data) {
  const lang = getCurrentLang();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(getTranslatedTitle(data, lang)), renderItemsLang(data.columns[0], lang));
  const col2 = document.createElement('div');
  col2.append(createSectionTitle('—', true), renderItemsLang(data.columns[1], lang));
  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderEnsaladasGen(frag, data) {
  const lang = getCurrentLang();
  const parts = getTranslatedTitle(data, lang).split(' y ');
  const cols = document.createElement('div');
  cols.className = 'menu-columns';
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(parts[0]), renderItemsLang(data.columns[0], lang));
  const col2 = document.createElement('div');
  col2.append(createSectionTitle(parts[1] || 'Sopas'), renderItemsLang(data.columns[1], lang));
  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderMediodiaGen(frag, data) {
  const lang = getCurrentLang();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(getTranslatedTitle(data, lang)), renderItemsLang(data.columns[0], lang));
  const col2 = document.createElement('div');
  col2.append(createSectionTitle('—', true), renderItemsLang(data.columns[1], lang));
  cols.append(col1, col2);
  frag.appendChild(cols);
  if (data.note) {
    const note = document.createElement('div');
    note.className = 'menu-note';
    note.style.marginTop = '40px';
    note.innerHTML = lang === 'es' ? data.note : (lang === 'en' ? data.note_en : data.note_pt);
    frag.appendChild(note);
  }
}

function renderFondosGen(frag, data) {
  const lang = getCurrentLang();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  // Get translated sub-titles from menu.json
  const subtitle1 = lang === 'es' ? (data.subtitle1 || 'Platos de Fondo') : (lang === 'en' ? (data.subtitle1_en || 'Main Courses') : (data.subtitle1_pt || 'Pratos Principais'));
  const subtitle2 = lang === 'es' ? (data.subtitle2 || 'Saltados & Especiales') : (lang === 'en' ? (data.subtitle2_en || 'Stir-fried & Specials') : (data.subtitle2_pt || 'Saltados & Especiais'));
  
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(subtitle1), renderItemsLang(data.columns[0], lang));

  const col2 = document.createElement('div');
  col2.append(createSectionTitle(subtitle2), renderItemsLang(data.columns[1], lang));

  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderDomingoGen(frag, data) {
  const lang = getCurrentLang();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(getTranslatedTitle(data, lang)));
  data.items.forEach(item => {
    const desc = lang === 'es' ? item.description : (lang === 'en' ? (item.description_en || item.description) : (item.description_pt || item.description));
    col1.appendChild(createMenuItem(item.name, desc, item.price));
  });

  cols.appendChild(col1);
  frag.appendChild(cols);
}

function renderVegetarianaGen(frag, data) {
  const lang = getCurrentLang();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(getTranslatedTitle(data, lang)));
  data.items.forEach(item => {
    const desc = lang === 'es' ? item.description : (lang === 'en' ? (item.description_en || item.description) : (item.description_pt || item.description));
    col1.appendChild(createMenuItem(item.name, desc, item.price));
  });

  cols.appendChild(col1);
  frag.appendChild(cols);
}

function renderBurgersGen(frag, data) {
  const lang = getCurrentLang();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';
  const subtitle = lang === 'es' ? data.subtitle : (lang === 'en' ? (data.subtitle_en || data.subtitle) : (data.subtitle_pt || data.subtitle));
  const salchipapasTitle = lang === 'es' ? 'Salchipapas' : (lang === 'en' ? 'Sausage & Fries' : 'Salchipapas');
  const col1 = document.createElement('div');
  col1.append(createSectionTitle(`${getTranslatedTitle(data, lang)} ${subtitle}`), renderItemsLang(data.columns[0], lang));
  const col2 = document.createElement('div');
  col2.append(createSectionTitle(salchipapasTitle), renderItemsLang(data.columns[1], lang));
  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderAlitasGen(frag, data) {
  const lang = getCurrentLang();
  const menuData = window._antika.menuData;
  const broasterData = menuData ? menuData.broaster : null;

  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  const alitas = data.columns[0][0];
  const alitasDesc = lang === 'es' ? alitas.description : (lang === 'en' ? (alitas.description_en || alitas.description) : (alitas.description_pt || alitas.description));
  
  // Get translated titles for sections
  const alitasTitle = lang === 'es' ? 'Alitas · Incluye papas fritas personales' : (lang === 'en' ? 'Wings · Includes personal French fries' : 'Asinhas · Inclui batatas fritas pessoais');
  const costillasTitle = lang === 'es' ? 'Costillitas · Incluye papas fritas andinas' : (lang === 'en' ? 'Ribs · Includes Andean French fries' : 'Costelinhas · Inclui batatas fritas andinas');
  const broasterTitle = broasterData ? getTranslatedTitle(broasterData, lang) : 'Broaster Mr. Bross';
  
  // Get translated subtitle
  const alitasSubtitle = lang === 'es' ? '' : (lang === 'en' ? ' · Includes personal French fries' : ' · Inclui batatas fritas pessoais');
  const costSubtitle = lang === 'es' ? '' : (lang === 'en' ? ' · Includes Andean French fries' : ' · Inclui batatas fritas andinas');
  
  col1.appendChild(createSectionTitle(data.title + alitasSubtitle));
  col1.appendChild(createMenuItem(alitas.name, alitasDesc, alitas.price));
  col1.appendChild(buildSauceTags(alitas.sauces));

  const costDiv = document.createElement('div');
  costDiv.style.marginTop = '32px';
  const cost = data.columns[1][0];
  const costDesc = lang === 'es' ? cost.description : (lang === 'en' ? (cost.description_en || cost.description) : (cost.description_pt || cost.description));
  costDiv.appendChild(createSectionTitle(data.title + costSubtitle));
  costDiv.appendChild(createMenuItem(cost.name, costDesc, cost.price));
  costDiv.appendChild(buildSauceTags(cost.sauces));
  col1.appendChild(costDiv);

  const col2 = document.createElement('div');
  col2.appendChild(createSectionTitle(broasterTitle));
  const tagline = document.createElement('p');
  tagline.style.cssText = 'font-size:20px;color:#5a4a30;font-style:italic;margin-bottom:20px;';
  const broasterDesc = broasterData ? (lang === 'es' ? broasterData.description : (lang === 'en' ? broasterData.description_en : broasterData.description_pt)) : '¡Crujiente por fuera, jugoso por dentro y con un sabor irresistible! Pide el combo ideal para ti:';
  tagline.textContent = broasterDesc;
  col2.appendChild(tagline);
  if (broasterData) {
    col2.appendChild(buildBroasterTable(broasterData.combos, broasterData));
  }

  cols.append(col1, col2);
  frag.appendChild(cols);
}

function renderAdicionalesGen(frag, data) {
  const lang = getCurrentLang();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(getTranslatedTitle(data, lang)));
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
    const noteText = lang === 'es' ? note.text : (lang === 'en' ? note.text_en : note.text_pt);
    p1.textContent = `${note.icon} ${noteText}`;
    const p2 = document.createElement('p');
    p2.style.cssText = 'font-size:18px;color:#5a4a30;font-style:italic;';
    const subtext = lang === 'es' ? note.subtext : (lang === 'en' ? note.subtext_en : note.subtext_pt);
    p2.textContent = subtext;
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
  vegetariana: () => renderMenu('vegetariana'),
  domingo:     () => renderMenu('domingo'),
  burgers:     () => renderMenu('burgers'),
  alitas:      () => renderMenu('alitas'),
  adicionales: () => renderMenu('adicionales'),
};

/* Función helper para obtener el idioma actual */
function getCurrentLang() {
  const langSelect = document.getElementById('language-select');
  return langSelect ? langSelect.value : 'es';
}

/* Función helper para obtener título traducido */
function getTranslatedTitle(data, lang) {
  if (lang === 'es') return data.title;
  if (lang === 'en') return data.title_en || data.title;
  return data.title_pt || data.title;
}

function showTab(id, btn) {
  /* Lazy render: solo renderiza si JSON cargado y tab no renderizado */
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

/* Mobile menu */
function toggleMenu() {
  $.nav?.classList.toggle('active');
  document.querySelector('.menu-overlay')?.classList.toggle('active');
  document.body.classList.toggle('menu-open');
}
function closeMenu() {
  $.nav?.classList.remove('active');
  document.querySelector('.menu-overlay')?.classList.remove('active');
  document.body.classList.remove('menu-open');
}

/* Motor de render unificado - usa DocumentFragment */

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
  const lang = getCurrentLang();
  return renderItemsLang(items, lang);
}

/**
 * Renderiza un array de items en un DocumentFragment con idioma específico.
 */
function renderItemsLang(items, lang) {
  const frag = new DocumentFragment();
  items.forEach(item => {
    const desc = lang === 'es' ? item.description : (lang === 'en' ? (item.description_en || item.description) : (item.description_pt || item.description));
    frag.appendChild(createMenuItem(item.name, desc || '', item.price));
  });
  return frag;
}

/* ─── Renderers específicos (usan el motor genérico) ─── */

function renderDesayunos(data) {
  const lang = getCurrentLang();
  const panel = document.getElementById('tab-desayunos');
  if (!panel) return;

  const frag = new DocumentFragment();
  const cols = document.createElement('div');
  cols.className = 'menu-columns';

  /* Col 1 */
  const col1 = document.createElement('div');
  col1.appendChild(createSectionTitle(getTranslatedTitle(data, lang)));
  data.items.forEach(item => {
    const desc = lang === 'es' ? item.description : (lang === 'en' ? (item.description_en || item.description) : (item.description_pt || item.description));
    col1.appendChild(createMenuItem(item.name, desc, item.price));
  });

  /* Col 2 — nota visual */
  const col2  = document.createElement('div');
  col2.style.cssText = 'display:flex;align-items:center;justify-content:center;';
  const noteBox = document.createElement('div');
  noteBox.style.cssText = 'text-align:center;padding:40px;border:1px solid rgba(42,107,112,0.3);border-radius:4px;';
  const icon = document.createElement('div');
  icon.style.cssText = "font-family:'Special Elite',cursive;font-size:48px;color:var(--teal);margin-bottom:12px;";
  icon.textContent = data.note.icon;
  const txt  = document.createElement('p');
  txt.className = 'tab-note-text';
  txt.style.cssText = 'color:var(--teal-dark);font-style:italic;font-size:17px;';
  txt.textContent = lang === 'es' ? data.note.text : (lang === 'en' ? data.note.text_en : data.note.text_pt);
  noteBox.append(icon, txt);
  col2.appendChild(noteBox);

  cols.append(col1, col2);
  frag.appendChild(cols);
  panel.replaceChildren(frag);
}

/* Helpers del motor de render */

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

function buildBroasterTable(combos, data) {
  const lang = getCurrentLang();
  const cols = data.columns || {};
  
  // Get translated column headers
  const comboHeader = lang === 'es' ? cols.combo : (lang === 'en' ? cols.combo_en : cols.combo_pt);
  const piecesHeader = lang === 'es' ? cols.pieces : (lang === 'en' ? cols.pieces_en : cols.pieces_pt);
  const friesHeader = lang === 'es' ? cols.fries : (lang === 'en' ? cols.fries_en : cols.fries_pt);
  const promoHeader = lang === 'es' ? cols.promo : (lang === 'en' ? cols.promo_en : cols.promo_pt);
  const priceHeader = lang === 'es' ? cols.price : (lang === 'en' ? cols.price_en : cols.price_pt);
  
  // Get promo translations
  const promoOpts = data.promoOptions || {};
  const chooseTxt = lang === 'es' ? promoOpts.choose : (lang === 'en' ? promoOpts.choose_en : promoOpts.choose_pt);
  const includesTxt = lang === 'es' ? promoOpts.includes : (lang === 'en' ? promoOpts.includes_en : promoOpts.includes_pt);
  const nuggetsTxt = promoOpts.nuggets;
  const chichaTxt = promoOpts.chicha;
  
  // Get fry portion translations
  const personalTxt = lang === 'es' ? promoOpts.personal : (lang === 'en' ? promoOpts.personal_en : promoOpts.personal_pt);
  const mediumTxt = lang === 'es' ? promoOpts.medium : (lang === 'en' ? promoOpts.medium_en : promoOpts.medium_pt);
  const familyTxt = lang === 'es' ? promoOpts.family : (lang === 'en' ? promoOpts.family_en : promoOpts.family_pt);
  
  const table = document.createElement('table');
  table.className = 'broaster-table';
  table.innerHTML = `<thead><tr><th>${comboHeader}</th><th>${piecesHeader}</th><th>${friesHeader}</th><th>${promoHeader}</th><th>${priceHeader}</th></tr></thead>`;
  const tbody = document.createElement('tbody');
  const frag = new DocumentFragment();
  
  combos.forEach(c => {
    // Build fries column with translation
    let friesText = c.fries;
    if (lang !== 'es') {
      friesText = friesText.replace(/1 personal/gi, `1 ${personalTxt}`);
      friesText = friesText.replace(/2 personales/gi, `2 ${personalTxt}`);
      friesText = friesText.replace(/1 mediana/gi, `1 ${mediumTxt}`);
      friesText = friesText.replace(/1 familiar/gi, `1 ${familyTxt}`);
      friesText = friesText.replace(/1½ familiar/gi, `1½ ${familyTxt}`);
    }
    
    // Build promo column based on combo type
    let promoText = '';
    switch (c.promo) {
      case 'nuggets_or_chicha':
        promoText = chooseTxt;
        break;
      case 'nuggets_6_chicha_half':
        promoText = `${includesTxt}: 6 ${nuggetsTxt} o ½ lt. ${chichaTxt}`;
        break;
      case 'nuggets_8_chicha_full':
        promoText = `${includesTxt}: 8 ${nuggetsTxt} o 1 lt. ${chichaTxt}`;
        break;
      case 'nuggets_10_chicha_full':
        promoText = `${includesTxt}: 10 ${nuggetsTxt} o 1 lt. ${chichaTxt}`;
        break;
      default:
        promoText = '';
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="promo-name">${c.name}</td><td>${c.pieces}</td><td>${friesText}</td><td>${promoText}</td><td class="price-col">S/ ${c.price}</td>`;
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

/* Función segura para cargar JSON con manejo de errores mejorado */
async function safeFetchJSON(path) {
  const response = await fetch(path, { cache: "no-store" });
  
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${path} - status ${response.status}`);
  }
  
  const text = await response.text();
  
  if (text.trim().startsWith("<")) {
    throw new Error(`${path} devolvió HTML en lugar de JSON (ruta incorrecta)`);
  }
  
  return JSON.parse(text);
}

/* Carga de menu desde JSON */
async function loadMenuFromJSON() {
  if (!$.menuSection) return;
  if (window._antika.menuLoaded) return;

  try {
    const menuData = await safeFetchJSON('assets/menu.json');
    renderMenuContent(menuData);    
    window._antika.menuLoaded = true;
  } catch (err) {
    console.error('Error loading menu:', err);
  }
}

/* Reseñas de Google - carga + carrusel */

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
    const reviewsData = await safeFetchJSON('assets/comentarios/data/reviews_data.json');

    // Mapear reviews_data.json al formato esperado por el código
    const comentarios = reviewsData.map(reseña => ({
      id: Math.random(),
      nombre: reseña.user || '',
      comentario: reseña.review_text || '',
      calificacion: reseña.stars || 0,
      tipoComida: '',
      precio: '',
      fecha: reseña.date || '',
      hora: '—',
      link: reseña.link || 'https://maps.app.goo.gl/iUyWFZhFPJ3UgouN6',
      fotoCliente: reseña.profile_icon || '',
      fotoComida: reseña.images && reseña.images.length > 0 ? reseña.images[0] : ''
    }));

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
    
    // Auto-slide para móvil
    initMobileAutoSlide();
    
    // También escuchar resize para cambiar entre desktop/mobile
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768 && !window._antika.mobileAutoSlideInit) {
        setTimeout(initMobileAutoSlide, 500);
      }
    }, { passive: true });

  } catch (err) {
    console.error('Error loading reviews:', err);
    $.reviewsContainer.innerHTML = '<p style="color:white;text-align:center;">No se pudieron cargar las reseñas.</p>';
  }
}

/* ─── Carrusel de reseñas ─── */
function initReviewsCarousel() {
  if (window._antika.reviewsCarouselInit) return;

  // En móvil usar CSS scroll-snap en lugar de JS carousel
  if (window.innerWidth <= 768) {
    window._antika.reviewsCarouselInit = true;
    return;
  }

  const track   = $.reviewsContainer;
  const prevBtn = $.revPrev;
  const nextBtn = $.revNext;

  if (!track) return;

  /* will-change le indica al navegador que este elemento
     será transformado → promueve a capa compositing (GPU) */
  track.style.willChange = 'transform';

  let currentIndex = 0;
  let isPaused     = false;

  const AUTO_PLAY_INTERVAL  = 5000;
  const TRANSITION_DURATION = 500;

  function getItems()       { return track.querySelectorAll('.opinion-card'); }
  function getItemsPerView() {
    const w = window.innerWidth;
    return w <= 768 ? 1 : w <= 992 ? 2 : 3;
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

  /* Touch/swipe support for reviews carousel */
  if (track && !track.dataset.swipeBound) {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      pauseAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > minSwipeDistance) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      setTimeout(resumeAutoPlay, 3000);
    }, { passive: true });

    track.dataset.swipeBound = 'true';
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

/* ─── Auto-slide para móvil (CSS scroll-snap) ─── */
function initMobileAutoSlide() {
  if (window.innerWidth > 768) return;
  
  const track = $.reviewsContainer;
  if (!track) return;
  if (window._antika.mobileAutoSlideInit) return;
  window._antika.mobileAutoSlideInit = true;

  let autoSlideInterval = null;
  let isPaused = false;
  let pauseTimeout = null;
  let cardWidth = track.offsetWidth;
  let totalCards = 0;

  function countCards() {
    const cards = track.querySelectorAll('.opinion-card-link');
    totalCards = cards.length;
    cardWidth = track.offsetWidth || window.innerWidth - 88; // 44px margin each side
  }

  function getCurrentIndex() {
    return Math.round(track.scrollLeft / cardWidth);
  }

  function slideToNext() {
    if (isPaused || totalCards === 0) return;
    
    const currentIndex = getCurrentIndex();
    const nextIndex = (currentIndex + 1) % totalCards;
    
    track.scrollTo({
      left: nextIndex * cardWidth,
      behavior: 'smooth'
    });
  }

  function startAutoSlide() {
    countCards();
    if (totalCards === 0) return;
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(slideToNext, 5000);
  }

  function pauseAutoSlide() {
    isPaused = true;
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
    
    // Reanudar después de 3 segundos sin interacción
    if (pauseTimeout) clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => {
      isPaused = false;
      startAutoSlide();
    }, 3000);
  }

  // Detectar interacción táctil para pausar
  track.addEventListener('touchstart', pauseAutoSlide, { passive: true });
  track.addEventListener('touchmove', pauseAutoSlide, { passive: true });
  track.addEventListener('mousedown', pauseAutoSlide);
  
  // Pausar mientras hace scroll manual
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(pauseAutoSlide, 200);
  }, { passive: true });

  // Esperar a que se carguen las tarjetas
  setTimeout(startAutoSlide, 1000);

  // Actualizar al redimensionar
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    } else {
      countCards();
      if (!autoSlideInterval) startAutoSlide();
    }
  }, { passive: true });
}

/* Carrusel de galería */
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

  /* Touch/swipe support for gallery carousel */
  if (track && !track.dataset.galSwipeBound) {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      pauseAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > minSwipeDistance) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      setTimeout(resumeAutoPlay, 3000);
    }, { passive: true });

    track.dataset.galSwipeBound = 'true';
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

/* Animaciones - scroll reveal, parallax, etc */
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
    /* Disable parallax on mobile for performance */
    if (window.innerWidth <= 768) return;
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

/* Punto de entrada */
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
    initMenuLanguageListener(); // listener para cambio de idioma del menú
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', onDOMReady)
    : onDOMReady();
})();

/* Función para traducir las descripciones del menú */
function translateMenuDescriptions(lang) {
  const menuData = window._antika.menuData;
  if (!menuData) return;

  // Obtener todos los paneles de menú
  const panels = document.querySelectorAll('.tab-panel');
  
  panels.forEach(panel => {
    if (!panel.classList.contains('active')) return;
    
    const panelId = panel.id.replace('tab-', '');
    const data = menuData[panelId];
    if (!data) return;

    // Actualizar títulos de sección (puede haber múltiples)
    const sectionTitles = panel.querySelectorAll('.menu-section-title');
    if (sectionTitles.length > 0) {
      sectionTitles.forEach((title, idx) => {
        let translatedTitle = '';
        
        // Handle Fondos special case with multiple subtitles
        if (panelId === 'fondos' && data.subtitle1 && data.subtitle2) {
          if (idx === 0) {
            // First subtitle (Platos de Fondo / Main Courses)
            translatedTitle = lang === 'es' ? data.subtitle1 : (lang === 'en' ? (data.subtitle1_en || data.subtitle1) : (data.subtitle1_pt || data.subtitle1));
          } else if (idx === 1) {
            // Second subtitle (Saltados & Especiales / Stir-fried & Specials)
            translatedTitle = lang === 'es' ? data.subtitle2 : (lang === 'en' ? (data.subtitle2_en || data.subtitle2) : (data.subtitle2_pt || data.subtitle2));
          }
        } else {
          // Default behavior for other sections
          if (lang === 'es') {
            translatedTitle = data.title;
          } else if (lang === 'en') {
            translatedTitle = data.title_en || data.title;
          } else {
            translatedTitle = data.title_pt || data.title;
          }
        }
        
        // Add subtitle for alitas/broaster
        if (panelId === 'alitas') {
          const subtitle = lang === 'es' ? ' · Incluye papas fritas personales' : (lang === 'en' ? ' · Includes personal French fries' : ' · Inclui batatas fritas pessoais');
          translatedTitle = translatedTitle + subtitle;
        } else if (panelId === 'burgers' && data.subtitle) {
          const subtitle = lang === 'es' ? data.subtitle : (lang === 'en' ? (data.subtitle_en || data.subtitle) : (data.subtitle_pt || data.subtitle));
          translatedTitle = translatedTitle + ' ' + subtitle;
        }
        
        title.textContent = translatedTitle;
      });
    }

    // Actualizar notas de sección (desayunos)
    const noteText = panel.querySelector('.tab-note-text');
    if (noteText && data.note) {
      noteText.textContent = lang === 'es' ? data.note.text : (lang === 'en' ? data.note.text_en : data.note.text_pt);
    }

    // Actualizar notas de medio día
    const menuNote = panel.querySelector('.menu-note');
    if (menuNote && data.note && typeof data.note === 'string') {
      menuNote.innerHTML = lang === 'es' ? data.note : (lang === 'en' ? data.note_en : data.note_pt);
    }

    // Actualizar todos los items del menú
    const menuItems = panel.querySelectorAll('.menu-item');
    
    // Función auxiliar para obtener la descripción traducida
    const getTranslatedDescription = (itemData) => {
      if (lang === 'es') return itemData.description;
      if (lang === 'en') return itemData.description_en || itemData.description;
      return itemData.description_pt || itemData.description;
    };

    // Recopilar todos los items de datos del menú
    let allDataItems = [];
    
    if (data.items) {
      allDataItems = data.items;
    } else if (data.columns) {
      data.columns.forEach(col => {
        col.forEach(item => {
          if (item) allDataItems.push(item);
        });
      });
    }

    // Actualizar cada elemento del DOM
    menuItems.forEach((menuItem, index) => {
      if (index < allDataItems.length) {
        const itemData = allDataItems[index];
        const descElement = menuItem.querySelector('.item-desc');
        if (descElement && itemData) {
          const translatedDesc = getTranslatedDescription(itemData);
          if (translatedDesc) {
            descElement.textContent = translatedDesc;
          }
        }
      }
    });

    // Actualizar etiquetas de salsa en alitas
    const sauceTags = panel.querySelectorAll('.sauce-tag');
    if (data.columns && panelId === 'alitas' && sauceTags.length > 0) {
      const alitas = data.columns[0][0];
      const cost = data.columns[1][0];
      const allSauces = [...(alitas.sauces || []), ...(cost.sauces || [])];
      sauceTags.forEach((tag, idx) => {
        if (idx < allSauces.length) {
          tag.textContent = allSauces[idx];
        }
      });
    }

    // Actualizar descripción de broaster
    const broasterTagline = panel.querySelector('p[style*="font-size:20px"]');
    if (broasterTagline && data.description) {
      const translatedDesc = lang === 'es' ? data.description : (lang === 'en' ? data.description_en : data.description_pt);
      broasterTagline.textContent = translatedDesc;
    }
    
    // Actualizar tabla broaster
    const broasterTable = panel.querySelector('.broaster-table');
    if (broasterTable && panelId === 'alitas' && menuData.broaster) {
      const broasterData = menuData.broaster;
      const cols = broasterData.columns || {};
      const promoOpts = broasterData.promoOptions || {};
      
      // Get translated column headers
      const comboHeader = lang === 'es' ? cols.combo : (lang === 'en' ? cols.combo_en : cols.combo_pt);
      const piecesHeader = lang === 'es' ? cols.pieces : (lang === 'en' ? cols.pieces_en : cols.pieces_pt);
      const friesHeader = lang === 'es' ? cols.fries : (lang === 'en' ? cols.fries_en : cols.fries_pt);
      const promoHeader = lang === 'es' ? cols.promo : (lang === 'en' ? cols.promo_en : cols.promo_pt);
      const priceHeader = lang === 'es' ? cols.price : (lang === 'en' ? cols.price_en : cols.price_pt);
      
      // Get promo translations
      const chooseTxt = lang === 'es' ? promoOpts.choose : (lang === 'en' ? promoOpts.choose_en : promoOpts.choose_pt);
      const includesTxt = lang === 'es' ? promoOpts.includes : (lang === 'en' ? promoOpts.includes_en : promoOpts.includes_pt);
      const nuggetsTxt = promoOpts.nuggets;
      const chichaTxt = promoOpts.chicha;
      
      // Get fry portion translations
      const personalTxt = lang === 'es' ? promoOpts.personal : (lang === 'en' ? promoOpts.personal_en : promoOpts.personal_pt);
      const mediumTxt = lang === 'es' ? promoOpts.medium : (lang === 'en' ? promoOpts.medium_en : promoOpts.medium_pt);
      const familyTxt = lang === 'es' ? promoOpts.family : (lang === 'en' ? promoOpts.family_en : promoOpts.family_pt);
      
      // Update table headers
      const thead = broasterTable.querySelector('thead tr');
      if (thead) {
        const ths = thead.querySelectorAll('th');
        if (ths[0]) ths[0].textContent = comboHeader;
        if (ths[1]) ths[1].textContent = piecesHeader;
        if (ths[2]) ths[2].textContent = friesHeader;
        if (ths[3]) ths[3].textContent = promoHeader;
        if (ths[4]) ths[4].textContent = priceHeader;
      }
      
      // Update table rows
      const tbody = broasterTable.querySelector('tbody');
      if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((tr, idx) => {
          if (idx < broasterData.combos.length) {
            const c = broasterData.combos[idx];
            const tds = tr.querySelectorAll('td');
            
            // Update fries column with translation
            let friesText = c.fries;
            if (lang !== 'es') {
              friesText = friesText.replace(/1 personal/gi, `1 ${personalTxt}`);
              friesText = friesText.replace(/2 personales/gi, `2 ${personalTxt}`);
              friesText = friesText.replace(/1 mediana/gi, `1 ${mediumTxt}`);
              friesText = friesText.replace(/1 familiar/gi, `1 ${familyTxt}`);
              friesText = friesText.replace(/1½ familiar/gi, `1½ ${familyTxt}`);
            }
            
            // Build promo column based on combo type
            let promoText = '';
            switch (c.promo) {
              case 'nuggets_or_chicha':
                promoText = chooseTxt;
                break;
              case 'nuggets_6_chicha_half':
                promoText = `${includesTxt}: 6 ${nuggetsTxt} o ½ lt. ${chichaTxt}`;
                break;
              case 'nuggets_8_chicha_full':
                promoText = `${includesTxt}: 8 ${nuggetsTxt} o 1 lt. ${chichaTxt}`;
                break;
              case 'nuggets_10_chicha_full':
                promoText = `${includesTxt}: 10 ${nuggetsTxt} o 1 lt. ${chichaTxt}`;
                break;
              default:
                promoText = '';
            }
            
            if (tds[0]) tds[0].textContent = c.name;
            if (tds[1]) tds[1].textContent = c.pieces;
            if (tds[2]) tds[2].textContent = friesText;
            if (tds[3]) tds[3].textContent = promoText;
          }
        });
      }
    }
  });
}

/* Inicializar listener para cambio de idioma */
function initMenuLanguageListener() {
  const langSelect = document.getElementById('language-select');
  if (!langSelect) return;

  langSelect.addEventListener('change', function() {
    const lang = this.value;
    translateMenuDescriptions(lang);
  });

  // Aplicar traducción inicial si ya hay un idioma seleccionado
  const currentLang = langSelect.value || 'es';
  if (currentLang !== 'es') {
    translateMenuDescriptions(currentLang);
  }
}