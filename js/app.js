import { parseCommands } from './engine/parser.js';
import { runCommands } from './engine/runner.js';

const runButton = document.getElementById('runButton');

runButton.addEventListener('click', async () => {

    const commands = parseCommands();

    console.log('Commands:', commands);

    const handlers = {

        move: async () => {
            console.log('Player move');
        },

        turnRight: async () => {
            console.log('Player turn right');
        },

        attack: async () => {
            console.log('Player attack');
        }
    };

    const eventTarget = new EventTarget();

    eventTarget.addEventListener('command:start', e => {
        console.log('START:', e.detail.command);
    });

    eventTarget.addEventListener('command:end', e => {
        console.log('END:', e.detail.command);
    });

    await runCommands(commands, {
        handlers,
        delayMs: 1000,
        eventTarget
    });

});