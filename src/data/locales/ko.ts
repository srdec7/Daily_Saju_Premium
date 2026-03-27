import type { SajuDailyData } from '../types';

export const koData: SajuDailyData = {
  hwaduList: [],
  actionGuides: [
    { element: 'wood', action: '가까운 공원이나 나무가 있는 곳을 5분간 산책하세요.', reason: '나무(목)의 푸른 기운이 지친 눈과 뇌를 맑게 씻어줍니다.' },
    { element: 'fire', action: '따뜻한 햇살을 10초라도 직접 마주하며 심호흡하세요.', reason: '불(화)의 양기가 침체된 오라를 바깥으로 발산시켜 줍니다.' },
    { element: 'earth', action: '맨발로 땅을 밟거나, 잠시 바닥에 편안히 앉아보세요.', reason: '흙(토)의 묵직한 에너지가 붕 떠있는 마음의 뿌리를 잡아줍니다.' },
    { element: 'metal', action: '책상이나 지갑에 있는 불필요한 영수증을 하나 버리세요.', reason: '쇠(금)의 결단력이 필요한 날입니다. 작은 비움이 재물운을 엽니다.' },
    { element: 'water', action: '평소보다 천천히, 물 한 잔을 음미하며 마셔보세요.', reason: '물(수)의 유연함이 마찰을 줄이는 윤활유가 됩니다. 억지로 하지 마세요.' }
  ],
  colors: [
    { element: 'wood', colorName: 'Celadon', hexCode: '#53868B', gradient: 'linear-gradient(135deg, #1A3638, #45787d)' },
    { element: 'fire', colorName: 'Crimson', hexCode: '#8B3A3A', gradient: 'linear-gradient(135deg, #2A0808, #8B3A3A)' },
    { element: 'earth', colorName: 'Ochre', hexCode: '#B8860B', gradient: 'linear-gradient(135deg, #3A2A00, #966f0e)' },
    { element: 'metal', colorName: 'Silver', hexCode: '#D3D3D3', gradient: 'linear-gradient(135deg, #1C1C1C, #646b78)' },
    { element: 'water', colorName: 'Indigo', hexCode: '#104E8B', gradient: 'linear-gradient(135deg, #021223, #104E8B)' }
  ],
  fortuneTiles: [
    { element: 'wood', luckyColor: '청록색', luckyColorHex: '#5a9e74', luckyNumbers: '3 · 8', direction: '동 (East) →', outfitTip: '자연스러운 카키, 린넨 소재', luckyFood: '보리차, 푸른 잎채소', bestHour: '03:00 – 07:00' },
    { element: 'fire', luckyColor: '진홍색', luckyColorHex: '#c94040', luckyNumbers: '2 · 7', direction: '남 (South) ↓', outfitTip: '따뜻한 레드, 밝은 톤 포인트', luckyFood: '쌉쌀한 허브, 베리류', bestHour: '11:00 – 15:00' },
    { element: 'earth', luckyColor: '황토색', luckyColorHex: '#c8a84f', luckyNumbers: '5 · 10', direction: '중앙 (Center) ·', outfitTip: '베이지, 부드러운 브라운 톤', luckyFood: '뿌리채소, 잡곡밥', bestHour: '07:00 – 11:00' },
    { element: 'metal', luckyColor: '은백색', luckyColorHex: '#a8b4c4', luckyNumbers: '4 · 9', direction: '서 (West) ←', outfitTip: '무채색, 깔끔하고 미니멀한 룩', luckyFood: '매콤한 무국, 백미', bestHour: '15:00 – 19:00' },
    { element: 'water', luckyColor: '남색', luckyColorHex: '#3a6db5', luckyNumbers: '1 · 6', direction: '북 (North) ↑', outfitTip: '깊은 네이비, 어두운 톤', luckyFood: '해조류, 따뜻한 국물', bestHour: '23:00 – 03:00' }
  ]
};
