<script lang="ts">
    import {AICellOverlay, MinesweeperCell} from "../Logic/CellStructs";

    export let lighter: boolean; // used to make the grid alternate between lighter and darker cells

    export let cell: MinesweeperCell;
    export let onReveal: () => void;
    export let onFlag: () => void;
    export let aiOverlay: AICellOverlay;

    let overlayElement: HTMLSpanElement;
    $: overlayHighlight = aiOverlay?.highlight;
    $: if (overlayElement) {
        if (overlayHighlight) overlayElement.style.backgroundColor = `hsl(${overlayHighlight * 360}, 100%, 50%)`;
        else overlayElement.style.backgroundColor = "";
    }

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
    class="relative aspect-square w-full grid place-items-center text-[1rem] duration-200"
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
<!--  Inner Symbol  -->
  <span class="text-center select-none magicTextSize">
    {symbol}
  </span>
<!--  AI Overlay Highlight  -->
  <span
      bind:this={overlayElement}
      class:border-2={overlayHighlight}
      class="absolute top-0 left-0 w-full aspect-square opacity-40 rounded border-white transition duration-300">
  </span>
</span>

<style lang="scss">
  .lighter {
    background-color: rgba(0, 0, 0, 0.15);
  }

  .unrevealed {
    @apply hover:scale-[1.20] ease-out;
    background-color: rgba(0, 0, 0, 0.5);

    &:hover {
      background-color: #74a9a1;
      @apply rounded z-10;
    }

    &:active {
      @apply scale-[.90];
    }
  }
</style>