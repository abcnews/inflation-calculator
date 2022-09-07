<script lang="ts">
  import { fade } from 'svelte/transition';
  
  export let point;
  export let innerLabel: string = '';
  export let leftLabel: string = '';
  export let rightLabel: string = '';

</script>

<g in:fade="{{ delay: 800 }}" class="weighted-bar" style="transform: translate({point.x}px, {point.y}px)">
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
        {rightLabel}
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
