// Mobile menu toggle
const toggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isOpen);
    });
}

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('active');
    });
});

// Scroll-triggered reveal animations
const revealSelectors = [
    // Section-level headings & labels
    '.problem-label', '.solution-label', '.sp-label',
    '.problem h2', '.solution h2',
    // Trust strip
    '.trust-inner',
    // Cards & blocks
    '.problem-card', '.step', '.service-block', '.case-card',
    '.stat', '.about-card',
    // About page
    '.about-text h2', '.about-text p', '.video-placeholder',
    // CTA sections
    '.cta-inner', '.lead-magnet-inner', '.testimonial-quote',
    // Contact
    '.calendly-wrap', '.contact-card',
    // Social proof
    '.social-proof',
    // Footer
    '.footer-inner'
];

const revealElements = document.querySelectorAll(revealSelectors.join(', '));

revealElements.forEach(el => el.classList.add('reveal'));

// Apply stagger delays to children within grid/list containers
const staggerContainers = [
    { selector: '.problem-grid', children: '.problem-card' },
    { selector: '.steps', children: '.step' },
    { selector: '.services-detail', children: '.service-block' },
    { selector: '.case-studies', children: '.case-card' },
    { selector: '.sp-stats', children: '.stat' },
    { selector: '.about-sidebar', children: '.about-card' },
    { selector: '.contact-sidebar', children: '.contact-card' },
    { selector: '.about-text', children: 'p' }
];

staggerContainers.forEach(({ selector, children }) => {
    document.querySelectorAll(selector).forEach(container => {
        container.querySelectorAll(children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 0.1}s`;
        });
    });
});

// Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealElements.forEach(el => observer.observe(el));

// Lead magnet form handler
const leadForm = document.getElementById('leadForm');
if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('leadEmail').value;
        const note = document.getElementById('leadNote');
        const btn = leadForm.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.textContent = 'Sending...';

        // Send to Formspree - replace YOUR_FORM_ID with your actual Formspree form ID
        // Sign up free at https://formspree.io and create a form to get your ID
        fetch('https://formspree.io/f/mnjbozwb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
        .then(response => {
            if (response.ok) {
                note.textContent = 'You\'re in! Check your inbox.';
                note.style.color = '#f2c94c';
                leadForm.reset();
            } else {
                note.textContent = 'Something went wrong. Try again or email us directly.';
                note.style.color = '#e74c3c';
            }
        })
        .catch(() => {
            note.textContent = 'Something went wrong. Try again or email us directly.';
            note.style.color = '#e74c3c';
        })
        .finally(() => {
            btn.disabled = false;
            btn.textContent = 'Send It →';
        });
    });
}

// Nav background on scroll + Sticky CTA
const stickyCta = document.getElementById('stickyCta');
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(10, 10, 11, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 10, 11, 0.85)';
    }

    // Sticky CTA: show after scrolling 600px, hide near footer
    if (stickyCta) {
        const footer = document.querySelector('.footer');
        const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
        const shouldShow = window.scrollY > 600 && footerTop > window.innerHeight;
        stickyCta.classList.toggle('visible', shouldShow);
    }
});

// ===== AI READINESS CHECKLIST =====
const checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');

if (checklistItems.length > 0) {
    const STORAGE_KEY = 'als-checklist';
    const totalItems = checklistItems.length;
    const progressFill = document.getElementById('progressFill');
    const progressCount = document.getElementById('progressCount');
    const progressPct = document.getElementById('progressPct');
    const scoreCircle = document.getElementById('scoreCircle');
    const scorePct = document.getElementById('scorePct');
    const scoreTitle = document.getElementById('scoreTitle');
    const scoreDescription = document.getElementById('scoreDescription');
    const CIRCUMFERENCE = 2 * Math.PI * 52;

    const tiers = [
        {
            max: 0.29,
            title: 'Early Stage',
            description: 'You have some groundwork to do - but that is exactly what a workflow audit is for. We can help you map your processes and identify where AI makes the biggest impact.'
        },
        {
            max: 0.62,
            title: 'Getting There',
            description: 'You have a solid foundation. A few targeted improvements and you will be ready to move fast. A strategy session could help you prioritize the right next steps.'
        },
        {
            max: 0.83,
            title: 'Ready to Go',
            description: 'Your business is well-positioned for AI implementation. The question is not if, but where to start first. Let\'s talk about your highest-impact opportunities.'
        },
        {
            max: 1.0,
            title: 'Primed for Takeoff',
            description: 'You are more ready than most businesses we talk to. Let\'s stop planning and start building. Book a call and we can have systems running within weeks.'
        }
    ];

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && Array.isArray(saved)) {
                checklistItems.forEach(item => {
                    if (saved.includes(item.value)) item.checked = true;
                });
            }
        } catch (e) {}
    }

    function saveState() {
        const checked = [];
        checklistItems.forEach(item => {
            if (item.checked) checked.push(item.value);
        });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
        } catch (e) {}
    }

    function updateProgress() {
        let checkedCount = 0;
        checklistItems.forEach(item => {
            if (item.checked) checkedCount++;
        });

        const pct = checkedCount / totalItems;
        const pctRounded = Math.round(pct * 100);

        progressFill.style.width = pctRounded + '%';
        progressCount.textContent = checkedCount;
        progressPct.textContent = pctRounded + '%';

        const offset = CIRCUMFERENCE - (pct * CIRCUMFERENCE);
        scoreCircle.style.strokeDashoffset = offset;
        scorePct.textContent = pctRounded + '%';

        if (checkedCount === 0) {
            scoreTitle.textContent = 'Your AI Readiness Score';
            scoreDescription.textContent = 'Check some items above to see your score.';
        } else {
            const tier = tiers.find(t => pct <= t.max) || tiers[tiers.length - 1];
            scoreTitle.textContent = tier.title;
            scoreDescription.textContent = tier.description;
        }

        saveState();
    }

    checklistItems.forEach(item => {
        item.addEventListener('change', updateProgress);
    });

    loadState();
    updateProgress();

    const checklistRevealEls = document.querySelectorAll('.checklist-category, .checklist-score-card');
    checklistRevealEls.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    document.querySelectorAll('.checklist-inner .checklist-category').forEach((cat, i) => {
        cat.style.transitionDelay = `${i * 0.1}s`;
    });
}
