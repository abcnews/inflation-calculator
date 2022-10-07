<script lang="ts">
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';
  import { FOCUS, NON_FOCUS } from '../../colours';

  const { xScale } = getContext('LayerCake');
  
  export let point;
  export let showLabel: boolean;

  // export let innerLabel: string = '';
  // export let rightLabel: string = '';

  $: blockColour = point.isHighlighted ? FOCUS : NON_FOCUS;
  $: labelColour = point.isHighlighted ? FOCUS : 'black';

  // Push everything off the y-axis so it's easier to see
  $: xOffset = point.x > 0 ? 2 : -2;
  $: width = Math.max(point.width - 4, 1);

  $: needsAnnotation = point.height < 10;
  $: labelLocation = (point.width > $xScale.range()[1] * 0.7 && !needsAnnotation) ? 'inside' : 'right';

  const ANNOTATIONS_Y = {
    'Gas and other household fuels': -1,
    'Water and sewerage': 3,
    'Clothing and footwear': 1,
    'Communication': 1,
    'Alcohol and tobacco': 1,
    'Insurance': 4,
    'Other financial services': -2,
    'Deposit and loan facilities (direct charges)': 1,
  };

  $: annotationOffsetX = needsAnnotation ? 15 : 0;
  $: annotationOffsetY = needsAnnotation ? (ANNOTATIONS_Y[point.name] || 3) : 0;
</script>

<!-- Needs an out transition to avoid leaving boxes behind... -->
<g
  class="weighted-bar"
  in:fade="{{ delay: 800 }}"
  out:fade="{{ duration: 1 }}"
  style="transform: translate({point.x + xOffset}px, {point.y}px)"
>
  <rect
    x="0"
    y="0"
    height={point.height}
    width={width}
    fill={blockColour}
  ></rect>

  {#if showLabel && point.height > 6}
    {#if labelLocation === 'inside'}
        <g class="text-wrapper" style="transform: translate({point.width / 2}px, {(point.height / 2) + 4}px);">
          <text
            out:fade
            in:fade="{{ delay: 400 }}"
            fill={'white'}
            style="
              text-anchor: middle;
            "
          >
            <!-- Shortened (or wrapped-text) to fit in the space -->
            {#if point.name.indexOf('New dwelling') === 0}
              <tspan x="0" dy="-0.4em">New dwelling purchase</tspan>
              <tspan x="0" dy="1em">by owner-occupiers</tspan>
            {:else}
              {point.name.replace(/ and /g, ' & ')}
            {/if}
          </text>
        </g>

      {:else if labelLocation === 'right'}

        {#if needsAnnotation}
          <line class="annotation-line"
            x1={point.width + 4}
            x2={point.width + annotationOffsetX + xOffset - 2}
            y1={point.height / 2}
            y2={point.height / 2 + annotationOffsetY}
          />
        {/if}

        <g
          class="text-wrapper"
          style="
            transform: translate({point.width + annotationOffsetX + xOffset}px, {(point.height / 2) + 4 + annotationOffsetY}px);
          "
        >
          <text
            out:fade
            in:fade="{{ delay: 400 }}"
            fill={labelColour}
            style="
              text-anchor: start;
            "
          >
            <!-- Shortened (or wrapped-text) to fit in the space -->
            {#if point.name.indexOf('Gas') === 0}
              Household fuels
            {:else if point.name.indexOf('Deposit and loan facilities (direct charges)') === 0}
              Deposit and loan facilities
            {:else if point.name.indexOf('Property rates and') === 0}
              Property rates
            {:else if point.name.indexOf('Maintenance and repair') === 0}
              <tspan x="0" dy="-0.4em">Maintenance & repair</tspan>
              <tspan x="0" dy="1em">of the dwelling</tspan>
            {:else if point.name.indexOf('Furnishings') === 0}
              <tspan x="0" dy="-0.4em">Furnishings, household</tspan>
              <tspan x="0" dy="1em">equipment & services</tspan>
            {:else}
              {point.name.replace(/ and /g, ' & ')}
            {/if}
          </text>
        </g>
      {/if}
    {/if}
</g>

<style lang="scss">
.weighted-bar {
  transition: transform 800ms;

  rect {
    transition: 
      width 800ms,
      height 800ms,
      x 800ms,
      y 800ms;

    transition-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  }

  text {
    font-family: ABCSans;
    text-anchor: start;
    letter-spacing: 0.03em;
    font-size: 13px;
    font-weight: 400;
  }

  .text-wrapper {
    transition: transform 800ms;
    transition-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  }

  .annotation-line {
    stroke: black;
  }
}
</style>
