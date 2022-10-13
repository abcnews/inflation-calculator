<!--
  @component
  Generates HTML text labels for a nested data structure. It places the label near the y-value of the highest x-valued data point. This is useful for labeling the final point in a multi-series line chart, for example. It expects your data to be an array of objects where each has `values` field that is an array of data objects. It uses the `z` field accessor to pull the text label.
 -->
<script>
  import { getContext } from 'svelte';
  import { max } from 'd3-array';

  const { data, x, y, xScale, yScale, xRange, yRange } = getContext('LayerCake');

  /* --------------------------------------------
   * Title case the first letter
   */
  const cap = val => val.replace(/^\w/, d => d.toUpperCase());

  /* --------------------------------------------
   * Put the label on the highest value
   */
  $: left = values => $xScale(max(values, $x)) /  Math.max(...$xRange);
  $: top = group => {
    const { values, label } = group;
    const finalValue = $yScale($y(values[values.length - 1]));

    // Avoid overlapping labels
    if (label === 'Your personal rate') {
      return finalValue + 22;
    } else {
      return finalValue + 8;
    }
  }
</script>

{#each $data as group}
  <div
    class="label"
    style="
      color: {group.labelColour || group.colour};
      top: {top(group)}px;
      left: calc({left(group.values) * 100}% + 110px);
    "
  ><span style="font-weight:900">{group.values[1].y.toFixed(1) + '%'}</span> {cap((group.label))}</div>
{/each}

<style>
  .label {
    position: absolute;
    transform: translate(-100%, -100%);
    width: 100px;
    font-size: 12px;
    font-weight: 700;
    z-index: 19;
    /* transition: all 1s; */
  }
</style>
