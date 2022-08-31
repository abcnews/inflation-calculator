<script>
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';

  const { data, xGet, yGet, x, y, xScale, yScale } = getContext('LayerCake');

  // Toggle between 2D Bar chart and expanded weighted area chart
  export let expandX;
  export let showSecondColumn;
  // export let showDiscretionary;

  let bars;
  $: {
    const totalArea = $data.reduce((acc, d) => acc + $x(d) * $y(d), 0);
    const anyHighlighted = $data.reduce((acc, d) => acc || d.isHighlighted, false);

    bars = $data.reduce((acc, d) => {

      let width = $xGet(d);
      let xVal = $xScale(0);
      width = width - xVal;

      // If it's a negative value, we need to shift it to the left
      if (width < 0) {
        width = Math.abs(width);
        xVal = xVal - width;
      }

      // Set the width to 1/3 of the canvas
      if (!expandX) {
        xVal = $xScale.range()[0];
        width = ($xScale.range()[1] - xVal) / 6;
      }

      const proportionOfTotal = $x(d) * $y(d) / totalArea;
      const heightCombined = $yScale.range()[0] * proportionOfTotal;

      const point = {
        id: d.name,
        x: xVal,
        fill: d.colour,
        text: `${d.name}`,

        opacity: anyHighlighted && !d.isHighlighted ? '0.4' : '1',

        // 1 pixel of whitespace between bars
        height: $yGet(d) - 1,
        y: acc.y,

        yCombined: acc.yCombined,
        heightCombined: heightCombined - 1,

        // round up to 1 so there's a tiny sliver of bar when inflation=0 
        width: (width || 1),
      };

      return {
        y: acc.y + $yGet(d),
        yCombined: acc.yCombined + heightCombined,
        points: [...acc.points, point],
      };
    }, { y: 0, yCombined: 0, points: [] });

    bars = bars.points;
    bars.sort((a, b) => a.id.localeCompare(b.id));
  }

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

<g class="bars-group">
  {#each bars as d (d.id)}
    <g class="weighted-bar" style="transform: translate({d.x}px, {d.y}px)">
        <rect
          x="0"
          y="0"
          height={d.height}
          width={d.width}
          opacity={d.opacity}
          fill={d.fill}
        ></rect>

      {#if d.height > 8}
        <text
          out:fade
          in:fade="{{ delay: 400 }}"
          opacity={d.opacity}
          stroke={d.fill}
          style="
            transform: translate({d.width + 7}px, {(d.height / 2) + 4}px);
          "
        >
          {d.text}
        </text>
      {/if}
    </g>

    {#if showSecondColumn}
      <g class="weighted-bar" in:fade style="transform: translate({d.x}px, {d.y}px)">
        <polygon
          out:fade
          in:fade="{{ delay: 400 }}"
          points="
            {d.width},0
            {d.width},{d.height}
            {$xScale.range()[1] - d.width},{d.yCombined - d.y + d.heightCombined}
            {$xScale.range()[1] - d.width},{d.yCombined - d.y}
          "
          fill={d.fill}
          opacity={Math.max(d.opacity - 0.7, 0.2)}
        />

        <!-- in:grow="{{ width:d.width, x: $xScale.range()[1] - d.width, delay: 400 }}"  -->
        <!-- in:fade="{{ delay: 400 }}" -->
        <rect
          x={$xScale.range()[1] - d.width}
          y={d.yCombined - d.y}
          height={d.heightCombined}
          width={d.width}
          opacity={d.opacity}
          fill={d.fill}
        ></rect>
      </g>
    {/if}
  {/each}
</g>

<style lang="scss">
  .weighted-bar {
    transition: transform 800ms;
    transition-delay: 400ms;

    rect, polygon {
      transition: width 800ms, height 800ms, fill 800ms, x 800ms, y 800ms;
      /* transition: all 800ms; */
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
