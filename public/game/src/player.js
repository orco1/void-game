class Player {
  constructor(grid) {
    this.grid = grid;
    this.x = 0;
    this.y = 0;
    this.drawing = false;
    this.trail = [];
  }

  /**
   * Attempt to move by (dx, dy).
   * Returns: 'capture' | 'moved' | null
   */
  move(dx, dy) {
    const nx = this.x + dx;
    const ny = this.y + dy;
    if (!this.grid.inBounds(nx, ny)) return null;

    const target = this.grid.get(nx, ny);

    // Can't step on own trail
    if (target === CELL.TRAIL) return null;

    if (target === CELL.UNCLAIMED) {
      // Mark current destination as trail and start/continue drawing
      this.grid.set(nx, ny, CELL.TRAIL);
      this.trail.push([nx, ny]);
      this.drawing = true;
      this.x = nx;
      this.y = ny;
      return 'moved';
    }

    if (target === CELL.CLAIMED) {
      const wasDrawing = this.drawing;
      this.x = nx;
      this.y = ny;
      this.drawing = false;
      return wasDrawing ? 'capture' : 'moved';
    }

    return null;
  }

  /** Clear trail cells from grid, reset position to top-left border */
  die() {
    for (const [tx, ty] of this.trail) {
      this.grid.set(tx, ty, CELL.UNCLAIMED);
    }
    this.trail = [];
    this.drawing = false;
    this.x = 0;
    this.y = 0;
  }

  /** Called after a successful capture — trail already converted by grid.fillCapture */
  clearTrail() {
    this.trail = [];
  }

  getGridPos() { return { x: this.x, y: this.y }; }
}
