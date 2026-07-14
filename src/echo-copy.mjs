import { messages } from './i18n.mjs';

Object.assign(messages.en, {
  soundEffects: 'Sound', soundOn: 'Sound on', soundOff: 'Sound muted', catalogHint: 'Four games. One score to beat.',
  echoTagline: 'Endless memory trail', echoHowTo: 'Watch a path, read its rule, then move the marker to reconstruct, reverse, turn, or decode it. The journey continues until your chances end or you confirm exit.',
  echoWatchPath: 'Watch {count} moves', echoCueReady: 'Path ready. Replay it or begin moving', echoMoveNow: 'Move now',
  echoStepCorrect: 'Step {value} of {count}', echoWrongMove: 'That move breaks the path', echoTooSlow: 'The path faded', echoTrailCleared: 'Trail cleared +{points}', echoRecovery: 'One chance restored',
  echoTrail: 'Trail', echoStep: 'Trail {value}', echoEndRun: 'End journey', echoExitNow: 'Confirm end journey', echoExitConfirm: 'Press again within three seconds to end the journey',
  echoEnded: 'Journey ended by choice', echoResultDetail: '{trails} trails · best streak {combo} · {accuracy}% accuracy', echoReplayCue: 'Replay cue', echoReadyMove: 'Ready to move',
  echoZoneGarden: 'Quiet garden', echoZoneBridge: 'Echo bridge', echoZoneVault: 'Memory vault', echoZoneStorm: 'Signal storm',
  echoRuleDirect: 'Repeat the path', echoRuleReverse: 'Return along the path', echoRuleTurn: 'Turn every arrow right', echoRuleEcho: '↺ arrows mean opposite',
  echoDirectionUp: 'Up', echoDirectionRight: 'Right', echoDirectionDown: 'Down', echoDirectionLeft: 'Left', echoOppositeMark: 'opposite',
  echoAccessibleSequence: 'Cue sequence: {sequence}', echoMovementControls: 'Movement controls',
  echoControlsHint: 'Use arrows or the four controls; replay the cue before Ready; press End journey twice to stop safely', echoArenaLabel: 'Endless Echo Grid memory journey'
});

Object.assign(messages.ar, {
  soundEffects: 'الصوت', soundOn: 'الصوت مفعّل', soundOff: 'الصوت مكتوم', catalogHint: 'أربع ألعاب ونتيجة واحدة للتجاوز.',
  echoTagline: 'مسار ذاكرة لا نهائي', echoHowTo: 'راقب المسار واقرأ قاعدته، ثم حرّك العلامة لتكراره أو عكسه أو تدويره أو فك إشاراته. تستمر الرحلة حتى تنتهي فرصك أو تؤكد الخروج.',
  echoWatchPath: 'راقب {count} حركات', echoCueReady: 'المسار جاهز. أعد عرضه أو ابدأ الحركة', echoMoveNow: 'تحرّك الآن',
  echoStepCorrect: 'الخطوة {value} من {count}', echoWrongMove: 'هذه الحركة تقطع المسار', echoTooSlow: 'اختفى المسار', echoTrailCleared: 'تم اجتياز المسار +{points}', echoRecovery: 'استعدت فرصة واحدة',
  echoTrail: 'المسار', echoStep: 'المسار {value}', echoEndRun: 'إنهاء الرحلة', echoExitNow: 'تأكيد إنهاء الرحلة', echoExitConfirm: 'اضغط مرة أخرى خلال ثلاث ثوانٍ لإنهاء الرحلة',
  echoEnded: 'أنهيت الرحلة باختيارك', echoResultDetail: '{trails} مسار · أفضل تتابع {combo} · دقة {accuracy}٪', echoReplayCue: 'إعادة الإشارة', echoReadyMove: 'جاهز للحركة',
  echoZoneGarden: 'الحديقة الهادئة', echoZoneBridge: 'جسر الصدى', echoZoneVault: 'خزنة الذاكرة', echoZoneStorm: 'عاصفة الإشارات',
  echoRuleDirect: 'كرّر المسار', echoRuleReverse: 'ارجع على المسار', echoRuleTurn: 'دوّر كل سهم يمينًا', echoRuleEcho: 'الأسهم بعلامة ↺ تعني العكس',
  echoDirectionUp: 'أعلى', echoDirectionRight: 'يمين', echoDirectionDown: 'أسفل', echoDirectionLeft: 'يسار', echoOppositeMark: 'عكس',
  echoAccessibleSequence: 'تسلسل الإشارة: {sequence}', echoMovementControls: 'أزرار الحركة',
  echoControlsHint: 'استخدم الأسهم أو أزرار الحركة الأربعة، ويمكنك إعادة الإشارة قبل الجاهزية، واضغط إنهاء الرحلة مرتين للتوقف بأمان', echoArenaLabel: 'رحلة الذاكرة اللانهائية لشبكة الصدى'
});

Object.assign(messages.tr, {
  soundEffects: 'Ses', soundOn: 'Ses açık', soundOff: 'Ses kapalı', catalogHint: 'Dört oyun. Geçilecek tek puan.',
  echoTagline: 'Sonsuz hafıza yolu', echoHowTo: 'Yolu izle, kuralını oku ve işaretçiyi yolu tekrar etmek, tersine dönmek, çevirmek veya kodunu çözmek için hareket ettir. Hakların bitene veya çıkışı onaylayana kadar yolculuk sürer.',
  echoWatchPath: '{count} hareketi izle', echoCueReady: 'Yol hazır. Yeniden oynat veya hareket etmeye başla', echoMoveNow: 'Şimdi hareket et',
  echoStepCorrect: '{count} adımın {value}. adımı', echoWrongMove: 'Bu hareket yolu bozuyor', echoTooSlow: 'Yol kayboldu', echoTrailCleared: 'Yol tamamlandı +{points}', echoRecovery: 'Bir hak geri geldi',
  echoTrail: 'Yol', echoStep: 'Yol {value}', echoEndRun: 'Yolculuğu bitir', echoExitNow: 'Yolculuğu bitirmeyi onayla', echoExitConfirm: 'Yolculuğu bitirmek için üç saniye içinde tekrar bas',
  echoEnded: 'Yolculuğu sen bitirdin', echoResultDetail: '{trails} yol · en iyi seri {combo} · %{accuracy} doğruluk', echoReplayCue: 'İpucunu tekrarla', echoReadyMove: 'Harekete hazırım',
  echoZoneGarden: 'Sessiz bahçe', echoZoneBridge: 'Yankı köprüsü', echoZoneVault: 'Hafıza kasası', echoZoneStorm: 'Sinyal fırtınası',
  echoRuleDirect: 'Yolu tekrarla', echoRuleReverse: 'Yoldan geri dön', echoRuleTurn: 'Her oku sağa çevir', echoRuleEcho: '↺ işaretli oklar tersini gösterir',
  echoDirectionUp: 'Yukarı', echoDirectionRight: 'Sağ', echoDirectionDown: 'Aşağı', echoDirectionLeft: 'Sol', echoOppositeMark: 'ters',
  echoAccessibleSequence: 'İpucu dizisi: {sequence}', echoMovementControls: 'Hareket kontrolleri',
  echoControlsHint: 'Ok tuşlarını veya dört hareket düğmesini kullan; Hazırdan önce ipucunu tekrarlayabilirsin; güvenle durmak için Yolculuğu bitir düğmesine iki kez bas', echoArenaLabel: 'Sonsuz Yankı Izgarası hafıza yolculuğu'
});
