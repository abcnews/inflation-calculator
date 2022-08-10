<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  import Slider from '../Slider/Slider.svelte';
  import { calculateInflationRate, getStoreData, InflationIndex } from '../../model';

  let cpiIndex;

  // Create store with groups in it
  const indexStore = writable<InflationIndex>({});
  setContext('inflation-index', indexStore);

  getStoreData().then(d => {
    cpiIndex = d;
    indexStore.set(d)
  });

  const formatPercentage = (x: number): string => `${(x * 100).toPrecision(2)}%`;

</script>

<div class="inflation-calculator">
  <div class="scores">
    {#if cpiIndex}
      Your inflation: {formatPercentage(calculateInflationRate($indexStore))} | CPI inflation: {formatPercentage(calculateInflationRate(cpiIndex))}
    {/if}
  </div>

  <div class="sliders">
    {#each Object.values($indexStore) as group}
      <Slider name={group.name} />
    {/each}
  </div>
</div>

<style lang="scss">
  .inflation-calculator {
    font-family: "ABCSans",Helvetica,Arial,sans-serif;
  }

  .sliders {
    padding: 2rem;
  }
  .scores {
    padding: 2rem;
  }
</style>
