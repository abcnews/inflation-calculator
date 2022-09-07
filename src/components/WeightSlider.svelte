<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import { setContext } from 'svelte';
  import { derived, writable } from 'svelte/store';
  import { Decimal } from 'decimal.js-light';

  // import Bar from './Chart/Bar.svg.svelte';
  import InflationBreakdown from './Chart/InflationBreakdown.svg.svelte';
  import Slider from 'carbon-components-svelte/src/Slider/Slider.svelte';

  import { calculateInflationRate, deriveChartData } from '../model';
  import { InflationData, WeightedBar, Customisation } from '../types';

  import 'carbon-components/scss/components/slider/_slider.scss';

  // import Chart from '../Chart/WeightedIndexChart.svelte';

  import { defaultCustomisation } from '../constants';

  export let indexData: InflationData;
  export let sliderField: string;
  export let sliderDefault: string;
  export let showLabels = false;

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(indexData);
  
  // Create store for controlling the chart
  const stateStore = writable<any>({ ...defaultCustomisation, weightOverrides: {
      'Automotive fuel': new Decimal(0.045),
      'Tobacco': new Decimal(0.03),
      // 'Food and non-alcoholic beverages': new Decimal(0.18),
    }
  });
  setContext('customisation', stateStore);

  export const outputStore = derived(
    [inflationStore, stateStore],
    ([inflationData, customisation]) => deriveChartData(inflationData as any, customisation as Customisation)
  );

  // const formatPercentage = (x: Decimal): string => `${x.mul(100).toPrecision(2)}%`;
  // $: inflationOutput = formatPercentage(calculateInflationRate($inflationStore, $stateStore));

  const xKey = 'inflation';
  const yKey = 'contribution';

  $: processedData = $outputStore.map((d: WeightedBar) => ({
    ...d,
    inflation: d.inflation.mul(100).toNumber(),
    weighting: d.weighting.mul(100).toNumber(),
    contribution: d.weighting.mul(d.inflation).mul(100).toNumber(),
  }));

  const updateWeighting = (field, value) => {
    stateStore.set({
      ...$stateStore,
      weightOverrides: {
        ...$stateStore.weightOverrides,
        [field]: new Decimal(value / 100) }
      })
  }
</script>

<Slider
  labelText="Proportion of budget spent on petrol"
  min={0}
  max={10}
  hideTextInput
  value={$stateStore.weightOverrides['Automotive fuel'].toNumber()* 100}
  on:change={e => updateWeighting('Automotive fuel', e.detail)}
/>
<!-- <Slider -->
<!--   labelText="Proportion of budget spent on food" -->
<!--   min={0} -->
<!--   max={10} -->
<!--   hideTextInput -->
<!--   value={$stateStore.weightOverrides['Food and non-alcoholic beverages'].toNumber()* 100} -->
<!--   on:change={e => updateWeighting('Food and non-alcholic beverages', e.detail)} -->
<!-- /> -->
<Slider
  labelText="Proportion of budget spent on tobacco"
  min={0}
  max={10}
  hideTextInput
  value={$stateStore.weightOverrides['Tobacco'].toNumber()* 100}
  on:change={e => updateWeighting('Tobacco', e.detail)}
/>

<div
  class="component-container"
  style="
    width: 100%;
    height: 600px;
    margin: auto;
  ">

  <LayerCake
    padding={{ top: 30, bottom: 10, left: 30, right: 50 }}
    x={xKey}
    y={yKey}
    yDomain={[7, 0]}
    data={processedData}
  >
    <Svg>
      <InflationBreakdown {showLabels} />
    </Svg>
  </LayerCake>
</div>

<style>
</style>
