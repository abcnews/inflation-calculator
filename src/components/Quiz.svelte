<script lang="ts">
  import { Decimal } from 'decimal.js-light';

  import Select from 'carbon-components-svelte/src/Select/Select.svelte';
  import SelectItem from 'carbon-components-svelte/src/Select/SelectItem.svelte';

  import 'carbon-components/scss/components/select/_select.scss';
  import 'carbon-components/scss/globals/scss/_css--body.scss';
  import 'carbon-components/scss/globals/scss/_css--helpers.scss';

  import { defaultCustomisation, CPI } from '../constants';
  import { calculateInflationRate } from '../model';
  import { InflationData } from '../types';

  export let indexData: InflationData;
  export let onCustomisationChange = (x) => x;

  let customisation = {
    removedGroups: ['New dwelling purchase by owner-occupiers'],
    housingProfile: '',
  };

  $: onCustomisationChange(customisation);

  const formatPercentage = (x: Decimal): string => `${x.mul(100).toPrecision(2)}%`;

  $: personalInflation = calculateInflationRate(indexData, { ...defaultCustomisation, ...customisation });
  $: inflationDiff = CPI.sub(personalInflation); 

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
      text: "Do you rent or own your home?",
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
  ];

  let lastAnswered = -1;
  const answerQuestion = (answer, question, qIndex) => {
    question.answered = true;
    lastAnswered = Math.max(qIndex, lastAnswered);

    let removedGroups = customisation.removedGroups;
    let housingProfile = customisation.housingProfile;

    // Do you drive?
    if (question.id === 'drive') {
      removedGroups = removedGroups.filter(g => g !== 'Automotive fuel' && g !== 'Motor vehicles');
      if (answer === 'No') {
        removedGroups = [...removedGroups, 'Automotive fuel', 'Motor vehicles'];
      }
    }

    // Do you rent or own?
    if (question.id === 'housing') {
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

    customisation = {
      removedGroups,
      housingProfile,
    };
  };

  $: isFinished = lastAnswered === 2;
  $: {
    if (isFinished) {
      const quizRoot = document.querySelector('#interactive-quiz');
      quizRoot?.classList.add('finished'); // This unhides the rest of the article
    }
  }
</script>


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

{#if isFinished}
  <p class="result">
    We've estimated that your personal inflation rate is {formatPercentage(personalInflation)}.
    That's {formatPercentage(inflationDiff)} lower than the headline figure.
  </p>
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
