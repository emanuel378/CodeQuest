import { runCommands } from './engine/runner.js';
import { validateCommands, MAX_TOTAL_COMMANDS } from './engine/validator.js';
import { BlockWorkspace } from './ui/blockWorkspace.js';
import { BlockPalette } from './ui/blockPalette.js';
import { Player } from './actors/player.js';
import { Stage } from './stage/stage.js';
import { getLevel } from './game/levels.js';
import { Progression } from './game/progression.js';
import { PlayerManager } from './game/playerManager.js';
import { router, ROUTE_CHANGE, consumePendingLevelId } from './ui/routes.js';
import { GameErrorHandler } from './ui/gameErrorHandler.js';
import { GameTutorial } from './ui/gameTutorial.js';
import { ProfileMenu } from './ui/profileMenu.js';
import { ObjectivesPanel } from './ui/objectivesPanel.js';
import { audioManager } from './audio/audioManager.js';
import { AttributesPanel } from './ui/attributesPanel.js';
import { AttributeSystem } from './game/attributes.js';
import { EnemyInfoPanel } from './ui/enemyInfoPanel.js';

let gs = null;
let executingBlockIds = new Set();

// --- Profile compartilhado (landing + game) ---
let _playerManager = null;
let _profileMenu = null;

function _getPlayerManager() {
  if (!_playerManager) _playerManager = new PlayerManager();
  return _playerManager;
}

function _mountProfileForLanding() {
  _destroyProfile();
  _profileMenu = new ProfileMenu(_getPlayerManager(), () => {
    router.navigate('/');
  }, () => {
    router.navigate('/');
  });
  _profileMenu.mount();
}

function _destroyProfile() {
  if (_profileMenu) {
    _profileMenu.destroy();
    _profileMenu = null;
  }
}

function getInitialLevelId() {
  const pendingId = consumePendingLevelId();
  const levelId = pendingId !== null ? pendingId : gs.progression.getCurrentLevel();
  if (getLevel(levelId)) return levelId;
  for (let fallbackId = levelId - 1; fallbackId >= 0; fallbackId--) {
    if (getLevel(fallbackId)) return fallbackId;
  }
  return 0;
}

function loadLevelById(levelId, skipMusic = false) {
  const level = getLevel(levelId);
  if (!level) {
    if (gs.simGrid) {
      gs.simGrid.innerHTML = '';
      gs.simGrid.style.backgroundImage = '';
    }
    setStatus('Nenhum nível disponível', '#ef4444');
    return;
  }

  gs.activeLevelId = level.id;
  if (_errorFadeTimeout) { clearTimeout(_errorFadeTimeout); _errorFadeTimeout = null; }
  gs.errorLog.innerHTML = '';
  gs.errorLog.style.display = 'none';
  gs.errorLog.classList.remove('fade-out');
  gs.stage.loadLevel(level);
  gs.stage.setPlayer(gs.player);
  gs.player.reset(
    level.playerStart.x,
    level.playerStart.y,
    level.playerStart.direction
  );
  gs.player.gridSize = level.gridSize;

  if (gs.attrPanel) gs.attrPanel.refresh()

  const container = document.querySelector('.game-container');
  if (container) {
    const cls = level.theme || 'ocean';
    container.className = `game-container theme-${cls}`;
  }

  if (!skipMusic) audioManager.playMusic(level.theme || 'ocean');

  if (gs.indicator) gs.indicator.textContent = `Nível ${level.id}: ${level.name}`;

  renderSimGrid(level);
  if (gs.enemyInfoPanel) gs.enemyInfoPanel.update(gs.stage.enemies);
  gs.palette.filterByUnlocked(gs.progression.getUnlockedCommands());
  if (gs.objectivesPanel) {
    gs.objectivesPanel.setObjectives(gs.stage.objectives);
    gs.objectivesPanel.reset();
  }
  setStatus('Pronto', '#00FF3D');
  updateHUD();
}

function loadCurrentLevel() {
  if (gs.progression) gs.progression.resetAttempts()
  loadLevelById(getInitialLevelId());
}

function resetActiveLevel(skipMusic = false) {
  const levelId = gs.activeLevelId ?? getInitialLevelId();
  loadLevelById(levelId, skipMusic);
}

function updateHUD() {
  if (!gs || !gs.progression) return
  const levelId = gs.activeLevelId
  if (levelId === null || levelId === undefined) return

  const totalLevels = 10
  const completedCount = gs.progression.completedLevels.length
  const pct = Math.min(Math.round((completedCount / totalLevels) * 100), 100)

  const fill = document.querySelector('.progress-fill')
  const label = document.querySelector('.progress-labels span:last-child')
  if (fill) fill.style.width = `${pct}%`
  if (label) label.textContent = `${pct}%`

  const level = getLevel(levelId)
  const starCount = level ? level.difficulty : 1

  const stars = document.querySelectorAll('.star-rating .material-symbols-outlined')
  stars.forEach((star, i) => {
    if (i < starCount) {
      star.style.fontVariationSettings = '"FILL" 1'
      star.style.color = ''
      star.style.opacity = '1'
    } else {
      star.style.fontVariationSettings = '"FILL" 0'
      star.style.color = 'var(--color-accent)'
      star.style.opacity = '0.4'
    }
  })
}

function renderSimGrid(level) {
  if (!gs.simGrid) return;

  gs.simGrid.innerHTML = '';

  const cellW = gs.simGrid.clientWidth / level.gridSize;

  gs.simGrid.style.backgroundSize = `${cellW}px ${cellW}px`;
  gs.simGrid.style.backgroundImage = `
    linear-gradient(rgba(0, 242, 255, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.2) 1px, transparent 1px)
  `;
  if (!cellW || cellW <= 0) return;

  for (const obs of (level.obstacles || [])) {
    const el = document.createElement('div');
    el.className = 'sim-entity sim-obstacle';
    el.dataset.x = obs.x;
    el.dataset.y = obs.y;
    el.style.left = `${obs.x * cellW}px`;
    el.style.top = `${obs.y * cellW}px`;
    el.style.width = `${cellW}px`;
    el.style.height = `${cellW}px`;

    const obsSprite = obs.sprite;

    const img = document.createElement('img');
    img.src = obsSprite;
    img.alt = obs.type;
    img.className = 'sim-sprite';
    el.appendChild(img);

    gs.simGrid.appendChild(el);
  }

  for (const enemy of (gs.stage.enemies || [])) {
    const el = document.createElement('div');
    el.className = 'sim-entity sim-enemy';
    el.dataset.x = enemy.x;
    el.dataset.y = enemy.y;
    el.dataset.hp = enemy.hp;
    el.dataset.type = enemy.type ?? 0;
    el.dataset.direction = enemy.direction ?? 2;
    el.dataset.enemyId = enemy.id;
    el.style.left = `${enemy.x * cellW}px`;
    el.style.top = `${enemy.y * cellW}px`;
    el.style.width = `${cellW}px`;
    el.style.height = `${cellW}px`;

    const enemySprite = enemy.sprite || null;

    if (enemySprite) {
      const img = document.createElement('img');
      img.src = enemySprite;
      img.alt = 'Inimigo';
      img.className = 'sim-sprite enemy-sprite-img';
      img.style.transform = `rotate(${enemy._visualRotation || 0}deg)`;
      el.appendChild(img);
      el.classList.add('sim-enemy-sprite');
    } else {
      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.textContent = 'bug_report';
      el.appendChild(icon);
    }

    if (enemy.type === 2) {
      el.classList.add('sim-enemy-patrol');
    }

    const hpLabel = document.createElement('span');
    hpLabel.className = 'enemy-hp';
    hpLabel.textContent = `HP:${enemy.hp}`;
    el.appendChild(hpLabel);

    gs.simGrid.appendChild(el);
  }

  for (const item of (level.items || [])) {
    const el = document.createElement('div');
    el.className = 'sim-entity sim-item';
    el.dataset.x = item.x;
    el.dataset.y = item.y;
    el.style.left = `${item.x * cellW}px`;
    el.style.top = `${item.y * cellW}px`;
    el.style.width = `${cellW}px`;
    el.style.height = `${cellW}px`;

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'diamond';
    el.appendChild(icon);

    gs.simGrid.appendChild(el);
  }

  if (level.goal) {
    const el = document.createElement('div');
    el.className = 'sim-entity sim-goal';
    el.dataset.x = level.goal.x;
    el.dataset.y = level.goal.y;
    el.style.left = `${level.goal.x * cellW}px`;
    el.style.top = `${level.goal.y * cellW}px`;
    el.style.width = `${cellW}px`;
    el.style.height = `${cellW}px`;

    const goalImg = document.createElement('img');
    goalImg.src = level.goal.sprite;
    goalImg.alt = 'Objetivo';
    goalImg.className = 'sim-sprite';
    el.appendChild(goalImg);

    gs.simGrid.appendChild(el);
  }

  const robot = document.createElement('div');
  robot.className = 'sim-robot';
  robot.style.transition = 'none';
  const robotImg = document.createElement('img');
  robotImg.className = 'sim-sprite';
  robotImg.alt = 'Jogador';
  robot.appendChild(robotImg);
  gs.player.__robotEl = robot;
  gs.player.__robotImg = robotImg;
  gs.simGrid.appendChild(robot);

  updateSimView();
  requestAnimationFrame(() => {
    robot.style.transition = '';
  });
}

function updateSimView() {
  const robot = gs.player.__robotEl;
  if (!robot || !gs.simGrid) return;
  const cellSize = gs.simGrid.clientWidth / gs.stage.gridSize;

  robot.style.left = `${gs.player.x * cellSize}px`;
  robot.style.top = `${gs.player.y * cellSize}px`;
  robot.style.width = `${cellSize}px`;
  robot.style.height = `${cellSize}px`;

  robot.style.transform = 'none';

  if (gs.player.__robotImg) {
    const directionSprites = [
      'assets/sprites/player/principalcostas.png',
      'assets/sprites/player/principaldireito.png',
      'assets/sprites/player/principal.png',
      'assets/sprites/player/principalesquerdo.png'
    ];
    gs.player.__robotImg.src = directionSprites[gs.player.direction] || directionSprites[0];
  }

  if (gs.els.attrVitalidade) {
    gs.els.attrVitalidade.textContent = gs.player.hp;
  }
}

function syncSimEntities() {
  const cellSize = gs.simGrid.clientWidth / gs.stage.gridSize;

  for (const el of gs.simGrid.querySelectorAll('.sim-enemy')) {
    const enemyId = el.dataset.enemyId;
    const enemy = gs.stage.enemies.find(e => e.id === enemyId);

    if (!enemy || !enemy.alive) {
      el.classList.add('enemy-dying');
      setTimeout(() => el.remove(), 400);
      continue;
    }

    el.style.left = `${enemy.x * cellSize}px`;
    el.style.top = `${enemy.y * cellSize}px`;
    el.dataset.x = enemy.x;
    el.dataset.y = enemy.y;
    el.dataset.direction = enemy.direction;

    const hpEl = el.querySelector('.enemy-hp');
    if (hpEl) hpEl.textContent = `HP:${enemy.hp}`;

    const img = el.querySelector('.enemy-sprite-img');
    if (img) {
      const enemyType = parseInt(el.dataset.type);
      if (enemyType === 1) {
        img.src = enemy.sprite;
      }
      img.style.transform = `rotate(${enemy._visualRotation || 0}deg)`;
    }
  }
}

function syncSimObstacles() {
  const cellSize = gs.simGrid.clientWidth / gs.stage.gridSize;

  for (const el of gs.simGrid.querySelectorAll('.sim-obstacle')) {
    const x = parseInt(el.dataset.x);
    const y = parseInt(el.dataset.y);
    if (gs.stage.isObstacleRemoved(x, y)) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  }
}

function tickEnemiesAndSync() {
  const attacks = gs.stage.tickEnemies();

  for (const attack of attacks) {
    if (attack.enemyId) {
      const enemyEl = gs.simGrid.querySelector(`.sim-enemy[data-enemy-id="${attack.enemyId}"]`);
      if (enemyEl) {
        enemyEl.classList.add('enemy-attacking');
        setTimeout(() => enemyEl.classList.remove('enemy-attacking'), 350);
      }
    }
    if (attack.type === 'laser') {
      setTimeout(() => flashLaserCells(attack), 200);
    }
    if (attack.type === 'melee') {
      setTimeout(() => flashMeleeCell(attack), 200);
    }
  }

  syncSimEntities();
  if (gs.enemyInfoPanel) gs.enemyInfoPanel.update(gs.stage.enemies);
  updateSimView();

  if (gs.stage.checkAllObjectives() && gs.objectivesPanel) {
    gs.objectivesPanel.updateState(gs.stage.getCompletedObjectiveIds());
  }

  if (gs.els.attrVitalidade) {
    gs.els.attrVitalidade.textContent = gs.player.hp;
  }

  const wasHit = attacks.some(a => {
    if (a.damage <= 0) return false;
    return a.cells.some(c => c.x === gs.player.x && c.y === gs.player.y);
  });

  if (wasHit) {
    flashPlayerDamage();
    audioManager.playSfx('takedmg');
  }

  if (!gs.stage.isPlayerAlive()) {
    gs.shouldStop = true;
    showGameOver();
  }
}

function flashLaserCells(attack) {
  const cellSize = gs.simGrid.clientWidth / gs.stage.gridSize;

  for (const cell of attack.cells) {
    const overlay = document.createElement('div');
    overlay.className = 'laser-cell';
    overlay.style.left = `${cell.x * cellSize}px`;
    overlay.style.top = `${cell.y * cellSize}px`;
    overlay.style.width = `${cellSize}px`;
    overlay.style.height = `${cellSize}px`;
    gs.simGrid.appendChild(overlay);
    setTimeout(() => overlay.remove(), 400);
  }
}

function flashPlayerDamage() {
  const robot = gs.player.__robotEl;
  if (!robot) return;
  robot.classList.add('player-damaged');
  setTimeout(() => robot.classList.remove('player-damaged'), 400);
}

function flashMeleeCell(attack) {
  const cellSize = gs.simGrid.clientWidth / gs.stage.gridSize;

  for (const cell of attack.cells) {
    const overlay = document.createElement('div');
    overlay.className = 'melee-cell';
    overlay.style.left = `${cell.x * cellSize}px`;
    overlay.style.top = `${cell.y * cellSize}px`;
    overlay.style.width = `${cellSize}px`;
    overlay.style.height = `${cellSize}px`;
    gs.simGrid.appendChild(overlay);
    setTimeout(() => overlay.remove(), 350);
  }
}

function showGameOver() {
  gs._playerDied = true;
  setStatus('Derrota', '#ef4444');

  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-modal">
      <span class="game-over-icon material-symbols-outlined">skull</span>
      <h2 class="game-over-title">Game Over</h2>
      <p class="game-over-text">O herói foi derrotado!</p>
      <button class="game-over-btn" id="btn-restart">Tentar novamente</button>
    </div>
  `;
  document.querySelector('.simulation-panel')?.appendChild(overlay);

  overlay.querySelector('#btn-restart').addEventListener('click', () => {
    overlay.remove();
    gs._playerDied = false;
    gs.shouldStop = false;
    resetActiveLevel(true);
    setStatus('Pronto', '#00FF3D');
    if (gs.objectivesPanel) gs.objectivesPanel.reset();
  });

  setTimeout(() => overlay.classList.add('active'), 10);
}

function updateBlockHighlights() {
  for (const b of gs.workspace.blocks.values()) {
    b.el.classList.toggle('executing', executingBlockIds.has(b.id));
  }
}

function setStatus(text, color = 'var(--on-surface-variant)') {
  if (gs.statusText) gs.statusText.textContent = text;
  if (gs.statusDot) {
    gs.statusDot.style.background = color;
    gs.statusDot.style.boxShadow = `0 0 8px ${color}`;
  }
}

function showErrorLog() {
  if (_errorFadeTimeout) {
    clearTimeout(_errorFadeTimeout);
    _errorFadeTimeout = null;
  }
  gs.errorLog.classList.remove('fade-out');
  gs.errorLog.style.display = 'flex';
}

function scheduleErrorFadeOut(delay = 5000) {
  if (_errorFadeTimeout) clearTimeout(_errorFadeTimeout);
  _errorFadeTimeout = setTimeout(() => {
    _errorFadeTimeout = null;
    if (gs.errorLog.style.display === 'none') return;
    gs.errorLog.classList.add('fade-out');
    gs.errorLog.addEventListener('animationend', () => {
      gs.errorLog.style.display = 'none';
      gs.errorLog.classList.remove('fade-out');
    }, { once: true });
  }, delay);
}

function createLogEntry(type, message) {
  const el = document.createElement('div');
  el.className = `log-${type}`;
  el.textContent = type === 'error' ? '✕ ' : '⚠ ';
  const span = document.createElement('span');
  span.textContent = message;
  el.appendChild(span);
  return el;
}

function showErrors(validation) {
  gs.errorLog.innerHTML = '';
  if (!validation || (!validation.hasErrors() && !validation.hasWarnings())) {
    gs.errorLog.style.display = 'none';
    return;
  }
  showErrorLog();

  for (const msg of validation.getAllMessages()) {
    const el = createLogEntry(msg.type, msg.message);
    gs.errorLog.appendChild(el);
  }
}

function countBlocksInTree(commands) {
  let count = 0
  for (const cmd of commands) {
    count++
    if (cmd.children) count += countBlocksInTree(cmd.children)
    if (cmd.elseChildren) count += countBlocksInTree(cmd.elseChildren)
  }
  return count
}

function showVictoryModal({ rankConfig, blocksUsed, idealBlocks, boostedScore, baseXP, attrMultiplier, timeElapsed, hasNext, levelName = 'Fase Desconhecida', unlockCategory = null }) {
  const overlay = document.createElement('div')
  overlay.className = 'victory-overlay'

  const stars = rankConfig.label === 'S' ? 3 : rankConfig.label === 'A' ? 2 : 1
  const xpPercent = Math.min(100, Math.round((boostedScore / (baseXP * rankConfig.xpMultiplier * attrMultiplier)) * 100))

  overlay.innerHTML = `
    <div class="victory-modal">
      <div class="victory-body">
        <div class="victory-level-name">${levelName}</div>

        <div class="victory-icon-wrapper">
          <span class="material-symbols-outlined victory-icon">emoji_events</span>
        </div>

        <div class="victory-stars">
          ${[1, 2, 3].map(i => `<span class="material-symbols-outlined star${i <= stars ? ' filled' : ''}">star</span>`).join('')}
        </div>

        <h2 class="victory-title">FASE CONCLUÍDA</h2>

        <div class="victory-rank-section">
          <div class="victory-rank-badge rank-badge-${rankConfig.label}">
            <span class="victory-rank-letter">${rankConfig.label}</span>
          </div>
          <div>
            <div class="victory-rank-label">Classificação</div>
            <div class="victory-rank-name">${rankConfig.label === 'S' ? 'Mestre Supremo' : rankConfig.label === 'A' ? 'Expert' : rankConfig.label === 'B' ? 'Avançado' : 'Iniciante'}</div>
          </div>
        </div>

        <div class="victory-score-breakdown">
          <div class="breakdown-header">CÁLCULO DE XP</div>
          <div class="breakdown-equation">
            <span class="breakdown-base">${baseXP}</span>
            <span class="breakdown-op">×</span>
            <span class="breakdown-rank">${rankConfig.xpMultiplier}×</span>
            <span class="breakdown-op">×</span>
            <span class="breakdown-attr">${attrMultiplier}×</span>
            <span class="breakdown-op">=</span>
            <span class="breakdown-result">${boostedScore}</span>
          </div>
          <div class="breakdown-label">XP base × rank × atributos = XP total</div>
        </div>

        <div class="victory-stats">
          <div class="stat-row">
            <span class="stat-label"><span class="material-symbols-outlined">emoji_events</span> XP Ganho</span>
            <span class="stat-value xp-value">+${boostedScore}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label"><span class="material-symbols-outlined">block</span> Blocos</span>
            <span class="stat-value">${blocksUsed} <span class="stat-dim">/ ${idealBlocks}</span></span>
          </div>
          <div class="stat-row">
            <span class="stat-label"><span class="material-symbols-outlined">timer</span> Tempo</span>
            <span class="stat-value">${timeElapsed}s</span>
          </div>
        </div>

        <div class="victory-xp-bar">
          <div class="victory-xp-fill" id="victory-xp-fill" style="--xp-percent: ${xpPercent}%"></div>
        </div>

        ${unlockCategory ? `
        <div class="victory-unlock-section">
          <div class="victory-unlock-badge">NOVO</div>
          <div class="victory-unlock-content">
            <span class="material-symbols-outlined victory-unlock-icon">${Progression.getCategoryIcon(unlockCategory)}</span>
            <div class="victory-unlock-text">
              <div class="victory-unlock-label">Novo tipo de bloco desbloqueado</div>
              <div class="victory-unlock-name">${Progression.getCategoryLabel(unlockCategory)}</div>
            </div>
          </div>
        </div>
        ` : ''}

      </div>

      <div class="victory-footer">
        <button class="victory-btn" id="victory-retry">Repetir</button>
        ${hasNext ? '<button class="victory-btn victory-btn-primary" id="victory-next">Próxima Fase</button>' : ''}
      </div>
    </div>
  `
  document.body.appendChild(overlay)

  const container = document.querySelector('.game-container')
  if (container) {
    const style = getComputedStyle(container)
    const modal = overlay.querySelector('.victory-modal')
    if (modal) {
      modal.style.setProperty('--victory-accent', style.getPropertyValue('--victory-accent'))
      modal.style.setProperty('--victory-accent-glow', style.getPropertyValue('--victory-accent-glow'))
      modal.style.setProperty('--victory-accent-glow-strong', style.getPropertyValue('--victory-accent-glow-strong'))
    }
  }

  requestAnimationFrame(() => {
    overlay.classList.add('active')
    requestAnimationFrame(() => {
      const fill = overlay.querySelector('#victory-xp-fill')
      if (fill) fill.classList.add('animated')
    })
  })

  return new Promise(resolve => {
    overlay.querySelector('#victory-retry')?.addEventListener('click', () => {
      overlay.classList.remove('active')
      overlay.addEventListener('transitionend', () => { overlay.remove(); resolve('retry') }, { once: true })
    })
    overlay.querySelector('#victory-next')?.addEventListener('click', () => {
      overlay.classList.remove('active')
      overlay.addEventListener('transitionend', () => { overlay.remove(); resolve('next') }, { once: true })
    })
  })
}

function showAttemptFailModal(previousLevelId) {
  const overlay = document.createElement('div')
  overlay.className = 'profile-overlay'
  overlay.innerHTML = `
    <div class="profile-modal">
      <div class="profile-modal-icon-wrapper" style="border-color: var(--error); box-shadow: 0 0 20px rgba(255, 180, 171, 0.2);">
        <span class="material-symbols-outlined profile-modal-icon" style="color: var(--error);">error_outline</span>
      </div>
      <h2 class="profile-modal-title" style="color: var(--error);">NÚCLEO LÓGICO ESGOTADO</h2>
      <p class="profile-modal-text">Suas tentativas acabaram! O código travou e o herói não conseguiu prosseguir.</p>
      <p class="profile-modal-text" style="font-size: 12px; color: var(--outline);">Você será redirecionado à última fase concluída para recuperar sua estabilidade lógica.</p>
      <div class="profile-modal-actions">
        <button class="profile-btn-confirm" id="attempt-fail-ok" style="flex:1; width:100%;">VOLTAR</button>
      </div>
    </div>
  `
  document.body.appendChild(overlay)
  requestAnimationFrame(() => overlay.classList.add('active'))

  return new Promise(resolve => {
    overlay.querySelector('#attempt-fail-ok').addEventListener('click', () => {
      overlay.classList.remove('active')
      overlay.addEventListener('transitionend', () => {
        overlay.remove()
        resolve()
      }, { once: true })
    })
  })
}

async function handleAttemptFailure() {
  const failedLevelId = gs.activeLevelId
  const prevLevelId = gs.progression.getLastCompletedLevel()
  await showAttemptFailModal(prevLevelId)
  if (gs.progression) {
    gs.progression.markLevelFailed(failedLevelId)
    gs.progression.resetAttempts()
  }
  if (gs.attrPanel) gs.attrPanel.refresh()
  loadLevelById(prevLevelId)
  if (gs.workspace) gs.workspace.clear()
  setStatus('Restaurado', '#00FF3D')
}

function withGuard(fn) {
  return async (...args) => {
    if (gs.shouldStop) throw new Error('Execution stopped');
    while (gs.shouldPause && !gs.shouldStop) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (gs.shouldStop) throw new Error('Execution stopped');
    return fn(...args);
  };
}

function initGame() {
  const els = router.currentPage.elements;

  const errorHandler = new GameErrorHandler(els.statusText, els.statusDot);

  if (!errorHandler.checkRequired({
    workspace: els.workspace,
    palette: els.palette,
    simGrid: els.simGrid
  })) {
    errorHandler.showFatalError('Falha ao carregar o jogo: componentes essenciais ausentes');
    return;
  }

  const palette = new BlockPalette(els.palette);
  const workspace = new BlockWorkspace(els.workspace, palette);
  palette.setWorkspace(workspace);
  workspace.restore();
  const player = new Player(5);
  const stage = new Stage(5);

  const playerManager = _getPlayerManager();
  playerManager.refresh();
  const activePlayer = playerManager.getActivePlayer();
  const playerId = activePlayer ? activePlayer.id : 'default';
  const playerName = activePlayer ? activePlayer.name : 'Anônimo';
  const progression = new Progression(playerId, playerName);
  const needsProfile = !activePlayer;

  const attrPanel = els.attrPanel ? new AttributesPanel(els.attrPanel) : null
  if (attrPanel) {
    attrPanel.setProgression(progression)
    attrPanel.setupEvents()
    progression.onPlayerLevelUp((newLevel) => {
      if (attrPanel) attrPanel._playPlayerLevelUp(newLevel)
    })
  }

  const simGrid = els.simGrid;
  const statusDot = els.statusDot;
  const statusText = els.statusText;
  const indicator = els.indicator;

  const errorLog = document.createElement('div');
  errorLog.className = 'error-log';
  els.workspace.appendChild(errorLog);

  if (gs && gs.objectivesPanel) {
    gs.objectivesPanel.destroy();
  }

  const objectivesPanel = new ObjectivesPanel();
  const mountTarget = window.innerWidth <= 767 ? document.body : els.workspace;
  objectivesPanel.mount(mountTarget);

  const enemyInfoPanel = new EnemyInfoPanel(els.enemyInfo, {
    onGlossaryRequest: (enemyName) => {
      document.dispatchEvent(new CustomEvent('enemy:open-glossary', { detail: { enemyName } }));
    }
  });

  gs = {
    workspace, palette, player, stage, progression,
    attrPanel, playerManager, objectivesPanel, enemyInfoPanel,
    simGrid, statusDot, statusText, indicator, errorLog, els,
    activeLevelId: null,
    isRunning: false,
    shouldPause: false,
    shouldStop: false,
    _needsProfile: needsProfile,
  };

  workspace.onError = (msg) => {
    gs.errorLog.innerHTML = '';
    const el = createLogEntry('error', msg);
    gs.errorLog.appendChild(el);
    showErrorLog();
    scheduleErrorFadeOut();
  };

  const _unlockAudio = () => {
    audioManager.unlock();
    document.removeEventListener('click', _unlockAudio);
    document.removeEventListener('keydown', _unlockAudio);
    document.removeEventListener('touchstart', _unlockAudio);
  };
  document.addEventListener('click', _unlockAudio);
  document.addEventListener('keydown', _unlockAudio);
  document.addEventListener('touchstart', _unlockAudio);

  const profileMenu = new ProfileMenu(playerManager, (newPlayerId) => {
    const p = newPlayerId ? playerManager.getActivePlayer() : null;
    gs.progression = new Progression(newPlayerId || 'default', p ? p.name : 'Jogador');
    gs._needsProfile = false;
    if (gs.attrPanel) gs.attrPanel.setProgression(gs.progression)
    if (gs.workspace) gs.workspace.clear();
    gs.palette.filterByUnlocked(gs.progression.getUnlockedCommands());
    gs.progression.onPlayerLevelUp((newLevel) => {
      if (gs.attrPanel) gs.attrPanel._playPlayerLevelUp(newLevel)
    })
    loadCurrentLevel();
  }, () => {
    if (_currentTutorial || _tutorialCompleted) return;
    _currentTutorial = new GameTutorial(onTutorialComplete);
    setTimeout(() => {
      if (_currentTutorial) _currentTutorial.show();
    }, 300);
  }, () => {
    router.navigate('/');
  });
  profileMenu.mount();
  gs.profileMenu = profileMenu;

  const runWithGuard = withGuard;

  if (gs.simGrid) {
    gs.simGrid.addEventListener('mouseover', (e) => {
      const enemyEl = e.target.closest('.sim-enemy');
      if (enemyEl && gs.enemyInfoPanel) {
        gs.enemyInfoPanel.highlightById(enemyEl.dataset.enemyId);
      }
    });
    gs.simGrid.addEventListener('mouseout', (e) => {
      const enemyEl = e.target.closest('.sim-enemy');
      if (enemyEl && gs.enemyInfoPanel) {
        gs.enemyInfoPanel.clearHighlight();
      }
    });
  }

  els.runBtn?.addEventListener('click', async () => {
    if (gs.isRunning) return;

    if (gs._needsProfile) {
      setStatus('Sem perfil', '#ef4444');
      gs.errorLog.innerHTML = '';
      const el = createLogEntry('error', 'Crie ou selecione um perfil antes de jogar!');
      gs.errorLog.appendChild(el);
      showErrorLog();
      return;
    }

    resetActiveLevel();
    gs.isRunning = true;
    gs.shouldPause = false;
    gs.shouldStop = false;
    gs._playerDied = false;
    gs._startTime = Date.now();
    setStatus('Preparando...', '#00f2ff');
    audioManager.playSfx('execute');
    await new Promise(r => setTimeout(r, 500));
    setStatus('Validando...', '#ebb2ff');

    const commands = workspace.getCommandTree();

    if (commands.length === 0) {
      setStatus('Nenhum bloco', '#ebb2ff');
      gs.errorLog.innerHTML = '';
      const el = createLogEntry('warning', 'Adicione blocos ao workspace antes de executar');
      gs.errorLog.appendChild(el);
      showErrorLog();
      scheduleErrorFadeOut();
      gs.isRunning = false;
      return;
    }

    const validation = validateCommands(commands);
    showErrors(validation);

    if (validation.hasErrors()) {
      setStatus('Erro nos comandos', '#ef4444');
      audioManager.playSfx('error');

      const remaining = gs.progression.consumeAttempt()
      if (gs.attrPanel) gs.attrPanel.refresh()

      if (remaining <= 0) {
        gs.isRunning = false
        await handleAttemptFailure()
        return
      }

      gs.isRunning = false;
      return;
    }

    const runtimeValidation = { executedCount: 0, running: false };

    setStatus('Executando...', '#00f2ff');

    const variables = {};

    const handlers = {
      move: runWithGuard(async (cmd) => {
        const steps = Math.max(1, cmd.value || 1);
        for (let i = 0; i < steps; i++) {
          const ahead = player.peekForward();
          if (!stage.canMoveTo(ahead.x, ahead.y)) {
            if (!stage.isInBounds(ahead.x, ahead.y)) {
              audioManager.playSfx('obstacle');
            } else if (stage.isEnemyAt(ahead.x, ahead.y)) {
              audioManager.playSfx('laserBlock');
              player.takeDamage(1);
              updateSimView();
              if (!player.isAlive()) {
                gs.shouldStop = true;
                showGameOver();
              }
            } else if (stage.isObstacleAt(ahead.x, ahead.y)) {
              const obs = stage.obstacles.find(o => o.x === ahead.x && o.y === ahead.y);
              if (obs && obs.type === 'laser') {
                audioManager.playSfx('laserBlock');
                player.takeDamage(1);
                updateSimView();
              } else {
                audioManager.playSfx('obstacle');
              }
            }
            break;
          }
          player.moveForward(1);
          updateSimView();
          if (gs.shouldStop) return;
        }
        if (gs.shouldStop) return;
        await new Promise(r => setTimeout(r, 350));
        tickEnemiesAndSync();
      }),

      turnRight: runWithGuard(async () => {
        player.turnRight();
        updateSimView();
        await new Promise(r => setTimeout(r, 350));
      }),

      turnLeft: runWithGuard(async () => {
        player.turnLeft();
        updateSimView();
        await new Promise(r => setTimeout(r, 350));
      }),

      jump: runWithGuard(async () => {
        const jumpPos = player.peekJump();
        const mid = player.peekForward();
        if (stage.isInBounds(jumpPos.x, jumpPos.y) && stage.isInBounds(mid.x, mid.y)) {
          player.jump();
          updateSimView();
          await new Promise(r => setTimeout(r, 350));
          tickEnemiesAndSync();
        }
      }),

      attack: runWithGuard(async () => {
        stage.attackEnemy();
        syncSimEntities();
        if (gs.enemyInfoPanel) gs.enemyInfoPanel.update(gs.stage.enemies);
        await new Promise(r => setTimeout(r, 350));
      }),

      set_var: runWithGuard(async (cmd) => {
        variables[cmd.varName] = Number(cmd.value) || 0;
        await new Promise(r => setTimeout(r, 350));
      }),

      change_var: runWithGuard(async (cmd) => {
        variables[cmd.varName] = Number(cmd.value) || 0;
        await new Promise(r => setTimeout(r, 350));
      }),

      activate: runWithGuard(async () => {
        stage.activate();
        syncSimObstacles();
        await new Promise(r => setTimeout(r, 350));
      }),

      detectObstacle: runWithGuard(async () => {
        const result = stage.detectObstacleAhead();
        await new Promise(r => setTimeout(r, 350));
        return result;
      }),

      detectEnemy: runWithGuard(async () => {
        const result = stage.detectEnemyNearby();
        await new Promise(r => setTimeout(r, 350));
        return result;
      })
    };

    const cmdEventTarget = new EventTarget();

    cmdEventTarget.addEventListener('command:start', e => {
      executingBlockIds.add(e.detail.blockId);
      updateBlockHighlights();
    });

    cmdEventTarget.addEventListener('command:end', e => {
      executingBlockIds.delete(e.detail.blockId);
      updateBlockHighlights();
    });

    try {
      await runCommands(commands, {
        handlers,
        delayMs: 500,
        eventTarget: cmdEventTarget,
        validation: runtimeValidation,
        variables
      });

      await new Promise(r => setTimeout(r, 200));

      gs.stage.finalizeSurviveObjective();
      if (gs.objectivesPanel) {
        gs.objectivesPanel.updateState(gs.stage.getCompletedObjectiveIds());
      }

      if (stage.checkVictory()) {
        setStatus('Vitória!', '#00FF3D');
        audioManager.playSfx('victory');

        const levelId = gs.activeLevelId
        const level = getLevel(levelId)
        const blocksUsed = countBlocksInTree(commands)
        const idealBlocks = level ? level.idealBlockCount : 10

        const rankConfig = AttributeSystem.calculateRank(blocksUsed, idealBlocks)
        const effMultiplier = rankConfig.xpMultiplier

        const baseXP = level ? Math.max(50, (level.id + 1) * 25 + level.difficulty * 40 + level.complexity * 15) : 50
        const finalScore = Math.round(baseXP * effMultiplier)

        const attrMultiplier = AttributeSystem.getXpMultiplier(
          gs.progression.getAttribute('eficienciaAlgoritmo').level
        )
        const boostedScore = Math.round(finalScore * attrMultiplier)

        const timeElapsed = Math.floor((Date.now() - (gs._startTime || Date.now())) / 1000)
        const unlockCategory = gs.progression.completeLevel(levelId, boostedScore, blocksUsed, idealBlocks, rankConfig.label, timeElapsed)

        if (gs.attrPanel) {
          gs.attrPanel.setLastRank(rankConfig.label)
          gs.attrPanel.refresh()
        }

        const lvl = getLevel(gs.activeLevelId + 1)
        const hasNext = lvl && lvl.id <= gs.progression.getCurrentLevel()

        if (_errorFadeTimeout) { clearTimeout(_errorFadeTimeout); _errorFadeTimeout = null; }
        gs.errorLog.innerHTML = ''
        gs.errorLog.style.display = 'none'
        gs.errorLog.classList.remove('fade-out')

        const action = await showVictoryModal({
          rankConfig,
          blocksUsed,
          idealBlocks,
          boostedScore,
          baseXP,
          attrMultiplier,
          timeElapsed,
          hasNext,
          levelName: level ? level.name : 'Fase Desconhecida',
          unlockCategory
        })

        if (gs.progression) gs.progression.resetAttempts()
        if (gs.attrPanel) gs.attrPanel.refresh()

        if (action === 'next' && hasNext) {
          loadLevelById(gs.activeLevelId + 1)
        } else {
          resetActiveLevel()
        }
        workspace.clear()
      } else {
        setStatus('Tente novamente', '#ef4444');
        const remaining = gs.progression.consumeAttempt()
        if (gs.attrPanel) gs.attrPanel.refresh()
        if (remaining <= 0) {
          gs.isRunning = false
          await handleAttemptFailure()
          return
        }
      }
    } catch (error) {
      if (gs._playerDied) {
        const remaining = gs.progression.consumeAttempt()
        if (gs.attrPanel) gs.attrPanel.refresh()
        if (remaining <= 0) {
          const overlay = document.querySelector('.game-over-overlay');
          if (overlay) overlay.remove();
          gs._playerDied = false;
          gs.shouldStop = false;
          gs.isRunning = false;
          await handleAttemptFailure()
          return
        }
      } else if (error.message === 'Execution stopped') {
        setStatus('Interrompido', '#ebb2ff');
      } else if (error.message === 'Command limit exceeded') {
        audioManager.playSfx('error');
        setStatus('Limite de comandos excedido', '#ef4444');
        gs.errorLog.innerHTML = '';
        const el = createLogEntry('error', 'Limite de ' + MAX_TOTAL_COMMANDS + ' comandos excedido. Possível loop infinito.');
        gs.errorLog.appendChild(el);
        showErrorLog();
        scheduleErrorFadeOut();
      } else {
        audioManager.playSfx('error');
        setStatus('Erro', '#ef4444');
        const remaining = gs.progression.consumeAttempt()
        if (gs.attrPanel) gs.attrPanel.refresh()
        if (remaining <= 0) {
          gs.isRunning = false
          await handleAttemptFailure()
          return
        }
      }
    }

    executingBlockIds.clear();
    updateBlockHighlights();
    gs.isRunning = false;
  });

  els.clearBtn?.addEventListener('click', () => {
    gs.shouldStop = true;
    gs._playerDied = false;
    workspace.clear();
    resetActiveLevel(true);
    setStatus('Pronto', '#00FF3D');
    if (gs.objectivesPanel) gs.objectivesPanel.reset();
  });

  els.pauseBtn?.addEventListener('click', () => {
    if (!gs.isRunning) return;
    gs.shouldPause = !gs.shouldPause;
    setStatus(gs.shouldPause ? 'Pausado' : 'Executando...', gs.shouldPause ? '#ebb2ff' : '#00f2ff');
  });

  const muteBtn = document.querySelector('.btn-mute');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const muted = audioManager.toggleMute();
      muteBtn.classList.toggle('muted', muted);
      const icon = muteBtn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = muted ? 'volume_off' : 'volume_up';
      if (!muted) {
        const levelId = gs.activeLevelId ?? getInitialLevelId();
        const level = getLevel(levelId);
        if (level) audioManager.playMusic(level.theme || 'ocean');
      }
    });
  }



  if (gs.simGrid) {
    let _suppressResize = false;
    const ro = new ResizeObserver(() => {
      if (_suppressResize) return;
      if (gs && gs.stage && gs.simGrid && !gs.isRunning && gs.activeLevelId !== null) {
        const level = getLevel(gs.activeLevelId);
        if (level) {
          _suppressResize = true;
          renderSimGrid(level);
          updateSimView();
          requestAnimationFrame(() => {
            _suppressResize = false;
          });
        }
      }
    });
    ro.observe(gs.simGrid);
    gs._resizeObserver = ro;
  }

  if (!gs._needsProfile) loadCurrentLevel();
}

let _gameInitialized = false;
let _currentTutorial = null;
let _tutorialCompleted = false;
let _errorFadeTimeout = null;

function onTutorialComplete() {
  _currentTutorial = null;
  _tutorialCompleted = true;
  if (gs && gs.profileMenu) {
    const players = gs.playerManager.getPlayers();
    if (players.length === 0) {
      gs.profileMenu.showAddPlayer();
    } else if (!gs.playerManager.getActivePlayer()) {
      gs.profileMenu.showPlayerList();
    }
  }
}

document.addEventListener('game:ready', () => {
  initGame();

  const players = gs.playerManager.getPlayers();
  const activePlayer = gs.playerManager.getActivePlayer();

  if (!_tutorialCompleted && (players.length === 0 || (activePlayer && gs.progression.completedLevels.length === 0))) {
    _currentTutorial = new GameTutorial(onTutorialComplete);
    setTimeout(() => {
      if (_currentTutorial) _currentTutorial.show();
    }, 300);
  } else if (!activePlayer) {
    gs.profileMenu.showPlayerList();
  }

  _gameInitialized = true;
});

document.addEventListener(ROUTE_CHANGE, (e) => {
  if (_currentTutorial && e.detail.path !== '/game') {
    _currentTutorial.hide();
    _currentTutorial = null;
  }

  if (e.detail.path !== '/game') {
    audioManager.fadeOut(500);
  }

  if (e.detail.path !== '/game' && e.detail.path !== '/levels') {
    if (gs) {
      if (gs._resizeObserver) gs._resizeObserver.disconnect();
      if (gs.profileMenu) gs.profileMenu.destroy();
      if (gs.objectivesPanel) gs.objectivesPanel.destroy();
      if (gs.enemyInfoPanel) gs.enemyInfoPanel.destroy();
    }
    _gameInitialized = false;
    gs = null;
  }

  // Profile lifecycle: landing vs others
  if (e.detail.path === '/') {
    _mountProfileForLanding();
  } else {
    _destroyProfile();
  }
});

function _migrateLegacyData() {
  const oldRaw = localStorage.getItem('codequest_ranking');
  if (!oldRaw) return;
  try {
    const parsed = JSON.parse(oldRaw);
    if (typeof parsed !== 'object' || !parsed) return;
    if (parsed.currentLevel === undefined && !parsed.ranking) return;
    if (localStorage.getItem('codequest_players')) return;

    const name = localStorage.getItem('codequest_player_name') || 'Jogador 1';
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    const players = [{ id, name, createdAt: new Date().toISOString() }];
    localStorage.setItem('codequest_players', JSON.stringify(players));
    localStorage.setItem('codequest_active_player', id);

    localStorage.setItem(`codequest_player_${id}`, JSON.stringify({
      currentLevel: parsed.currentLevel || 0,
      completedLevels: parsed.completedLevels || [],
      unlockedCommands: parsed.unlockedCommands || [],
      totalXP: parsed.totalXP || 0
    }));

    localStorage.setItem('codequest_ranking', JSON.stringify(parsed.ranking || []));
    localStorage.removeItem('codequest_player_name');
  } catch { }
}

_migrateLegacyData();
router.start();
