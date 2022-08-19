<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import type { WeightedBar } from '../../model';
  // import { scaleBand } from 'd3-scale';

  import Bar from './Bar.svg.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';

  const xKey = 'inflation';
  const yKey = 'weighting';

  export let data: WeightedBar[];
  export let expandX: boolean; 
  // export let timelineYears: number; // 1 or 10
  export let xDomain: [number, number]; 

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

<style>
  /*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
  */
  .chart-container {
    width: 90%;
    height: 80vh;
    margin: 2rem;
  }
</style>

<div class="chart-container">
  <LayerCake
    padding={{ top: 0, bottom: 20, left: 35 }}
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
        />
      {/if}
      <!-- <AxisY -->
      <!--   gridlines={false} -->
      <!-- /> -->
      <Bar {expandX} />
    </Svg>
  </LayerCake>
</div>
