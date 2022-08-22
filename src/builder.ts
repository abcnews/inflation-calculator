import acto from '@abcnews/alternating-case-to-object';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import App from './components/App/App.svelte';
import { getStoreData } from './model';

let appMountEl: Mount;
let appProps;

let vizElem;

let index = 'employed';
let transportAnswer = 'nocar';
let housingAnswer = 'rents';

Promise.all([
  getStoreData(),
  whenOdysseyLoaded,
]).then((res) => {
  [appMountEl] = selectMounts('inflationcalculator');
  const [indexData] = res;

  if (appMountEl) {
    appProps = acto(getMountValue(appMountEl));
    const props = { index, data: indexData };
    vizElem = new App({
      target: appMountEl,
      props,
    });
  }

});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[inflation-calculator] public path: ${__webpack_public_path__}`);
}
