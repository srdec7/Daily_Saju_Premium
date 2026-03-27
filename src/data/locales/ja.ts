import type { SajuDailyData } from '../types';

export const jaData: SajuDailyData = {
  hwaduList: [],
  actionGuides: [
    { element: 'wood', action: '近くの公園や木のある場所を5分間散歩してください。', reason: '木の青々とした気が、疲れた目と脳を澄み切らせます。' },
    { element: 'fire', action: '10秒だけでも暖かい日差しを直接浴びて深呼吸してください。', reason: '火の陽気が、停滞したオーラを外へと発散させてくれます。' },
    { element: 'earth', action: '裸足で土を踏むか、しばらく床にゆったり座ってみてください。', reason: '土のどっしりとしたエネルギーが、浮ついた心の根を下ろしてくれます。' },
    { element: 'metal', action: '机や財布に入っている不要なレシートを1枚捨ててください。', reason: '金の決断力が必要な日です。小さな手放しが金運を開きます。' },
    { element: 'water', action: '普段よりゆっくりと、コップ一杯の水を味わいながら飲んでください。', reason: '水の柔軟さが摩擦を減らす潤滑油になります。無理しないでください。' }
  ],
  colors: [
    { element: 'wood', colorName: 'Celadon', hexCode: '#53868B', gradient: 'linear-gradient(135deg, #1A3638, #45787d)' },
    { element: 'fire', colorName: 'Crimson', hexCode: '#8B3A3A', gradient: 'linear-gradient(135deg, #2A0808, #8B3A3A)' },
    { element: 'earth', colorName: 'Ochre', hexCode: '#B8860B', gradient: 'linear-gradient(135deg, #3A2A00, #966f0e)' },
    { element: 'metal', colorName: 'Silver', hexCode: '#D3D3D3', gradient: 'linear-gradient(135deg, #1C1C1C, #646b78)' },
    { element: 'water', colorName: 'Indigo', hexCode: '#104E8B', gradient: 'linear-gradient(135deg, #021223, #104E8B)' }
  ],
  fortuneTiles: [
    { element: 'wood', luckyColor: '青磁色', luckyColorHex: '#5a9e74', luckyNumbers: '3 · 8', direction: '東 →', outfitTip: 'ナチュラルなカーキ、リネン素材', luckyFood: '麦茶、葉野菜', bestHour: '03:00 – 07:00' },
    { element: 'fire', luckyColor: '真紅色', luckyColorHex: '#c94040', luckyNumbers: '2 · 7', direction: '南 ↓', outfitTip: '温かみのある赤、明るいポイント', luckyFood: '苦味のあるハーブ、ベリー類', bestHour: '11:00 – 15:00' },
    { element: 'earth', luckyColor: '黄土色', luckyColorHex: '#c8a84f', luckyNumbers: '5 · 10', direction: '中央 ·', outfitTip: 'ベージュ、柔らかなブラウン', luckyFood: '根菜類、雑穀米', bestHour: '07:00 – 11:00' },
    { element: 'metal', luckyColor: '銀白色', luckyColorHex: '#a8b4c4', luckyNumbers: '4 · 9', direction: '西 ←', outfitTip: '無彩色、清潔なミニマルルック', luckyFood: 'スパイシーな大根スープ、白米', bestHour: '15:00 – 19:00' },
    { element: 'water', luckyColor: '藍色', luckyColorHex: '#3a6db5', luckyNumbers: '1 · 6', direction: '北 ↑', outfitTip: '深いネイビー、ダークトーン', luckyFood: '海藻類、温かいスープ', bestHour: '23:00 – 03:00' }
  ]
};
