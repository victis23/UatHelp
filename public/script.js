document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

const nav = document.querySelector('.topbar');

if (nav) {
    window.addEventListener('scroll', () => {
        nav.style.boxShadow =
            window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.08)' : 'none';
    });
}