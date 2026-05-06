export function parseCommands() {
  const workspace = document.getElementById('workspace');
  
  if (!workspace) {
    console.error('Parser: #workspace not found');
    return [];
  }
  
  const blocks = workspace.querySelectorAll('.block[data-command]');
  const commands = [];
  
  blocks.forEach(block => {
    const cmd = block.dataset.command;
    if (cmd) commands.push(cmd);
  });
  
  return commands;
}
