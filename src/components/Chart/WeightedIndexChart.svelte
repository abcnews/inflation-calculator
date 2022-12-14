<script lang="ts">
  import { slide } from 'svelte/transition';
  import { LayerCake, Svg } from 'layercake';

  import type { WeightedBar } from '../../types';
  import { sortBars } from '../../utils';

  import Bars from './Bars.svg.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';

  const xKey = 'inflation';
  const yKey = 'weighting';

  export let width: number;
  export let height: number;
  export let padding = { top: 70, bottom: 10, left: 40, right: 40 };

  export let data: WeightedBar[];
  export let xDomain: [number, number]; 

  export let zoomedInGroups: string[];
  export let highlightedGroups: string[];
  export let orderBy: string;

  export let expandX: boolean; 
  export let preventZoomSplitting: boolean;

  export let xAxisLabel = 'Price increase';
  export let budgetDescription: string;

  //
  // States to manage the zoom in animation sequence:
  //
  // 0 -> Not started
  // 1 -> Re-order so groups at bottom (implemented in sortBars util), hide other bars, re-size y-axis
  // 3 -> Split remaining bars
  // 2 -> Re-size y-axis and hide other bars
  // 3 -> Expand all up to full size
  // 4 -> Done
  export let zoomInAnimationStage = 0;

  const nextStage = () => {
    zoomInAnimationStage += 1;
    if (zoomInAnimationStage < 4) {
      setTimeout(() => nextStage(), 1200);
    }
  };

  $: {
    if (zoomInAnimationStage === 0 && zoomedInGroups.length > 0) {
      if (preventZoomSplitting) {
        // Skip the full zoom-in animation in the intro explanation section (as this is the only place we're using this setting)
        zoomInAnimationStage = 4;
      } else {
        nextStage();
      }
    } else if (zoomedInGroups.length === 0) {
      zoomInAnimationStage = 0;
    }
  }

  $: processedData = data
      .sort(sortBars(orderBy, zoomInAnimationStage > 0 ? zoomedInGroups : []))
      .map((d: WeightedBar) => ({
        ...d,
        inflation: d.inflation.mul(100).toNumber(),
        weighting: d.weighting.mul(100).toNumber(),
        expandX,
        isHighlighted: highlightedGroups.indexOf(d.name) > -1 && (zoomInAnimationStage < 1 || zoomInAnimationStage > 3),
        isZoomed: zoomedInGroups.indexOf(d.group) > -1,
      }))

  // Use the highest/low inflation values (x axis)
  let _xDomain: [number, number];
  $: {
    _xDomain = xDomain || [0, 0];

    // Ensure the passed in domain isn't smaller than the bars
    const xMax = processedData.reduce((x, d) => Math.max(x, d[xKey]), 0);
    const xMin = Math.max(0, processedData.reduce((x, d) => Math.min(x, d[xKey]), 0));
    _xDomain[0] = Math.min(_xDomain[0], xMin);
    _xDomain[1] = Math.min(Math.max(_xDomain[1], xMax), 100);
  }

  // Determine the budget % of all the bars combined (y axis)
  $: yMax = processedData.reduce((x, d) => {
    if (zoomInAnimationStage > 2 && !d.isZoomed) {
      return x;
    }
    return x + d[yKey];
  }, 0);
  $: yAxisMax = processedData.reduce((x, d) => {
    if (zoomInAnimationStage > 1 && !d.isZoomed) {
      return x;
    }
    return x + d[yKey];
  }, 0);

  $: showZoomTitle = zoomedInGroups.length === 1 && (zoomedInGroups.indexOf('Housing') > -1 || zoomedInGroups.indexOf('Food and non-alcoholic beverages') > -1) && zoomInAnimationStage > 3;
</script>

{#if showZoomTitle}
  <div in:slide class="zoomed-in-title">{zoomedInGroups[0].replace('and', '&')}</div>
{/if}
<div
  class="chart-container"
  style="
    width: {width}px;
    height: {height - (showZoomTitle ? 30 : 0)}px;
    margin: auto;
  ">

  {#if width && height}
    <LayerCake
      {padding}
      x={xKey}
      y={yKey}
      xDomain={_xDomain}
      yDomain={[yMax, 0]}
      data={processedData.filter(d => zoomInAnimationStage < 1 || d.isZoomed)}
    >
      <Svg>
        {#if expandX && xAxisLabel}
          <AxisX
            gridlines={false}
            baseline={true}
            snapTicks={false}
            ticks={6}
            axisLabel={'Price increase'}
          />
        {/if}

        <AxisY
          gridlines={false}
          baseline={true}
          ticks={0}
          {yAxisMax}
          {budgetDescription}
          {zoomInAnimationStage}
        />

        <Bars {budgetDescription} />

      </Svg>
    </LayerCake>
  {/if}
</div>

<style lang="scss">
  .zoomed-in-title {
    font-family: ABCSans;
    font-weight: 700;
    font-size: 15px;
    line-height: 18px;
    text-align: center;

    margin-top: 20px;
    margin-bottom: -10px;
  }
</style>
