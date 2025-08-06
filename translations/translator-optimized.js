// Sistema de traducción optimizado para Afrotripcartagena
class TranslationManager {
    constructor() {
        this.currentLanguage = 'es';
        this.translations = { general: null, tours: null };
        this.isInitialized = false;
        this.debounceTimer = null;
        this.cachedElements = new Map();
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        // Cargar traducciones en paralelo
        await this.loadTranslations();
        
        // Setup inicial
        this.setupLanguageToggle();
        this.applyTranslations();
        this.setupOptimizedObservers();
        
        this.isInitialized = true;
    }

    async loadTranslations() {
        try {
            const [generalResponse, toursResponse] = await Promise.all([
                fetch('./translations/general.json'),
                fetch('./translations/tours.json')
            ]);
            
            this.translations.general = await generalResponse.json();
            this.translations.tours = await toursResponse.json();
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    setupLanguageToggle() {
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
        this.applyTranslationsOptimized();
        this.updateToggleButton();
        this.updateAlpineLanguage();
    }

    updateToggleButton() {
        const button = document.getElementById('translate-btn');
        if (button) {
            const span = button.querySelector('span');
            if (span) span.textContent = this.currentLanguage.toUpperCase();
        }
    }

    updateAlpineLanguage() {
        try {
            const bodyElement = document.querySelector('body[x-data]');
            if (bodyElement?.__x?.$data) {
                const alpineData = bodyElement.__x.$data;
                alpineData.currentLanguage = this.currentLanguage;
                
                // Disparar evento optimizado
                document.dispatchEvent(new CustomEvent('language-changed', { 
                    detail: { language: this.currentLanguage }
                }));
            }
        } catch (error) {
            console.log('Alpine.js integration not available');
        }
    }

    applyTranslationsOptimized() {
        if (!this.translations.general || !this.translations.tours) return;

        const lang = this.currentLanguage;
        const general = this.translations.general[lang];
        const tours = this.translations.tours[lang];

        // Usar requestAnimationFrame para optimizar rendering
        requestAnimationFrame(() => {
            this.translateNavigation(general.navigation);
            this.translateWelcomeSection(general.welcome);
            this.translateSections(general.sections);
            this.translateButtons(general.buttons);
            this.translateContactSection(general.contact);
            this.translateFooter(general.footer);
            
            // Traducir tours con debounce
            this.debouncedTranslateTours(tours);
            
            document.documentElement.lang = lang;
        });
    }

    applyTranslations() {
        this.applyTranslationsOptimized();
    }

    debouncedTranslateTours(tours) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.translateTours(tours);
        }, 50);
    }

    translateNavigation(nav) {
        const mobileNavItems = document.querySelectorAll('.mobile-menu-item span');
        const navTexts = [nav.home, nav.tours, nav.contact];
        
        mobileNavItems.forEach((item, index) => {
            if (navTexts[index]) item.textContent = navTexts[index];
        });
    }

    translateWelcomeSection(welcome) {
        const elements = this.getCachedElements('welcome', {
            title: '#welcome h1',
            description: '#welcome p',
            buttons: '#welcome a'
        });
        
        if (elements.title) elements.title.textContent = welcome.title;
        if (elements.description) elements.description.textContent = welcome.description;
        if (elements.buttons[0]) elements.buttons[0].textContent = welcome.viewTours;
        if (elements.buttons[1]) elements.buttons[1].textContent = welcome.contact;
    }

    translateSections(sections) {
        const elements = this.getCachedElements('sections', {
            toursTitle: '#services h2',
            contactTitle: '#contact h2'
        });
        
        if (elements.toursTitle) elements.toursTitle.textContent = sections.ourTours;
        if (elements.contactTitle) elements.contactTitle.textContent = sections.contactUs;
    }

    translateButtons(buttons) {
        // Actualización optimizada de Alpine.js
        try {
            const bodyElement = document.querySelector('body[x-data]');
            if (bodyElement?.__x?.$data) {
                const alpineData = bodyElement.__x.$data;
                alpineData.currentLanguage = this.currentLanguage;
            }
        } catch (error) {
            console.log('Alpine.js integration not available');
        }

        // Traducir botones "Pagar reserva" de forma optimizada
        const payButtons = document.querySelectorAll('.tour-card a[href="#"]');
        const fragment = document.createDocumentFragment();
        
        payButtons.forEach(btn => {
            if (btn.textContent.includes('Pagar') || btn.textContent.includes('Pay')) {
                btn.textContent = buttons.payReservation;
            }
        });
    }

    translateContactSection(contact) {
        const elements = this.getCachedElements('contact', {
            mainTitle: '#contact h3',
            items: '#contact .grid > div'
        });
        
        if (elements.mainTitle) elements.mainTitle.textContent = contact.title;
        
        elements.items?.forEach((item, index) => {
            const title = item.querySelector('h4');
            const content = item.querySelector('p, a');
            
            const contactData = [
                { title: contact.whatsapp },
                { title: contact.email },
                { title: contact.location, content: contact.locationValue },
                { title: contact.schedule, content: contact.scheduleValue }
            ];
            
            if (contactData[index]) {
                if (title) title.textContent = contactData[index].title;
                if (content && contactData[index].content && content.tagName === 'P') {
                    content.textContent = contactData[index].content;
                }
            }
        });
    }

    translateFooter(footer) {
        const elements = this.getCachedElements('footer', {
            slogan: 'footer p.text-gray-400',
            copyright: 'footer .border-t p'
        });
        
        if (elements.slogan?.textContent.includes('experiencia caribeña')) {
            elements.slogan.textContent = footer.slogan;
        }
        if (elements.copyright) elements.copyright.textContent = `© ${footer.copyright}`;
    }

    translateTours(tours) {
        const tourCards = document.querySelectorAll('.tour-card');
        
        // Usar batch processing para mejor rendimiento
        const batchSize = 5;
        let index = 0;
        
        const processBatch = () => {
            const endIndex = Math.min(index + batchSize, tourCards.length);
            
            for (let i = index; i < endIndex; i++) {
                const card = tourCards[i];
                const tourKey = `tour_${i + 1}`;
                const tourData = tours[tourKey];
                
                if (tourData) {
                    const title = card.querySelector('h3');
                    const price = card.querySelector('.text-purple-700');
                    const description = card.querySelector('.description-content p');
                    
                    if (title) title.textContent = tourData.name;
                    if (price) price.textContent = tourData.price;
                    if (description) description.textContent = tourData.description;
                }
            }
            
            index = endIndex;
            
            if (index < tourCards.length) {
                requestAnimationFrame(processBatch);
            }
        };
        
        processBatch();
    }

    setupOptimizedObservers() {
        // Observer simplificado y optimizado
        let observerTimeout;
        
        const debouncedObserver = () => {
            clearTimeout(observerTimeout);
            observerTimeout = setTimeout(() => {
                if (this.currentLanguage !== 'es') {
                    const tours = this.translations.tours[this.currentLanguage];
                    this.translateTours(tours);
                }
            }, 200);
        };

        // Observer para cambios en el DOM (más eficiente)
        const observer = new MutationObserver(debouncedObserver);
        
        const container = document.querySelector('#services');
        if (container) {
            observer.observe(container, { 
                childList: true, 
                subtree: true,
                attributes: false,
                characterData: false
            });
        }
    }

    getCachedElements(section, selectors) {
        const cacheKey = `${section}_${this.currentLanguage}`;
        
        if (this.cachedElements.has(cacheKey)) {
            return this.cachedElements.get(cacheKey);
        }
        
        const elements = {};
        
        for (const [key, selector] of Object.entries(selectors)) {
            if (selector.includes('querySelectorAll') || key.includes('buttons') || key.includes('items')) {
                elements[key] = document.querySelectorAll(selector);
            } else {
                elements[key] = document.querySelector(selector);
            }
        }
        
        this.cachedElements.set(cacheKey, elements);
        return elements;
    }

    retranslateAllVisibleTours(tours) {
        // Optimizado para solo tours visibles
        const visibleCards = Array.from(document.querySelectorAll('.tour-card'))
            .filter(card => card.offsetParent !== null);
        
        visibleCards.forEach((card, index) => {
            const allCards = document.querySelectorAll('.tour-card');
            const cardIndex = Array.from(allCards).indexOf(card);
            const tourKey = `tour_${cardIndex + 1}`;
            const tourData = tours[tourKey];
            
            if (tourData) {
                const title = card.querySelector('h3');
                const price = card.querySelector('.text-purple-700');
                const description = card.querySelector('.description-content p');
                
                if (title) title.textContent = tourData.name;
                if (price) price.textContent = tourData.price;
                if (description) description.textContent = tourData.description;
            }
        });
    }
}

// Inicialización optimizada
document.addEventListener('DOMContentLoaded', () => {
    if (!window.translationManager) {
        window.translationManager = new TranslationManager();
    }
});

window.TranslationManager = TranslationManager;
