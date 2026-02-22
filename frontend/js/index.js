
// Header scroll effect
window.addEventListener('scroll', () => {
document.getElementById('header-outer').classList.toggle('scrolled', window.scrollY > 60);
});

// Tab switching
function showTab(id, btn) {
document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
document.getElementById('tab-' + id).classList.add('active');
btn.classList.add('active');
}

// Mobile menu
function toggleMenu() {
document.getElementById('main-nav').classList.toggle('open');
}
function closeMenu() {
document.getElementById('main-nav').classList.remove('open');
}


// ===== Reseñas de Google (CARRUSEL) - Using comentarios.json =====
async function loadGoogleReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  try {
    // Fetch from comentarios.json
    const response = await fetch('../assets/comentarios/data/comentarios.json');
    const comentarios = await response.json();

    // Use a single forEach loop to iterate through all reviews
    let cardsHtml = '';
    comentarios.forEach((reseña, index) => {
      // Generate stars HTML based on calificacion
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        starsHtml += i < reseña.calificacion ? '<span class="star-filled">★</span>' : '<span class="star-empty">☆</span>';
      }

      // Handle comment text
      const reviewText = (reseña.comentario && reseña.comentario.trim().length > 0) 
        ? reseña.comentario 
        : 'El cliente dejó una valoración sin comentario.';

      // Food type and price info
      const foodInfo = reseña.tipoComida ? `${reseña.tipoComida}${reseña.precio ? ' · ' + reseña.precio : ''}` : '';

      // Date and time format: fecha • hora
      const dateTime = `${reseña.fecha}${reseña.hora && reseña.hora !== '—' ? ' • ' + reseña.hora : ''}`;

      // Build card HTML with all data from the same object
      // Using div with data attributes instead of <a> tag to avoid breaking carousel
      cardsHtml += `
        <div class="opinion-card-link" data-link="${reseña.link || 'https://maps.app.goo.gl/iUyWFZhFPJ3UgouN6'}">
          <div class="opinion-card">
            <div class="opinion-card-header">
              <img class="opinion-photo" 
                   src="${reseña.fotoCliente}" 
                   alt="${reseña.nombre}"
                   onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23c9a84c%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22>★</text></svg>'">
              <div class="opinion-info">
                <span class="opinion-name">${reseña.nombre}</span>
                <span class="opinion-datetime">${dateTime}</span>
                <div class="opinion-stars">${starsHtml}</div>
              </div>
            </div>
            <p class="opinion-text">${reviewText}</p>
            ${foodInfo ? `<div class="opinion-food-info">${foodInfo}</div>` : ''}
            <img class="opinion-food-photo" 
                 src="${reseña.fotoComida}" 
                 alt="${reseña.tipoComida || 'Plato'}"
                 onerror="this.style.display='none'">
          </div>
        </div>
      `;
    });

    container.innerHTML = cardsHtml;

    // Add click event listeners to all cards after they're added to DOM
    addCardClickListeners();

    // Initialize carousel after loading reviews
    initReviewsCarousel();

  } catch (error) {
    console.error('Error loading reviews:', error);
    container.innerHTML = '<p style="color:white;text-align:center;">No se pudieron cargar las reseñas.</p>';
  }
}

// Function to add click event listeners to cards
function addCardClickListeners() {
  const cards = document.querySelectorAll('.opinion-card-link');
  cards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't open link if clicking on a potential future interactive element
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      const link = this.getAttribute('data-link');
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
    });
    
    // Add cursor pointer to indicate clickability
    card.style.cursor = 'pointer';
  });
}

// ===== CARRUSEL DE RESEÑAS =====
function initReviewsCarousel() {
  const track = document.querySelector('.reviews-carousel-track');
  const items = document.querySelectorAll('.opinion-card');
  const prevBtn = document.querySelector('.carousel-nav-prev-reviews');
  const nextBtn = document.querySelector('.carousel-nav-next-reviews');

  if (!track || items.length === 0) return;

  let currentIndex = 0;
  let itemsPerView = 3;
  let autoPlayInterval;
  let isPaused = false;

  const AUTO_PLAY_INTERVAL = 4000; // 4 segundos
  const TRANSITION_DURATION = 500;

  function getItemsPerView() {
    const width = window.innerWidth;
    if (width <= 600) return 1;
    if (width <= 1024) return 2;
    return 3;
  }

  function updateCarousel() {
    itemsPerView = getItemsPerView();
    const maxIndex = Math.max(0, items.length - itemsPerView);

    if (currentIndex > maxIndex) currentIndex = maxIndex;

    const itemWidth = track.offsetWidth / itemsPerView;
    const offset = currentIndex * itemWidth;

    track.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;
    track.style.transform = `translateX(-${offset}px)`;
  }

  function nextSlide() {
    const maxIndex = Math.max(0, items.length - itemsPerView);
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    updateCarousel();
  }

  function prevSlide() {
    const maxIndex = Math.max(0, items.length - itemsPerView);
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = maxIndex;
    }
    updateCarousel();
  }

  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      if (!isPaused) nextSlide();
    }, AUTO_PLAY_INTERVAL);
  }

  function pauseAutoPlay() { isPaused = true; }
  function resumeAutoPlay() { isPaused = false; }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      pauseAutoPlay();
      setTimeout(resumeAutoPlay, 3000);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      pauseAutoPlay();
      setTimeout(resumeAutoPlay, 3000);
    });
  }

  const carouselContainer = document.querySelector('.reviews-carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', pauseAutoPlay);
    carouselContainer.addEventListener('mouseleave', resumeAutoPlay);
  }

  window.addEventListener('resize', updateCarousel);

  updateCarousel();
  startAutoPlay();
}

// Load reviews on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  loadGoogleReviews();
  loadMenuFromJSON();
});

// ===== CARGAR MENÚ DESDE JSON =====
async function loadMenuFromJSON() {
  const menuContainer = document.getElementById('menu');
  if (!menuContainer) return;

  try {
    const response = await fetch('../assets/menu.json');
    const menuData = await response.json();
    renderMenuContent(menuData);
  } catch (error) {
    console.error('Error loading menu:', error);
  }
}

// Render menu content dynamically into existing panels
function renderMenuContent(menuData) {
  // Render each tab panel
  renderDesayunos(menuData.desayunos);
  renderSandwiches(menuData.sandwiches);
  renderEnsaladas(menuData.ensaladas);
  renderMediodia(menuData.mediodia);
  renderFondos(menuData.fondos);
  renderBurgers(menuData.burgers);
  renderAlitas(menuData.alitas);
  renderAdicionales(menuData.adicionales);
}

function renderDesayunos(data) {
  const panel = document.getElementById('tab-desayunos');
  if (!panel) return;
  
  let html = '<div class="menu-columns"><div>';
  html += `<p class="menu-section-title">${data.title}</p>`;
  data.items.forEach(item => {
    html += `
      <div class="menu-item">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-desc">${item.description}</span>
        </div>
        <span class="item-price">S/ ${item.price.toFixed(2)}</span>
      </div>`;
  });
  html += '</div>';
  html += '<div style="display:flex;align-items:center;justify-content:center;">';
  html += `<div style="text-align:center;padding:40px;border:1px solid rgba(42,107,112,0.3);border-radius:4px;">`;
  html += `<div style="font-family:'Special Elite',cursive;font-size:48px;color:var(--teal);margin-bottom:12px;">${data.note.icon}</div>`;
  html += `<p style="color:var(--teal-dark);font-style:italic;font-size:17px;">${data.note.text}</p>`;
  html += '</div></div></div>';
  
  panel.innerHTML = html;
}

function renderSandwiches(data) {
  const panel = document.getElementById('tab-sandwiches');
  if (!panel) return;
  
  let html = '<div class="menu-columns"><div>';
  html += `<p class="menu-section-title">${data.title}</p>`;
  data.columns[0].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div><div>';
  html += `<p class="menu-section-title" style="visibility:hidden;">—</p>`;
  data.columns[1].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div></div>';
  
  panel.innerHTML = html;
}

function renderEnsaladas(data) {
  const panel = document.getElementById('tab-ensaladas');
  if (!panel) return;
  
  let html = '<div class="menu-columns"><div>';
  html += `<p class="menu-section-title">${data.title.split(' y ')[0]}</p>`;
  data.columns[0].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div><div>';
  html += `<p class="menu-section-title">${data.title.split(' y ')[1] || 'Sopas'}</p>`;
  data.columns[1].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div></div>';
  
  panel.innerHTML = html;
}

function renderMediodia(data) {
  const panel = document.getElementById('tab-mediodia');
  if (!panel) return;
  
  let html = '<div class="menu-columns"><div>';
  html += `<p class="menu-section-title">${data.title}</p>`;
  data.columns[0].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div><div>';
  html += `<p class="menu-section-title" style="visibility:hidden;">—</p>`;
  data.columns[1].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div></div>';
  if (data.note) {
    html += `<div class="menu-note" style="margin-top:40px;">${data.note}</div>`;
  }
  
  panel.innerHTML = html;
}

function renderFondos(data) {
  const panel = document.getElementById('tab-fondos');
  if (!panel) return;
  
  let html = '<div class="menu-columns"><div>';
  html += '<p class="menu-section-title">Fondos</p>';
  data.columns[0].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div><div>';
  html += '<p class="menu-section-title">Saltados &amp; Especiales</p>';
  data.columns[1].forEach(item => {
    html += generateMenuItem(item);
  });
  if (data.vegetarian) {
    html += '<p class="menu-section-title" style="margin-top:28px;">Opciones Vegetarianas</p>';
    data.vegetarian.forEach(item => {
      html += generateMenuItem(item);
    });
  }
  html += '</div></div>';
  
  panel.innerHTML = html;
}

function renderBurgers(data) {
  const panel = document.getElementById('tab-burgers');
  if (!panel) return;
  
  let html = '<div class="menu-columns"><div>';
  html += `<p class="menu-section-title">${data.title} ${data.subtitle}</p>`;
  data.columns[0].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div><div>';
  html += '<p class="menu-section-title">Salchipapas</p>';
  data.columns[1].forEach(item => {
    html += generateMenuItem(item);
  });
  html += '</div></div>';
  
  panel.innerHTML = html;
}

function renderAlitas(data) {
  const panel = document.getElementById('tab-alitas');
  if (!panel) return;
  
  let html = '<div class="menu-columns"><div>';
  html += '<p class="menu-section-title">Alitas · Incluye papas fritas personales</p>';
  const alitas = data.columns[0][0];
  html += `
    <div class="menu-item">
      <div class="item-info">
        <span class="item-name">${alitas.name}</span>
        <span class="item-desc">${alitas.description}</span>
      </div>
      <span class="item-price">S/ ${alitas.price.toFixed(2)}</span>
    </div>`;
  html += '<div class="sauce-tags">';
  alitas.sauces.forEach(sauce => {
    html += `<span class="sauce-tag">${sauce}</span>`;
  });
  html += '</div>';
  
  html += '<div style="margin-top:32px;">';
  html += '<p class="menu-section-title">Costillitas · Incluye papas fritas andinas</p>';
  const costillas = data.columns[0][1];
  html += `
    <div class="menu-item">
      <div class="item-info">
        <span class="item-name">${costillas.name}</span>
        <span class="item-desc">${costillas.description}</span>
      </div>
      <span class="item-price">S/ ${costillas.price.toFixed(2)}</span>
    </div>`;
  html += '<div class="sauce-tags">';
  costillas.sauces.forEach(sauce => {
    html += `<span class="sauce-tag">${sauce}</span>`;
  });
  html += '</div></div></div><div>';
  
  html += '<p class="menu-section-title">Broaster Mr. Bross</p>';
  html += '<p style="font-size:20px;color:#5a4a30;font-style:italic;margin-bottom:20px;">¡Crujiente por fuera, jugoso por dentro y con un sabor irresistible! Pide el combo ideal para ti:</p>';
  html += '<table class="broaster-table">';
  html += '<thead><tr><th>Combo</th><th>Piezas</th><th>Papas</th><th>Precio</th></tr></thead><tbody>';
  const broaster = data.columns[1][0];
  broaster.combos.forEach(combo => {
    html += `
      <tr>
        <td class="promo-name">${combo.name}</td>
        <td>${combo.pieces}</td>
        <td>${combo.fries}</td>
        <td class="price-col">S/ ${combo.price}</td>
      </tr>`;
  });
  html += '</tbody></table></div>';
  
  panel.innerHTML = html;
}

function renderAdicionales(data) {
  const panel = document.getElementById('tab-adicionales');
  if (!panel) return;
  
  let html = '<div class="menu-columns"><div>';
  html += `<p class="menu-section-title">${data.title}</p>`;
  data.items.forEach(item => {
    html += `
      <div class="menu-item">
        <div class="item-info">
          <span class="item-name">${item.name}</span>
        </div>
        <span class="item-price">S/ ${item.price.toFixed(2)}</span>
      </div>`;
  });
  html += '</div>';
  html += '<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;gap:24px;text-align:center;padding:40px;border:1px solid rgba(42,107,112,0.3);border-radius:4px;height:fit-content;margin:auto 0;">';
  data.notes.forEach(note => {
    html += `<div>`;
    html += `<p style="font-family:'Special Elite',cursive;font-size:22px;color:var(--teal-dark);margin-bottom:8px;">${note.icon} ${note.text}</p>`;
    html += `<p style="font-size:18px;color:#5a4a30;font-style:italic;">${note.subtext}</p>`;
    html += `</div>`;
  });
  html += '</div></div>';
  
  panel.innerHTML = html;
}

function generateMenuItem(item) {
  return `
    <div class="menu-item">
      <div class="item-info">
        <span class="item-name">${item.name}</span>
        <span class="item-desc">${item.description || ''}</span>
      </div>
      <span class="item-price">S/ ${item.price.toFixed(2)}</span>
    </div>`;
}

// ===== CARRUSEL MULTI-IMAGEN (3 PC, 2 TABLET, 1 CELULAR) =====
document.addEventListener('DOMContentLoaded', function() {
  const track = document.querySelector('.multi-carousel-track');
  const items = document.querySelectorAll('.multi-carousel-track .gallery-item');
  const prevBtn = document.querySelector('.carousel-nav-prev');
  const nextBtn = document.querySelector('.carousel-nav-next');
  
  if (!track || items.length === 0) return;
  
  let currentIndex = 0;
  let itemsPerView = 3; // Default: PC
  let autoPlayInterval;
  let isPaused = false;
  
  // Configuración
  const AUTO_PLAY_INTERVAL = 4000; // 4 segundos
  const TRANSITION_DURATION = 500; // ms
  
  // Función para determinar cuántos items mostrar según el viewport
  function getItemsPerView() {
    const width = window.innerWidth;
    if (width <= 600) {
      return 1; // Celular
    } else if (width <= 1024) {
      return 2; // Tablet
    }
    return 3; // PC
  }
  
  // Actualizar posición del carrusel
  function updateCarousel() {
    itemsPerView = getItemsPerView();
    const maxIndex = Math.max(0, items.length - itemsPerView);
    
    // Ajustar índice si es necesario
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }
    
    // Calcular desplazamiento (hacia la derecha)
    const itemWidth = track.offsetWidth / itemsPerView;
    const offset = currentIndex * itemWidth;
    
    track.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;
    track.style.transform = `translateX(-${offset}px)`;
  }
  
  // Avanzar al siguiente grupo de imágenes
  function nextSlide() {
    const maxIndex = Math.max(0, items.length - itemsPerView);
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0; // Reiniciar al inicio
    }
    updateCarousel();
  }
  
  // Retroceder al grupo anterior
  function prevSlide() {
    const maxIndex = Math.max(0, items.length - itemsPerView);
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = maxIndex; // Ir al final
    }
    updateCarousel();
  }
  
  // Iniciar reproducción automática
  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, AUTO_PLAY_INTERVAL);
  }
  
  // Detener reproducción automática
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
  }
  
  // Pausar
  function pauseAutoPlay() {
    isPaused = true;
  }
  
  // Reanudar
  function resumeAutoPlay() {
    isPaused = false;
  }
  
  // Event listeners para botones
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      pauseAutoPlay();
      setTimeout(resumeAutoPlay, 3000);
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      pauseAutoPlay();
      setTimeout(resumeAutoPlay, 3000);
    });
  }
  
  // Pausar en hover
  const carouselContainer = document.querySelector('.multi-carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', pauseAutoPlay);
    carouselContainer.addEventListener('mouseleave', resumeAutoPlay);
    // Touch para móviles
    carouselContainer.addEventListener('touchstart', pauseAutoPlay);
    carouselContainer.addEventListener('touchend', resumeAutoPlay);
  }
  
  // Recalcular al redimensionar ventana
  window.addEventListener('resize', () => {
    updateCarousel();
  });
  
  // Inicializar
  updateCarousel();
  startAutoPlay();
});
/* ====================================================
   ANTIKA RESTAURANT — animations.js  (versión segura)
   Solo anima elementos ESTÁTICOS del HTML.
   NUNCA toca: .opinion-card, .menu-item, .sauce-tags,
   .broaster-table (todos se generan via fetch/JSON)
   ==================================================== */

(function () {
  'use strict';

  /* ─── 1. SCROLL REVEAL — solo elementos estáticos ──── */
  function initScrollReveal() {

    // SOLO selectores que existen en el HTML desde el inicio
    // NO incluir nada que se renderice via JS/fetch
    const targets = [
      { sel: '.nosotros-img',            cls: 'reveal-left'  },
      { sel: '.nosotros-content',        cls: 'reveal-right' },
      { sel: '.info-block.teal',         cls: 'reveal-left'  },
      { sel: '.info-block.light',        cls: 'reveal-right' },
      { sel: '.menu-header',             cls: 'reveal'       },
      { sel: '#galeria .section-label',  cls: 'reveal'       },
      { sel: '#galeria .section-title',  cls: 'reveal'       },
      { sel: '#galeria .section-desc',   cls: 'reveal'       },
      { sel: '.opinions-header',         cls: 'reveal'       },
      { sel: '.reserva-text',            cls: 'reveal-left'  },
      { sel: '.reserva-actions',         cls: 'reveal-right' },
    ];

    // Estilos de reveal
    if (!document.getElementById('antika-reveal-style')) {
      const s = document.createElement('style');
      s.id = 'antika-reveal-style';
      s.textContent = `
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .65s cubic-bezier(.4,0,.2,1),
                      transform .65s cubic-bezier(.4,0,.2,1);
        }
        .reveal-left {
          opacity: 0;
          transform: translateX(-36px);
          transition: opacity .65s .08s cubic-bezier(.4,0,.2,1),
                      transform .65s .08s cubic-bezier(.4,0,.2,1);
        }
        .reveal-right {
          opacity: 0;
          transform: translateX(36px);
          transition: opacity .65s .08s cubic-bezier(.4,0,.2,1),
                      transform .65s .08s cubic-bezier(.4,0,.2,1);
        }
        .reveal.visible,
        .reveal-left.visible,
        .reveal-right.visible {
          opacity: 1 !important;
          transform: none !important;
        }
      `;
      document.head.appendChild(s);
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    targets.forEach(({ sel, cls }) => {
      document.querySelectorAll(sel).forEach(el => {
        el.classList.add(cls);
        obs.observe(el);
      });
    });
  }

  /* ─── 2. PARALLAX SUTIL EN HERO ─────────────────────── */
  function initHeroParallax() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─── 3. LÍNEA DORADA BAJO HEADER ───────────────────── */
  function initHeaderGoldLine() {
    const header = document.getElementById('header-outer');
    if (!header) return;

    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
      pointer-events: none;
      background: linear-gradient(90deg,
        transparent,
        rgba(200,168,76,.7) 30%,
        rgba(232,201,122,1) 50%,
        rgba(200,168,76,.7) 70%,
        transparent);
      transform: scaleX(0);
      transform-origin: center;
      transition: transform .55s cubic-bezier(.4,0,.2,1), opacity .55s;
      opacity: 0;
    `;
    header.appendChild(line);

    window.addEventListener('scroll', () => {
      const show = window.scrollY > 60;
      line.style.transform = show ? 'scaleX(1)' : 'scaleX(0)';
      line.style.opacity   = show ? '1' : '0';
    }, { passive: true });
  }

  /* ─── 4. RIPPLE DORADO EN BOTONES ───────────────────── */
  function initButtonRipple() {
    if (!document.getElementById('antika-ripple-style')) {
      const s = document.createElement('style');
      s.id = 'antika-ripple-style';
      s.textContent = `
        @keyframes _antika_ripple {
          to { transform: scale(50); opacity: 0; }
        }
      `;
      document.head.appendChild(s);
    }

    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.addEventListener('click', function (e) {
        const r   = this.getBoundingClientRect();
        const dot = document.createElement('span');
        dot.style.cssText = `
          position: absolute; border-radius: 50%;
          width: 8px; height: 8px; pointer-events: none;
          background: rgba(200,168,76,.45);
          left: ${e.clientX - r.left - 4}px;
          top:  ${e.clientY - r.top  - 4}px;
          transform: scale(0);
          animation: _antika_ripple .6s ease-out forwards;
        `;
        this.appendChild(dot);
        setTimeout(() => dot.remove(), 650);
      });
    });
  }

  /* ─── 5. GALERÍA — fade-in escalonado al entrar ──────── */
  function initGalleryReveal() {
    // Las gallery-item son estáticas en el HTML del carrusel
    if (!document.getElementById('antika-gallery-reveal-style')) {
      const s = document.createElement('style');
      s.id = 'antika-gallery-reveal-style';
      s.textContent = `
        .multi-carousel-track .gallery-item {
          opacity: 0;
          transform: translateY(18px) scale(0.97);
          transition: opacity .5s ease, transform .5s ease;
        }
        .multi-carousel-track .gallery-item.visible {
          opacity: 1 !important;
          transform: none !important;
        }
      `;
      document.head.appendChild(s);
    }

    const items = document.querySelectorAll('.multi-carousel-track .gallery-item');
    const obs = new IntersectionObserver((entries) => {
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

  /* ─── INIT ───────────────────────────────────────────── */
  function init() {
    initScrollReveal();
    initHeroParallax();
    initHeaderGoldLine();
    initButtonRipple();
    initGalleryReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();