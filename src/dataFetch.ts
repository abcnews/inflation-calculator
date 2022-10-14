import { csv } from 'd3-fetch';
import { Decimal } from 'decimal.js-light';

import { ExpenditureGroup, InflationData } from './types';

export async function getStoreData(): Promise<InflationData> {
  const absolutePath = __webpack_public_path__ || '/';

  // const DISCRETIONARY = await csv(`${absolutePath}discretionary.csv`);
  const [WEIGHTS, INFLATION] = await Promise.all([
    csv(`${absolutePath}all-weights.csv`),
    csv(`${absolutePath}inflation-long-term.csv`),
  ]);
  const INFLATION_ONE_YEAR = INFLATION.find(i => i.Group === 'Last Year');
  const INFLATION_TEN_YEARS = INFLATION.find(i => i.Group === 'Last 10 Years');

  // Clean raw data into expenditure groups with a reference to the group they fit into
  let lastGroup: string;
  return WEIGHTS.reduce((acc, row) => {
    lastGroup = row.Group || lastGroup;

    if (!row['Expenditure Group']) {
      return acc;
    }

    // const isDiscretionary = DISCRETIONARY.find(r => r.Name === row['Expenditure Group']).Discretionary === '1';

    const key = (k: string) => `Index Numbers ;  ${k} ;  Australia ;`;
    const group: ExpenditureGroup = {
      name: row['Expenditure Group'],
      group: lastGroup,
      // isDiscretionary,
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
