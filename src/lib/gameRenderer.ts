import type { GameState, SnakeSegment, Food, Tumbleweed, DustParticle } from './gameTypes';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  CELL_SIZE,
} from './gameConstants';

// ─── Cached off-screen layers ──────────────────────────────────────────────
let bgCanvas: OffscreenCanvas | null = null;

function ensureBackgroundCache(): OffscreenCanvas {
  if (bgCanvas) return bgCanvas;
  bgCanvas = new OffscreenCanvas(GAME_WIDTH, GAME_HEIGHT);
  const ctx = bgCanvas.getContext('2d')!;
  drawStaticBackground(ctx);
  return bgCanvas;
}

// ─── Color Constants ────────────────────────────────────────────────────────
const SKY_TOP = '#0d0a14';
const SKY_MID = '#1a1020';
const HORIZON_GLOW = '#3d1a08';
const HORIZON_BRIGHT = '#a04010';
const GROUND_NEAR = '#1a0e08';
const GROUND_FAR = '#261810';
const GRID_COLOR = 'rgba(255,180,100,0.04)';

const SNAKE_HEAD_FILL = '#d4943e';
const SNAKE_HEAD_HIGHLIGHT = '#f0b860';
const SNAKE_BODY_FILL = '#a87028';
const SNAKE_BODY_DARK = '#6e4818';
const SNAKE_BODY_LIGHT = '#c89040';
const SNAKE_PATTERN = '#553810';
const SNAKE_BELLY = '#d8b070';
const SNAKE_EYE = '#ff2020';
const SNAKE_EYE_GLOW = 'rgba(255,32,32,0.6)';
const SNAKE_RATTLE = '#e8c050';

const FOOD_RAT_BODY = '#9e8060';
const FOOD_RAT_EAR = '#c8a888';
const FOOD_SCORPION = '#d03030';
const FOOD_SCORPION_DARK = '#801818';
const FOOD_FRUIT_GREEN = '#7ea030';
const FOOD_FRUIT_HIGHLIGHT = '#a8d040';
const FOOD_GOLD = '#ffd740';
const FOOD_GOLD_HIGHLIGHT = '#fff4a0';

// ─── Stars (seeded) ─────────────────────────────────────────────────────────
interface Star { x: number; y: number; r: number; brightness: number; }
const STARS: Star[] = [];
{
  // Pseudo-random seed
  let seed = 42;
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 60; i++) {
    STARS.push({
      x: rand() * GAME_WIDTH,
      y: rand() * (GAME_HEIGHT * 0.35),
      r: rand() * 1.2 + 0.3,
      brightness: rand() * 0.4 + 0.2,
    });
  }
}

// ─── Mesa silhouette points ─────────────────────────────────────────────────
const MESA_POINTS: [number, number][] = [
  [0, 0.42], [0.05, 0.40], [0.10, 0.38], [0.14, 0.34], [0.16, 0.34],
  [0.20, 0.36], [0.25, 0.38], [0.28, 0.32], [0.30, 0.30], [0.32, 0.30],
  [0.34, 0.32], [0.38, 0.35], [0.42, 0.37], [0.46, 0.36], [0.50, 0.34],
  [0.54, 0.32], [0.56, 0.30], [0.58, 0.30], [0.60, 0.32], [0.62, 0.35],
  [0.66, 0.37], [0.70, 0.36], [0.74, 0.33], [0.76, 0.31], [0.78, 0.31],
  [0.82, 0.34], [0.86, 0.36], [0.90, 0.38], [0.94, 0.39], [1.0, 0.40],
];

// ─── Static Background (rendered once) ──────────────────────────────────────
function drawStaticBackground(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT * 0.42);
  skyGrad.addColorStop(0, SKY_TOP);
  skyGrad.addColorStop(0.6, SKY_MID);
  skyGrad.addColorStop(0.85, HORIZON_GLOW);
  skyGrad.addColorStop(1, HORIZON_BRIGHT);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.42);

  // Stars
  for (const s of STARS) {
    ctx.globalAlpha = s.brightness;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Horizon glow band
  const horizonY = GAME_HEIGHT * 0.38;
  const glowGrad = ctx.createRadialGradient(GAME_WIDTH / 2, horizonY, 10, GAME_WIDTH / 2, horizonY, GAME_WIDTH * 0.6);
  glowGrad.addColorStop(0, 'rgba(180,70,20,0.35)');
  glowGrad.addColorStop(0.5, 'rgba(120,40,10,0.15)');
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, horizonY - 60, GAME_WIDTH, 120);

  // Mesa silhouette
  ctx.fillStyle = '#0f0906';
  ctx.beginPath();
  ctx.moveTo(0, GAME_HEIGHT);
  for (const [px, py] of MESA_POINTS) {
    ctx.lineTo(px * GAME_WIDTH, py * GAME_HEIGHT);
  }
  ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // Ground gradient
  const groundTop = GAME_HEIGHT * 0.40;
  const groundGrad = ctx.createLinearGradient(0, groundTop, 0, GAME_HEIGHT);
  groundGrad.addColorStop(0, GROUND_FAR);
  groundGrad.addColorStop(0.3, '#1e1208');
  groundGrad.addColorStop(1, GROUND_NEAR);
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundTop, GAME_WIDTH, GAME_HEIGHT - groundTop);

  // Ground texture — sparse dots
  let dotSeed = 7;
  const dotRand = () => { dotSeed = (dotSeed * 16807) % 2147483647; return dotSeed / 2147483647; };
  for (let i = 0; i < 200; i++) {
    const dx = dotRand() * GAME_WIDTH;
    const dy = groundTop + dotRand() * (GAME_HEIGHT - groundTop);
    const alpha = dotRand() * 0.06 + 0.02;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = dotRand() > 0.5 ? '#3a2818' : '#14100a';
    ctx.fillRect(dx, dy, dotRand() * 3 + 1, dotRand() * 2 + 1);
  }
  ctx.globalAlpha = 1;

  // Grid lines (very subtle)
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = 0; x <= GAME_WIDTH; x += CELL_SIZE) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GAME_HEIGHT);
  }
  for (let y = 0; y <= GAME_HEIGHT; y += CELL_SIZE) {
    ctx.moveTo(0, y);
    ctx.lineTo(GAME_WIDTH, y);
  }
  ctx.stroke();
}

// ─── Tumbleweed (nicer strokes) ─────────────────────────────────────────────
function drawTumbleweed(ctx: CanvasRenderingContext2D, tw: Tumbleweed, frame: number) {
  ctx.save();
  ctx.translate(tw.x, tw.y);
  ctx.rotate(tw.rotation);
  ctx.globalAlpha = 0.35;

  const r = tw.size;
  ctx.strokeStyle = '#5a4020';
  ctx.lineWidth = 0.8;

  // Draw a scruffy circle with crossing lines
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 6; i++) {
    const a1 = (i / 6) * Math.PI * 2;
    const a2 = a1 + Math.PI * 0.6 + (i * 0.3);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a1) * r * 0.9, Math.sin(a1) * r * 0.9);
    ctx.lineTo(Math.cos(a2) * r * 0.7, Math.sin(a2) * r * 0.7);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ─── Snake Rendering ─────────────────────────────────────────────────────���──
function getSegCenter(seg: SnakeSegment) {
  return { x: seg.x * CELL_SIZE + CELL_SIZE / 2, y: seg.y * CELL_SIZE + CELL_SIZE / 2 };
}

function drawSnakeBody(ctx: CanvasRenderingContext2D, state: GameState) {
  const snake = state.snake;
  if (snake.length === 0) return;

  const halfCell = CELL_SIZE / 2;
  const bodyRadius = CELL_SIZE * 0.42;
  const headRadius = CELL_SIZE * 0.48;

  // Draw body segments back-to-front so head overlaps
  for (let i = snake.length - 1; i >= 0; i--) {
    const seg = snake[i];
    const cx = seg.x * CELL_SIZE + halfCell;
    const cy = seg.y * CELL_SIZE + halfCell;
    const isHead = i === 0;
    const isTail = i === snake.length - 1;
    const radius = isHead ? headRadius : (isTail ? bodyRadius * 0.7 : bodyRadius);

    // Check for wrapping — don't draw connectors across the board
    const prev = i > 0 ? snake[i - 1] : null;
    const isWrapped = prev && (Math.abs(prev.x - seg.x) > 2 || Math.abs(prev.y - seg.y) > 2);

    // Connector to previous segment (fills gaps between circles)
    if (prev && !isHead && !isWrapped) {
      const pcx = prev.x * CELL_SIZE + halfCell;
      const pcy = prev.y * CELL_SIZE + halfCell;
      const prevRadius = (i - 1 === 0) ? headRadius : bodyRadius;

      ctx.fillStyle = SNAKE_BODY_FILL;
      ctx.beginPath();
      // Draw a filled rect between the two centers
      const dx = pcx - cx;
      const dy = pcy - cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        const nx = -dy / len;
        const ny = dx / len;
        const w1 = radius * 0.85;
        const w2 = prevRadius * 0.85;
        ctx.moveTo(cx + nx * w1, cy + ny * w1);
        ctx.lineTo(pcx + nx * w2, pcy + ny * w2);
        ctx.lineTo(pcx - nx * w2, pcy - ny * w2);
        ctx.lineTo(cx - nx * w1, cy - ny * w1);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Body circle
    const bodyGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
    if (isHead) {
      bodyGrad.addColorStop(0, SNAKE_HEAD_HIGHLIGHT);
      bodyGrad.addColorStop(0.6, SNAKE_HEAD_FILL);
      bodyGrad.addColorStop(1, SNAKE_BODY_DARK);
    } else {
      bodyGrad.addColorStop(0, SNAKE_BODY_LIGHT);
      bodyGrad.addColorStop(0.5, SNAKE_BODY_FILL);
      bodyGrad.addColorStop(1, SNAKE_BODY_DARK);
    }

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Diamond pattern on body segments
    if (!isHead && !isTail && i % 2 === 0) {
      ctx.fillStyle = SNAKE_PATTERN;
      ctx.globalAlpha = 0.5;
      const ds = radius * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx, cy - ds);
      ctx.lineTo(cx + ds, cy);
      ctx.lineTo(cx, cy + ds);
      ctx.lineTo(cx - ds, cy);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Belly highlight on alternating segments
    if (!isHead && i % 2 === 1) {
      ctx.fillStyle = SNAKE_BELLY;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.ellipse(cx, cy + radius * 0.2, radius * 0.4, radius * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Tail rattle
    if (isTail) {
      ctx.fillStyle = SNAKE_RATTLE;
      const rs = radius * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, rs, 0, Math.PI * 2);
      ctx.fill();
      // Rattle bands
      ctx.fillStyle = '#a08020';
      ctx.fillRect(cx - rs * 0.2, cy - rs, rs * 0.15, rs * 2);
      ctx.fillRect(cx + rs * 0.15, cy - rs, rs * 0.15, rs * 2);
    }

    // Head details
    if (isHead) {
      const next = snake.length > 1 ? snake[1] : null;
      let dirX = 1, dirY = 0;
      if (next) {
        // Handle wrapping: determine facing direction from game state direction
        const dxx = seg.x - next.x;
        const dyy = seg.y - next.y;
        if (Math.abs(dxx) > 2 || Math.abs(dyy) > 2) {
          // Wrapped — use state.direction instead
          switch (state.direction) {
            case 'right': dirX = 1; dirY = 0; break;
            case 'left': dirX = -1; dirY = 0; break;
            case 'up': dirX = 0; dirY = -1; break;
            case 'down': dirX = 0; dirY = 1; break;
          }
        } else {
          dirX = dxx; dirY = dyy;
        }
      }
      // Perpendicular vector for eye placement
      const perpX = -dirY;
      const perpY = dirX;

      const eyeOffset = radius * 0.45;
      const eyeForward = radius * 0.35;
      const eyeR = 2.5;

      const e1x = cx + dirX * eyeForward + perpX * eyeOffset;
      const e1y = cy + dirY * eyeForward + perpY * eyeOffset;
      const e2x = cx + dirX * eyeForward - perpX * eyeOffset;
      const e2y = cy + dirY * eyeForward - perpY * eyeOffset;

      // Eye glow
      ctx.shadowColor = SNAKE_EYE_GLOW;
      ctx.shadowBlur = 6;
      ctx.fillStyle = SNAKE_EYE;
      ctx.beginPath();
      ctx.arc(e1x, e1y, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(e2x, e2y, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pupils (slit)
      ctx.fillStyle = '#000';
      ctx.fillRect(e1x - 0.5, e1y - eyeR + 0.5, 1, eyeR * 2 - 1);
      ctx.fillRect(e2x - 0.5, e2y - eyeR + 0.5, 1, eyeR * 2 - 1);

      // Tongue flick (20% chance per frame)
      if (Math.random() < 0.20) {
        const tongueLen = 10;
        const forkLen = 3;
        const tx = cx + dirX * radius;
        const ty = cy + dirY * radius;
        const tex = tx + dirX * tongueLen;
        const tey = ty + dirY * tongueLen;

        ctx.strokeStyle = '#cc1010';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tex, tey);
        ctx.stroke();
        // Fork
        ctx.beginPath();
        ctx.moveTo(tex, tey);
        ctx.lineTo(tex + dirX * forkLen + perpX * forkLen, tey + dirY * forkLen + perpY * forkLen);
        ctx.moveTo(tex, tey);
        ctx.lineTo(tex + dirX * forkLen - perpX * forkLen, tey + dirY * forkLen - perpY * forkLen);
        ctx.stroke();
      }
    }
  }
}

// ─── Food Rendering ─────────────────────────────────────────────────────────
function drawFood(ctx: CanvasRenderingContext2D, food: Food, frame: number) {
  const cx = food.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = food.y * CELL_SIZE + CELL_SIZE / 2;
  const pulse = Math.sin(frame * 0.08) * 1.5;
  const bob = Math.sin(frame * 0.06) * 0.8;

  switch (food.type) {
    case 'rat': {
      const ry = cy + bob;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(cx, ry + 4, 5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = FOOD_RAT_BODY;
      ctx.beginPath();
      ctx.ellipse(cx, ry, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = FOOD_RAT_EAR;
      ctx.beginPath();
      ctx.arc(cx - 3, ry - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 3, ry - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      // Tail
      ctx.strokeStyle = '#c8a888';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx + 5, ry);
      ctx.quadraticCurveTo(cx + 9, ry - 2, cx + 10, ry + 1);
      ctx.stroke();
      // Eye
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(cx - 2, ry - 1, 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'scorpion': {
      const sy = cy + bob;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(cx, sy + 5, 6, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = FOOD_SCORPION;
      ctx.beginPath();
      ctx.ellipse(cx, sy, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Claws
      ctx.fillStyle = FOOD_SCORPION;
      ctx.beginPath();
      ctx.arc(cx - 5, sy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, sy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Tail segments
      ctx.strokeStyle = FOOD_SCORPION_DARK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, sy - 3);
      ctx.quadraticCurveTo(cx, sy - 8 - pulse * 0.5, cx + 2, sy - 10 - pulse);
      ctx.stroke();
      // Stinger
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(cx + 2, sy - 10 - pulse, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'cactus_fruit': {
      const fy = cy + bob;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(cx, fy + 5, 5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fruit body
      const fruitGrad = ctx.createRadialGradient(cx - 1, fy - 1, 1, cx, fy, 5);
      fruitGrad.addColorStop(0, FOOD_FRUIT_HIGHLIGHT);
      fruitGrad.addColorStop(1, FOOD_FRUIT_GREEN);
      ctx.fillStyle = fruitGrad;
      ctx.beginPath();
      ctx.arc(cx, fy, 5, 0, Math.PI * 2);
      ctx.fill();
      // Flower on top
      ctx.fillStyle = '#ff80b0';
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(pa) * 3, fy - 4 + Math.sin(pa) * 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffe040';
      ctx.beginPath();
      ctx.arc(cx, fy - 4, 1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'gold_nugget': {
      const gy = cy + bob;
      // Glow
      ctx.shadowColor = FOOD_GOLD;
      ctx.shadowBlur = 8 + pulse * 2;
      // Nugget shape (irregular polygon)
      const goldGrad = ctx.createRadialGradient(cx - 1, gy - 1, 1, cx, gy, 5);
      goldGrad.addColorStop(0, FOOD_GOLD_HIGHLIGHT);
      goldGrad.addColorStop(0.6, FOOD_GOLD);
      goldGrad.addColorStop(1, '#b8960a');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 4, gy + 1);
      ctx.lineTo(cx - 2, gy - 4);
      ctx.lineTo(cx + 3, gy - 3);
      ctx.lineTo(cx + 5, gy);
      ctx.lineTo(cx + 3, gy + 3);
      ctx.lineTo(cx - 2, gy + 3);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // Sparkle
      if (frame % 8 < 2) {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(cx + 2, gy - 2, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      break;
    }
  }
}

// ─── Dust / Particles ───────────────────────────────────────────────────────
function drawParticles(ctx: CanvasRenderingContext2D, particles: DustParticle[]) {
  for (const p of particles) {
    ctx.globalAlpha = p.life * 0.8;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── HUD ────────────────────────────────────────────────────────────────────
function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  // Score background pill
  const scoreText = `${state.score}`;
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  const textWidth = ctx.measureText(scoreText).width;
  const labelWidth = ctx.measureText('SCORE ').width;
  const totalW = labelWidth + textWidth + 16;

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  const pillX = 6;
  const pillY = 6;
  const pillH = 20;
  const pillR = 4;
  ctx.beginPath();
  ctx.moveTo(pillX + pillR, pillY);
  ctx.lineTo(pillX + totalW - pillR, pillY);
  ctx.arcTo(pillX + totalW, pillY, pillX + totalW, pillY + pillR, pillR);
  ctx.lineTo(pillX + totalW, pillY + pillH - pillR);
  ctx.arcTo(pillX + totalW, pillY + pillH, pillX + totalW - pillR, pillY + pillH, pillR);
  ctx.lineTo(pillX + pillR, pillY + pillH);
  ctx.arcTo(pillX, pillY + pillH, pillX, pillY + pillH - pillR, pillR);
  ctx.lineTo(pillX, pillY + pillR);
  ctx.arcTo(pillX, pillY, pillX + pillR, pillY, pillR);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,200,130,0.5)';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText('SCORE', pillX + 8, pillY + pillH / 2);

  ctx.fillStyle = '#ffd740';
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.fillText(scoreText, pillX + 8 + labelWidth, pillY + pillH / 2);
}

// ─── Vignette ───────────────────────────────────────────────────────────────
function drawVignette(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createRadialGradient(
    GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 0.25,
    GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * 0.75,
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

// ─── Star twinkle ───────────────────────────────────────────────────────────
function drawStarTwinkle(ctx: CanvasRenderingContext2D, frame: number) {
  for (const s of STARS) {
    const flicker = Math.sin(frame * 0.03 + s.x * 0.7) * 0.15;
    ctx.globalAlpha = Math.max(0.05, s.brightness + flicker);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Ambient drifting dust ──────────────────────────────────────────────────
function drawAmbientDust(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#c8a060';
  for (let i = 0; i < 15; i++) {
    const x = ((frame * 0.3 + i * 57.3) % (GAME_WIDTH + 20)) - 10;
    const y = GAME_HEIGHT * 0.5 + Math.sin(frame * 0.01 + i * 2.1) * GAME_HEIGHT * 0.35;
    ctx.beginPath();
    ctx.arc(x, y, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Main Render ────────────────────────────────────────────────────────────
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, frame: number) {
  const shake = state.screenShake || 0;
  const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;
  const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // 1. Cached static background
  const bg = ensureBackgroundCache();
  ctx.drawImage(bg, 0, 0);

  // 2. Animated star twinkle (overlays static stars)
  drawStarTwinkle(ctx, frame);

  // 3. Ambient drifting dust
  drawAmbientDust(ctx, frame);

  // 4. Tumbleweeds
  for (const tw of state.tumbleweeds) {
    drawTumbleweed(ctx, tw, frame);
  }

  // 5. Food
  for (const f of state.food) {
    drawFood(ctx, f, frame);
  }

  // 6. Snake
  drawSnakeBody(ctx, state);

  // 7. Dust / explosion particles
  drawParticles(ctx, state.dustParticles);

  // 8. Vignette
  drawVignette(ctx);

  // 9. HUD
  drawHUD(ctx, state);

  ctx.restore();
}

/** Call this if the canvas is re-created (e.g. hot reload) to bust the BG cache. */
export function invalidateBackgroundCache() {
  bgCanvas = null;
}
