<script lang="ts">
  import { setContext } from 'svelte';
  import { derived, writable } from 'svelte/store';
  import { Decimal } from 'decimal.js-light';

  import WeightedIndexChart from './Chart/WeightedIndexChart.svelte';

  import Select from 'carbon-components-svelte/src/Select/Select.svelte';
  import SelectItem from 'carbon-components-svelte/src/Select/SelectItem.svelte';

  import 'carbon-components/scss/components/select/_select.scss';
  import 'carbon-components/scss/globals/scss/_css--body.scss';
  import 'carbon-components/scss/globals/scss/_css--helpers.scss';

  import { calculateInflationRate, deriveChartData } from '../model';
  import { InflationData, Customisation } from '../types';

  import { defaultCustomisation } from '../constants';

  export let indexData: InflationData;

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(indexData);
  
  // Create store for controlling the chart
  const stateStore = writable<any>({ ...defaultCustomisation,
    orderBy: 'area',
  });
  setContext('customisation', stateStore);

  export const outputStore = derived(
    [inflationStore, stateStore],
    ([inflationData, customisation]) => deriveChartData(inflationData as any, customisation as Customisation)
  );

  const formatPercentage = (x: Decimal): string => `${x.mul(100).toPrecision(2)}%`;
  $: inflationOutput = formatPercentage(calculateInflationRate($inflationStore, $stateStore));
  $: inflationDiff = formatPercentage(new Decimal(0.061).sub(calculateInflationRate($inflationStore, $stateStore)));

  // const xKey = 'inflation';
  // const yKey = 'contribution';
  //
  // $: processedData = $outputStore.map((d: WeightedBar) => ({
  //   ...d,
  //   inflation: d.inflation.mul(100).toNumber(),
  //   weighting: d.weighting.mul(100).toNumber(),
  //   contribution: d.weighting.mul(d.inflation).mul(100).toNumber(),
  // }));
  //
  // const updateWeighting = (field, value) => {
  //   stateStore.set({
  //     ...$stateStore,
  //     weightOverrides: {
  //       ...$stateStore.weightOverrides,
  //       [field]: new Decimal(value / 100) }
  //     })
  // }

  let QUESTIONS = [
    {
      id: 'drive',
      text: "Do you drive?",
      answered: false,
      choices: [
        {
          label: "Yes",
        },
        {
          label: "No",
        },
      ],
    },
    {
      id: 'housing',
      text: "Do you rent or own?",
      answered: false,
      choices: [
        {
          label: "Rent",
        },
        {
          label: "Own outright",
        },
        {
          label: "Own with a mortgage",
        },
      ],
    },
    {
      id: 'vices',
      text: "Do you drink and/or smoke?",
      answered: false,
      choices: [
        {
          label: "Drink",
        },
        {
          label: "Smoke",
        },
        {
          label: "Neither",
        },
        {
          label: "Both",
        },
      ],
    },
    {
      id: 'income',
      text: "Where do you get most of your income? (This lets us roughly estimate the rest)",
      answered: false,
      choices: [
        {
          label: "Salary / wages",
        },
        {
          label: "Age pension",
        },
        {
          label: "Superannuation",
        },
        {
          label: "Other govt. payments",
        },
      ],
    }
  ];

  let hiddenGroups = [
    'Transport',
    'Housing',
    'Alcohol and tobacco',
    'Clothing and footwear',
    'Communication',
    'Education',
    'Health',
    'Insurance and financial services',
    'Recreation and culture',
    'Food and non-alcoholic beverages',
    'Furnishings, household equipment and services',
  ];

  let lastAnswered = -1;
  const answerQuestion = (answer, question, qIndex) => {
    question.answered = true;
    lastAnswered = Math.max(qIndex, lastAnswered);

    let removedGroups = $stateStore.removedGroups;
    let housingProfile = $stateStore.housingProfile;
    let index = $stateStore.index;

    // Do you drive?
    if (question.id === 'drive') {
      hiddenGroups = hiddenGroups.filter(g => g !== 'Transport');

      removedGroups = removedGroups.filter(g => g !== 'Automotive fuel' && g !== 'Motor vehicles');
      if (answer === 'No') {
        removedGroups = [...removedGroups, 'Automotive fuel', 'Motor vehicles'];
      }
    }

    // Do you rent or own?
    if (question.id === 'housing') {
      hiddenGroups = hiddenGroups.filter(g => g !== 'Housing');

      if (answer === 'Rent') {
        housingProfile = 'renter';
      }
      if (answer === 'Own outright') {
        housingProfile = 'outright';
      }
      if (answer === 'Own with a mortgage') {
        housingProfile = 'mortgage';
      }
    }

    // Do you drink or smoke?
    if (question.id === 'vices') {
      hiddenGroups = hiddenGroups.filter(g => g !== 'Alcohol and tobacco');
      removedGroups = removedGroups.filter(g => g !== 'Tobacco' && g !== 'Wine' && g !== 'Spirits' && g !== 'Beer');

      if (answer === 'Drink') {
        removedGroups = [...removedGroups, 'Wine', 'Spirits', 'Beer'];
      }
      if (answer === 'Smoke') {
        removedGroups = [...removedGroups, 'Tobacco'];
      }
      if (answer === 'Neither') {
        removedGroups = [...removedGroups, 'Tobacco', 'Wine', 'Spirits', 'Beer'];
      }
    }

    if (question.id === 'income') {
      hiddenGroups = [];
      if (answer === 'Salary / wages') {
        index = 'employed';
      }
      if (answer === 'Age pension') {
        index = 'agepension';
      }
      if (answer === 'Superannuation') {
        index = 'superannuation';
      }
      if (answer === 'Other govt. payments') {
        index = 'othergovt';
      }
    }

    stateStore.set({
      ...$stateStore,
      index,
      removedGroups,
      housingProfile,
    });
  };

  let width;
  $: {
    if (lastAnswered === 3) {
      const quizRoot = document.querySelector('#interactive-quiz');
      quizRoot.classList.add('finished'); // This unhides the rest of the article
    }
  }
</script>

<div bind:clientWidth={width}>
  <WeightedIndexChart
    data={$outputStore}
    hiddenGroups={hiddenGroups}
    xDomain={[-5, 20]}
    yAxisLabel="Your budget breakdown"
    expandX={false}
    showSecondColumn={false}
    width={width}
    height={500}
  />
</div>

{#each QUESTIONS as question, i}
  <Select
    labelText={question.text}
    on:change={e => answerQuestion(e.detail, question, i)}
    disabled={i > lastAnswered + 1}
  >
    <SelectItem text={""} disabled />
    {#each question.choices as choice}
      <SelectItem value={choice.label} text={choice.label} />
    {/each}
  </Select>
{/each}

{#if lastAnswered === 3}
  <p class="result">Your personal inflation rate is {inflationOutput}. That's {inflationDiff} lower than the headline figure.</p>
{:else}
  <p class="result">To continue reading, complete the quiz above.</p>
{/if}


<style lang="scss">
  :global(#interactive-quiz:not(.finished) ~ *) {
    display: none;
  }

  :global(.bx--select) {
    padding: 0.3rem;
  }
  :global(.bx--label) {
    color: #111;
    font-size: 13px;
    font-family: 'ABCSans';
  }
  .result {
    font-size: 1rem;
    font-family: 'ABCSans';
    font-weight: bold;
    margin-top: 30px;
  }
</style>
