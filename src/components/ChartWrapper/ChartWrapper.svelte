<script lang="ts">
  import { getContext } from 'svelte';
  import { derived } from 'svelte/store';
  import { Decimal } from 'decimal.js-light';

  import { calculateInflationRate, deriveChartData, Customisation } from '../../model';

  import Chart from '../Chart/WeightedIndexChart.svelte';

  export let height: number;
  export let width: number;

  const inflationStore = getContext<any>('inflation-data');
  const customisationStore = getContext<any>('customisation');

  export const outputStore = derived(
    [inflationStore, customisationStore],
    ([inflationData, customisation]) => deriveChartData(inflationData as any, customisation as Customisation)
  );

  const formatPercentage = (x: Decimal): string => `${x.mul(100).toPrecision(2)}%`;
  $: inflationOutput = formatPercentage(calculateInflationRate($inflationStore, $customisationStore));

  $: xDomain = $customisationStore.timelineYears == 1 ? [-5, 20] : [-42, 80];
  // TODO: Fact check 18.6
  $: cpiLine = $customisationStore.timelineYears == 1 ? 6.1 : 18.6;
</script>

<Chart
  data={$outputStore}
  expandX={$customisationStore.showMarimako}
  showSecondColumn={$customisationStore.showInflationBreakdown}
  label="Your budget breakdown"
  secondColumnLabel="Your inflation breakdown (of {inflationOutput})"
  {xDomain}
  markerLine={cpiLine}
  {width}
  {height}
/>
