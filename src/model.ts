import { csv } from 'd3-fetch';
import { Decimal } from 'decimal.js-light';
import { COLOURS } from './colours';

//
// Model for representing inflation indexes
//
export type InflationIndex = Array<ExpenditureGroup>;
export type InflationData = Record<string, Record<string, ExpenditureGroup>>;

export interface Customisation {
  index: keyof ExpenditureGroupWeights;
  timelineYears: 1 | 10;
  expandInflation: boolean;
  weightOverrides: Record<string, number>;
  splitGroups: string[];
  removedGroups: string[];
}

export interface ExpenditureGroup {
  name: string;
  group: string;
  weights: ExpenditureGroupWeights;
  inflation: {
    1: Decimal;
    10: Decimal;
  };
  inflationCombined: {
    1: Decimal;
    10: Decimal;
  };
}
export interface ExpenditureGroupWeights {
  employed: Decimal;
  agepension: Decimal;
  othergovt: Decimal;
  superannuation: Decimal;
  cpi: Decimal;
}
export interface WeightedBar {
  name: string;
  colour?: string;
  inflation: Decimal;
  weighting: Decimal;
}

export async function getStoreData(): Promise<InflationData> {
  const absolutePath = __webpack_public_path__ || '/';

  const WEIGHTS = await csv(`${absolutePath}all-weights.csv`);
  const INFLATION = await csv(`${absolutePath}inflation-long-term.csv`);
  const INFLATION_ONE_YEAR = INFLATION.find(i => i.Group === 'Last Year');
  const INFLATION_TEN_YEARS = INFLATION.find(i => i.Group === 'Last 10 Years');

  // Clean raw data into expenditure groups with a reference to the group they fit into
  let lastGroup: string;
  return WEIGHTS.reduce((acc, row) => {
    lastGroup = row.Group || lastGroup;

    if (!row['Expenditure Group']) {
      return acc;
    }

    const key = (k: string) => `Index Numbers ;  ${k} ;  Australia ;`;
    const group: ExpenditureGroup = {
      name: row['Expenditure Group'],
      group: lastGroup,
      weights: {
        employed: new Decimal(row['Employee households']).div(100),
        agepension: new Decimal(row['Age pensioner households']).div(100),
        othergovt: new Decimal(row['Other government transfer recipient households']).div(100),
        superannuation: new Decimal(row['Self-funded retiree households']).div(100),
        cpi: new Decimal(row['Consumer Price Index']).div(100),
      },
      inflation: {
        10: new Decimal(INFLATION_TEN_YEARS[key(row['Expenditure Group'])]).sub(1),
        1: new Decimal(INFLATION_ONE_YEAR[key(row['Expenditure Group'])]).sub(1)
      },
      // Include the inflation for the combined group (eg. Transport, Housing) as this can't
      // be reconstructed from subgroups. There's a bit of redundant data but no big deal
      inflationCombined: {
        10: new Decimal(INFLATION_TEN_YEARS[key(lastGroup)]).sub(1),
        1: new Decimal(INFLATION_ONE_YEAR[key(lastGroup)]).sub(1)
      }
    };

    return {
      ...acc,
      [group.group]: {
        ...acc[group.group],
        [group.name]: group,
      },
    };
  }, {});
}

// 
// Weighted average
// see: http://textbook.stpauls.br/Macroeconomics/page_90.htm
//
export function calculateInflationRate(data: InflationData, customisation: Customisation): Decimal {
  const {
    index,
    timelineYears,
    removedGroups,
  } = customisation;

  const allSubGroups = Object.values(data).map(g => Object.values(g)).flat();
  const totalWeightingRemoved = removedGroups.reduce((acc, groupName) => {
    const subGroup = allSubGroups.find(g => g.name === groupName);
    if (!subGroup) {
      return acc;
    }
    const weightToRemove = subGroup.weights[index];
    return acc.add(weightToRemove);
  }, new Decimal(0));

  const remainingWeighting = new Decimal(1).sub(totalWeightingRemoved);

  return Object.keys(data).reduce((acc: Decimal, groupName: string) => {
    const weightedSum = Object.keys(data[groupName]).reduce((acc: Decimal, expGroupName: string) => {
      if (removedGroups.indexOf(expGroupName) > -1) {
        return acc;
      }

      const group: ExpenditureGroup = data[groupName][expGroupName];

      const originalWeighting = group.weights[index];
      // Add the proportional amount of the extra weighting
      const extraWeighting = totalWeightingRemoved.mul(originalWeighting);
      const weighting = originalWeighting.add(extraWeighting)

      const inflation = group.inflation[timelineYears];

      return acc.add(weighting.mul(inflation));
    }, new Decimal(0));

    return acc.add(weightedSum);
  }, new Decimal(0));
}

export function calculateInflationRate2(data: InflationData, customisation: Customisation): Decimal {
  const weightedBars = deriveChartData(data, customisation);
  return weightedBars.reduce((acc, bar) => {
    return acc.add( bar.weighting.mul(bar.inflation) );
  }, new Decimal(0));
}

export function deriveChartData(data: InflationData, customisation: Customisation): WeightedBar[] {
  const {
    index,
    timelineYears,
    removedGroups,
  } = customisation;

  const allSubGroups = Object.values(data).map(g => Object.values(g)).flat();
  const totalWeightingRemoved = removedGroups.reduce((acc, groupName) => {
    const subGroup = allSubGroups.find(g => g.name === groupName);
    if (!subGroup) {
      return acc;
    }
    const weightToRemove = subGroup.weights[index];
    return acc.add(weightToRemove);
  }, new Decimal(0));
  const remainingWeighting = new Decimal(1).sub(totalWeightingRemoved);

  const allBars = Object.keys(data).reduce((acc: WeightedBar[], groupName: string) => {

    if (customisation.splitGroups.indexOf(groupName) > -1) {
      // Split into expenditure groups
      const bars = Object.keys(data[groupName]).reduce((acc: WeightedBar[], expGroupName: string) => {
        if (removedGroups.indexOf(expGroupName) > -1) {
          return acc;
        }

        const group: ExpenditureGroup = data[groupName][expGroupName];

        // Add the proportional amount of the extra weighting
        const originalWeighting = group.weights[index];
        const extraWeighting = totalWeightingRemoved.mul(originalWeighting);
        const weighting = originalWeighting.add(extraWeighting)

        return [
          ...acc,
          {
            name: group.name,
            colour: COLOURS[group.group] || 'blue',
            inflation: group.inflation[timelineYears],
            weighting,
          }
        ];
      }, []);
    
      // const bars = Object.values(data[groupName]).map(group => ({
      //   name: group.name,
      //   colour: COLOURS[group.group] || 'blue',
      //   inflation: group.inflation[customisation.timelineYears],
      //   weighting: group.weights[customisation.index],
      // }));
      return [...acc, ...bars];
    }

    // Keep as a combined bar
    const weighting = Object.values(data[groupName]).reduce((combinedWeight, group) => {
      return combinedWeight.add(group.weights[customisation.index]);
    }, new Decimal(0));

    const inflation = Object.values(data[groupName])[0].inflationCombined[customisation.timelineYears];

    const bar = {
      name: groupName,
      colour: COLOURS[groupName] || 'blue',
      inflation,
      weighting,
    };
    return [...acc, bar];
  }, []);

  return allBars
    // .sort((a, b) => b.inflation - a.inflation)
    .filter(b => customisation.removedGroups.indexOf(b.name) === -1)
    .filter(b => b.weighting.toNumber() > 0);
}

const toPercentage = (x: string | number): Decimal => {
  return new Decimal(x).div(100);
};

