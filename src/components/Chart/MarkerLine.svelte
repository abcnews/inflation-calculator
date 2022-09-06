<script>
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';
  const { height, xScale, yRange } = getContext('LayerCake');

  export let label = '';
  export let markerLine;
</script>

<line in:fade="{{ delay: 600 }}" class="marker" y1={-5} y2={$height} x1={$xScale(markerLine)} x2={$xScale(markerLine)} />
<text in:fade="{{ delay: 600 }}" class="marker-label" x={$xScale(markerLine)} y={-10}>{label}</text>

<style>
  .marker {
    stroke-dasharray: 2;
    stroke: #666; 
  }
  .marker-label {
    text-anchor: middle;
    fill: #666; 
    font-size: 10px;
  }
</style>
