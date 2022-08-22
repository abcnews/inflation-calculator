<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { decode } from '@abcnews/base-36-props';

  import { InflationData, Customisation } from '../../model';

  import Scrollyteller from '../Scrollyteller/Scrollyteller.svelte';
  import ChartWrapper from '../ChartWrapper/ChartWrapper.svelte';

  export let indexData: InflationData;
  export let scrollyData: any;

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(indexData);

  // TODO: Import from a single place rather than defining twice
  // default state for the builder
  const DEFAULT_STATE: Customisation = {
    index: 'employed',
    timelineYears: 1,
    splitGroups: [],
    removedGroups: [],
    expandInflation: true,
    highlightedGroups: [],
    orderBy: 'area',
    showInflationRate: true,
    weightOverrides: {},
  };

  // Create store for controlling the chart
  // TODO: Impose personalisation controls over this
  const stateStore = writable<any>({ ...DEFAULT_STATE });
  setContext('customisation', stateStore);

  let updateState = ((marker: any) => {
    const state = decode(marker.state);
    stateStore.set({ ...DEFAULT_STATE, ...state });
  });

</script>

{#if !!scrollyData}
  <Scrollyteller
    panels={scrollyData.panels}
    onMarker={updateState}
    let:height={height}
    let:width={width}
  >
    <ChartWrapper
      {width}
      {height}
    />
  </Scrollyteller>
{/if}

