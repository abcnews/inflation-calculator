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

  let bars;
  $: {
    const anyHighlighted = $data.reduce((acc, d) => acc || d.isHighlighted, false);

    bars = $data.reduce((acc, d) => {
      const height = $yGet(d) - 1;

      // Set the width to 1/3 of the canvas
      const width = ($xScale.range()[1] - $xScale.range()[0]) / 6,


      const point = {
        id: d.name,
        fill: d.colour,
        name: d.name,
        opacity: anyHighlighted && !d.isHighlighted ? '0.4' : '1',

        // round up to 1 pixel so there's a tiny sliver of bar when inflation=0 
        width: (width || 1),
        x: $xScale.range()[0],

        // 1 pixel of whitespace between bars
        height: height - 1,
        y: acc.y,

        leftLabel: showLabels && formatPercentage($y(d)),
        rightLabel: d.name,
      };

      return {
        y: acc.y + height,
        points: [...acc.points, point],
      };
    }, { y: 0, points: [] });

    bars = bars.points;
    bars.sort((a, b) => a.id.localeCompare(b.id));
  }
</script>

<AxisY formatTick={d => `${d}%`} />

<g class="bars-group">
  {#each bars as d (d.id)}
    <Bar
      point={d}
      leftLabel={d.leftLabel}
      rightLabel={d.rightLabel}
    />
  {/each}
  <text style="transform: translate(0px, {$yScale(totalInflation) + 7}px)">Inflation for the past year = {formatPercentage(totalInflation)}</text>
</g>

<style lang="scss">
  .bars-group {
    text {
      fill: #666;
      font-size: 14px;
      transition: transform 800ms;
    }
  }
</style>
