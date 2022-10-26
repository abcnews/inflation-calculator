import { Decimal } from 'decimal.js-light';
import { Customisation } from './types';

export const CPI = new Decimal(0.073);

export const HOUSING_PROFILES = {
  'renter': {
    weightOverrides: {
      Rents: new Decimal(0.20),
    },
    removedGroups: ['Interest charges', 'Property rates and charges', 'Maintenance and repair of the dwelling'],
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
  index: 'cpi',
  housingProfile: undefined, // 'renter',

  timelineYears: 1,
  splitGroups: [],

  // Actually remove from the model (and labels etc)
  removedGroups: [],

  // Visual modifications
  zoomedInGroups: [],
  highlightedGroups: [],

  orderBy: 'category',
  colourBy: 'category',

  showMarimako: false,
  showInflationBreakdown: false,

  applyPersonalisation: false,
  preventZoomSplitting: false,

  weightOverrides: {},
};

