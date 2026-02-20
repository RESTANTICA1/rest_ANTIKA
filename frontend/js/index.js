
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


// ===== Reseñas de Google (CARRUSEL) =====
async function loadGoogleReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  try {
    const response = await fetch('../assets/docs/resenas_extraccion.json');
    const data = await response.json();
    const reseñas = data.resenas || [];

    // Filter out empty reviews and take first 20
    const validReviews = reseñas.filter(r => r.resena && r.resena.trim().length > 0).slice(0, 20);

    container.innerHTML = validReviews.map((reseña, index) => {
      // Generate stars HTML
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        starsHtml += i < reseña.estrellas ? '★' : '☆';
      }

      // Get initials for avatar
      const initials = reseña.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      // Random pastel color for avatar
      const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#FF6D01', '#46BDC6', '#7B1FA2'];
      const avatarColor = colors[index % colors.length];

      return `
        <a href="https://maps.app.goo.gl/gJKPpyPZ9J4UHtSH9" target="_blank" class="google-review-card">
          <div class="google-review-header">
            <div class="google-review-avatar" style="background-color: ${avatarColor}">
              ${initials}
            </div>
            <div class="google-review-info">
              <span class="google-review-name">${reseña.nombre}</span>
              <div class="google-review-stars">${starsHtml}</div>
            </div>
            <img src="../assets/icons/google.png" alt="Google" class="google-review-logo">
          </div>
          <p class="google-review-text">${reseña.resena}</p>
        </a>
      `;
    }).join('');

    // Initialize carousel after loading reviews
    initReviewsCarousel();

  } catch (error) {
    console.error('Error loading reviews:', error);
    container.innerHTML = '<p style="color:white;text-align:center;">No se pudieron cargar las reseñas.</p>';
  }
}

// ===== CARRUSEL DE RESEÑAS =====
function initReviewsCarousel() {
  const track = document.querySelector('.reviews-carousel-track');
  const items = document.querySelectorAll('.google-review-card');
  const prevBtn = document.querySelector('.carousel-nav-prev-reviews');
  const nextBtn = document.querySelector('.carousel-nav-next-reviews');

  if (!track || items.length === 0) return;

  let currentIndex = 0;
  let itemsPerView = 3;
  let autoPlayInterval;
  let isPaused = false;

  const AUTO_PLAY_INTERVAL = 5000;
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