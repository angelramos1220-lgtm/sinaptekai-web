// Aparición al hacer scroll de los elementos con [data-fade].
// Portado tal cual del sitio anterior (método initFade).

export function iniciarAparicion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-fade]').forEach((el) => {
    el.style.opacity = '0'; el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .7s ease, transform .7s ease';
    io.observe(el);
  });
}
