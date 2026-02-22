
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
});

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