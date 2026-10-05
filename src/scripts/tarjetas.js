// Tarjetas 3D reactivas ([data-tilt-card] dentro de [data-tilt-grid]): entrada
// escalonada, inclinación, foco de luz y borde que sigue al cursor.
// Portado tal cual del sitio anterior (método initTiltCards).

export function iniciarTarjetas() {
  const cards = Array.from(document.querySelectorAll('[data-tilt-card]'));
  if (!cards.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHoverTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced;

  // --- Capa 4: entrada escalonada, una sola vez, por grilla. ---
  // El estado oculto lo aplica este mismo JS, justo antes de observar —
  // así, si el JS no llegara a correr por algún motivo, las tarjetas se
  // quedan en su valor por defecto visible (ver fallback en el CSS), en
  // vez de invisibles para siempre.
  if (reduced) {
    cards.forEach((c) => c.classList.add('tc-in'));
  } else {
    cards.forEach((c) => {
      c.style.setProperty('--enter-y', '24px');
      c.style.setProperty('--enter-o', '0');
    });
    const grids = Array.from(new Set(cards.map((c) => c.closest('[data-tilt-grid]')).filter(Boolean)));
    const entranceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const grid = entry.target;
        Array.from(grid.querySelectorAll('[data-tilt-card]')).forEach((c, i) => {
          c.style.transitionDelay = (i * 80) + 'ms';
          c.style.setProperty('--enter-y', '0px');
          c.style.setProperty('--enter-o', '1');
          c.classList.add('tc-in');
        });
        entranceObserver.unobserve(grid);
      });
    }, { threshold: 0.15 });
    grids.forEach((g) => entranceObserver.observe(g));
  }

  if (!canHoverTilt) return; // móvil / sin puntero fino / reduced-motion: sin tilt, foco de luz ni borde reactivo

  // --- Capas 1-3: inclinación 3D + foco de luz + borde reactivo. ---
  const MAX_TILT = 6;
  let activeCard = null;
  let activeRect = null;
  let pendingTarget = null;
  let rawX = 0, rawY = 0, ticking = false;

  function resetCard(card) {
    card.classList.remove('is-active');
    card.style.removeProperty('transition-delay');
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--tilt-z', '0px');
  }

  function applyTilt(card, px, py) {
    const nx = px * 2 - 1, ny = py * 2 - 1;
    // Una tarjeta muy ancha (el banner de Diseño Web) se inclina menos: los
    // mismos grados sobre 1100px de ancho mueven demasiado los bordes.
    const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || MAX_TILT;
    card.style.setProperty('--tilt-x', (-ny * maxTilt).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-y', (nx * maxTilt).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-z', '10px');
    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    card.style.setProperty('--shadow-x', (nx * 10).toFixed(1) + 'px');
    card.style.setProperty('--shadow-y', (ny * 10).toFixed(1) + 'px');
    let angleDeg = Math.atan2(ny, nx) * 180 / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;
    card.style.setProperty('--border-angle', angleDeg.toFixed(1) + 'deg');
  }

  function processMove() {
    ticking = false;
    const card = pendingTarget && pendingTarget.closest ? pendingTarget.closest('[data-tilt-card]') : null;
    if (card !== activeCard) {
      if (activeCard) resetCard(activeCard);
      activeCard = card;
      if (activeCard) {
        activeCard.classList.add('is-active');
        activeRect = activeCard.getBoundingClientRect(); // única lectura de layout, solo al entrar a una tarjeta nueva
      } else {
        activeRect = null;
      }
    }
    if (!activeCard || !activeRect) return;
    const px = Math.min(1, Math.max(0, (rawX - activeRect.left) / activeRect.width));
    const py = Math.min(1, Math.max(0, (rawY - activeRect.top) / activeRect.height));
    applyTilt(activeCard, px, py);
  }

  document.addEventListener('mousemove', (e) => {
    pendingTarget = e.target; // ya provisto por el navegador, sin costo extra
    rawX = e.clientX; rawY = e.clientY;
    if (!ticking) { ticking = true; requestAnimationFrame(processMove); }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    if (activeCard) { resetCard(activeCard); activeCard = null; activeRect = null; }
  });

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!activeCard || scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      if (activeCard) activeRect = activeCard.getBoundingClientRect();
    });
  }, { passive: true });
}
