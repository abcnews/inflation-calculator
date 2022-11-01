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
  forceHousingProfile: boolean;
  applyPersonalisation: boolean;
  preventZoomSplitting: boolean;
}

export interface ExpenditureGroup {
  name: string;
  group: string;
  weights: ExpenditureGroupWeights;
  inflation: {
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
  expandX?: boolean;
  isHighlighted?: boolean;

  inflation: Decimal;
  weighting: Decimal;
}

export interface BarProps {
  name: string;
  isHighlighted?: boolean;
  budgetPercent?: number;

  width: number;
  height: number;
  x: number;
  y: number;
}
