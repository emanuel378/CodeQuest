export const LEVELS = [
  {
    id: 0,
    name: 'Tutorial',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalciano.png' },
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
    idealBlockCount: 8,
    complexity: 2,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: null,
    obstacles: [],
    enemies: [{ x: 2, y: 1, hp: 1, type: 1, direction: 2 }],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else'],
    description: 'Use if/else para tomar decisões. Mova até o inimigo e ataque!'
  },
  {
    id: 2,
    name: 'Porto das Variáveis',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 0, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [
      { x: 4, y: 2, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [{ x: 3, y: 1, hp: 1, type: 1, direction: 0 }],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Desvie da torre giratória e atravesse o porto.'
  },
  {
    id: 3,
    name: 'Farol do Código',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 1,
    playerStart: { x: 0, y: 4, direction: 0 },
    goal: { x: 4, y: 4, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [
      { x: 1, y: 2, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' },
      { x: 4, y: 2, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [{ x: 3, y: 0, hp: 1, type: 0, direction: 2 }, { x: 1, y: 0, hp: 1, type: 0, direction: 2 }],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Use as rochas como cobertura contra o feixe do laser.'
  },
  {
    id: 4,
    name: 'Floresta dos Algoritmos',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 10,
    complexity: 4,
    playerStart: { x: 0, y: 5, direction: 0 },
    goal: null,
    obstacles: [
      { x: 2, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 3, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 1, y: 1, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [{ x: 5, y: 0, hp: 1, type: 0, direction: 2 }],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Use repetição para navegar pela floresta e derrotar inimigos.'
  },
  {
    id: 5,
    name: 'Ruínas da Recursão',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 6,
    complexity: 1,
    playerStart: { x: 0, y: 5, direction: 0 },
    goal: { x: 5, y: 0, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [
      { x: 2, y: 1, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 4, y: 2, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo2.png' },
      { x: 1, y: 4, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 3, y: 4, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [{ x: 3, y: 2, hp: 1, type: 2, direction: 1 }],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Um perseguidor patrulha as ruínas. Movimente-se rápido ou enfrente-o.'
  },
  {
    id: 6,
    name: 'Labirinto Binário',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 6,
    complexity: 1,
    playerStart: { x: 0, y: 5, direction: 0 },
    goal: { x: 5, y: 0, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [
      { x: 1, y: 0, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' },
      { x: 3, y: 1, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 2, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 4, y: 3, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo2.png' },
      { x: 2, y: 4, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [
      { x: 0, y: 0, hp: 1, type: 0, direction: 1 },
      { x: 4, y: 2, hp: 1, type: 1, direction: 0 }
    ],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Laser e torre protegem o labirinto. Planeje sua rota com cuidado.'
  },
  {
    id: 7,
    name: 'Núcleo de Logicron',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 18,
    complexity: 8,
    playerStart: { x: 0, y: 6, direction: 0 },
    goal: { x: 6, y: 0, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 3, y: 2, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' },
      { x: 4, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 5, y: 2, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [
      { x: 6, y: 2, hp: 3, type: 0, direction: 2 },
      { x: 1, y: 3, hp: 2, type: 2, direction: 1 }
    ],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Derrote o boss final e chegue ao núcleo do Logicron!'
  },
  {
    id: 8,
    name: 'Abismo Infinito',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 6,
    complexity: 1,
    playerStart: { x: 0, y: 6, direction: 0 },
    goal: { x: 6, y: 0, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 2, y: 1, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo2.png' },
      { x: 4, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 1, y: 3, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' },
      { x: 5, y: 4, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 3, y: 5, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' }
    ],
    enemies: [
      { x: 4, y: 3, hp: 2, type: 2, direction: 3 },
      { x: 6, y: 5, hp: 1, type: 0, direction: 3 }
    ],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Perseguidor e laser no abismo. A rota mais curta pode ser a mais perigosa.'
  },
  {
    id: 9,
    name: 'Núcleo do Código',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 6,
    complexity: 1,
    playerStart: { x: 0, y: 6, direction: 0 },
    goal: { x: 6, y: 6, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 1, y: 2, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 3, y: 1, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' },
      { x: 4, y: 3, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' },
      { x: 2, y: 4, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo2.png' },
      { x: 5, y: 2, type: 'rock', sprite: 'assets/sprites/obstacles/obstaculo1.png' },
      { x: 3, y: 5, type: 'tree', sprite: 'assets/sprites/obstacles/obstaculo3.png' }
    ],
    enemies: [
      { x: 3, y: 2, hp: 2, type: 1, direction: 0 },
      { x: 0, y: 3, hp: 1, type: 0, direction: 1 },
      { x: 5, y: 5, hp: 2, type: 2, direction: 3 }
    ],
    items: [],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Todos os inimigos reunidos. Use todas as habilidades para vencer.'
  }
];

export function getLevel(id) {
  return LEVELS.find(l => l.id === id) || null;
}
