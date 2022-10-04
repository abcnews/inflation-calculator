import { Decimal } from 'decimal.js-light';
//
// Model for representing inflation indexes
//
export type InflationIndex = Array<ExpenditureGroup>;
export type InflationData = Record<string, Record<string, ExpenditureGroup>>;

export interface Customisation {
  index: keyof ExpenditureGroupWeights;
  timelineYears: 1 | 10;
  weightOverrides: Record<string, Decimal>;
  splitGroups: string[];
  removedGroups: string[];

  zoomedInGroups: string[];

  housingProfile?: string;
  highlightedGroups: string[];

  orderBy: string;
  colourBy: string;

  showMarimako: boolean;
  showInflationBreakdown: boolean;
  applyPersonalisation: boolean;
  preventZoomSplitting: boolean;

  // showDiscretionary: boolean;
}

export interface ExpenditureGroup {
  name: string;
  group: string;
  isDiscretionary: boolean;
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
  group: string;
  inflation: Decimal;
  weighting: Decimal;

  colour?: string;
  isDiscretionary: boolean;
  isHighlighted?: boolean;
}
