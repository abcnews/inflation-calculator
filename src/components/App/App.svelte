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
      <div>
        Your inflation: <span class="inflation-rate">{formatPercentage(calculateInflationRate($indexStore))}</span>
      </div>
      <div>
        CPI inflation: {formatPercentage(calculateInflationRate(cpiIndex))}
      </div>
    {/if}
  </div>

  <div class="header"></div>
  <div class="sliders">
    <h3>Transport</h3>
    <p>
      Transport saw big increases, but these were dominated by the price of new cars and petrol.
    </p>
    {#each Object.values($indexStore) as group}
      {#if group.group === 'Transport'}
        <Slider name={group.name} />
      {/if}
    {/each}

    <h3>Housing</h3>
    <p>
      Housing construction costs rose sharply, but if you weren't buying a brand-new house or renovating, your inflation will be much lower.
    </p>
    {#each Object.values($indexStore) as group}
      {#if group.group === 'Housing'}
        <Slider name={group.name} />
      {/if}
    {/each}

    <h3>Other Groups</h3>
    <p>
      The price increases across the other expenditure groups were modest.
    </p>
    {#each Object.values($indexStore) as group}
      {#if group.group !== 'Transport' && group.group !== 'Housing'}
        <Slider name={group.name} />
      {/if}
    {/each}
  </div>
</div>

<style lang="scss">
  :global(body) {
    margin: 0;
  }

  .inflation-calculator {
    font-family: "ABCSans",Helvetica,Arial,sans-serif;
  }

  .header {
    height: 80px;
  }
  .sliders {
    padding: 2rem;
  }

  .inflation-rate {
    color: #a7029e;
  }

  .scores {
    position: fixed;
    display: flex;

    z-index: 100;
    width: 100%;
    height: 60px;
    align-items: center;
    background: #f7edff;

    div {
      text-align: center;
      width: 50%;
    }
  }
</style>
