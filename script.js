(function() {
  'use strict';

  // ============================================
  // ИНИЦИАЛИЗАЦИЯ И УТИЛИТЫ
  // ============================================

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  const app = window.__app;

  // Утилиты
  function debounce(fn, ms) {
    let timer;
    return function() {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(ctx, args), ms);
    };
  }

  function throttle(fn, ms) {
    let last = 0;
    return function() {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  // ============================================
  // ВАЛИДАЦИЯ ФОРМ
  // ============================================

  const validators = {
    firstName: {
      test: (value) => value.trim().length >= 2,
      message: 'Voornaam moet minimaal 2 tekens bevatten'
    },
    lastName: {
      test: (value) => value.trim().length >= 2,
      message: 'Achternaam moet minimaal 2 tekens bevatten'
    },
    email: {
      test: (value) => /^[^s@]+@[^s@]+.[^s@]+$/.test(value),
      message: 'Voer een geldig e-mailadres in (bijv. naam@voorbeeld.nl)'
    },
    phone: {
      test: (value) => /^[ds-+()]{10,}$/.test(value),
      message: 'Voer een geldig telefoonnummer in (minimaal 10 cijfers)'
    },
    service: {
      test: (value) => value && value !== '',
      message: 'Selecteer een dienst uit de lijst'
    },
    position: {
      test: (value) => value && value !== '',
      message: 'Selecteer een functie uit de lijst'
    },
    privacy: {
      test: (checked) => checked === true,
      message: 'Accepteer de privacyverklaring om door te gaan'
    },
    consent: {
      test: (checked) => checked === true,
      message: 'Accepteer de voorwaarden om door te gaan'
    },
    cv: {
      test: (files) => files && files.length > 0,
      message: 'Upload uw CV (PDF of Word bestand)'
    }
  };

  function validateField(input) {
    const fieldName = input.id.replace('form-', '').replace('firstName', 'firstName').replace('lastName', 'lastName');
    const validator = validators[fieldName] || validators[input.id];
    
    if (!validator) return true;

    let value, isValid;
    
    if (input.type === 'checkbox') {
      value = input.checked;
      isValid = validator.test(value);
    } else if (input.type === 'file') {
      value = input.files;
      isValid = validator.test(value);
    } else {
      value = input.value;
      isValid = validator.test(value);
    }

    const feedback = input.parentElement.querySelector('.invalid-feedback') || 
                     input.closest('.form-check')?.querySelector('.invalid-feedback');

    if (!isValid) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      if (feedback) {
        feedback.textContent = validator.message;
        feedback.style.display = 'block';
      }
      
      // Анимация ошибки
      input.style.animation = 'shake 0.4s ease-in-out';
      setTimeout(() => {
        input.style.animation = '';
      }, 400);
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      if (feedback) {
        feedback.style.display = 'none';
      }
    }

    return isValid;
  }

  // ============================================
  // АНИМАЦИЯ ИЗОБРАЖЕНИЙ
  // ============================================

  function initImageAnimations() {
    if (app.imageAnimInit) return;
    app.imageAnimInit = true;

    const images = document.querySelectorAll('img:not(.c-logo__img)');
    
    images.forEach((img, index) => {
      // Начальное состояние
      img.style.opacity = '0';
      img.style.transform = 'translateY(30px) scale(0.95)';
      img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

      // Анимация при загрузке
      const animateImage = () => {
        setTimeout(() => {
          img.style.opacity = '1';
          img.style.transform = 'translateY(0) scale(1)';
        }, index * 100);
      };

      if (img.complete) {
        animateImage();
      } else {
        img.addEventListener('load', animateImage);
      }

      // Hover эффект
      img.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(0) scale(1.02)';
      });

      img.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  // ============================================
  // АНИМАЦИЯ КНОПОК
  // ============================================

  function initButtonAnimations() {
    if (app.buttonAnimInit) return;
    app.buttonAnimInit = true;

    const buttons = document.querySelectorAll('.btn, .c-button, button[class*="btn"]');
    
    buttons.forEach(btn => {
      // Ripple эффект
      btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });

      // Hover анимация
      btn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    // CSS для ripple
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ============================================
  // АНИМАЦИЯ КАРТОЧЕК
  // ============================================

  function initCardAnimations() {
    if (app.cardAnimInit) return;
    app.cardAnimInit = true;

    const cards = document.querySelectorAll('.card, .c-card, .service-card, .pricing-card, .whitepaper-card, .quick-link-card, .subscription-card');
    
    cards.forEach((card, index) => {
      // Начальное состояние
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      // Появление при скролле
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(card);

      // Hover эффект
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }

  // ============================================
  // АНИМАЦИЯ ССЫЛОК
  // ============================================

  function initLinkAnimations() {
    if (app.linkAnimInit) return;
    app.linkAnimInit = true;

    const links = document.querySelectorAll('a:not(.btn):not(.c-button)');
    
    links.forEach(link => {
      link.style.transition = 'all 0.25s ease-out';
      
      // Подчеркивание при hover
      if (!link.classList.contains('c-nav__link') && !link.classList.contains('c-logo')) {
        link.style.position = 'relative';
        
        link.addEventListener('mouseenter', function() {
          this.style.transform = 'translateX(2px)';
        });

        link.addEventListener('mouseleave', function() {
          this.style.transform = 'translateX(0)';
        });
      }
    });
  }

  // ============================================
  // АНИМАЦИЯ ХЕДЕРА
  // ============================================

  function initHeaderAnimation() {
    if (app.headerAnimInit) return;
    app.headerAnimInit = true;

    const header = document.querySelector('.l-header');
    if (!header) return;

    let lastScroll = 0;
    
    const handleScroll = throttle(() => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
      } else {
        header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06)';
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
      }

      lastScroll = currentScroll;
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    header.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  // ============================================
  // АНИМАЦИЯ ФУТЕРА
  // ============================================

  function initFooterAnimation() {
    if (app.footerAnimInit) return;
    app.footerAnimInit = true;

    const footer = document.querySelector('.l-footer');
    if (!footer) return;

    const footerElements = footer.querySelectorAll('.l-footer__brand, .l-footer__nav, .l-footer__contact');
    
    footerElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 150);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(el);
    });
  }

  // ============================================
  // МОБИЛЬНОЕ МЕНЮ С АНИМАЦИЕЙ
  // ============================================

  function initBurgerMenu() {
    if (app.burgerInit) return;
    app.burgerInit = true;

    const nav = document.querySelector('.c-nav#main-nav');
    const toggle = document.querySelector('.c-nav__toggle');
    const navList = document.querySelector('.c-nav__list');
    const body = document.body;

    if (!nav || !toggle || !navList) return;

    // Добавляем overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 999;
    `;
    document.body.appendChild(overlay);

    // Анимация иконки меню
    const icon = toggle.querySelector('.c-nav__toggle-icon');
    if (icon) {
      icon.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    function open() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';

      // Анимация пунктов меню
      const items = navList.querySelectorAll('.c-nav__item');
      items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        setTimeout(() => {
          item.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
          item.style.opacity = '1';
          item.style.transform = 'translateX(0)';
        }, index * 50);
      });
    }

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      nav.classList.contains('is-open') ? close() : open();
    });

    overlay.addEventListener('click', close);

    // Закрытие при клике на ссылку
    navList.querySelectorAll('.c-nav__link').forEach(link => {
      link.addEventListener('click', close);
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
      }
    });

    // Закрытие при ресайзе на desktop
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024 && nav.classList.contains('is-open')) {
        close();
      }
    }, 200));
  }

  // ============================================
  // ФОРМЫ С ВАЛИДАЦИЕЙ
  // ============================================

  function initForms() {
    if (app.formsInit) return;
    app.formsInit = true;

    const forms = document.querySelectorAll('.needs-validation, .c-form, form[id*="form"]');

    // Функция уведомлений
    app.notify = function(message, type = 'info') {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          max-width: 350px;
        `;
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `alert alert-${type} alert-dismissible fade show`;
      toast.style.cssText = `
        margin-bottom: 10px;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" aria-label="Close"></button>
      `;
      
      container.appendChild(toast);

      toast.querySelector('.btn-close').addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => toast.remove(), 400);
      });

      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => toast.remove(), 400);
      }, 5000);
    };

    // CSS для toast анимаций
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    forms.forEach(form => {
      // Создаем элементы для ошибок
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (!input.parentElement.querySelector('.invalid-feedback') && 
            !input.closest('.form-check')?.querySelector('.invalid-feedback')) {
          const feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.style.display = 'none';
          
          if (input.type === 'checkbox') {
            input.closest('.form-check')?.appendChild(feedback);
          } else {
            input.parentElement.appendChild(feedback);
          }
        }

        // Валидация в реальном времени
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', debounce(() => {
          if (input.classList.contains('is-invalid')) {
            validateField(input);
          }
        }, 300));
      });

      // Обработка отправки
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        let isValid = true;
        const formInputs = this.querySelectorAll('input, select, textarea');
        
        // Валидация всех полей
        formInputs.forEach(input => {
          if (!validateField(input)) {
            isValid = false;
          }
        });

        this.classList.add('was-validated');

        if (!isValid) {
          app.notify('Controleer de gemarkeerde velden en probeer het opnieuw', 'danger');
          
          // Скролл к первой ошибке
          const firstError = this.querySelector('.is-invalid');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => firstError.focus(), 500);
          }
          return false;
        }

        // Отправка формы
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Bezig met verzenden...';
          submitBtn.style.transition = 'all 0.3s ease-out';

          const formData = new FormData(this);
          const data = {};
          formData.forEach((value, key) => {
            data[key] = value;
          });

          // Симуляция отправки (замените на реальный endpoint)
          fetch('process.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          .then(response => response.json())
          .then(result => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            if (result.success) {
              app.notify('Uw bericht is succesvol verzonden! We nemen spoedig contact met u op.', 'success');
              this.reset();
              this.classList.remove('was-validated');
              
              // Сброс состояний валидации
              formInputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
              });
            } else {
              app.notify(result.message || 'Er is een fout opgetreden. Probeer het later opnieuw.', 'danger');
            }
          })
          .catch(error => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            app.notify('Netwerkfout. Controleer uw internetverbinding en probeer het opnieuw.', 'danger');
          });
        }

        return false;
      });
    });
  }

  // ============================================
  // CAROUSEL АНИМАЦИЯ
  // ============================================

  function initCarouselAnimations() {
    if (app.carouselAnimInit) return;
    app.carouselAnimInit = true;

    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
      const items = carousel.querySelectorAll('.carousel-item');
      
      items.forEach(item => {
        item.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      });

      // Анимация при смене слайда
      carousel.addEventListener('slide.bs.carousel', function(e) {
        const caption = e.relatedTarget.querySelector('.carousel-caption');
        if (caption) {
          caption.style.opacity = '0';
          caption.style.transform = 'translateY(20px)';
          setTimeout(() => {
            caption.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            caption.style.opacity = '1';
            caption.style.transform = 'translateY(0)';
          }, 300);
        }
      });
    });
  }

  // ============================================
  // MODAL АНИМАЦИИ
  // ============================================

  function initModalAnimations() {
    if (app.modalAnimInit) return;
    app.modalAnimInit = true;

    const modalTriggers = document.querySelectorAll('[data-bs-toggle="modal"], .project-details-btn');
    
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', function() {
        const modal = document.querySelector(this.getAttribute('data-bs-target') || '#projectModal');
        if (modal) {
          modal.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          
          setTimeout(() => {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
              modalContent.style.animation = 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            }
          }, 10);
        }
      });
    });

    // CSS для modal анимации
    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        @keyframes modalSlideIn {
          from {
            transform: translateY(-50px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ============================================
  // PORTFOLIO FILTER АНИМАЦИЯ
  // ============================================

  function initPortfolioFilter() {
    if (app.portfolioFilterInit) return;
    app.portfolioFilterInit = true;

    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');

        // Обновление активной кнопки
        filterButtons.forEach(b => {
          b.classList.remove('c-button--primary');
          b.classList.add('c-button--secondary');
          b.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('c-button--primary');
        this.classList.remove('c-button--secondary');
        this.setAttribute('aria-pressed', 'true');

        // Фильтрация элементов с анимацией
        portfolioItems.forEach((item, index) => {
          const category = item.getAttribute('data-category');
          
          if (filter === 'all' || category === filter) {
            setTimeout(() => {
              item.classList.remove('is-hidden');
              item.style.animation = 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }, index * 50);
          } else {
            item.style.animation = 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
              item.classList.add('is-hidden');
            }, 300);
          }
        });
      });
    });

    // CSS для filter анимаций
    if (!document.getElementById('filter-styles')) {
      const style = document.createElement('style');
      style.id = 'filter-styles';
      style.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }
        .portfolio-item.is-hidden {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ============================================
  // SCROLL REVEAL АНИМАЦИЯ
  // ============================================

  function initScrollReveal() {
    if (app.scrollRevealInit) return;
    app.scrollRevealInit = true;

    const elementsToReveal = document.querySelectorAll(`
      .section-header,
      .hero-content,
      .about-snippet,
      .testimonial-avatar,
      .process-step,
      .client-logo-wrapper
    `);

    elementsToReveal.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      observer.observe(el);
    });
  }

  // ============================================
  // AOS ИНИЦИАЛИЗАЦИЯ
  // ============================================

  function initAOS() {
    if (app.aosInit) return;
    app.aosInit = true;

    if (typeof AOS !== 'undefined') {
      try {
        AOS.init({
          once: false,
          duration: 600,
          easing: 'ease-out',
          offset: 120,
          mirror: false,
          disable: function() {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          }
        });

        app.refreshAOS = () => {
          try {
            AOS.refresh();
          } catch (e) {
            console.error('AOS refresh error:', e);
          }
        };
      } catch (e) {
        console.error('AOS init error:', e);
      }
    } else {
      app.refreshAOS = () => {};
    }
  }

  // ============================================
  // ИЗОБРАЖЕНИЯ
  // ============================================

  function initImages() {
    if (app.imagesInit) return;
    app.imagesInit = true;

    const images = document.querySelectorAll('img');
    const placeholderSVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3EAfbeelding niet beschikbaar%3C/text%3E%3C/svg%3E';

    images.forEach(img => {
      if (!img.getAttribute('loading') && !img.classList.contains('c-logo__img')) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      img.addEventListener('error', function() {
        if (this.getAttribute('data-fallback-applied')) return;
        this.setAttribute('data-fallback-applied', 'true');
        this.src = placeholderSVG;
        this.style.objectFit = 'contain';
      });
    });
  }

  // ============================================
  // ANCHOR SCROLL
  // ============================================

  function initAnchorsAndScroll() {
    if (app.anchorsInit) return;
    app.anchorsInit = true;

    function getHeaderHeight() {
      const header = document.querySelector('.l-header');
      return header ? header.offsetHeight : 72;
    }

    function smoothScrollTo(target) {
      const offset = getHeaderHeight();
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    }

    document.addEventListener('click', function(e) {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.indexOf('#') !== 0 || href === '#' || href === '#!') return;

      const hash = href.substring(1);
      const el = document.getElementById(hash);

      if (el) {
        e.preventDefault();
        smoothScrollTo(el);
        history.pushState(null, null, href);
      }
    });
  }

  // ============================================
  // АКТИВНОЕ МЕНЮ
  // ============================================

  function initActiveMenu() {
    if (app.activeMenuInit) return;
    app.activeMenuInit = true;

    const pathname = location.pathname;
    const navLinks = document.querySelectorAll('.c-nav__link');
    const isHome = pathname === '/' || pathname === '/index.html' || pathname.match(//index.html?$/i);

    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      
      link.classList.remove('is-active', 'active');
      link.removeAttribute('aria-current');

      if (isHome && (linkHref === '/' || linkHref === '/index.html')) {
        link.classList.add('is-active', 'active');
        link.setAttribute('aria-current', 'page');
      } else if (linkHref && linkHref !== '/' && pathname.indexOf(linkHref) === 0) {
        link.classList.add('is-active', 'active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  // ============================================
  // ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ
  // ============================================

  app.init = function() {
    if (app.initialized) return;
    app.initialized = true;

    // Базовые функции
    initAOS();
    initImages();
    initActiveMenu();
    initAnchorsAndScroll();
    
    // Навигация
    initBurgerMenu();
    
    // Анимации
    initImageAnimations();
    initButtonAnimations();
    initCardAnimations();
    initLinkAnimations();
    initHeaderAnimation();
    initFooterAnimation();
    initScrollReveal();
    
    // Интерактивные элементы
    initForms();
    initCarouselAnimations();
    initModalAnimations();
    initPortfolioFilter();

    console.log('✅ Все анимации и валидация инициализированы');
  };

  // Запуск при загрузке
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
## Дополнения к CSS для анимаций

Добавьте в конец `style.css`:

/* ============================================
   ДОПОЛНИТЕЛЬНЫЕ АНИМАЦИИ
   ============================================ */

/* Плавное появление элементов */
.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover эффекты для карточек */
.card, .c-card, .service-card {
  will-change: transform;
}

/* Плавные transitions для всех интерактивных элементов */
a, button, input, select, textarea {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Улучшенная валидация форм */
.is-invalid {
  border-color: var(--color-error) !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23dc3545'%3E%3Cpath d='M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM7 4h2v5H7V4zm0 6h2v2H7v-2z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px !important;
}

.is-valid {
  border-color: var(--color-success) !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2328a745'%3E%3Cpath d='M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.97 6.03l-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 1 1 1.06-1.06l1.47 1.47 3.97-3.97a.75.75 0 1 1 1.06 1.06z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px !important;
}

/* Overlay для мобильного меню */
.nav-overlay {
  pointer-events: all;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
