export const LEVELS = [
  {
    id: 0,
    name: 'Tutorial',
    theme: 'ocean',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0 },
    obstacles: [],
    enemies: [],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy'],
    description: 'Aprenda os controles básicos movendo o herói até o objetivo.'
  },
  {
    id: 1,
    name: 'Cidade da Lógica',
    theme: 'ocean',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: null,
    obstacles: [],
    enemies: [{ x: 4, y: 0, hp: 1 }],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else'],
    description: 'Use if/else para tomar decisões. Mova até o inimigo e ataque!'
  },
  {
    id: 2,
    name: 'Nível 2',
    theme: 'ocean',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0 },
    obstacles: [],
    enemies: [],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 3,
    name: 'Nível 3',
    theme: 'ocean',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0 },
    obstacles: [],
    enemies: [],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 4,
    name: 'Floresta dos Algoritmos',
    theme: 'forest',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: null,
    obstacles: [
      { x: 2, y: 2, type: 'tree' },
      { x: 3, y: 2, type: 'tree' },
      { x: 1, y: 1, type: 'rock' }
    ],
    enemies: [{ x: 4, y: 0, hp: 1 }],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Use repetição para navegar pela floresta e derrotar inimigos.'
  },
  {
    id: 5,
    name: 'Nível 5',
    theme: 'forest',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0 },
    obstacles: [],
    enemies: [],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 6,
    name: 'Nível 6',
    theme: 'forest',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0 },
    obstacles: [],
    enemies: [],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 7,
    name: 'Núcleo de Logicron',
    theme: 'void',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 4 },
    obstacles: [
      { x: 1, y: 1, type: 'rock' },
      { x: 2, y: 2, type: 'tree' },
      { x: 3, y: 3, type: 'rock' }
    ],
    enemies: [
      { x: 2, y: 1, hp: 3 },
      { x: 1, y: 3, hp: 2 }
    ],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Derrote o boss final e chegue ao núcleo do Logicron!'
  },
  {
    id: 8,
    name: 'Nível 8',
    theme: 'void',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0 },
    obstacles: [],
    enemies: [],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 9,
    name: 'Nível 9',
    theme: 'void',
    gridSize: 5,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0 },
    obstacles: [],
    enemies: [],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  }
];

export function getLevel(id) {
  return LEVELS.find(l => l.id === id) || null;
}
