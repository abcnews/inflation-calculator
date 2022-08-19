<script lang="ts">
  import Tabs from 'carbon-components-svelte/src/Tabs/Tabs.svelte';
  import Tab from 'carbon-components-svelte/src/Tabs/Tab.svelte';
  import TabContent from 'carbon-components-svelte/src/Tabs/TabContent.svelte';

  import { setContext } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { Decimal } from 'decimal.js-light';

  import { calculateInflationRate, calculateInflationRate2, deriveChartData, InflationData, Customisation, ExpenditureGroupWeights } from '../../model';

  import Chart from '../Chart/WeightedIndexChart.svelte';
  import PropertiesTab from '../PropertiesTab.svelte';

  import '../../builder.scss';

  export let data: InflationData;

  export let index: keyof ExpenditureGroupWeights = 'employed';
  export let timelineYears: 1 | 10 = 1;
  export let splitGroups = ['Transport', 'Housing', 'Alcohol and tobacco'];
  export let removedGroups = ['Tobacco'];
  export let expandInflation = true;

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(data);

  // Create store with the personalisation params
  const customisationStore = writable<Customisation>({
    index,
    timelineYears,
    splitGroups,
    removedGroups,
    expandInflation,
    weightOverrides: {},
  } as Customisation);
  setContext('customisation', customisationStore);
  $: customisationStore.set({
    index,
    timelineYears,
    splitGroups,
    removedGroups,
    expandInflation,
    weightOverrides: {},
  });

  export const outputStore = derived(
    [inflationStore, customisationStore],
    ([inflationData, customisation]) => deriveChartData(inflationData, customisation)
  );

  const formatPercentage = (x: Decimal): string => `${x.mul(100).toString()}%`;
  $: inflationOutput = formatPercentage(calculateInflationRate($inflationStore, $customisationStore));
  $: inflationOutput2 = formatPercentage(calculateInflationRate2($inflationStore, $customisationStore));

  $: xDomain = $customisationStore.timelineYears == 1 ? [-5, 35] : [-42, 80];
</script>

<main>
  <article>
    Estimated inflation: <span class="inflation-rate">{inflationOutput}</span>
    Estimated inflation 2: <span class="inflation-rate">{inflationOutput2}</span>
    <figure>
      <Chart
        data={$outputStore}
        expandX={$customisationStore.expandInflation}
        {xDomain}
      />
    </figure>
    </article>

  <aside>
    <Tabs autoWidth>
      <Tab label="Properties" />
      <svelte:fragment slot="content">
        <TabContent><PropertiesTab /></TabContent>
      </svelte:fragment>
    </Tabs>
  </aside>
</main>


<style lang="scss">
  :global(body) {
    margin: 0;
  }

  .inflation-rate {
    color: #a7029e;
  }

  main {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    min-height: 100vh;
  }

  article {
    flex: 0 0 auto;
    margin: auto;
    width: 100%;
    max-width: 52rem;
    padding: 3rem;
  }

  figure {
    margin: auto;
  }

  aside {
    flex: 1 1 100%;
    border-top: 2px solid #e0e0e0;
    width: 100%;
  }

  @media (min-width: 72rem) {
    aside {
      align-self: stretch;
      margin: 0;
      border-top: 0;
      border-left: 2px solid #e0e0e0;
      max-width: 32rem;
      max-height: 100vh;
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }

  aside :global(.bx--tabs) {
    position: relative;
  }

  aside :global(.bx--tabs)::before {
    content: '';
    z-index: 0;
    position: absolute;
    top: calc(2.5rem - 2px);
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #e0e0e0;
  }

  aside :global(.bx--accordion) {
    margin: -1rem;
    width: calc(100% + 2rem);
  }

  aside :global(.bx--accordion__item):first-child {
    border-top: 0;
  }

  aside :global(.bx--accordion__content) {
    padding-right: 1rem !important;
  }
</style>
