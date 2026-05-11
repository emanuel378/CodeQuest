export const LEVELS = [
  {
    id: 0,
    name: 'Tutorial',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy'],
    description: 'Aprenda os controles básicos movendo o herói até o objetivo.'
  },
  {
    id: 1,
    name: 'Cidade da Lógica',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 8,
    complexity: 2,
    difficulty: 2,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: null,
    obstacles: [],
    enemies: [{ x: 2, y: 1, hp: 1, type: 1, direction: 2 }],
    items: [],
    objectives: [
      { id: 'defeat_enemies', description: 'Derrote o inimigo' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else'],
    description: 'Use if/else para tomar decisões. Mova até o inimigo e ataque!'
  },
  {
    id: 2,
    name: 'Nível 2',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 3,
    name: 'Nível 3',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 4,
    name: 'Floresta dos Algoritmos',
    theme: 'forest',
    gridSize: 5,
    idealBlockCount: 10,
    complexity: 4,
    difficulty: 2,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: null,
    obstacles: [
      { x: 2, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 3, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 1, y: 1, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [{ x: 4, y: 0, hp: 1, type: 0, direction: 2 }],
    items: [],
    objectives: [
      { id: 'defeat_enemies', description: 'Derrote o inimigo' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Use repetição para navegar pela floresta e derrotar inimigos.'
  },
  {
    id: 5,
    name: 'Nível 5',
    theme: 'forest',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 6,
    name: 'Nível 6',
    theme: 'forest',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 7,
    name: 'Núcleo de Logicron',
    theme: 'void',
    gridSize: 5,
    idealBlockCount: 18,
    complexity: 8,
    difficulty: 3,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 4, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 1, y: 1, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' },
      { x: 2, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 3, y: 3, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [
      { x: 2, y: 1, hp: 3, type: 0, direction: 2 },
      { x: 1, y: 3, hp: 2, type: 2, direction: 1 }
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o núcleo do Logicron' },
      { id: 'defeat_enemies', description: 'Derrote todos os inimigos' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Derrote o boss final e chegue ao núcleo do Logicron!'
  },
  {
    id: 8,
    name: 'Nível 8',
    theme: 'void',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  },
  {
    id: 9,
    name: 'Nível 9',
    theme: 'void',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    difficulty: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Navegue pelo grid e alcance o objetivo.'
  }
];

export function getLevel(id) {
  return LEVELS.find(l => l.id === id) || null;
}
