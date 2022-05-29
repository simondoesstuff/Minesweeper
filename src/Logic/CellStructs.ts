import type Color from "./Color";

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

    constructor(isMine?: boolean, isRevealed?: boolean, isFlagged?: boolean, adjacentMines?: number) {
        this.mine = isMine ?? false;
        this._revealed = isRevealed ?? false;
        this._flagged = isFlagged ?? false;
        this.adjacentMines = adjacentMines ?? 0;
    }

    static MINE = () => new MinesweeperCell(true, false, false, 0);
    static HINT = (x: number) => new MinesweeperCell(false, false, false, x);
}

export class AICellOverlay {
    prediction: "safe" | "mine" | "unknown" = "unknown";
    showPrediction: boolean = true; // a cell can store its prediction, but not show it
    highlight?: number; // a number from 0-1 representing the hue of the highlight
}