<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { decode } from '@abcnews/base-36-props';
  // import { decode as decodeText } from '@abcnews/base-36-text';
  import acto from '@abcnews/alternating-case-to-object';

  import { InflationData } from '../types';
  import { defaultCustomisation } from '../constants';

  import ChartWrapper from './ChartWrapper/ChartWrapper.svelte';

  export let indexData: InflationData;
  export let marker: string;
  export let size = 'lg';

  $: params = acto(marker);

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(indexData);

  // Create store for controlling the chart
  const stateStore = writable<any>({ ...defaultCustomisation });
  setContext('customisation', stateStore);
  $: stateStore.set({ ...defaultCustomisation, ...decode(params.state as string) });

  let width: number;
  $: description = $stateStore.timelineYears == 10 ? 'CPI Inflation since June 2012.' : 'Inflation of CPI food component since September 2021.';
  $: title = $stateStore.timelineYears == 10 ? 'CPI Inflation since June 2012.' : 'Prices of fruit and vegetables rising faster than other foods';
</script>

{#if size === 'lg'}
  <h6 class="chart-title">{title}</h6>
  <p class="chart-description">{description}</p>
{/if}
<div class="inline-wrapper" bind:clientWidth={width}>
  <ChartWrapper
    width={width}
    height={size === 'lg' ? 600 : 400}
    overrideBudgetDescription={'Consumer price index'}
  />
</div>

<style lang="scss">
  .inline-wrapper {
    width: 100%;
    padding-bottom: 25px;
  }

  // Styling to match DW embeds
  .chart-description {
    padding-left: 15px;
    padding-right: 15px;

    font-family: 'ABCSans';
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    margin: 5px 0 0px;
  }
  .chart-title {
    padding-left: 15px;
    padding-right: 15px;

    margin: 0;

    font-family: 'ABCSans';
    font-size: 20px;
    font-style: normal;
    font-weight: 900;
    line-height: 24px;
  }

  @media only screen and (max-width: 400px) {
    .chart-description {
      font-size: 15px;
      line-height: 22px;
    }

    .chart-title {
      font-size: 18px;
      line-height: 21.6px;
    }
  }
</style>
