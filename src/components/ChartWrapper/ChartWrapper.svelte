<script lang="ts">
  import { getContext } from 'svelte';
  import { derived } from 'svelte/store';

  import { deriveChartData } from '../../model';
  import { Customisation } from '../../types';

  import WeightedIndexChart from '../Chart/WeightedIndexChart.svelte';

  export let height: number;
  export let width: number;
  export let preventZoomSplitting = false;

  const inflationStore = getContext<any>('inflation-data');
  const customisationStore = getContext<any>('customisation');

  export const outputStore = derived(
    [inflationStore, customisationStore],
    ([inflationData, customisation]) => deriveChartData(inflationData as any, customisation as Customisation)
  );

  // Automatically split the groups at stage 3/5 of the zoom-in animation
  let zoomStage: number;
  $: {
    if (zoomStage > 3 && !preventZoomSplitting && !$customisationStore.preventZoomSplitting) {
      customisationStore.set({
        ...$customisationStore,
        splitGroups: [...$customisationStore.splitGroups, ...$customisationStore.zoomedInGroups],
      });
    }
  }

  $: xDomain = $customisationStore.timelineYears == 1 ? [-4, 20] : [-42, 80];
</script>

<WeightedIndexChart
  data={$outputStore}
  expandX={$customisationStore.showMarimako}
  label=""
  yAxisLabel=""
  zoomedInGroups={$customisationStore.zoomedInGroups}
  highlightedGroups={$customisationStore.highlightedGroups}
  preventZoomSplitting={$customisationStore.preventZoomSplitting}
  orderBy={$customisationStore.orderBy}
  bind:zoomInAnimationStage={zoomStage}
  {xDomain}
  {width}
  {height}
/>
