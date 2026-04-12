// src/data/uiLocales.ts

export type UILocales = {
  landingTitle: string;
  landingSajuIntro: string;
  landingTojeongIntro: string;
  btnEnter: string;
  logoSub: string;
  description: string;
  sajuDesc: string;
  name: string;
  dateOfBirth: string;
  yearDefault: string;
  monthDefault: string;
  dayDefault: string;
  birthTime: string;
  birthTimeOptional: string;
  birthTimeTip: string;
  birthTimeUnknown: string;
  branchSuffix: string;
  gender: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  email: string;
  emailHint: string;
  btnBegin: string;
  btnReset: string;
  btnEnginePopup: string;
  elements: Record<'wood'|'fire'|'earth'|'metal'|'water', string>;
  tileColor: string;
  tileNumber: string;
  tileDirection: string;
  tileOutfit: string;
  tileFood: string;
  tileHour: string;
  paywallTitle: string;
  paywallDesc: string;
  planStandardVal: string;
  planStandardPrice: string;
  planStandardName: string;
  planStandardDesc: string;
  planPremiumVal: string;
  planPremiumPrice: string;
  planPremiumName: string;
  planPremiumDesc: string;
  btnViewSample: string;
  btnViewSampleStandard: string;
  btnViewSamplePremium: string;
  paywallBtn: string;
  paywallBtnStandard: string;
  paywallBtnPremium: string;
  btnRestore: string;
  teaserTitle: string;
  teaserDesc: string;

  teaserUnlockBtn: string;
  btnWatchAd: string;
  btnRemoveAds: string;
  adPlaying: string;
  adSimulatedDesc: string;
  hwaduExplLabel: string;
  sampleTitle: string;
  sampleTitleStandard: string;
  sampleTitlePremium: string;
  sampleDesc: string;
  sampleSec1Title: string;
  sampleSec1Text: string;
  sampleSec2Title: string;
  sampleSec2Text: string;
  sampleSec3Title: string;
  sampleSec3Text: string;
  sampleFooter: string;
  btnCloseSample: string;
  engineTitle: string;
  engineDesc1: string;
  engineItem1Title: string;
  engineItem1Desc: string;
  engineItem2Title: string;
  engineItem2Desc: string;
  teaserListTitle: string;
  tFeature1: string;
  tFeature2: string;
  tFeature3: string;
  tFeature4: string;
  tFeature5: string;
  tFeature6: string;
  tFeature7: string;
  tFeature8: string;
};

export const uiTranslations: Record<string, UILocales> = {
  ko: {
    landingTitle: '운명의 지도를 펼치다',
    landingSajuIntro: '사주(四柱)는 태어난 연·월·일·시의 네 기둥으로,\n세상에 첫 숨을 내쉰 순간 당신에게 깃든\n고유한 우주의 에너지를 읽어내는 동양의 지혜입니다.',
    landingTojeongIntro: '수백 년 동안 한국인들은 인생의 중요한 갈림길마다\n토정비결의 지혜를 빌려 다가올 화를 피하고\n복을 맞이해 왔습니다.\n\n이제, 당신의 삶에 숨겨진 흐름과\n운명의 나침반을 확인해 보세요.',
    btnEnter: '입장하기',
    logoSub: 'Daily Saju Ritual',
    description: '당신의 타고난 기운을 분석하여 오늘 하루를 위한\n단 하나의 비책을 알려드립니다.',
    sajuDesc: '사주(四柱)는 태어난 연·월·일·시의 네 기둥으로\n당신의 타고난 기운과 오늘의 흐름을 읽는 동양의 지혜입니다.',
    name: '이름',
    dateOfBirth: '생년월일',
    yearDefault: '년도',
    monthDefault: '월',
    dayDefault: '일',
    birthTime: '태어난 시',
    birthTimeOptional: '선택사항',
    birthTimeTip: '✶ 태어난 시를 입력하면 사주팔자 전체를 더욱 정밀하게 분석할 수 있습니다.',
    birthTimeUnknown: '— 모름 / 건너뛰기',
    branchSuffix: '시',
    gender: '성별',
    genderMale: '남성',
    genderFemale: '여성',
    genderOther: '기타',
    email: '이메일',
    emailHint: '(프리미엄 기능 이용 시 필요)',
    btnBegin: '시작하기',
    btnReset: '첫 페이지로 가기',
    btnEnginePopup: '데일리 사주란?',
    elements: { wood: '木 목', fire: '火 화', earth: '土 토', metal: '金 금', water: '水 수' },
    tileColor: '오늘의 색', tileNumber: '행운의 숫자', tileDirection: '방향',
    tileOutfit: '오늘의 옷차림', tileFood: '오늘의 음식', tileHour: '최적의 시간',
    paywallTitle: '무료 체험이 종료되었습니다',
    paywallDesc: '단 한 번의 결제로 매일의 사주와 올해의 운(토정비결)을 열어보세요.',
    planStandardVal: '$4.99',
    planStandardPrice: '$2.99',
    planStandardName: '스탠다드 패스',
    planStandardDesc: '매일 무제한 1년치 데일리운세 + 토정비결 총운 및 상/하반기 분석',
    planPremiumVal: '$9.99',
    planPremiumPrice: '$4.99',
    planPremiumName: '심층 프리미엄 패스 (추천)',
    planPremiumDesc: '스탠다드 패스 + 9개의 테마운세 + 12개월 월별 운세',
    btnViewSample: '🔮 프리미엄 결과 미리보기',
    btnViewSampleStandard: '🔮 스탠다드 결과 미리보기',
    btnViewSamplePremium: '🔮 프리미엄 결과 미리보기',
    paywallBtn: '프리미엄 로드맵 확인하기',
    paywallBtnStandard: '스탠다드 패스 결제하기 ($2.99)',
    paywallBtnPremium: '프리미엄 패스 결제하기 ($4.99)',
    btnRestore: '결제 내역 복원하기 (이미 결제하신 경우)',
    teaserTitle: '당신의 2026년 전체 운명 리포트',
    teaserDesc: '동영상 광고를 시청하고 [총운·재물·직장·애정] 등 모든 카테고리를 오늘 무료로 확인하세요.',
    teaserUnlockBtn: '프리미엄 권한 해제하기',
    btnWatchAd: '광고 시청 후 결과 보기',
    btnRemoveAds: '광고 없이 1년 보기 ($1.99)',
    adPlaying: '광고 시청 중...',
    adSimulatedDesc: '이 화면은 실제 광고 재생 전 가상으로 작동하는 모의 화면입니다.',
    hwaduExplLabel: '이 글자는 오늘 당신의 운에 해당되는 단어입니다.',
    sampleTitle: '프리미엄 토정비결 리포트',
    sampleTitleStandard: '스탠다드 토정비결 리포트',
    sampleTitlePremium: '프리미엄 토정비결 리포트',
    sampleDesc: '이 리포트는 사용자님이 결제 후 받게 되실 결과내용의 샘플입니다.',
    sampleSec1Title: '✦ 올해의 핵심 총평',
    sampleSec1Text: '올해는 당신의 잠재력이 크게 폭발하는 시기입니다. 막혀있던 문제들이 귀인의 도움으로 눈 녹듯 해결됩니다...',
    sampleSec2Title: '✦ 재물운과 투자 방향',
    sampleSec2Text: '가을을 기점으로 금전운이 상승 곡선을 그립니다. 새로운 문서운이 들어오니 계약이나 투자를 신중하지만 과감하게...',
    sampleSec3Title: '✦ 연애와 인간관계',
    sampleSec3Text: '솔직하고 담백한 소통이 기존 관계를 단단하게 만듭니다. 물가(수변 공간)에서 새로운 인연의 기운이 강하게 싹틉니다...',
    sampleFooter: '...결제 후 9개의 상세 분석 항목 전체를 확인하세요!',
    btnCloseSample: '미리보기 닫기',
    engineTitle: '전통 사주명리학의 과학화',
    engineDesc1: '데일리 사주는 <strong>수십만 건의 사주팔자 데이터 패턴</strong>을 정밀하게 분석하여 설계되었습니다.<br><br>조선 시대부터 이어져 온 토정 이지함의 원본 <span style="color:var(--gold);">[토정비결]</span>과 송대 서자평의 <span style="color:var(--gold);">[자평진전]</span> 이론을 바탕으로, 동양의 순환론적 통계 우주관을 현대적인 알고리즘으로 완벽히 복원해냈습니다.',
    engineItem1Title: '수만 가지의 운명 경우의 수',
    engineItem1Desc: '생년월일시에 따른 섬세하고 정확한 명리 스펙트럼 분석.',
    engineItem2Title: '1년의 거대한 기운 예측',
    engineItem2Desc: '인생의 변곡점과 기회를 짚어주는 2026년 전문 토정비결.',
    teaserListTitle: '열람 가능한 2026년 운세 카테고리:',
    tFeature1: '2026년 총운',
    tFeature2: '상반기 / 하반기',
    tFeature3: '재물운 분석',
    tFeature4: '직업 및 사업운',
    tFeature5: '연애 및 배우자운',
    tFeature6: '인간관계 갈등/조언',
    tFeature7: '12개월 월별 세운',
    tFeature8: '건강 및 복점 가이드'
  },
  en: {
    landingTitle: 'Unveil Your Map of Destiny',
    landingSajuIntro: 'Saju (四柱), meaning "Four Pillars,"\nis the ancient Eastern art\nof reading the unique cosmic energy\nwithin you at the moment of your birth.',
    landingTojeongIntro: 'For centuries, Koreans have turned\nto the profound wisdom of Tojeongbigyeol\nto navigate life\'s crossroads,\navoid misfortune, and welcome prosperity.\n\nNow, it is time\nto unlock the hidden flow of your own life.',
    btnEnter: 'Enter',
    logoSub: 'Daily Saju Ritual',
    description: 'Analyzing your innate energy to reveal a single guiding insight for your day.',
    sajuDesc: 'Saju (四柱) reads the four pillars of your birth—year, month, day, and hour—\nto reveal the energy woven into your destiny.',
    name: 'Name',
    dateOfBirth: 'Date of Birth',
    yearDefault: 'Year',
    monthDefault: 'Month',
    dayDefault: 'Day',
    birthTime: 'Birth Time',
    birthTimeOptional: 'Optional',
    birthTimeTip: '✶ Knowing your birth hour enables a more precise reading of all Four Pillars.',
    birthTimeUnknown: '— Unknown / Skip',
    branchSuffix: '',
    gender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    email: 'Email',
    emailHint: '(for premium features)',
    btnBegin: 'Begin',
    btnReset: 'Return to Home',
    btnEnginePopup: 'What is Daily Saju?',
    elements: { wood: '木 Wood', fire: '火 Fire', earth: '土 Earth', metal: '金 Metal', water: '水 Water' },
    tileColor: 'Lucky Color', tileNumber: 'Lucky Number', tileDirection: 'Direction',
    tileOutfit: 'Outfit Tip', tileFood: 'Lucky Food', tileHour: 'Best Hour',
    paywallTitle: 'Your Free Trial Has Ended',
    paywallDesc: 'Unlock your daily Saju and this year\'s destiny (Tojeong) with a single payment.',
    planStandardVal: '$4.99',
    planStandardPrice: '$2.99',
    planStandardName: 'Standard Pass',
    planStandardDesc: '1-Year Daily Saju Access + Tojeong Overall & 1st/2nd Half Analysis',
    planPremiumVal: '$9.99',
    planPremiumPrice: '$4.99',
    planPremiumName: 'Premium Deep Pass (Recommended)',
    planPremiumDesc: 'Standard Pass + 9 Theme Forecasts + 12-Month Fortune',
    btnViewSample: '🔮 View Premium Sample',
    btnViewSampleStandard: '🔮 View Standard Sample',
    btnViewSamplePremium: '🔮 View Premium Sample',
    paywallBtn: 'Unlock My Fortune',
    paywallBtnStandard: 'Unlock Standard Pass ($2.99)',
    paywallBtnPremium: 'Unlock Premium Pass ($4.99)',
    btnRestore: 'Restore Purchase / I already paid',
    teaserTitle: 'Your 2026 Yearly Destiny Report',
    teaserDesc: 'Watch a short video ad to unlock all categories including overall, wealth, career, and love flow today.',
    teaserUnlockBtn: 'Unlock Premium Access',
    btnWatchAd: 'Watch Ad to Unlock',
    btnRemoveAds: '1-Year Ad-Free Pass ($1.99)',
    adPlaying: 'Ad Playing...',
    adSimulatedDesc: 'This is a simulated video ad overlay. Your content will unlock shortly.',
    hwaduExplLabel: 'This Korean word represents your overall fortune for today.',
    sampleTitle: 'Premium Tojeong Report',
    sampleTitleStandard: 'Standard Tojeong Report',
    sampleTitlePremium: 'Premium Tojeong Report',
    sampleDesc: 'This report is a sample of the results you will receive after payment.',
    sampleSec1Title: '✦ Yearly Overview',
    sampleSec1Text: 'This year brings a massive flow of creative energy. Obstacles will melt away with the help of unexpected noble encounters...',
    sampleSec2Title: '✦ Wealth & Investment',
    sampleSec2Text: 'A significant opportunity for financial expansion arises around autumn. New contracts or investments will prove highly fruitful...',
    sampleSec3Title: '✦ Relationships & Love',
    sampleSec3Text: 'Honest communication strengthens existing bonds. If seeking a new connection, water-side locations will bring immense luck...',
    sampleFooter: '...unlock to see all 9 detailed sections and the 12-month guide!',
    btnCloseSample: 'Close Preview',
    engineTitle: 'The Science of Traditional Saju',
    engineDesc1: 'Daily Saju is engineered by meticulously analyzing <strong>hundreds of thousands of destiny patterns</strong>.<br><br>Based on the original <span style="color:var(--gold);">[Tojeongbigyeol]</span> from the Joseon Dynasty and the <span style="color:var(--gold);">[Japyeongjinjeon]</span> from the Song Dynasty, we have fully restored the Eastern cyclic statistical worldview into a modern algorithm.',
    engineItem1Title: 'Tens of Thousands of Destiny Variations',
    engineItem1Desc: 'Intricate and precise spectrum analysis strictly based on your birth time.',
    engineItem2Title: 'Major Energy Forecast for the Year',
    engineItem2Desc: 'Professional 2026 yearly Tojeong guide identifying your life\'s turning points and opportunities.',
    teaserListTitle: 'Included 2026 Fortune Categories:',
    tFeature1: '2026 Overall',
    tFeature2: 'H1 / H2 Analysis',
    tFeature3: 'Wealth & Finances',
    tFeature4: 'Career & Business',
    tFeature5: 'Love & Partner',
    tFeature6: 'Social & Network',
    tFeature7: '12-Month Fortune',
    tFeature8: 'Health & Guidance'
  }
};
