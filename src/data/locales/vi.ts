import type { SajuDailyData } from '../types';

export const viData: SajuDailyData = {
  hwaduList: [],
  actionGuides: [
    { element: 'wood', action: 'Walk near trees or a park for 5 minutes.', reason: 'The green energy of Wood revitalizes your tired mind and eyes.' },
    { element: 'fire', action: 'Face the literal sun and take a deep breath for 10 seconds.', reason: 'The Yang energy of Fire expands your stagnant aura outward.' },
    { element: 'earth', action: 'Stand barefoot on the earth or sit quietly on the floor.', reason: 'The grounding energy of Earth anchors your floating thoughts.' },
    { element: 'metal', action: 'Throw away one unnecessary receipt from your desk or wallet.', reason: 'A day for Metal’s decisiveness. A tiny clearing opens wealth.' },
    { element: 'water', action: 'Drink a glass of water slowly, savoring every drop.', reason: 'Water’s flexibility is your lubricant today. Do not force outcomes.' }
  ],
  colors: [
    { element: 'wood', colorName: 'Celadon', hexCode: '#53868B', gradient: 'linear-gradient(135deg, #1A3638, #45787d)' },
    { element: 'fire', colorName: 'Crimson', hexCode: '#8B3A3A', gradient: 'linear-gradient(135deg, #2A0808, #8B3A3A)' },
    { element: 'earth', colorName: 'Ochre', hexCode: '#B8860B', gradient: 'linear-gradient(135deg, #3A2A00, #966f0e)' },
    { element: 'metal', colorName: 'Silver', hexCode: '#D3D3D3', gradient: 'linear-gradient(135deg, #1C1C1C, #646b78)' },
    { element: 'water', colorName: 'Indigo', hexCode: '#104E8B', gradient: 'linear-gradient(135deg, #021223, #104E8B)' }
  ],
  fortuneTiles: [
    { element: 'wood', luckyColor: 'Celadon', luckyColorHex: '#5a9e74', luckyNumbers: '3 · 8', direction: 'East →', outfitTip: 'Natural khaki, linen fabric', luckyFood: 'Barley tea, leafy greens', bestHour: '03:00 – 07:00' },
    { element: 'fire', luckyColor: 'Crimson', luckyColorHex: '#c94040', luckyNumbers: '2 · 7', direction: 'South ↓', outfitTip: 'Warm red accents, bright tones', luckyFood: 'Bitter herbs, berries', bestHour: '11:00 – 15:00' },
    { element: 'earth', luckyColor: 'Ochre', luckyColorHex: '#c8a84f', luckyNumbers: '5 · 10', direction: 'Center ·', outfitTip: 'Beige, soft brown tones', luckyFood: 'Root crops, mixed grains', bestHour: '07:00 – 11:00' },
    { element: 'metal', luckyColor: 'Silver', luckyColorHex: '#a8b4c4', luckyNumbers: '4 · 9', direction: 'West ←', outfitTip: 'Monochrome, minimal clean look', luckyFood: 'Spicy radish soup, white rice', bestHour: '15:00 – 19:00' },
    { element: 'water', luckyColor: 'Indigo', luckyColorHex: '#3a6db5', luckyNumbers: '1 · 6', direction: 'North ↑', outfitTip: 'Deep navy, dark tones', luckyFood: 'Seaweed, warm broths', bestHour: '23:00 – 03:00' }
  ]
};
