export const supportedLanguages = ['ar', 'en', 'tr'];

export const messages = {
  en: {
    appName: 'Social Challenge Arena', language: 'Language', reduceMotion: 'Reduce effects',
    discoveryEyebrow: 'Pick your skill', catalogTitle: 'Choose a challenge', catalogHint: 'Four endless skill journeys. One score to beat.',
    dailyTitle: "Today's challenge", dailyPlay: 'Play daily', dailyPlayLabel: "Play today's {name}",
    dailyBest: 'Best today {score}', dailyNoBest: 'No score yet', dailyNewBest: 'New daily best {score}', dailySessionOnly: 'Best stays for this visit',
    dailySameRoute: 'Fixed daily route',
    orbitName: 'Orbit Lock', orbitTagline: 'Precision timing', orbitHowTo: 'Choose an orbit, then lock the pulse inside the marked gate. Continue until your chances end or you choose to exit.',
    echoName: 'Echo Grid', echoTagline: 'Visual memory', echoHowTo: 'Watch the route, then move the marker to repeat it. Continue until your chances end or you choose to exit.',
    lumenName: 'Lumen Lanes', lumenTagline: 'Endless focus current', lumenHowTo: 'Move to the signaled lane and keep choosing correctly. Continue until your chances end or you choose to exit.',
    mirrorName: 'Mirror Fuse', mirrorTagline: 'Spatial reflection', mirrorHowTo: 'Move across the board and switch cells to match the transformed shape. Continue until your chances end or you choose to exit.',
    play: 'Play', invited: 'Friend challenge', beatScore: 'Beat {score}', sameRun: 'Same route. Beat the score.',
    acceptChallenge: 'Play {name}', browseChallenges: 'Browse challenges', challengerTarget: 'Target {score}',
    start: 'Start', back: 'Back', score: 'Score', round: 'Round', lives: 'Chances', combo: 'Streak', ready: 'Ready',
    hit: 'Locked +{points}', miss: 'Missed', precision: '{value}% precision',
    watchSequence: 'Watch {count} tiles', yourTurn: 'Your turn', echoCorrect: 'Correct', echoWrong: 'Wrong tile', roundCleared: 'Pattern cleared +{points}',
    laneLeft: 'Left lane', laneCenter: 'Center lane', laneRight: 'Right lane',
    lanePromptLeft: 'Left now', lanePromptCenter: 'Center now', lanePromptRight: 'Right now',
    laneCorrect: 'Correct +{points}', laneWrong: 'Wrong lane', laneTooSlow: 'Signal faded',
    lumenMirrorPrompt: 'Choose the opposite lane', lumenChoicePrompt: 'Avoid the blocked lane; the star route earns more',
    lumenMemoryWatchFirst: 'Watch {count} signals and remember the first', lumenMemoryWatchLast: 'Watch {count} signals and remember the last',
    lumenMemoryChooseFirst: 'Choose the first signal', lumenMemoryChooseLast: 'Choose the last signal',
    lumenGateCleared: 'Gate cleared +{points}', lumenRiskCleared: 'Risk route mastered +{points}', lumenBlocked: 'That lane was blocked',
    lumenDistance: 'Gate', lumenGate: 'Gate {value}', lumenEndRun: 'End run', lumenExitNow: 'Confirm end run', lumenExitConfirm: 'Press again within three seconds to end the run',
    lumenEnded: 'Run ended by choice', lumenResultDetail: '{gates} gates · best streak {combo} · {accuracy}% accuracy', endless: 'Endless',
    lumenZonePrism: 'Prism reach', lumenZoneCurrent: 'Current split', lumenZoneSignal: 'Signal field', lumenZoneVault: 'Focus vault',
    lumenRuleDirect: 'Follow the signal', lumenRuleMirror: 'Choose the opposite lane', lumenRuleChoice: 'Avoid × or take ★', lumenRuleMemory: 'Remember the requested signal',
    lumenLaneBlocked: 'Blocked route', lumenLaneRisk: 'Risk route',
    mirrorPrompt: 'Choose the mirrored pattern', mirrorCorrect: 'Mirror matched +{points}', mirrorWrong: 'That pattern does not mirror', mirrorTooSlow: 'Mirror choice timed out',
    mirrorSourcePattern: 'Source pattern. {pattern}', mirrorPatternRow: 'Row {row}: {cells}', mirrorCellOn: 'filled', mirrorCellOff: 'empty', mirrorOptionPattern: 'Mirror option {value}. {pattern}',
    complete: 'Run complete', failed: 'Run ended', replay: 'Replay', share: 'Challenge a friend', shareAgain: 'Send rematch',
    copied: 'Invitation copied', shareUnavailable: 'Copy this invitation', sharePreparing: 'Preparing share card', shareComplete: 'Challenge shared', shareCancelled: 'Sharing cancelled', shareFallback: 'Invitation ready to copy',
    shareCardCallToAction: 'Can you beat it?', shareCardDuel: 'Head-to-head', resultTitle: 'Your result', compareTitle: 'Head-to-head',
    challenger: 'Challenger', you: 'You', differenceValue: 'Difference {difference}',
    win: 'You won by {difference}', lose: 'You are {difference} behind', tie: 'Exact tie', target: 'Friend: {score}',
    comparisonAnnouncement: '{outcome}. Challenger {target}. You {score}. Difference {difference}.',
    challengeShareText: '{name}: I scored {score}. Can you beat it?', rematchShareText: '{name} rematch: beat my {score}.',
    invalidLink: 'This challenge link is invalid. A fresh run is ready.', loadError: 'The challenge could not start. Try again.',
    loading: 'Loading challenges', newRun: 'New route', catalog: 'All challenges', privacy: 'No account. No tracking.',
    orbitControlsHint: 'Tap the arena', echoControlsHint: 'Tap the tiles in order', lumenControlsHint: 'Choose lanes with touch or arrow keys; press End run twice to stop safely', mirrorControlsHint: 'Choose one of three mirror options',
    orbitArenaLabel: 'Orbit Lock game arena', echoArenaLabel: 'Echo Grid game board', lumenArenaLabel: 'Endless Lumen Lanes game arena', mirrorArenaLabel: 'Mirror Fuse reflection puzzle',
    gameStatusLabel: 'Game status', finalScore: 'Final score {score}',
    challengeCard: 'Play {name}', skillTiming: 'Timing', skillMemory: 'Memory', skillReaction: 'Reaction', skillSpatial: 'Spatial', seconds: '~{value}s', tileLabel: 'Tile {value}', mirrorOptionLabel: 'Mirror option {value}'
  },
  ar: {
    appName: 'ساحة التحديات الاجتماعية', language: 'اللغة', reduceMotion: 'تقليل المؤثرات',
    discoveryEyebrow: 'اختر مهارتك', catalogTitle: 'اختر تحديًا', catalogHint: 'أربع رحلات مهارية لا نهائية ونتيجة واحدة للتجاوز.',
    dailyTitle: 'تحدي اليوم', dailyPlay: 'العب تحدي اليوم', dailyPlayLabel: 'العب {name} اليوم',
    dailyBest: 'أفضل نتيجة اليوم {score}', dailyNoBest: 'لا توجد نتيجة بعد', dailyNewBest: 'أفضل نتيجة يومية جديدة {score}', dailySessionOnly: 'أفضل نتيجة لهذه الزيارة فقط',
    dailySameRoute: 'مسار اليوم الثابت',
    orbitName: 'قفل المدار', orbitTagline: 'دقة التوقيت', orbitHowTo: 'اختر مدارًا، ثم ثبّت النبضة داخل البوابة المحددة. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.',
    echoName: 'شبكة الصدى', echoTagline: 'ذاكرة بصرية', echoHowTo: 'راقب المسار، ثم حرّك العلامة لتكراره. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.',
    lumenName: 'مسارات الوميض', lumenTagline: 'تيار تركيز لا نهائي', lumenHowTo: 'انتقل إلى المسار الذي تشير إليه العلامة وواصل الاختيار الصحيح. تستمر المحاولة حتى تنتهي فرصك أو تختار الخروج.',
    mirrorName: 'مرآة النمط', mirrorTagline: 'انعكاس مكاني', mirrorHowTo: 'تحرّك على اللوحة وبدّل الخلايا لتطابق الشكل المحوّل. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.',
    play: 'العب', invited: 'تحدي صديق', beatScore: 'تجاوز {score}', sameRun: 'المسار نفسه. تجاوز النتيجة.',
    acceptChallenge: 'ابدأ {name}', browseChallenges: 'تصفح التحديات', challengerTarget: 'الهدف {score}',
    start: 'ابدأ', back: 'رجوع', score: 'النتيجة', round: 'الجولة', lives: 'الفرص', combo: 'التتابع', ready: 'جاهز',
    hit: 'تم القفل +{points}', miss: 'لم تصب', precision: 'دقة {value}٪',
    watchSequence: 'راقب {count} مربعات', yourTurn: 'دورك', echoCorrect: 'صحيح', echoWrong: 'مربع خاطئ', roundCleared: 'اكتمل النمط +{points}',
    laneLeft: 'المسار الأيسر', laneCenter: 'المسار الأوسط', laneRight: 'المسار الأيمن',
    lanePromptLeft: 'اليسار الآن', lanePromptCenter: 'الوسط الآن', lanePromptRight: 'اليمين الآن',
    laneCorrect: 'اختيار صحيح +{points}', laneWrong: 'مسار غير صحيح', laneTooSlow: 'اختفى الوميض',
    lumenMirrorPrompt: 'اختر المسار المقابل', lumenChoicePrompt: 'تجنب المسار المحظور؛ مسار النجمة يمنح نقاطًا أكثر',
    lumenMemoryWatchFirst: 'راقب {count} إشارات وتذكّر الأولى', lumenMemoryWatchLast: 'راقب {count} إشارات وتذكّر الأخيرة',
    lumenMemoryChooseFirst: 'اختر الإشارة الأولى', lumenMemoryChooseLast: 'اختر الإشارة الأخيرة',
    lumenGateCleared: 'تم اجتياز البوابة +{points}', lumenRiskCleared: 'أتقنت مسار المخاطرة +{points}', lumenBlocked: 'هذا المسار محظور',
    lumenDistance: 'البوابة', lumenGate: 'البوابة {value}', lumenEndRun: 'إنهاء المحاولة', lumenExitNow: 'تأكيد إنهاء المحاولة', lumenExitConfirm: 'اضغط مرة أخرى خلال ثلاث ثوانٍ لإنهاء المحاولة',
    lumenEnded: 'أنهيت المحاولة باختيارك', lumenResultDetail: '{gates} بوابة · أفضل تتابع {combo} · دقة {accuracy}٪', endless: 'لا نهائي',
    lumenZonePrism: 'نطاق المنشور', lumenZoneCurrent: 'انقسام التيار', lumenZoneSignal: 'حقل الإشارات', lumenZoneVault: 'خزنة التركيز',
    lumenRuleDirect: 'اتبع الإشارة', lumenRuleMirror: 'اختر المسار المقابل', lumenRuleChoice: 'تجنب × أو اختر ★', lumenRuleMemory: 'تذكّر الإشارة المطلوبة',
    lumenLaneBlocked: 'مسار محظور', lumenLaneRisk: 'مسار مخاطرة',
    mirrorPrompt: 'اختر النمط المنعكس', mirrorCorrect: 'اكتمل الانعكاس +{points}', mirrorWrong: 'هذا النمط لا يطابق الانعكاس', mirrorTooSlow: 'انتهى وقت اختيار الانعكاس',
    mirrorSourcePattern: 'النمط الأصلي. {pattern}', mirrorPatternRow: 'الصف {row}: {cells}', mirrorCellOn: 'ممتلئ', mirrorCellOff: 'فارغ', mirrorOptionPattern: 'خيار الانعكاس {value}. {pattern}',
    complete: 'اكتملت المحاولة', failed: 'انتهت المحاولة', replay: 'إعادة', share: 'تحدَّ صديقًا', shareAgain: 'أرسل إعادة التحدي',
    copied: 'تم نسخ الدعوة', shareUnavailable: 'انسخ دعوة التحدي', sharePreparing: 'جارٍ تجهيز بطاقة النتيجة', shareComplete: 'تمت مشاركة التحدي', shareCancelled: 'أُلغيت المشاركة', shareFallback: 'الدعوة جاهزة للنسخ',
    shareCardCallToAction: 'هل تستطيع تجاوزها؟', shareCardDuel: 'مواجهة مباشرة', resultTitle: 'نتيجتك', compareTitle: 'مواجهة مباشرة',
    challenger: 'المتحدّي', you: 'أنت', differenceValue: 'الفارق {difference}',
    win: 'فزت بفارق {difference}', lose: 'تحتاج {difference} للتجاوز', tie: 'تعادل تام', target: 'نتيجة الصديق: {score}',
    comparisonAnnouncement: '{outcome}. نتيجة المتحدّي {target}. نتيجتك {score}. الفارق {difference}.',
    challengeShareText: '{name}: حققت {score}. هل تستطيع تجاوز نتيجتي؟', rematchShareText: 'إعادة في {name}: تجاوز نتيجتي {score}.',
    invalidLink: 'رابط التحدي غير صالح. تم تجهيز محاولة جديدة.', loadError: 'تعذر تشغيل التحدي. حاول مرة أخرى.',
    loading: 'جارٍ تحميل التحديات', newRun: 'مسار جديد', catalog: 'كل التحديات', privacy: 'بلا حساب وبلا تتبع.',
    orbitControlsHint: 'المس ساحة اللعب', echoControlsHint: 'المس المربعات بالترتيب', lumenControlsHint: 'اختر المسارات باللمس أو الأسهم، واضغط إنهاء المحاولة مرتين للتوقف بأمان', mirrorControlsHint: 'اختر واحدًا من ثلاثة انعكاسات',
    orbitArenaLabel: 'ساحة لعبة قفل المدار', echoArenaLabel: 'لوحة لعبة شبكة الصدى', lumenArenaLabel: 'ساحة لعبة مسارات الوميض اللانهائية', mirrorArenaLabel: 'لغز انعكاس مرآة النمط',
    gameStatusLabel: 'حالة اللعبة', finalScore: 'النتيجة النهائية {score}',
    challengeCard: 'العب {name}', skillTiming: 'توقيت', skillMemory: 'ذاكرة', skillReaction: 'استجابة', skillSpatial: 'إدراك مكاني', seconds: 'نحو {value}ث', tileLabel: 'المربع {value}', mirrorOptionLabel: 'خيار الانعكاس {value}'
  },
  tr: {
    appName: 'Sosyal Mücadele Arenası', language: 'Dil', reduceMotion: 'Efektleri azalt',
    discoveryEyebrow: 'Becerini seç', catalogTitle: 'Bir mücadele seç', catalogHint: 'Dört sonsuz beceri yolculuğu. Geçilecek tek puan.',
    dailyTitle: 'Günün mücadelesi', dailyPlay: 'Günlük oyna', dailyPlayLabel: 'Bugünün {name} mücadelesini oyna',
    dailyBest: 'Bugünün en iyisi {score}', dailyNoBest: 'Henüz puan yok', dailyNewBest: 'Yeni günlük rekor {score}', dailySessionOnly: 'En iyi puan bu ziyaret için saklanır',
    dailySameRoute: 'Sabit günlük rota',
    orbitName: 'Yörünge Kilidi', orbitTagline: 'Hassas zamanlama', orbitHowTo: 'Bir yörünge seç, sonra nabzı işaretli kapının içinde kilitle. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.',
    echoName: 'Yankı Izgarası', echoTagline: 'Görsel hafıza', echoHowTo: 'Rotayı izle, sonra işaretçiyi hareket ettirerek rotayı tekrarla. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.',
    lumenName: 'Işık Şeritleri', lumenTagline: 'Sonsuz odak akışı', lumenHowTo: 'İşaret edilen şeride geç ve doğru seçimleri sürdür. Hakların bitene veya çıkmayı seçene kadar koşu sürer.',
    mirrorName: 'Ayna Birleştirme', mirrorTagline: 'Uzamsal yansıma', mirrorHowTo: 'Tahtada hareket et ve dönüştürülmüş şekli eşleştirmek için hücreleri değiştir. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.',
    play: 'Oyna', invited: 'Arkadaş mücadelesi', beatScore: '{score} puanı geç', sameRun: 'Aynı rota. Puanı geç.',
    acceptChallenge: '{name} oyna', browseChallenges: 'Mücadelelere göz at', challengerTarget: 'Hedef {score}',
    start: 'Başla', back: 'Geri', score: 'Puan', round: 'Tur', lives: 'Hak', combo: 'Seri', ready: 'Hazır',
    hit: 'Kilitlendi +{points}', miss: 'Kaçtı', precision: '%{value} hassasiyet',
    watchSequence: '{count} kareyi izle', yourTurn: 'Sıra sende', echoCorrect: 'Doğru', echoWrong: 'Yanlış kare', roundCleared: 'Desen tamam +{points}',
    laneLeft: 'Sol şerit', laneCenter: 'Orta şerit', laneRight: 'Sağ şerit',
    lanePromptLeft: 'Şimdi sol', lanePromptCenter: 'Şimdi orta', lanePromptRight: 'Şimdi sağ',
    laneCorrect: 'Doğru şerit +{points}', laneWrong: 'Yanlış şerit', laneTooSlow: 'İşaret söndü',
    lumenMirrorPrompt: 'Karşı şeridi seç', lumenChoicePrompt: 'Kapalı şeritten kaçın; yıldız rotası daha çok puan verir',
    lumenMemoryWatchFirst: '{count} işareti izle ve ilkini hatırla', lumenMemoryWatchLast: '{count} işareti izle ve sonuncuyu hatırla',
    lumenMemoryChooseFirst: 'İlk işareti seç', lumenMemoryChooseLast: 'Son işareti seç',
    lumenGateCleared: 'Kapı geçildi +{points}', lumenRiskCleared: 'Risk rotası ustalığı +{points}', lumenBlocked: 'Bu şerit kapalıydı',
    lumenDistance: 'Kapı', lumenGate: 'Kapı {value}', lumenEndRun: 'Koşuyu bitir', lumenExitNow: 'Koşuyu bitirmeyi onayla', lumenExitConfirm: 'Koşuyu bitirmek için üç saniye içinde tekrar bas',
    lumenEnded: 'Koşuyu sen bitirdin', lumenResultDetail: '{gates} kapı · en iyi seri {combo} · %{accuracy} doğruluk', endless: 'Sonsuz',
    lumenZonePrism: 'Prizma hattı', lumenZoneCurrent: 'Akım ayrımı', lumenZoneSignal: 'Sinyal alanı', lumenZoneVault: 'Odak kasası',
    lumenRuleDirect: 'İşareti izle', lumenRuleMirror: 'Karşı şeridi seç', lumenRuleChoice: '× işaretinden kaçın veya ★ seç', lumenRuleMemory: 'İstenen işareti hatırla',
    lumenLaneBlocked: 'Kapalı rota', lumenLaneRisk: 'Risk rotası',
    mirrorPrompt: 'Yansıtılmış deseni seç', mirrorCorrect: 'Ayna eşleşti +{points}', mirrorWrong: 'Bu desen yansımayı tamamlamıyor', mirrorTooSlow: 'Ayna seçimi süresi doldu',
    mirrorSourcePattern: 'Kaynak desen. {pattern}', mirrorPatternRow: 'Satır {row}: {cells}', mirrorCellOn: 'dolu', mirrorCellOff: 'boş', mirrorOptionPattern: 'Ayna seçeneği {value}. {pattern}',
    complete: 'Deneme tamamlandı', failed: 'Deneme bitti', replay: 'Tekrar', share: 'Arkadaşına meydan oku', shareAgain: 'Rövanş gönder',
    copied: 'Davet kopyalandı', shareUnavailable: 'Bu daveti kopyala', sharePreparing: 'Sonuç kartı hazırlanıyor', shareComplete: 'Mücadele paylaşıldı', shareCancelled: 'Paylaşım iptal edildi', shareFallback: 'Davet kopyalanmaya hazır',
    shareCardCallToAction: 'Geçebilir misin?', shareCardDuel: 'Karşı karşıya', resultTitle: 'Sonucun', compareTitle: 'Karşı karşıya',
    challenger: 'Rakip', you: 'Sen', differenceValue: 'Fark {difference}',
    win: '{difference} puanla kazandın', lose: 'Geçmek için {difference} puan gerekli', tie: 'Tam beraberlik', target: 'Arkadaş: {score}',
    comparisonAnnouncement: '{outcome}. Rakip {target}. Sen {score}. Fark {difference}.',
    challengeShareText: '{name}: {score} puan yaptım. Geçebilir misin?', rematchShareText: '{name} rövanşı: {score} puanımı geç.',
    invalidLink: 'Bu mücadele bağlantısı geçersiz. Yeni bir deneme hazır.', loadError: 'Mücadele başlatılamadı. Tekrar dene.',
    loading: 'Mücadeleler yükleniyor', newRun: 'Yeni rota', catalog: 'Tüm mücadeleler', privacy: 'Hesap yok. Takip yok.',
    orbitControlsHint: 'Arenaya dokun', echoControlsHint: 'Karelere sırayla dokun', lumenControlsHint: 'Dokunma veya ok tuşlarıyla şerit seç; güvenle durmak için Koşuyu bitir düğmesine iki kez bas', mirrorControlsHint: 'Üç ayna seçeneğinden birini seç',
    orbitArenaLabel: 'Yörünge Kilidi oyun alanı', echoArenaLabel: 'Yankı Izgarası oyun tahtası', lumenArenaLabel: 'Sonsuz Işık Şeritleri oyun alanı', mirrorArenaLabel: 'Ayna Birleştirme yansıma bulmacası',
    gameStatusLabel: 'Oyun durumu', finalScore: 'Son puan {score}',
    challengeCard: '{name} oyna', skillTiming: 'Zamanlama', skillMemory: 'Hafıza', skillReaction: 'Tepki', skillSpatial: 'Uzamsal', seconds: '~{value} sn', tileLabel: 'Kare {value}', mirrorOptionLabel: 'Ayna seçeneği {value}'
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
