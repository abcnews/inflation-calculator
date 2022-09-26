<script lang="ts">
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';

  import Bar from './Bar.svg.svelte';

  const { data, xGet, yGet, x, y, xScale, yScale } = getContext('LayerCake');
  
  const formatPercentage = (x): string => `${(x).toPrecision(2)}%`;

  // Toggle between 2D Bar chart and expanded weighted area chart
  export let expandX: boolean;
  export let showSecondColumn: boolean;
  export let hiddenGroups: string[] = [];
  export let showLabel = true;

  let bars;
  $: {
    const totalArea = $data.reduce((acc, d) => acc + $x(d) * $y(d), 0);
    const anyHighlighted = $data.reduce((acc, d) => acc || d.isHighlighted, false);

    bars = $data.reduce((acc, d) => {
      // Skip hidden groups
      if (hiddenGroups && hiddenGroups.indexOf(d.name) > -1) {
        return acc;
      }

      let width = $xGet(d);
      let xVal = $xScale(0);
      width = width - xVal;

      // If it's a negative value, we need to shift it to the left
      if (width < 0) {
        width = Math.abs(width);
        xVal = xVal - width;
      }

      // Set the width to 1/3 of the canvas
      if (!expandX) {
        xVal = $xScale.range()[0] + 30;
        width = ($xScale.range()[1] - xVal) / 6;
      }

      const proportionOfTotal = $x(d) * $y(d) / totalArea;
      const heightCombined = $yScale.range()[0] * proportionOfTotal;
      const height = Math.max($yGet(d), 1);

      const point = {
        id: d.name,
        x: xVal,
        fill: d.colour,
        name: d.name,

        // areaLabel: formatPercentage($x(d) * $y(d) / 100),
        labelY: formatPercentage($y(d)),
        labelYCombined: formatPercentage(proportionOfTotal * 100),

        opacity: anyHighlighted && !d.isHighlighted ? '0.4' : '1',

        // 1 pixel of whitespace between bars
        height: height - 1,
        y: acc.y - height,

        yCombined: acc.yCombined,
        heightCombined: heightCombined - 1,

        // round up to 1 so there's a tiny sliver of bar when inflation=0 
        width: width > 1 ? width : 1,
      };

      return {
        y: acc.y - height, 
        yCombined: acc.yCombined + heightCombined,
        points: [...acc.points, point],
      };
    }, { y: $yScale.range()[0], yCombined: 0, points: [] });

    bars = bars.points;
    bars.sort((a, b) => a.id.localeCompare(b.id));
  }
</script>

<g class="bars-group">
  {#each bars as d (d.id)}
    <Bar
      point={d}
      innerLabel={showLabel && d.width > $xScale.range()[1] * 0.7 && d.name}
      rightLabel={showLabel && d.width <= $xScale.range()[1] * 0.7 && d.name}
    />
  {/each}
</g>

<style lang="scss">
</style>
