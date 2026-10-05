// Constelación y diagrama de flujo del hero, dibujados en <canvas id="hero-constellation">.
// Código portado tal cual del sitio anterior (método initHeroConstellation); lo único
// que cambia es que los nodos y rutas del diagrama llegan por parámetro.
//
// Modo interactivo (puntero fino y sin prefers-reduced-motion): los puntos reaccionan
// al cursor y el diagrama se anima en bucle. En táctil o con movimiento reducido se
// dibuja una sola vez. Por debajo de 1056 px el diagrama va en #hero-flow-spacer.

export function iniciarHero(config) {
  const canvas = document.getElementById('hero-constellation');
  const section = document.getElementById('inicio');
  if (!canvas || !section) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const SPACING = 45;
  const MAX_DIST = 60;
  const CELL = MAX_DIST;
  const REPEL_RADIUS = 140;
  const GLOW_RADIUS = 220;
  const STIFFNESS = 0.03;
  const DAMPING = 0.90;
  const MAX_LINE_OPACITY = 0.08;
  const LINE_WIDTH = 0.75;
  const BASE_NODE_ALPHA = 0.30; // brillo permanente tipo estrella, ya no "apagado" en reposo
  const MAX_NODE_ALPHA = 0.85;
  const NODE_R = 1.2;
  const LINE_BUCKETS = 8;
  const NODE_BUCKETS = 10;
  const COLOR_WHITE = [255, 255, 255];
  const COLOR_INDIGO = [99, 102, 241];
  const COLOR_TEAL = [45, 212, 191];

  const HALO_MIN_SIZE = 5;
  const HALO_MAX_SIZE = 26;
  const HALO_MIN_ALPHA = 0.16; // piso del halo permanente, siempre visible
  const HALO_MAX_ALPHA = 0.55;
  const STAR_PULSE_AMPLITUDE = 0.14; // cuánto sube/baja el halo con el parpadeo individual

  // --- Diagrama de flujo (reemplaza al cubo) ---
  const FLOW_ZONE_RIGHT_MARGIN = 40;
  const FLOW_MIN_LEFT = 740;
  const FLOW_LEFT_FRAC = 0.58;
  const FLOW_DESIGN_WIDTH = 460;
  const FLOW_DESIGN_HEIGHT = 300;
  const FLOW_LOOP_MS = 7500;
  const FLOW_T_PARTICLE1_START = 100;
  const FLOW_T_PARTICLE1_END = 900;
  const FLOW_T_CENTER_PULSE = 900;
  const FLOW_T_CENTER_PULSE_DUR = 600;
  const FLOW_BRANCH_START = [1000, 1400, 1800];
  const FLOW_BRANCH_TRAVEL = 700;
  const FLOW_HOLD_END = 4500;
  const FLOW_FADE_END = 6500;
  const FLOW_ROUTE_REST_OPACITY = 0.08;
  const FLOW_ROUTE_ACTIVE_OPACITY = 0.85;
  const FLOW_ROUTE_WIDTH = 1;
  const FLOW_ROUTE_ACTIVE_WIDTH = 1.8;
  const FLOW_NODE_REST_ALPHA = 0.4;
  const FLOW_NODE_ACTIVE_ALPHA = 1.0;
  const FLOW_CENTER_REST_ALPHA = 0.55;
  const FLOW_CENTER_ACTIVE_ALPHA = 1.0;
  const FLOW_LABEL_REST_ALPHA = 0.45;
  const FLOW_LABEL_ACTIVE_ALPHA = 0.85;
  const FLOW_HOVER_RADIUS = 55;
  const FLOW_HOVER_BOOST = 0.22;
  const FLOW_ZONE_DAMPEN_FLOOR = 0.35;
  const FLOW_ZONE_FALLOFF = 70;
  // Nodos y rutas del diagrama: vienen de src/data/flow.ts.
  const FLOW_NODES = config.nodos;
  const FLOW_ROUTES = config.rutas;
  let flowZoneLeft = 0, flowScale = 1;
  // Modo apilado (ventanas angostas): el diagrama va debajo del texto, dentro
  // de #hero-flow-spacer, en vez de a su derecha. Lo activa el CSS: si el
  // espaciador tiene altura, se dibuja ahí. En el diseño del diagrama lo
  // dibujado ocupa de x=26 a x=454; con eso se escala y se alinea al texto.
  const FLOW_STACK_CONTENT_LEFT = 26;
  const FLOW_STACK_CONTENT_WIDTH = 428;
  const flowSpacer = document.getElementById('hero-flow-spacer');
  let flowStacked = false, flowZoneTop = 0, flowOriginY = 0;

  const isInteractive =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cssW = 0, cssH = 0, n = 0;
  let nodesX, nodesY, baseX, baseY, vx, vy, pulsePhase, pulseSpeed;
  let pulseClock = 0; // reloj propio del parpadeo, avanza con dt igual que todo lo demás
  const gridMap = new Map();
  // Cada lote de líneas/nodos existe por duplicado: uno normal y uno
  // "zona" (dentro de la franja del diagrama de flujo, atenuado). Así la
  // constelación se sigue dibujando en lotes por opacidad — nunca un
  // fillStyle/strokeStyle distinto por nodo — y aun así baja de intensidad
  // donde vive el diagrama, sin tocar la opacidad del diagrama mismo.
  const lineBuckets = [];
  const lineBucketsZone = [];
  for (let b = 0; b < LINE_BUCKETS; b++) { lineBuckets.push([]); lineBucketsZone.push([]); }
  const nodeBuckets = [];
  const nodeBucketsZone = [];
  for (let b = 0; b < NODE_BUCKETS; b++) { nodeBuckets.push([]); nodeBucketsZone.push([]); }
  const bucketColors = [];
  const bucketColorsZone = [];
  const bucketHaloSize = [];
  for (let b = 0; b < NODE_BUCKETS; b++) {
    const t = b / (NODE_BUCKETS - 1);
    const c = mixColor(t);
    const alpha = BASE_NODE_ALPHA + t * (MAX_NODE_ALPHA - BASE_NODE_ALPHA);
    bucketColors.push('rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + alpha.toFixed(3) + ')');
    bucketColorsZone.push('rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (alpha * FLOW_ZONE_DAMPEN_FLOOR).toFixed(3) + ')');
    bucketHaloSize.push(HALO_MIN_SIZE + t * (HALO_MAX_SIZE - HALO_MIN_SIZE));
  }

  function mixColor(t) {
    if (t <= 0.5) {
      const u = t / 0.5;
      return [
        COLOR_WHITE[0] + (COLOR_INDIGO[0] - COLOR_WHITE[0]) * u,
        COLOR_WHITE[1] + (COLOR_INDIGO[1] - COLOR_WHITE[1]) * u,
        COLOR_WHITE[2] + (COLOR_INDIGO[2] - COLOR_WHITE[2]) * u
      ];
    }
    const u = (t - 0.5) / 0.5;
    return [
      COLOR_INDIGO[0] + (COLOR_TEAL[0] - COLOR_INDIGO[0]) * u,
      COLOR_INDIGO[1] + (COLOR_TEAL[1] - COLOR_INDIGO[1]) * u,
      COLOR_INDIGO[2] + (COLOR_TEAL[2] - COLOR_INDIGO[2]) * u
    ];
  }

  // Sprite de resplandor: se pre-renderiza UNA sola vez (por color) en un
  // canvas offscreen y de ahí en más solo se hace drawImage() — nunca
  // ctx.shadowBlur por nodo/partícula, que es lo que realmente mata el
  // rendimiento a esta densidad. Variantes de color solo para que las
  // partículas del diagrama de flujo puedan llevar "halo del color de su
  // rama" tal como se pidió — la constelación sigue usando una sola.
  function createHaloSprite(rgb) {
    const size = 64;
    const off = document.createElement('canvas');
    off.width = size; off.height = size;
    const octx = off.getContext('2d');
    const grad = octx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',1)');
    grad.addColorStop(0.4, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.5)');
    grad.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
    octx.fillStyle = grad;
    octx.fillRect(0, 0, size, size);
    return off;
  }
  const haloSprite = createHaloSprite([199, 210, 254]);
  const haloSpriteIndigo = createHaloSprite([99, 102, 241]);
  const haloSpriteMid = createHaloSprite([90, 150, 210]);
  const haloSpriteTeal = createHaloSprite([45, 212, 191]);

  function cellKey(cx, cy) { return cx + ',' + cy; }

  function buildNodes() {
    const cols = Math.max(2, Math.round(cssW / SPACING) + 1);
    const rows = Math.max(2, Math.round(cssH / SPACING) + 1);
    n = cols * rows;
    nodesX = new Float32Array(n);
    nodesY = new Float32Array(n);
    baseX = new Float32Array(n);
    baseY = new Float32Array(n);
    vx = new Float32Array(n);
    vy = new Float32Array(n);
    pulsePhase = new Float32Array(n);
    pulseSpeed = new Float32Array(n);
    const jitter = SPACING * 0.25;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * SPACING + (Math.random() * 2 - 1) * jitter;
        const y = r * SPACING + (Math.random() * 2 - 1) * jitter;
        baseX[i] = x; baseY[i] = y; nodesX[i] = x; nodesY[i] = y; vx[i] = 0; vy[i] = 0;
        // Fase y velocidad de parpadeo propias de cada nodo — no existía
        // antes, lo agrego acá para que la malla titile desfasada en vez
        // de subir/bajar de brillo toda junta.
        pulsePhase[i] = Math.random() * Math.PI * 2;
        pulseSpeed[i] = 0.5 + Math.random() * 0.7; // ciclos lentos, entre ~0.5 y ~1.2
        i++;
      }
    }
  }

  function resizeCanvas() {
    const rect = section.getBoundingClientRect();
    cssW = Math.max(1, Math.round(rect.width));
    cssH = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // El piso de flowZoneLeft es 740px (o el 58% del ancho, lo que sea
    // mayor) para no invadir el texto; el techo es cssW menos un mínimo de
    // 150px de ancho utilizable, para que a una ventana angosta el
    // diagrama se achique y reubique en vez de quedar fuera del canvas.
    const spacerRect = flowSpacer ? flowSpacer.getBoundingClientRect() : null;
    flowStacked = !!(spacerRect && spacerRect.height > 0);
    if (flowStacked) {
      // Nunca encima del texto: el diagrama vive en el hueco reservado debajo.
      flowScale = Math.max(0.3, Math.min(1, spacerRect.width / FLOW_STACK_CONTENT_WIDTH));
      flowZoneLeft = (spacerRect.left - rect.left) - FLOW_STACK_CONTENT_LEFT * flowScale;
      flowZoneTop = spacerRect.top - rect.top;
      flowOriginY = flowZoneTop + (spacerRect.height - FLOW_DESIGN_HEIGHT * flowScale) / 2;
    } else {
      flowZoneLeft = Math.min(
        Math.max(cssW * FLOW_LEFT_FRAC, FLOW_MIN_LEFT),
        Math.max(0, cssW - FLOW_ZONE_RIGHT_MARGIN - 150)
      );
      const availW = cssW - FLOW_ZONE_RIGHT_MARGIN - flowZoneLeft;
      flowScale = Math.max(0.3, Math.min(1, availW / FLOW_DESIGN_WIDTH));
      flowOriginY = (cssH - FLOW_DESIGN_HEIGHT * flowScale) / 2;
    }
    buildNodes();
  }
  function flowScreenX(localX) { return flowZoneLeft + localX * flowScale; }
  function flowScreenY(localY) { return flowOriginY + localY * flowScale; }
  // Punto de corte para desviar nodos/líneas de la constelación al lote
  // "zona" (atenuado) en vez del normal. Uso el punto medio de la banda de
  // transición como umbral — con cientos de nodos a 45px de espaciado la
  // franja de 70px de margen ya se percibe como degradado, no como corte.
  // En modo apilado la zona es la franja inferior (se compara y), no la derecha (x).
  function inFlowZone(x, y) {
    return flowStacked ? y > flowZoneTop - FLOW_ZONE_FALLOFF / 2 : x > flowZoneLeft - FLOW_ZONE_FALLOFF / 2;
  }
  // Versión continua (0..1), solo para el dibujo estático de una sola
  // pasada, donde el costo por nodo no importa.
  function zoneDampenContinuous(x, y) {
    const edge = flowStacked ? flowZoneTop : flowZoneLeft;
    const v = flowStacked ? y : x;
    const fullyIn = edge + 40;
    const startFalloff = edge - FLOW_ZONE_FALLOFF;
    if (v <= startFalloff) return 1;
    if (v >= fullyIn) return FLOW_ZONE_DAMPEN_FLOOR;
    const t = (v - startFalloff) / (fullyIn - startFalloff);
    return 1 - t * (1 - FLOW_ZONE_DAMPEN_FLOOR);
  }

  function buildGrid() {
    gridMap.clear();
    for (let i = 0; i < n; i++) {
      const key = cellKey(Math.floor(nodesX[i] / CELL), Math.floor(nodesY[i] / CELL));
      let arr = gridMap.get(key);
      if (!arr) { arr = []; gridMap.set(key, arr); }
      arr.push(i);
    }
  }

  // Cuenta comparaciones reales (candidatos revisados, no pares n²) del último
  // frame — instrumentación barata para poder verificar que la grilla espacial
  // sigue acotando el trabajo aunque suba la densidad de nodos.
  let lastComparisonCount = 0;

  function collectConnections() {
    for (let b = 0; b < LINE_BUCKETS; b++) { lineBuckets[b].length = 0; lineBucketsZone[b].length = 0; }
    let comparisons = 0;
    for (let i = 0; i < n; i++) {
      const xi = nodesX[i], yi = nodesY[i];
      const cx = Math.floor(xi / CELL), cy = Math.floor(yi / CELL);
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          const arr = gridMap.get(cellKey(cx + ox, cy + oy));
          if (!arr) continue;
          for (let k = 0; k < arr.length; k++) {
            const j = arr[k];
            if (j <= i) continue;
            comparisons++;
            const xj = nodesX[j], yj = nodesY[j];
            const dx = xj - xi, dy = yj - yi;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_DIST) {
              const t = 1 - dist / MAX_DIST;
              let bucket = Math.round(t * (LINE_BUCKETS - 1));
              if (bucket < 0) bucket = 0; if (bucket > LINE_BUCKETS - 1) bucket = LINE_BUCKETS - 1;
              if (inFlowZone((xi + xj) / 2, (yi + yj) / 2)) lineBucketsZone[bucket].push(xi, yi, xj, yj);
              else lineBuckets[bucket].push(xi, yi, xj, yj);
            }
          }
        }
      }
    }
    lastComparisonCount = comparisons;
  }

  function drawConnections() {
    for (let b = 0; b < LINE_BUCKETS; b++) {
      const t = b / (LINE_BUCKETS - 1);
      const pts = lineBuckets[b];
      if (pts.length) {
        ctx.beginPath();
        for (let p = 0; p < pts.length; p += 4) { ctx.moveTo(pts[p], pts[p + 1]); ctx.lineTo(pts[p + 2], pts[p + 3]); }
        ctx.strokeStyle = 'rgba(129,140,248,' + (t * MAX_LINE_OPACITY).toFixed(3) + ')';
        ctx.lineWidth = LINE_WIDTH;
        ctx.stroke();
      }
      const ptsZ = lineBucketsZone[b];
      if (ptsZ.length) {
        ctx.beginPath();
        for (let p = 0; p < ptsZ.length; p += 4) { ctx.moveTo(ptsZ[p], ptsZ[p + 1]); ctx.lineTo(ptsZ[p + 2], ptsZ[p + 3]); }
        ctx.strokeStyle = 'rgba(129,140,248,' + (t * MAX_LINE_OPACITY * FLOW_ZONE_DAMPEN_FLOOR).toFixed(3) + ')';
        ctx.lineWidth = LINE_WIDTH;
        ctx.stroke();
      }
    }
  }

  // pts va en tríos [x, y, haloAlpha, x, y, haloAlpha, ...] — el halo de
  // cada nodo lleva su propio parpadeo (globalAlpha por nodo, sigue siendo
  // solo un drawImage por nodo, no un costo nuevo); el punto nítido sigue
  // en un solo fill() por lote con el fillStyle del bucket, sin tocar eso.
  function drawNodeBucket(pts, haloSize, fillStyle) {
    if (!pts.length) return;
    for (let p = 0; p < pts.length; p += 3) {
      ctx.globalAlpha = pts[p + 2];
      ctx.drawImage(haloSprite, pts[p] - haloSize / 2, pts[p + 1] - haloSize / 2, haloSize, haloSize);
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let p = 0; p < pts.length; p += 3) {
      ctx.moveTo(pts[p] + NODE_R, pts[p + 1]);
      ctx.arc(pts[p], pts[p + 1], NODE_R, 0, Math.PI * 2);
    }
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  function drawNodesStatic() {
    // Pasada única: no hay costo de por medio, así que el atenuado por
    // zona sí puede ser continuo nodo a nodo en vez de por lotes. Sin
    // bucle de animación no hay reloj que avanzar, pero cada nodo sí usa
    // su propia fase fija — así la pose estática también se lee como
    // campo de estrellas, no todas al mismo brillo.
    ctx.globalAlpha = 1;
    for (let i = 0; i < n; i++) {
      const x = nodesX[i], y = nodesY[i];
      const dampen = zoneDampenContinuous(x, y);
      const pulse = (Math.sin(pulsePhase[i]) + 1) / 2; // 0..1, fijo por nodo
      const haloAlpha = (HALO_MIN_ALPHA + pulse * STAR_PULSE_AMPLITUDE) * dampen;
      const nodeAlpha = (BASE_NODE_ALPHA + pulse * STAR_PULSE_AMPLITUDE) * dampen;
      ctx.globalAlpha = haloAlpha;
      ctx.drawImage(haloSprite, x - HALO_MIN_SIZE / 2, y - HALO_MIN_SIZE / 2, HALO_MIN_SIZE, HALO_MIN_SIZE);
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + nodeAlpha.toFixed(3) + ')';
      ctx.fill();
    }
  }

  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function routeControlPoints(ax, ay, bx, by) {
    const midX = ax + (bx - ax) * 0.5;
    return [midX, ay, midX, by];
  }
  function bezierPoint(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t) {
    const u = 1 - t;
    return [
      u * u * u * p0x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * p1x,
      u * u * u * p0y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * p1y
    ];
  }

  function globalFadeMultiplier(elapsed) {
    if (elapsed <= FLOW_HOLD_END) return 1;
    if (elapsed >= FLOW_FADE_END) return 0;
    return 1 - easeInOutCubic((elapsed - FLOW_HOLD_END) / (FLOW_FADE_END - FLOW_HOLD_END));
  }
  function computeNodeLitAmount(idx, elapsed) {
    if (idx === 0) {
      if (elapsed < 0 || elapsed > 300) return 0;
      return 1 - easeOutCubic(elapsed / 300);
    }
    if (idx === 1) return elapsed < FLOW_T_CENTER_PULSE ? 0 : 1;
    const arrival = FLOW_BRANCH_START[idx - 2] + FLOW_BRANCH_TRAVEL;
    return elapsed < arrival ? 0 : 1;
  }
  function computeRouteLitAmount(routeIdx, elapsed) {
    if (routeIdx === 0) {
      if (elapsed < FLOW_T_PARTICLE1_START) return 0;
      if (elapsed <= FLOW_T_PARTICLE1_END) return 1;
      const fadeBack = (elapsed - FLOW_T_PARTICLE1_END) / 400;
      return fadeBack >= 1 ? 0 : 1 - fadeBack;
    }
    return elapsed < FLOW_BRANCH_START[routeIdx - 1] ? 0 : 1;
  }

  function drawRouteParticle(elapsed, start, end, ax, ay, bx, by, sprite) {
    if (elapsed < start || elapsed > end + 80) return;
    const dur = end - start;
    const cps = routeControlPoints(ax, ay, bx, by);
    for (let s = 4; s >= 0; s--) {
      const te = elapsed - s * 22;
      if (te < start || te > end) continue;
      const rawT = (te - start) / dur;
      const t = easeInOutCubic(Math.min(1, Math.max(0, rawT)));
      const pt = bezierPoint(ax, ay, cps[0], cps[1], cps[2], cps[3], bx, by, t);
      const trailFactor = 1 - s / 5;
      const size = (s === 0 ? 11 : 7 - s) * flowScale;
      ctx.globalAlpha = 0.55 * trailFactor;
      ctx.drawImage(sprite, pt[0] - size, pt[1] - size, size * 2, size * 2);
      ctx.globalAlpha = 1;
      if (s === 0) {
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 2.2 * flowScale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.fill();
      }
    }
  }

  const FLOW_BRANCH_SPRITES = [haloSpriteIndigo, haloSpriteMid, haloSpriteTeal];

  // Un solo dibujo cubre tanto cada frame animado (elapsed avanza con dt)
  // como la pose estática de móvil/reduced-motion (se lo llama una vez con
  // elapsed=3000, un instante dentro del "hold" donde ya no hay partículas
  // ni anillo en vuelo — por eso no hace falta una función aparte).
  function drawFlowDiagram(elapsed, ptrX, ptrY, hasPtr) {
    const fadeMul = globalFadeMultiplier(elapsed);
    const sx = [0, 0, 0, 0, 0], sy = [0, 0, 0, 0, 0];
    for (let i = 0; i < 5; i++) { sx[i] = flowScreenX(FLOW_NODES[i].x); sy[i] = flowScreenY(FLOW_NODES[i].y); }

    for (let r = 0; r < FLOW_ROUTES.length; r++) {
      const route = FLOW_ROUTES[r];
      const ax = sx[route.from], ay = sy[route.from], bx = sx[route.to], by = sy[route.to];
      const cps = routeControlPoints(ax, ay, bx, by);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.bezierCurveTo(cps[0], cps[1], cps[2], cps[3], bx, by);
      ctx.strokeStyle = 'rgba(226,232,240,' + FLOW_ROUTE_REST_OPACITY + ')';
      ctx.lineWidth = FLOW_ROUTE_WIDTH;
      ctx.stroke();
      const lit = computeRouteLitAmount(r, elapsed) * fadeMul;
      if (lit > 0.01) {
        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        grad.addColorStop(0, 'rgba(99,102,241,' + (lit * FLOW_ROUTE_ACTIVE_OPACITY).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(45,212,191,' + (lit * FLOW_ROUTE_ACTIVE_OPACITY).toFixed(3) + ')');
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.bezierCurveTo(cps[0], cps[1], cps[2], cps[3], bx, by);
        ctx.strokeStyle = grad;
        ctx.lineWidth = FLOW_ROUTE_ACTIVE_WIDTH;
        ctx.stroke();
      }
    }

    drawRouteParticle(elapsed, FLOW_T_PARTICLE1_START, FLOW_T_PARTICLE1_END, sx[0], sy[0], sx[1], sy[1], haloSpriteIndigo);

    const ringElapsed = elapsed - FLOW_T_CENTER_PULSE;
    if (ringElapsed >= 0 && ringElapsed <= FLOW_T_CENTER_PULSE_DUR) {
      const rt = ringElapsed / FLOW_T_CENTER_PULSE_DUR;
      const ringR = (8 + easeOutCubic(rt) * 34) * flowScale;
      const ringAlpha = (1 - rt) * 0.55 * fadeMul;
      ctx.beginPath();
      ctx.arc(sx[1], sy[1], ringR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139,92,246,' + ringAlpha.toFixed(3) + ')';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    for (let b = 0; b < 3; b++) {
      drawRouteParticle(elapsed, FLOW_BRANCH_START[b], FLOW_BRANCH_START[b] + FLOW_BRANCH_TRAVEL, sx[1], sy[1], sx[2 + b], sy[2 + b], FLOW_BRANCH_SPRITES[b]);
    }

    for (let i = 0; i < 5; i++) {
      const node = FLOW_NODES[i];
      const lit = computeNodeLitAmount(i, elapsed) * fadeMul;
      let hoverBoost = 0;
      if (hasPtr) {
        const d = Math.hypot(ptrX - sx[i], ptrY - sy[i]);
        if (d < FLOW_HOVER_RADIUS) hoverBoost = (1 - d / FLOW_HOVER_RADIUS) * FLOW_HOVER_BOOST;
      }
      const restA = i === 1 ? FLOW_CENTER_REST_ALPHA : FLOW_NODE_REST_ALPHA;
      const activeA = i === 1 ? FLOW_CENTER_ACTIVE_ALPHA : FLOW_NODE_ACTIVE_ALPHA;
      const alpha = Math.min(1, restA + lit * (activeA - restA) + hoverBoost);
      const haloSize = (i === 1 ? 20 : 14) * flowScale * (1 + lit * 0.6);
      const haloAlpha = Math.min(0.7, (i === 1 ? 0.25 : 0.18) + lit * 0.35 + hoverBoost * 0.3);
      ctx.globalAlpha = haloAlpha;
      ctx.drawImage(haloSprite, sx[i] - haloSize / 2, sy[i] - haloSize / 2, haloSize, haloSize);
      ctx.globalAlpha = 1;
      const c = node.color;
      ctx.beginPath();
      ctx.arc(sx[i], sy[i], node.r * flowScale, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + alpha.toFixed(3) + ')';
      ctx.fill();

      const labelAlpha = Math.min(0.95, FLOW_LABEL_REST_ALPHA + lit * (FLOW_LABEL_ACTIVE_ALPHA - FLOW_LABEL_REST_ALPHA));
      // Apilado (móvil/tablet): las etiquetas no bajan de 12px para que se lean.
      ctx.font = Math.round(12 * Math.max(flowScale, flowStacked ? 1 : 0.85)) + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = node.labelAlign;
      ctx.fillStyle = 'rgba(241,245,249,' + labelAlpha.toFixed(3) + ')';
      ctx.fillText(node.label, sx[i] + node.labelDX * flowScale, sy[i] + node.labelDY * flowScale);
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, cssW, cssH);
    buildGrid();
    collectConnections();
    drawConnections();
    drawNodesStatic();
    // Diagrama estático (móvil / reduced-motion): instante del "hold", sin
    // partículas ni anillo en vuelo — las 3 ramas ya encendidas, etiquetas
    // visibles.
    drawFlowDiagram(3000, -9999, -9999, false);
  }

  // --- Modo estático: móvil/tablet, sin puntero fino, o reduced-motion. ---
  // Sin física, sin bucle: una sola pasada y listo.
  if (!isInteractive) {
    resizeCanvas();
    drawFrame();
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resizeCanvas(); drawFrame(); }, 150);
    }, { passive: true });
    // El alto del hero cambia sin que cambie la ventana (p. ej. al cargar las
    // fuentes); el diagrama apilado depende de la posición real de su hueco.
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resizeCanvas(); drawFrame(); }, 150);
      }).observe(section);
    }
    window.__heroConstellationDebug = () => ({ nodeCount: n, lastComparisonCount, cssW, cssH, mode: 'static', flowStacked });
    return;
  }

  // --- Modo interactivo: escritorio con puntero fino. ---
  let rawClientX = 0, rawClientY = 0, rawActive = false;
  let pointerX = -9999, pointerY = -9999, pointerActive = false;
  let prevPX = -9999, prevPY = -9999;
  let cursorSpeed = 0;
  let heroRect = section.getBoundingClientRect();
  let flowElapsed = 0;

  function onPointerMove(e) { rawClientX = e.clientX; rawClientY = e.clientY; rawActive = true; }
  function onPointerLeave() { rawActive = false; }

  // Estado limpio garantizado en cada reanudación: si los nodos ya se habían
  // desplazado (o su velocidad quedó viva) justo antes de pausar, un dt grande
  // sobre ese estado desplazado puede lanzarlos fuera de pantalla y el resorte
  // nunca los recupera — visualmente se lee como "se congeló", pero en
  // realidad la malla se fue. Barato de resetear, así que no dependemos del
  // clamp de dt para cubrir este caso.
  function resetNodes() {
    for (let i = 0; i < n; i++) {
      nodesX[i] = baseX[i];
      nodesY[i] = baseY[i];
      vx[i] = 0;
      vy[i] = 0;
    }
    prevPX = -9999; prevPY = -9999;
    cursorSpeed = 0;
    // El diagrama de flujo también arranca limpio: retomar a mitad de una
    // animación basada en tiempo, con una partícula apareciendo de la
    // nada, se ve tan roto como los nodos disparados — confirmado con el
    // usuario antes de implementarlo.
    flowElapsed = 0;
  }

  function updatePhysicsAndDraw(dt) {
    if (rawActive) {
      pointerX = rawClientX - heroRect.left;
      pointerY = rawClientY - heroRect.top;
      pointerActive = pointerX >= -REPEL_RADIUS && pointerX <= cssW + REPEL_RADIUS &&
        pointerY >= -REPEL_RADIUS && pointerY <= cssH + REPEL_RADIUS;
    } else {
      pointerActive = false;
    }

    if (pointerActive && prevPX > -9000) {
      const dx = pointerX - prevPX, dy = pointerY - prevPY;
      cursorSpeed = Math.min(Math.sqrt(dx * dx + dy * dy), 80);
    } else {
      cursorSpeed *= 0.85;
    }
    prevPX = pointerX; prevPY = pointerY;
    const speedFactor = 1 + cursorSpeed / 20;
    const dtScale = dt / 16.6667; // 1 a 60fps, escala el resto de frecuencias por igual
    pulseClock += dt;

    for (let b = 0; b < NODE_BUCKETS; b++) { nodeBuckets[b].length = 0; nodeBucketsZone[b].length = 0; }
    const frameDamping = Math.pow(DAMPING, dtScale);

    for (let i = 0; i < n; i++) {
      let x = nodesX[i], y = nodesY[i];
      let fx = (baseX[i] - x) * STIFFNESS * dtScale;
      let fy = (baseY[i] - y) * STIFFNESS * dtScale;
      let proximity = 0;

      if (pointerActive) {
        const dx = x - pointerX, dy = y - pointerY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        if (dist < REPEL_RADIUS) {
          const push = (1 - dist / REPEL_RADIUS) * speedFactor * 2.2 * dtScale;
          fx += (dx / dist) * push;
          fy += (dy / dist) * push;
        }
        if (dist < GLOW_RADIUS) proximity = 1 - dist / GLOW_RADIUS;
      }

      vx[i] = (vx[i] + fx) * frameDamping;
      vy[i] = (vy[i] + fy) * frameDamping;
      x += vx[i] * dtScale; y += vy[i] * dtScale;
      nodesX[i] = x; nodesY[i] = y;

      let bucket = Math.round(proximity * (NODE_BUCKETS - 1));
      if (bucket < 0) bucket = 0; if (bucket > NODE_BUCKETS - 1) bucket = NODE_BUCKETS - 1;
      // Brillo base permanente (piso HALO_MIN_ALPHA) + parpadeo propio del
      // nodo (desfasado por pulsePhase/pulseSpeed) + boost por proximidad
      // al cursor por encima de esa base — nunca por debajo.
      const pulse = (Math.sin(pulseClock * 0.001 * pulseSpeed[i] + pulsePhase[i]) + 1) / 2;
      const baseGlow = HALO_MIN_ALPHA + pulse * STAR_PULSE_AMPLITUDE;
      let haloAlpha = baseGlow + proximity * (HALO_MAX_ALPHA - baseGlow);
      if (haloAlpha > HALO_MAX_ALPHA) haloAlpha = HALO_MAX_ALPHA;
      if (inFlowZone(x, y)) nodeBucketsZone[bucket].push(x, y, haloAlpha * FLOW_ZONE_DAMPEN_FLOOR);
      else nodeBuckets[bucket].push(x, y, haloAlpha);
    }

    flowElapsed = (flowElapsed + dt) % FLOW_LOOP_MS;

    ctx.clearRect(0, 0, cssW, cssH);
    buildGrid();
    collectConnections();
    drawConnections();
    for (let b = 0; b < NODE_BUCKETS; b++) {
      drawNodeBucket(nodeBuckets[b], bucketHaloSize[b], bucketColors[b]);
      drawNodeBucket(nodeBucketsZone[b], bucketHaloSize[b], bucketColorsZone[b]);
    }
    drawFlowDiagram(flowElapsed, pointerX, pointerY, pointerActive);
  }

  let rafId = null;
  let running = false; // isRunning: nunca se pide un segundo rAF si ya hay uno en vuelo
  let lastTime = 0;
  function loop(now) {
    let dt = now - lastTime;
    lastTime = now;
    if (dt > 33) dt = 33; // clamp duro a ~30fps SIEMPRE, no solo al reanudar
    updatePhysicsAndDraw(dt);
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return; // ya hay un bucle activo: no se acumulan bucles
    running = true;
    resetNodes(); // estado limpio garantizado antes de pedir el próximo frame
    lastTime = performance.now(); // ANTES de pedir el siguiente frame
    rafId = requestAnimationFrame(loop);
  }
  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // Sin pausa por scroll: el hero está al inicio de la página y es el
  // único canvas animado del sitio — el ahorro de pausarlo al salir de
  // vista es marginal frente al riesgo de un hero congelado, que es lo
  // primero que ve un visitante que vuelve arriba. La única pausa real
  // es por pestaña en segundo plano (si ahorra batería de verdad).
  let tabVisible = document.visibilityState === 'visible';
  function updateRunning() { if (tabVisible) start(); else stop(); }

  resizeCanvas();
  drawFrame();

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  document.addEventListener('mouseleave', onPointerLeave);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resizeCanvas(); heroRect = section.getBoundingClientRect(); }, 150);
  }, { passive: true });
  // Igual que en el modo estático: si el hero cambia de alto sin que cambie
  // la ventana, el canvas y la posición del diagrama se recalculan.
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resizeCanvas(); heroRect = section.getBoundingClientRect(); }, 150);
    }).observe(section);
  }

  // heroRect es relativo al viewport (getBoundingClientRect), y ahora que
  // el bucle corre siempre (ya no se pausa al salir de vista), tiene que
  // refrescarse con el scroll — antes esto lo hacía gratis el observer
  // que acabamos de quitar. rAF-throttled, no una lectura de layout por
  // evento de scroll.
  let heroRectScrollTicking = false;
  window.addEventListener('scroll', () => {
    if (heroRectScrollTicking) return;
    heroRectScrollTicking = true;
    requestAnimationFrame(() => {
      heroRectScrollTicking = false;
      heroRect = section.getBoundingClientRect();
    });
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    tabVisible = document.visibilityState === 'visible';
    updateRunning();
  });

  updateRunning(); // arranca de inmediato si la pestaña ya está visible al cargar

  window.__heroConstellationDebug = () => {
    let maxDisplacement = 0;
    for (let i = 0; i < n; i++) {
      const d = Math.hypot(nodesX[i] - baseX[i], nodesY[i] - baseY[i]);
      if (d > maxDisplacement) maxDisplacement = d;
    }
    return { nodeCount: n, lastComparisonCount, cssW, cssH, running, maxDisplacement: Math.round(maxDisplacement), flowElapsed: Math.round(flowElapsed) };
  };
}
