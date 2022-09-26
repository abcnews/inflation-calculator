<script lang="ts">
  import { fade } from 'svelte/transition';
  
  export let point;
  export let innerLabel: string = '';
  export let leftLabel: string = '';
  export let rightLabel: string = '';

</script>

<!-- Needs an out transition to avoid leaving boxes behind... -->
<g
  class="weighted-bar"
  in:fade="{{ delay: 800 }}"
  out:fade="{{ duration: 1 }}"
  style="transform: translate({point.x}px, {point.y}px)"
>
  <rect
    x="0"
    y="0"
    height={point.height}
    width={point.width}
    opacity={point.opacity}
    fill={point.fill}
  ></rect>

  {#if point.height > 11}

    <!-- Label in the centre -->
    {#if point.width > 45 && innerLabel}
      <text
        out:fade
        in:fade="{{ delay: 400 }}"
        opacity={point.opacity}
        stroke={'white'}
        style="
          font-size: 12px;
          transform: translate({point.width / 2}px, {(point.height / 2) + 4}px);
          text-anchor: middle;
        "
      >
        {innerLabel}
      </text>
    {/if}

    <!-- Label to the right -->
    {#if rightLabel}
      <text
        out:fade
        in:fade="{{ delay: 400 }}"
        opacity={point.opacity}
        stroke={point.fill}
        style="
          font-size: 12px;
          transform: translate({point.width + 5}px, {(point.height / 2) + 4}px);
          text-anchor: start;
        "
      >
        {#if rightLabel.indexOf('Gas') === 0}
          <!-- Shortened to fit in the space -->
          Household fuels
        {:else if rightLabel.indexOf('Property rates and') === 0}
          <tspan x="0" dy="-0.5em">Property rates and</tspan>
          <tspan x="0" dy="1.2em">charges</tspan>
        {:else if rightLabel.indexOf('Maintenance and repair') === 0}
          <tspan x="0" dy="-0.5em">Maintenance and repair</tspan>
          <tspan x="0" dy="1.2em">of the dwelling</tspan>
        {:else if rightLabel.indexOf('Furnishings') === 0}
          <tspan x="0" dy="-0.5em">Furnishings, household equipment</tspan>
          <tspan x="0" dy="1.2em">and services</tspan>
        {:else}
          {rightLabel}
        {/if}
      </text>
    {/if}

    <!-- Label to the left -->
    {#if leftLabel}
      <text
        out:fade
        in:fade="{{ delay: 400 }}"
        opacity={point.opacity}
        stroke={point.fill}
        style="
          font-size: 12px;
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
      opacity 800ms;
  }

  text {
    font-family: ABCSans;
    font-size: 7pt;
    text-anchor: start;

    transition: transform 800ms, opacity 800ms;
  }
}
</style>
