<script lang="ts">
  import { setContext } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { Decimal } from 'decimal.js-light';

  import { calculateInflationRate, deriveChartData, InflationData, Customisation, ExpenditureGroupWeights } from '../../model';

  import Chart from '../Chart/WeightedIndexChart.svelte';

  export let data: InflationData;

  export let index: keyof ExpenditureGroupWeights = 'employed';
  export let timelineYears: 1 | 10 = 1;
  export let splitGroups = ['Transport', 'Housing', 'Alcohol and tobacco'];

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(data);

  // Create store with the personalisation params
  const customisationStore = writable<Customisation>({ index, timelineYears, splitGroups, weightOverrides: {} });
  setContext('customisation', customisationStore);
  $: customisationStore.set({
    index,
    timelineYears,
    splitGroups,
    weightOverrides: {},
  });

  export const outputStore = derived(
    [inflationStore, customisationStore],
    ([inflationData, customisation]) => deriveChartData(inflationData, customisation)
  );

  const formatPercentage = (x: Decimal): string => `${x.mul(100).toString()}%`;
</script>

<div class="inflation-calculator">
  <h2>Personal Inflation Calculator</h2>

  inflation: <span class="inflation-rate">{formatPercentage(calculateInflationRate($inflationStore, $customisationStore))}</span>

</div>

<Chart data={$outputStore} />

<style lang="scss">
  :global(body) {
    margin: 0;
  }

  .inflation-calculator {
    font-family: "ABCSans",Helvetica,Arial,sans-serif;
    padding: 2rem;

    /* p, */
    h2 {
      max-width: 600px;
      margin: auto;
      padding: 1rem;
    }
  }

  .inflation-rate {
    color: #a7029e;
  }
</style>
