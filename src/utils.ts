import { Decimal } from 'decimal.js-light';
import { COLOURS, FOCUS, NON_FOCUS } from './colours';

import { Customisation, ExpenditureGroup, ExpenditureGroupWeights, WeightedBar, InflationData } from './types';

export function sortBars(orderBy: string, forceToBottom: string[]) {
  return (a, b) => {
    const forceA = forceToBottom.indexOf(a.name) > -1 || forceToBottom.indexOf(a.group) > -1;
    const forceB = forceToBottom.indexOf(b.name) > -1 || forceToBottom.indexOf(b.group) > -1;
    if (forceA && !forceB) {
      return -1;
    }
    if (!forceA && forceB) {
      return 1;
    }

    if (orderBy === 'area') {
      const bv = b.inflation.mul(b.weighting)
      const av = a.inflation.mul(a.weighting);
      return av.sub(bv).toNumber();
    }
    if (orderBy === 'inflation') {
      return a.inflation.sub(b.inflation).toNumber();
    }
    if (orderBy === 'weighting') {
      return a.weighting.sub(b.weighting).toNumber();
    }
    if (orderBy === 'category') {
      return a.group.localeCompare(b.group);
    }
    if (orderBy === 'discretionary') {
      if (b.isDiscretionary && !a.isDiscretionary) {
        return 1;
      }
      if (!b.isDiscretionary && a.isDiscretionary) {
        return -1;
      }
      return 0;
    }
    return 0;
  };
}

export function getColour(name: string, isDiscretionary: boolean, colourBy: string): string {
  if (colourBy === 'category') {
    return COLOURS[name];
  }
  if (colourBy === 'discretionary') {
    return isDiscretionary ? FOCUS : NON_FOCUS;
  }

  return NON_FOCUS;
};

export function toPercentage(x: string | number): Decimal {
  return new Decimal(x).div(100);
};

