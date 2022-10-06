import { Decimal } from 'decimal.js-light';
// import { COLOURS, FOCUS, NON_FOCUS } from './colours';

import { Customisation, ExpenditureGroup, ExpenditureGroupWeights, WeightedBar, InflationData } from './types';
import { HOUSING_PROFILES } from './constants';
import { toPercentage } from './utils';

// Weighted average
// see: http://textbook.stpauls.br/Macroeconomics/page_90.htm
export function calculateInflationRate(data: InflationData, customisation: Customisation): Decimal {
  const weightedBars = deriveChartData(data, customisation);
  return weightedBars.reduce((acc, bar) => {
    return acc.add( bar.weighting.mul(bar.inflation) );
  }, new Decimal(0));
}

export function deriveChartData(data: InflationData, customisation: Customisation): WeightedBar[] {
  if (Object.keys(data).length === 0) {
    return [];
  }

  const {
    index,
    timelineYears,
    housingProfile,

    // orderBy,
    highlightedGroups,
    // zoomedInGroups,
  } = customisation;

  const allSubGroups = Object.values(data).map(g => Object.values(g)).flat();
  const housingProps = housingProfile ? HOUSING_PROFILES[housingProfile] : {};

  // Apply the housing profile on top of the chart customisation
  // const removedGroupsByZooming = zoomedInGroups?.length ? allSubGroups.filter(g => zoomedInGroups.indexOf(g.group) === -1) : [];
  const removedGroups = [
    ...customisation.removedGroups,
    ...(housingProps?.removedGroups || []),
    // ...removedGroupsByZooming.map(g => g.name)
  ];
  const weightOverrides = {...customisation.weightOverrides, ...(housingProps?.weightOverrides || {})};

  // Collect the amount of weights to redistribute away from the `removedGroups`
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

    if (removedGroups.indexOf(k) > -1) {
      return total;
    }

    return total.add( newWeight.sub(existingWeight) );
  }, new Decimal(0));

  const weightingToRedistribute = totalWeightingRemoved.sub(weightsAddedThroughOverrides);
  const remainingWeighting = new Decimal(1).sub(totalWeightingRemoved).sub(weightsAddedThroughOverrides);

  // console.log({
  //   remainingWeighting: remainingWeighting.toNumber(),
  //   totalWeightingRemoved: totalWeightingRemoved.toNumber(),
  //   weightsAddedThroughOverrides: weightsAddedThroughOverrides.toNumber(),
  //   weightingToRedistribute: weightingToRedistribute.toNumber(),
  // });

  const allBars = Object.keys(data).reduce((acc: WeightedBar[], groupName: string) => {
    // Split into expenditure groups
    const bars = Object.keys(data[groupName]).reduce((acc: WeightedBar[], expGroupName: string) => {
      if (removedGroups.indexOf(expGroupName) > -1) {
        return acc;
      }

      const group: ExpenditureGroup = data[groupName][expGroupName];

      // const isHighlighted = highlightedGroups.indexOf(expGroupName) > -1 ||
        // highlightedGroups.indexOf(groupName) > -1;

      let weighting = group.weights[index];

      // Use the override if its defined
      if (weightOverrides[expGroupName]) {
        weighting = weightOverrides[expGroupName];
      } else {
        const proportionOfRemaining = weighting.div( remainingWeighting );
        const extraWeighting = weightingToRedistribute.mul( proportionOfRemaining );
        
        // console.log({
        //   proportionOfRemaining: proportionOfRemaining.toNumber(),
        //   remainingWeighting: remainingWeighting.toNumber(),
        //   extraWeighting: extraWeighting.toNumber(),
        // });

        weighting = weighting.add(extraWeighting)
      }

      // Add (or subtract) the proportional amount of the extra weighting
      // const proportionOfRemaining = weighting.div(remainingWeighting);
      // const extraWeighting = totalWeightingRemoved.add(weightsAddedThroughOverrides).mul(proportionOfRemaining);


      //
      // console.log(group.name, weighting.toNumber());

      return [
        ...acc,
        {
          name: group.name,
          group: group.group,

          inflation: group.inflation[timelineYears],
          weighting,

          // colour: getColour(group.group, group.isDiscretionary, colourBy),

          // isHighlighted,
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
    // const isHighlighted = highlightedGroups.indexOf(groupName) > -1;

    const bar = {
      name: groupName,
      group: groupName,

      inflation,
      weighting: combinedWeighting,

      // colour: getColour(groupName, false, colourBy),

      // isHighlighted,
      isDiscretionary: false,
    };

    return [...acc, bar];
  }, []);

  return allBars
    .filter(b => customisation.removedGroups.indexOf(b.name) === -1)
    .filter(b => b.weighting.toNumber() > 0);
}
