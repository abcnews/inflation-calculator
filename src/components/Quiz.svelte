<script lang="ts">
  import { Decimal } from 'decimal.js-light';

  import SvelteSelect from 'svelte-select';

  // import Select from 'carbon-components-svelte/src/Select/Select.svelte';
  // import SelectItem from 'carbon-components-svelte/src/Select/SelectItem.svelte';

  // import 'carbon-components/scss/components/select/_select.scss';
  // import 'carbon-components/scss/globals/scss/_css--body.scss';
  // import 'carbon-components/scss/globals/scss/_css--helpers.scss';

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
      answered: false,
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
      answered: false,
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
  <div class="quiz-question">
    <div class:disabled={i > lastAnswered + 1} class="label">{question.text}</div>
    <SvelteSelect
      on:select={e => answerQuestion(e.detail.value, question, i)}
      isDisabled={i > lastAnswered + 1}
      isClearable={false}
      items={question.choices}
    >
    </SvelteSelect>
  </div>
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

  .quiz-question {
    padding: 0.5rem;
    font-family: 'ABCSans';

    --tint-3: hsl(0, 0%, 60%);
    --tint-4: hsl(0, 0%, 80%);
    --tint-5: hsl(0, 0%, 90%);
    --tint-6: hsl(0, 0%, 95%);

    --height: 50px;
    --padding: 0.75rem 2.5rem 0.6rem 1rem;
    --inputFontSize: 1rem;
    --optionFontSize: 0.875rem;
    --borderRadius: 0;
    --inputLetterSpacing: normal;

    --border: 1px solid var(--tint-4);
    --borderFocusColor: var(--tint-3);
    --itemIsActiveBG: var(--tint-6);
    --itemIsActiveColor: rgb(0, 88, 204);

    --itemHoverBG: var(--itemIsActiveColor);
    --itemHoverColor: white;
    --itemFirstBorderRadius: 0;
    --listBorderRadius: 0;

    :global(.selectContainer.focused) {
      border-left-width: 0.5rem;
      border-color: var(--tint-3);
      transition: border-width 0.2s ease-out;
    }
    :global(input) {
      cursor: pointer !important;
      font-family: 'ABCSans';
    }

    :global(.item) {
      font-size: var(--optionFontSize);
      cursor: pointer;

      &:hover, &:active {
        background: var(--itemHoverBG, #e7f2ff);
        color: var(--itemHoverColor, inherit);
      }
    }
    :global(.item.active) {
      border-left: 8px solid var(--itemIsActiveColor);
    }

    .label {
      display: inline-block;
      margin: 0 0 0.5rem;
      font-weight: bold;
    }
  }

  .result {
    font-size: 1rem;
    font-family: 'ABCSans';
    font-weight: bold;
    margin-top: 30px;
  }
</style>
