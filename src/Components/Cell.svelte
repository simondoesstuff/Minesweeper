<script lang="ts">
    import {MinesweeperCell} from "../Logic/MinesweeperGame";

    export let cell: MinesweeperCell;
    export let onReveal: () => void;

    $: symbol = (() => {
        if (!cell.revealed) {
            if (cell.flagged) return "⚠";
            return "⬜";
        }

        if (cell.mine) return "💀";
        if (cell.adjacentMines === 0) return "";
        return cell.adjacentMines;
    })();
</script>

<span
    id="Cell"
    class="aspect-square grid place-items-center border border-amber-500"
    class:cursor-grab={!cell.revealed}
    on:click={() => {
        if (!cell.revealed) {
            if (!cell.flagged) {
                cell.flagged = true;
            } else {
                cell.revealed = true;
                onReveal();
            }
        }
    }}
>
  <span class="text-center select-none magicTextSize">
    {symbol}
  </span>
</span>

<style lang="scss">
  #Cell {
    font-size: 2vw;
    width: 4rem;
  }
</style>