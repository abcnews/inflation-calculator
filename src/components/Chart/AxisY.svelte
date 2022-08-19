<script>
  import { getContext } from 'svelte';

  const { padding, xScale, height } = getContext('LayerCake');

</script>

<line class="baseline" x1="{$xScale(0)}" x2="{$xScale(0)}" y1="0" y2="{$height}" />

<style>
  .baseline {
    stroke: #aaa;
  }
</style>
