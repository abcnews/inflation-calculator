<!--
  @component
  Generates an SVG multi-series line chart. It expects your data to be an array of objects, each with a `values` key that is an array of data objects.
 -->
<script>
  import { getContext } from 'svelte';

  const { data, xGet, yGet, xScale, yScale } = getContext('LayerCake');

  $: path = values => {
    return 'M' + values
      .map(d => {
        return $xGet(d) + ',' + $yGet(d);
      })
      .join('L');
  };
</script>

<g class="line-group">
  {#each $data as group}
    <!-- style="transition: {$width > 0 ? 'all 1s' : 'none'}" -->
    <path
      class='path-line'
      d={path(group.values)}
      stroke={group.colour}
      style="stroke-width: {group.lineWidth}px"
    />
    <circle
      class='path-dot'
      fill={group.colour}
      cx={$xGet(group.values[1])}
      cy={$yGet(group.values[1])}
      r={4}
    />
  {/each}
</g>

<circle
  fill='rgba(229, 42, 0, 1)'
  cx={$xScale(0)}
  cy={$yScale(0)}
  r={4}
/>

<style>
  .path-line {
    fill: none;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 2px;
  }

  /* .path-dot { */
  /*   transition: all 1s; */
  /* } */
</style>
