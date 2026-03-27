export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export type Hwadu = {
  char: string;
  pronounciation: string;
  meaning: string;
  description: string;
};

export type ActionGuide = {
  element: ElementType;
  action: string;
  reason: string;
};

export type MotifColor = {
  element: ElementType;
  colorName: string;
  hexCode: string;
  gradient: string;
};

export type FortuneTile = {
  element: ElementType;
  luckyColor: string;
  luckyColorHex: string;
  luckyNumbers: string;
  direction: string;
  outfitTip: string;
  luckyFood: string;
  bestHour: string;
};

export type SajuDailyData = {
  hwaduList: Hwadu[];
  actionGuides: ActionGuide[];
  colors: MotifColor[];
  fortuneTiles: FortuneTile[];
};

export type AppState = {
  birthDate: string | null;  // YYYY-MM-DD
  birthTime: string | null;  // HH:MM (optional)
  language: string;          // 'ko', 'en', etc.
};
