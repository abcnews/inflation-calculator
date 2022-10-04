<script>
  import { getContext } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const { padding, height, xRange, xScale, yScale } = getContext('LayerCake');

  export let gridlines = true;
  export let tickMarks = false;
  export let formatTick = d => d;
  export let baseline = false;
  export let ticksAtZeroX = false;
  export let ticks = 4;
  export let xTick = 0;
  export let yTick = 0;
  export let dxTick = 0;
  export let dyTick = -4;
  export let textAnchor = 'start';

  export let yAxisMax;

  export let axisLabel = '';

  $: isBandwidth = typeof $yScale.bandwidth === 'function';

  $: tickVals = Array.isArray(ticks) ? ticks :
    isBandwidth ?
      $yScale.domain() :
      typeof ticks === 'function' ?
        ticks($yScale.ticks()) :
          $yScale.ticks(ticks);

  $: yOffset = -$padding.left;
  $: tickOffset = (ticksAtZeroX ? $xScale(0) : 0) - 20;


  const yAxisTop = tweened($height, {
    duration: 1000,
    easing: cubicOut,
  });
  $: yAxisTop.set($height - $yScale(yAxisMax));

</script>

<g class='axis y-axis' transform='translate({yOffset}, 0)'>
  {#each tickVals as tick (tick)}
    <g class='tick tick-{tick}' transform='translate({$xRange[0] + (isBandwidth ? $padding.left : 0) + tickOffset - yOffset}, {$yScale(tick)})'>
      {#if gridlines !== false}
        <line
          class="gridline"
          x2='100%'
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
        dy='{isBandwidth ? 4 : dyTick}'
        style="text-anchor:{isBandwidth ? 'end' : textAnchor};"
      >{formatTick(tick)}</text>
    </g>
  {/each}

  {#if baseline}
    <!-- <line class="baseline" x1="{$xScale(0) - yOffset}" x2="{$xScale(0) - yOffset}" y1="0" y2="{$height}" /> -->
    <line class="baseline" x1="{-1 * yOffset}" x2="{-1 * yOffset}" y1={$yAxisTop} y2="{$height}" />
  {/if}

  {#if axisLabel}
    <text class="axis-label" x={-1 * yOffset} y={$yAxisTop - 5}>{axisLabel}</text>
  {/if}
</g>

<style>
  .tick {
    font-family: ABCSans, Helvetica, sans-serif;
    font-size: 0.725em;
    font-weight: 200;
    transition: transform 1s;
  }

  .axis-label {
    font-family: ABCSans, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 400;
    fill: black;
    text-anchor: start;
  }

  line,
  .tick line {
    stroke: #aaa;
    stroke-dasharray: 2;
  }

  .baseline {
    stroke: #666;
  }
  .tick text {
    fill: #666;
  }

  .tick .tick-mark,
  .baseline {
    stroke-dasharray: 0;
  }
  /* This looks slightly better */
  .axis.snapTicks .tick:last-child text {
    transform: translateX(3px);
  }
  .axis.snapTicks .tick.tick-0 text {
    transform: translateX(-3px);
  }
</style>
