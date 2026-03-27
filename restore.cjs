const fs = require('fs');
const langs = ['en','ko','ja','zh','es','hi','fr','de','it','pt','ru','ar','tr','th','vi','id'];
const d_ko = {
  actions: [
    { a: '가까운 공원이나 나무가 있는 곳을 5분간 산책하세요.', r: '나무(목)의 푸른 기운이 지친 눈과 뇌를 맑게 씻어줍니다.' },
    { a: '따뜻한 햇살을 10초라도 직접 마주하며 심호흡하세요.', r: '불(화)의 양기가 침체된 오라를 바깥으로 발산시켜 구설을 막아줍니다.' },
    { a: '맨발로 땅을 밟거나, 잠시 바닥에 편안히 앉아보세요.', r: '흙(토)의 묵직한 에너지가 붕 떠있는 마음의 뿌리를 잡아줍니다.' },
    { a: '책상이나 지갑에 있는 불필요한 영수증을 하나 버리세요.', r: '쇠(금)의 결단력이 필요한 날입니다. 작은 비움이 재물운을 엽니다.' },
    { a: '평소보다 천천히, 물 한 잔을 음미하며 마셔보세요.', r: '물(수)의 유연함이 마찰을 줄이는 윤활유가 됩니다. 억지로 하지 마세요.' }
  ],
  tiles: [
    { c: '청록색', n: '3 · 8', d: '동 (East) →', o: '자연스러운 카키, 린넨 소재', f: '보리차, 푸른 잎채소', h: '03:00 – 07:00' },
    { c: '진홍색', n: '2 · 7', d: '남 (South) ↓', o: '따뜻한 레드, 밝은 톤 포인트', f: '쌉쌀한 허브, 베리류', h: '11:00 – 15:00' },
    { c: '황토색', n: '5 · 10', d: '중앙 (Center) ·', o: '베이지, 부드러운 브라운 톤', f: '뿌리채소, 잡곡밥', h: '07:00 – 11:00' },
    { c: '은백색', n: '4 · 9', d: '서 (West) ←', o: '무채색, 깔끔하고 미니멀한 룩', f: '매콤한 무국, 백미', h: '15:00 – 19:00' },
    { c: '남색', n: '1 · 6', d: '북 (North) ↑', o: '깊은 네이비, 어두운 톤', f: '해조류, 따뜻한 국물', h: '23:00 – 03:00' }
  ]
};
const d_en = {
  actions: [
    { a: 'Walk near trees or a park for 5 minutes.', r: 'The green energy of Wood revitalizes your tired mind and eyes.' },
    { a: 'Face the sun directly and take a deep breath for 10 seconds.', r: 'The Yang energy of Fire expands your stagnant aura outward.' },
    { a: 'Stand barefoot on the earth or sit quietly on the floor.', r: 'The grounding energy of Earth anchors your floating thoughts.' },
    { a: 'Throw away one unnecessary receipt from your desk or wallet.', r: 'A day for Metal’s decisiveness. A tiny clearing opens wealth.' },
    { a: 'Drink a glass of water slowly, savoring every drop.', r: 'Water’s flexibility is your lubricant today. Do not force outcomes.' }
  ],
  tiles: [
    { c: 'Celadon', n: '3 · 8', d: 'East →', o: 'Natural khaki, linen fabric', f: 'Barley tea, leafy greens', h: '03:00 – 07:00' },
    { c: 'Crimson', n: '2 · 7', d: 'South ↓', o: 'Warm red accents, bright tones', f: 'Bitter herbs, berries', h: '11:00 – 15:00' },
    { c: 'Ochre', n: '5 · 10', d: 'Center ·', o: 'Beige, soft brown tones', f: 'Root crops, mixed grains', h: '07:00 – 11:00' },
    { c: 'Silver', n: '4 · 9', d: 'West ←', o: 'Monochrome, minimal clean look', f: 'Spicy radish soup, white rice', h: '15:00 – 19:00' },
    { c: 'Indigo', n: '1 · 6', d: 'North ↑', o: 'Deep navy, dark tones', f: 'Seaweed, warm broths', h: '23:00 – 03:00' }
  ]
};
const d_ja = {
  actions: [
    { a: '近くの公園や木のある場所を5分間散歩してください。', r: '木の青々とした気が、疲れた目と脳を澄み切らせます。' },
    { a: '10秒だけでも暖かい日差しを直接浴びて深呼吸してください。', r: '火の陽気が、停滞したオーラを外へと発散させてくれます。' },
    { a: '裸足で土を踏むか、しばらく床にゆったり座ってみてください。', r: '土のどっしりとしたエネルギーが、浮ついた心の根を下ろしてくれます。' },
    { a: '机や財布に入っている不要なレシートを1枚捨ててください。', r: '金の決断力が必要な日です。小さな手放しが金運を開きます。' },
    { a: '普段よりゆっくりと、コップ一杯の水を味わいながら飲んでください。', r: '水の柔軟さが摩擦を減らす潤滑油になります。無理しないでください。' }
  ],
  tiles: [
    { c: '青磁色', n: '3 · 8', d: '東 →', o: 'ナチュラルなカーキ、リネン素材', f: '麦茶、葉野菜', h: '03:00 – 07:00' },
    { c: '真紅色', n: '2 · 7', d: '南 ↓', o: '温かみのある赤、明るいポイント', f: '苦味のあるハーブ、ベリー類', h: '11:00 – 15:00' },
    { c: '黄土色', n: '5 · 10', d: '中央 ·', o: 'ベージュ、柔らかなブラウン', f: '根菜類、雑穀米', h: '07:00 – 11:00' },
    { c: '銀白色', n: '4 · 9', d: '西 ←', o: '無彩色、清潔なミニマルルック', f: 'スパイシーな大根スープ、白米', h: '15:00 – 19:00' },
    { c: '藍色', n: '1 · 6', d: '北 ↑', o: '深いネイビー、ダークトーン', f: '海藻類、温かいスープ', h: '23:00 – 03:00' }
  ]
};
const d_zh = {
  actions: [
    { a: '在附近的公园或有树的地方散步5分钟。', r: '木的翠绿之气能洗净疲惫的双眼和大脑。' },
    { a: '即使只有10秒，也要直面温暖的阳光深呼吸。', r: '火的阳气能将你停滞的能量向外散发。' },
    { a: '赤脚踩在土地上，或者暂时舒服地坐在地板上。', r: '土的沉稳能量能让你浮躁的心扎下根来。' },
    { a: '丢掉桌上或钱包里的一张无用收据。', r: '今天需要金的决断力。小小的舍弃能开启财运。' },
    { a: '比平时更慢地品味一杯水。', r: '水的柔软能成为减少摩擦的润滑剂。顺其自然吧。' }
  ],
  tiles: [
    { c: '青瓷色', n: '3 · 8', d: '东 →', o: '自然的卡其色、亚麻材质', f: '大麦茶、绿叶蔬菜', h: '03:00 – 07:00' },
    { c: '猩红色', n: '2 · 7', d: '南 ↓', o: '温暖的红色、明亮色调点缀', f: '微苦的香草、浆果类', h: '11:00 – 15:00' },
    { c: '赭石色', n: '5 · 10', d: '中间 ·', o: '米色、柔和的棕色调', f: '根茎类蔬菜、杂粮饭', h: '07:00 – 11:00' },
    { c: '银白色', n: '4 · 9', d: '西 ←', o: '无彩色、干净极简的穿搭', f: '微辣的萝卜汤、白米饭', h: '15:00 – 19:00' },
    { c: '靛蓝色', n: '1 · 6', d: '北 ↑', o: '深藏青色、暗色调', f: '海藻类、温暖的清汤', h: '23:00 – 03:00' }
  ]
};
const dict = { ko: d_ko, en: d_en, ja: d_ja, zh: d_zh };

langs.forEach(lang => {
  const d = dict[lang] || dict['en'];
  const content = "import type { SajuDailyData } from '../types';\n" +
"export const " + lang + "Data: SajuDailyData = {\n" +
"  hwaduList: [],\n" +
"  actionGuides: [\n" +
"    { element: 'wood', action: '" + d.actions[0].a + "', reason: '" + d.actions[0].r + "' },\n" +
"    { element: 'fire', action: '" + d.actions[1].a + "', reason: '" + d.actions[1].r + "' },\n" +
"    { element: 'earth', action: '" + d.actions[2].a + "', reason: '" + d.actions[2].r + "' },\n" +
"    { element: 'metal', action: '" + d.actions[3].a + "', reason: '" + d.actions[3].r + "' },\n" +
"    { element: 'water', action: '" + d.actions[4].a + "', reason: '" + d.actions[4].r + "' }\n" +
"  ],\n" +
"  colors: [\n" +
"    { element: 'wood', colorName: 'Celadon', hexCode: '#53868B', gradient: 'linear-gradient(135deg, #1A3638, #45787d)' },\n" +
"    { element: 'fire', colorName: 'Crimson', hexCode: '#8B3A3A', gradient: 'linear-gradient(135deg, #2A0808, #8B3A3A)' },\n" +
"    { element: 'earth', colorName: 'Ochre', hexCode: '#B8860B', gradient: 'linear-gradient(135deg, #3A2A00, #966f0e)' },\n" +
"    { element: 'metal', colorName: 'Silver', hexCode: '#D3D3D3', gradient: 'linear-gradient(135deg, #1C1C1C, #646b78)' },\n" +
"    { element: 'water', colorName: 'Indigo', hexCode: '#104E8B', gradient: 'linear-gradient(135deg, #021223, #104E8B)' }\n" +
"  ],\n" +
"  fortuneTiles: [\n" +
"    { element: 'wood', luckyColor: '" + d.tiles[0].c + "', luckyColorHex: '#5a9e74', luckyNumbers: '" + d.tiles[0].n + "', direction: '" + d.tiles[0].d + "', outfitTip: '" + d.tiles[0].o + "', luckyFood: '" + d.tiles[0].f + "', bestHour: '" + d.tiles[0].h + "' },\n" +
"    { element: 'fire', luckyColor: '" + d.tiles[1].c + "', luckyColorHex: '#c94040', luckyNumbers: '" + d.tiles[1].n + "', direction: '" + d.tiles[1].d + "', outfitTip: '" + d.tiles[1].o + "', luckyFood: '" + d.tiles[1].f + "', bestHour: '" + d.tiles[1].h + "' },\n" +
"    { element: 'earth', luckyColor: '" + d.tiles[2].c + "', luckyColorHex: '#c8a84f', luckyNumbers: '" + d.tiles[2].n + "', direction: '" + d.tiles[2].d + "', outfitTip: '" + d.tiles[2].o + "', luckyFood: '" + d.tiles[2].f + "', bestHour: '" + d.tiles[2].h + "' },\n" +
"    { element: 'metal', luckyColor: '" + d.tiles[3].c + "', luckyColorHex: '#a8b4c4', luckyNumbers: '" + d.tiles[3].n + "', direction: '" + d.tiles[3].d + "', outfitTip: '" + d.tiles[3].o + "', luckyFood: '" + d.tiles[3].f + "', bestHour: '" + d.tiles[3].h + "' },\n" +
"    { element: 'water', luckyColor: '" + d.tiles[4].c + "', luckyColorHex: '#3a6db5', luckyNumbers: '" + d.tiles[4].n + "', direction: '" + d.tiles[4].d + "', outfitTip: '" + d.tiles[4].o + "', luckyFood: '" + d.tiles[4].f + "', bestHour: '" + d.tiles[4].h + "' }\n" +
"  ]\n" +
"};\n";
  fs.writeFileSync('src/data/locales/' + lang + '.ts', content, 'utf8');
});
console.log('Restored all 16 locales in UTF-8');
