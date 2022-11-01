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
  export let budgetDescription;
  export let zoomInAnimationStage;

  $: isBandwidth = typeof $yScale.bandwidth === 'function';

  $: tickVals = Array.isArray(ticks) ? ticks :
    isBandwidth ?
      $yScale.domain() :
      typeof ticks === 'function' ?
        ticks($yScale.ticks()) :
          $yScale.ticks(ticks);

  $: tickOffset = (ticksAtZeroX ? $xScale(0) : 0) - 20;

  const yAxisTop = tweened($height, {
    duration: 800,
    easing: cubicOut,
  });
  $: yAxisTop.set($height - $yScale(yAxisMax));
</script>

<g class='axis y-axis' transform='translate({$padding.left}, 0)'>
  {#each tickVals as tick (tick)}
    <g class='tick tick-{tick}' transform='translate({$xRange[0] + (isBandwidth ? $padding.left : 0) + tickOffset - $padding.left}, {$yScale(tick)})'>
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
    <line class="baseline" x1="{$xScale(0) - $padding.left}" x2="{$xScale(0) - $padding.left}" y1={$yAxisTop - 5} y2="{$height + 2}" />
    <line class="baseline-tick" x1="{$xScale(0) - $padding.left - 4}" x2="{$xScale(0) - $padding.left}" y1={$yAxisTop - 5} y2="{$yAxisTop - 5}" />
  {/if}

  <text class="axis-label" transform="translate({$xScale(0) - $padding.left - 20} {$yAxisTop - 30})">
    {#if budgetDescription === 'typical budget'}
      <tspan x="0" dy="0">Proportion of</tspan>
      <tspan x="0" dy="1.2em">typical budget</tspan>
    {:else if budgetDescription === 'renter' || budgetDescription === 'outright owner' || budgetDescription === 'mortgage holder'}
      <tspan x="0" dy="0">
        <tspan class:extra={yAxisMax < 97 && zoomInAnimationStage > 1} class="bold">{yAxisMax > 97 ? 100 : Math.round(yAxisMax)}%</tspan>
        of {budgetDescription.split(' ')[0]}
      </tspan>
      <tspan x="0" dy="1.2em">{budgetDescription.split(' ')[1] || ''} budget</tspan>
    {:else if budgetDescription === 'Consumer price index'}
      <tspan x="0" dy="0">
        <tspan class:extra={yAxisMax < 97 && zoomInAnimationStage > 1} class="bold">{yAxisMax > 97 ? 100 : Math.round(yAxisMax)}%</tspan>
          of Consumer
        </tspan>
      <tspan x="0" dy="1.2em">Price Index (CPI)</tspan>
    {:else}
      <tspan x="0" dy="0">
        <tspan class:extra={yAxisMax < 97 && zoomInAnimationStage > 1} class="bold">{yAxisMax > 97 ? 100 : Math.round(yAxisMax)}%</tspan>
          of
        </tspan>
      <tspan x="0" dy="1.2em">{budgetDescription}</tspan>
    {/if}
  </text>
</g>

<style lang="scss">
  .y-axis {
    --axis-colour: #646464;
  }

  .tick {
    font-family: ABCSans, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 400;
    transition: transform 1s;
  }

  .axis-label {
    font-family: ABCSans, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 400;
    fill: var(--axis-colour);
    text-anchor: start;

    .bold {
      font-weight: 700;
    }
    .extra {
      fill: black;
    }
  }

  .tick line {
    stroke: var(--axis-colour);
    stroke-dasharray: 2;
  }

  .baseline-tick,
  .baseline {
    stroke: var(--axis-colour);
  }
  .tick text {
    fill: var(--axis-colour);
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
