export const supportedLanguages = ['ar', 'en', 'tr'];

export const messages = {
  en: {
    appName: 'Social Challenge Arena', language: 'Language', reduceMotion: 'Reduce effects',
    discoveryEyebrow: 'Pick your skill', catalogTitle: 'Choose a challenge', catalogHint: 'Two fast games. One score to beat.',
    orbitName: 'Orbit Lock', orbitTagline: 'Precision timing', orbitHowTo: 'Tap or press Space when the pulse enters the bright gate.',
    echoName: 'Echo Grid', echoTagline: 'Visual memory', echoHowTo: 'Watch the numbered tiles, then tap the same pattern in order.',
    play: 'Play', invited: 'Friend challenge', beatScore: 'Beat {score}', sameRun: 'Same route. Beat the score.',
    acceptChallenge: 'Play {name}', browseChallenges: 'Browse challenges', challengerTarget: 'Target {score}',
    start: 'Start', back: 'Back', score: 'Score', round: 'Round', lives: 'Chances', combo: 'Streak', ready: 'Ready',
    hit: 'Locked +{points}', miss: 'Missed', precision: '{value}% precision',
    watchSequence: 'Watch {count} tiles', yourTurn: 'Your turn', echoCorrect: 'Correct', echoWrong: 'Wrong tile', roundCleared: 'Pattern cleared +{points}',
    complete: 'Run complete', failed: 'Run ended', replay: 'Replay', share: 'Challenge a friend', shareAgain: 'Send rematch',
    copied: 'Invitation copied', shareUnavailable: 'Copy this invitation', resultTitle: 'Your result', compareTitle: 'Head-to-head',
    challenger: 'Challenger', you: 'You', differenceValue: 'Difference {difference}',
    win: 'You won by {difference}', lose: 'You are {difference} behind', tie: 'Exact tie', target: 'Friend: {score}',
    comparisonAnnouncement: '{outcome}. Challenger {target}. You {score}. Difference {difference}.',
    challengeShareText: '{name}: I scored {score}. Can you beat it?', rematchShareText: '{name} rematch: beat my {score}.',
    invalidLink: 'This challenge link is invalid. A fresh run is ready.', loadError: 'The challenge could not start. Try again.',
    loading: 'Loading challenges', newRun: 'New route', catalog: 'All challenges', privacy: 'No account. No tracking.',
    orbitControlsHint: 'Tap the arena', echoControlsHint: 'Tap the tiles in order', orbitArenaLabel: 'Orbit Lock game arena',
    echoArenaLabel: 'Echo Grid game board', gameStatusLabel: 'Game status', finalScore: 'Final score {score}',
    challengeCard: 'Play {name}', skillTiming: 'Timing', skillMemory: 'Memory', seconds: '~{value}s', tileLabel: 'Tile {value}'
  },
  ar: {
    appName: 'ساحة التحديات الاجتماعية', language: 'اللغة', reduceMotion: 'تقليل المؤثرات',
    discoveryEyebrow: 'اختر مهارتك', catalogTitle: 'اختر تحديًا', catalogHint: 'لعبتان سريعتان ونتيجة واحدة للتجاوز.',
    orbitName: 'قفل المدار', orbitTagline: 'دقة التوقيت', orbitHowTo: 'المس أو اضغط مسافة عندما تدخل النبضة داخل البوابة المضيئة.',
    echoName: 'شبكة الصدى', echoTagline: 'ذاكرة بصرية', echoHowTo: 'راقب المربعات المرقمة ثم المس النمط نفسه بالترتيب.',
    play: 'العب', invited: 'تحدي صديق', beatScore: 'تجاوز {score}', sameRun: 'المسار نفسه. تجاوز النتيجة.',
    acceptChallenge: 'ابدأ {name}', browseChallenges: 'تصفح التحديات', challengerTarget: 'الهدف {score}',
    start: 'ابدأ', back: 'رجوع', score: 'النتيجة', round: 'الجولة', lives: 'الفرص', combo: 'التتابع', ready: 'جاهز',
    hit: 'تم القفل +{points}', miss: 'لم تصب', precision: 'دقة {value}٪',
    watchSequence: 'راقب {count} مربعات', yourTurn: 'دورك', echoCorrect: 'صحيح', echoWrong: 'مربع خاطئ', roundCleared: 'اكتمل النمط +{points}',
    complete: 'اكتملت المحاولة', failed: 'انتهت المحاولة', replay: 'إعادة', share: 'تحدَّ صديقًا', shareAgain: 'أرسل إعادة التحدي',
    copied: 'تم نسخ الدعوة', shareUnavailable: 'انسخ دعوة التحدي', resultTitle: 'نتيجتك', compareTitle: 'مواجهة مباشرة',
    challenger: 'المتحدّي', you: 'أنت', differenceValue: 'الفارق {difference}',
    win: 'فزت بفارق {difference}', lose: 'تحتاج {difference} للتجاوز', tie: 'تعادل تام', target: 'نتيجة الصديق: {score}',
    comparisonAnnouncement: '{outcome}. نتيجة المتحدّي {target}. نتيجتك {score}. الفارق {difference}.',
    challengeShareText: '{name}: حققت {score}. هل تستطيع تجاوز نتيجتي؟', rematchShareText: 'إعادة في {name}: تجاوز نتيجتي {score}.',
    invalidLink: 'رابط التحدي غير صالح. تم تجهيز محاولة جديدة.', loadError: 'تعذر تشغيل التحدي. حاول مرة أخرى.',
    loading: 'جارٍ تحميل التحديات', newRun: 'مسار جديد', catalog: 'كل التحديات', privacy: 'بلا حساب وبلا تتبع.',
    orbitControlsHint: 'المس ساحة اللعب', echoControlsHint: 'المس المربعات بالترتيب', orbitArenaLabel: 'ساحة لعبة قفل المدار',
    echoArenaLabel: 'لوحة لعبة شبكة الصدى', gameStatusLabel: 'حالة اللعبة', finalScore: 'النتيجة النهائية {score}',
    challengeCard: 'العب {name}', skillTiming: 'توقيت', skillMemory: 'ذاكرة', seconds: 'نحو {value}ث', tileLabel: 'المربع {value}'
  },
  tr: {
    appName: 'Sosyal Mücadele Arenası', language: 'Dil', reduceMotion: 'Efektleri azalt',
    discoveryEyebrow: 'Becerini seç', catalogTitle: 'Bir mücadele seç', catalogHint: 'İki hızlı oyun. Geçilecek tek puan.',
    orbitName: 'Yörünge Kilidi', orbitTagline: 'Hassas zamanlama', orbitHowTo: 'Nabız parlak kapıya girdiğinde dokun veya Boşluk tuşuna bas.',
    echoName: 'Yankı Izgarası', echoTagline: 'Görsel hafıza', echoHowTo: 'Numaralı kareleri izle, sonra aynı desene sırayla dokun.',
    play: 'Oyna', invited: 'Arkadaş mücadelesi', beatScore: '{score} puanı geç', sameRun: 'Aynı rota. Puanı geç.',
    acceptChallenge: '{name} oyna', browseChallenges: 'Mücadelelere göz at', challengerTarget: 'Hedef {score}',
    start: 'Başla', back: 'Geri', score: 'Puan', round: 'Tur', lives: 'Hak', combo: 'Seri', ready: 'Hazır',
    hit: 'Kilitlendi +{points}', miss: 'Kaçtı', precision: '%{value} hassasiyet',
    watchSequence: '{count} kareyi izle', yourTurn: 'Sıra sende', echoCorrect: 'Doğru', echoWrong: 'Yanlış kare', roundCleared: 'Desen tamam +{points}',
    complete: 'Deneme tamamlandı', failed: 'Deneme bitti', replay: 'Tekrar', share: 'Arkadaşına meydan oku', shareAgain: 'Rövanş gönder',
    copied: 'Davet kopyalandı', shareUnavailable: 'Bu daveti kopyala', resultTitle: 'Sonucun', compareTitle: 'Karşı karşıya',
    challenger: 'Rakip', you: 'Sen', differenceValue: 'Fark {difference}',
    win: '{difference} puanla kazandın', lose: 'Geçmek için {difference} puan gerekli', tie: 'Tam beraberlik', target: 'Arkadaş: {score}',
    comparisonAnnouncement: '{outcome}. Rakip {target}. Sen {score}. Fark {difference}.',
    challengeShareText: '{name}: {score} puan yaptım. Geçebilir misin?', rematchShareText: '{name} rövanşı: {score} puanımı geç.',
    invalidLink: 'Bu mücadele bağlantısı geçersiz. Yeni bir deneme hazır.', loadError: 'Mücadele başlatılamadı. Tekrar dene.',
    loading: 'Mücadeleler yükleniyor', newRun: 'Yeni rota', catalog: 'Tüm mücadeleler', privacy: 'Hesap yok. Takip yok.',
    orbitControlsHint: 'Arenaya dokun', echoControlsHint: 'Karelere sırayla dokun', orbitArenaLabel: 'Yörünge Kilidi oyun alanı',
    echoArenaLabel: 'Yankı Izgarası oyun tahtası', gameStatusLabel: 'Oyun durumu', finalScore: 'Son puan {score}',
    challengeCard: '{name} oyna', skillTiming: 'Zamanlama', skillMemory: 'Hafıza', seconds: '~{value} sn', tileLabel: 'Kare {value}'
  }
};

export function normalizeLanguage(value) {
  const candidate = String(value || '').toLowerCase().split('-')[0];
  return supportedLanguages.includes(candidate) ? candidate : 'en';
}

export function isRtl(language) { return language === 'ar'; }

export function translate(language, key, values = {}) {
  const safeLanguage = normalizeLanguage(language);
  const template = messages[safeLanguage][key] ?? messages.en[key] ?? key;
  return Object.entries(values).reduce((output, [name, value]) => output.replaceAll(`{${name}}`, String(value)), template);
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
