export class Player {
  constructor(gridSize = 5) {
    this.gridSize = gridSize;
    this.x = 0;
    this.y = 0;
    this.direction = 0;
    this.hasItem = false;
  }

  reset(x = 0, y = 0, direction = 0) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.hasItem = false;
  }

  moveForward(steps = 1) {
    for (let i = 0; i < steps; i++) {
      const [dx, dy] = this._directionVector();
      const nx = this.x + dx;
      const ny = this.y + dy;
      if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) {
        return false;
      }
      this.x = nx;
      this.y = ny;
    }
    return true;
  }

  turnRight() {
    this.direction = (this.direction + 1) % 4;
  }

  turnLeft() {
    this.direction = (this.direction + 3) % 4;
  }

  jump(steps = 2) {
    const [dx, dy] = this._directionVector();
    const nx = this.x + dx * steps;
    const ny = this.y + dy * steps;
    if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
      this.x = nx;
      this.y = ny;
      return true;
    }
    return false;
  }

  peekForward() {
    const [dx, dy] = this._directionVector();
    return { x: this.x + dx, y: this.y + dy };
  }

  peekJump(steps = 2) {
    const [dx, dy] = this._directionVector();
    return { x: this.x + dx * steps, y: this.y + dy * steps };
  }

  _directionVector() {
    const vectors = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0]
    ];
    return vectors[this.direction];
  }
}
