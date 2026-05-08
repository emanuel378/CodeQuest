import { validateCommands, MAX_TOTAL_COMMANDS } from './validator.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const MAX_REPEAT = 100;
const MAX_WHILE = 200;

const CONDITION_HANDLER_MAP = {
  obstacleDetected: 'detectObstacle',
  enemyDetected: 'detectEnemy'
};

const DEFAULT_HANDLERS = {
  move: async () => {},
  turnRight: async () => {},
  turnLeft: async () => {},
  jump: async () => {},
  attack: async () => {},
  pickup: async () => {},
  drop: async () => {},
  activate: async () => {},
  detectObstacle: async () => false,
  detectEnemy: async () => false
};

function getSensorHandler(handlers, condition) {
  const handlerName = CONDITION_HANDLER_MAP[condition] || 'detectObstacle';
  return handlers[handlerName] || handlers.detectObstacle || DEFAULT_HANDLERS.detectObstacle;
}

export async function runCommands(commands, options = {}) {
  const {
    handlers = {},
    delayMs = 500,
    eventTarget = new EventTarget(),
    validation = null
  } = options;

  const allHandlers = { ...DEFAULT_HANDLERS, ...handlers };

  if (!Array.isArray(commands)) {
    throw new Error('Commands must be an array');
  }

  if (validation) {
    validation.running = true;
    validation.executedCount = 0;
  }

  for (const command of commands) {
    try {
      await executeCommand(command, allHandlers, delayMs, eventTarget, validation);
    } catch (error) {
      if (error.message === 'Execution stopped') throw error;
      if (error.message === 'Command limit exceeded') throw error;
      console.error(`Error executing command:`, error);
      eventTarget.dispatchEvent(new CustomEvent('command:error', {
        detail: { command, error }
      }));
    }
  }

  if (validation) validation.running = false;

  return eventTarget;
}

async function executeCommand(cmd, handlers, delayMs, eventTarget, validation) {
  if (!cmd || !cmd.type) {
    console.error('Invalid command:', cmd);
    return;
  }

  if (validation) {
    validation.executedCount = (validation.executedCount || 0) + 1;
    if (validation.executedCount > MAX_TOTAL_COMMANDS) {
      throw new Error('Command limit exceeded');
    }
  }

  eventTarget.dispatchEvent(new CustomEvent('command:start', {
    detail: { command: cmd.type, blockId: cmd._blockId }
  }));

  switch (cmd.type) {
    case 'if':
      await executeIf(cmd, handlers, delayMs, eventTarget, validation);
      break;
    case 'repeat':
      await executeRepeat(cmd, handlers, delayMs, eventTarget, validation);
      break;
    case 'while':
      await executeWhile(cmd, handlers, delayMs, eventTarget, validation);
      break;
    default:
      if (handlers[cmd.type]) {
        await handlers[cmd.type](cmd);
      }
      break;
  }

  await delay(delayMs);

  eventTarget.dispatchEvent(new CustomEvent('command:end', {
    detail: { command: cmd.type, blockId: cmd._blockId }
  }));
}

async function executeIf(cmd, handlers, delayMs, eventTarget, validation) {
  const condition = cmd.condition || 'obstacleDetected';
  const sensorHandler = getSensorHandler(handlers, condition);
  let result = false;

  try {
    result = await sensorHandler();
  } catch (e) {
    if (e.message === 'Execution stopped' || e.message === 'Command limit exceeded') throw e;
    console.error(`Error evaluating condition "${condition}":`, e);
  }

  const branch = result ? cmd.children : cmd.elseChildren;
  if (branch && branch.length > 0) {
    for (const child of branch) {
      await executeCommand(child, handlers, delayMs, eventTarget, validation);
    }
  }
}

async function executeRepeat(cmd, handlers, delayMs, eventTarget, validation) {
  const count = Math.min(cmd.value || 1, MAX_REPEAT);
  if (!cmd.children || cmd.children.length === 0) return;

  for (let i = 0; i < count; i++) {
    for (const child of cmd.children) {
      await executeCommand(child, handlers, delayMs, eventTarget, validation);
    }
  }
}

async function executeWhile(cmd, handlers, delayMs, eventTarget, validation) {
  const condition = cmd.condition || 'obstacleDetected';
  const sensorHandler = getSensorHandler(handlers, condition);
  if (!cmd.children || cmd.children.length === 0) return;

  let iterations = 0;
  let shouldContinue = true;

  while (shouldContinue && iterations < MAX_WHILE) {
    try {
      shouldContinue = await sensorHandler();
    } catch (e) {
      if (e.message === 'Execution stopped' || e.message === 'Command limit exceeded') throw e;
      console.error(`Error evaluating condition "${condition}":`, e);
      break;
    }

    if (!shouldContinue) break;

    for (const child of cmd.children) {
      await executeCommand(child, handlers, delayMs, eventTarget, validation);
    }

    iterations++;
  }

  if (iterations >= MAX_WHILE) {
    console.warn(`While loop atingiu o limite de ${MAX_WHILE} iterações.`);
    eventTarget.dispatchEvent(new CustomEvent('command:limit', {
      detail: { type: 'while', limit: MAX_WHILE }
    }));
  }
}
