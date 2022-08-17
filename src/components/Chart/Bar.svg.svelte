<script>
  import { getContext } from 'svelte';

  const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

  // Toggle between 2D Bar chart and expanded weighted area chart
  export let expandX;

  $: bars =  $data.reduce((acc, d) => {
    let width = $xGet(d);
    let x = $xScale(0);
    if (width <= 0 && expandX) {
      width = Math.abs(x);
      x = x - width;
    }

    const point = {
      x,
      y: acc.y,
      height: $yGet(d),
      width: expandX ? width : '5%',
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
  {#each bars as d, i (d.text)}
    <rect
      class='group-rect'
      data-id="{i}"
      x="{d.x}"
      y="{d.y}"
      height={d.height}
      width="{d.width}"
      fill={d.fill}
    ></rect>
    <text y={d.y + (d.height / 2) + 2} x={d.x + d.width} >{d.text}</text>
  {/each}
</g>

<style>
  .bar-group text {
    font-family: ABCSans;
    font-size: 6pt;
    transition: x 2s;
  }

  .group-rect {
    transition: width,x 2s;
  }
</style>
