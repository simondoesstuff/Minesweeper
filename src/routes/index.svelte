<script type="ts">
    import Cell from "../Components/Cell.svelte";
    import {GoodStartMinesweeper, MinesweeperGame} from "../Logic/MinesweeperGame.ts";
    import {onMount} from "svelte";
    import InferenceEngineAIAgent from "../Logic/InferenceEngineAIAgent.ts";
    import AIAgent from "../Logic/AIAgent";

    // ---------------------------------------------------
    // Minesweeper
    // ---------------------------------------------------

    let width = 12;
    let height = 12;

    let ms = new MinesweeperGame(width, height, 0); // empty board... at first
    let aiAgent = new InferenceEngineAIAgent(width, height);
    $: field = ms.field;
    $: gameProgress = ms.endState();

    let aiCatchUpQueue: {x: number, y: number, adjacentMines: number}[] = [];
    let aiISThinking = false;
    function aiMove() {
        if (aiISThinking) return;

        aiISThinking = true;
        aiAgent.makeMove(aiCatchUpQueue, () => aiAgent = aiAgent).then(() => {
            aiISThinking = false;
            aiAgent = aiAgent;
        });
        aiCatchUpQueue = [];
    }

    function restart() {
        ms = new MinesweeperGame(width, height, 0);
        aiAgent = new InferenceEngineAIAgent(width, height);
    }

    function onReveal(x, y) {
        if (gameProgress === "starting") {
            ms = GoodStartMinesweeper(width, height, x, y);
        }

        let revealedCells = ms.revealEmptyPatch(x, y);
        aiCatchUpQueue.push(...revealedCells);

        ms = ms;
    }

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------

    // provided by svelte window
    let windowInnerWidth, windowInnerHeight;

    let boardContainer: HTMLDivElement;
    $: if (boardContainer) {
        // we dont care if either of these are undefined
        // because we have to pick one anyway
        boardContainer.style.width = `100v${windowInnerHeight > windowInnerWidth ? "w" : "h"}`;
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

<button class="absolute top-0 right-0 m-8 mr-11" on:click={aiMove}>
  AI Vision
</button>

<section
    bind:this={boardContainer}
    class="grid place-items-center mx-auto p-10 mt-16 md:mt-0"
>
  <div
      id="Board"
      class="grid border border-amber-300 rounded-xl gap-[.1rem] w-full"
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
</section>


<style lang="scss">
  :global(body) {
    overflow: hidden;
  }

  #Board {
    grid-template-columns: repeat(12, 1fr);
  }
</style>