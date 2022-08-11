import { csv } from 'd3-fetch';
import { Decimal } from 'decimal.js-light';

//
// Model for representing an inflation index
//
export interface ExpenditureGroup {
  name: string;
  group: string;
  annualInflation: Decimal;
  cpiWeighting: Decimal;
  // anuWeighting: Decimal;

  value: Decimal; // defaults to cpiWeighting
}

export type InflationIndex = Record<string, ExpenditureGroup>;

export interface InflationModel {
  group: InflationIndex;
  subgroup: InflationIndex;
  subsubgroup: InflationIndex;
}


// 
// Weighted average
// see: http://textbook.stpauls.br/Macroeconomics/page_90.htm
//
export function calculateInflationRate(index: InflationIndex): Decimal {
  const weightedSum = Object.values(index).reduce((acc, group) => {
    return acc.add(group.value.mul(group.annualInflation));
  }, new Decimal(0));

  const sumOfWeights = Object.values(index).reduce((acc, g) => acc.add(g.cpiWeighting), new Decimal(0));
  return weightedSum.div(sumOfWeights);
}

const toPercentage = (x: string | number): Decimal => {
  return new Decimal(x).div(100);
};

export async function getStoreData(): Promise<InflationModel> {
  const absolutePath = __webpack_public_path__ || '/';

  // ** I can't find an alternative to these weights, I don't think they get seasonally adjusted **
  //
  // Downloaded from
  //
  // https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/annual-weight-update-cpi-and-living-cost-indexes/latest-release
  //
  // Appendix A
  // Annual weight update of the CPI and Living Cost Indexes
  // Reference period: 2021
  //
  const WEIGHTS = await csv(`${absolutePath}inflation-weights.csv`);

  //
  // ** The next files are two slightly different versions of the inflation data per group **
  //
  // Neither of them end up giving us that magic 6.1% 
  //

  //
  // Downloaded from
  //
  // https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/latest-release
  //
  const inflationData = await csv(`${absolutePath}annual-inflation.csv`);
  const INFLATION_REGULAR = inflationData.find(a => a[""] === 'Jun-2022');

  // Downloaded from
  //
  // https://explore.data.abs.gov.au/vis?fs[0]=Economy%2C0%7CPrice%20indexes%20and%20inflation%23PRICE_INDEX_INFLATION%23&pg=0&fc=Economy&df[ds]=ECONOMY_TOPICS&df[id]=CPI&df[ag]=ABS&df[vs]=1.1.0&pd=2022-Q2%2C&dq=3.102675%2B102676%2B114121%2B114122%2B1144%2B115484%2B115485%2B115495%2B115496%2B115497%2B115498%2B115500%2B115501%2B115520%2B115524%2B115529%2B131178%2B131183%2B131185%2B131190%2B131192%2B131194%2B30014%2B40001%2B40002%2B40004%2B40005%2B40006%2B40007%2B40008%2B40009%2B40010%2B40012%2B40014%2B40015%2B40025%2B40026%2B40027%2B40029%2B40030%2B40034%2B40045%2B40046%2B40047%2B40048%2B40053%2B40055%2B40058%2B40060%2B40066%2B40067%2B40072%2B40073%2B40077%2B40078%2B40080%2B40081%2B40083%2B40084%2B40085%2B40086%2B40087%2B40088%2B40089%2B40090%2B40091%2B40092%2B40093%2B40094%2B40095%2B40096%2B40098%2B40101%2B40102%2B97549%2B97550%2B97551%2B97554%2B97555%2B97557%2B97558%2B97559%2B97560%2B97564%2B97567%2B97571%2B97572%2B97573%2B97574%2B20001%2B20002%2B20003%2B20004%2B20005%2B20006%2B115486%2B115488%2B115489%2B115493%2B126670%2B999901%2B999902%2B999903.20.50.Q&ly[rs]=INDEX&lb=nm
  //
  // Params:
  // Measure: Percentage Change from Corresponding Quarter of the Previous Year
  // Adjustment Type: Seasonally Adjusted
  // Region: Weighted average of eight capital cities
  // Frequency: Quarterly
  // Time Period: 2022-Q2
  // Unit of measure: Percent
  //
  const customDataExport = await csv(`${absolutePath}custom.csv`);
  const INFLATION_SEASONALLY_ADJUSTED = customDataExport.map(i => {
    const name = i['INDEX: Index'].split(': ')[1];
    return {
      name,
      annualInflation: toPercentage(i.OBS_VALUE),
    };
  });

  const keyPrefix = 'Percentage Change from Corresponding Quarter of Previous Year ;  ';
  const keySuffix = ' ;  Australia ;';

  const inflationByGroup: InflationModel = Object.keys(INFLATION_REGULAR).reduce((acc: InflationModel, key: string) => {
    if (!key.startsWith(keyPrefix)) {
      return acc;
    }

    // Clean the key so it's just the label of the group (this is shared across all the datasets)
    const groupName = key.replace(keyPrefix, '').replace(keySuffix, '');
    if (groupName === 'All groups CPI') {
      return acc;
    }

    // Lookup the weightings using the key (groupName)
    const group = WEIGHTS.find(i => i.group === groupName)?.groupweight;
    const subgroup = WEIGHTS.find(i => i.subgroup === groupName)?.subgroupweight;
    const subsubgroup = WEIGHTS.find(i => i.subsubgroup === groupName)?.subsubgroupweight;

    // each group will have exactly one of these values
    const weighting: number = group || subgroup || subsubgroup;

    // Leave out subgroup as it doesn't appear in the custom data
    if (subgroup) {
      return acc;
    }

    // Use the seasonally adjusted data

    // construct a generic group definition
    const groupModel: ExpenditureGroup = {

      // TRY BOTH THESE: Use one or the other of the inflation numbers per group
      //    - seasonally adjusted data from custom explorer download
      annualInflation:INFLATION_SEASONALLY_ADJUSTED.find(i => i.name === groupName)?.annualInflation,
      //    - regular download from ABS website
      // annualInflation: toPercentage(INFLATION_REGULAR[key]),
 
      name: groupName,
      cpiWeighting: toPercentage(weighting),
      value: toPercentage(weighting),
      group: '', // TODO: figure out which top-level group to attach this to (doesn't matter at this stage)
    };

    // console.log(groupModel);

    // Add it to the right level on the hierarchy
    if (group) {
      return {
        ...acc,
        group: {
          ...acc.group,
          [groupName]: groupModel,
        },
      };
    }
    if (subgroup) {
      return {
        ...acc,
        subgroup: {
          ...acc.subgroup,
          [groupName]: groupModel,
        },
      };
    }
    if (subsubgroup) {
      return {
        ...acc,
        subsubgroup: {
          ...acc.subsubgroup,
          [groupName]: groupModel,
        },
      };
    }

    throw new Error(`Not in any group type! ${groupName}`);
  }, { group: {}, subgroup: {}, subsubgroup: {} } as InflationModel);

  // Calculate the combined inflation rate using a weighted average at "group" level and "subsubgroup (or expenditure class)" level
  console.log('inflation by group', calculateInflationRate(inflationByGroup.group).mul(100).toString());
  console.log('inflation by subsubgroup', calculateInflationRate(inflationByGroup.subsubgroup).mul(100).toString());

  // console.log(inflationByGroup);
  // console.log('inflation by subgroup', calculateInflationRate(inflationByGroup.subgroup).mul(100).toString());


  return inflationByGroup;
}
