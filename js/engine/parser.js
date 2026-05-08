export function parseCommands() {
  const workspace = document.getElementById('workspace');
  if (!workspace) return [];

  const stack = workspace.querySelector('.logic-stack');
  if (!stack) return [];

  const commands = [];
  const topBlocks = stack.children;

  for (const block of topBlocks) {
    const cmd = parseBlock(block);
    if (cmd) commands.push(cmd);
  }

  return commands;
}

function parseBlock(el) {
  const wrapper = el.closest('.ws-block-wrapper');
  if (wrapper) {
    return parseControlBlock(wrapper);
  }

  const command = el.dataset?.command;
  if (!command) return null;

  const cmd = { type: command };

  const input = el.querySelector('.block-input');
  if (input) {
    const val = parseInt(input.value, 10);
    if (!isNaN(val)) cmd.value = val;
  }

  return cmd;
}

function parseControlBlock(wrapper) {
  const top = wrapper.querySelector('.c-block-top');
  if (!top) return null;

  const command = wrapper.dataset?.command || top.dataset?.command;
  if (!command) return null;

  const cmd = { type: command };

  const input = top.querySelector('.block-input');
  if (input) {
    const val = parseInt(input.value, 10);
    if (!isNaN(val)) cmd.value = val;
  }

  const cond = top.querySelector('.sensor-cond');
  if (cond) {
    cmd.condition = cond.dataset?.condition || 'obstacleDetected';
  }

  const dropZones = wrapper.querySelectorAll(':scope > .c-block-drop-zone');
  if (dropZones.length > 0) {
    const mainArea = dropZones[0].querySelector('.c-block-drop-area');
    if (mainArea) {
      cmd.children = parseChildren(mainArea);
    }
  }

  if (command === 'if' && dropZones.length > 1) {
    const elseArea = dropZones[1].querySelector('.c-block-drop-area');
    if (elseArea) {
      cmd.elseChildren = parseChildren(elseArea);
    }
  }

  return cmd;
}

function parseChildren(area) {
  const result = [];
  for (const child of area.children) {
    if (child.classList.contains('drop-hint')) continue;
    const cmd = parseBlock(child);
    if (cmd) result.push(cmd);
  }
  return result;
}
