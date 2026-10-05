// Videos con carga diferida. Portado tal cual del sitio anterior
// (métodos initClickToPlayVideos e initEjemplos).

// Reproducción manual: el archivo de video se pide recién al pulsar reproducir.
export function iniciarVideos() {
  // Sin autoplay ni muted: el video (y su descarga) arranca solo con un
  // gesto explícito del usuario — así el navegador permite el audio.
  // Un solo video sonando a la vez: al detectar 'play' en cualquiera,
  // pausa los demás (cubre tanto el primer tap como una reanudación
  // posterior desde los controles nativos).
  const wraps = Array.from(document.querySelectorAll('[data-video-wrap]'));
  if (!wraps.length) return;
  const videos = [];
  wraps.forEach((wrap) => {
    const video = wrap.querySelector('video');
    const btn = wrap.querySelector('[data-video-playbtn]');
    if (!video || !btn) return;
    videos.push(video);
    btn.addEventListener('click', () => {
      if (video.dataset.src) { video.src = video.dataset.src; delete video.dataset.src; }
      video.muted = false;
      video.controls = true;
      wrap.classList.add('sk-video-started');
      video.play().catch(() => {});
    });
    video.addEventListener('play', () => {
      videos.forEach((v) => { if (v !== video && !v.paused) v.pause(); });
    });
  });
}

// "Ver ejemplo": el póster también espera a que se abra el desplegable.
export function iniciarEjemplos() {
  document.querySelectorAll('details[data-ejemplo]').forEach((d) => {
    d.addEventListener('toggle', () => {
      const video = d.querySelector('video');
      if (!video) return;
      if (d.open && video.dataset.poster) { video.poster = video.dataset.poster; delete video.dataset.poster; }
      if (!d.open && !video.paused) video.pause();
    });
  });
}
