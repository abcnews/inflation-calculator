<script lang="ts">
  import { getContext } from 'svelte';
  import { derived } from 'svelte/store';

  import { deriveChartData } from '../../model';
  import { Customisation } from '../../types';

  import Chart from '../Chart/WeightedIndexChart.svelte';

  export let height: number;
  export let width: number;

  const inflationStore = getContext<any>('inflation-data');
  const customisationStore = getContext<any>('customisation');

  export const outputStore = derived(
    [inflationStore, customisationStore],
    ([inflationData, customisation]) => deriveChartData(inflationData as any, customisation as Customisation)
  );

  // $: console.log($customisationStore);

  $: xDomain = $customisationStore.timelineYears == 1 ? [-5, 20] : [-42, 80];
</script>

<Chart
  data={$outputStore}
  expandX={$customisationStore.showMarimako}
  label=""
  hiddenGroups={$customisationStore.hiddenGroups}
  {xDomain}
  {width}
  {height}
/>
