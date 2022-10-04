<script lang="ts">
  import { LayerCake, Svg } from 'layercake';
  import type { WeightedBar } from '../../types';
  import { sortBars } from '../../utils';

  import Bars from './Bars.svg.svelte';
  import AxisX from './AxisX.svelte';
  // import MarkerLine from './MarkerLine.svelte';
  import AxisY from './AxisY.svelte';

  const xKey = 'inflation';
  const yKey = 'weighting';

  export let width: number;
  export let height: number;
  export let padding = { top: 50, bottom: 10, left: 40, right: 50 };

  export let data: WeightedBar[];
  export let xDomain: [number, number]; 

  export let zoomedInGroups: string[];
  export let highlightedGroups: string[];
  export let orderBy: string;

  export let expandX: boolean; 
  export let preventZoomSplitting: boolean;
  export let showLabel = true;

  export let yAxisLabel = 'Proportion of budget';
  export let xAxisLabel = 'Price increase (%)';
  export let label = '';

  //
  // States to manage the zoom in animation sequence:
  //
  // 0 -> Not started
  // 1 -> Re-order so groups at bottom (implemented in sortBars util)
  // 2 -> Re-size y-axis and hide other bars
  // 3 -> Split remaining bars
  // 4 -> Expand all up to full size
  // 5 -> Done
  export let zoomInAnimationStage = 0;

  const nextStage = () => {
    zoomInAnimationStage += 1;
    if (zoomInAnimationStage === 4) {
      setTimeout(() => nextStage(), 1000);
    } else if (zoomInAnimationStage < 4) {
      setTimeout(() => nextStage(), 1000);
    }
  };

  $: {
    if (zoomInAnimationStage === 0 && zoomedInGroups.length > 0) {
      if (preventZoomSplitting) {
        // Skip the full zoom-in animation in the intro explanation section (as this is the only place we're using this setting)
        zoomInAnimationStage = 5;
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
        isHighlighted: highlightedGroups.indexOf(d.name) > -1 || highlightedGroups.indexOf(d.group) > -1,
        isZoomed: zoomedInGroups.indexOf(d.group) > -1,
      }))

  // Use the highest/low inflation values
  let _xDomain: [number, number];
  $: {
    _xDomain = xDomain || [0, 0];

    // Ensure the passed in domain isn't smaller than the bars
    const xMax = processedData.reduce((x, d) => Math.max(x, d[xKey]), 0);
    const xMin = processedData.reduce((x, d) => Math.min(x, d[xKey]), 0);
    _xDomain[0] = Math.min(_xDomain[0], xMin);
    _xDomain[1] = Math.max(_xDomain[1], xMax);
  }

  $: yMax = processedData.reduce((x, d) => {
    if (zoomInAnimationStage > 4 && !d.isZoomed) {
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
  </div>

  {#if width && height}
    <LayerCake
      {padding}
      x={xKey}
      y={yKey}
      xDomain={_xDomain}
      yDomain={[yMax, 0]}
      data={processedData.filter(d => zoomInAnimationStage < 2 || d.isZoomed)}
    >
      <Svg>
        {#if expandX && xAxisLabel}
          <AxisX
            gridlines={false}
            baseline={true}
            snapTicks={true}
            axisLabel={'Price increase (%)'}
          />
        {/if}
          <AxisY
            gridlines={false}
            baseline={showLabel}
            ticks={0}
            {yAxisMax}
            axisLabel={showLabel ? `${yAxisMax > 97 ? 100 : Math.round(yAxisMax)}% of budget` : ''}
          />

        {#if yAxisLabel}
          <g style="transform: translate(-20px, -20px)">
            <g style="transform: scale(0.7) translate(23px, -26px) rotate(180deg)">
              <path
                class="y-axis-arrow"
                xmlns="http://www.w3.org/2000/svg"
                d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z"
              />
            </g>
            <text class="y-axis-label" style="transform: translate(-8px, 0px)">{yAxisLabel}</text>
            <g style="transform: scale(0.7) translate(0px, 16px)">
              <path
                class="y-axis-arrow"
                xmlns="http://www.w3.org/2000/svg"
                d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z"
              />
            </g>
          </g>
        {/if}

        <Bars {showLabel} />

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
  .y-axis-arrow {
    fill: black;
  }
  .y-axis-label {
    font-family: ABCSans, Helvetica, sans-serif;
    font-size: 12px;
    fill: black;
    font-weight: 400;
  }
</style>
