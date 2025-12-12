// CONFIGURACIÓN
const CONFIG = {
    formspreeID: 'mzznyabg', // Reemplaza con tu ID real
    enableServiceWorker: true,
    enableAnalytics: false,
    siteName: 'Fundación Manantial del Ser'
};

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    console.log(`🚀 ${CONFIG.siteName} - Iniciando...`);
    
    // Cargar módulos
    initLoadingScreen();
    initNavigation();
    initStatsCounters();
    initContactForm();
    initNewsletter();
    initModals();
    initScrollEffects();
    updateCopyrightYear();
    
    // Service Worker para modo offline
    if (CONFIG.enableServiceWorker && 'serviceWorker' in navigator) {
        registerServiceWorker();
    }
    
    console.log('✅ Sitio cargado correctamente');
});

// PANTALLA DE CARGA
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        // Ocultar después de 1 segundo (tiempo mínimo de carga)
        setTimeout(() => {
            loadingScreen.classList.add('loaded');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// NAVEGACIÓN RESPONSIVE
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.getElementById('main-header');
    
    if (!menuToggle || !mainNav) return;
    
    // Toggle menú móvil
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
        document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Cerrar menú al hacer clic en enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Solo para móviles
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Scroll suave
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const headerHeight = header.offsetHeight;
                    window.scrollTo({
                        top: targetSection.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Efecto de scroll en header
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Cerrar menú al redimensionar (si se cambia a desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// CONTADORES ANIMADOS
function initStatsCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.stats-section');
    
    if (!counters.length || !statsSection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-count'));
                    animateCounter(counter, target, 2000);
                });
                observer.unobserve(statsSection);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);
}

function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
            start += increment;
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    update();
}

// FORMULARIO DE CONTACTO (GRATUITO CON FORMSPREE)
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    // Configurar action dinámico
    if (CONFIG.formspreeID) {
        form.action = `https://formspree.io/f/${CONFIG.formspreeID}`;
    }
    
    // Manejar envío local para feedback
    form.addEventListener('submit', function(e) {
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Feedback visual
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        // Guardar en localStorage como backup
        const formData = new FormData(this);
        const formObject = Object.fromEntries(formData);
        localStorage.setItem('lastContactForm', JSON.stringify(formObject));
        
        // Restaurar botón después de 2 segundos
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showNotification('Mensaje enviado. ¡Gracias!', 'success');
        }, 2000);
    });
}

// NEWSLETTER SIMPLE (local)
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        if (email && validateEmail(email)) {
            // Guardar en localStorage
            const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
            subscribers.push({ email, date: new Date().toISOString() });
            localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
            
            showNotification('¡Gracias por suscribirte!', 'success');
            this.reset();
        } else {
            showNotification('Por favor ingresa un email válido', 'error');
        }
    });
}

// MODALES
function initModals() {
    const modalOverlay = document.getElementById('modalOverlay');
    const closeButtons = document.querySelectorAll('.close-modal');
    const modals = document.querySelectorAll('.modal');
    
    // Abrir modal
    window.openModal = function(modalId) {
        const modal = document.getElementById(`modal${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`);
        if (modal) {
            modal.style.display = 'block';
            modalOverlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    };
    
    // Cerrar modales
    function closeAllModals() {
        modals.forEach(modal => modal.style.display = 'none');
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // Event listeners
    modalOverlay.addEventListener('click', closeAllModals);
    closeButtons.forEach(btn => btn.addEventListener('click', closeAllModals));
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAllModals();
    });
}

// EFECTOS DE SCROLL
function initScrollEffects() {
    // Revelar elementos al hacer scroll
    const revealElements = document.querySelectorAll('.program-card, .stat-item, .about-image');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => revealObserver.observe(el));
}

// ACTUALIZAR AÑO EN FOOTER
function updateCopyrightYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// NOTIFICACIONES
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Botón cerrar
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// VALIDACIÓN DE EMAIL
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// SERVICE WORKER (PARA MODO OFFLINE)
function registerServiceWorker() {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('✅ Service Worker registrado:', registration);
        })
        .catch(error => {
            console.log('❌ Error registrando Service Worker:', error);
        });
}

// BACKUP DE FORMULARIOS
function backupFormData(formId, data) {
    const backups = JSON.parse(localStorage.getItem('formBackups') || '{}');
    backups[formId] = {
        data: data,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('formBackups', JSON.stringify(backups));
}

// RECUPERAR DATOS DE FORMULARIO
function restoreFormData(formId) {
    const backups = JSON.parse(localStorage.getItem('formBackups') || '{}');
    return backups[formId] || null;
}

// ANIMACIONES CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .revealed {
        animation: fadeInUp 0.6s ease;
    }
    
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);