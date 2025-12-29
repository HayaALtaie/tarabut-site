document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('lang-toggle');
    const html = document.documentElement;

    function setLanguage(lang) {
        const dir = lang === 'ar' ? 'rtl' : 'ltr';

        html.setAttribute('lang', lang);
        html.setAttribute('dir', dir);

        localStorage.setItem('selectedLang', lang);

        if (typeof translations !== 'undefined') {
            const t = translations[lang];

            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (t[key]) {
                    if (element.tagName === 'H1' || element.tagName === 'P' || element.tagName === 'DIV' || element.tagName === 'SPAN') {
                        element.innerHTML = t[key];
                    } else {
                        element.textContent = t[key];
                    }
                }
            });

            const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
            placeholders.forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                if (t[key]) {
                    element.setAttribute('placeholder', t[key]);
                }
            });
        }

        if (typeof goToSlide === 'function' && typeof currentIndex !== 'undefined' && typeof slideCount !== 'undefined') {
            goToSlide(currentIndex % slideCount, false);
        }
    }

    const savedLang = localStorage.getItem('selectedLang') || 'ar';
    setLanguage(savedLang);

    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const currentLang = html.getAttribute('lang');
            const newLang = currentLang === 'ar' ? 'en' : 'ar';
            setLanguage(newLang);
        });
    }

    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');

            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    const sliderTrack = document.getElementById('sliderTrack');
    const sliderContainer = document.getElementById('sliderContainer');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');

    if (sliderTrack && sliderContainer) {
        const slides = Array.from(sliderTrack.children);
        const slideCount = slides.length;

        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            sliderTrack.appendChild(clone);
        });

        let currentIndex = 0;
        let isTransitioning = false;
        let autoSlideInterval;

        function getSlideWidth() {
            const slideItem = sliderTrack.querySelector('.slide-item');
            const slideStyle = window.getComputedStyle(slideItem);
            const slideWidth = slideItem.offsetWidth;
            const gap = parseInt(window.getComputedStyle(sliderTrack).gap) || 40;
            return slideWidth + gap;
        }

        function createDots() {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < slideCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            if (dots.length === 0) return;
            const activeDotIndex = ((currentIndex % slideCount) + slideCount) % slideCount;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeDotIndex);
            });
        }
        function goToSlide(index, smooth = true) {
            currentIndex = index;
            const slideWidth = getSlideWidth();
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            const offset = isRTL ? currentIndex * slideWidth : -currentIndex * slideWidth;

            if (smooth) {
                sliderTrack.style.transition = 'transform 0.5s ease-in-out';
            } else {
                sliderTrack.style.transition = 'none';
            }

            sliderTrack.style.transform = `translateX(${offset}px)`;
            updateDots();
        }

        function nextSlide() {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            goToSlide(currentIndex);

            if (currentIndex >= slideCount) {
                setTimeout(() => {
                    currentIndex = 0;
                    goToSlide(0, false);
                    isTransitioning = false;
                }, 500);
            } else {
                setTimeout(() => {
                    isTransitioning = false;
                }, 500);
            }
        }

        function prevSlide() {
            if (isTransitioning) return;
            isTransitioning = true;

            if (currentIndex === 0) {
                currentIndex = slideCount;
                goToSlide(currentIndex, false);
                setTimeout(() => {
                    currentIndex--;
                    goToSlide(currentIndex);
                    setTimeout(() => {
                        isTransitioning = false;
                    }, 500);
                }, 20);
            } else {
                currentIndex--;
                goToSlide(currentIndex);
                setTimeout(() => {
                    isTransitioning = false;
                }, 500);
            }
        }

    
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 3000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            });
        }

        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);

        createDots();
        goToSlide(0, false);
        startAutoSlide();

        window.updateSliderPosition = () => {
            goToSlide(currentIndex % slideCount, false);
        };

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateSliderPosition();
            }, 250);
        });
    }

    const workSliderTrack = document.getElementById('workSliderTrack');
    const workPrevBtn = document.getElementById('workPrev');
    const workNextBtn = document.getElementById('workNext');
    const workDotsContainer = document.getElementById('workDots');

    if (workSliderTrack) {
        let workIndex = 0;
        const workSlides = Array.from(workSliderTrack.children);
        const workSlideCount = workSlides.length;

        function getVisibleWorkItems() {
            const width = window.innerWidth;
            if (width > 1024) return 3;
            if (width > 640) return 2;
            return 1;
        }

        function getWorkSlideWidth() {
            const containerWidth = workSliderTrack.parentElement.offsetWidth;
            const gap = 30;
            const visibleItems = getVisibleWorkItems();
            return (containerWidth - (gap * (visibleItems - 1))) / visibleItems + gap;
        }

        function createWorkDots() {
            if (!workDotsContainer) return;
            workDotsContainer.innerHTML = '';
            const visibleItems = getVisibleWorkItems();
            const dotCount = workSlideCount - visibleItems + 1;
            for (let i = 0; i < dotCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('work-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToWorkSlide(i));
                workDotsContainer.appendChild(dot);
            }
        }

        function updateWorkDots() {
            if (!workDotsContainer) return;
            const dots = workDotsContainer.querySelectorAll('.work-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === workIndex);
            });
        }

        function goToWorkSlide(index) {
            const visibleItems = getVisibleWorkItems();
            const maxIndex = workSlideCount - visibleItems;
            workIndex = Math.max(0, Math.min(index, maxIndex));

            const slideWidth = getWorkSlideWidth();
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            const offset = isRTL ? workIndex * slideWidth : -workIndex * slideWidth;

            workSliderTrack.style.transform = `translateX(${offset}px)`;
            updateWorkDots();
        }

        if (workNextBtn) {
            workNextBtn.addEventListener('click', () => {
                const visibleItems = getVisibleWorkItems();
                if (workIndex < workSlideCount - visibleItems) {
                    goToWorkSlide(workIndex + 1);
                } else {
                    goToWorkSlide(0);
                }
            });
        }

        if (workPrevBtn) {
            workPrevBtn.addEventListener('click', () => {
                const visibleItems = getVisibleWorkItems();
                if (workIndex > 0) {
                    goToWorkSlide(workIndex - 1);
                } else {
                    goToWorkSlide(workSlideCount - visibleItems);
                }
            });
        }

        window.updateWorkPosition = () => {
            createWorkDots();
            goToWorkSlide(workIndex);
        };

        createWorkDots();
        window.addEventListener('resize', updateWorkPosition);
    }

    const originalSetLanguage = setLanguage;
    setLanguage = function (lang) {
        originalSetLanguage(lang);
        if (typeof updateSliderPosition === 'function') updateSliderPosition();
        if (typeof updateWorkPosition === 'function') updateWorkPosition();
    };
});
