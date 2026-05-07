const DIRECTIONS = ['north', 'east', 'south', 'west'];

export class Player {
  constructor(options = {}) {
    this.startDirection = options.direction ?? 'north';
    this.direction = this.startDirection;
    this.eventBus = options.eventBus ?? null;
    this.stage = options.stage ?? null;
  }

  reset() {
    this.direction = this.startDirection;
  }

  get facing() {
    return this.direction;
  }

  #emit(name, detail = {}) {
    if (this.eventBus) {
      this.eventBus.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }

  move() {
    const result = this.stage && typeof this.stage.movePlayerForward === 'function'
      ? this.stage.movePlayerForward(this.direction)
      : { success: true };

    this.#emit('player:move', result);
    return result;
  }

  turnRight() {
    const currentIndex = DIRECTIONS.indexOf(this.direction);
    const previous = this.direction;
    this.direction = DIRECTIONS[(currentIndex + 1) % DIRECTIONS.length];

    const result = { success: true, previous, current: this.direction };
    this.#emit('player:turn', result);
    return result;
  }

  attack() {
    const result = this.stage && typeof this.stage.attackInFront === 'function'
      ? this.stage.attackInFront(this.direction)
      : { success: false, reason: 'no-enemy' };

    this.#emit('player:attack', result);
    return result;
  }
}
