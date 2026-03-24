const DIAGONAL_ANGLES = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];

class Enemy {
  constructor(grid, cellSize, gridX, gridY, speed) {
    this.grid = grid;
    this.cs = cellSize;
    // Start at center of spawn cell
    this.x = gridX * cellSize + cellSize * 0.5;
    this.y = gridY * cellSize + cellSize * 0.5;
    // Always start at 45° angle for predictable bouncing
    const angle = DIAGONAL_ANGLES[Math.floor(Math.random() * 4)];
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    // Visual pulse offset
    this.pulseT = Math.random() * Math.PI * 2;
  }

  /**
   * Move and bounce. Returns 'kill' if the enemy lands on a TRAIL cell.
   */
  update() {
    this.pulseT += 0.07;
    const cs = this.cs;

    const curCX = Math.floor(this.x / cs);
    const curCY = Math.floor(this.y / cs);

    // --- X axis ---
    let nextX = this.x + this.vx;
    const newCX = Math.floor(nextX / cs);
    if (newCX !== curCX) {
      const cell = this.grid.inBounds(newCX, curCY)
        ? this.grid.get(newCX, curCY)
        : CELL.CLAIMED;
      if (cell === CELL.CLAIMED) {
        this.vx *= -1;
        nextX = this.x + this.vx;
      }
    }

    // --- Y axis (use updated X to pick the correct column) ---
    let nextY = this.y + this.vy;
    const newCXfinal = Math.floor(nextX / cs);
    const newCY = Math.floor(nextY / cs);
    if (newCY !== curCY) {
      const cell = this.grid.inBounds(newCXfinal, newCY)
        ? this.grid.get(newCXfinal, newCY)
        : CELL.CLAIMED;
      if (cell === CELL.CLAIMED) {
        this.vy *= -1;
        nextY = this.y + this.vy;
      }
    }

    this.x = nextX;
    this.y = nextY;

    // Hard safety clamp (border is claimed, so this rarely fires)
    const minV = cs + 0.5, maxX = (this.grid.cols - 2) * cs - 0.5, maxY = (this.grid.rows - 2) * cs - 0.5;
    if (this.x < minV) { this.x = minV; this.vx = Math.abs(this.vx); }
    if (this.x > maxX) { this.x = maxX; this.vx = -Math.abs(this.vx); }
    if (this.y < minV) { this.y = minV; this.vy = Math.abs(this.vy); }
    if (this.y > maxY) { this.y = maxY; this.vy = -Math.abs(this.vy); }

    // Kill check — landed on a trail cell?
    const finalCX = Math.floor(this.x / cs);
    const finalCY = Math.floor(this.y / cs);
    if (this.grid.inBounds(finalCX, finalCY) && this.grid.get(finalCX, finalCY) === CELL.TRAIL) {
      return 'kill';
    }

    return null;
  }

  getGridPos() {
    return {
      x: Math.floor(this.x / this.cs),
      y: Math.floor(this.y / this.cs)
    };
  }
}
