export class MinesweeperGame {
    public readonly width: number;
    public readonly height: number;
    public field!: MinesweeperCell[][];

    constructor(width: number, height: number, mineProbability: number) {
        this.width = width;
        this.height = height;

        const initField = () => {
            // Create the field (2d array)
            this.field = Array(this.width).fill(0).map(() => Array(this.height).fill(0));

            // if the probability is 0, then there are no mines
            // otherwise, we will randomly place mines
            if (mineProbability <= 0) {
                this.field = this.field.map(row => row.map(cell => new MinesweeperCell()))
            } else {
                this.field = this.field.map(row => row.map(cell => {
                    if (Math.random() < mineProbability) {
                        return MinesweeperCell.MINE();
                    } else {
                        return new MinesweeperCell();
                    }
                }));
            }

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
        initField();
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

    /**
     * Determine if the game is over.
     */
    public endState(): "won" | "lost" | "playing" | "starting" {
        // check if the game is lost
        // if even one mine is revealed
        if (this.field.some(row => row.some(cell => cell.mine && cell.revealed))) {
            return "lost";
        }

        // check if the game is won
        // if the mines == the flagged cells and all the cells are revealed
        if (this.field.every(row => row.every(cell => {
            if (cell.flagged) return cell.mine;
            return cell.revealed;
        }))) {
            return "won";
        }

        // check if the game hasn't started yet
        if (this.field.every(row => row.every(cell => !cell.revealed))) {
            return "starting";
        }

        return "playing";
    }

    // ascii representation of the field (for debugging)
    public fieldAscii() {
        let result = '';

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let cell = this.field[x][y];

                if (cell.mine) {
                    result += '*';
                } else {
                    result += cell.adjacentMines;
                }

                result += ' ';
            }

            result += '\n';
        }

        return result;
    }
}

export const GoodStartMinesweeper = (width: number, height: number, startX: number, startY: number, mineProbability: number = .175) => {
    while (true) {
        let ms = new MinesweeperGame(width, height, mineProbability);
        if (!ms.field[startX][startY].mine && ms.field[startX][startY].adjacentMines === 0) {
            return ms;
        }
    }
}

export class MinesweeperCell {
    public mine: boolean;
    private _revealed: boolean;
    private _flagged: boolean;
    public adjacentMines: number;

    get revealed(): boolean {
        return this._revealed;
    }

    get flagged(): boolean {
        return this._flagged;
    }

    set revealed(value: boolean) {
        this._revealed = value;
        if (value) this._flagged = false;
    }

    set flagged(value: boolean) {
        this._flagged = value;
        if (value) this._revealed = false;
    }

    constructor();
    constructor(isMine: boolean, isRevealed: boolean, isFlagged: boolean, adjacentMines: number);
    constructor(isMine?: boolean, isRevealed?: boolean, isFlagged?: boolean, adjacentMines?: number) {
        this.mine = isMine ?? false;
        this._revealed = isRevealed ?? false;
        this._flagged = isFlagged ?? false;
        this.adjacentMines = adjacentMines ?? 0;
    }

    static MINE = () => new MinesweeperCell(true, false, false, 0);
    static HINT = (x: number) => new MinesweeperCell(false, false, false, x);
}