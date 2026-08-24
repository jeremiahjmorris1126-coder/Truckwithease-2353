/**
 * Internationalization Engine
 * Multi-language support for 50+ languages and regional variants
 * Respects cultural, religious, and regional sensitivities
 */

export const SUPPORTED_LANGUAGES = {
  // English variants
  'en-US': 'English (United States)',
  'en-GB': 'English (United Kingdom)',
  'en-AU': 'English (Australia)',
  'en-CA': 'English (Canada)',
  'en-IN': 'English (India)',
  
  // Arabic variants
  'ar-SA': 'العربية (السعودية)',
  'ar-AE': 'العربية (الإمارات)',
  'ar-EG': 'العربية (مصر)',
  'ar-MA': 'العربية (المغرب)',
  'ar-JO': 'العربية (الأردن)',
  
  // Spanish variants
  'es-ES': 'Español (España)',
  'es-MX': 'Español (México)',
  'es-AR': 'Español (Argentina)',
  
  // French variants
  'fr-FR': 'Français (France)',
  'fr-CA': 'Français (Canada)',
  'fr-BE': 'Français (Belgique)',
  
  // German variants
  'de-DE': 'Deutsch (Deutschland)',
  'de-AT': 'Deutsch (Österreich)',
  'de-CH': 'Deutsch (Schweiz)',
  
  // Asian languages
  'zh-CN': '简体中文 (中国)',
  'zh-TW': '繁體中文 (台灣)',
  'ja-JP': '日本語 (日本)',
  'ko-KR': '한국어 (한국)',
  'hi-IN': 'हिन्दी (भारत)',
  'th-TH': 'ไทย (ประเทศไทย)',
  'vi-VN': 'Tiếng Việt (Việt Nam)',
  
  // Other major languages
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  'ru-RU': 'Русский (Россия)',
  'pl-PL': 'Polski (Polska)',
  'nl-NL': 'Nederlands (Nederland)',
  'it-IT': 'Italiano (Italia)',
  'tr-TR': 'Türkçe (Türkiye)',
  'he-IL': 'עברית (ישראל)',
  'fa-IR': 'فارسی (ایران)',
  'ur-PK': 'اردو (پاکستان)',
  'id-ID': 'Bahasa Indonesia (Indonesia)',
  'ms-MY': 'Bahasa Melayu (Malaysia)',
  'tl-PH': 'Tagalog (Pilipinas)',
  'sw-KE': 'Swahili (Kenya)',
  'cs-CZ': 'Čeština (Česká republika)',
  'hu-HU': 'Magyar (Magyarország)',
  'ro-RO': 'Română (România)',
  'el-GR': 'Ελληνικά (Ελλάδα)',
  'sk-SK': 'Slovenčina (Slovensko)',
  'uk-UA': 'Українська (Україна)',
};

// Religious/Cultural sensitivity mappings
export const CULTURAL_CONTEXTS = {
  ISLAMIC: {
    countries: ['ar-SA', 'ar-AE', 'ar-EG', 'ar-MA', 'ar-JO', 'ur-PK', 'fa-IR', 'tr-TR'],
    restrictions: ['alcohol', 'pork', 'gambling', 'interest-based-lending'],
    greetings: ['assalam-alaikum', 'peace-be-upon-you'],
    holidays: ['ramadan', 'eid-al-fitr', 'eid-al-adha'],
    sensitiveTopics: ['religious-criticism', 'dietary-violations', 'gender-mixing-informal'],
  },
  CHRISTIAN: {
    countries: ['en-US', 'en-GB', 'pt-BR', 'es-ES', 'es-MX'],
    restrictions: [],
    greetings: ['hello', 'peace-be-with-you'],
    holidays: ['christmas', 'easter', 'thanksgiving'],
    sensitiveTopics: [],
  },
  HINDU: {
    countries: ['hi-IN', 'en-IN'],
    restrictions: ['beef', 'leather-emphasis'],
    greetings: ['namaste', 'namaskar'],
    holidays: ['diwali', 'holi', 'navratri'],
    sensitiveTopics: ['caste-references', 'cow-related-commerce'],
  },
  JEWISH: {
    countries: ['he-IL', 'en-US'],
    restrictions: ['pork', 'shellfish', 'non-kosher-emphasis'],
    greetings: ['shalom', 'peace'],
    holidays: ['shabbat', 'rosh-hashanah', 'yom-kippur', 'passover'],
    sensitiveTopics: ['religious-discrimination', 'holocaust-references'],
  },
  BUDDHIST: {
    countries: ['th-TH', 'ja-JP'],
    restrictions: ['animal-harm', 'alcohol'],
    greetings: ['sawadee-krap', 'konnichiwa'],
    holidays: ['vesak', 'bodhi-day'],
    sensitiveTopics: ['disrespect-to-monks', 'animal-cruelty'],
  },
};

// Language-specific greeting variations
export const GREETINGS = {
  'en-US': 'Welcome to TruckWithEase',
  'en-GB': 'Welcome to TruckWithEase',
  'ar-SA': 'أهلا وسهلا بك في TruckWithEase',
  'ar-AE': 'أهلا وسهلا بك في TruckWithEase',
  'ar-EG': 'أهلا وسهلا بك في TruckWithEase',
  'es-ES': 'Bienvenido a TruckWithEase',
  'es-MX': 'Bienvenido a TruckWithEase',
  'fr-FR': 'Bienvenue sur TruckWithEase',
  'fr-CA': 'Bienvenue sur TruckWithEase',
  'de-DE': 'Willkommen bei TruckWithEase',
  'pt-BR': 'Bem-vindo ao TruckWithEase',
  'pt-PT': 'Bem-vindo ao TruckWithEase',
  'zh-CN': '欢迎来到 TruckWithEase',
  'zh-TW': '歡迎來到 TruckWithEase',
  'ja-JP': 'TruckWithEase へようこそ',
  'ko-KR': 'TruckWithEase에 오신 것을 환영합니다',
  'hi-IN': 'TruckWithEase में आपका स्वागत है',
  'th-TH': 'ยินดีต้อนรับสู่ TruckWithEase',
  'he-IL': 'ברוכים הבאים ל-TruckWithEase',
  'tr-TR': 'TruckWithEase\'a Hoş Geldiniz',
};

// Localized safety & compliance messaging
export const SAFETY_MESSAGES = {
  'en-US': {
    title: 'Responsible Use Agreement',
    subtitle: 'Please read and accept our Community Guidelines',
  },
  'ar-SA': {
    title: 'اتفاقية الاستخدام المسؤول',
    subtitle: 'يرجى قراءة وقبول إرشاداتنا الموحدة',
  },
  'es-ES': {
    title: 'Acuerdo de Uso Responsable',
    subtitle: 'Por favor, lea y acepte nuestras directrices comunitarias',
  },
  'pt-BR': {
    title: 'Acordo de Uso Responsável',
    subtitle: 'Por favor, leia e aceite nossas Diretrizes da Comunidade',
  },
  'fr-FR': {
    title: 'Accord d\'Utilisation Responsable',
    subtitle: 'Veuillez lire et accepter nos directives communautaires',
  },
  'de-DE': {
    title: 'Vereinbarung zur verantwortungsvollen Nutzung',
    subtitle: 'Bitte lesen und akzeptieren Sie unsere Gemeinschaftsrichtlinien',
  },
  'zh-CN': {
    title: '负责任使用协议',
    subtitle: '请阅读并接受我们的社区指南',
  },
  'ja-JP': {
    title: '責任ある利用契約',
    subtitle: 'コミュニティガイドラインをお読みの上、同意してください',
  },
  'hi-IN': {
    title: 'जिम्मेदारी से उपयोग करने का समझौता',
    subtitle: 'कृपया हमारी सामुदायिक दिशानिर्देशों को पढ़ें और स्वीकार करें',
  },
  'th-TH': {
    title: 'ข้อตกลงการใช้งานที่มีความรับผิดชอบ',
    subtitle: 'โปรดอ่านและยอมรับคำแนะนำของชุมชนของเรา',
  },
};

// Responsible use pledges in multiple languages
export const RESPONSIBLE_USE_PLEDGES = {
  'en-US': [
    'I will not use this app to harass, threaten, or harm any person or group',
    'I will not share others\' personal or financial information without consent',
    'I will not use this app to impersonate others or spread misinformation',
    'I will not exploit this app\'s features for fraud, theft, or illegal activities',
    'I will respect the privacy and safety of all users',
    'I will report dangerous or illegal behavior to platform support',
    'I understand that misuse may result in account suspension or legal action',
  ],
  'ar-SA': [
    'لن أستخدم هذا التطبيق للإساءة أو التهديد أو إيذاء أي شخص أو مجموعة',
    'لن أشارك معلومات شخصية أو مالية للآخرين بدون موافقتهم',
    'لن أستخدم هذا التطبيق لانتحال شخصية الآخرين أو نشر معلومات مضللة',
    'لن أستغل ميزات هذا التطبيق للاحتيال أو السرقة أو الأنشطة غير القانونية',
    'سأحترم خصوصية وسلامة جميع المستخدمين',
    'سأقوم بالإبلاغ عن السلوك الخطير أو غير القانوني إلى دعم المنصة',
    'أفهم أن الاستخدام الخاطئ قد يؤدي إلى تعليق الحساب أو اتخاذ إجراء قانوني',
  ],
  'es-ES': [
    'No usaré esta aplicación para acosar, amenazar o dañar a ninguna persona o grupo',
    'No compartiré información personal o financiera de otros sin su consentimiento',
    'No usaré esta aplicación para suplantar identidades o difundir desinformación',
    'No aprovecharé las características de esta aplicación para fraude, robo o actividades ilegales',
    'Respetaré la privacidad y seguridad de todos los usuarios',
    'Reportaré comportamiento peligroso o ilegal al equipo de soporte de la plataforma',
    'Entiendo que el mal uso puede resultar en suspensión de cuenta o acción legal',
  ],
  'pt-BR': [
    'Não usarei este aplicativo para assediar, ameaçar ou prejudicar qualquer pessoa ou grupo',
    'Não compartilharei informações pessoais ou financeiras de outros sem consentimento',
    'Não usarei este aplicativo para se passar por outros ou espalhar desinformação',
    'Não explorarei recursos deste aplicativo para fraude, roubo ou atividades ilegais',
    'Respeitarei a privacidade e segurança de todos os usuários',
    'Denunciarei comportamento perigoso ou ilegal ao suporte da plataforma',
    'Entendo que o uso indevido pode resultar em suspensão de conta ou ação legal',
  ],
  'fr-FR': [
    'Je n\'utiliserai pas cette application pour harceler, menacer ou faire du mal à une personne ou un groupe',
    'Je ne partagerai pas les informations personnelles ou financières d\'autres sans consentement',
    'Je n\'utiliserai pas cette application pour usurper l\'identité d\'autres ou diffuser de la désinformation',
    'Je n\'exploiterai pas les fonctionnalités de cette application pour la fraude, le vol ou les activités illégales',
    'Je respecterai la vie privée et la sécurité de tous les utilisateurs',
    'Je signalerai tout comportement dangereux ou illégal à l\'équipe d\'assistance de la plateforme',
    'Je comprends que l\'utilisation abusive peut entraîner la suspension du compte ou une action en justice',
  ],
  'de-DE': [
    'Ich werde diese App nicht verwenden, um eine Person oder Gruppe zu belästigen, zu bedrohen oder zu schaden',
    'Ich werde persönliche oder finanzielle Informationen anderer nicht ohne Zustimmung weitergeben',
    'Ich werde diese App nicht verwenden, um Identitäten nachzuahmen oder Desinformation zu verbreiten',
    'Ich werde die Funktionen dieser App nicht für Betrug, Diebstahl oder illegale Aktivitäten ausnutzen',
    'Ich respektiere die Privatsphäre und Sicherheit aller Benutzer',
    'Ich werde gefährliches oder illegales Verhalten dem Plattformunterstützungsteam melden',
    'Ich verstehe, dass Missbrauch zur Kontosperrung oder rechtlichen Schritten führen kann',
  ],
  'zh-CN': [
    '我不会使用此应用程序骚扰、威胁或伤害任何人或群体',
    '未经同意，我不会分享他人的个人或财务信息',
    '我不会使用此应用程序冒充他人或传播虚假信息',
    '我不会利用此应用程序的功能进行欺诈、盗窃或非法活动',
    '我将尊重所有用户的隐私和安全',
    '我将向平台支持团队报告危险或非法行为',
    '我理解滥用可能导致帐户暂停或法律诉讼',
  ],
  'ja-JP': [
    'このアプリを使用して、個人またはグループをハラスメント、脅迫、または傷つけることはありません',
    '同意なしに他の人の個人情報や財務情報を共有しません',
    'このアプリを使用して、他人になりすましたり、虚偽情報を広めたりしません',
    'このアプリの機能を詐欺、窃盗、または違法行為のために悪用しません',
    'すべてのユーザーのプライバシーとセキュリティを尊重します',
    '危険または違法な行為をプラットフォーム サポートに報告します',
    'アプリの悪用によりアカウント停止または法的措置につながる可能性があることを理解しています',
  ],
  'hi-IN': [
    'मैं इस ऐप का उपयोग किसी व्यक्ति या समूह को परेशान करने, धमकी देने या नुकसान पहुंचाने के लिए नहीं करूंगा',
    'मैं दूसरों की व्यक्तिगत या वित्तीय जानकारी सहमति के बिना साझा नहीं करूंगा',
    'मैं इस ऐप का उपयोग दूसरों का प्रतिरूपण करने या गलत सूचना फैलाने के लिए नहीं करूंगा',
    'मैं इस ऐप की सुविधाओं का उपयोग धोखाधड़ी, चोरी या अवैध गतिविधियों के लिए नहीं करूंगा',
    'मैं सभी उपयोगकर्ताओं की गोपनीयता और सुरक्षा का सम्मान करूंगा',
    'मैं खतरनाक या अवैध व्यवहार की प्लेटफॉर्म समर्थन को रिपोर्ट करूंगा',
    'मैं समझता हूं कि दुरुपयोग खाता निलंबन या कानूनी कार्रवाई का कारण बन सकता है',
  ],
  'th-TH': [
    'ฉันจะไม่ใช้แอพนี้เพื่อ騷ขัด คุกคาม หรือสร้างความเสียหายต่อบุคคลหรือกลุ่มใดๆ',
    'ฉันจะไม่แชร์ข้อมูลส่วนตัวหรือการเงินของผู้อื่นโดยไม่ได้รับความยินยอม',
    'ฉันจะไม่ใช้แอพนี้เพื่อปลอมตัวเป็นคนอื่นหรือเผยแพร่ข้อมูลที่ไม่จริง',
    'ฉันจะไม่ใช้ประโยชน์จากฟีเจอร์ของแอพนี้สำหรับการฉ้อโกง การปล้น หรือกิจกรรมที่ผิดกฎหมาย',
    'ฉันจะเคารพความเป็นส่วนตัวและความปลอดภัยของผู้ใช้ทั้งหมด',
    'ฉันจะรายงานพฤติกรรมที่เป็นอันตรายหรือผิดกฎหมายให้กับทีมสนับสนุนของแพลตฟอร์ม',
    'ฉันเข้าใจว่าการใช้งานที่ไม่เหมาะสมอาจส่งผลให้บัญชีถูกระงับหรือดำเนินการทางกฎหมาย',
  ],
};

// Translations for key app terms
export const TRANSLATIONS = {
  'dispatch': {
    'en-US': 'Dispatch',
    'ar-SA': 'الإرسالية',
    'es-ES': 'Despacho',
    'pt-BR': 'Despacho',
    'fr-FR': 'Dépêche',
    'de-DE': 'Versand',
    'zh-CN': '调度',
    'ja-JP': '配送',
    'hi-IN': 'प्रेषण',
    'th-TH': 'การจัดส่ง',
  },
  'load': {
    'en-US': 'Load',
    'ar-SA': 'الحمولة',
    'es-ES': 'Carga',
    'pt-BR': 'Carga',
    'fr-FR': 'Chargement',
    'de-DE': 'Ladung',
    'zh-CN': '货物',
    'ja-JP': '荷物',
    'hi-IN': 'भार',
    'th-TH': 'บรรทุก',
  },
  'driver': {
    'en-US': 'Driver',
    'ar-SA': 'السائق',
    'es-ES': 'Conductor',
    'pt-BR': 'Motorista',
    'fr-FR': 'Chauffeur',
    'de-DE': 'Fahrer',
    'zh-CN': '司机',
    'ja-JP': '運転手',
    'hi-IN': 'चालक',
    'th-TH': 'คนขับรถ',
  },
  'danger': {
    'en-US': 'Danger',
    'ar-SA': 'خطر',
    'es-ES': 'Peligro',
    'pt-BR': 'Perigo',
    'fr-FR': 'Danger',
    'de-DE': 'Gefahr',
    'zh-CN': '危险',
    'ja-JP': '危険',
    'hi-IN': 'खतरा',
    'th-TH': 'อันตราย',
  },
  'safe': {
    'en-US': 'Safe',
    'ar-SA': 'آمن',
    'es-ES': 'Seguro',
    'pt-BR': 'Seguro',
    'fr-FR': 'Sûr',
    'de-DE': 'Sicher',
    'zh-CN': '安全',
    'ja-JP': '安全',
    'hi-IN': 'सुरक्षित',
    'th-TH': 'ปลอดภัย',
  },
};

/**
 * Get appropriate greeting based on language and cultural context
 */
export function getLocalizedGreeting(language) {
  return GREETINGS[language] || GREETINGS['en-US'];
}

/**
 * Get cultural context for a language
 */
export function getCulturalContext(language) {
  for (const [context, data] of Object.entries(CULTURAL_CONTEXTS)) {
    if (data.countries.includes(language)) {
      return { context, data };
    }
  }
  return null;
}

/**
 * Get responsible use pledges for a language
 */
export function getResponsibleUsePledges(language) {
  return RESPONSIBLE_USE_PLEDGES[language] || RESPONSIBLE_USE_PLEDGES['en-US'];
}

/**
 * Translate a term based on language
 */
export function translateTerm(term, language) {
  const termKey = term.toLowerCase().replace(/\s+/g, '-');
  if (TRANSLATIONS[termKey] && TRANSLATIONS[termKey][language]) {
    return TRANSLATIONS[termKey][language];
  }
  return term;
}

/**
 * Check if content is culturally sensitive for a language
 */
export function isCulturallySensitive(language, restrictionType) {
  const context = getCulturalContext(language);
  if (!context) return false;
  
  return context.data.restrictions.includes(restrictionType);
}

/**
 * Get holidays/observances for a language region
 */
export function getHolidaysForLanguage(language) {
  const context = getCulturalContext(language);
  if (!context) return [];
  
  return context.data.holidays || [];
}

/**
 * Direction text (RTL for Arabic, Hebrew, etc.)
 */
export function getTextDirection(language) {
  const rtlLanguages = ['ar-SA', 'ar-AE', 'ar-EG', 'ar-MA', 'ar-JO', 'he-IL', 'fa-IR', 'ur-PK'];
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
}

/**
 * Number formatting by locale
 */
export function formatNumber(number, language) {
  const formatter = new Intl.NumberFormat(language, { style: 'decimal' });
  return formatter.format(number);
}

/**
 * Currency formatting by locale
 */
export function formatCurrency(amount, language) {
  const currencyMap = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'en-AU': 'AUD',
    'en-CA': 'CAD',
    'ar-SA': 'SAR',
    'ar-AE': 'AED',
    'es-ES': 'EUR',
    'fr-FR': 'EUR',
    'de-DE': 'EUR',
    'pt-BR': 'BRL',
    'pt-PT': 'EUR',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'hi-IN': 'INR',
    'th-TH': 'THB',
    'he-IL': 'ILS',
  };

  const currency = currencyMap[language] || 'USD';
  const formatter = new Intl.NumberFormat(language, { style: 'currency', currency });
  return formatter.format(amount);
}

/**
 * Date formatting by locale
 */
export function formatDate(date, language) {
  const formatter = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(new Date(date));
}
