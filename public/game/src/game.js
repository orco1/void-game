// ─── Constants ───────────────────────────────────────────────────────────────
const COLS = 80;
const ROWS = 50;
const CS   = 8;          // cell size in pixels
const WIN_PCT           = 75;
const INITIAL_LIVES     = 3;
const PLAYER_MOVE_MS    = 85;  // ms between player moves when key held
const DYING_DURATION_MS = 1400;

const SPAWN_POSITIONS = [
  [20, 12], [55, 32], [35, 20], [12, 35], [62, 10],
  [40, 40], [25, 28], [65, 38], [48, 15], [10, 45]
];

// ─── Game state ───────────────────────────────────────────────────────────────
const STATE = { MENU: 0, PLAYING: 1, DYING: 2, LEVEL_COMPLETE: 3, GAME_OVER: 4 };

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const canvas      = document.getElementById('gameCanvas');
const ctx         = canvas.getContext('2d');
const overlay     = document.getElementById('overlay');
const oTitle      = document.getElementById('overlay-title');
const oSub        = document.getElementById('overlay-sub');
const oBtn        = document.getElementById('overlay-btn');
const elLevel     = document.getElementById('el-level');
const elPct       = document.getElementById('el-pct');
const elLives     = document.getElementById('el-lives');
const elScore     = document.getElementById('el-score');
const pctBar      = document.getElementById('pct-bar');
const scoreSubmit   = document.getElementById('score-submit');
const playerNameEl  = document.getElementById('player-name');
const submitBtn     = document.getElementById('submit-score-btn');
const submitStatus  = document.getElementById('submit-status');
const lbTeaser      = document.getElementById('leaderboard-teaser');
const fullLbLink    = document.getElementById('full-lb-link');

// ─── Game vars ────────────────────────────────────────────────────────────────
let grid, player, enemies;
let lives, level, score;
let gameState = STATE.MENU;
let stateTimer = 0;
let lastTime   = 0;
let playerMoveTimer = 0;
let captureFlash = 0;
let deathFlash   = 0;
let overlayCallback = null;

const keys = {};

// ─── Init / level setup ───────────────────────────────────────────────────────
function initGame() {
  grid   = new Grid(COLS, ROWS);
  player = new Player(grid);
  lives  = INITIAL_LIVES;
  level  = 1;
  score  = 0;
  enemies = spawnEnemies(1);
}

function spawnEnemies(lvl) {
  const count = Math.min(1 + lvl, SPAWN_POSITIONS.length);
  const speed = 1.0 + (lvl - 1) * 0.22;
  return SPAWN_POSITIONS.slice(0, count).map(([gx, gy]) => {
    return new Enemy(grid, CS, gx, gy, speed);
  });
}

function startLevel(lvl) {
  level = lvl;
  grid.reset();
  player.x = 0; player.y = 0;
  player.drawing = false; player.trail = [];
  enemies = spawnEnemies(lvl);
  gameState = STATE.PLAYING;
  updateHUD();
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function updateHUD() {
  elLevel.textContent = level;
  elScore.textContent = score.toString().padStart(6, '0');
  elLives.textContent = '♥'.repeat(Math.max(0, lives));
  const pct = grid ? grid.claimedPercent() : 0;
  elPct.textContent   = pct.toFixed(1) + '%';
  pctBar.style.width  = Math.min(pct, 100) + '%';
  pctBar.style.background = pct >= WIN_PCT ? '#00FF88' : '#00AAFF';
}

// ─── Overlay helpers ─────────────────────────────────────────────────────────
function showOverlay(title, sub, btnLabel, cb) {
  oTitle.textContent = title;
  oSub.textContent   = sub;
  oBtn.textContent   = btnLabel;
  overlay.classList.remove('hidden');
  overlayCallback = cb;
}

function hideOverlay() { overlay.classList.add('hidden'); }

oBtn.addEventListener('click', () => {
  if (overlayCallback) { overlayCallback(); overlayCallback = null; }
});

// ─── Input ────────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// D-pad buttons
['up','down','left','right'].forEach(dir => {
  const btn = document.getElementById('btn-' + dir);
  if (!btn) return;
  const key = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight' }[dir];
  btn.addEventListener('touchstart', e => { keys[key] = true;  e.preventDefault(); }, { passive: false });
  btn.addEventListener('touchend',   e => { keys[key] = false; e.preventDefault(); }, { passive: false });
  btn.addEventListener('mousedown',  () => { keys[key] = true;  });
  btn.addEventListener('mouseup',    () => { keys[key] = false; });
  btn.addEventListener('mouseleave', () => { keys[key] = false; });
});

// ─── Update ───────────────────────────────────────────────────────────────────
function update(dt) {
  if (gameState === STATE.DYING) {
    stateTimer   -= dt;
    deathFlash    = Math.max(0, deathFlash - dt / 600);
    if (stateTimer <= 0) gameState = STATE.PLAYING;
    return;
  }

  if (gameState !== STATE.PLAYING) return;

  captureFlash = Math.max(0, captureFlash - dt / 350);
  deathFlash   = Math.max(0, deathFlash - dt / 600);

  // ── Player movement ──
  playerMoveTimer += dt;
  if (playerMoveTimer >= PLAYER_MOVE_MS) {
    playerMoveTimer = 0;
    let dx = 0, dy = 0;
    if      (keys['ArrowLeft']  || keys['a'] || keys['A']) dx = -1;
    else if (keys['ArrowRight'] || keys['d'] || keys['D']) dx =  1;
    else if (keys['ArrowUp']    || keys['w'] || keys['W']) dy = -1;
    else if (keys['ArrowDown']  || keys['s'] || keys['S']) dy =  1;

    if (dx || dy) {
      const result = player.move(dx, dy);
      if (result === 'capture') {
        const enemyPos = enemies.map(e => e.getGridPos());
        const captured = grid.fillCapture(player.trail, enemyPos);
        player.clearTrail();
        score        += captured * 10;
        captureFlash  = 1.0;
        updateHUD();

        if (grid.claimedPercent() >= WIN_PCT) {
          gameState = STATE.LEVEL_COMPLETE;
          const pct = grid.claimedPercent();
          showOverlay(
            `LEVEL ${level}`,
            `ZONE SECURED  ·  ${pct.toFixed(1)}% CAPTURED  ·  +${captured * 10} PTS`,
            'NEXT LEVEL',
            () => { hideOverlay(); startLevel(level + 1); }
          );
          return;
        }
      } else {
        updateHUD();
      }
    }
  }

  // ── Enemy movement ──
  for (const enemy of enemies) {
    if (enemy.update() === 'kill' && player.drawing) {
      killPlayer();
      return;
    }
  }
}

function killPlayer() {
  player.die();
  lives--;
  deathFlash = 1.0;
  updateHUD();

  if (lives <= 0) {
    gameState = STATE.GAME_OVER;
    const finalScore = score;
    const finalLevel = level;
    showOverlay(
      'GAME OVER',
      `REACHED LEVEL ${finalLevel}  ·  SCORE ${finalScore}`,
      'PLAY AGAIN',
      () => { hideScoreUI(); initGame(); hideOverlay(); gameState = STATE.PLAYING; updateHUD(); }
    );
    showScoreUI(finalScore, finalLevel);
    loadLeaderboardTeaser();
  } else {
    gameState  = STATE.DYING;
    stateTimer = DYING_DURATION_MS;
  }
}

// ─── Leaderboard / score submission ──────────────────────────────────────────
function showScoreUI(finalScore, finalLevel) {
  scoreSubmit.style.display = 'block';
  playerNameEl.value = '';
  submitStatus.textContent = '';
  submitBtn.disabled = false;
  submitBtn.onclick = async () => {
    const name = playerNameEl.value.trim();
    if (!name) { submitStatus.textContent = 'ENTER YOUR NAME'; return; }
    submitBtn.disabled = true;
    submitStatus.textContent = 'SUBMITTING…';
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score: finalScore, level: finalLevel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      submitStatus.textContent = 'RANK #' + data.rank + ' — NICE';
      submitBtn.style.display = 'none';
      playerNameEl.disabled = true;
      loadLeaderboardTeaser();
    } catch {
      submitStatus.textContent = 'ERROR — TRY AGAIN';
      submitBtn.disabled = false;
    }
  };
}

function hideScoreUI() {
  scoreSubmit.style.display = 'none';
  lbTeaser.style.display = 'none';
  fullLbLink.style.display = 'none';
  playerNameEl.disabled = false;
  submitBtn.style.display = '';
}

async function loadLeaderboardTeaser() {
  try {
    const res = await fetch('/api/scores?limit=3');
    const top = await res.json();
    if (!Array.isArray(top) || top.length === 0) return;
    const medals = ['1ST', '2ND', '3RD'];
    lbTeaser.textContent = '';
    top.forEach((s, i) => {
      const line = document.createElement('div');
      const rank = document.createTextNode(medals[i] + '  ');
      const name = document.createTextNode(s.name);
      const spacer = document.createTextNode('   ');
      const pts = document.createTextNode(String(s.score).padStart(6, '0'));
      line.appendChild(rank);
      line.appendChild(name);
      line.appendChild(spacer);
      line.appendChild(pts);
      lbTeaser.appendChild(line);
    });
    lbTeaser.style.display = 'block';
    fullLbLink.style.display = 'block';
  } catch {
    // silently ignore — leaderboard is non-critical
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────
const C_BG         = '#030310';
const C_CLAIMED    = '#001B2E';
const C_COAST      = '#0088BB';
const C_COAST_EDGE = '#00CCFF';
const C_TRAIL      = '#CC0055';
const C_TRAIL_GLOW = 'rgba(255,0,100,0.22)';
const C_PLAYER_SAFE = '#00EEFF';
const C_PLAYER_DRAW = '#FF2288';
const C_ENEMY_CORE  = '#FF6600';
const C_ENEMY_GLOW  = '#FF3300';

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = C_BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ── Cells ──
  for (let cy = 0; cy < ROWS; cy++) {
    for (let cx = 0; cx < COLS; cx++) {
      const cell = grid.get(cx, cy);
      const px = cx * CS, py = cy * CS;

      if (cell === CELL.CLAIMED) {
        ctx.fillStyle = C_CLAIMED;
        ctx.fillRect(px, py, CS, CS);

        // Bright coast edges (borders with unclaimed/void)
        const L = cx > 0       ? grid.get(cx - 1, cy) : CELL.CLAIMED;
        const R = cx < COLS-1  ? grid.get(cx + 1, cy) : CELL.CLAIMED;
        const T = cy > 0       ? grid.get(cx, cy - 1) : CELL.CLAIMED;
        const B = cy < ROWS-1  ? grid.get(cx, cy + 1) : CELL.CLAIMED;

        ctx.fillStyle = C_COAST_EDGE;
        if (L !== CELL.CLAIMED) ctx.fillRect(px,          py,      1,  CS);
        if (R !== CELL.CLAIMED) ctx.fillRect(px + CS - 1, py,      1,  CS);
        if (T !== CELL.CLAIMED) ctx.fillRect(px,          py,      CS,  1);
        if (B !== CELL.CLAIMED) ctx.fillRect(px,          py+CS-1, CS,  1);

      } else if (cell === CELL.TRAIL) {
        // Glow halo
        ctx.fillStyle = C_TRAIL_GLOW;
        ctx.fillRect(px - 1, py - 1, CS + 2, CS + 2);
        // Core
        ctx.fillStyle = C_TRAIL;
        ctx.fillRect(px + 1, py + 1, CS - 2, CS - 2);
        ctx.fillStyle = '#FF55AA';
        ctx.fillRect(px + 2, py + 2, CS - 4, CS - 4);
      }
      // UNCLAIMED: leave as background — pure void
    }
  }

  // ── Scanlines ──
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let y = 0; y < canvas.height; y += 2) ctx.fillRect(0, y, canvas.width, 1);

  // ── Death flash ──
  if (deathFlash > 0) {
    ctx.fillStyle = `rgba(255,0,0,${deathFlash * 0.35})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ── Capture flash ──
  if (captureFlash > 0) {
    ctx.fillStyle = `rgba(0,200,255,${captureFlash * 0.12})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ── Enemies ──
  for (const e of enemies) {
    const pulse  = 0.75 + 0.25 * Math.sin(e.pulseT);
    const radius = CS * 0.48 * pulse;
    const spikes = 6;

    // Shadow / glow
    ctx.save();
    ctx.shadowColor = C_ENEMY_GLOW;
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = `rgba(255,${70 + 40 * pulse | 0},0,0.85)`;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? radius : radius * 0.45;
      i === 0 ? ctx.moveTo(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r)
              : ctx.lineTo(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Core dot
    ctx.fillStyle = '#FFD080';
    ctx.beginPath();
    ctx.arc(e.x, e.y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Player ──
  if (gameState === STATE.PLAYING || gameState === STATE.DYING) {
    const px = player.x * CS;
    const py = player.y * CS;
    const color = player.drawing ? C_PLAYER_DRAW : C_PLAYER_SAFE;

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur  = 18;
    ctx.fillStyle   = color;
    ctx.fillRect(px + 1, py + 1, CS - 2, CS - 2);
    ctx.restore();

    // Bright inner core
    ctx.fillStyle = player.drawing ? '#FFBBDD' : '#CCFFFF';
    ctx.fillRect(px + 3, py + 3, CS - 6, CS - 6);
  }
}

// ─── Game loop ────────────────────────────────────────────────────────────────
function loop(ts) {
  const dt = Math.min(ts - lastTime, 50);
  lastTime = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
showOverlay(
  'VOID',
  'DRAW LINES · CLOSE ZONES · DON\'T LET THE MONSTERS TOUCH YOUR TRAIL',
  'START',
  () => { hideOverlay(); initGame(); gameState = STATE.PLAYING; updateHUD(); }
);
requestAnimationFrame(loop);
