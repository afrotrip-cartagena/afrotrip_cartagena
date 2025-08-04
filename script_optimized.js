// Optimized Performance Script for Afrotripcartagena
document.addEventListener('DOMContentLoaded', function() {
    
    // ===============================
    // LAZY LOADING IMPLEMENTATION
    // ===============================
    
    // Intersection Observer for lazy loading images
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const placeholder = img.closest('.image-placeholder');
                
                // Load the image
                img.src = img.dataset.src;
                img.onload = () => {
                    img.classList.add('loaded');
                    if (placeholder) {
                        placeholder.classList.remove('image-placeholder');
                    }
                };
                
                // Stop observing this image
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });
    
    // Function to set up lazy loading for images
    function initializeLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // ===============================
    // SWIPER OPTIMIZATION
    // ===============================
    
    // Store initialized swipers to avoid re-initialization
    const initializedSwipers = new Set();
    
    // Intersection Observer for Swiper initialization
    const swiperObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const swiperEl = entry.target;
                const swiperId = swiperEl.dataset.swiperId || Math.random().toString(36).substr(2, 9);
                swiperEl.dataset.swiperId = swiperId;
                
                if (!initializedSwipers.has(swiperId)) {
                    initializeSwiper(swiperEl);
                    initializedSwipers.add(swiperId);
                }
            }
        });
    }, {
        rootMargin: '100px 0px',
        threshold: 0.1
    });
    
    // Function to initialize a single Swiper
    function initializeSwiper(swiperEl) {
        if (swiperEl.swiper) return;
        
        new Swiper(swiperEl, {
            loop: true,
            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 1,
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            pagination: {
                el: swiperEl.querySelector('.swiper-pagination'),
                clickable: true,
            },
            effect: 'slide',
            direction: 'horizontal',
            speed: 600,
            spaceBetween: 0,
            slidesPerView: 1,
            allowTouchMove: true,
            grabCursor: true,
            preloadImages: false,
            watchSlidesProgress: true,
            watchSlidesVisibility: true,
        });
    }
    
    // Function to initialize all visible swipers
    function initializeSwipers() {
        const swipers = document.querySelectorAll('.swiper:not([data-swiper-id])');
        swipers.forEach(swiperEl => {
            swiperObserver.observe(swiperEl);
        });
    }
    
    // ===============================
    // TOUR CARDS OPTIMIZATION
    // ===============================
    
    // Function to convert images to lazy loading format
    function optimizeExistingImages() {
        const visibleTours = document.querySelectorAll('.tour-card:not([hidden])');
        
        visibleTours.forEach((tour, index) => {
            const images = tour.querySelectorAll('img[src]:not([loading="eager"])');
            
            images.forEach((img, imgIndex) => {
                // Keep first image of first 6 tours as eager loading
                if (index < 6 && imgIndex === 0) {
                    img.loading = 'eager';
                    return;
                }
                
                // Convert others to lazy loading
                if (!img.dataset.src && img.src) {
                    img.dataset.src = img.src;
                    img.removeAttribute('src');
                    img.loading = 'lazy';
                    
                    // Add placeholder wrapper if not exists
                    if (!img.closest('.image-placeholder')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'image-placeholder w-full h-full';
                        img.parentNode.insertBefore(placeholder, img);
                        placeholder.appendChild(img);
                    }
                }
            });
        });
    }
    
    // ===============================
    // CARD HOVER FUNCTIONALITY
    // ===============================
    
    function initializeCardHover() {
        const tourCards = document.querySelectorAll('.tour-card');
        
        // Remove existing event listeners to prevent duplicates
        tourCards.forEach(card => {
            card.removeEventListener('mouseenter', cardMouseEnter);
            card.removeEventListener('mouseleave', cardMouseLeave);
        });
        
        // Group cards by rows (every 3 cards in desktop)
        function getCardsInSameRow(hoveredCard) {
            const allCards = Array.from(tourCards);
            const cardIndex = allCards.indexOf(hoveredCard);
            const rowIndex = Math.floor(cardIndex / 3);
            const startIndex = rowIndex * 3;
            const endIndex = Math.min(startIndex + 3, allCards.length);
            
            return allCards.slice(startIndex, endIndex);
        }
        
        function cardMouseEnter() {
            const rowCards = getCardsInSameRow(this);
            rowCards.forEach(rowCard => {
                rowCard.classList.add('row-hover');
            });
        }
        
        function cardMouseLeave() {
            const rowCards = getCardsInSameRow(this);
            rowCards.forEach(rowCard => {
                rowCard.classList.remove('row-hover');
            });
        }
        
        tourCards.forEach(card => {
            card.addEventListener('mouseenter', cardMouseEnter);
            card.addEventListener('mouseleave', cardMouseLeave);
        });
    }
    
    // ===============================
    // INITIAL SETUP
    // ===============================
    
    // Initialize everything on page load
    optimizeExistingImages();
    initializeLazyLoading();
    initializeSwipers();
    initializeCardHover();
    
    // ===============================
    // HANDLE "VER MÁS TOURS" BUTTON
    // ===============================
    
    // Re-initialize when "Ver más tours" button is clicked
    const showMoreButton = document.querySelector('[\\@click="showMoreTours = !showMoreTours"]');
    if (showMoreButton) {
        showMoreButton.addEventListener('click', function() {
            // Wait for Alpine.js to render the new content
            setTimeout(() => {
                optimizeExistingImages();
                initializeLazyLoading();
                initializeSwipers();
                initializeCardHover();
            }, 300);
        });
    }
    
    // ===============================
    // SCROLLSPY FUNCTIONALITY
    // ===============================
    
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.sidebar-item, .mobile-menu-item');
    
    // Throttle scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                    current = section.getAttribute('id');
                }
            });
            
            navItems.forEach(item => {
                item.classList.remove('active', 'bg-caribbean-yellow', 'text-white');
                if (item.dataset.section === current) {
                    item.classList.add('active');
                    if (item.classList.contains('sidebar-item')) {
                        item.classList.add('bg-caribbean-yellow', 'text-white');
                    }
                }
            });
            
            scrollTimeout = null;
        }, 16); // ~60fps
    });
    
    // Trigger scroll event on page load
    window.dispatchEvent(new Event('scroll'));
    
    // ===============================
    // PRELOAD CRITICAL RESOURCES
    // ===============================
    
    // Preload first 3 tour images (above the fold)
    function preloadCriticalImages() {
        const criticalImages = [
            'img/Tour 4 islas vip/1.webp',
            'img/Volcan del totumo/1.webp',
            'img/Playa blanca baru/1.webp'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    preloadCriticalImages();
    
    // ===============================
    // CLEANUP ON PAGE UNLOAD
    // ===============================
    
    window.addEventListener('beforeunload', () => {
        // Disconnect observers to prevent memory leaks
        imageObserver.disconnect();
        swiperObserver.disconnect();
    });
});
