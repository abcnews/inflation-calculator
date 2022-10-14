import acto from '@abcnews/alternating-case-to-object';
import type { SvelteComponent } from 'svelte';

import { proxy } from '@abcnews/dev-proxy';
import { whenDOMReady, whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';

import { loadScrollyteller } from './components/Scrollyteller';
import { getStoreData } from './dataFetch';

import InlineChart from './components/InlineChart.svelte';
import ScrollyWrapper from './components/ScrollyWrapper.svelte';
import Quiz from './components/Quiz.svelte';
import Header from './components/Header.svelte';

const scrollyElems: any[] = [];
let customisation = {};

const mountComponents = (name: string, Component: typeof SvelteComponent, props?: any) =>
  selectMounts(name).forEach(
    mountEl =>
      new Component({
        target: mountEl,
        props: {
          ...(props || {}),
          marker: getMountValue(mountEl, name)
        },
      })
  );

Promise.all([
  getStoreData(),
  whenOdysseyLoaded,
  proxy('inflation-calculator'),
]).then((res) => {
  const [indexData] = res;

  const onCustomisationChange = (customisationChange) => {
    customisation = customisationChange;
    for (const elem of scrollyElems) {
      elem.$set({ customisation });
    }
  };

  mountComponents('interactive-quiz', Quiz, { indexData, onCustomisationChange });
  mountComponents('inlinechart', InlineChart, { indexData });
  mountComponents('headerimg', Header);

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
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[inflation-calculator] public path: ${__webpack_public_path__}`);
}
