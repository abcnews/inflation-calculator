<script>
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';
  const { width, height, xScale, yRange } = getContext('LayerCake');

  export let axisLabel = '';

  export let gridlines = true;
  export let tickMarks = false;
  export let baseline = false;
  export let snapTicks = false;

  export let formatTick = d => d;
  export let ticks = undefined;
  export let xTick = 0;
  export let yTick = 16;

  $: isBandwidth = typeof $xScale.bandwidth === 'function';

  $: tickVals = Array.isArray(ticks) ? ticks :
    isBandwidth ?
      $xScale.domain() :
      typeof ticks === 'function' ?
        ticks($xScale.ticks()) :
          $xScale.ticks(ticks);

  function textAnchor(i) {
    if (snapTicks === true) {
      if (i === 0) {
        return 'start';
      }
      if (i === tickVals.length - 1) {
        return 'end';
      }
    }
    return 'middle';
  }
</script>

<g in:fade class="axis x-axis" class:snapTicks>
  {#each tickVals as tick, i (tick)}
    <g in:fade="{{ delay: 600 }}" class="tick tick-{i}" transform="translate({$xScale(tick)},{Math.max(...$yRange)})">
      {#if gridlines !== false}
        <line class="gridline" y1={$height * -1} y2="0" x1="0" x2="0" />
      {/if}
      {#if tickMarks === true}
        <line
          class="tick-mark"
          y1={0}
          y2={6}
          x1={xTick || isBandwidth ? $xScale.bandwidth() / 2 : 0}
          x2={xTick || isBandwidth ? $xScale.bandwidth() / 2 : 0}
        />
      {/if}
      <text
        x={xTick || isBandwidth ? $xScale.bandwidth() / 2 : 0}
        y={yTick}
        dx=""
        dy=""
        text-anchor={textAnchor(i)}>{formatTick(tick)}%</text
      >
    </g>
  {/each}
  {#if baseline === true}
    <line class="baseline" y1={$height + 2} y2={$height + 2} x1="0" x2={$width} />
  {/if}
  {#if axisLabel}
    <text class="axis-label" x={$xScale.range()[1]} y={$yRange[0] + 35}>{axisLabel}</text>
  {/if}
</g>

<style>
  .x-axis {
    --axis-colour: #646464;
  }

  .tick {
    font-size: 12px;
    font-weight: 400;
    transition: transform 1s;
    font-family: ABCSans, Helvetica, sans-serif;
  }

  .axis-label {
    font-family: ABCSans, Helvetica, sans-serif;
    font-size: 12px;
    fill: var(--axis-colour);
    text-anchor: end;
  }

  line,
  .tick line {
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
