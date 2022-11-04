import acto from '@abcnews/alternating-case-to-object';
import type { SvelteComponent } from 'svelte';

import { encode, decode } from '@abcnews/base-36-props';
import { proxy } from '@abcnews/dev-proxy';
import { whenDOMReady, whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';

import { loadScrollyteller } from './components/Scrollyteller';
import { getStoreData } from './dataFetch';
import { personaliseText } from './utils';
import { defaultCustomisation } from './constants';

import InlineChart from './components/InlineChart.svelte';
import ScrollyWrapper from './components/ScrollyWrapper.svelte';
import Quiz from './components/Quiz.svelte';
import LineChart2 from './components/MultilineChart/LineChart2.svelte';
import Header from './components/Header.svelte';
import Subheading from './components/Subheading.svelte';

const scrollyElems: any[] = [];
const inlineElems: any[] = [];
let chart2;
let customisation: any = {};

const prepTemplates = () => {
  const bodyPars = document.querySelectorAll('.Main.u-layout > p');
  bodyPars.forEach(n => {
    let text = n.getAttribute('data-template') || n.textContent;
    if (!text || text.indexOf('{{') === -1) {
      return;
    }

    n.classList.add('templated');
    n.setAttribute('data-template', text);
  });
}

const mountComponents = (name: string, Component: typeof SvelteComponent, props?: any) =>
  selectMounts(name).forEach(
    mountEl => {
      if (name === 'mark' && !getMountValue(mountEl, name)) {
        return;
      }
      const marker = getMountValue(mountEl, name);
      const el = new Component({
        target: mountEl,
        props: {
          ...(props || {}),
          marker,
        },
      })

      if (name === 'linechart2') {
        chart2 = el;
      }
      if (name === 'mark' || name === 'Scrollyteller') {
        inlineElems.push([el, decode(acto(marker).state as string)]);
      }
    }
  );

Promise.all([
  getStoreData(),
  whenOdysseyLoaded,
  proxy('inflation-calculator'),
]).then((res) => {
  const [indexData] = res;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onCustomisationChange = (customisationChange) => {
    customisation = customisationChange;

    const templatedPanels = document.querySelectorAll('p.templated');
    for (const panel of Array.from(templatedPanels || [])) {
      const text = panel.getAttribute('data-template') || '';
      panel.textContent = personaliseText(customisation as any, text);
    }

    if (prefersReducedMotion) {

      for (const el of inlineElems) {
        const [elem, state] = el;

        let combinedState;
        if (state) {
          if (state.applyPersonalisation) {
            // These are the only two properties modified by the quiz.
            const removedGroups = [...customisation.removedGroups, ...(state.removedGroups || [])];
            const housingProfile = customisation.housingProfile || state.housingProfile;

            combinedState = { ...defaultCustomisation, ...state, removedGroups, housingProfile };
          } else {
            combinedState = { ...defaultCustomisation, ...state };
          }
          const marker = `STATE${encode(combinedState)}`;
          elem.$set({ marker });
        }
      }

    } else {
      for (const elem of scrollyElems) {
        elem.$set({ customisation });
      }
    }
    chart2?.$set({ customisation });
  };

  mountComponents('headerimg', Header);
  mountComponents('subhead-1', Subheading, { heading: 'Inflation_and_you' });
  mountComponents('subhead-2', Subheading, { heading: 'Measuring_housing_costs' });
  mountComponents('subhead-3', Subheading, { heading: 'An_Expensive_Cure' });
  mountComponents('interactive-quiz', Quiz, { indexData, onCustomisationChange });
  mountComponents('linechart2', LineChart2, { indexData, customisation });
  mountComponents('inlinechart', InlineChart, { indexData });

  if (prefersReducedMotion) {
    console.log('Falling back to non-scrollyteller version for reduced motion.');

    prepTemplates();

    mountComponents('mark', InlineChart, { indexData, size: 'sm' });
    mountComponents('scrollyteller', InlineChart, { indexData, size: 'sm' });
    return;
  }

  try {
    const scrollyData = loadScrollyteller('chart1', 'u-full', 'mark');
    const appMountEl = scrollyData.mountNode;

    if (appMountEl) {
      scrollyElems.push(new ScrollyWrapper({
        target: appMountEl,
        props: { scrollyData, indexData, customisation }
      }));
    }
  } catch (e) {
    console.log(e);
  }

  try {
    const scrollyData = loadScrollyteller('chart2', 'u-full', 'mark');
    const appMountEl = scrollyData.mountNode;

    if (appMountEl) {
      scrollyElems.push(new ScrollyWrapper({
        target: appMountEl,
        props: { scrollyData, indexData, customisation }
      }));
    }
  } catch (e) {
    console.log(e);
  }

  try {
    const scrollyData = loadScrollyteller('chart3', 'u-full', 'mark');
    const appMountEl = scrollyData.mountNode;

    if (appMountEl) {
      scrollyElems.push(new ScrollyWrapper({
        target: appMountEl,
        props: { scrollyData, indexData, customisation }
      }));
    }
  } catch (e) {
    console.log(e);
  }

  prepTemplates();
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[inflation-calculator] public path: ${__webpack_public_path__}`);
}
