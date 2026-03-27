import fs from 'fs';

const pathKo = './public/data/premium/ko.json';
const pathEn = './public/data/premium/en.json';

function patchKorean(text) {
    if (!text) return text;
    let t = text;
    t = t.replace(/30대[^\s]*/g, '청년기를 지나며');
    t = t.replace(/40대[^\s]*/g, '인생의 황금기(중장년)에 접어들며');
    t = t.replace(/50대[^\s]*/g, '지혜가 농익는 중년부터');
    t = t.replace(/20대[^\s]*/g, '사회생활을 시작할 무렵');
    return t;
}

function patchEnglish(text) {
    if (!text) return text;
    let t = text;
    t = t.replace(/in your 30s/gi, 'as you mature into your career');
    t = t.replace(/in your 40s/gi, 'entering your golden prime');
    t = t.replace(/in your 50s/gi, 'in your later years of wisdom');
    t = t.replace(/in your 20s/gi, 'in your early career stages');
    t = t.replace(/late 30s/gi, 'established career phase');
    t = t.replace(/mid[ -]?40s/gi, 'peak middle-age');
    t = t.replace(/early 50s/gi, 'late career phase');
    return t;
}

const koData = JSON.parse(fs.readFileSync(pathKo, 'utf8'));
const enData = JSON.parse(fs.readFileSync(pathEn, 'utf8'));

let patchedKo = 0;
let patchedEn = 0;

for (const key in koData) {
    const item = koData[key];
    const orig1 = item.section2; const orig2 = item.section3;
    item.section2 = patchKorean(item.section2);
    item.section3 = patchKorean(item.section3);
    if (orig1 !== item.section2 || orig2 !== item.section3) patchedKo++;
}

for (const key in enData) {
    const item = enData[key];
    const orig1 = item.section2; const orig2 = item.section3;
    item.section2 = patchEnglish(item.section2);
    item.section3 = patchEnglish(item.section3);
    if (orig1 !== item.section2 || orig2 !== item.section3) patchedEn++;
}

fs.writeFileSync(pathKo, JSON.stringify(koData, null, 2));
fs.writeFileSync(pathEn, JSON.stringify(enData, null, 2));

console.log(`Patched KO items: ${patchedKo}, EN items: ${patchedEn}`);
