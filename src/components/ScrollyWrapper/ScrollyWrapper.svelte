<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { decode } from '@abcnews/base-36-props';

  import { InflationData } from '../../types';
  import { defaultCustomisation } from '../../constants';

  import Scrollyteller from '../Scrollyteller/Scrollyteller.svelte';
  import ChartWrapper from '../ChartWrapper/ChartWrapper.svelte';

  export let indexData: InflationData;
  export let scrollyData: any;

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(indexData);

  // Create store for controlling the chart
  // TODO: Impose personalisation controls over this
  const stateStore = writable<any>({ ...defaultCustomisation });
  setContext('customisation', stateStore);


  let updateState = ((marker: any) => {
    if (marker.state) {
      const state = decode(marker.state);
      stateStore.set({ ...defaultCustomisation, ...state });
    }
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
      width={Math.min(width, 600)}
      height={height * 0.8}
    />
  </Scrollyteller>
{/if}

<style lang="scss">
  /* Make the chart visible before the first panel of text */
  :global(.scrollyteller .content) {
    :global(.st-panel:first-child){
      margin-top: 90vh;
    }
  }
</style>
