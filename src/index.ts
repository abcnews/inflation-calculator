import acto from '@abcnews/alternating-case-to-object';
import type { SvelteComponent } from 'svelte';

import { proxy } from '@abcnews/dev-proxy';
import { whenDOMReady, whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';

import { loadScrollyteller } from './components/Scrollyteller';
import { getStoreData } from './dataFetch';

import ScrollyWrapper from './components/ScrollyWrapper.svelte';
import Quiz from './components/Quiz.svelte';
// import WeightSlider from './components/WeightSlider.svelte';

let vizElem;

let incomeIndex = 'employed';
let housingProfile = 'renter'; // renter | mortgage | outright
// let transportAnswer = 'nocar';

// const getUpdatedIndex = (indexData) => {
//   return indexData[incomeAnswer];
// };

const mountComponents = (name: string, Component: typeof SvelteComponent, props?: any) =>
  selectMounts(name).forEach(
    mountEl =>
      new Component({
        target: mountEl,
        props: props || {}
      })
  );

Promise.all([
  getStoreData(),
  whenOdysseyLoaded,
  proxy('inflation'),
]).then((res) => {
  const [indexData] = res;

  // mountComponents('interactive-slider-petrol', WeightSlider, { indexData, sliderField: 'Automotive fuel', sliderDefault: 0.045 });
  // mountComponents('interactive-slider-vices', WeightSlider, { indexData, sliderField: 'Tobacco', sliderDefault: 0.03 });

  mountComponents('interactive-quiz', Quiz, { indexData });

  try {
    const scrollyData = loadScrollyteller('chart1', 'u-full', 'mark');
    const appMountEl = scrollyData.mountNode;

    if (appMountEl) {
      new ScrollyWrapper({
        target: appMountEl,
        props: { scrollyData, indexData, housingProfile }
      });
    }
  } catch (e) {
    console.log(e);
  }

  try {
    const scrollyData = loadScrollyteller('chart2', 'u-full', 'mark');
    const appMountEl = scrollyData.mountNode;

    if (appMountEl) {
      new ScrollyWrapper({
        target: appMountEl,
        props: { scrollyData, indexData, housingProfile }
      });
    }
  } catch (e) {
    console.log(e);
  }
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[inflation-calculator] public path: ${__webpack_public_path__}`);
}
