<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  import { InflationData } from '../../model';
  import { defaultCustomisation } from '../../constants';

  import ChartWrapper from '../ChartWrapper/ChartWrapper.svelte';
  import PropertiesTab from '../PropertiesTab.svelte';
  import Builder from '../Builder/Builder.svelte';

  export let data: InflationData;

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(data);
</script>

<Builder
  storeName={"customisation"}
  defaultState={defaultCustomisation}
  let:width={width}
  let:height={height}
>
  <ChartWrapper
    slot="figure"
    {width}
    {height}
  />

  <PropertiesTab slot="properties" />
</Builder>

<style lang="scss">
  /* Make the chart visible before the first panel of text */
  :global(.scrollyteller .content) {
    :global(.panel:first-child),
    :global(.st-panel:first-child){
      margin-top: 60vh;
    }
  }
</style>
