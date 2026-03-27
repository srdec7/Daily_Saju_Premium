import type { SajuDailyData } from '../types';

export const zhData: SajuDailyData = {
  hwaduList: [],
  actionGuides: [
    { element: 'wood', action: '在附近的公园或有树的地方散步5分钟。', reason: '木的翠绿之气能洗净疲惫的双眼和大脑。' },
    { element: 'fire', action: '即使只有10秒，也要直面温暖的阳光深呼吸。', reason: '火的阳气能将你停滞的能量向外散发。' },
    { element: 'earth', action: '赤脚踩在土地上，或者暂时舒服地坐在地板上。', reason: '土的沉稳能量能让你浮躁的心扎下根来。' },
    { element: 'metal', action: '丢掉桌上或钱包里的一张无用收据。', reason: '今天需要金的决断力。小小的舍弃能开启财运。' },
    { element: 'water', action: '比平时更慢地品味一杯水。', reason: '水的柔软能成为减少摩擦的润滑剂。顺其自然吧。' }
  ],
  colors: [
    { element: 'wood', colorName: 'Celadon', hexCode: '#53868B', gradient: 'linear-gradient(135deg, #1A3638, #45787d)' },
    { element: 'fire', colorName: 'Crimson', hexCode: '#8B3A3A', gradient: 'linear-gradient(135deg, #2A0808, #8B3A3A)' },
    { element: 'earth', colorName: 'Ochre', hexCode: '#B8860B', gradient: 'linear-gradient(135deg, #3A2A00, #966f0e)' },
    { element: 'metal', colorName: 'Silver', hexCode: '#D3D3D3', gradient: 'linear-gradient(135deg, #1C1C1C, #646b78)' },
    { element: 'water', colorName: 'Indigo', hexCode: '#104E8B', gradient: 'linear-gradient(135deg, #021223, #104E8B)' }
  ],
  fortuneTiles: [
    { element: 'wood', luckyColor: '青瓷色', luckyColorHex: '#5a9e74', luckyNumbers: '3 · 8', direction: '东 →', outfitTip: '自然的卡其色、亚麻材质', luckyFood: '大麦茶、绿叶蔬菜', bestHour: '03:00 – 07:00' },
    { element: 'fire', luckyColor: '猩红色', luckyColorHex: '#c94040', luckyNumbers: '2 · 7', direction: '南 ↓', outfitTip: '温暖的红色、明亮色调点缀', luckyFood: '微苦的香草、浆果类', bestHour: '11:00 – 15:00' },
    { element: 'earth', luckyColor: '赭石色', luckyColorHex: '#c8a84f', luckyNumbers: '5 · 10', direction: '中间 ·', outfitTip: '米色、柔和的棕色调', luckyFood: '根茎类蔬菜、杂粮饭', bestHour: '07:00 – 11:00' },
    { element: 'metal', luckyColor: '银白色', luckyColorHex: '#a8b4c4', luckyNumbers: '4 · 9', direction: '西 ←', outfitTip: '无彩色、干净极简的穿搭', luckyFood: '微辣的萝卜汤、白米饭', bestHour: '15:00 – 19:00' },
    { element: 'water', luckyColor: '靛蓝色', luckyColorHex: '#3a6db5', luckyNumbers: '1 · 6', direction: '北 ↑', outfitTip: '深藏青色、暗色调', luckyFood: '海藻类、温暖的清汤', bestHour: '23:00 – 03:00' }
  ]
};
