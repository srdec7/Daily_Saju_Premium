// shared fortune tile DATA — element-based constants (language-agnostic values)
// Imported by locale files to avoid repeating these universal saju facts.

import type { FortuneTile } from './types';

export const FORTUNE_TILES_BASE: FortuneTile[] = [
  {
    element: 'wood',
    luckyColor: 'Celadon',
    luckyColorHex: '#5a9e74',
    luckyNumbers: '3  ·  8',
    direction: 'East  →',
    outfitTip: '',   // filled per locale
    luckyFood: '',   // filled per locale
    bestHour: '03 – 07',
  },
  {
    element: 'fire',
    luckyColor: 'Crimson',
    luckyColorHex: '#c94040',
    luckyNumbers: '2  ·  7',
    direction: 'South  ↓',
    outfitTip: '',
    luckyFood: '',
    bestHour: '11 – 15',
  },
  {
    element: 'earth',
    luckyColor: 'Ochre',
    luckyColorHex: '#c8a84f',
    luckyNumbers: '5  ·  10',
    direction: 'Center  ·',
    outfitTip: '',
    luckyFood: '',
    bestHour: '07 – 11',
  },
  {
    element: 'metal',
    luckyColor: 'Silver',
    luckyColorHex: '#a8b4c4',
    luckyNumbers: '4  ·  9',
    direction: 'West  ←',
    outfitTip: '',
    luckyFood: '',
    bestHour: '15 – 19',
  },
  {
    element: 'water',
    luckyColor: 'Indigo',
    luckyColorHex: '#3a6db5',
    luckyNumbers: '1  ·  6',
    direction: 'North  ↑',
    outfitTip: '',
    luckyFood: '',
    bestHour: '23 – 03',
  },
];
