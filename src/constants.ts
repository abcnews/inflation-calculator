import { Decimal } from 'decimal.js-light';
import { Customisation } from './types';

export const HOUSING_PROFILES = {
  'renter': {
    weightOverrides: {
      Rents: new Decimal(0.20),
    },
    removedGroups: ['Interest charges', 'Property rates and charges'],
  },
  'mortgage': {
    weightOverrides: {
      'Interest charges': new Decimal(0.16),
    },
    removedGroups: ['Rents'],
  },
  'outright': {
    removedGroups: ['Rents', 'Interest charges'],
  },
};

export const defaultCustomisation: Customisation = {
  index: 'employed',
  timelineYears: 1,
  splitGroups: [],
  removedGroups: [],
  highlightedGroups: [],

  orderBy: 'category',
  colourBy: 'category',

  showMarimako: false,
  showInflationBreakdown: false,

  housingProfile: null, // 'renter',
  weightOverrides: {
    // 'Automotive Fuel': new Decimal(0.03),
  },
};

