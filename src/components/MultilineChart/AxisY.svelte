<!--
  @component
  Generates an HTML y-axis.
 -->
<script>
  import { getContext } from 'svelte';

  const { width, padding, xRange, xScale, yScale } = getContext('LayerCake');

  export let baseline = false;

  /** @type {Boolean} [gridlines=true] - Extend lines from the ticks into the chart space */
  export let gridlines = true;

  /** @type {Boolean} [tickMarks=false] - Show a vertical mark for each tick. */
  export let tickMarks = false;

  /** @type {Function} [formatTick=d => d] - A function that passes the current tick value and expects a nicely formatted value in return. */
  export let formatTick = d => d;

  /** @type {Number|Array|Function} [ticks=4] - If this is a number, it passes that along to the [d3Scale.ticks](https://github.com/d3/d3-scale) function. If this is an array, hardcodes the ticks to those values. If it's a function, passes along the default tick values and expects an array of tick values in return. */
  export let ticks = 4;

  export let xTick = 0;
  export let yTick = 0;
  export let dxTick = -50;
  export let dyTick = 4;

  /** @type {String} [textAnchor='start'] The CSS `text-anchor` passed to the label. This is automatically set to "end" if the scale has a bandwidth method, like in ordinal scales. */
  export let textAnchor = 'end';

  $: isBandwidth = typeof $yScale.bandwidth === 'function';

  $: tickVals = Array.isArray(ticks) ? ticks :
    isBandwidth ?
      $yScale.domain() :
      typeof ticks === 'function' ?
        ticks($yScale.ticks()) :
          $yScale.ticks(ticks);
</script>

<g class='axis y-axis' transform='translate({$padding.left}, 0)'>
  {#each tickVals as tick (tick)}
    <g class='tick tick-{tick}' transform='translate({$xRange[0] + (isBandwidth ? $padding.left : 0)}, {Math.floor($yScale(tick))})'>
      {#if gridlines !== false}
        <line
          class="gridline"
          x1='0'
          x2='{$xRange[1] + $padding.left + 10}'
          y1={yTick + (isBandwidth ? ($yScale.bandwidth() / 2) : 0)}
          y2={yTick + (isBandwidth ? ($yScale.bandwidth() / 2) : 0)}
        ></line>
      {/if}
      {#if tickMarks === true}
        <line
          class='tick-mark'
          x1='0'
          x2='{isBandwidth ? -6 : 6}'
          y1={yTick + (isBandwidth ? ($yScale.bandwidth() / 2) : 0)}
          y2={yTick + (isBandwidth ? ($yScale.bandwidth() / 2) : 0)}
        ></line>
      {/if}
      <text
        x='{xTick}'
        y='{yTick + (isBandwidth ? $yScale.bandwidth() / 2 : 0)}'
        dx='{isBandwidth ? -9 : dxTick}'
        dy='{isBandwidth ? 7 : dyTick}'
        style="text-anchor:{isBandwidth ? 'end' : textAnchor};"
      >{formatTick(tick)}</text>
    </g>
  {/each}

  {#if baseline}
    <line class="baseline" x1="{-$padding.left}" x2="{$xRange[1] - $padding.left}" y1={$yScale(0)} y2="{$yScale(0)}" />
  {/if}

</g>

<style>
  .tick {
    font-size: .725em;
    font-weight: 700;
  }
  .baseline {
    stroke: rgba(100, 100, 100, 0.2);
  }

  .tick-0 > .gridline {
    stroke: #838FA0 !important;
  }

  .tick line {
    stroke: #aaa;
  }
  .tick .gridline {
    stroke-dasharray: 2;
    stroke: #31363C;
  }

  .tick text {
    fill: black;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }
</style>
