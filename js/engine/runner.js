const VALID_COMMANDS = ['move', 'turnRight', 'attack'];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function runCommands(commands, options = {}) {
  const { 
    handlers = {}, 
    delayMs = 500,
    eventTarget = new EventTarget() 
  } = options;
  
  if (!Array.isArray(commands)) {
    throw new Error('Commands must be an array');
  }
  
  for (const command of commands) {
    try {
      if (!VALID_COMMANDS.includes(command)) {
        console.error(`Invalid command: ${command}`);
        eventTarget.dispatchEvent(new CustomEvent('command:error', { 
          detail: { command, error: 'Invalid command' } 
        }));
        continue;
      }
      
      eventTarget.dispatchEvent(new CustomEvent('command:start', { 
        detail: { command } 
      }));
      
      if (handlers[command]) {
        await handlers[command]();
      }
      
      await delay(delayMs);
      
      eventTarget.dispatchEvent(new CustomEvent('command:end', { 
        detail: { command } 
      }));
      
    } catch (error) {
      console.error(`Error executing ${command}:`, error);
      eventTarget.dispatchEvent(new CustomEvent('command:error', { 
        detail: { command, error } 
      }));
    }
  }
  
  return eventTarget;
}
