import { csv } from 'd3-fetch';
import { Decimal } from 'decimal.js-light';

//
// Model for representing an inflation index
//
export interface ExpenditureGroup {
  name: string;
  group: string; // This is for choosing a colour
  weighting: Decimal;
  inflation: Decimal;
}

export type InflationIndex = Record<string, ExpenditureGroup>;

// https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/selected-living-cost-indexes-australia/latest-release
export interface LivingCostIndexes {
  employed: InflationIndex;
  agepension: InflationIndex;
  othergovt: InflationIndex;
  superannuation: InflationIndex;
  cpi: InflationIndex;
}

const INDEXES = [
  'employed',
  'agepension',
  'othergovt',
  'superannuation',
  'cpi'
];

// 
// Weighted average
// see: http://textbook.stpauls.br/Macroeconomics/page_90.htm
//
export function calculateInflationRate(index: InflationIndex): Decimal {
  const weightedSum = Object.values(index).reduce((acc, group) => {
    return acc.add(group.weighting.mul(group.inflation));
  }, new Decimal(0));

  const sumOfWeights = Object.values(index).reduce((acc, g) => acc.add(g.weighting), new Decimal(0));
  return weightedSum.div(sumOfWeights);
}

const toPercentage = (x: string | number): Decimal => {
  return new Decimal(x).div(100);
};

export async function getStoreData(): Promise<LivingCostIndexes> {
  const absolutePath = __webpack_public_path__ || '/';

  const INFLATION = await csv(`${absolutePath}inflation-long-term.csv`);
  const INFLATION_ONE_YEAR = INFLATION.find(i => i.Group === 'Last Year');
  const INFLATION_TEN_YEARS = INFLATION.find(i => i.Group === 'Last 10 Years');

  const WEIGHTS = await csv(`${absolutePath}living-indexes.csv`);

  const indexObj: any = INDEXES.reduce((indexes: Partial<LivingCostIndexes>, indexId: string) => {
    const key = (k: string) => `Index Numbers ;  ${k} ;  Australia ;`;

    const groups = WEIGHTS.map(group => ({
      name: group.Group,
      group: group.Group,
      weighting: new Decimal(group[indexId]).div(100),
      inflation: new Decimal(INFLATION_ONE_YEAR[key(group.Group)]).sub(1),
    }));

    return {
      ...indexes,
      [indexId]: groups,
    };
  }, {} as Partial<LivingCostIndexes>);

  return indexObj;
}

