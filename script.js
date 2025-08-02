// Initialize Swiper for tour cards
document.addEventListener('DOMContentLoaded', function() {
    // Function to initialize all swipers
    function initializeSwipers() {
        const swipers = document.querySelectorAll('.swiper');
        
        swipers.forEach(swiperEl => {
            // Skip if already initialized
            if (swiperEl.swiper) return;
            
            new Swiper(swiperEl, {
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: swiperEl.querySelector('.swiper-pagination'),
                    clickable: true,
                },
                effect: 'slide',
                direction: 'vertical',
                speed: 800,
                spaceBetween: 0,
                slidesPerView: 1,
                allowTouchMove: true,
                grabCursor: true,
            });
        });
    }
    
    // Initialize swipers on page load
    initializeSwipers();
    
    // Function to initialize hover functionality for tour cards
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
    
    // Initialize hover functionality on page load
    initializeCardHover();
    
    // Re-initialize when "Ver más tours" button is clicked
    const showMoreButton = document.querySelector('[\\@click="showMoreTours = !showMoreTours"]');
    if (showMoreButton) {
        showMoreButton.addEventListener('click', function() {
            // Wait a bit for Alpine.js to render the new cards
            setTimeout(() => {
                initializeSwipers();
                initializeCardHover();
            }, 200);
        });
    }
    
    // Scrollspy functionality
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.sidebar-item, .mobile-menu-item');
    
    window.addEventListener('scroll', () => {
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
    });
    
    // Trigger scroll event on page load
    window.dispatchEvent(new Event('scroll'));
});
