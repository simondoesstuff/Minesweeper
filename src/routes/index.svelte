<script>
    import Cell from "../Components/Cell.svelte";
    import {MinesweeperGame} from "../Logic/MinesweeperGame.ts";

    let width = 12;
    let height = 12;

    let ms = new MinesweeperGame(width, height);
    $: field = ms.field;
</script>

<h1 class="font-bold shadow-2xl m-6 ml-16">Hey Brutha!</h1>

<table id="Board">
  {#each field as column, x}
    <tr>
      {#each column as cell, y}
        <td class="m-0">
          <Cell
              lighter={(x + y) % 2 === 0}
              cell={cell}
              onReveal={() => {
              ms.revealEmptyPatch(x, y);
              ms = ms; // for svelte reactivity
          }}
          />
        </td>
      {/each}
    </tr>
  {/each}
</table>


<style lang="scss">
  #Board {
    margin-left: 30vw;
    margin-right: 30vw;
    border-collapse: collapse;
    border: 1px solid #ffcc4c;
  }
</style>