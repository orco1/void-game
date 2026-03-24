// Cell state constants
const CELL = Object.freeze({ UNCLAIMED: 0, CLAIMED: 1, TRAIL: 2 });

class Grid {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.cells = new Uint8Array(cols * rows);
    this._initBorder();
  }

  _initBorder() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (x === 0 || x === this.cols - 1 || y === 0 || y === this.rows - 1) {
          this.cells[this._idx(x, y)] = CELL.CLAIMED;
        }
      }
    }
  }

  _idx(x, y) { return y * this.cols + x; }
  get(x, y)  { return this.cells[this._idx(x, y)]; }
  set(x, y, v) { this.cells[this._idx(x, y)] = v; }
  inBounds(x, y) { return x >= 0 && x < this.cols && y >= 0 && y < this.rows; }

  /**
   * Convert all trail cells to claimed, then flood-fill from each enemy position.
   * Everything unreachable by enemies becomes claimed.
   * Returns count of newly captured cells.
   */
  fillCapture(trail, enemyGridPositions) {
    // Mark trail as claimed
    for (const [tx, ty] of trail) {
      this.cells[this._idx(tx, ty)] = CELL.CLAIMED;
    }

    // BFS flood-fill from every enemy through UNCLAIMED cells
    const reachable = new Uint8Array(this.cols * this.rows);
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const { x: ex, y: ey } of enemyGridPositions) {
      if (!this.inBounds(ex, ey)) continue;
      const startIdx = this._idx(ex, ey);
      if (this.cells[startIdx] !== CELL.UNCLAIMED || reachable[startIdx]) continue;

      const stack = [startIdx];
      reachable[startIdx] = 1;

      while (stack.length > 0) {
        const i = stack.pop();
        const cx = i % this.cols;
        const cy = (i / this.cols) | 0;
        for (const [dx, dy] of dirs) {
          const nx = cx + dx, ny = cy + dy;
          if (!this.inBounds(nx, ny)) continue;
          const ni = this._idx(nx, ny);
          if (!reachable[ni] && this.cells[ni] === CELL.UNCLAIMED) {
            reachable[ni] = 1;
            stack.push(ni);
          }
        }
      }
    }

    // All unreachable unclaimed cells → claimed
    let captured = 0;
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] === CELL.UNCLAIMED && !reachable[i]) {
        this.cells[i] = CELL.CLAIMED;
        captured++;
      }
    }
    return captured;
  }

  claimedPercent() {
    let n = 0;
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] === CELL.CLAIMED) n++;
    }
    return (n / this.cells.length) * 100;
  }

  reset() {
    this.cells.fill(CELL.UNCLAIMED);
    this._initBorder();
  }
}
