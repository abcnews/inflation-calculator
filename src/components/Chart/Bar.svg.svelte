<script>
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';
  // import { FOCUS, NON_FOCUS } from '../../colours';

  const { data, xGet, yGet, xScale } = getContext('LayerCake');

  // Toggle between 2D Bar chart and expanded weighted area chart
  export let expandX;
  // export let showDiscretionary;

  $: bars =  $data.reduce((acc, d) => {

    let width = $xGet(d);
    let x = $xScale(0);
    width = width - x;

    // If it's a negative value, we need to shift it to the left
    if (width < 0) {
      width = Math.abs(width);
      x = x - width;
    }

    // Set the width to 1/3 of the canvas
    if (!expandX) {
      x = $xScale.range()[0];
      width = ($xScale.range()[1] - x) / 3; 
    }

    let fill = d.colour;
    // if (showDiscretionary) {
    //   fill = d.isDiscretionary ? FOCUS : NON_FOCUS;
    // }

    const point = {
      id: d.name,
      x,
      y: acc.y,
      // 1 pixel of whitespace between bars
      height: $yGet(d) - 1,
      // round up to 1 so there's a tiny sliver of bar when inflation=0 
      width: (width || 1),
      fill,
      text: `${d.name} (${(d.inflation * d.weighting / 100).toPrecision(2)}%)`,
    };

    return {
      y: acc.y + $yGet(d),
      points: [...acc.points, point],
    };
  }, { y: 0, points: [] }).points;

  function grow(_, {
    delay = 0,
    duration = 400,
    width,
    x
  }) {
    // Grow in the other direction when negative value
    const zeroX = $xScale(0);
    if (x !== zeroX) {
      return {
        delay,
        duration,
        css: t => `transform: translateX(${(1 - t) * (zeroX - width)}px); width: ${t * width}`
      }
    }

    return {
      delay,
      duration,
      css: t => `width: ${t * width}`
    };
  }
</script>

<g class="bar-group">
  {#each bars as d (d.id)}
    <g class="weighted-bar" style="transform: translate({d.x}px, {d.y}px)">
      <rect
        in:grow="{{ width:d.x, x: d.x, delay: 800 }}" 
        out:grow="{{ width:d.x, x: d.x }}" 
        x="0"
        y="0"
        height={d.height}
        width={d.width}
        fill={d.fill}
      ></rect>
      {#if d.height > 8}
        <text
          out:fade
          in:fade="{{ delay: 400 }}"
          stroke={d.fill}
          style="
            transform: translate({d.width + 2}px, {(d.height / 2) + 2}px);
          "
        >
          {d.text}
        </text>
      {/if}
    </g>
  {/each}
</g>

<style lang="scss">
  .weighted-bar {
    transition: transform 800ms;
    transition-delay: 400ms;

    rect {
      transition: width 800ms, height 800ms;
      transition-delay: 400ms;
    }

    text {
      font-family: ABCSans;
      font-size: 7pt;
      text-anchor: start;

      transition: transform 800ms;
      transition-delay: 400ms;
    }
  }
</style>
