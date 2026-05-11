export const LEVELS = [
  {
    id: 0,
    name: 'Primeiros Passos',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 4,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 2, direction: 1 },
    goal: { x: 4, y: 2, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [
      { x: 2, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' }, 
    ],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var'],
    description: 'Primeiros passos: use mover e pular para alcançar o portal.'
  },
  {
    id: 1,
    name: 'Cidade da Lógica',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 8,
    complexity: 2,
    difficulty: 1,
    playerStart: { x: 0, y: 0, direction: 1 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [],
    enemies: [{ x: 3, y: 0, hp: 1, type: 0, direction: 2 }],
    items: [],
    objectives: [
      { id: 'survive', description: 'Mantenha o herói vivo' },
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'defeat_enemies', description: 'Derrote todos os inimigos' },
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else'],
    description: 'Use if/else para tomar decisões. Mova até o inimigo e ataque!'
  },
  {
    id: 2,
    name: 'Porto das Variáveis',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [
      { x: 4, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' }
    ],
    enemies: [{ x: 3, y: 1, hp: 1, type: 1, direction: 0 }],
    items: [],
    objectives: [
      { id: 'survive', description: 'Mantenha o herói vivo' },
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'defeat_enemies', description: 'Derrote todos os inimigos' },
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else', 'repeat', 'while'],
    description: 'Desvie da torre giratória e atravesse o porto.'
  },
  {
    id: 3,
    name: 'Farol do Código',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 4, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [
      { x: 1, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 4, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' }
    ],
    enemies: [{ x: 3, y: 0, hp: 1, type: 0, direction: 2 }, { x: 1, y: 0, hp: 1, type: 0, direction: 2 }],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else', 'repeat', 'while'],
    description: 'Use as rochas como cobertura contra o feixe do laser.'
  },
  {
    id: 4,
    name: 'Floresta dos Algoritmos',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 2,
    playerStart: { x: 0, y: 5, direction: 0 },
    goal: { x: 5, y: 0, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [
      { x: 2, y: 1, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 4, y: 2, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 1, y: 4, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 3, y: 4, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' }
    ],
    enemies: [{ x: 3, y: 2, hp: 5, type: 2, direction: 1 }],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Inimigo muito poderoso. Fuja para o portal!' },
      { id: 'survive', description: 'Mantenha o herói vivo' },
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else', 'repeat', 'while'],
    description: 'Um perseguidor patrulha as ruínas. Movimente-se rápido e o despiste.'
  },
  {
    id: 5,
    name: 'Labirinto Binário',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 6,
    complexity: 3,
    difficulty: 2,
    playerStart: { x: 0, y: 3, direction: 1 },
    goal: { x: 5, y: 3, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [
      { x: 0, y: 2, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 1, y: 2, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 2, y: 2, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 3, y: 2, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 4, y: 2, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 5, y: 2, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 0, y: 4, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 1, y: 4, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 2, y: 4, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 3, y: 4, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 4, y: 4, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 5, y: 4, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' }
    ],
    enemies: [{ x: 3, y: 3, hp: 15, type: 0, direction: 2 }],
    items: [],
    objectives: [
      { id: 'survive', description: 'Mantenha o herói vivo' },
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'defeat_enemies', description: 'Use o bloco While para derrotar o inimigo' },
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else', 'repeat', 'while'],
    description: 'Use While para atacar até o inimigo ser derrotado. Avance até o portal.'
  },
  {
    id: 6,
    name: 'Labirinto Binário',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 10,
    complexity: 4,
    difficulty: 2,
    playerStart: { x: 0, y: 5, direction: 1 },
    goal: { x: 5, y: 0, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [
      { x: 0, y: 1, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 1, y: 3, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 2, y: 4, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' }
    ],
    enemies: [
      { x: 3, y: 1, hp: 1, type: 2, direction: 0 },
      { x: 5, y: 3, hp: 3, type: 0, direction: 3 }
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' },
      {id: 'defeat_enemies', description: 'Derrote todos os inimigos' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else', 'repeat', 'while'],
    description: 'Laser e torre protegem o labirinto. Planeje sua rota com cuidado.'
  },
  {
    id: 7,
    name: 'Núcleo de Logicron',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 18,
    complexity: 8,
    difficulty: 3,
    playerStart: { x: 0, y: 6, direction: 0 },
    goal: { x: 6, y: 0, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 3, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 4, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 5, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' }
    ],
    enemies: [
      { x: 6, y: 2, hp: 3, type: 0, direction: 2 },
      { x: 1, y: 0, hp: 1, type: 2, direction: 1 }, 
      { x: 4, y: 4, hp: 1, type: 2, direction: 1 }, 
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o núcleo do Logicron' },
      { id: 'defeat_enemies', description: 'Derrote todos os inimigos' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else', 'repeat', 'while'],
    description: 'Derrote o boss final e chegue ao núcleo do Logicron!'
  },
  {
    id: 8,
    name: 'Câmara dos Interruptores',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 12,
    complexity: 5,
    difficulty: 3,
    playerStart: { x: 0, y: 0, direction: 1 },
    goal: { x: 6, y: 6, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 2, y: 0, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 0, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 4, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 2, y: 4, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 6, y: 4, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 4, y: 6, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' }
    ],
    enemies: [
      { x: 1, y: 1, hp: 2, type: 1, direction: 3 },
      { x: 3, y: 3, hp: 2, type: 1, direction: 0 },
      { x: 5, y: 5, hp: 1, type: 0, direction: 3 }
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else', 'repeat', 'while'],
    description: 'Perseguidor e laser no abismo. A rota mais curta pode ser a mais perigosa.'
  },
  {
    id: 9,
    name: 'Convergência Final',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 18,
    complexity: 8,
    difficulty: 5,
    playerStart: { x: 0, y: 6, direction: 0 },
    goal: { x: 3, y: 0, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 1, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 0, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 4, y: 3, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 2, y: 4, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 5, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 3, y: 5, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' }
    ],
    enemies: [
      { x: 3, y: 2, hp: 2, type: 1, direction: 0 },
      { x: 0, y: 3, hp: 1, type: 0, direction: 1 },
      { x: 5, y: 3, hp: 1, type: 2, direction: 3 }
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' },
      { id: 'defeat_enemies', description: 'Derrote todos os inimigos' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'custom_var', 'set_var', 'if', 'else', 'repeat', 'while'],
    description: 'Todos os inimigos reunidos. Use todas as habilidades para vencer.'
  }
];

export function getLevel(id) {
  return LEVELS.find(l => l.id === id) || null;
}
