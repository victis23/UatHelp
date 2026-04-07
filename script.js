// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});


// Fade-in animation on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});


// Simple hero text animation (type effect)
const heroText = document.querySelector('.hero h1');

if (heroText) {
    const text = heroText.innerText;
    heroText.innerText = '';
    let index = 0;

    function typeEffect() {
        if (index < text.length) {
            heroText.innerText += text.charAt(index);
            index++;
            setTimeout(typeEffect, 20);
        }
    }

    typeEffect();
}


// Button hover micro-interaction (adds slight scale effect)
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
});


// Sticky nav shadow on scroll
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
    } else {
        nav.style.boxShadow = 'none';
    }
});
