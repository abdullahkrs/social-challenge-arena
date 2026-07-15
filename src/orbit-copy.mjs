import { messages } from './i18n.mjs';

Object.assign(messages.en, {
  orbitName: 'Orbit Lock', orbitTagline: 'Endless precision relay',
  orbitHowTo: 'Choose an orbit, then lock the pulse inside the marked gate. Continue until your chances end or you choose to exit.',
  orbitControlsHint: 'Use Inner/Outer and Lock, or ↑/↓ and Space. Check alignment provides a non-visual timing cue; press End journey twice to stop safely.',
  orbitArenaLabel: 'Endless Orbit Lock precision journey', orbitGateLabel: 'Gate', orbitGate: 'Gate {value}',
  orbitInner: 'Inner orbit', orbitOuter: 'Outer orbit', orbitLock: 'Lock', orbitCheck: 'Check alignment', orbitControls: 'Orbit controls',
  orbitEndRun: 'End journey', orbitExitNow: 'Confirm end journey', orbitExitConfirm: 'Press again within three seconds to end the journey', orbitEnded: 'Journey ended by choice',
  orbitZoneHalo: 'Halo approach', orbitZoneCrossing: 'Crossing rings', orbitZoneCipher: 'Signal cipher', orbitZoneSurge: 'Momentum surge',
  orbitRuleAlign: 'Lock the marked orbit', orbitRuleSwitch: 'Move to the marked orbit', orbitRuleMatch: 'Match {symbol}', orbitRuleOpposite: 'Choose the opposite of {symbol}', orbitRuleRisk: 'Choose safe ◇ or risky ★', orbitRuleRelay: 'Relay {step}/{total}: {orbit}',
  orbitStageReady: 'Gate {value}. {zone}. {rule}', orbitMoved: '{orbit} selected', orbitMovedInner: 'Inner orbit selected', orbitMovedOuter: 'Outer orbit selected', orbitLocked: 'Gate locked +{points}', orbitRelayLocked: 'Relay lock {step} of {total} +{points}',
  orbitMissed: 'The pulse missed the window', orbitWrongOrbit: 'That orbit does not satisfy the rule', orbitTimeout: 'The gate passed', orbitRecovery: 'One chance restored', orbitMilestone: 'Milestone {value}',
  orbitScanInside: 'The pulse is inside the window. Lock now.', orbitScanNear: 'The pulse is approaching the window.', orbitScanFar: 'The pulse is far from the window.', orbitScanWrongRing: 'The selected orbit does not satisfy the current rule.',
  orbitAccessibleStage: '{rule}. Start on {orbit}. Direction {direction}. Window {window}.', orbitClockwise: 'clockwise', orbitCounterClockwise: 'counter-clockwise', orbitWindowWide: 'wide', orbitWindowMedium: 'medium', orbitWindowTight: 'tight',
  orbitResultDetail: '{gates} gates · best streak {combo} · {precision}% precision · {accuracy}% accuracy'
});

Object.assign(messages.ar, {
  orbitName: 'قفل المدار', orbitTagline: 'تتابع دقة لا نهائي',
  orbitHowTo: 'اختر مدارًا، ثم ثبّت النبضة داخل البوابة المحددة. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.',
  orbitControlsHint: 'استخدم المدار الداخلي أو الخارجي ثم زر التثبيت، أو السهمين أعلى وأسفل والمسافة. زر فحص المحاذاة يوفر إشارة توقيت غير بصرية، واضغط إنهاء الرحلة مرتين للتوقف بأمان.',
  orbitArenaLabel: 'رحلة الدقة اللانهائية لقفل المدار', orbitGateLabel: 'البوابة', orbitGate: 'البوابة {value}',
  orbitInner: 'المدار الداخلي', orbitOuter: 'المدار الخارجي', orbitLock: 'تثبيت', orbitCheck: 'فحص المحاذاة', orbitControls: 'أزرار المدار',
  orbitEndRun: 'إنهاء الرحلة', orbitExitNow: 'تأكيد إنهاء الرحلة', orbitExitConfirm: 'اضغط مرة أخرى خلال ثلاث ثوانٍ لإنهاء الرحلة', orbitEnded: 'أنهيت الرحلة باختيارك',
  orbitZoneHalo: 'مدخل الهالة', orbitZoneCrossing: 'تقاطع المدارات', orbitZoneCipher: 'شفرة الإشارات', orbitZoneSurge: 'اندفاع الزخم',
  orbitRuleAlign: 'ثبّت في المدار المحدد', orbitRuleSwitch: 'انتقل إلى المدار المحدد', orbitRuleMatch: 'طابق الرمز {symbol}', orbitRuleOpposite: 'اختر عكس الرمز {symbol}', orbitRuleRisk: 'اختر الآمن ◇ أو المخاطرة ★', orbitRuleRelay: 'التتابع {step}/{total}: {orbit}',
  orbitStageReady: 'البوابة {value}. {zone}. {rule}', orbitMoved: 'تم اختيار {orbit}', orbitMovedInner: 'تم اختيار المدار الداخلي', orbitMovedOuter: 'تم اختيار المدار الخارجي', orbitLocked: 'تم تثبيت البوابة +{points}', orbitRelayLocked: 'قفل التتابع {step} من {total} +{points}',
  orbitMissed: 'تجاوزت النبضة النافذة', orbitWrongOrbit: 'هذا المدار لا يطابق القاعدة', orbitTimeout: 'عبرت البوابة', orbitRecovery: 'استعدت فرصة واحدة', orbitMilestone: 'المعلم {value}',
  orbitScanInside: 'النبضة داخل النافذة. ثبّت الآن.', orbitScanNear: 'النبضة تقترب من النافذة.', orbitScanFar: 'النبضة بعيدة عن النافذة.', orbitScanWrongRing: 'المدار المحدد لا يطابق القاعدة الحالية.',
  orbitAccessibleStage: '{rule}. البداية على {orbit}. الاتجاه {direction}. النافذة {window}.', orbitClockwise: 'مع عقارب الساعة', orbitCounterClockwise: 'عكس عقارب الساعة', orbitWindowWide: 'واسعة', orbitWindowMedium: 'متوسطة', orbitWindowTight: 'ضيقة',
  orbitResultDetail: '{gates} بوابة · أفضل تتابع {combo} · دقة التوقيت {precision}٪ · دقة المحاولات {accuracy}٪'
});

Object.assign(messages.tr, {
  orbitName: 'Yörünge Kilidi', orbitTagline: 'Sonsuz hassasiyet rölesi',
  orbitHowTo: 'Bir yörünge seç, sonra nabzı işaretli kapının içinde kilitle. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.',
  orbitControlsHint: 'İç/Dış ve Kilitle düğmelerini ya da ↑/↓ ve Boşluk tuşunu kullan. Hizalamayı kontrol et görsel olmayan bir zamanlama ipucu verir; güvenle durmak için Yolculuğu bitir düğmesine iki kez bas.',
  orbitArenaLabel: 'Sonsuz Yörünge Kilidi hassasiyet yolculuğu', orbitGateLabel: 'Kapı', orbitGate: 'Kapı {value}',
  orbitInner: 'İç yörünge', orbitOuter: 'Dış yörünge', orbitLock: 'Kilitle', orbitCheck: 'Hizalamayı kontrol et', orbitControls: 'Yörünge kontrolleri',
  orbitEndRun: 'Yolculuğu bitir', orbitExitNow: 'Bitirmeyi onayla', orbitExitConfirm: 'Yolculuğu bitirmek için üç saniye içinde tekrar bas', orbitEnded: 'Yolculuğu sen bitirdin',
  orbitZoneHalo: 'Hale yaklaşımı', orbitZoneCrossing: 'Kesişen yörüngeler', orbitZoneCipher: 'Sinyal şifresi', orbitZoneSurge: 'Momentum dalgası',
  orbitRuleAlign: 'İşaretli yörüngede kilitle', orbitRuleSwitch: 'İşaretli yörüngeye geç', orbitRuleMatch: '{symbol} simgesini eşleştir', orbitRuleOpposite: '{symbol} simgesinin tersini seç', orbitRuleRisk: 'Güvenli ◇ veya riskli ★ seç', orbitRuleRelay: 'Röle {step}/{total}: {orbit}',
  orbitStageReady: 'Kapı {value}. {zone}. {rule}', orbitMoved: '{orbit} seçildi', orbitMovedInner: 'İç yörünge seçildi', orbitMovedOuter: 'Dış yörünge seçildi', orbitLocked: 'Kapı kilitlendi +{points}', orbitRelayLocked: 'Röle kilidi {step}/{total} +{points}',
  orbitMissed: 'Nabız pencereyi kaçırdı', orbitWrongOrbit: 'Bu yörünge kurala uymuyor', orbitTimeout: 'Kapı geçti', orbitRecovery: 'Bir hak geri geldi', orbitMilestone: 'Dönüm noktası {value}',
  orbitScanInside: 'Nabız pencerenin içinde. Şimdi kilitle.', orbitScanNear: 'Nabız pencereye yaklaşıyor.', orbitScanFar: 'Nabız pencereden uzak.', orbitScanWrongRing: 'Seçilen yörünge geçerli kurala uymuyor.',
  orbitAccessibleStage: '{rule}. {orbit} üzerinde başla. Yön {direction}. Pencere {window}.', orbitClockwise: 'saat yönünde', orbitCounterClockwise: 'saat yönünün tersinde', orbitWindowWide: 'geniş', orbitWindowMedium: 'orta', orbitWindowTight: 'dar',
  orbitResultDetail: '{gates} kapı · en iyi seri {combo} · %{precision} hassasiyet · %{accuracy} doğruluk'
});
