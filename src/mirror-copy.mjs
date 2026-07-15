import { messages } from './i18n.mjs';

Object.assign(messages.en, {
  mirrorName: 'Mirror Fuse', mirrorTagline: 'Endless spatial circuit',
  mirrorHowTo: 'Move across the board and switch cells to match the transformed shape. Continue until your chances end or you choose to exit.',
  mirrorControlsHint: 'Use arrows or adjacent cells to move; Space or the center control switches the current cell; check the pattern, and press End journey twice to stop safely',
  mirrorArenaLabel: 'Endless Mirror Fuse spatial construction journey', mirrorPattern: 'Pattern', mirrorStep: 'Pattern {value}',
  mirrorSource: 'Source', mirrorTarget: 'Build', mirrorMoves: '{used}/{budget} moves', mirrorCheckPattern: 'Check pattern', mirrorSwitchCell: 'Switch cell',
  mirrorEndRun: 'End journey', mirrorExitNow: 'Confirm end journey', mirrorExitConfirm: 'Press again within three seconds to end the journey', mirrorEnded: 'Journey ended by choice',
  mirrorZoneGallery: 'Axis gallery', mirrorZoneCrossing: 'Glass crossing', mirrorZoneVault: 'Shift vault', mirrorZoneAurora: 'Aurora chamber',
  mirrorRuleHorizontal: 'Reflect left to right', mirrorRuleVertical: 'Reflect top to bottom', mirrorRuleRotate180: 'Rotate half-turn', mirrorRuleRotateRight: 'Rotate right',
  mirrorMechanicRebuild: 'Rebuild the transformed shape', mirrorMechanicAnchor: 'Keep the fixed anchors and complete the shape', mirrorMechanicRepair: 'Repair the prepared board', mirrorMechanicSequence: 'Activate the numbered cells in order',
  mirrorStageReady: 'Pattern {value}. {rule}. {mechanic}', mirrorCursorMoved: 'Cursor at row {row}, column {column}', mirrorCellEnabled: 'Cell on', mirrorCellDisabled: 'Cell off',
  mirrorLocked: 'That anchor is fixed', mirrorNotAdjacent: 'Move through an adjacent cell', mirrorCorrect: 'Pattern aligned +{points}', mirrorWrong: 'The pattern does not match', mirrorTimeout: 'Time ended', mirrorMoveLimit: 'Move budget ended', mirrorSequenceWrong: 'That is not the next numbered cell', mirrorRecovery: 'One chance restored',
  mirrorResultDetail: '{patterns} patterns · best streak {combo} · {accuracy}% action accuracy',
  mirrorSourceDescription: 'Source cells: {cells}. Rule: {rule}. Task: {mechanic}.', mirrorCoordinate: 'row {row}, column {column}', mirrorCurrent: 'current cursor', mirrorFixed: 'fixed anchor', mirrorSequenceNumber: 'step {value}',
  mirrorTargetCellLabel: '{coordinate}. {state}. {extra}', mirrorBoardLabel: 'Target construction board', mirrorMovementControls: 'Mirror movement controls',
  mirrorPhaseRecovery: 'Recovery pattern', mirrorPhaseSpecial: 'Special pattern', mirrorPhaseMastery: 'Mastery pattern'
});

Object.assign(messages.ar, {
  mirrorName: 'دمج المرآة', mirrorTagline: 'مسار مكاني لا نهائي',
  mirrorHowTo: 'تحرّك على اللوحة وبدّل الخلايا لتطابق الشكل المحوّل. تستمر الرحلة حتى تنتهي فرصك أو تختار الخروج.',
  mirrorControlsHint: 'استخدم الأسهم أو الخلايا المجاورة للحركة، واضغط المسافة أو زر الوسط لتبديل الخلية الحالية، ثم افحص الشكل، واضغط إنهاء الرحلة مرتين للتوقف بأمان',
  mirrorArenaLabel: 'رحلة البناء المكاني اللانهائية لدمج المرآة', mirrorPattern: 'النمط', mirrorStep: 'النمط {value}',
  mirrorSource: 'الأصل', mirrorTarget: 'البناء', mirrorMoves: '{used}/{budget} حركة', mirrorCheckPattern: 'فحص النمط', mirrorSwitchCell: 'تبديل الخلية',
  mirrorEndRun: 'إنهاء الرحلة', mirrorExitNow: 'تأكيد إنهاء الرحلة', mirrorExitConfirm: 'اضغط مرة أخرى خلال ثلاث ثوانٍ لإنهاء الرحلة', mirrorEnded: 'أنهيت الرحلة باختيارك',
  mirrorZoneGallery: 'معرض المحاور', mirrorZoneCrossing: 'معبر الزجاج', mirrorZoneVault: 'خزنة التحويل', mirrorZoneAurora: 'قاعة الشفق',
  mirrorRuleHorizontal: 'اعكس من اليسار إلى اليمين', mirrorRuleVertical: 'اعكس من الأعلى إلى الأسفل', mirrorRuleRotate180: 'دوّر نصف دورة', mirrorRuleRotateRight: 'دوّر إلى اليمين',
  mirrorMechanicRebuild: 'أعد بناء الشكل المحوّل', mirrorMechanicAnchor: 'حافظ على نقاط التثبيت وأكمل الشكل', mirrorMechanicRepair: 'أصلح اللوحة المجهزة', mirrorMechanicSequence: 'فعّل الخلايا المرقمة بالترتيب',
  mirrorStageReady: 'النمط {value}. {rule}. {mechanic}', mirrorCursorMoved: 'المؤشر في الصف {row} والعمود {column}', mirrorCellEnabled: 'الخلية مفعّلة', mirrorCellDisabled: 'الخلية غير مفعّلة',
  mirrorLocked: 'نقطة التثبيت هذه ثابتة', mirrorNotAdjacent: 'تحرّك عبر خلية مجاورة', mirrorCorrect: 'تمت محاذاة النمط +{points}', mirrorWrong: 'النمط غير مطابق', mirrorTimeout: 'انتهى الوقت', mirrorMoveLimit: 'انتهت ميزانية الحركة', mirrorSequenceWrong: 'هذه ليست الخلية المرقمة التالية', mirrorRecovery: 'استعدت فرصة واحدة',
  mirrorResultDetail: '{patterns} نمط · أفضل تتابع {combo} · دقة الحركة {accuracy}٪',
  mirrorSourceDescription: 'خلايا الأصل: {cells}. القاعدة: {rule}. المهمة: {mechanic}.', mirrorCoordinate: 'الصف {row}، العمود {column}', mirrorCurrent: 'موضع المؤشر الحالي', mirrorFixed: 'نقطة تثبيت ثابتة', mirrorSequenceNumber: 'الخطوة {value}',
  mirrorTargetCellLabel: '{coordinate}. {state}. {extra}', mirrorBoardLabel: 'لوحة بناء النتيجة', mirrorMovementControls: 'أزرار حركة المرآة',
  mirrorPhaseRecovery: 'نمط استعادة', mirrorPhaseSpecial: 'نمط خاص', mirrorPhaseMastery: 'نمط إتقان'
});

Object.assign(messages.tr, {
  mirrorName: 'Ayna Birleştirme', mirrorTagline: 'Sonsuz uzamsal devre',
  mirrorHowTo: 'Tahtada hareket et ve dönüştürülmüş şekli eşleştirmek için hücreleri değiştir. Hakların bitene veya çıkmayı seçene kadar yolculuk sürer.',
  mirrorControlsHint: 'Hareket etmek için okları veya komşu hücreleri kullan; geçerli hücreyi değiştirmek için Boşluk ya da orta düğmeye bas; deseni kontrol et ve güvenle durmak için Yolculuğu bitir düğmesine iki kez bas',
  mirrorArenaLabel: 'Sonsuz Ayna Birleştirme uzamsal kurma yolculuğu', mirrorPattern: 'Desen', mirrorStep: 'Desen {value}',
  mirrorSource: 'Kaynak', mirrorTarget: 'Kur', mirrorMoves: '{used}/{budget} hareket', mirrorCheckPattern: 'Deseni kontrol et', mirrorSwitchCell: 'Hücreyi değiştir',
  mirrorEndRun: 'Yolculuğu bitir', mirrorExitNow: 'Bitirmeyi onayla', mirrorExitConfirm: 'Yolculuğu bitirmek için üç saniye içinde tekrar bas', mirrorEnded: 'Yolculuğu sen bitirdin',
  mirrorZoneGallery: 'Eksen galerisi', mirrorZoneCrossing: 'Cam geçit', mirrorZoneVault: 'Dönüşüm kasası', mirrorZoneAurora: 'Aurora odası',
  mirrorRuleHorizontal: 'Soldan sağa yansıt', mirrorRuleVertical: 'Yukarıdan aşağıya yansıt', mirrorRuleRotate180: 'Yarım tur döndür', mirrorRuleRotateRight: 'Sağa döndür',
  mirrorMechanicRebuild: 'Dönüştürülmüş şekli yeniden kur', mirrorMechanicAnchor: 'Sabit noktaları koru ve şekli tamamla', mirrorMechanicRepair: 'Hazır tahtayı onar', mirrorMechanicSequence: 'Numaralı hücreleri sırayla etkinleştir',
  mirrorStageReady: 'Desen {value}. {rule}. {mechanic}', mirrorCursorMoved: 'İmleç {row}. satır, {column}. sütunda', mirrorCellEnabled: 'Hücre açık', mirrorCellDisabled: 'Hücre kapalı',
  mirrorLocked: 'Bu sabit nokta değişmez', mirrorNotAdjacent: 'Komşu bir hücre üzerinden hareket et', mirrorCorrect: 'Desen hizalandı +{points}', mirrorWrong: 'Desen eşleşmiyor', mirrorTimeout: 'Süre bitti', mirrorMoveLimit: 'Hareket bütçesi bitti', mirrorSequenceWrong: 'Bu sıradaki numaralı hücre değil', mirrorRecovery: 'Bir hak geri geldi',
  mirrorResultDetail: '{patterns} desen · en iyi seri {combo} · %{accuracy} hareket doğruluğu',
  mirrorSourceDescription: 'Kaynak hücreler: {cells}. Kural: {rule}. Görev: {mechanic}.', mirrorCoordinate: '{row}. satır, {column}. sütun', mirrorCurrent: 'geçerli imleç', mirrorFixed: 'sabit nokta', mirrorSequenceNumber: '{value}. adım',
  mirrorTargetCellLabel: '{coordinate}. {state}. {extra}', mirrorBoardLabel: 'Hedef kurma tahtası', mirrorMovementControls: 'Ayna hareket kontrolleri',
  mirrorPhaseRecovery: 'Toparlanma deseni', mirrorPhaseSpecial: 'Özel desen', mirrorPhaseMastery: 'Ustalık deseni'
});
