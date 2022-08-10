<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import Range from "./Range.svelte"
  import { InflationIndex, calculateInflationRate } from '../../model';

  export let name: string;

  const indexStore = getContext<Writable<InflationIndex>>('inflation-index');

  $: group = $indexStore[name];
  const setValue = (value: number) => {
    $indexStore[name].value = value;
  };

  $: minY = calculateInflationRate({
    ...$indexStore,
    [name]: { ...group, value: 0 },
  });
  $: maxY = calculateInflationRate({
    ...$indexStore,
    [name]: { ...group, value: group.cpiWeighting * 2 },
  });

  const MAX_SLOPE = 0.35;

  $: currentY = calculateInflationRate($indexStore);
  $: slope = group.annualInflation * 100 / MAX_SLOPE;
  $: current = slope * (currentY - minY) / (maxY - minY) || 0.001;
</script>

<div class="slider purple-theme">
  <div class="display">
    <div class="name">{group.name}</div>
  </div>

  <div class="control">
    <div
      class="slope-wrapper"
      style="
        --min-y: {100 - 15}px;
        --max-y: {100 - slope - 15}px;
      "
    >
      <div class="ylabel">Inflation</div>
      <div class="maxy">{(maxY * 100).toPrecision(2)}%</div>
      <!-- Only show min if there's a big enough gap -->
      {#if maxY * 100 > minY * 100 + 0.5}
        <div class="miny">{(minY * 100).toPrecision(2)}%</div>
      {/if}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="0,100 100,100 100,{100 - slope}" class="max" />
        <polygon points="0,100 100,100 100,{100 - current}" class="current" />
        <line x1="50" y1="00" x2="50" y2="100" class="midpoint">
      </svg>
    </div>

    <div class="range-wrapper">
      <div class="range-label">{0}%</div>
      <Range
        value={group.value}
        min={0}
        max={group.cpiWeighting * 2}
        on:change={(e) => setValue(e.detail.value)}
      />
      <div class="range-label">{(100 * group.cpiWeighting * 2).toPrecision(2)}%</div>
    </div>
  </div>
</div>

<style lang="scss">
  .slider {
    position: relative;
    display: flex;
    padding-bottom: 2rem;
    width: 100%;

    .display {
      position: absolute;
      display: flex;
      top: 0;
      left: 0;
      flex-direction: column;
      padding: 1rem;

      .name {
        z-index: 10;
      }
    }

    .control {
      width: 100%;
      position: relative;

      .range-wrapper {
        display: flex;
        width: calc(100% - 45px);
      }
      .range-label {
        width: 20px;
      }
      .miny {
        font-size: 8pt;
        position: absolute;
        top: var(--min-y);
        right: 45px;
      }
      .maxy {
        font-size: 8pt;
        position: absolute;
        top: var(--max-y);
        right: 45px;
      }
      .ylabel {
        font-size: 8pt;
        position: absolute;
        top: 0px;
        right: -5px;
        text-align: right;
      }

    }

    svg {
      /* padding for y axis label */
      width: calc(100% - 45px);
      height: 100px;
      background: #f7edff;

      .max {
        fill: #a7029e;
      }
      .current {
        fill: #C368FF;
      }

      .midpoint {
        stroke: grey;
        stroke-dasharray: 4;
        stroke-width: 0.4px;
      }
    }
  }

  .purple-theme {
		--track-focus: #C368FF;
		--track-highlight-bgcolor: #C368FF;
		--track-highlight-bg: linear-gradient(90deg, #C368FF, #C965FF);
		--thumb-holding-outline: rgba(191, 102, 251, 0.3);
		--tooltip-bgcolor: #C368FF;
		--tooltip-bg: linear-gradient(45deg, #C368FF, #C965FF);
	}
</style>
