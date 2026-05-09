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

let gs = null;

// --- Profile compartilhado (landing + game) ---
let _playerManager = null;
let _profileMenu = null;

function _getPlayerManager() {
  if (!_playerManager) _playerManager = new PlayerManager();
  return _playerManager;
}

function _mountProfileForLanding() {
  _destroyProfile();
  _profileMenu = new ProfileMenu(_getPlayerManager(), () => {}, () => {});
  _profileMenu.mount();
}

function _destroyProfile() {
  if (_profileMenu) {
    _profileMenu.destroy();
    _profileMenu = null;
  }
}

function loadCurrentLevel() {
  const levelId = gs.progression.getCurrentLevel();
function getInitialLevelId() {
  const pendingId = consumePendingLevelId();
  const levelId = pendingId !== null ? pendingId : gs.progression.getCurrentLevel();
  if (getLevel(levelId)) return levelId;
  for (let fallbackId = levelId - 1; fallbackId >= 0; fallbackId--) {
    if (getLevel(fallbackId)) return fallbackId;
  }
  return 0;
}

function loadLevelById(levelId) {
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
  gs.stage.loadLevel(level);
  gs.stage.setPlayer(gs.player);
  gs.player.reset(
    level.playerStart.x,
    level.playerStart.y,
    level.playerStart.direction
  );
  gs.player.gridSize = level.gridSize;

  const container = document.querySelector('.game-container');
  if (container) {
    const cls = level.theme || 'ocean';
    container.className = `game-container theme-${cls}`;
  }

  if (gs.indicator) gs.indicator.textContent = `Nível ${level.id}: ${level.name}`;

  renderSimGrid(level);
  gs.palette.filterByUnlocked(gs.progression.getUnlockedCommands());
  setStatus('Pronto', '#00FF3D');
}

function loadCurrentLevel() {
  loadLevelById(getInitialLevelId());
}

function resetActiveLevel() {
  const levelId = gs.activeLevelId ?? getInitialLevelId();
  loadLevelById(levelId);
}

function renderSimGrid(level) {
  if (!gs.simGrid) return;

  gs.simGrid.innerHTML = '';
  gs.simGrid.style.backgroundSize = `${100 / level.gridSize}px ${100 / level.gridSize}px`;
  gs.simGrid.style.backgroundImage = `
    linear-gradient(rgba(0, 242, 255, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.2) 1px, transparent 1px)
  `;

  const cellW = gs.simGrid.offsetWidth / level.gridSize;
  if (!cellW || cellW <= 0) return;

  for (const obs of (level.obstacles || [])) {
    const el = document.createElement('div');
    el.className = `sim-entity sim-obstacle sim-${obs.type || 'rock'}`;
    el.dataset.x = obs.x;
    el.dataset.y = obs.y;
    el.style.left = `${obs.x * cellW}px`;
    el.style.top = `${obs.y * cellW}px`;
    el.style.width = `${cellW}px`;
    el.style.height = `${cellW}px`;
    gs.simGrid.appendChild(el);

    if (obs.type === 'tree') {
      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.textContent = 'forest';
      el.appendChild(icon);
    } else if (obs.type === 'rock') {
      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.textContent = 'boulder';
      el.appendChild(icon);
    }
  }

  for (const enemy of (level.enemies || [])) {
    const el = document.createElement('div');
    el.className = 'sim-entity sim-enemy';
    el.dataset.x = enemy.x;
    el.dataset.y = enemy.y;
    el.dataset.hp = enemy.hp || 1;
    el.style.left = `${enemy.x * cellW}px`;
    el.style.top = `${enemy.y * cellW}px`;
    el.style.width = `${cellW}px`;
    el.style.height = `${cellW}px`;

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'bug_report';
    el.appendChild(icon);

    const hpLabel = document.createElement('span');
    hpLabel.className = 'enemy-hp';
    hpLabel.textContent = `HP:${enemy.hp || 1}`;
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

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'flag';
    el.appendChild(icon);

    gs.simGrid.appendChild(el);
  }

  const robot = document.createElement('div');
  robot.className = 'sim-robot';
  robot.style.transition = 'none';
  const robotIcon = document.createElement('span');
  robotIcon.className = 'material-symbols-outlined';
  robotIcon.textContent = 'smart_toy';
  robot.appendChild(robotIcon);
  gs.player.__robotEl = robot;
  gs.simGrid.appendChild(robot);

  updateSimView();
  requestAnimationFrame(() => {
    robot.style.transition = '';
  });
}

function updateSimView() {
  const robot = gs.player.__robotEl;
  if (!robot || !gs.simGrid) return;
  const cellSize = gs.simGrid.offsetWidth / gs.stage.gridSize;

  robot.style.left = `${gs.player.x * cellSize + cellSize * 0.15}px`;
  robot.style.top = `${gs.player.y * cellSize + cellSize * 0.15}px`;
  robot.style.width = `${cellSize * 0.7}px`;
  robot.style.height = `${cellSize * 0.7}px`;

  robot.style.transform = `rotate(${gs.player.direction * 90}deg)`;
}

function syncSimEntities() {
  for (const el of gs.simGrid.querySelectorAll('.sim-enemy')) {
    const ex = parseInt(el.dataset.x);
    const ey = parseInt(el.dataset.y);
    const enemy = gs.stage.enemies.find(e => e.x === ex && e.y === ey);
    if (!enemy) {
      el.remove();
    } else {
      const hpEl = el.querySelector('.enemy-hp');
      if (hpEl) hpEl.textContent = `HP:${enemy.hp}`;
    }
  }
}

function highlightWorkspaceBlock(blockId) {
  for (const b of gs.workspace.blocks.values()) {
    b.el.classList.toggle('executing', b.id === blockId);
  }
}

function setStatus(text, color = 'var(--on-surface-variant)') {
  if (gs.statusText) gs.statusText.textContent = text;
  if (gs.statusDot) {
    gs.statusDot.style.background = color;
    gs.statusDot.style.boxShadow = `0 0 8px ${color}`;
  }
}

function showErrors(validation) {
  gs.errorLog.innerHTML = '';
  if (!validation || (!validation.hasErrors() && !validation.hasWarnings())) {
    gs.errorLog.style.display = 'none';
    return;
  }
  gs.errorLog.style.display = 'flex';

  for (const msg of validation.getAllMessages()) {
    const el = document.createElement('div');
    el.className = `log-entry log-${msg.type}`;
    el.textContent = msg.type === 'error' ? '✕ ' : '⚠ ';
    const span = document.createElement('span');
    span.textContent = msg.message;
    el.appendChild(span);
    gs.errorLog.appendChild(el);
  }
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

  const workspace = new BlockWorkspace(els.workspace);
  const palette = new BlockPalette(els.palette);
  const player = new Player(5);
  const stage = new Stage(5);

  const playerManager = _getPlayerManager();
  const activePlayer = playerManager.getActivePlayer();
  const playerId = activePlayer ? activePlayer.id : 'default';
  const playerName = activePlayer ? activePlayer.name : 'Anônimo';
  const progression = new Progression(playerId, playerName);
  const needsProfile = !activePlayer;

  const simGrid = els.simGrid;
  const statusDot = els.statusDot;
  const statusText = els.statusText;
  const indicator = els.indicator;

  const errorLog = document.createElement('div');
  errorLog.className = 'error-log';
  document.querySelector('.simulation-panel')?.appendChild(errorLog);

  gs = {
    workspace, palette, player, stage, progression,
    playerManager,
    simGrid, statusDot, statusText, indicator, errorLog, els,
    activeLevelId: null,
    isRunning: false,
    shouldPause: false,
    shouldStop: false,
    _needsProfile: needsProfile,
  };

  const profileMenu = new ProfileMenu(playerManager, (newPlayerId) => {
    const p = newPlayerId ? playerManager.getActivePlayer() : null;
    gs.progression = new Progression(newPlayerId || 'default', p ? p.name : 'Jogador');
    gs._needsProfile = false;
    if (gs.workspace) gs.workspace.clear();
    gs.palette.filterByUnlocked(gs.progression.getUnlockedCommands());
    loadCurrentLevel();
  }, () => {
    if (_currentTutorial) return;
    _currentTutorial = new GameTutorial(onTutorialComplete);
    setTimeout(() => {
      if (_currentTutorial) _currentTutorial.show();
    }, 300);
  });
  profileMenu.mount();
  gs.profileMenu = profileMenu;

  const runWithGuard = withGuard;

  els.runBtn?.addEventListener('click', async () => {
    if (gs.isRunning) return;

    if (gs._needsProfile) {
      setStatus('Sem perfil', '#ef4444');
      gs.errorLog.innerHTML = '';
      const el = document.createElement('div');
      el.className = 'log-entry log-error';
      el.innerHTML = '<span>✕ Crie ou selecione um perfil antes de jogar!</span>';
      gs.errorLog.appendChild(el);
      gs.errorLog.style.display = 'flex';
      return;
    }

    resetActiveLevel();
    gs.isRunning = true;
    gs.shouldPause = false;
    gs.shouldStop = false;
    setStatus('Preparando...', '#00f2ff');
    await new Promise(r => setTimeout(r, 500));
    setStatus('Validando...', '#ebb2ff');

    const commands = workspace.getCommandTree();
    console.log('Commands:', JSON.stringify(commands, null, 2));

    const validation = validateCommands(commands);
    showErrors(validation);

    if (validation.hasErrors()) {
      setStatus('Erro nos comandos', '#ef4444');
      gs.isRunning = false;
      return;
    }

    const runtimeValidation = { executedCount: 0, running: false };

    setStatus('Executando...', '#00f2ff');

    const handlers = {
      move: runWithGuard(async (cmd) => {
        const steps = Math.max(1, cmd.value || 1);
        for (let i = 0; i < steps; i++) {
          const ahead = player.peekForward();
          if (!stage.canMoveTo(ahead.x, ahead.y)) break;
          player.moveForward(1);
          updateSimView();
        }
      }),

      turnRight: runWithGuard(async () => {
        player.turnRight();
        updateSimView();
      }),

      turnLeft: runWithGuard(async () => {
        player.turnLeft();
        updateSimView();
      }),

      jump: runWithGuard(async () => {
        const jumpPos = player.peekJump();
        const mid = player.peekForward();
        if (stage.isInBounds(jumpPos.x, jumpPos.y) && stage.isInBounds(mid.x, mid.y)) {
          player.jump();
          updateSimView();
        }
      }),

      attack: runWithGuard(async () => {
        stage.attackEnemy();
        syncSimEntities();
      }),

      pickup: runWithGuard(async () => {
        stage.pickupItem();
      }),

      drop: runWithGuard(async () => {
        stage.dropItem();
      }),

      activate: runWithGuard(async () => {
        return;
      }),

      detectObstacle: runWithGuard(async () => {
        return stage.detectObstacleAhead();
      }),

      detectEnemy: runWithGuard(async () => {
        return stage.detectEnemyNearby(3);
      })
    };

    const cmdEventTarget = new EventTarget();

    cmdEventTarget.addEventListener('command:start', e => {
      highlightWorkspaceBlock(e.detail.blockId);
    });

    cmdEventTarget.addEventListener('command:end', e => {
      highlightWorkspaceBlock(null);
    });

    try {
      await runCommands(commands, {
        handlers,
        delayMs: 500,
        eventTarget: cmdEventTarget,
        validation: runtimeValidation
      });

      await new Promise(r => setTimeout(r, 200));

      if (stage.checkVictory()) {
        setStatus('Vitória!', '#00FF3D');
        gs.progression.completeLevel(gs.progression.getCurrentLevel(), 1000);
        setTimeout(() => {
          const nextLevel = getLevel(gs.activeLevelId + 1);
          if (nextLevel && nextLevel.id <= gs.progression.getCurrentLevel()) {
            loadLevelById(nextLevel.id);
          } else {
            resetActiveLevel();
          }
          workspace.clear();
        }, 1500);
      } else {
        setStatus('Tente novamente', '#ef4444');
      }
    } catch (error) {
      if (error.message === 'Execution stopped') {
        setStatus('Interrompido', '#ebb2ff');
      } else if (error.message === 'Command limit exceeded') {
        setStatus('Limite de comandos excedido', '#ef4444');
        const el = document.createElement('div');
        el.className = 'log-entry log-error';
        el.innerHTML = '<span>✕ Limite de ' + MAX_TOTAL_COMMANDS + ' comandos excedido. Possível loop infinito.</span>';
        errorLog.appendChild(el);
        errorLog.style.display = 'flex';
      } else {
        console.error('Execution error:', error);
        setStatus('Erro', '#ef4444');
      }
    }

    highlightWorkspaceBlock(-1);
    gs.isRunning = false;
  });

  els.clearBtn?.addEventListener('click', () => {
    gs.shouldStop = true;
    workspace.clear();
    resetActiveLevel();
    setStatus('Pronto', '#00FF3D');
  });

  els.pauseBtn?.addEventListener('click', () => {
    if (!gs.isRunning) return;
    gs.shouldPause = !gs.shouldPause;
    setStatus(gs.shouldPause ? 'Pausado' : 'Executando...', gs.shouldPause ? '#ebb2ff' : '#00f2ff');
  });

  if (els.simViewport) {
    const ro = new ResizeObserver(() => {
      if (gs && gs.stage && gs.simGrid && !gs.isRunning) {
        updateSimView();
      }
    });
    ro.observe(els.simViewport);
    gs._resizeObserver = ro;
  }

  if (!gs._needsProfile) loadCurrentLevel();
}

let _gameInitialized = false;
let _currentTutorial = null;

function onTutorialComplete() {
  _currentTutorial = null;
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

  if (players.length === 0) {
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

  // Clean up game state when leaving game page
  if (e.detail.path !== '/game' && e.detail.path !== '/levels') {
    if (gs && gs.profileMenu) gs.profileMenu.destroy();
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
