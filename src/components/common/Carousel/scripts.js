// Este archivo se ejecutará solo en el cliente
// Inicialización del carrusel con Swiper
function initCarousel() {
  // Esperar un momento para asegurar que todo esté cargado
  setTimeout(() => {
    try {
      const container = document.querySelector('.swiper-container.main-carousel');
      if (!container) return;

      const slideCount = container.querySelectorAll('.swiper-slide').length;
      if (slideCount <= 1) {
        const nextEl = container.querySelector('.swiper-button-next');
        const prevEl = container.querySelector('.swiper-button-prev');
        const paginationEl = container.querySelector('.swiper-pagination');
        if (nextEl) nextEl.style.display = 'none';
        if (prevEl) prevEl.style.display = 'none';
        if (paginationEl) paginationEl.style.display = 'none';
        return;
      }

      const swiper = new Swiper('.swiper-container.main-carousel', {
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        on: {
          init: function() {
            console.log('Swiper inicializado correctamente');
          }
        }
      });
      
      // Forzar update después de carga completa
      window.addEventListener('load', () => {
        swiper.update();
        console.log('Swiper actualizado después de carga completa');
      });
    } catch (error) {
      console.error('Error al inicializar Swiper:', error);
    }
  }, 500);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initCarousel);
