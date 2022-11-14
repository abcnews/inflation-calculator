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


export function personaliseText(customisation: Customisation, text: string, groups?): string {
  const doesDrive = customisation.removedGroups.indexOf('Motor vehicles') === -1;
  const doesSmoke = customisation.removedGroups.indexOf('Tobacco') === -1;
  const doesDrink = customisation.removedGroups.indexOf('Beer') === -1;
  const isRenter = customisation.housingProfile === 'renter';
  const hasMortgage = customisation.housingProfile === 'mortgage';

  if (doesDrive) {
    text = text.replace(/{{drive:([^}]*)}}/g, '$1');
    text = text.replace(/{{nodrive:([^}]*)}}/g, '');
  } else {
    text = text.replace(/{{nodrive:([^}]*)}}/g, '$1');
    text = text.replace(/{{drive:([^}]*)}}/g, '');
  }

  if (doesSmoke) {
    text = text.replace(/{{smoke:([^}]*)}}/g, '$1');
    text = text.replace(/{{nosmoke:([^}]*)}}/g, '');
  } else {
    text = text.replace(/{{nosmoke:([^}]*)}}/g, '$1');
    text = text.replace(/{{smoke:([^}]*)}}/g, '');
  }

  if (doesDrink) {
    text = text.replace(/{{drink:([^}]*)}}/g, '$1');
    text = text.replace(/{{nodrink:([^}]*)}}/g, '');
  } else {
    text = text.replace(/{{nodrink:([^}]*)}}/g, '$1');
    text = text.replace(/{{drink:([^}]*)}}/g, '');
  }

  if (isRenter) {
    text = text.replace(/{{renter:([^}]*)}}/g, '$1');
  } else if (hasMortgage) {
    text = text.replace(/{{mortgage:([^}]*)}}/g, '$1');
  } else {
    text = text.replace(/{{outright:([^}]*)}}/g, '$1');
  }

  if (groups) {
    const expOrdering = [...groups].sort(sortBars('weighting', []));
    const areaOrdering = [...groups].sort(sortBars('area', []));

    text = text.replace('{{exp-first}}', expOrdering[expOrdering.length - 1].name);
    text = text.replace('{{exp-second}}', expOrdering[expOrdering.length - 2].name);
    text = text.replace('{{exp-last}}', expOrdering[0].name);

    text = text.replace('{{area-first}}', areaOrdering[areaOrdering.length - 1].name);
    text = text.replace('{{area-second}}', areaOrdering[areaOrdering.length - 2].name);
  }

  // Remove the leftover templates
  text = text.replace(/{{([^}]*)}}/g, '');
  // Remove the leftover whitespace in panels
  if (text.length === 1) {
    text = '';
  }
  return text;
}
