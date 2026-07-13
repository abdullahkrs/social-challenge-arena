export const supportedLanguages = ['ar', 'en', 'tr'];

export const messages = {
  en: {
    appName: 'Social Challenge Arena',
    language: 'Language',
    reduceMotion: 'Reduce effects',
    discoveryEyebrow: 'Quick skill challenge',
    challengeName: 'Orbit Lock',
    challengeTagline: 'Tap when the pulse enters the gate.',
    play: 'Play',
    invited: 'Friend challenge',
    beatScore: 'Beat {score}',
    sameRun: 'Same route. One attempt.',
    howTo: 'Tap anywhere or press Space when the pulse is inside the bright gate.',
    start: 'Start',
    back: 'Back',
    score: 'Score',
    round: 'Gate',
    lives: 'Chances',
    combo: 'Combo',
    ready: 'Ready',
    hit: 'Locked +{points}',
    miss: 'Missed',
    complete: 'Run complete',
    failed: 'Run ended',
    replay: 'Replay',
    share: 'Challenge a friend',
    shareAgain: 'Share your score',
    copied: 'Link copied',
    shareUnavailable: 'Copy this link',
    resultTitle: 'Your result',
    compareTitle: 'Friend comparison',
    win: 'You won by {difference}',
    lose: 'You are {difference} behind',
    tie: 'Exact tie',
    target: 'Friend: {score}',
    invalidLink: 'This challenge link is invalid. A fresh run is ready.',
    loadError: 'The challenge could not start. Try again.',
    loading: 'Loading challenge',
    precision: '{value}% precision',
    newRun: 'New route',
    privacy: 'No account. No tracking.',
    controlsHint: 'Tap the arena',
    arenaLabel: 'Orbit Lock game arena',
    gameStatusLabel: 'Game status',
    finalScore: 'Final score {score}'
  },
  ar: {
    appName: 'ساحة التحديات الاجتماعية',
    language: 'اللغة',
    reduceMotion: 'تقليل المؤثرات',
    discoveryEyebrow: 'تحدٍ سريع للمهارة',
    challengeName: 'قفل المدار',
    challengeTagline: 'المس عندما تدخل النبضة داخل البوابة.',
    play: 'العب',
    invited: 'تحدي صديق',
    beatScore: 'تجاوز {score}',
    sameRun: 'المسار نفسه. محاولة واحدة.',
    howTo: 'المس أي مكان أو اضغط مسافة عندما تكون النبضة داخل البوابة المضيئة.',
    start: 'ابدأ',
    back: 'رجوع',
    score: 'النتيجة',
    round: 'البوابة',
    lives: 'الفرص',
    combo: 'التتابع',
    ready: 'جاهز',
    hit: 'تم القفل +{points}',
    miss: 'لم تصب',
    complete: 'اكتمل المسار',
    failed: 'انتهت المحاولة',
    replay: 'إعادة',
    share: 'تحدَّ صديقًا',
    shareAgain: 'شارك نتيجتك',
    copied: 'تم نسخ الرابط',
    shareUnavailable: 'انسخ هذا الرابط',
    resultTitle: 'نتيجتك',
    compareTitle: 'مقارنة الصديق',
    win: 'فزت بفارق {difference}',
    lose: 'تحتاج {difference} للتجاوز',
    tie: 'تعادل تام',
    target: 'نتيجة الصديق: {score}',
    invalidLink: 'رابط التحدي غير صالح. تم تجهيز مسار جديد.',
    loadError: 'تعذر تشغيل التحدي. حاول مرة أخرى.',
    loading: 'جارٍ تحميل التحدي',
    precision: 'دقة {value}٪',
    newRun: 'مسار جديد',
    privacy: 'بلا حساب وبلا تتبع.',
    controlsHint: 'المس ساحة اللعب',
    arenaLabel: 'ساحة لعبة قفل المدار',
    gameStatusLabel: 'حالة اللعبة',
    finalScore: 'النتيجة النهائية {score}'
  },
  tr: {
    appName: 'Sosyal Mücadele Arenası',
    language: 'Dil',
    reduceMotion: 'Efektleri azalt',
    discoveryEyebrow: 'Hızlı beceri mücadelesi',
    challengeName: 'Yörünge Kilidi',
    challengeTagline: 'Nabız kapıya girdiğinde dokun.',
    play: 'Oyna',
    invited: 'Arkadaş mücadelesi',
    beatScore: '{score} puanı geç',
    sameRun: 'Aynı rota. Tek deneme.',
    howTo: 'Nabız parlak kapının içindeyken herhangi bir yere dokun veya Boşluk tuşuna bas.',
    start: 'Başla',
    back: 'Geri',
    score: 'Puan',
    round: 'Kapı',
    lives: 'Hak',
    combo: 'Seri',
    ready: 'Hazır',
    hit: 'Kilitlendi +{points}',
    miss: 'Kaçtı',
    complete: 'Rota tamamlandı',
    failed: 'Deneme bitti',
    replay: 'Tekrar',
    share: 'Arkadaşına meydan oku',
    shareAgain: 'Puanını paylaş',
    copied: 'Bağlantı kopyalandı',
    shareUnavailable: 'Bu bağlantıyı kopyala',
    resultTitle: 'Sonucun',
    compareTitle: 'Arkadaş karşılaştırması',
    win: '{difference} puanla kazandın',
    lose: 'Geçmek için {difference} puan gerekli',
    tie: 'Tam beraberlik',
    target: 'Arkadaş: {score}',
    invalidLink: 'Bu mücadele bağlantısı geçersiz. Yeni bir rota hazır.',
    loadError: 'Mücadele başlatılamadı. Tekrar dene.',
    loading: 'Mücadele yükleniyor',
    precision: '%{value} hassasiyet',
    newRun: 'Yeni rota',
    privacy: 'Hesap yok. Takip yok.',
    controlsHint: 'Arenaya dokun',
    arenaLabel: 'Yörünge Kilidi oyun alanı',
    gameStatusLabel: 'Oyun durumu',
    finalScore: 'Son puan {score}'
  }
};

export function normalizeLanguage(value) {
  const candidate = String(value || '').toLowerCase().split('-')[0];
  return supportedLanguages.includes(candidate) ? candidate : 'en';
}

export function isRtl(language) {
  return language === 'ar';
}

export function translate(language, key, values = {}) {
  const safeLanguage = normalizeLanguage(language);
  const template = messages[safeLanguage][key] ?? messages.en[key] ?? key;
  return Object.entries(values).reduce(
    (output, [name, value]) => output.replaceAll(`{${name}}`, String(value)),
    template
  );
}

export function missingTranslations() {
  const baseKeys = Object.keys(messages.en).sort();
  return supportedLanguages.flatMap((language) => {
    const keys = Object.keys(messages[language]).sort();
    const missing = baseKeys.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !baseKeys.includes(key));
    return [...missing.map((key) => `${language}:missing:${key}`), ...extra.map((key) => `${language}:extra:${key}`)];
  });
}
