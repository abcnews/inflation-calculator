<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import type { WeightedBar } from '../../model';

  import Bars from './Bars.svg.svelte';
  import AxisX from './AxisX.svelte';
  import MarkerLine from './MarkerLine.svelte';
  // import AxisY from './AxisY.svelte';

  const xKey = 'inflation';
  const yKey = 'weighting';

  export let data: WeightedBar[];
  export let xDomain: [number, number]; 

  export let expandX: boolean; 
  export let showSecondColumn: boolean; 

  export let showDiscretionary: boolean;
  export let markerLine: number;

  export let label = '';
  export let secondColumnLabel = '';

  export let width: number;
  export let height: number;

  $: processedData = data.map((d: WeightedBar) => ({
    ...d,
    inflation: d.inflation.mul(100).toNumber(),
    weighting: d.weighting.mul(100).toNumber(),
  }));

  // Use the highest/low inflation values

  let _xDomain: [number, number];
  $: {
    _xDomain = xDomain;

    // Ensure the passed in domain isn't smaller than the bars
    const xMax = processedData.reduce((x, d) => Math.max(x, d[xKey]), 0);
    const xMin = processedData.reduce((x, d) => Math.min(x, d[xKey]), 0);
    _xDomain[0] = Math.min(_xDomain[0], xMin - 1);
    _xDomain[1] = Math.max(_xDomain[1], xMax + 1);

    if (!expandX) {
      _xDomain = [0, 100];
    }
  }

  // Use the combined weightings (should add up to 100)
  $: yMax = processedData.reduce((x, d) => x + d[yKey], 0);
</script>

<div
  class="chart-container"
  style="
    width: {width}px;
    height: {height}px;
    padding-top: 50px;
    margin: auto;
  ">

  <div
    class="label-container"
    style="padding-left: 30px; padding-right: 50px;"
   >
    <h6>{label}</h6>

    {#if showSecondColumn}
      <h6>{secondColumnLabel}</h6>
    {/if}
  </div>

  {#if width && height}
    <LayerCake
      padding={{ top: 30, bottom: 10, left: 20, right: 50 }}
      x={xKey}
      y={yKey}
      xDomain={_xDomain}
      yDomain={[yMax, 0]}
      data={processedData}
    >
      <Svg>
        {#if expandX}
          <AxisX
            gridlines={false}
            baseline={true}
            snapTicks={true}
            axisLabel={'Inflation (%)'}
          />
        {/if}

        {#if expandX}
          <MarkerLine label="Headline inflation ({markerLine}%)" {markerLine} />
        {/if}

        <Bars {expandX} {showSecondColumn} {showDiscretionary} />

      </Svg>
    </LayerCake>
  {/if}
</div>

<style>
  .label-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: -40px;
    font-family: ABCSans, Helvetica, sans-serif;
  }
</style>
