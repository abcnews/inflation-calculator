import { csv } from 'd3-fetch';

export interface ExpenditureGroup {
  name: string;
  annualInflation: number;
  cpiWeighting: number;
  // anuWeighting: number;

  value: number; // defaults to cpiWeighting
}

export type InflationIndex = Record<string, ExpenditureGroup>;

export function calculateInflationRate(index: InflationIndex): number {
  return Object.values(index).reduce((acc, group) => {
    // No idea if this is right
    return acc + group.value * group.annualInflation;
  }, 0);
}

const GROUPS = [
  { group: 'Housing', subgroup: 'Rents', label: 'Rents' },
  { group: 'Housing', subgroup: 'New dwelling purchase by owner-occupiers', label: 'New houses' },
  // { group: 'Housing', subgroup: 'Gas and other household fuels', label: 'Gas' },
  { group: 'Housing', subgroup: 'other', label: 'Housing (other)' },
  { group: 'Transport', subgroup: 'Motor vehicles', label: 'New cars' },
  { group: 'Transport', subgroup: 'Automotive fuel', label: 'Petrol' },
  { group: 'Transport', subgroup: 'other', label: 'Transport (other)' },

  { group: 'Food and non-alcoholic beverages', label: 'Food' },
  { group: 'Clothing and footwear', label: 'Clothing' },
  { group: 'Health', label: 'Health' },
  { group: 'Alcohol and tobacco', label: 'Alcohol and tobacco' },
  { group: 'Furnishings, household equipment and services', label: 'Household items/services' },
  { group: 'Communication', label: 'Communication' },
  { group: 'Recreation and culture', label: 'Recreation and culture' },
  { group: 'Education', label: 'Education' },
  { group: 'Insurance and financial services', label: 'Insurance and financial services' },
];

const calcSubgroupInflation = (latestYearSubgroups: any, name: string): number => {
  const subgroupKey = `Percentage Change from Previous Period ;  ${name} ;  Australia ;`;
  return latestYearSubgroups.reduce((acc, year) => acc + parseFloat(year[subgroupKey]), 0) / 100;
};
const calcSubgroupWeighting = (cpiWeights: any, name: string): number => {
  return parseFloat(cpiWeights.find(w => w.Subgroup === name)['Subgroup weight']) / 100;
};
const calcGroupWeighting = (cpiWeights: any, name: string): number => {
  return parseFloat(cpiWeights.find(w => w.Group === name && !w.Subgroup)['Group weight']) / 100;
};

export async function getStoreData(): Promise<InflationIndex> {
  const absolutePath = __webpack_public_path__ || '/';
  const groupsData = await csv(`${absolutePath}cpi-groups.csv`);
  const subgroupsData = await csv(`${absolutePath}cpi-subgroups.csv`);
  const cpiWeights = await csv(`${absolutePath}cpi-weights.csv`);
  const latestYearSubgroups = subgroupsData.slice(subgroupsData.length - 4);

  const groups = GROUPS.map(group => {

    // Calc inflation for group or subgroup
    let annualInflation = 0;
    let cpiWeighting = 0;
    if (group.subgroup === 'other') {
      //
      // Include the rest of the subgroups that haven't been used already to ensure we capture 100% of the basket
      //
      const excludedSubgroups = GROUPS.filter(g => g.group === group.group).map(g => g.subgroup);
      const includedSubgroups = cpiWeights.filter(g =>
        g.Group === group.group &&
        !!g.Subgroup &&
        excludedSubgroups.indexOf(g.Subgroup) === -1
      );

      cpiWeighting = includedSubgroups.reduce((acc, sg) => acc + parseFloat(sg['Subgroup weight']), 0) / 100;

      //
      // Weighted avaerage to combine the inflation of the remaining subgroups in the group
      //
      const combinedInflation = includedSubgroups.reduce((acc, sg) => {
        // The amount of the remaining subgroups that this subgroup makes up
        const weight = parseFloat(sg['Subgroup weight']) / 100;
        const weightInIncludedGroups = weight / cpiWeighting;

        // Weighted sum: inflation for subgroup & proportion of subgroup weighting
        return acc + calcSubgroupInflation(latestYearSubgroups, sg.Subgroup) * weightInIncludedGroups;
      }, 0);

      // Find the weighted average by dividing by number of subgroups
      annualInflation = combinedInflation / includedSubgroups.length;
    } else if (group.subgroup) {
      annualInflation = calcSubgroupInflation(latestYearSubgroups, group.subgroup);
      cpiWeighting = calcSubgroupWeighting(cpiWeights, group.subgroup);
    } else {
      annualInflation = parseFloat(groupsData.find(g => g.Group === group.group).Annual) / 100;
      cpiWeighting = calcGroupWeighting(cpiWeights, group.group);
    }

    return {
      name: group.label,
      annualInflation,
      cpiWeighting,
      value: cpiWeighting,
    };
  });

  // console.log(groups);
  // console.log(groups.reduce((acc, g) => acc + g.cpiWeighting, 0));

  return groups.reduce((acc, g) => ({ ...acc, [g.name]: g }), {});
}
