<script lang="ts">
  import { getContext } from 'svelte';
  import { derived } from 'svelte/store';

  import { deriveChartData } from '../../model';
  import { Customisation } from '../../types';

  import WeightedIndexChart from '../Chart/WeightedIndexChart.svelte';

  export let height: number;
  export let width: number;
  export let preventZoomSplitting = false;
  export let overrideBudgetDescription = '';

  const inflationStore = getContext<any>('inflation-data');
  const customisationStore = getContext<any>('customisation');

  export const outputStore = derived(
    [inflationStore, customisationStore],
    ([inflationData, customisation]) => deriveChartData(inflationData as any, customisation as Customisation)
  );

  // Automatically split the groups at the final stage of the zoom-in animation
  let zoomStage: number;
  $: {
    if (zoomStage > 2 && !preventZoomSplitting && !$customisationStore.preventZoomSplitting) {
      customisationStore.set({
        ...$customisationStore,
        splitGroups: [...$customisationStore.splitGroups, ...$customisationStore.zoomedInGroups],
      });
    }
  }

  let budgetDescription = '';
  $: {
    if (overrideBudgetDescription) {
      budgetDescription = overrideBudgetDescription;
    } else if ($customisationStore.applyPersonalisation && !customisationStore.forceHousingProfile) {
      budgetDescription = 'your budget';
    } else if ($customisationStore.housingProfile === 'mortgage') {
      budgetDescription = 'mortgage holder';

      // Special case for when forcing the housing profile to be the same as the user's one
      if ($customisationStore.userHousingProfile === 'mortgage') {
        budgetDescription = 'your budget';
      }
    } else if (
      $customisationStore.removedGroups.indexOf('New dwelling purchase by owner-occupiers') === -1 &&
      $customisationStore.zoomedInGroups.indexOf('Housing') > -1
    ) {
      // Only for final scrollyteller to explicitly say its CPI
      budgetDescription = 'Consumer price index';
    } else {
      // Only for initial scrollyteller to avoid complexity
      budgetDescription = 'typical budget';
    }
  }

  $: xDomain = $customisationStore.timelineYears == 1 ? [0, 24] : [-25, 55];
</script>

<WeightedIndexChart
  data={$outputStore}
  expandX={$customisationStore.showMarimako}
  zoomedInGroups={$customisationStore.zoomedInGroups}
  highlightedGroups={$customisationStore.highlightedGroups}
  preventZoomSplitting={$customisationStore.preventZoomSplitting}
  orderBy={$customisationStore.orderBy}
  {budgetDescription}
  bind:zoomInAnimationStage={zoomStage}
  {xDomain}
  {width}
  {height}
/>
