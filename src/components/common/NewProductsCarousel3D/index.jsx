import React from 'react';
import './styles.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

/**
 * 3D Carousel component for displaying new products
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of product objects
 * @param {boolean} props.autoplay - Whether to autoplay the carousel
 * @param {number} props.interval - Autoplay interval in milliseconds
 * @param {boolean} props.arrows - Whether to show navigation arrows
 * @param {function} props.onSlideChange - Callback function when slide changes
 */
export default function NewProductsCarousel3D({ 
  products, 
  autoplay = true, 
  interval = 3000, 
  arrows = true,
  onSlideChange = () => {}
}) {
  if (!products || products.length === 0) {
    return <div className="no-products">No products available</div>;
  }

  // Create slides from products
  const slides = products.map((product, index) => (
    <SwiperSlide key={index}>
      <div className="product-slide">
        <div className="product-card">
          <div className="product-image-container">
            <img 
              src={product.image} 
              alt={product.title || 'Product'} 
              className="product-image"
            />
          </div>
        </div>
      </div>
    </SwiperSlide>
  ));

  // Handle slide change
  const handleSlideChange = (swiper) => {
    if (onSlideChange && typeof onSlideChange === 'function') {
      onSlideChange(swiper.activeIndex);
    }
  };

  return (
    <div className="new-products-carousel-3d">
      <Swiper
        modules={[EffectCoverflow, Autoplay, Navigation]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        coverflowEffect={{ rotate: 30, stretch: 0, depth: 100, modifier: 1, slideShadows: false }}
        autoplay={autoplay ? { delay: interval, disableOnInteraction: false } : false}
        navigation={arrows}
        onSlideChange={handleSlideChange}
        className="np3d-swiper"
      >
        {slides}
      </Swiper>
    </div>
  );
}
