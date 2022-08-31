import { Decimal } from 'decimal.js-light';
import { COLOURS, FOCUS, NON_FOCUS } from './colours';

import { Customisation, ExpenditureGroup, ExpenditureGroupWeights, WeightedBar, InflationData } from './types';
import { HOUSING_PROFILES } from './constants';

// 
// Weighted average
// see: http://textbook.stpauls.br/Macroeconomics/page_90.htm
//
// export function calculateInflationRate(data: InflationData, customisation: Customisation): Decimal {
//   const {
//     index,
//     timelineYears,
//     removedGroups,
//   } = customisation;
//
//   const allSubGroups = Object.values(data).map(g => Object.values(g)).flat();
//   const totalWeightingRemoved = removedGroups.reduce((acc, groupName) => {
//     const subGroup = allSubGroups.find(g => g.name === groupName);
//     if (!subGroup) {
//       return acc;
//     }
//     const weightToRemove = subGroup.weights[index];
//     return acc.add(weightToRemove);
//   }, new Decimal(0));
//
//   const remainingWeighting = new Decimal(1).sub(totalWeightingRemoved);
//
//   return Object.keys(data).reduce((acc: Decimal, groupName: string) => {
//     const weightedSum = Object.keys(data[groupName]).reduce((acc: Decimal, expGroupName: string) => {
//       if (removedGroups.indexOf(expGroupName) > -1) {
//         return acc;
//       }
//
//       const group: ExpenditureGroup = data[groupName][expGroupName];
//
//       const originalWeighting = group.weights[index];
//       // Add the proportional amount of the extra weighting
//       const extraWeighting = totalWeightingRemoved.mul(originalWeighting);
//       const weighting = originalWeighting.add(extraWeighting)
//
//       const inflation = group.inflation[timelineYears];
//
//       return acc.add(weighting.mul(inflation));
//     }, new Decimal(0));
//
//     return acc.add(weightedSum);
//   }, new Decimal(0));
// }

// Weighted average
// see: http://textbook.stpauls.br/Macroeconomics/page_90.htm
export function calculateInflationRate(data: InflationData, customisation: Customisation): Decimal {
  const weightedBars = deriveChartData(data, customisation);
  return weightedBars.reduce((acc, bar) => {
    return acc.add( bar.weighting.mul(bar.inflation) );
  }, new Decimal(0));
}

export function deriveChartData(data: InflationData, customisation: Customisation): WeightedBar[] {

  const {
    index,
    timelineYears,
    highlightedGroups,

    orderBy,
    colourBy,

    housingProfile,
  } = customisation;

  const housingProps = HOUSING_PROFILES[housingProfile];

  // Apply the housing profile on top of the chart customisation
  const removedGroups = [...customisation.removedGroups, ...(housingProps?.removedGroups || [])];
  const weightOverrides = {...customisation.weightOverrides, ...(housingProps?.weightOverrides || {})};

  // Collect the amount of weights to redistribute away from the `removedGroups`
  const allSubGroups = Object.values(data).map(g => Object.values(g)).flat();
  const totalWeightingRemoved = removedGroups.reduce((acc, groupName) => {
    const subGroup = allSubGroups.find(g => g.name === groupName);
    if (!subGroup) {
      return acc;
    }
    const weightToRemove = subGroup.weights[index];
    return acc.add(weightToRemove);
  }, new Decimal(0));

  // Collect the amount of weights to redistribute (away or toward) any `weightOverrides`
  const weightsAddedThroughOverrides = Object.keys(weightOverrides).reduce((total, k) => {
    const newWeight = weightOverrides[k];
    const existingWeight = allSubGroups.find(g => g.name === k)?.weights?.[index];
    if (!existingWeight) {
      throw new Error(`Trying to override weight for non-existent group: ${k}`);
    }
    return total.add( newWeight.sub(existingWeight) );
  }, new Decimal(0));

  const remainingWeighting = new Decimal(1).sub(totalWeightingRemoved.add(weightsAddedThroughOverrides));

  const allBars = Object.keys(data).reduce((acc: WeightedBar[], groupName: string) => {
    // Split into expenditure groups
    const bars = Object.keys(data[groupName]).reduce((acc: WeightedBar[], expGroupName: string) => {
      if (removedGroups.indexOf(expGroupName) > -1) {
        return acc;
      }

      const group: ExpenditureGroup = data[groupName][expGroupName];

      const isHighlighted = highlightedGroups.indexOf(expGroupName) > -1 ||
        highlightedGroups.indexOf(groupName) > -1 ||
        (group.isDiscretionary && highlightedGroups.indexOf('Discretionary') > -1);

      let weighting = group.weights[index];
      if (weightOverrides[expGroupName]) {
        // Use the override if its defined
        weighting = weightOverrides[expGroupName];
      } else {
        // Else, add (or subtract) the proportional amount of the extra weighting
        const extraWeighting = totalWeightingRemoved.mul(weighting);
        weighting = weighting.add(extraWeighting)
      }

      return [
        ...acc,
        {
          name: group.name,
          group: group.group,

          inflation: group.inflation[timelineYears],
          weighting,

          colour: getColour(group.group, group.isDiscretionary, colourBy),

          isHighlighted,
          isDiscretionary: group.isDiscretionary,
        }
      ];
    }, []);

    // If split, return the individual subgroups as bars
    if (customisation.splitGroups.indexOf(groupName) > -1) {
      return [...acc, ...bars];
    }

    // Else, merge into a combined bar
    const combinedWeighting = bars.reduce((acc, bar) => acc.add(bar.weighting), new Decimal(0));

    const combinedInflationContribution = bars.reduce((acc, bar) => acc.add(bar.inflation.mul(bar.weighting)), new Decimal(0));
    const inflation = combinedInflationContribution.div(combinedWeighting);

    // Taken from the CPI numbers (not used because it doesn't take into account changing subgroup weightings)
    // const inflation = Object.values(data[groupName])[0].inflationCombined[customisation.timelineYears];

    // Set the group as discretionary if more than half the weighting from subgroups is discretionary
    const isHighlighted = highlightedGroups.indexOf(groupName) > -1;

    const bar = {
      name: groupName,
      group: groupName,

      inflation,
      weighting: combinedWeighting,

      colour: getColour(groupName, false, colourBy),

      isHighlighted,
      isDiscretionary: false,
    };

    return [...acc, bar];
  }, []);

  return allBars
    .sort((a, b) => {
      if (orderBy === 'area') {
        const bv = b.inflation.mul(b.weighting)
        const av = a.inflation.mul(a.weighting);
        return bv.sub(av).toNumber();
      }
      if (orderBy === 'inflation') {
        return b.inflation.sub(a.inflation).toNumber();
      }
      if (orderBy === 'weighting') {
        return b.weighting.sub(a.weighting).toNumber();
      }
      if (orderBy === 'group') {
        return b.group.localeCompare(a.group);
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
    })
    .filter(b => customisation.removedGroups.indexOf(b.name) === -1)
    .filter(b => b.weighting.toNumber() > 0);
}

const getColour = (name: string, isDiscretionary: boolean, colourBy: string) => {
  if (colourBy === 'category') {
    return COLOURS[name];
  }
  if (colourBy === 'discretionary') {
    return isDiscretionary ? FOCUS : NON_FOCUS;
  }

  return NON_FOCUS;
};

const toPercentage = (x: string | number): Decimal => {
  return new Decimal(x).div(100);
};

