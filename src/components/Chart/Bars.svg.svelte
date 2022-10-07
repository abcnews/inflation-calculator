<script lang="ts">
  import { getContext } from 'svelte';
  // import { fade } from 'svelte/transition';

  import Bar from './Bar.svg.svelte';

  const { data, xGet, yGet, x, y, xScale, yScale } = getContext('LayerCake');
  
  const formatPercentage = (x): string => `${(x).toPrecision(2)}%`;

  export let showLabel = true;

 const calcBars = (data, xRange, yRange) => {
   const totalArea = data.reduce((acc, d) => acc + $x(d) * $y(d), 0);

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

      const proportionOfTotal = $x(d) * $y(d) / totalArea;
      const heightCombined = yRange[0] * proportionOfTotal;
      const height = Math.max($yGet(d), 1);

      const point = {
        id: d.name,
        x: xVal,
        name: d.name,
        isHighlighted: d.isHighlighted,

        // areaLabel: formatPercentage($x(d) * $y(d) / 100),
        labelY: formatPercentage($y(d)),
        labelYCombined: formatPercentage(proportionOfTotal * 100),

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
    }, { y: yRange[0], yCombined: 0, points: [] });

    return res.points.sort((a, b) => a.id.localeCompare(b.id));
  };

  $: bars = calcBars($data, $xScale.range(), $yScale.range());
</script>

{#each bars as d (d.id)}
  <Bar
    point={d}
    {showLabel}
  />
{/each}

<style lang="scss">
</style>
