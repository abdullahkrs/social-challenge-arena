import { messages } from './i18n.mjs';

const copy = {
  en: {
    orbitTagline: 'Endless precision current',
    orbitHowTo: 'Move between rings, read the rule, then lock as your signal crosses the valid gate. Continue until your chances end or you confirm exit.',
    orbitControlsHint: 'Use inward/outward or ←/→; lock with the center button, Space, or Enter',
    orbitArenaLabel: 'Endless Orbit Lock precision arena',
    orbitGateLabel: 'Gate', orbitGate: 'Gate {value}',
    orbitEndRun: 'End run', orbitExitNow: 'Confirm end run', orbitExitConfirm: 'Press again within three seconds to end the run',
    orbitEnded: 'Run ended by choice', orbitResultDetail: '{gates} gates · best streak {combo} · {accuracy}% accuracy · {risk} risk locks',
    orbitZoneHalo: 'Halo approach', orbitZoneSwitchyard: 'Ring switchyard', orbitZoneEclipse: 'Eclipse relay', orbitZoneCrown: 'Crown circuit',
    orbitRuleDirect: 'Match the marked ring', orbitRuleLane: 'Follow the valid ◇ gate', orbitRuleOpposite: 'Use the opposite ring', orbitRuleSequence: 'Recall the requested signal',
    orbitRingInner: 'Inner ring', orbitRingMiddle: 'Middle ring', orbitRingOuter: 'Outer ring',
    orbitMoveIn: 'Move inward', orbitMoveOut: 'Move outward', orbitLock: 'Lock signal',
    orbitStageReady: 'Gate {value}. {rule}. Current position: {lane}.',
    orbitSequenceFirst: 'Remember the first: {sequence}', orbitSequenceLast: 'Remember the last: {sequence}',
    orbitCorrect: 'Locked +{points}', orbitRiskCorrect: 'Risk lock +{points}', orbitWrongLane: 'Wrong ring', orbitMiss: 'Missed the timing window', orbitTimeout: 'Gate expired',
    orbitRecovery: 'Chance restored', orbitWindowOpen: 'Lock window open', orbitApproaching: 'Approaching', orbitAligned: 'Aligned — lock now',
    orbitState: '{zone}. {rule}. {lane}. {status}.', orbitExitDisabled: 'Failure is resolving',
    orbitRiskGate: 'Risk gate', orbitSafeGate: 'Valid gate'
  },
  ar: {
    orbitTagline: 'تيار دقة لا نهائي',
    orbitHowTo: 'تنقّل بين الحلقات، واقرأ القاعدة، ثم ثبّت الإشارة عند عبورها البوابة الصحيحة. تستمر المحاولة حتى تنتهي فرصك أو تؤكد الخروج.',
    orbitControlsHint: 'استخدم للداخل والخارج أو ← و→، وثبّت بالزر الأوسط أو مسافة أو Enter',
    orbitArenaLabel: 'ساحة قفل المدار اللانهائية للدقة',
    orbitGateLabel: 'البوابة', orbitGate: 'البوابة {value}',
    orbitEndRun: 'إنهاء المحاولة', orbitExitNow: 'تأكيد إنهاء المحاولة', orbitExitConfirm: 'اضغط مرة أخرى خلال ثلاث ثوانٍ لإنهاء المحاولة',
    orbitEnded: 'أنهيت المحاولة باختيارك', orbitResultDetail: '{gates} بوابة · أفضل تتابع {combo} · دقة {accuracy}٪ · {risk} قفل مخاطرة',
    orbitZoneHalo: 'مدخل الهالة', orbitZoneSwitchyard: 'محطة تبديل الحلقات', orbitZoneEclipse: 'ترحيل الكسوف', orbitZoneCrown: 'دائرة التاج',
    orbitRuleDirect: 'طابق الحلقة المحددة', orbitRuleLane: 'اتبع بوابة ◇ الصحيحة', orbitRuleOpposite: 'استخدم الحلقة المقابلة', orbitRuleSequence: 'تذكّر الإشارة المطلوبة',
    orbitRingInner: 'الحلقة الداخلية', orbitRingMiddle: 'الحلقة الوسطى', orbitRingOuter: 'الحلقة الخارجية',
    orbitMoveIn: 'تحرك للداخل', orbitMoveOut: 'تحرك للخارج', orbitLock: 'ثبّت الإشارة',
    orbitStageReady: 'البوابة {value}. {rule}. موقعك الحالي: {lane}.',
    orbitSequenceFirst: 'تذكّر الأولى: {sequence}', orbitSequenceLast: 'تذكّر الأخيرة: {sequence}',
    orbitCorrect: 'تم التثبيت +{points}', orbitRiskCorrect: 'قفل مخاطرة +{points}', orbitWrongLane: 'الحلقة غير صحيحة', orbitMiss: 'فاتت نافذة التوقيت', orbitTimeout: 'انتهى وقت البوابة',
    orbitRecovery: 'استعدت فرصة', orbitWindowOpen: 'نافذة التثبيت مفتوحة', orbitApproaching: 'تقترب', orbitAligned: 'محاذاة صحيحة — ثبّت الآن',
    orbitState: '{zone}. {rule}. {lane}. {status}.', orbitExitDisabled: 'جارٍ اعتماد الفشل',
    orbitRiskGate: 'بوابة مخاطرة', orbitSafeGate: 'البوابة الصحيحة'
  },
  tr: {
    orbitTagline: 'Sonsuz hassasiyet akışı',
    orbitHowTo: 'Halkalar arasında hareket et, kuralı oku ve sinyal geçerli kapıdan geçerken kilitle. Hakların bitene veya çıkışı onaylayana kadar sürer.',
    orbitControlsHint: 'İçe/dışa veya ←/→ kullan; ortadaki düğme, Boşluk ya da Enter ile kilitle',
    orbitArenaLabel: 'Sonsuz Yörünge Kilidi hassasiyet alanı',
    orbitGateLabel: 'Kapı', orbitGate: 'Kapı {value}',
    orbitEndRun: 'Koşuyu bitir', orbitExitNow: 'Koşuyu bitirmeyi onayla', orbitExitConfirm: 'Koşuyu bitirmek için üç saniye içinde tekrar bas',
    orbitEnded: 'Koşuyu sen bitirdin', orbitResultDetail: '{gates} kapı · en iyi seri {combo} · %{accuracy} doğruluk · {risk} risk kilidi',
    orbitZoneHalo: 'Hale yaklaşımı', orbitZoneSwitchyard: 'Halka makası', orbitZoneEclipse: 'Tutulma rölesi', orbitZoneCrown: 'Taç devresi',
    orbitRuleDirect: 'İşaretli halkayı eşleştir', orbitRuleLane: 'Geçerli ◇ kapısını izle', orbitRuleOpposite: 'Karşı halkayı kullan', orbitRuleSequence: 'İstenen sinyali hatırla',
    orbitRingInner: 'İç halka', orbitRingMiddle: 'Orta halka', orbitRingOuter: 'Dış halka',
    orbitMoveIn: 'İçe hareket et', orbitMoveOut: 'Dışa hareket et', orbitLock: 'Sinyali kilitle',
    orbitStageReady: 'Kapı {value}. {rule}. Mevcut konum: {lane}.',
    orbitSequenceFirst: 'İlkini hatırla: {sequence}', orbitSequenceLast: 'Sonuncuyu hatırla: {sequence}',
    orbitCorrect: 'Kilitlendi +{points}', orbitRiskCorrect: 'Risk kilidi +{points}', orbitWrongLane: 'Yanlış halka', orbitMiss: 'Zamanlama penceresi kaçtı', orbitTimeout: 'Kapı süresi doldu',
    orbitRecovery: 'Bir hak geri geldi', orbitWindowOpen: 'Kilit penceresi açık', orbitApproaching: 'Yaklaşıyor', orbitAligned: 'Hizalı — şimdi kilitle',
    orbitState: '{zone}. {rule}. {lane}. {status}.', orbitExitDisabled: 'Başarısızlık sonuçlanıyor',
    orbitRiskGate: 'Risk kapısı', orbitSafeGate: 'Geçerli kapı'
  }
};

for (const [language, additions] of Object.entries(copy)) Object.assign(messages[language], additions);
