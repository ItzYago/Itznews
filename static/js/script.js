/**
 * ItzNews - Static Frontend Interactions & Animations
 * Pure JavaScript Implementation (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ------------------------------------------------------------------
    // CONFIGURATION & STATE
    // ------------------------------------------------------------------
    const CONFIG = {
        scrollThreshold: 50,
        backToTopThreshold: 400,
        staggerDelay: 80,
        loaderDuration: 3500, // Duração da animação inicial em milissegundos (3.5s)
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // ------------------------------------------------------------------
    // 1. INITIAL LOADING SCREEN
    // ------------------------------------------------------------------
    const initLoadingScreen = () => {
        let loader = document.getElementById('itz-loader');

        // Dynamically inject loader if it does not exist in static HTML templates
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'itz-loader';
            loader.setAttribute('aria-hidden', 'true');
            loader.innerHTML = `
                <div class="loader-content">
                    <span class="loader-logo">ItzNews</span>
                    <div class="loader-bar"><div class="loader-progress"></div></div>
                </div>
            `;
            
            // Inject structural CSS for loader dynamically
            const style = document.createElement('style');
            style.textContent = `
                #itz-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: #0a0c10;
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s;
                }
                #itz-loader.fade-out {
                    opacity: 0;
                    visibility: hidden;
                }
                .loader-content {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.25rem;
                }
                .loader-logo {
                    color: #f0f4f8;
                    font-size: 2.25rem;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                    animation: logoPulse 1.75s ease-in-out infinite alternate;
                }
                .loader-logo::after {
                    content: '.';
                    color: #38bdf8;
                }
                .loader-bar {
                    width: 140px;
                    height: 3px;
                    background-color: #181d28;
                    border-radius: 9999px;
                    overflow: hidden;
                    position: relative;
                }
                .loader-progress {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 40%;
                    background-color: #38bdf8;
                    border-radius: 9999px;
                    animation: loaderAnim 1.75s ease-in-out infinite alternate;
                }
                @keyframes logoPulse {
                    0% { transform: scale(0.98); opacity: 0.8; }
                    100% { transform: scale(1.03); opacity: 1; }
                }
                @keyframes loaderAnim {
                    0% { left: -10%; width: 30%; }
                    100% { left: 80%; width: 40%; }
                }
            `;
            document.head.appendChild(style);
            document.body.prepend(loader);
        }

        const dismissLoader = () => {
            if (!loader || loader.classList.contains('fade-out')) return;
            loader.classList.add('fade-out');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
                initPageEntrance();
                initScrollObserver(); // Inicializa observadores apenas após a saída do loader
            }, 600);
        };

        // Mantém a tela de carregamento visível exatamente por 3.5 segundos antes de remover
        setTimeout(dismissLoader, CONFIG.loaderDuration);
    };

    // ------------------------------------------------------------------
    // 2. PAGE ENTRANCE ANIMATIONS
    // ------------------------------------------------------------------
    const initPageEntrance = () => {
        if (CONFIG.reducedMotion) return;

        const header = document.querySelector('.site-header');
        const main = document.querySelector('.site-main');
        const footer = document.querySelector('.site-footer');

        const entranceElements = [header, main, footer].filter(Boolean);

        entranceElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 120);
        });
    };

    // ------------------------------------------------------------------
    // 3. INTERSECTION OBSERVER & STAGGER ANIMATIONS
    // ------------------------------------------------------------------
    const initScrollObserver = () => {
        if (CONFIG.reducedMotion || !('IntersectionObserver' in window)) return;

        const revealStyle = document.createElement('style');
        revealStyle.textContent = `
            .js-reveal {
                opacity: 0;
                transform: translateY(24px);
                transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                will-change: opacity, transform;
            }
            .js-reveal.is-visible {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(revealStyle);

        const targetElements = document.querySelectorAll(
            '.section-title, .featured-card, .category-card, .article-container, .search-header, .no-results-state'
        );

        targetElements.forEach(el => el.classList.add('js-reveal'));

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        targetElements.forEach(el => observer.observe(el));

        // Grid Staggering
        const grids = document.querySelectorAll('.news-grid, .related-grid, .categories-grid');
        grids.forEach(grid => {
            const cards = grid.querySelectorAll('.news-card, .related-card, .category-card');
            cards.forEach(card => card.classList.add('js-reveal'));

            const gridObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const gridCards = entry.target.querySelectorAll('.js-reveal');
                        gridCards.forEach((card, idx) => {
                            setTimeout(() => {
                                card.classList.add('is-visible');
                            }, idx * CONFIG.staggerDelay);
                        });
                        obs.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            gridObserver.observe(grid);
        });
    };

    // ------------------------------------------------------------------
    // 4. HEADER SCROLL & MOBILE MENU
    // ------------------------------------------------------------------
    const initHeader = () => {
        const header = document.querySelector('.site-header');
        const mainNav = document.querySelector('.main-nav');
        if (!header) return;

        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > CONFIG.scrollThreshold) {
                header.classList.add('is-scrolled');
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
            } else {
                header.classList.remove('is-scrolled');
                header.style.boxShadow = 'none';
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Mobile Menu Button Injection & Handling
        const navContainer = document.querySelector('.header-container');
        if (navContainer && mainNav && !document.querySelector('.menu-toggle-btn')) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle-btn';
            menuToggle.setAttribute('aria-label', 'Alternar menu de navegação');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.innerHTML = `
                <span class="hamburger-bar"></span>
                <span class="hamburger-bar"></span>
                <span class="hamburger-bar"></span>
            `;

            const toggleStyle = document.createElement('style');
            toggleStyle.textContent = `
                .menu-toggle-btn {
                    display: none;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    flex-direction: column;
                    gap: 5px;
                    z-index: 1001;
                }
                .hamburger-bar {
                    display: block;
                    width: 22px;
                    height: 2px;
                    background-color: var(--text-primary, #f0f4f8);
                    transition: transform 0.3s, opacity 0.3s;
                    border-radius: 2px;
                }
                .menu-toggle-btn.is-active .hamburger-bar:nth-child(1) {
                    transform: translateY(7px) rotate(45deg);
                }
                .menu-toggle-btn.is-active .hamburger-bar:nth-child(2) {
                    opacity: 0;
                }
                .menu-toggle-btn.is-active .hamburger-bar:nth-child(3) {
                    transform: translateY(-7px) rotate(-45deg);
                }
                @media (max-width: 768px) {
                    .menu-toggle-btn {
                        display: flex;
                    }
                    .main-nav.is-open {
                        display: flex !important;
                        flex-direction: column;
                        position: absolute;
                        top: var(--header-height, 72px);
                        left: 0;
                        width: 100%;
                        background-color: #0a0c10;
                        border-bottom: 1px solid #263142;
                        padding: 1.5rem;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                    }
                    .main-nav.is-open .nav-list {
                        flex-direction: column;
                        align-items: flex-start;
                        width: 100%;
                        gap: 1rem;
                    }
                }
            `;
            document.head.appendChild(toggleStyle);
            navContainer.appendChild(menuToggle);

            const toggleMenu = (open) => {
                const isOpen = open !== undefined ? open : !mainNav.classList.contains('is-open');
                mainNav.classList.toggle('is-open', isOpen);
                menuToggle.classList.toggle('is-active', isOpen);
                menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            };

            menuToggle.addEventListener('click', () => toggleMenu());

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
                    toggleMenu(false);
                }
            });

            const navLinks = mainNav.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => toggleMenu(false));
            });
        }
    };

    // ------------------------------------------------------------------
    // 5. BACK TO TOP BUTTON
    // ------------------------------------------------------------------
    const initBackToTop = () => {
        if (document.getElementById('back-to-top')) return;

        const btn = document.createElement('button');
        btn.id = 'back-to-top';
        btn.setAttribute('aria-label', 'Voltar ao topo da página');
        btn.innerHTML = '&#8593;';

        const btnStyle = document.createElement('style');
        btnStyle.textContent = `
            #back-to-top {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background-color: var(--accent-primary, #38bdf8);
                color: var(--text-inverse, #0f172a);
                border: none;
                font-size: 1.25rem;
                font-weight: bold;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: opacity 0.3s, transform 0.3s, background-color 0.2s;
                z-index: 900;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            #back-to-top.is-visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            #back-to-top:hover {
                background-color: var(--accent-hover, #0ea5e9);
            }
        `;
        document.head.appendChild(btnStyle);
        document.body.appendChild(btn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > CONFIG.backToTopThreshold) {
                btn.classList.add('is-visible');
            } else {
                btn.classList.remove('is-visible');
            }
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: CONFIG.reducedMotion ? 'auto' : 'smooth'
            });
        });
    };

    // ------------------------------------------------------------------
    // 6. SEARCH FORM INTERACTION ENHANCEMENT (VISUAL ONLY)
    // ------------------------------------------------------------------
    const initSearchForm = () => {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-input');
        if (!searchForm || !searchInput) return;

        searchInput.addEventListener('focus', () => {
            searchForm.classList.add('is-focused');
        });

        searchInput.addEventListener('blur', () => {
            searchForm.classList.remove('is-focused');
        });
    };

    // ------------------------------------------------------------------
    // INITIALIZATION
    // ------------------------------------------------------------------
    const init = () => {
        initLoadingScreen();
        initHeader();
        initBackToTop();
        initSearchForm();
    };

    init();
});