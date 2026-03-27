// src/utils/sajuEngine.ts -> 코어 만세력 (사주 계산) 엔진

export type SajuPillar = {
  stem: string; // 한글 천간 (갑, 을...)
  branch: string; // 한글 지지 (자, 축...)
  stemEn: string;
  branchEn: string;
};

export type SajuData = {
  year: number;
  month: number; // 1-12
  day: number;
  yearPillar: SajuPillar;
  monthPillar: SajuPillar;
  dayPillar: SajuPillar;
  dayElement: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
};

const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
const STEMS_EN = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const BRANCHES_EN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];

// Element map mapping Korean Stems to English elements
const ELEMENTS_MAP: Record<string, SajuData['dayElement']> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water'
};

// Year pillar (년주): based on 甲子 cycle starting from year 4 BC
export function getYearPillar(year: number): SajuPillar {
  const stemIdx = (year - 4 + 4 * 60) % 10;
  const branchIdx = (year - 4 + 4 * 60) % 12;
  return { 
    stem: STEMS[stemIdx], branch: BRANCHES[branchIdx], 
    stemEn: STEMS_EN[stemIdx], branchEn: BRANCHES_EN[branchIdx] 
  };
}

// Month pillar (월주): simplified heuristic based on month and year stem
export function getMonthPillar(year: number, month: number): SajuPillar {
  const stemBase = ((year - 4) % 5) * 2;
  const stemIdx = (stemBase + month + 1) % 10;
  const branchIdx = (month + 1) % 12;
  return { 
    stem: STEMS[(stemIdx + 10) % 10], branch: BRANCHES[(branchIdx + 12) % 12], 
    stemEn: STEMS_EN[(stemIdx + 10) % 10], branchEn: BRANCHES_EN[(branchIdx + 12) % 12] 
  };
}

// Day pillar (일주): Julian Day Number based cycle
function getJulianDay(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}

export function getDayPillar(year: number, month: number, day: number): SajuPillar {
  const jd = getJulianDay(year, month, day);
  const stemIdx = (jd + 40) % 10;
  const branchIdx = (jd + 14) % 12;
  return { 
    stem: STEMS[(stemIdx + 10) % 10], branch: BRANCHES[(branchIdx + 12) % 12], 
    stemEn: STEMS_EN[(stemIdx + 10) % 10], branchEn: BRANCHES_EN[(branchIdx + 12) % 12] 
  };
}

/**
 * Calculates the core 3 pillars (Year, Month, Day) and the primary element based on the Day Pillar
 */
export function calculateSaju(year: number, month: number, day: number): SajuData {
  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);
  const dayElement = ELEMENTS_MAP[dayPillar.stem];

  return {
    year, month, day,
    yearPillar, monthPillar, dayPillar, dayElement
  };
}

/**
 * Compare User's Day element to Today's Day element to derive Daily interaction.
 */
export function getDailyDynamic(userElement: string, todayElement: string): string {
  if (userElement === todayElement) return 'harmony';
  // Note: For now return simple dynamic, can be expanded to proper Wood->Fire etc.
  return 'growth';
}
