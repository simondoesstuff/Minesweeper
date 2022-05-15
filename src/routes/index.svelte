<script>
    import Cell from "../Components/Cell.svelte";
    import {GoodStartMinesweeper, MinesweeperGame} from "../Logic/MinesweeperGame.ts";
    import {onMount} from "svelte";

    let width = 12;
    let height = 12;

    let ms = new MinesweeperGame(width, height, 0); // empty board... at first
    $: field = ms.field;
    $: gameProgress = ms.endState();

    const restart = () => ms = new MinesweeperGame(width, height, 0);

    function onReveal(x, y) {
        if (gameProgress === "starting") {
            ms = GoodStartMinesweeper(width, height, x, y);
        }

        ms.revealEmptyPatch(x, y);
        ms = ms;
    }

    onMount(() => {
        window.revealAll = () => {
            ms.field.forEach(row => row.forEach(cell => cell.revealed = true));
            ms.field = ms.field;
        };

        window.minesweeper = ms;
    });
</script>


{#if gameProgress !== "playing" && gameProgress !== "starting"}
  <div class="flex justify-center">
    <div class="text-white font-bold p-5 text-6xl">
      {gameProgress === "won" ? "GG" : "L"}
    </div>
  </div>
{/if}

<div class="grid place-items-center w-screen aspect-square">
  <div id="Board">
    {#each field as column, x}
      {#each column as cell, y}
        <Cell
            lighter={(x + y) % 2 === 0}
            cell={cell}
            onReveal={() => onReveal(x, y)}
            onFlag={() => ms = ms}
        />
      {/each}
    {/each}
  </div>
</div>


<style lang="scss">
  #Board {
    // should control entire size`
    width: 70vw;

    @apply grid border border-amber-300 rounded;
    gap: 0.1rem;
    grid-template-columns: repeat(12, 1fr);
  }
</style>