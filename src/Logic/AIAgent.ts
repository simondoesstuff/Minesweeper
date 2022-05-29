import {AICellOverlay} from "./CellStructs";

/**
 * AIAgents can not interact with the minesweeper board
 * directly. They can only highlight and suggest moves.
 */
export default abstract class AIAgent {
    field: AICellOverlay[][];
    protected readonly width: number;
    protected readonly height: number;

    constructor(width: number, height: number) {
        this.height = height;
        this.width = width;
        this.field = Array(width).fill(0).map(() => Array(height).fill(new AICellOverlay()));
    }

    // the AI should make a move. Cells revealed by the player since the last time the AI
    // was awake are passed as a parameter.
    abstract makeMove(revealedCells: { x: number; y: number; adjacentMines: number }[]): Promise<void>;
}