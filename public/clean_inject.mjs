import fs from 'fs';

const path = 'e:/AI Project/DAILY_SAJU/src/data/uiLocales.ts';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// 1. Clean out any previous paywall injections
lines = lines.filter(line => 
  !line.includes('paywallTitle:') && 
  !line.includes('paywallDesc:') && 
  !line.includes('paywallBtn:')
);

const translations = {
  en: {
    paywallTitle: 'Your 3-Day Free Trial Has Ended',
    paywallDesc: 'Unlock lifetime access to Daily Saju and continue discovering your daily flow.',
    paywallBtn: 'Unlock Lifetime Access ($2.99)'
  },
  ko: {
    paywallTitle: '3일 무료 체험이 종료되었습니다',
    paywallDesc: '단 한 번의 결제로 Daily Saju를 평생 소장하고, 매일 당신의 기운을 확인하세요.',
    paywallBtn: '평생 이용권 구매하기 ($2.99)'
  },
  ja: {
    paywallTitle: '3日間の無料体験が終了しました',
    paywallDesc: '一度の購入でDaily Sajuを永久に利用し、毎日の運勢を確認しましょう。',
    paywallBtn: '永久アクセスを解除する ($2.99)'
  },
  zh: {
    paywallTitle: '您的3天免费体验已结束',
    paywallDesc: '一次性购买即可永久访问Daily Saju，每天发现您的专属运势。',
    paywallBtn: '解锁终身访问权 ($2.99)'
  },
  es: {
    paywallTitle: 'Tu prueba gratuita de 3 días ha terminado',
    paywallDesc: 'Desbloquea el acceso de por vida a Daily Saju y continúa descubriendo tu flujo diario.',
    paywallBtn: 'Acceso de por vida ($2.99)'
  },
  hi: {
    paywallTitle: 'आपका 3 दिन का मुफ़्त ट्रायल ख़त्म हो गया है',
    paywallDesc: 'Daily Saju तक लाइफटाइम पहुँच अनलॉक करें और हर दिन अपनी ऊर्जा खोजें।',
    paywallBtn: 'आजीवन पहुँच अनलॉक करें ($2.99)'
  },
  fr: {
    paywallTitle: 'Votre essai gratuit de 3 jours est terminé',
    paywallDesc: "Débloquez un accès à vie à Daily Saju et continuez à découvrir votre flux quotidien.",
    paywallBtn: "Débloquer l\\'accès à vie ($2.99)"
  },
  de: {
    paywallTitle: 'Ihre 3-tägige kostenlose Testversion ist abgelaufen',
    paywallDesc: 'Schalten Sie lebenslangen Zugang zu Daily Saju frei und entdecken Sie weiterhin Ihren täglichen Fluss.',
    paywallBtn: 'Lebenslangen Zugang ($2.99)'
  },
  it: {
    paywallTitle: 'La tua prova gratuita di 3 giorni è terminata',
    paywallDesc: "Sblocca l\\'accesso a vita a Daily Saju e continua a scoprire il tuo flusso quotidiano.",
    paywallBtn: "Sblocca l\\'accesso a vita ($2.99)"
  },
  pt: {
    paywallTitle: 'O seu teste gratuito de 3 dias terminou',
    paywallDesc: 'Desbloqueie o acesso vitalício ao Daily Saju e continue descobrindo seu fluxo diário.',
    paywallBtn: 'Acesso vitalício ($2.99)'
  },
  ru: {
    paywallTitle: 'Ваша 3-дневная пробная версия закончилась',
    paywallDesc: 'Разблокируйте пожизненный доступ к Daily Saju и продолжайте открывать свой поток.',
    paywallBtn: 'Пожизненный доступ ($2.99)'
  },
  ar: {
    paywallTitle: 'لقد انتهت الفترة التجريبية المجانية',
    paywallDesc: 'افتح وصولاً مدى الحياة إلى Daily Saju واستمر في اكتشاف تدفقك اليومي.',
    paywallBtn: 'وصول مدى الحياة ($2.99)'
  },
  tr: {
    paywallTitle: '3 Günlük Ücretsiz Deneme Süreniz Sona Erdi',
    paywallDesc: "Daily Saju\\'ya ömür boyu erişim kilidini açın ve günlük akışınızı keşfetmeye devam edin.",
    paywallBtn: 'Ömür Boyu Erişim ($2.99)'
  },
  th: {
    paywallTitle: 'สิ้นสุดการทดลองใช้ฟรี 3 วันแล้ว',
    paywallDesc: 'ปลดล็อกสิทธิ์การเข้าถึง Daily Saju ตลอดชีพและค้นพบพลังประจำวันของคุณต่อไป',
    paywallBtn: 'ปลดล็อกสิทธิ์ตลอดชีพ ($2.99)'
  },
  vi: {
    paywallTitle: 'Bản dùng thử miễn phí 3 ngày đã kết thúc',
    paywallDesc: 'Mở khóa quyền truy cập trọn đời vào Daily Saju và tiếp tục khám phá năng lượng của bạn.',
    paywallBtn: 'Quyền truy cập trọn đời ($2.99)'
  },
  id: {
    paywallTitle: 'Uji Coba Gratis 3 Hari Anda Telah Berakhir',
    paywallDesc: 'Buka akses seumur hidup ke Daily Saju dan terus temukan aliran harian Anda.',
    paywallBtn: 'Buka Akses Seumur Hidup ($2.99)'
  }
};

const processed = [];
let currentLang = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('tileHour: string;')) {
    processed.push(line);
    processed.push('  paywallTitle: string;');
    processed.push('  paywallDesc: string;');
    processed.push('  paywallBtn: string;');
    continue;
  }
  
  const langMatch = line.match(/^  ([a-z]{2,3}): {$/);
  if (langMatch) {
    currentLang = langMatch[1];
  }
  
  processed.push(line);
  
  if (currentLang && line.includes('tileHour:')) {
    const t = translations[currentLang];
    if (t) {
      processed.push(`    paywallTitle: '${t.paywallTitle}',`);
      processed.push(`    paywallDesc: '${t.paywallDesc}',`);
      processed.push(`    paywallBtn: '${t.paywallBtn}',`);
    }
    currentLang = null;
  }
}

fs.writeFileSync(path, processed.join('\\n'));
console.log('Cleaned and injected perfectly!');
