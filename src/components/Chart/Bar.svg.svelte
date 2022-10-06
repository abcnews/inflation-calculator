<script lang="ts">
  import { fade } from 'svelte/transition';
  import { FOCUS, NON_FOCUS } from '../../colours';
  
  export let point;
  export let innerLabel: string = '';
  export let leftLabel: string = '';
  export let rightLabel: string = '';

  $: blockColour = point.isHighlighted ? FOCUS : NON_FOCUS;
  $: labelColour = point.isHighlighted ? FOCUS : 'black';

  // Push everything off the y-axis so it's easier to see
  $: xOffset = point.x > 0 ? 2 : -2;
  $: width = Math.max(point.width - 4, 1);
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

  {#if point.height > 11}

    <!-- Label in the centre -->
    {#if point.width > 45 && innerLabel}
      <text
        out:fade
        in:fade="{{ delay: 400 }}"
        fill={'white'}
        style="
          transform: translate({point.width / 2}px, {(point.height / 2) + 4}px);
          text-anchor: middle;
        "
      >
        {#if inner.indexOf('New dwelling') === 0}
          <tspan x="0" dy="-0.4em">New dwelling purchase</tspan>
          <tspan x="0" dy="1em">by owner-occupiers</tspan>
        {:else}
          {innerLabel}
        {/if{
      </text>
    {/if}

    <!-- Label to the right -->
    {#if rightLabel && !innerLabel}
      <text
        out:fade
        in:fade="{{ delay: 400 }}"
        fill={labelColour}
        style="
          transform: translate({point.width + 5}px, {(point.height / 2) + 4}px);
          text-anchor: start;
        "
      >
        <!-- Shortened (or wrapped-text) to fit in the space -->
        {#if rightLabel.indexOf('Gas') === 0}
          Household fuels
        {:else if rightLabel.indexOf('Deposit and loan facilities (direct charges)') === 0}
          Deposit and loan facilities
        {:else if rightLabel.indexOf('Property rates and') === 0}
          <tspan x="0" dy="-0.4em">Property rates &</tspan>
          <tspan x="0" dy="1em">charges</tspan>
        {:else if rightLabel.indexOf('Maintenance and repair') === 0}
          <tspan x="0" dy="-0.4em">Maintenance & repair</tspan>
          <tspan x="0" dy="1em">of the dwelling</tspan>
        {:else if rightLabel.indexOf('Furnishings') === 0}
          <tspan x="0" dy="-0.4em">Furnishings, household</tspan>
          <tspan x="0" dy="1em">equipment & services</tspan>
        {:else}
          {rightLabel.replace(/ and /g, ' & ')}
        {/if}
      </text>
    {/if}

    <!-- Label to the left -->
    {#if leftLabel}
      <text
        out:fade
        in:fade="{{ delay: 400 }}"
        stroke={point.fill}
        style="
          transform: translate({-5}px, {(point.height / 2) + 4}px);
          text-anchor: end;
        "
      >
        {leftLabel}
      </text>
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
      y 800ms,
  }

  text {
    font-family: ABCSans;
    text-anchor: start;
    letter-spacing: 0.03em;
    /* font-weight: 700; */
    font-size: 13px;
    font-weight: 700;

    transition: transform 800ms;
  }
}
</style>
