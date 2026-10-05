// Chat flotante del sitio (#sk-chat-root). Portado tal cual del sitio anterior.
// Lo único que cambia es de dónde salen los datos: la lista de servicios, los textos,
// el webhook y las claves de almacenamiento llegan en "config" (ver Chat.astro, que
// los toma de src/data/chat.ts y src/data/negocio.ts).
//
// NO cambiar el formato del envío (buildPayload) ni los id de los servicios:
// el workflow de n8n depende de ellos. Se envía una sola vez por carga de página.

export function iniciarChat(config) {
  'use strict';

  var WEBHOOK_URL = config.webhook;
  var CALENDLY_URL = config.textos.calendlyUrl;
  var WHATSAPP_NUMBER = config.whatsapp;
  var SERVICIOS = config.servicios;
  var TXT = config.textos;

  var root = document.getElementById('sk-chat-root');
  var launcher = document.getElementById('sk-launcher');
  var panelWrap = document.getElementById('sk-panel-wrap');
  var panel = document.getElementById('sk-panel');
  var closeBtn = document.getElementById('sk-close');
  var headerWa = document.getElementById('sk-header-wa');
  var log = document.getElementById('sk-log');
  var chips = document.getElementById('sk-chips');
  var form = document.getElementById('sk-form');
  var input = document.getElementById('sk-input');

  var state = {
    sessionId: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('sk-' + Date.now() + '-' + Math.random().toString(36).slice(2)),
    mensajes: [],
    servicioElegido: null,
    sent: false,
    inactivityTimer: null,
    lastFocused: null
  };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = (s === null || s === undefined) ? '' : String(s);
    return d.innerHTML;
  }

  function waLink(mensaje) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(mensaje);
  }

  headerWa.href = waLink(TXT.mensajeCabecera);

  function addMsg(from, html) {
    var plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    state.mensajes.push({ from: from, text: plain, ts: new Date().toISOString() });
    var el = document.createElement('div');
    el.className = 'sk-msg sk-msg-' + from;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    resetInactivityTimer();
  }

  function renderServicio(servicio) {
    state.servicioElegido = servicio.id;
    var mensajePrefijado = TXT.mensajeServicio + servicio.nombre;
    var precioHtml = servicio.precio ? '<p class="sk-precio">' + esc(servicio.precio) + '</p>' : '';
    var calendlyHtml = CALENDLY_URL ? '<a class="sk-btn sk-btn-secondary" href="' + CALENDLY_URL + '" target="_blank" rel="noopener">' + esc(TXT.botonCalendly) + '</a>' : '';
    var bajoPedidoHtml = servicio.bajoPedido ? '<p class="sk-bajo-pedido">' + esc(TXT.bajoPedido) + '</p>' : '';
    var html = bajoPedidoHtml + '<p>' + esc(servicio.desc) + '</p>' +
      precioHtml +
      '<div class="sk-actions">' +
      '<a class="sk-btn sk-btn-primary" href="' + waLink(mensajePrefijado) + '" target="_blank" rel="noopener">' + esc(TXT.botonWhatsApp) + '</a>' +
      calendlyHtml +
      '</div>';
    addMsg('bot', html);
  }

  function renderFallback() {
    var html = '<p>' + esc(TXT.sinCoincidencia) + '</p>' +
      '<div class="sk-actions">' +
      '<a class="sk-btn sk-btn-primary" href="' + waLink(TXT.mensajeSinCoincidencia) + '" target="_blank" rel="noopener">' + esc(TXT.botonWhatsApp) + '</a>' +
      '</div>';
    addMsg('bot', html);
  }

  // Gana la palabra clave más larga (la más específica): así "videos con ia" va a
  // Videos y no a Asistentes por el "ia", y "rescatar mi web y dominio" va a Socio
  // Tecnológico y no a Páginas Web. A igual largo, manda el orden de SERVICIOS.
  function matchServicio(texto) {
    var t = texto.toLowerCase();
    var mejor = null, largo = 0;
    for (var i = 0; i < SERVICIOS.length; i++) {
      var s = SERVICIOS[i];
      for (var j = 0; j < s.kws.length; j++) {
        if (s.kws[j].length > largo && t.indexOf(s.kws[j]) !== -1) { mejor = s; largo = s.kws[j].length; }
      }
    }
    return mejor;
  }

  function handleUserText(texto) {
    if (!texto.trim()) return;
    addMsg('user', esc(texto));
    var s = matchServicio(texto);
    if (s) { renderServicio(s); } else { renderFallback(); }
  }

  chips.innerHTML = SERVICIOS.map(function (s) {
    return '<button type="button" class="sk-chip' + (s.bajoPedido ? ' sk-chip-bajo-pedido' : '') + '" data-id="' + s.id + '">' + esc(s.nombre) + '</button>';
  }).join('');

  chips.addEventListener('click', function (e) {
    var btn = e.target.closest('.sk-chip');
    if (!btn) return;
    var s = SERVICIOS.filter(function (x) { return x.id === btn.getAttribute('data-id'); })[0];
    if (!s) return;
    addMsg('user', esc(s.nombre));
    renderServicio(s);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var texto = input.value;
    input.value = '';
    handleUserText(texto);
  });

  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); closePanel(); return; }
    if (e.key === 'Tab') { trapFocus(e); }
  }

  function trapFocus(e) {
    var focusables = panel.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Arrastrar el launcher a cualquier posición de la pantalla. Un click normal
  // (sin desplazamiento) sigue abriendo/cerrando el chat; solo un arrastre real
  // (más de 6px de movimiento) reposiciona el botón y suprime el click siguiente.
  var DRAG_POS_KEY = config.claves.chatPosicion;
  var dragState = { active: false, moved: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 };
  var launcherWasDragged = false;

  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

  function placeLauncher(left, top) {
    var size = launcher.offsetWidth || 68;
    var margin = 8;
    left = clamp(left, margin, window.innerWidth - size - margin);
    top = clamp(top, margin, window.innerHeight - size - margin);
    launcher.style.left = left + 'px';
    launcher.style.top = top + 'px';
    launcher.style.right = 'auto';
    launcher.style.bottom = 'auto';
    launcherWasDragged = true;
  }

  function saveLauncherPos(left, top) {
    try { localStorage.setItem(DRAG_POS_KEY, JSON.stringify({ left: left, top: top })); } catch (e) {}
  }

  (function restoreLauncherPos() {
    try {
      var raw = localStorage.getItem(DRAG_POS_KEY);
      if (!raw) return;
      var pos = JSON.parse(raw);
      if (typeof pos.left === 'number' && typeof pos.top === 'number') placeLauncher(pos.left, pos.top);
    } catch (e) {}
  })();

  launcher.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragState.active = true;
    dragState.moved = false;
    var rect = launcher.getBoundingClientRect();
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.startLeft = rect.left;
    dragState.startTop = rect.top;
    try { launcher.setPointerCapture(e.pointerId); } catch (err) {}
  });

  launcher.addEventListener('pointermove', function (e) {
    if (!dragState.active) return;
    var dx = e.clientX - dragState.startX;
    var dy = e.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(dx, dy) < 6) return;
    dragState.moved = true;
    launcher.classList.add('sk-dragging');
    placeLauncher(dragState.startLeft + dx, dragState.startTop + dy);
  });

  function endLauncherDrag() {
    if (!dragState.active) return;
    dragState.active = false;
    launcher.classList.remove('sk-dragging');
    if (dragState.moved) {
      var rect = launcher.getBoundingClientRect();
      saveLauncherPos(rect.left, rect.top);
    }
  }
  launcher.addEventListener('pointerup', endLauncherDrag);
  launcher.addEventListener('pointercancel', endLauncherDrag);

  window.addEventListener('resize', function () {
    if (!launcherWasDragged) return;
    var rect = launcher.getBoundingClientRect();
    placeLauncher(rect.left, rect.top);
  });

  // Cuando el launcher fue movido, el panel se abre junto a su posición actual
  // en vez del rincón fijo de siempre (en móvil el panel ya ocupa toda la
  // pantalla, así que ahí no hace falta calcular nada).
  function positionPanelNearLauncher() {
    if (!launcherWasDragged || window.innerWidth < 768) {
      panelWrap.style.left = '';
      panelWrap.style.top = '';
      panelWrap.style.right = '';
      panelWrap.style.bottom = '';
      return;
    }
    var r = launcher.getBoundingClientRect();
    var panelW = Math.min(380, window.innerWidth - 40);
    var panelH = Math.min(600, window.innerHeight - 120);
    var margin = 12;
    var left = clamp(r.right - panelW, margin, window.innerWidth - panelW - margin);
    var top = r.top - panelH - margin;
    if (top < margin) top = r.bottom + margin;
    top = clamp(top, margin, window.innerHeight - panelH - margin);
    panelWrap.style.left = left + 'px';
    panelWrap.style.top = top + 'px';
    panelWrap.style.right = 'auto';
    panelWrap.style.bottom = 'auto';
  }

  function openPanel() {
    try { sessionStorage.setItem(config.claves.chatAbierto, '1'); } catch (e) {}
    state.lastFocused = document.activeElement;
    positionPanelNearLauncher();
    panelWrap.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKeydown, true);
    if (log.children.length === 0) {
      addMsg('bot', '<p>' + TXT.saludo + '</p>');
    }
    setTimeout(function () { input.focus(); }, 0);
    resetInactivityTimer();
  }

  function closePanel() {
    if (panelWrap.hidden) return;
    panelWrap.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown, true);
    clearTimeout(state.inactivityTimer);
    if (state.lastFocused && typeof state.lastFocused.focus === 'function') state.lastFocused.focus();
    sendPayload(false);
  }

  launcher.addEventListener('click', function () {
    if (dragState.moved) { dragState.moved = false; return; }
    if (panelWrap.hidden) openPanel(); else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);

  function resetInactivityTimer() {
    clearTimeout(state.inactivityTimer);
    state.inactivityTimer = setTimeout(function () { sendPayload(false); }, 60000);
  }

  function buildPayload() {
    return {
      timestamp: new Date().toISOString(),
      sessionId: state.sessionId,
      servicioElegido: state.servicioElegido,
      mensajes: state.mensajes,
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
      paginaOrigen: location.href
    };
  }

  function sendPayload(useBeacon) {
    if (state.sent) return;
    if (state.mensajes.length <= 1) return; // solo el saludo inicial: nada que reportar
    state.sent = true;
    var payload = JSON.stringify(buildPayload());
    try {
      if (useBeacon && navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(WEBHOOK_URL, blob);
        return;
      }
      fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true })
        .catch(function () { /* silencioso: el chat sigue funcionando igual si falla */ });
    } catch (err) { /* nunca romper el widget por un fallo de red */ }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && !panelWrap.hidden) sendPayload(true);
  });
  window.addEventListener('pagehide', function () {
    if (!panelWrap.hidden) sendPayload(true);
  });

  // ============================================================
  // Saludo inicial del launcher — una sola vez por sesión.
  // ============================================================
  (function initLauncherGreeting() {
    var GREET_KEY = config.claves.chatSaludado;
    var OPENED_KEY = config.claves.chatAbierto;
    try {
      if (sessionStorage.getItem(GREET_KEY)) return;
      if (sessionStorage.getItem(OPENED_KEY)) return;
    } catch (e) { return; } // sin sessionStorage disponible: no arriesgar a saludar de más

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var bubble = document.getElementById('sk-greet-bubble');
    var dismissTimer = null;
    var greeted = false;

    function markGreeted() {
      if (greeted) return;
      greeted = true;
      try { sessionStorage.setItem(GREET_KEY, '1'); } catch (e) {}
    }

    function onOutsideInteraction(e) {
      if (e.type === 'click' && bubble && (e.target === bubble || bubble.contains(e.target))) return;
      hideBubble();
    }

    function hideBubble() {
      if (!bubble || bubble.hidden) return;
      bubble.classList.remove('sk-greet-visible');
      clearTimeout(dismissTimer);
      setTimeout(function () { bubble.hidden = true; }, reduced ? 0 : 400);
      document.removeEventListener('click', onOutsideInteraction, true);
      window.removeEventListener('scroll', onOutsideInteraction);
    }

    function stopGreetAnimations() {
      launcher.classList.remove('sk-greet-hop', 'sk-greet-pulse', 'sk-greet-breathe');
    }

    function showBubble() {
      if (!bubble) return;
      var isMobile = window.innerWidth < 768;
      var above = isMobile; // en móvil SIEMPRE arriba del launcher, nunca a la izquierda
      if (!above) {
        var available = window.innerWidth - (20 + 68 + 16);
        above = available < 200;
      }
      bubble.classList.toggle('sk-greet-above', above);
      bubble.hidden = false;

      // Chequeo real contra los botones del hero antes de mostrarla — se
      // mide, no se adivina. Si tapa alguno, mejor no mostrarla esa vez.
      var heroSection = document.getElementById('inicio');
      if (heroSection) {
        var heroRect = heroSection.getBoundingClientRect();
        if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
          var bubbleRect = bubble.getBoundingClientRect();
          var ctas = heroSection.querySelectorAll('a');
          for (var i = 0; i < ctas.length; i++) {
            var r = ctas[i].getBoundingClientRect();
            var overlap = !(bubbleRect.right < r.left || bubbleRect.left > r.right || bubbleRect.bottom < r.top || bubbleRect.top > r.bottom);
            if (overlap) { bubble.hidden = true; return; }
          }
        }
      }

      requestAnimationFrame(function () { bubble.classList.add('sk-greet-visible'); });
      document.addEventListener('click', onOutsideInteraction, true);
      window.addEventListener('scroll', onOutsideInteraction, { passive: true });
      dismissTimer = setTimeout(hideBubble, 6000);
    }

    function runGreeting() {
      if (!panelWrap.hidden) return; // el chat ya está abierto: no saludar encima
      markGreeted();
      if (!reduced) {
        launcher.classList.add('sk-greet-hop', 'sk-greet-pulse');
        setTimeout(function () {
          launcher.classList.remove('sk-greet-hop', 'sk-greet-pulse');
          launcher.classList.add('sk-greet-breathe');
        }, 1300);
      }
      showBubble();
    }

    launcher.addEventListener('mouseenter', stopGreetAnimations);
    if (bubble) {
      bubble.addEventListener('click', function () {
        hideBubble();
        openPanel();
      });
    }

    setTimeout(runGreeting, 3000);
  })();
}
