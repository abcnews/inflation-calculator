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

  const MAX_SLOPE = 0.3;

  $: currentY = calculateInflationRate($indexStore);
  $: slope = group.annualInflation * 100 / MAX_SLOPE;
  $: current = slope * (currentY - minY) / (maxY - minY) || 0.001;
</script>

<div class="slider purple-theme">
  <div class="display">
    <div class="name">{group.name}</div>
    <div class="weighting">{(group.value * 100).toPrecision(2)}%</div>
  </div>

  <div class="control">
    <div class="slope-wrapper">
      <div class="maxy">{(maxY * 100).toPrecision(2)}%</div>
      <div class="miny">{(minY * 100).toPrecision(2)}%</div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="0,100 100,100 100,{100 - slope}" class="max" />
        <polygon points="0,100 100,100 100,{100 - current}" class="current" />
      </svg>
    </div>
    <Range
      value={group.value}
      min={0}
      max={group.cpiWeighting * 2}
      on:change={(e) => setValue(e.detail.value)}
    />
  </div>
</div>

<style lang="scss">
  .slider {
    padding-bottom: 2rem;
    width: 100%;
    display: flex;

    .display {
      width: 15%;
      display: flex;
      flex-direction: column;
      line-height: 2rem;

      .name {
        width: 200px;
        z-index: 10;
      }
    }
    .control {
      width: 85%;
      position: relative;

      .miny {
        font-size: 8pt;
        position: absolute;
        bottom: 27px;
        right: 5px;
      }
      .maxy {
        font-size: 8pt;
        position: absolute;
        top: 0px;
        right: 5px;
      }

    }

    svg {
      width: 100%;
      height: 50px;
      background: #f7edff;

      .max {
        fill: #a7029e;
      }
      .current {
        fill: #C368FF;
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
