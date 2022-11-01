<script lang="ts">
  import { getContext } from 'svelte';
  import { BarProps, WeightedBar } from '../../types';

  import Bar from './Bar.svg.svelte';

  export let budgetDescription = '';

  const { data, xGet, yGet, y, xScale, yScale } = getContext('LayerCake');
  
  const calcBars = (data: WeightedBar[], xRange: number[], yRange: number[]): BarProps[] => {
    const res = data.reduce((acc, d) => {
      let width = $xGet(d);
      let xVal = $xScale(0);
      width = width - xVal;

      // If it's a negative value, we need to shift it to the left
      if (width < 0) {
        width = Math.abs(width);
        xVal = xVal - width;
      }

      // Set the width to 1/3 of the canvas
      if (!d.expandX) {
        xVal = $xScale(0);
        width = (xRange[1] - xVal) / 10;
      }

      const height = Math.max($yGet(d), 1);

      const point = {
        name: d.name,
        isHighlighted: d.isHighlighted,

        // Show the % of entire budget for the first scrollyteller
        budgetPercent: (!d.expandX && budgetDescription === 'typical budget') ? $y(d) : undefined,

        y: acc.y - height,
        x: xVal,

        // round up to 1 so there's a tiny sliver of bar when inflation=0 
        width: width > 1 ? width : 1,
        // 1 pixel of whitespace between bars
        height: height - 1,
      };

      return {
        y: acc.y - height, 
        points: [...acc.points, point],
      };
    }, { y: yRange[0], points: [] as BarProps[] });

    return res.points.sort((a, b) => a.name.localeCompare(b.name));
  };

  $: bars = calcBars($data, $xScale.range(), $yScale.range());
</script>

{#each bars as d (d.name)}
  <Bar point={d} {budgetDescription} />
{/each}
