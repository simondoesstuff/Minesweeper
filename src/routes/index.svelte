<script type="ts">
    import Cell from "../Components/Cell.svelte";
    import {GoodStartMinesweeper, MinesweeperGame} from "../Logic/MinesweeperGame.ts";
    import {onMount} from "svelte";
    import InferenceEngineAIAgent from "../Logic/InferenceEngineAIAgent.ts";

    // ---------------------------------------------------
    // Minesweeper
    // ---------------------------------------------------

    let width = 12;
    let height = 12;

    let ms = new MinesweeperGame(width, height, 0); // empty board... at first
    $: aiAgent = new InferenceEngineAIAgent(width, height);
    $: field = ms.field;
    $: gameProgress = ms.endState();

    function restart() {
        ms = new MinesweeperGame(width, height, 0);
    }

    function onReveal(x, y) {
        if (gameProgress === "starting") {
            ms = GoodStartMinesweeper(width, height, x, y);
        }

        ms.revealEmptyPatch(x, y);
        ms = ms;
    }

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------

    // provided by svelte window
    let windowInnerWidth, windowInnerHeight;

    let playContentElement: HTMLDivElement;
    $: if (playContentElement) {
        // we dont care if either of these are undefined
        // because we have to pick one anyway
        playContentElement.style.width = `100v${windowInnerHeight > windowInnerWidth ? "w" : "h"}`;
    }

    // window functions for debugging
    onMount(() => {
        window['revealAll'] = () => {
            ms.field.forEach(row => row.forEach(cell => cell.revealed = true));
            ms.field = ms.field;
        };

        window['minesweeper'] = ms;
    });
</script>


<svelte:window
    bind:innerWidth={windowInnerWidth}
    bind:innerHeight={windowInnerHeight}
/>

{#if gameProgress !== "playing" && gameProgress !== "starting"}
  <div class="flex justify-center">
    <div class="text-white font-bold p-5 text-6xl">
      {gameProgress === "won" ? "GG" : "L"}
    </div>
  </div>
{/if}

<section
    id="PlayContent"
    bind:this={playContentElement}
    class="grid place-items-center mx-auto"
>
  <div class="p-10 w-full">
    <div
        id="Board"
        class="grid border border-amber-300 rounded-xl gap-[.1rem]"
    >
      {#each field as column, x}
        {#each column as cell, y}
          <Cell
              lighter={(x + y) % 2 === 0}
              cell={cell}
              onReveal={() => onReveal(x, y)}
              onFlag={() => ms = ms}
              aiOverlay={aiAgent.field[x][y]}
          />
        {/each}
      {/each}
    </div>
  </div>
</section>


<style lang="scss">
  #Board {
    grid-template-columns: repeat(12, 1fr);
  }
</style>