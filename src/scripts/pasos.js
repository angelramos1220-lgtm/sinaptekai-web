// "Cómo funciona": la línea se dibuja y cada paso aparece cuando la línea llega a él.
// Portado tal cual del sitio anterior (método initHowSteps).

export function iniciarPasos() {
  const grid = document.querySelector('[data-how-grid]');
  if (!grid) return;
  const line = grid.querySelector('.how-line');
  const steps = Array.from(grid.querySelectorAll('[data-how-step]'));
  if (!line || !steps.length) return;

  const HOW_LINE_DURATION_MS = 2000; // única constante: los delays de cada paso salen de su posición real

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    steps.forEach((s) => { s.style.setProperty('--enter-o', '1'); s.style.setProperty('--enter-y', '0px'); });
    return; // todo visible de una, sin línea ni animación
  }

  // Estado oculto aplicado por este mismo JS (nunca por defecto en el CSS,
  // que cae a visible si el JS no llegara a correr).
  steps.forEach((s) => { s.style.setProperty('--enter-o', '0'); s.style.setProperty('--enter-y', '16px'); });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(grid);
      const isVertical = window.matchMedia('(max-width: 767px)').matches;
      // Todas las lecturas de layout primero, sin escrituras de por medio
      // (evita forzar un reflow innecesario entre lectura y lectura).
      const gridRect = grid.getBoundingClientRect();
      const delays = steps.map((step) => {
        const stepRect = step.getBoundingClientRect();
        let fraction;
        if (isVertical) {
          const centerY = stepRect.top - gridRect.top + stepRect.height / 2;
          fraction = gridRect.height > 0 ? centerY / gridRect.height : 0;
        } else {
          const centerX = stepRect.left - gridRect.left + stepRect.width / 2;
          fraction = gridRect.width > 0 ? centerX / gridRect.width : 0;
        }
        return Math.min(1, Math.max(0, fraction)) * HOW_LINE_DURATION_MS;
      });
      // Recién ahora las escrituras: al calcularse en el momento en que la
      // sección entra en viewport (no antes, no de una vez al cargar la
      // página), un resize previo a ese momento ya queda reflejado sin
      // necesitar un listener de resize aparte.
      line.style.transform = isVertical ? 'scaleY(1)' : 'scaleX(1)';
      steps.forEach((step, i) => {
        setTimeout(() => {
          step.style.setProperty('--enter-o', '1');
          step.style.setProperty('--enter-y', '0px');
          step.classList.add('is-active');
        }, delays[i]);
      });
    });
  }, { threshold: 0.3 });
  io.observe(grid);
}
