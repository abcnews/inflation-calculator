<script lang="ts">
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';
  import { FOCUS, NON_FOCUS, NON_FOCUS_ALT } from '../../colours';
  import { BarProps } from '../../types';

  const { xScale } = getContext('LayerCake');
  
  export let point: BarProps;
  export let budgetDescription: string;

  // Push everything off the y-axis so it's easier to see
  $: xOffset = 2;
  $: width = Math.max(point.width - 4, 1);

  const ANNOTATIONS_Y = {
    'Gas and other household fuels': -1,
    'Water and sewerage': 3,
    'Clothing and footwear': 1,
    'Communication': 1,
    'Alcohol and tobacco': 1,
    'Insurance': 4,
    'Oils and fats': 1,
    'Other cereal products': -1,
    'Eggs': 3,
    'Pork': -1,
    'Lamb and goat': -1,
    'Breakfast cereals': -1,
    'Other financial services': -2,
    'Deposit and loan facilities (direct charges)': 2,
  };

  const NO_ANNOTATIONS = [
    'Jams, honey and spreads',
  ];

  $: needsAnnotation = point.height < 10 && NO_ANNOTATIONS.indexOf(point.name) === -1;
  $: labelLocation = (point.width > $xScale.range()[1] * 0.6 && !needsAnnotation) ? 'inside' : 'right';

  $: annotationOffsetX = needsAnnotation ? 15 : 0;
  $: annotationOffsetY = needsAnnotation ? (ANNOTATIONS_Y[point.name] || 1) : 0;

  // Colours
  $: nonFocusColour = budgetDescription === 'Consumer price index' ? NON_FOCUS_ALT : NON_FOCUS;
  $: blockColour = point.isHighlighted ? FOCUS : nonFocusColour;
  $: labelColour = point.isHighlighted ? FOCUS : 'black';

  // Styling to apply to label
  $: wrapperX = labelLocation === 'inside' ? point.width / 2 : point.width + annotationOffsetX + xOffset;
  $: wrapperY = labelLocation === 'inside' ? (point.height / 2) + 4 : (point.height / 2) + 4 + annotationOffsetY;
  $: textAnchor = labelLocation === 'inside' ? 'middle' : 'start';
  $: textFill = labelLocation === 'inside' ? 'white' : labelColour;
  $: textWeight = point.isHighlighted ? 600 : 400;

  const showLabel = (p) => {
    if (p.name === 'Oils and fats') {
      return true;
    }

    if (point.name === 'Other food products n.e.c.') {
      return p.height > 13;
    }

    return p.height > 8;
  };

  $: percentageLabelOffsetX = point.name === 'Automotive fuel' ? 53 : 21;
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
  />

  {#if showLabel(point)}

    {#if needsAnnotation && labelLocation === 'right'}
      <line class="annotation-line"
        x1={point.width + 4}
        x2={point.width + annotationOffsetX + xOffset - 2}
        y1={point.height / 2}
        y2={point.height / 2 + annotationOffsetY}
      />
    {/if}
    
    <g class="text-wrapper" style="transform: translate({wrapperX}px, {wrapperY}px);">
      <text
        out:fade
        in:fade="{{ delay: 400 }}"
        style="
          fill: {textFill};
          text-anchor: {textAnchor};
          font-weight: {textWeight};
        "
      >
        <!-- Shortened (or wrapped-text) to fit in the space -->
        {#if point.name.indexOf('Gas') === 0}
          Household fuels
        {:else if point.name.indexOf('Interest') === 0}
          Mortgage repayments
        {:else if point.name.indexOf('Deposit and loan facilities (direct charges)') === 0}
          Deposit and loan facilities
        {:else if point.name.indexOf('Other food products') === 0}
          Other
        {:else if point.name.indexOf('Property rates and') === 0}
          Property rates
        {:else if point.name.indexOf('Maintenance and repair') === 0}
          <tspan x="0" dy="-0.4em">Maintenance & repair</tspan>
          <tspan x="0" dy="1em">of the dwelling</tspan>
        {:else if point.name.indexOf('Furnishings') === 0}
          <tspan x="0" dy="-0.4em">Furnishings, household</tspan>
          <tspan x="0" dy="1em">equipment & services</tspan>
        {:else if point.name.indexOf('Food and') === 0}
          <tspan x="0" dy="-0.4em">Food & non-alchoholic</tspan>
          <tspan x="0" dy="1em">beverages</tspan>
        {:else if point.name.indexOf('New dwelling') === 0}
          <tspan x="0" dy="-0.4em">New dwelling purchase</tspan>
          <tspan x="0" dy="1em">by owner-occupiers</tspan>
        {:else}
          {point.name.replace(/ and /g, ' & ')}
        {/if}
      </text>
      {#if point.budgetPercent}
        <text
          class="percent-label"
          style="
            transform: translate({0}px, 20px);
          "
        >
          {Math.floor(point.budgetPercent)}% of budget
        </text>
      {/if}
    </g>

  {/if}
</g>

<style lang="scss">
.weighted-bar {
  transition: transform 800ms;
  --axis-colour: #646464;

  rect {
    transition: 
      width 800ms,
      height 800ms,
      x 800ms,
      y 800ms;

    transition-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  }

  .percent-label {
    font-family: ABCSans;
    font-size: 12px;
    font-weight: 400;
    fill: var(--axis-colour);
    text-anchor: left;
  }

  text {
    font-family: ABCSans;
    text-anchor: start;
    letter-spacing: 0.03em;
    font-size: 13px;
    line-height: 15.6px;
    font-weight: 400;
  }

  .text-wrapper {
    transition: transform 800ms;
    transition-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  }

  .annotation-line {
    stroke: black;
  }
}
</style>
