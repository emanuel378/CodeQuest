import { runCommands } from './engine/runner.js';
import { validateCommands, MAX_TOTAL_COMMANDS } from './engine/validator.js';
import { BlockWorkspace } from './ui/blockWorkspace.js';
import { BlockPalette } from './ui/blockPalette.js';
import { Player } from './actors/player.js';
import { Stage } from './stage/stage.js';
import { getLevel } from './game/levels.js';
import { Progression } from './game/progression.js';

const workspaceEl = document.getElementById('workspace');
const paletteEl = document.getElementById('palette');

const workspace = new BlockWorkspace(workspaceEl);
const palette = new BlockPalette(paletteEl);

const player = new Player(5);
const stage = new Stage(5);
const progression = new Progression();

const simGrid = document.querySelector('.sim-grid');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const runButton = document.querySelector('.btn-executar');
const clearButton = document.querySelector('.btn-limpar');
const pauseButton = document.querySelector('.btn-pausar');

let isRunning = false;
let shouldPause = false;
let shouldStop = false;

function loadCurrentLevel() {
  const levelId = progression.getCurrentLevel();
  const level = getLevel(levelId);
  if (!level) return;

  stage.loadLevel(level);
  stage.setPlayer(player);
  player.reset(
    level.playerStart.x,
    level.playerStart.y,
    level.playerStart.direction
  );

  const indicator = document.querySelector('.level-indicator');
  if (indicator) indicator.textContent = `Nível ${level.id}: ${level.name}`;

  renderSimGrid(level);
  palette.filterByUnlocked(progression.getUnlockedCommands());
  setStatus('Pronto', '#00FF3D');
}

function renderSimGrid(level) {
  if (!simGrid) return;

  simGrid.innerHTML = '';
  simGrid.style.backgroundSize = `${100 / level.gridSize}px ${100 / level.gridSize}px`;
  simGrid.style.backgroundImage = `
    linear-gradient(rgba(0, 242, 255, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.2) 1px, transparent 1px)
  `;

  const cellW = simGrid.offsetWidth / level.gridSize;

  for (const obs of (level.obstacles || [])) {
    const el = document.createElement('div');
    el.className = `sim-entity sim-obstacle sim-${obs.type || 'rock'}`;
    el.dataset.x = obs.x;
    el.dataset.y = obs.y;
    el.style.left = `${obs.x * cellW}px`;
    el.style.top = `${obs.y * cellW}px`;
    el.style.width = `${cellW}px`;
    el.style.height = `${cellW}px`;
    simGrid.appendChild(el);

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

    simGrid.appendChild(el);
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

    simGrid.appendChild(el);
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

    simGrid.appendChild(el);
  }

  const robot = document.createElement('div');
  robot.className = 'sim-robot';
  const robotIcon = document.createElement('span');
  robotIcon.className = 'material-symbols-outlined';
  robotIcon.textContent = 'smart_toy';
  robot.appendChild(robotIcon);
  simGrid.appendChild(robot);

  player.__robotEl = robot;
  updateSimView();
}

function updateSimView() {
  const robot = player.__robotEl;
  if (!robot || !simGrid) return;
  const cellSize = simGrid.offsetWidth / stage.gridSize;

  robot.style.left = `${player.x * cellSize + cellSize * 0.15}px`;
  robot.style.top = `${player.y * cellSize + cellSize * 0.15}px`;
  robot.style.width = `${cellSize * 0.7}px`;
  robot.style.height = `${cellSize * 0.7}px`;

  robot.style.transform = `rotate(${player.direction * 90}deg)`;
}

function syncSimEntities() {
  for (const el of simGrid.querySelectorAll('.sim-enemy')) {
    const ex = parseInt(el.dataset.x);
    const ey = parseInt(el.dataset.y);
    const enemy = stage.enemies.find(e => e.x === ex && e.y === ey);
    if (!enemy) {
      el.remove();
    } else {
      const hpEl = el.querySelector('.enemy-hp');
      if (hpEl) hpEl.textContent = `HP:${enemy.hp}`;
    }
  }
}

function highlightWorkspaceBlock(index) {
  const chains = workspace.getAllBlocks();
  let i = 0;
  for (const chain of chains) {
    for (const block of chain) {
      block.el.classList.toggle('executing', i === index);
      i++;
    }
  }
}

function setStatus(text, color = 'var(--on-surface-variant)') {
  if (statusText) statusText.textContent = text;
  if (statusDot) {
    statusDot.style.background = color;
    statusDot.style.boxShadow = `0 0 8px ${color}`;
  }
}

const errorLog = document.createElement('div');
errorLog.className = 'error-log';
document.querySelector('.simulation-panel')?.appendChild(errorLog);

function showErrors(validation) {
  errorLog.innerHTML = '';
  if (!validation || (!validation.hasErrors() && !validation.hasWarnings())) {
    errorLog.style.display = 'none';
    return;
  }
  errorLog.style.display = 'flex';

  for (const msg of validation.getAllMessages()) {
    const el = document.createElement('div');
    el.className = `log-entry log-${msg.type}`;
    el.textContent = msg.type === 'error' ? '✕ ' : '⚠ ';
    const span = document.createElement('span');
    span.textContent = msg.message;
    el.appendChild(span);
    errorLog.appendChild(el);
  }
}

const withGuard = (fn) => async (...args) => {
  if (shouldStop) throw new Error('Execution stopped');
  while (shouldPause && !shouldStop) {
    await new Promise(r => setTimeout(r, 100));
  }
  if (shouldStop) throw new Error('Execution stopped');
  return fn(...args);
};

runButton?.addEventListener('click', async () => {
  if (isRunning) return;

  loadCurrentLevel();
  isRunning = true;
  shouldPause = false;
  shouldStop = false;
  setStatus('Validando...', '#ebb2ff');

  const commands = workspace.getCommandTree();
  console.log('Commands:', JSON.stringify(commands, null, 2));

  const validation = validateCommands(commands);
  showErrors(validation);

  if (validation.hasErrors()) {
    setStatus('Erro nos comandos', '#ef4444');
    isRunning = false;
    return;
  }

  const runtimeValidation = { executedCount: 0, running: false };

  setStatus('Executando...', '#00f2ff');

  const handlers = {
    move: withGuard(async (cmd) => {
      const steps = Math.max(1, cmd.value || 1);
      for (let i = 0; i < steps; i++) {
        const ahead = player.peekForward();
        if (!stage.canMoveTo(ahead.x, ahead.y)) break;
        player.moveForward(1);
        updateSimView();
      }
    }),

    turnRight: withGuard(async () => {
      player.turnRight();
      updateSimView();
    }),

    turnLeft: withGuard(async () => {
      player.turnLeft();
      updateSimView();
    }),

    jump: withGuard(async () => {
      const jumpPos = player.peekJump();
      const mid = player.peekForward();
      if (stage.isInBounds(jumpPos.x, jumpPos.y) && stage.isInBounds(mid.x, mid.y)) {
        player.jump();
        updateSimView();
      }
    }),

    attack: withGuard(async () => {
      stage.attackEnemy();
      syncSimEntities();
    }),

    pickup: withGuard(async () => {
      stage.pickupItem();
    }),

    drop: withGuard(async () => {
      stage.dropItem();
    }),

    activate: withGuard(async () => {
      return;
    }),

    detectObstacle: withGuard(async () => {
      return stage.detectObstacleAhead();
    }),

    detectEnemy: withGuard(async () => {
      return stage.detectEnemyNearby(3);
    })
  };

  const cmdEventTarget = new EventTarget();

  cmdEventTarget.addEventListener('command:start', e => {
    highlightWorkspaceBlock(-1);
  });

  cmdEventTarget.addEventListener('command:end', e => {
    highlightWorkspaceBlock(-1);
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
      progression.completeLevel(progression.getCurrentLevel(), 1000);
      setTimeout(() => {
        loadCurrentLevel();
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
  isRunning = false;
});

clearButton?.addEventListener('click', () => {
  shouldStop = true;
  workspace.clear();
  loadCurrentLevel();
  setStatus('Pronto', '#00FF3D');
});

pauseButton?.addEventListener('click', () => {
  if (!isRunning) return;
  shouldPause = !shouldPause;
  setStatus(shouldPause ? 'Pausado' : 'Executando...', shouldPause ? '#ebb2ff' : '#00f2ff');
});

loadCurrentLevel();
