<script lang="ts">
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { decode } from '@abcnews/base-36-props';

  import { InflationData, Customisation } from '../types';
  import { defaultCustomisation } from '../constants';
  import { personaliseText } from '../utils';
  import { deriveChartData } from '../model';

  import Scrollyteller from './Scrollyteller/Scrollyteller.svelte';
  import ChartWrapper from './ChartWrapper/ChartWrapper.svelte';

  export let indexData: InflationData;
  export let customisation: Customisation;
  export let scrollyData: any;

  // Create store with the latest inflation data
  const inflationStore = writable<InflationData>({});
  setContext('inflation-data', inflationStore);
  $: inflationStore.set(indexData);

  // Create store for controlling the chart
  const stateStore = writable<any>({ ...defaultCustomisation });
  setContext('customisation', stateStore);

  let updateState = ((marker: any) => {
    if (marker.state) {
      const state: Partial<Customisation> = decode(marker.state);

      if (state.applyPersonalisation) {
        // These are the only two properties modified by the quiz.
        const removedGroups = [...customisation.removedGroups, ...(state.removedGroups || [])];
        let housingProfile = customisation.housingProfile || state.housingProfile;

        // Override the user's housing profile with that of the marker
        if (state.forceHousingProfile && state.housingProfile) {
          housingProfile = state.housingProfile;
        }

        const userHousingProfile = customisation.housingProfile;
        stateStore.set({ ...defaultCustomisation, ...state, removedGroups, housingProfile, userHousingProfile });
      } else {
        stateStore.set({ ...defaultCustomisation, ...state });
      }
    }
  });


  $: {
    // If customisation changes, re-render the templates
    const templatedPanels = document.querySelectorAll('.st-panel .templated');
    for (const panel of Array.from(templatedPanels || [])) {
      const text = panel.getAttribute('data-template') || '';

      // Needed to interpolate the names of the biggest + smallest categories
      const groups = deriveChartData(indexData, {
        ...defaultCustomisation,
        ...customisation,
        splitGroups: [],
      });

      const pText = personaliseText(customisation, text, groups);
      if (!pText) {
        panel.classList.add('hidden-template');
      } else {
        panel.classList.remove('hidden-template');
        panel.innerHTML = pText;
      }
    }
  }

  const preprocessPanels = (panels) => {
    if (!panels) {
      return [];
    }

    // Reverse engineer the answers to the quiz
    return panels.map(p => {
      return {
        ...p,
        nodes: p.nodes.map(n => {
          let text = n.getAttribute('data-template') || n.innerHTML;

          // No templated text in the DOM element, so skip it
          if (text.indexOf('{{') === -1) {
            return n;
          }

          // Save the original text to "data-template" so it can be re-used if the answer changes
          n.classList.add('templated');
          n.setAttribute('data-template', text);
          return n;
        }),
      };
    });
  };

</script>

{#if !!scrollyData}
  <Scrollyteller
    panels={preprocessPanels(scrollyData.panels)}
    onMarker={updateState}
    let:height={height}
    let:width={width}
  >
    <ChartWrapper
      width={Math.min(width, 600)}
      height={height * 0.8}
    />
  </Scrollyteller>
{/if}

<style lang="scss">
  @media only screen and (min-width: 1023px) {
    :global(.scrollyteller .st-panel) {
      margin-right: calc(30% - 24.75rem) !important;
      width: 49.5rem !important;
    }
    :global(.scrollyteller > .graphic) {
      padding: 2rem;
      width: calc(100% - 35% - 24.75rem) !important;
      overflow: visible !important;
    }
  }

  @media only screen and (max-width: 1022px) {
    :global(.scrollyteller > .content > .st-panel:first-child) {
      margin-top: 85vh;
    }
  }

  :global(.hidden-template) {
    display: none;
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  // Hide fallback images when scrollyteller is active
  :global([data-tag="startfallback"]) {
    display: none;
  }
</style>
