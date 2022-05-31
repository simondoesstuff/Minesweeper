import AIAgent from "./AIAgent";
import type {AICellOverlay} from "./CellStructs";

export default class InferenceEngineAIAgent extends AIAgent {
    private knowledge: Sentence[] = [];

    // ms; time to think through major steps in making an inference
    thinkingTimeConstant: number = 1000;
    private think = async (degree: number = 1) => new Promise(resolve => setTimeout(resolve, this.thinkingTimeConstant * degree));

    // here we will attempt to make one major inference, stop,
    // and update the overlays accordingly. onUpdate will be called
    // as inferences are made.
    async makeMove(revealedCells: { x: number; y: number; adjacentMines: number }[], onUpdated: () => void) {
        // first, realize each move we missed
        for (let cell of revealedCells) {
            const cellOverlay = this.field[cell.x][cell.y];
            cellOverlay.prediction = "safe";
            cellOverlay.showPrediction = false;
        }

        // next, display new sentences
        revealedCells = revealedCells.sort((a, b) => a.adjacentMines - b.adjacentMines);
        if (revealedCells.length !== 0) {
            for (let cell of revealedCells) {
                if (this.addSentence(this.getAdjacentCells(cell), cell.adjacentMines)) {
                    onUpdated();
                    await this.think(.1);
                }
            }

            await this.think(1.5);
        }

        // attempt to construct new inferences from old ones

        const checkCertainty = () => {
            // next, we will try to have each sentence make a small inference
            for (let i = 0; i < this.knowledge.length; i++) {
                const sentence = this.knowledge[i];

                if (sentence.infer()) {
                    sentence.removeHighlights();
                    onUpdated();
                    this.knowledge.slice(i, 1);
                    return true; // we made a major inference, so we can stop
                }
            }

            return false;
        }

        const deriveSubsets = () => {
            for (let sent1 of this.knowledge) {
                for (let sent2 of this.knowledge) {
                    if (sent1 === sent2) continue;

                    // if a sentence is a subset of the other, create a new sentence
                    // that is the difference of the two
                    let subset1 = sent1.cells.filter(cell => !sent2.cells.includes(cell));
                    let subset2 = sent2.cells.filter(cell => !sent1.cells.includes(cell));

                    // neither is a subset of the other
                    if (subset1.length > 0 && subset2.length > 0) continue;

                    // one is a subset of the other
                    let resultingSet = subset1.length > 0 ? subset1 : subset2;
                    let mineCount = Math.abs(sent1.count - sent2.count);

                    if (this.addSentence(resultingSet, mineCount)) {
                        onUpdated();
                        return true;
                    }
                }
            }

            return false;
        }

        while (true) {
            if (checkCertainty()) return;

            if (!deriveSubsets()) break;

            onUpdated();
            await this.think();
        }
    }

    // adds a sentence to the knowledge base.
    // safe cells are ignored. empty sentences
    // are ignored. cells that contain 100% mines
    // are ignored.
    // returns true if a new sentence was added
    private addSentence(cells: AICellOverlay[], adjacentMines: number): boolean {
        cells = cells.filter(cell => cell.prediction !== "safe");

        if (cells.length === 0) return false;

        if (cells.every(cell => cell.prediction === "mine")) return false;

        // if the sentence is already in the knowledge base
        for (let s of this.knowledge) if (s.is(cells)) return false;

        this.knowledge.push(new Sentence(cells, adjacentMines));
        return true;
    }

    // Returns the cells neighboring a cell.
    private getAdjacentCells(cell: {x: number; y: number}): AICellOverlay[] {
        let cells = []

        for (let x = cell.x - 1; x <= cell.x + 1; x++) {
            for (let y = cell.y - 1; y <= cell.y + 1; y++) {
                if (x === cell.x && y === cell.y) {
                    continue;
                }

                if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                    continue;
                }

                cells.push(this.field[x][y])
            }
        }

        return cells;
    }
}

/**
 * Logical statement about a Minesweeper game
 * A sentence consists of a set of board cells,
 * and a count of the number of those cells which are mines.
 */
class Sentence {
    cells: AICellOverlay[] = []
    readonly count: number

    constructor(cells: AICellOverlay[], count: number) {
        this.cells = cells
        this.count = count

        // the highlight color of the cells are determined
        // by Count
        const color = 1 - count/9.0;
        this.cells.forEach(cell => cell.highlight = color);

        this.infer()
    }

    // returns true if certainty was achieved --- it learned something
    infer() {
        if (this.cells.length === this.count) {
            // if the number of nearby cells is equal to the number of nearby mines,
            // then all the other cells are mines
            this.cells.forEach(cell => cell.prediction = "mine")
            return true;
        } else if (this.cells.filter(cell => cell.prediction === "mine").length === this.count) {
            // if the number of certain mines is equal to the number of nearby mines,
            // then all the other cells are safe
            this.cells.filter(cell => cell.prediction !== "mine").forEach(cell => cell.prediction = "safe")
            return true;
        }

        return false;
    }

    is(other: AICellOverlay[] | Sentence) {
        const cells1 = this.cells
        let cells2: AICellOverlay[];

        if (other instanceof Sentence) cells2 = other.cells
        else cells2 = other

        const result = [
            ...cells1.filter(x => !cells2.includes(x)),
            ...cells2.filter(x => !cells1.includes(x))
        ] // xor

        return result.length === 0;
    }

    removeHighlights() {
        this.cells.forEach(cell => cell.highlight = undefined)
    }
}