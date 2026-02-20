
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