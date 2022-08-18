<script>
  import { getContext } from 'svelte';

  const { data, xGet, yGet, xScale } = getContext('LayerCake');

  // Toggle between 2D Bar chart and expanded weighted area chart
  export let expandX;

  $: bars =  $data.reduce((acc, d) => {

    let width = $xGet(d);
    let x = $xScale(0);
    width = width - x;

    // If it's a negative value, we need to shift it to the left
    if (width < 0) {
      width = Math.abs(width);
      x = x - width;
    }

    // Set the width to 1/3 of the canvas
    if (!expandX) {
      x = $xScale.range()[0];
      width = ($xScale.range()[1] - x) / 3; 
    }

    const point = {
      x,
      y: acc.y,
      height: $yGet(d),
      // round up to 1 so there's a tiny sliver of bar when inflation=0 
      width: (width || 1),
      fill: d.colour,
      text: d.name,
    };

    return {
      y: acc.y + $yGet(d),
      points: [...acc.points, point],
    };
  }, { y: 0, points: [] }).points;

</script>

<g class="bar-group">
  {#each bars as d (d.text)}
    <g class="weighted-bar" style="transform: translate({d.x}px, {d.y}px)">
      <rect
        x="0"
        y="0"
        height={d.height}
        width={d.width}
        fill={d.fill}
      ></rect>
      {#if d.height > 8}
        <text style="transform: translate({d.width}px, {(d.height / 2) + 2}px);">{d.text}</text>
      {/if}
    </g>
  {/each}
</g>

<style lang="scss">
  .bar-group text {
    font-family: ABCSans;
    font-size: 6pt;
  }

  .weighted-bar {
    transition: transform 2s;

    rect {
      transition: width 2s, height 2s;
    }
    text {
      text-anchor: start;
      transition: transform 2s;
    }
  }
</style>
