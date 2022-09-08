<script lang="ts">
  //
  // Used for the interactive sliders
  //
  import { getContext } from 'svelte';
  import Bar from './Bar.svg.svelte';
  import AxisY from './AxisY.svelte';

  const { data, x, y, xScale, yScale, yGet } = getContext('LayerCake');

  export let showLabels: boolean;
  
  const formatPercentage = (x): string => `${(x).toPrecision(2)}%`;

  $: totalInflation = $data.reduce((acc, d) => acc + $y(d), 0);
      // Set the width to 1/3 of the canvas
  $: barWidth = ($xScale.range()[1] - $xScale.range()[0]) / 6;

  let bars;
  $: {
    const anyHighlighted = $data.reduce((acc, d) => acc || d.isHighlighted, false);

    bars = $data.reduce((acc, d) => {
      const height = $yScale.range()[0] - $yGet(d);

      const point = {
        id: d.name,
        fill: d.colour,
        name: d.name,
        opacity: anyHighlighted && !d.isHighlighted ? '0.4' : '1',

        // round up to 1 pixel so there's a tiny sliver of bar when inflation=0 
        width: (barWidth || 1),
        x: $xScale.range()[0],

        // 1 pixel of whitespace between bars
        height: height - 1,
        y: acc.y - height,

        leftLabel: showLabels && formatPercentage($y(d)),
        rightLabel: d.name,
      };

      return {
        y: acc.y - height,
        points: [...acc.points, point],
      };
    }, { y: $yScale.range()[0], points: [] });

    bars = bars.points;
    bars.sort((a, b) => a.id.localeCompare(b.id));
  }
</script>

<AxisY formatTick={d => `${d}%`} />

<g class="bars-group" style="transform: translate(10px, 0px)">
  {#each bars as d (d.id)}
    <Bar
      point={d}
      leftLabel={d.leftLabel}
      rightLabel={d.rightLabel}
    />
  {/each}
  <text
    style="transform: translate({barWidth + 10}px, {$yScale(totalInflation) + 4}px)"
  >
    Inflation = {formatPercentage(totalInflation)}
  </text>
  <line
    x1="{barWidth - 5}"
    x2="{barWidth + 5}"
    style="transform: translate(0px, {$yScale(totalInflation)}px)"
    stroke="black"
  />
  <!-- <text style="transform: translate(0px, {$yScale.range()[1] - 7}px)">{formatPercentage(totalInflation)} inflation</text> -->

</g>

<style lang="scss">
  .bars-group {

    text,
    line {
      font-size: 18px;
      font-family: ABCSans;
      font-weight: 600;
      stroke-width: 2px;
      transition: transform 800ms;
    }
  }
</style>
