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
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy'],
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
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else'],
    description: 'Use Se/Senão para decidir: o inimigo está à frente? Ataque ou avance.'
  },
  {
    id: 2,
    name: 'Porto das Variáveis',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 7,
    complexity: 3,
    difficulty: 2,
    playerStart: { x: 0, y: 4, direction: 1 },
    goal: { x: 4, y: 4, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [
      { x: 1, y: 4, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 3, y: 4, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' }
    ],
    enemies: [],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat'],
    description: 'Use Repetir para contornar barris em padrão. Economize blocos com laços!'
  },
  {
    id: 3,
    name: 'Farol do Código',
    theme: 'ocean',
    gridSize: 5,
    idealBlockCount: 6,
    complexity: 3,
    difficulty: 2,
    playerStart: { x: 0, y: 2, direction: 1 },
    goal: { x: 4, y: 2, sprite: 'assets/sprites/goal/portalciano.png' },
    obstacles: [
      { x: 0, y: 1, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 1, y: 1, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 2, y: 1, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 3, y: 1, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 4, y: 1, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 0, y: 3, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 1, y: 3, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 2, y: 3, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 3, y: 3, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' },
      { x: 4, y: 3, type: 'laser', sprite: 'assets/sprites/obstacles/laser.png' }
    ],
    enemies: [{ x: 2, y: 2, hp: 15, type: 0, direction: 2 }],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Use Enquanto para atacar até o inimigo ser derrotado. Avance até o portal.'
  },
  {
    id: 4,
    name: 'Floresta dos Algoritmos',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 10,
    complexity: 4,
    difficulty: 3,
    playerStart: { x: 0, y: 5, direction: 1 },
    goal: { x: 5, y: 0, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [
      { x: 1, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 3, y: 3, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 2, y: 4, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' }
    ],
    enemies: [
      { x: 3, y: 1, hp: 2, type: 2, direction: 0 },
      { x: 5, y: 3, hp: 1, type: 0, direction: 3 }
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Combine Se dentro de Enquanto: avance decidindo entre atacar e desviar a cada passo.'
  },
  {
    id: 5,
    name: 'Labirinto Binário',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 12,
    complexity: 5,
    difficulty: 3,
    playerStart: { x: 0, y: 0, direction: 1 },
    goal: { x: 5, y: 5, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [
      { x: 2, y: 0, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 0, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 4, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 2, y: 3, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 5, y: 3, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 3, y: 5, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' }
    ],
    enemies: [
      { x: 1, y: 1, hp: 2, type: 1, direction: 3 },
      { x: 4, y: 4, hp: 1, type: 0, direction: 3 }
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Caminhos bifurcados com múltiplas condições. Combine Repetir, Se e Enquanto para navegar.'
  },
  {
    id: 6,
    name: 'Ruínas da Coleção',
    theme: 'forest',
    gridSize: 6,
    idealBlockCount: 10,
    complexity: 4,
    difficulty: 3,
    playerStart: { x: 0, y: 5, direction: 1 },
    goal: { x: 5, y: 0, sprite: 'assets/sprites/goal/portalverde.png' },
    obstacles: [
      { x: 2, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 4, y: 4, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 3, y: 5, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' }
    ],
    enemies: [
      { x: 1, y: 3, hp: 2, type: 2, direction: 1 },
      { x: 5, y: 2, hp: 1, type: 0, direction: 3 }
    ],
    items: [
      { x: 1, y: 1, type: 'cristal' }
    ],
    objectives: [
      { id: 'require_item', description: 'Colete o cristal e alcance o portal' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Colete o cristal antes de chegar ao portal. O item é obrigatório para vencer!'
  },
  {
    id: 7,
    name: 'Núcleo de Logicron',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 16,
    complexity: 7,
    difficulty: 4,
    playerStart: { x: 0, y: 6, direction: 1 },
    goal: { x: 6, y: 0, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 2, y: 2, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 4, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 5, y: 4, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' }
    ],
    enemies: [
      { x: 6, y: 3, hp: 4, type: 0, direction: 3 },
      { x: 2, y: 4, hp: 2, type: 2, direction: 0 },
      { x: 4, y: 1, hp: 1, type: 1, direction: 2 }
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o núcleo do Logicron' },
      { id: 'defeat_enemies', description: 'Derrote todos os inimigos' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'O boss final guarda o núcleo. Combine todos os conceitos para vencer!'
  },
  {
    id: 8,
    name: 'Câmara dos Interruptores',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 12,
    complexity: 6,
    difficulty: 4,
    playerStart: { x: 0, y: 6, direction: 1 },
    goal: { x: 6, y: 0, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 1, y: 1, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png', switchable: true },
      { x: 3, y: 3, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png', switchable: true },
      { x: 5, y: 5, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png', switchable: true },
      { x: 2, y: 4, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 4, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' }
    ],
    enemies: [
      { x: 3, y: 0, hp: 2, type: 1, direction: 2 },
      { x: 6, y: 3, hp: 1, type: 0, direction: 3 }
    ],
    items: [],
    objectives: [
      { id: 'reach_goal', description: 'Alcance o portal de saída' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'Use Ativar para alternar barreiras no mapa. Escolha o momento certo para abrir caminho.'
  },
  {
    id: 9,
    name: 'Convergência Final',
    theme: 'void',
    gridSize: 7,
    idealBlockCount: 18,
    complexity: 8,
    difficulty: 5,
    playerStart: { x: 0, y: 0, direction: 1 },
    goal: { x: 6, y: 6, sprite: 'assets/sprites/goal/portalrosa.png' },
    obstacles: [
      { x: 1, y: 0, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png', switchable: true },
      { x: 3, y: 2, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 5, y: 3, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png', switchable: true },
      { x: 2, y: 4, type: 'barril', sprite: 'assets/sprites/obstacles/barril.png' },
      { x: 0, y: 5, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png' },
      { x: 4, y: 6, type: 'barreira', sprite: 'assets/sprites/obstacles/barreira.png', switchable: true }
    ],
    enemies: [
      { x: 2, y: 1, hp: 3, type: 2, direction: 2 },
      { x: 5, y: 1, hp: 2, type: 0, direction: 0 },
      { x: 1, y: 6, hp: 2, type: 1, direction: 1 },
      { x: 6, y: 4, hp: 3, type: 2, direction: 3 }
    ],
    items: [
      { x: 3, y: 4, type: 'cristal' }
    ],
    objectives: [
      { id: 'require_item', description: 'Colete o cristal e alcance o portal final' },
      { id: 'defeat_enemies', description: 'Derrote todos os inimigos' },
      { id: 'survive', description: 'Mantenha o herói vivo' }
    ],
    availableCommands: ['move', 'turnRight', 'turnLeft', 'jump', 'attack', 'pickup', 'drop', 'activate', 'detectObstacle', 'detectEnemy', 'if', 'else', 'repeat', 'while'],
    description: 'O desafio supremo: colete o cristal, derrote todos os inimigos e alcance o portal. Use tudo que aprendeu!'
  }
];

export function getLevel(id) {
  return LEVELS.find(l => l.id === id) || null;
}
