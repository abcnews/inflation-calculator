import acto from '@abcnews/alternating-case-to-object';
import { getStoreData } from './dataFetch';

import { whenDOMReady, whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import { loadScrollyteller } from './components/Scrollyteller';

import ScrollyWrapper from './components/ScrollyWrapper/ScrollyWrapper.svelte';

let appMountEl: any;
let appProps;

let vizElem;

let incomeIndex = 'employed';
let housingProfile = 'renter'; // renter | mortgage | outright
// let transportAnswer = 'nocar';

// const getUpdatedIndex = (indexData) => {
//   return indexData[incomeAnswer];
// };

Promise.all([
  getStoreData(),
  whenOdysseyLoaded,
]).then((res) => {
  const [indexData] = res;
  try {
    const scrollyData = loadScrollyteller('chart', 'u-full', 'mark');
    appMountEl = scrollyData.mountNode;

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
