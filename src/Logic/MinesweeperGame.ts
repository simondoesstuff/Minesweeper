export class MinesweeperGame {
    public readonly width: number;
    public readonly height: number;
    public field!: MinesweeperCell[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.initField();
    }

    /**
     * Reveals connected cells of 0 adjacent mines.
     * If the specified cell is not in bounds or the adjacent-mine number
     * is not 0, nothing happens.
     * @param originX the x-coordinate of the cell to start revealing
     * @param originY the y-coordinate of the cell to start revealing
     */
    public revealEmptyPatch(originX: number, originY: number): void {
        // first check if its in bounds and if the adjacent-mine number is 0
        if (originX < 0 || originX >= this.width || originY < 0 || originY >= this.height) return;
        if (this.field[originX][originY].adjacentMines !== 0) return;

        // reveal the cell
        this.field[originX][originY].revealed = true;

        // discovered will only contain strings so that we can use Set (objects are not comparable)
        let discovered = new Set();
        let frontier = [{x: originX, y: originY}];

        while (frontier.length > 0) {
            let {x, y} = frontier.pop()!;

            this.field[x][y].revealed = true;
            discovered.add(JSON.stringify({x, y}));

            if (this.field[x][y].adjacentMines !== 0) continue;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let nx = x + dx;
                    let ny = y + dy;

                    if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
                    if (discovered.has(JSON.stringify({x: nx, y: ny}))) continue;

                    frontier.push({x: nx, y: ny});
                }
            }
        }
    }

    private initField() {
        let fieldLength = this.width * this.height;
        let mineNumber = Math.round(.15 * fieldLength);

        // fill a 1d array with mines and empty cells
        let mines = Array(fieldLength).fill(0)
            .map((e, i) => {
                return i < mineNumber ? MinesweeperCell.MINE() : new MinesweeperCell();
            });

        // Shuffle the mines
        mines = mines.sort(() => Math.random() - 0.5);

        // Create the field (2d array)
        this.field = Array(this.width).fill(0)
            .map(() => Array(this.height).fill(0)
                .map(() => {
                    // @ts-ignore
                    let mine: MinesweeperCell = mines.pop();
                    return mine;
                }));

        // Calculate the adjacent mines for each cell
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.field[x][y].mine) {
                    continue;
                }

                // increase the adjacent mines number for each nearby cell
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (x + i < 0 || x + i >= this.width || y + j < 0 || y + j >= this.height) {
                            continue;
                        }

                        if (i != 0 || j != 0) {
                            this.field[x + i][y + j].adjacentMines++;
                        }
                    }
                }
            }
        }
    }

    // ascii representation of the field (for debugging)
    public fieldAscii() {
        let result = '';

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.field[x][y];

                if (cell.mine) {
                    result += '*';
                }else {
                    result += cell.adjacentMines;
                }

                result += ' ';
            }

            result += '\n';
        }

        return result;
    }
}

export class MinesweeperCell {
    public mine: boolean;
    public revealed: boolean;
    public flagged: boolean;
    public adjacentMines: number;

    constructor();
    constructor(isMine: boolean, isRevealed: boolean, isFlagged: boolean, adjacentMines: number);
    constructor(isMine?: boolean, isRevealed?: boolean, isFlagged?: boolean, adjacentMines?: number) {
        this.mine = isMine ?? false;
        this.revealed = isRevealed ?? false;
        this.flagged = isFlagged ?? false;
        this.adjacentMines = adjacentMines ?? 0;
    }

    static MINE = () => new MinesweeperCell(true, false, false, 0);
    static HINT = (x: number) => new MinesweeperCell(false, false, false, x);
}