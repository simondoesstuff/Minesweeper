<script lang="ts">
    import {MinesweeperCell} from "../Logic/MinesweeperGame";

    export let lighter: boolean; // used to make the grid alternate between lighter and darker cells

    export let cell: MinesweeperCell;
    export let onReveal: () => void;
    export let onFlag: () => void;

    $: symbol = (() => {
        if (!cell.revealed) {
            if (cell.flagged) return "⚠";
            return "";
        }

        if (cell.mine) return "💀";
        if (cell.adjacentMines === 0) return "";
        return cell.adjacentMines;
    })();
</script>

<span
    class="aspect-square w-full grid place-items-center text-[1.5vw] duration-200"
    class:lighter
    class:unrevealed={!cell.revealed}

    on:click={() => {
        if (!cell.revealed) {
            if (!cell.flagged) {
                cell.flagged = true;
                onFlag();
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
  .lighter {
    background-color: rgba(118, 255, 223, 0.07);
  }

  .unrevealed {
    @apply hover:scale-[1.20] ease-out;
    background-color: rgba(0, 0, 0, 0.33);

    &:hover {
      background-color: #3B454BFF;
      @apply rounded;
    }

    &:active {
      @apply scale-[.90];
    }
  }
</style>