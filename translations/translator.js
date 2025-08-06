// Sistema de traducción para Afrotripcartagena
class TranslationManager {
    constructor() {
        this.currentLanguage = 'es'; // Idioma por defecto
        this.translations = {
            general: null,
            tours: null
        };
        this.init();
    }

    async init() {
        // Cargar las traducciones
        await this.loadTranslations();
        
        // Detectar idioma del navegador (opcional)
        // this.detectBrowserLanguage();
        
        // Inicializar la interfaz
        this.setupLanguageToggle();
        this.applyTranslations();

        // Configurar observer para cambios en la visibilidad de tours
        this.setupVisibilityObserver();
    }

    setupVisibilityObserver() {
        // Observer para detectar cambios en la visibilidad de elementos
        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.target.classList.contains('tour-card')) {
                    // Re-traducir el tour que se vuelve visible
                    const tours = this.translations.tours[this.currentLanguage];
                    this.translateSingleTour(entry.target, tours);
                }
            });
        });

        // Observar todas las tarjetas de tour
        const observeTourCards = () => {
            const tourCards = document.querySelectorAll('.tour-card');
            tourCards.forEach(card => {
                visibilityObserver.observe(card);
            });
        };

        // Observar inicialmente
        setTimeout(observeTourCards, 500);

        // Re-observar cuando se muestren más tours
        const container = document.querySelector('#services');
        if (container) {
            const containerObserver = new MutationObserver(() => {
                setTimeout(observeTourCards, 100);
            });
            containerObserver.observe(container, { 
                childList: true, 
                subtree: true 
            });
        }
    }

    async loadTranslations() {
        try {
            // Cargar traducción general
            const generalResponse = await fetch('./translations/general.json');
            this.translations.general = await generalResponse.json();
            
            // Cargar traducción de tours
            const toursResponse = await fetch('./translations/tours.json');
            this.translations.tours = await toursResponse.json();
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('en')) {
            this.currentLanguage = 'en';
        }
    }

    setupLanguageToggle() {
        // Crear botón flotante de traducción
        const translateButton = document.createElement('button');
        translateButton.id = 'translate-btn';
        translateButton.className = 'fixed bottom-20 md:bottom-6 right-6 bg-caribbean-red hover:bg-red-700 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg z-50';
        translateButton.innerHTML = `
            <div class="flex flex-col items-center">
                <i class="fas fa-language text-lg"></i>
                <span class="text-xs font-medium">${this.currentLanguage.toUpperCase()}</span>
            </div>
        `;
        
        translateButton.addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        document.body.appendChild(translateButton);
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
        this.applyTranslations();
        this.updateToggleButton();
        this.updateAlpineLanguage();
    }

    updateAlpineLanguage() {
        // Actualizar el idioma en Alpine.js
        try {
            const bodyElement = document.querySelector('body[x-data]');
            if (bodyElement && bodyElement.__x && bodyElement.__x.$data) {
                const alpineData = bodyElement.__x.$data;
                
                // Actualizar el idioma actual
                alpineData.currentLanguage = this.currentLanguage;
                
                // Forzar actualización del botón
                const buttonSpan = document.querySelector('button[\\@click*="showMoreTours"] span');
                if (buttonSpan) {
                    // Forzar re-evaluación de Alpine.js
                    alpineData.$nextTick(() => {
                        buttonSpan.textContent = alpineData.getMoreToursText();
                    });
                }
                
                // Disparar evento para que Alpine.js reaccione
                const event = new CustomEvent('language-changed', { 
                    detail: { language: this.currentLanguage } 
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            console.log('Alpine.js data update not available:', error);
        }
    }

    updateToggleButton() {
        const button = document.getElementById('translate-btn');
        if (button) {
            button.innerHTML = `
                <div class="flex flex-col items-center">
                    <i class="fas fa-language text-lg"></i>
                    <span class="text-xs font-medium">${this.currentLanguage.toUpperCase()}</span>
                </div>
            `;
        }
    }

    applyTranslations() {
        if (!this.translations.general || !this.translations.tours) {
            console.error('Translations not loaded yet');
            return;
        }

        const lang = this.currentLanguage;
        const general = this.translations.general[lang];
        const tours = this.translations.tours[lang];

        // Traducir navegación
        this.translateNavigation(general.navigation);
        
        // Traducir sección de bienvenida
        this.translateWelcomeSection(general.welcome);
        
        // Traducir secciones principales
        this.translateSections(general.sections);
        
        // Traducir botones
        this.translateButtons(general.buttons);
        
        // Traducir sección de contacto
        this.translateContactSection(general.contact);
        
        // Traducir footer
        this.translateFooter(general.footer);
        
        // Traducir tours (incluyendo los dinámicos)
        this.translateTours(tours);

        // Re-traducir todos los tours visibles (importante para tours dinámicos)
        setTimeout(() => {
            this.retranslateAllVisibleTours(tours);
        }, 100);

        // Actualizar el atributo lang del HTML
        document.documentElement.lang = lang;
    }

    retranslateAllVisibleTours(tours) {
        // Forzar retraducción de todos los tours visibles
        const allVisibleCards = document.querySelectorAll('.tour-card');
        allVisibleCards.forEach((card, index) => {
            const tourKey = `tour_${index + 1}`;
            const tourData = tours[tourKey];
            
            if (tourData && card.offsetParent !== null) { // Solo si es visible
                this.translateSingleTour(card, tours);
            }
        });
    }

    translateNavigation(nav) {
        // Navegación de escritorio
        const desktopNavItems = document.querySelectorAll('.sidebar-item');
        const navTexts = [nav.home, nav.tours, nav.contact];
        
        // Navegación móvil
        const mobileNavItems = document.querySelectorAll('.mobile-menu-item span');
        const mobileTexts = [nav.home, nav.tours, nav.contact];
        
        mobileNavItems.forEach((item, index) => {
            if (mobileTexts[index]) {
                item.textContent = mobileTexts[index];
            }
        });
    }

    translateWelcomeSection(welcome) {
        // Título principal
        const mainTitle = document.querySelector('#welcome h1');
        if (mainTitle) mainTitle.textContent = welcome.title;
        
        // Descripción
        const description = document.querySelector('#welcome p');
        if (description) description.textContent = welcome.description;
        
        // Botones de la sección welcome
        const buttons = document.querySelectorAll('#welcome a');
        if (buttons[0]) buttons[0].textContent = welcome.viewTours;
        if (buttons[1]) buttons[1].textContent = welcome.contact;
    }

    translateSections(sections) {
        // Título de "Nuestros Tours"
        const toursTitle = document.querySelector('#services h2');
        if (toursTitle) toursTitle.textContent = sections.ourTours;
        
        // Título de "Contáctanos"
        const contactTitle = document.querySelector('#contact h2');
        if (contactTitle) contactTitle.textContent = sections.contactUs;
    }

    translateButtons(buttons) {
        // Actualizar Alpine.js con las traducciones del botón
        try {
            const bodyElement = document.querySelector('body[x-data]');
            if (bodyElement && bodyElement.__x && bodyElement.__x.$data) {
                const alpineData = bodyElement.__x.$data;
                alpineData.currentLanguage = this.currentLanguage;
                
                // Actualizar las traducciones en Alpine.js
                alpineData.translations.viewMoreTours.es = buttons.viewMoreTours;
                alpineData.translations.viewMoreTours.en = buttons.viewMoreTours;
                alpineData.translations.viewLessTours.es = buttons.viewLessTours;
                alpineData.translations.viewLessTours.en = buttons.viewLessTours;
                
                // Forzar actualización del texto del botón
                alpineData.$nextTick(() => {
                    // Alpine.js se encarga de actualizar el texto automáticamente
                });
            }
        } catch (error) {
            console.log('Alpine.js integration not available:', error);
        }

        // Función de respaldo: actualizar directamente el botón "Ver más tours"
        setTimeout(() => {
            this.updateMoreToursButtonDirectly(buttons);
        }, 100);
        
        // Botones "Pagar reserva"
        const payButtons = document.querySelectorAll('.tour-card a[href="#"]');
        payButtons.forEach(btn => {
            if (btn.textContent.trim() === 'Pagar reserva' || btn.textContent.trim() === 'Pay reservation') {
                btn.textContent = buttons.payReservation;
            }
        });
    }

    updateMoreToursButtonDirectly(buttons) {
        // Actualización directa del botón como respaldo
        const buttonSpan = document.querySelector('button[\\@click*="showMoreTours"] span');
        if (buttonSpan) {
            try {
                const bodyElement = document.querySelector('body[x-data]');
                const alpineData = bodyElement.__x.$data;
                const isShowingMore = alpineData.showMoreTours;
                
                const newText = isShowingMore ? buttons.viewLessTours : buttons.viewMoreTours;
                buttonSpan.textContent = newText;
            } catch (error) {
                // Respaldo si Alpine.js no está disponible
                const currentText = buttonSpan.textContent;
                if (currentText.includes('más') || currentText.includes('more')) {
                    const isShowingMore = currentText.includes('menos') || currentText.includes('less');
                    buttonSpan.textContent = isShowingMore ? buttons.viewLessTours : buttons.viewMoreTours;
                }
            }
        }
    }

    translateContactSection(contact) {
        // Título principal del contacto
        const contactMainTitle = document.querySelector('#contact h3');
        if (contactMainTitle) contactMainTitle.textContent = contact.title;
        
        // Elementos de contacto
        const contactItems = document.querySelectorAll('#contact .grid > div');
        
        contactItems.forEach((item, index) => {
            const title = item.querySelector('h4');
            const content = item.querySelector('p, a');
            
            switch (index) {
                case 0: // WhatsApp
                    if (title) title.textContent = contact.whatsapp;
                    break;
                case 1: // Email
                    if (title) title.textContent = contact.email;
                    break;
                case 2: // Ubicación
                    if (title) title.textContent = contact.location;
                    if (content && content.tagName === 'P') content.textContent = contact.locationValue;
                    break;
                case 3: // Horario
                    if (title) title.textContent = contact.schedule;
                    if (content && content.tagName === 'P') content.textContent = contact.scheduleValue;
                    break;
            }
        });
    }

    translateFooter(footer) {
        // Slogan del footer
        const slogan = document.querySelector('footer p.text-gray-400');
        if (slogan && slogan.textContent.includes('experiencia caribeña')) {
            slogan.textContent = footer.slogan;
        }
        
        // Copyright
        const copyright = document.querySelector('footer .border-t p');
        if (copyright) copyright.textContent = `© ${footer.copyright}`;
    }

    translateTours(tours) {
        // Obtener todas las tarjetas de tour (incluyendo las que están en el template)
        const tourCards = document.querySelectorAll('.tour-card');
        
        tourCards.forEach((card, index) => {
            const tourKey = `tour_${index + 1}`;
            const tourData = tours[tourKey];
            
            if (tourData) {
                // Traducir nombre del tour
                const title = card.querySelector('h3');
                if (title) title.textContent = tourData.name;
                
                // Traducir precio (mantener el mismo precio)
                const price = card.querySelector('.text-purple-700');
                if (price) price.textContent = tourData.price;
                
                // Traducir descripción
                const description = card.querySelector('.description-content p');
                if (description) description.textContent = tourData.description;
            }
        });

        // También agregar un observer para detectar cuando se muestran nuevos tours
        this.observeNewTours(tours);
    }

    observeNewTours(tours) {
        // Crear un observer para detectar cuando se agregan nuevos tours al DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Buscar nuevas tarjetas de tour en los nodos agregados
                            const newTourCards = node.querySelectorAll ? 
                                node.querySelectorAll('.tour-card') : 
                                (node.classList && node.classList.contains('tour-card') ? [node] : []);
                            
                            newTourCards.forEach((card) => {
                                this.translateSingleTour(card, this.translations.tours[this.currentLanguage]);
                            });
                        }
                    });
                }
            });
        });

        // Observar cambios en el contenedor de tours
        const toursContainer = document.querySelector('#services .grid');
        if (toursContainer) {
            observer.observe(toursContainer, {
                childList: true,
                subtree: true
            });
        }
    }

    translateSingleTour(card, tours) {
        // Obtener el índice de la tarjeta para determinar qué tour es
        const allCards = document.querySelectorAll('.tour-card');
        const cardIndex = Array.from(allCards).indexOf(card);
        const tourKey = `tour_${cardIndex + 1}`;
        const tourData = tours[tourKey];
        
        if (tourData) {
            // Traducir nombre del tour
            const title = card.querySelector('h3');
            if (title) title.textContent = tourData.name;
            
            // Traducir precio
            const price = card.querySelector('.text-purple-700');
            if (price) price.textContent = tourData.price;
            
            // Traducir descripción
            const description = card.querySelector('.description-content p');
            if (description) description.textContent = tourData.description;
            
            // Traducir botón "Pagar reserva"
            const payButton = card.querySelector('a[href="#"]');
            if (payButton && this.translations.general) {
                const buttonText = this.translations.general[this.currentLanguage].buttons.payReservation;
                if (payButton.textContent.includes('Pagar') || payButton.textContent.includes('Pay')) {
                    payButton.textContent = buttonText;
                }
            }
        }
    }
}

// Inicializar el sistema de traducción cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.translationManager = new TranslationManager();
});

// Hacer disponible globalmente para debugging
window.TranslationManager = TranslationManager;
