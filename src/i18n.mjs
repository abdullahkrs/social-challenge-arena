export const supportedLanguages = ['ar', 'en', 'tr'];

export const messages = {
  en: {
    appName: 'Social Challenge Arena', language: 'Language', reduceMotion: 'Reduce effects',
    discoveryEyebrow: 'Pick your skill', catalogTitle: 'Choose a challenge', catalogHint: 'Three fast games. One score to beat.',
    dailyTitle: "Today's challenge", dailyPlay: 'Play daily', dailyPlayLabel: "Play today's {name}",
    dailyBest: 'Best today {score}', dailyNoBest: 'No score yet', dailyNewBest: 'New daily best {score}', dailySessionOnly: 'Best stays for this visit',
    dailySameRoute: 'Fixed daily route',
    orbitName: 'Orbit Lock', orbitTagline: 'Precision timing', orbitHowTo: 'Tap or press Space when the pulse enters the bright gate.',
    echoName: 'Echo Grid', echoTagline: 'Visual memory', echoHowTo: 'Watch the numbered tiles, then tap the same pattern in order.',
    lumenName: 'Lumen Lanes', lumenTagline: 'Rapid direction choice', lumenHowTo: 'Tap the lane named by the bright signal before it fades.',
    play: 'Play', invited: 'Friend challenge', beatScore: 'Beat {score}', sameRun: 'Same route. Beat the score.',
    acceptChallenge: 'Play {name}', browseChallenges: 'Browse challenges', challengerTarget: 'Target {score}',
    start: 'Start', back: 'Back', score: 'Score', round: 'Round', lives: 'Chances', combo: 'Streak', ready: 'Ready',
    hit: 'Locked +{points}', miss: 'Missed', precision: '{value}% precision',
    watchSequence: 'Watch {count} tiles', yourTurn: 'Your turn', echoCorrect: 'Correct', echoWrong: 'Wrong tile', roundCleared: 'Pattern cleared +{points}',
    laneLeft: 'Left lane', laneCenter: 'Center lane', laneRight: 'Right lane',
    lanePromptLeft: 'Left now', lanePromptCenter: 'Center now', lanePromptRight: 'Right now',
    laneCorrect: 'Correct +{points}', laneWrong: 'Wrong lane', laneTooSlow: 'Signal faded',
    complete: 'Run complete', failed: 'Run ended', replay: 'Replay', share: 'Challenge a friend', shareAgain: 'Send rematch',
    copied: 'Invitation copied', shareUnavailable: 'Copy this invitation', resultTitle: 'Your result', compareTitle: 'Head-to-head',
    challenger: 'Challenger', you: 'You', differenceValue: 'Difference {difference}',
    win: 'You won by {difference}', lose: 'You are {difference} behind', tie: 'Exact tie', target: 'Friend: {score}',
    comparisonAnnouncement: '{outcome}. Challenger {target}. You {score}. Difference {difference}.',
    challengeShareText: '{name}: I scored {score}. Can you beat it?', rematchShareText: '{name} rematch: beat my {score}.',
    invalidLink: 'This challenge link is invalid. A fresh run is ready.', loadError: 'The challenge could not start. Try again.',
    loading: 'Loading challenges', newRun: 'New route', catalog: 'All challenges', privacy: 'No account. No tracking.',
    orbitControlsHint: 'Tap the arena', echoControlsHint: 'Tap the tiles in order', lumenControlsHint: 'Choose left, center, or right',
    orbitArenaLabel: 'Orbit Lock game arena', echoArenaLabel: 'Echo Grid game board', lumenArenaLabel: 'Lumen Lanes game arena',
    gameStatusLabel: 'Game status', finalScore: 'Final score {score}',
    challengeCard: 'Play {name}', skillTiming: 'Timing', skillMemory: 'Memory', skillReaction: 'Reaction', seconds: '~{value}s', tileLabel: 'Tile {value}'
  },
  ar: {
    appName: 'ساحة التحديات الاجتماعية', language: 'اللغة', reduceMotion: 'تقليل المؤثرات',
    discoveryEyebrow: 'اختر مهارتك', catalogTitle: 'اختر تحديًا', catalogHint: 'ثلاث ألعاب سريعة ونتيجة واحدة للتجاوز.',
    dailyTitle: 'تحدي اليوم', dailyPlay: 'العب تحدي اليوم', dailyPlayLabel: 'العب {name} اليوم',
    dailyBest: 'أفضل نتيجة اليوم {score}', dailyNoBest: 'لا توجد نتيجة بعد', dailyNewBest: 'أفضل نتيجة يومية جديدة {score}', dailySessionOnly: 'أفضل نتيجة لهذه الزيارة فقط',
    dailySameRoute: 'مسار اليوم الثابت',
    orbitName: 'قفل المدار', orbitTagline: 'دقة التوقيت', orbitHowTo: 'المس أو اضغط مسافة عندما تدخل النبضة داخل البوابة المضيئة.',
    echoName: 'شبكة الصدى', echoTagline: 'ذاكرة بصرية', echoHowTo: 'راقب المربعات المرقمة ثم المس النمط نفسه بالترتيب.',
    lumenName: 'مسارات الوميض', lumenTagline: 'اختيار اتجاه سريع', lumenHowTo: 'المس المسار الذي يشير إليه الوميض قبل أن يختفي.',
    play: 'العب', invited: 'تحدي صديق', beatScore: 'تجاوز {score}', sameRun: 'المسار نفسه. تجاوز النتيجة.',
    acceptChallenge: 'ابدأ {name}', browseChallenges: 'تصفح التحديات', challengerTarget: 'الهدف {score}',
    start: 'ابدأ', back: 'رجوع', score: 'النتيجة', round: 'الجولة', lives: 'الفرص', combo: 'التتابع', ready: 'جاهز',
    hit: 'تم القفل +{points}', miss: 'لم تصب', precision: 'دقة {value}٪',
    watchSequence: 'راقب {count} مربعات', yourTurn: 'دورك', echoCorrect: 'صحيح', echoWrong: 'مربع خاطئ', roundCleared: 'اكتمل النمط +{points}',
    laneLeft: 'المسار الأيسر', laneCenter: 'المسار الأوسط', laneRight: 'المسار الأيمن',
    lanePromptLeft: 'اليسار الآن', lanePromptCenter: 'الوسط الآن', lanePromptRight: 'اليمين الآن',
    laneCorrect: 'اختيار صحيح +{points}', laneWrong: 'مسار غير صحيح', laneTooSlow: 'اختفى الوميض',
    complete: 'اكتملت المحاولة', failed: 'انتهت المحاولة', replay: 'إعادة', share: 'تحدَّ صديقًا', shareAgain: 'أرسل إعادة التحدي',
    copied: 'تم نسخ الدعوة', shareUnavailable: 'انسخ دعوة التحدي', resultTitle: 'نتيجتك', compareTitle: 'مواجهة مباشرة',
    challenger: 'المتحدّي', you: 'أنت', differenceValue: 'الفارق {difference}',
    win: 'فزت بفارق {difference}', lose: 'تحتاج {difference} للتجاوز', tie: 'تعادل تام', target: 'نتيجة الصديق: {score}',
    comparisonAnnouncement: '{outcome}. نتيجة المتحدّي {target}. نتيجتك {score}. الفارق {difference}.',
    challengeShareText: '{name}: حققت {score}. هل تستطيع تجاوز نتيجتي؟', rematchShareText: 'إعادة في {name}: تجاوز نتيجتي {score}.',
    invalidLink: 'رابط التحدي غير صالح. تم تجهيز محاولة جديدة.', loadError: 'تعذر تشغيل التحدي. حاول مرة أخرى.',
    loading: 'جارٍ تحميل التحديات', newRun: 'مسار جديد', catalog: 'كل التحديات', privacy: 'بلا حساب وبلا تتبع.',
    orbitControlsHint: 'المس ساحة اللعب', echoControlsHint: 'المس المربعات بالترتيب', lumenControlsHint: 'اختر اليسار أو الوسط أو اليمين',
    orbitArenaLabel: 'ساحة لعبة قفل المدار', echoArenaLabel: 'لوحة لعبة شبكة الصدى', lumenArenaLabel: 'ساحة لعبة مسارات الوميض',
    gameStatusLabel: 'حالة اللعبة', finalScore: 'النتيجة النهائية {score}',
    challengeCard: 'العب {name}', skillTiming: 'توقيت', skillMemory: 'ذاكرة', skillReaction: 'استجابة', seconds: 'نحو {value}ث', tileLabel: 'المربع {value}'
  },
  tr: {
    appName: 'Sosyal Mücadele Arenası', language: 'Dil', reduceMotion: 'Efektleri azalt',
    discoveryEyebrow: 'Becerini seç', catalogTitle: 'Bir mücadele seç', catalogHint: 'Üç hızlı oyun. Geçilecek tek puan.',
    dailyTitle: 'Günün mücadelesi', dailyPlay: 'Günlük oyna', dailyPlayLabel: 'Bugünün {name} mücadelesini oyna',
    dailyBest: 'Bugünün en iyisi {score}', dailyNoBest: 'Henüz puan yok', dailyNewBest: 'Yeni günlük rekor {score}', dailySessionOnly: 'En iyi puan bu ziyaret için saklanır',
    dailySameRoute: 'Sabit günlük rota',
    orbitName: 'Yörünge Kilidi', orbitTagline: 'Hassas zamanlama', orbitHowTo: 'Nabız parlak kapıya girdiğinde dokun veya Boşluk tuşuna bas.',
    echoName: 'Yankı Izgarası', echoTagline: 'Görsel hafıza', echoHowTo: 'Numaralı kareleri izle, sonra aynı desene sırayla dokun.',
    lumenName: 'Işık Şeritleri', lumenTagline: 'Hızlı yön seçimi', lumenHowTo: 'Parlak işaret sönmeden gösterdiği şeride dokun.',
    play: 'Oyna', invited: 'Arkadaş mücadelesi', beatScore: '{score} puanı geç', sameRun: 'Aynı rota. Puanı geç.',
    acceptChallenge: '{name} oyna', browseChallenges: 'Mücadelelere göz at', challengerTarget: 'Hedef {score}',
    start: 'Başla', back: 'Geri', score: 'Puan', round: 'Tur', lives: 'Hak', combo: 'Seri', ready: 'Hazır',
    hit: 'Kilitlendi +{points}', miss: 'Kaçtı', precision: '%{value} hassasiyet',
    watchSequence: '{count} kareyi izle', yourTurn: 'Sıra sende', echoCorrect: 'Doğru', echoWrong: 'Yanlış kare', roundCleared: 'Desen tamam +{points}',
    laneLeft: 'Sol şerit', laneCenter: 'Orta şerit', laneRight: 'Sağ şerit',
    lanePromptLeft: 'Şimdi sol', lanePromptCenter: 'Şimdi orta', lanePromptRight: 'Şimdi sağ',
    laneCorrect: 'Doğru şerit +{points}', laneWrong: 'Yanlış şerit', laneTooSlow: 'İşaret söndü',
    complete: 'Deneme tamamlandı', failed: 'Deneme bitti', replay: 'Tekrar', share: 'Arkadaşına meydan oku', shareAgain: 'Rövanş gönder',
    copied: 'Davet kopyalandı', shareUnavailable: 'Bu daveti kopyala', resultTitle: 'Sonucun', compareTitle: 'Karşı karşıya',
    challenger: 'Rakip', you: 'Sen', differenceValue: 'Fark {difference}',
    win: '{difference} puanla kazandın', lose: 'Geçmek için {difference} puan gerekli', tie: 'Tam beraberlik', target: 'Arkadaş: {score}',
    comparisonAnnouncement: '{outcome}. Rakip {target}. Sen {score}. Fark {difference}.',
    challengeShareText: '{name}: {score} puan yaptım. Geçebilir misin?', rematchShareText: '{name} rövanşı: {score} puanımı geç.',
    invalidLink: 'Bu mücadele bağlantısı geçersiz. Yeni bir deneme hazır.', loadError: 'Mücadele başlatılamadı. Tekrar dene.',
    loading: 'Mücadeleler yükleniyor', newRun: 'Yeni rota', catalog: 'Tüm mücadeleler', privacy: 'Hesap yok. Takip yok.',
    orbitControlsHint: 'Arenaya dokun', echoControlsHint: 'Karelere sırayla dokun', lumenControlsHint: 'Sol, orta veya sağı seç',
    orbitArenaLabel: 'Yörünge Kilidi oyun alanı', echoArenaLabel: 'Yankı Izgarası oyun tahtası', lumenArenaLabel: 'Işık Şeritleri oyun alanı',
    gameStatusLabel: 'Oyun durumu', finalScore: 'Son puan {score}',
    challengeCard: '{name} oyna', skillTiming: 'Zamanlama', skillMemory: 'Hafıza', skillReaction: 'Tepki', seconds: '~{value} sn', tileLabel: 'Kare {value}'
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
