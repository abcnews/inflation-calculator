<script lang="ts">
  import { LayerCake, Svg, Html } from 'layercake';
  import { scaleOrdinal } from 'd3-scale';

  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  import MultiLine from './MultiLine.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';
  import Labels from './GroupLabels.html.svelte';
  // import SharedTooltip from './SharedTooltip.html.svelte';
  // import OverlayBox from './OverlayBox.html.svelte';

  interface Point {
    x: number;
    y: number;
    z: string;
  }

  interface LineData {
    label: string;
    colour: string;
    values: Point[];
  }

  export let inflationRate: number;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rateTweened = tweened(0, {
    duration: prefersReducedMotion ? 1 : 800,
    easing: cubicOut,
  });
  $: rateTweened.set(inflationRate);

  $: data = [
    {
      label: 'Official rate',
      labelColour: 'black',
      colour: 'rgba(0, 123, 199, 1)',
      lineWidth: 2,
      values: [
        { x: 0, y: 0 },
        { x: 1, y: 6.1 },
      ]
    },
    {
      label: `Your personal rate`,
      colour: 'rgba(229, 42, 0, 1)',
      lineWidth: 2.5,
      values: [
        { x: 0, y: 0 },
        { x: 1, y: $rateTweened },
      ]
    }
  ];


  /* --------------------------------------------
   * Construct the dataLong data structure
   */
  const addZ = (data: any[]): LineData[] => {
    return data.map(d => ({
      ...d,
      values: d.values.map((v: any) => ({ ...v, z: d.label })),
    }));
  };

  /* --------------------------------------------
   * Make a flat array of the `values` of our nested series
   * we can pluck the field set from `yKey` from each item
   * in the array to measure the full extents
   */
  const flatten = (data: LineData[]): Point[] => data.reduce(
    (memo: Point[], group: LineData) => {
      return memo.concat(group.values);
    },
    []
  );

  const formatTickX = (d: number): string => {
    if (d === 0) {
      return 'Your budget at\nlast year\'s prices';
    }
    if (d === 1) {
      return 'Cost of same\nitems now';
    }
    return '';
  };
  const formatTickY = (d: number): string => d === 0 ? '' : '';

  let width: number;
  $: dataLong = addZ(data);
  $: numTicksX = Math.min(width / 50, dataLong[0].values.length);
</script>

<style>
  /*
    The wrapper div needs to have an explicit width and height in CSS.
    It can also be a flexbox child or CSS grid element.
    The point being it needs dimensions since the <LayerCake> element will
    expand to fill it.
  */
  .chart-container {
    height: 250px;
    width: 100%;
    max-width: 500px;
    font-family: "ABCSans";
    margin: 50px auto;
    padding-left: 20px;
    margin-bottom: 80px;
  }

  .chart-container :global(svg) {
    z-index: 5;
  }
</style>

<div class="chart-container" bind:clientWidth={width}>
  <LayerCake
    padding={{ top: 7, right: 140, bottom: 20, left: 70 }}
    x={'x'}
    y={'y'}
    z={'z'}
    zScale={scaleOrdinal()}
    zRange={dataLong.map(d => d.colour)}
    flatData={flatten(dataLong)}
    data={dataLong}
  >
    <Svg>
      <AxisX
        gridlines={false}
        ticks={numTicksX}
        formatTick={formatTickX}
        snapTicks={false}
        baseline={true}
      />
      <AxisY
        gridlines={false}
        ticks={1}
        formatTick={formatTickY}
      />
      <MultiLine/>
    </Svg>

    <Html>
      <Labels/>
      <!-- <SharedTooltip -->
      <!--   formatTitle={formatTickX} -->
      <!--   formatValue={formatTickY} -->
      <!--   dataset={flatten(dataLong)} -->
      <!-- /> -->
    </Html>
  </LayerCake>
</div>
