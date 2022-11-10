<script lang="ts">
  import { Decimal } from 'decimal.js-light';

  import LineChart from './MultilineChart/LineChart.svelte';
  import ButtonGroup from '../lib/components/ButtonGroup.svelte';

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

  const formatPercentage = (x: Decimal): string => `${x.mul(100).toFixed(1)}%`;

  $: personalInflation = calculateInflationRate(indexData, { ...defaultCustomisation, ...customisation });
  $: inflationDiff = CPI.sub(personalInflation); 
  // $: inflationPerc = personalInflation.div(CPI); 

  let QUESTIONS = [
    {
      id: 'drive',
      text: "Do you drive?",
      answered: '',
      choices: [
        {
          label: "Yes",
          value: "Yes",
        },
        {
          label: "No",
          value: "No",
        },
      ],
    },
    {
      id: 'housing',
      text: "Do you rent or own your home?",
      answered: '',
      choices: [
        {
          label: "Rent",
          value: "Rent",
        },
        {
          label: "Own outright",
          value: "Own outright",
        },
        {
          label: "Own with a mortgage",
          value: "Own with a mortgage",
        },
      ],
    },
    {
      id: 'vices',
      text: "Do you drink and/or smoke?",
      answered: '',
      choices: [
        {
          label: "Drink",
          value: "Drink",
        },
        {
          label: "Smoke",
          value: "Smoke",
        },
        {
          label: "Neither",
          value: "Neither",
        },
        {
          label: "Both",
          value: "Both",
        },
      ],
    },
  ];

  let lastAnswered = -1;
  const answerQuestion = (answer, question, qIndex) => {
    question.answered = answer;
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
        removedGroups = [...removedGroups, 'Tobacco'];
      }
      if (answer === 'Smoke') {
        removedGroups = [...removedGroups, 'Wine', 'Spirits', 'Beer'];
      }
      if (answer === 'Neither') {
        removedGroups = [...removedGroups, 'Tobacco', 'Wine', 'Spirits', 'Beer'];
      }
    }

    customisation = {
      removedGroups,
      housingProfile,
    };

    // Signal that we need to re-render the buttons
    QUESTIONS = QUESTIONS;
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
  {#if i <= lastAnswered + 1}
    <div class="quiz-question">
      <div class:disabled={i > lastAnswered + 1} class="label">{question.text}</div>

      <ButtonGroup
        disabled={i > lastAnswered + 1}
        items={question.choices}
        selected={question.answered}
        onClick={value => i <= lastAnswered + 1 && answerQuestion(value, question, i)}
      />
    </div>
  {/if}
{/each}

{#if isFinished}
  <p class="result">
    We estimate that your personal inflation rate is
    <span class="emphasized">
      {formatPercentage(personalInflation)}
    </span>
    for the past year, which is
    <span class="bold">
      {formatPercentage(inflationDiff.abs())} {inflationDiff.greaterThan(0) ? 'lower' : 'higher' }
    </span>
    than the official rate.
  </p>
     
  <LineChart inflationRate={personalInflation.mul(100).toNumber()} />

  <p class="result">
    This means that the items that make up your budget are approximately
    <span class="emphasized">
      {formatPercentage(personalInflation)}
    </span>
    more expensive than they were last year.
  </p>

{:else}
  <p class="result">To continue reading, complete the quiz above.</p>
{/if}


<style lang="scss">
  :global(#interactive-quiz:not(.finished) ~ *) {
    display: none;
  }

  :global(#interactive-quiz) {
    margin-bottom: 3rem;
  }

  .quiz-question {
    padding: 0.8rem;
    font-family: 'ABCSans';

    .label {
      display: inline-block;
      margin: 0 0 0.8rem;
      font-weight: bold;
    }
  }

  .result {
    font-size: 1rem;
    line-height: 22px;
    font-family: 'ABCSans';
    font-weight: 600;
    padding-left: 22px;
    padding-right: 22px;
    text-align: center;

    max-width: 600px;
    margin: 20px auto;

    .bold {
      font-weight: 900;
    }
    .emphasized {
      color: rgba(229, 42, 0, 1);
      font-weight: 900;
    }
  }
</style>
