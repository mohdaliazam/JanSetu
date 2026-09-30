// Bilingual UI strings for JanSetu
export type Lang = 'en' | 'hi';

const strings = {
  appName: { en: 'JanSetu', hi: 'जनसेतु' },
  tagline: { en: 'Citizen voices. Clearer public priorities.', hi: 'नागरिक आवाज़ें। स्पष्ट सार्वजनिक प्राथमिकताएँ।' },
  syntheticBadge: { en: '⚠ Synthetic hackathon demo', hi: '⚠ सिंथेटिक हैकाथॉन डेमो' },
  reportNeed: { en: 'Report a community need', hi: 'समुदाय की आवश्यकता दर्ज करें' },
  exploreDashboard: { en: 'Explore planning dashboard', hi: 'योजना डैशबोर्ड देखें' },
  selectState: { en: 'Select state', hi: 'राज्य चुनें' },
  selectDistrict: { en: 'Select district', hi: 'ज़िला चुनें' },
  selectLocality: { en: 'Select locality', hi: 'इलाका चुनें' },
  describeNeed: { en: 'Describe the community need', hi: 'समुदाय की आवश्यकता का वर्णन करें' },
  noPersonalInfo: { en: '⚠ Do not enter personal information (name, phone, address, ID numbers)', hi: '⚠ व्यक्तिगत जानकारी न दर्ज करें (नाम, फ़ोन, पता, पहचान संख्या)' },
  submit: { en: 'Submit', hi: 'जमा करें' },
  submitting: { en: 'Submitting...', hi: 'जमा हो रहा है...' },
  confirm: { en: 'Confirm', hi: 'पुष्टि करें' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  retry: { en: 'Retry', hi: 'पुनः प्रयास करें' },
  editAndResubmit: { en: 'Edit and resubmit', hi: 'संपादित करें और पुनः जमा करें' },
  category: { en: 'Category', hi: 'श्रेणी' },
  locality: { en: 'Locality', hi: 'इलाका' },
  urgency: { en: 'Reported urgency', hi: 'रिपोर्ट की गई तात्कालिकता' },
  summary: { en: 'AI Summary (English)', hi: 'AI सारांश (अंग्रेज़ी)' },
  evidenceQuote: { en: 'Evidence quote', hi: 'साक्ष्य उद्धरण' },
  reviewReasons: { en: 'Review reasons', hi: 'समीक्षा कारण' },
  confirmed: { en: 'Confirmed', hi: 'पुष्टि की गई' },
  failed: { en: 'Failed', hi: 'विफल' },
  pending: { en: 'Processing...', hi: 'प्रसंस्करण...' },
  review: { en: 'Needs review', hi: 'समीक्षा आवश्यक' },
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  groups: { en: 'Project groups', hi: 'परियोजना समूह' },
  score: { en: 'Priority score', hi: 'प्राथमिकता स्कोर' },
  reports: { en: 'Reports', hi: 'रिपोर्ट' },
  insufficientData: { en: 'Insufficient data', hi: 'अपर्याप्त डेटा' },
  generateBrief: { en: 'Generate project brief', hi: 'परियोजना संक्षिप्त विवरण बनाएं' },
  exportJson: { en: 'Export JSON', hi: 'JSON निर्यात करें' },
  brief: { en: 'Project brief', hi: 'परियोजना संक्षिप्त विवरण' },
  rationale: { en: 'Rationale', hi: 'तर्काधार' },
  nextSteps: { en: 'Recommended next steps', hi: 'अनुशंसित अगले कदम' },
  caveats: { en: 'Caveats', hi: 'चेतावनियाँ' },
  language: { en: 'Language', hi: 'भाषा' },
  hindi: { en: 'Hindi', hi: 'हिंदी' },
  english: { en: 'English', hi: 'अंग्रेज़ी' },
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...' },
  error: { en: 'An error occurred', hi: 'एक त्रुटि हुई' },
  providerMode: { en: 'AI Mode', hi: 'AI मोड' },
  live: { en: 'Live Gemini', hi: 'लाइव जेमिनी' },
  fixture: { en: 'Fixture (test)', hi: 'फिक्सचर (परीक्षण)' },
  backHome: { en: '← Home', hi: '← मुख्य पृष्ठ' },
  backDashboard: { en: '← Dashboard', hi: '← डैशबोर्ड' },
  charsRemaining: { en: 'characters remaining', hi: 'अक्षर शेष' },
  acknowledged: { en: 'I confirm the category and locality are correct', hi: 'मैं पुष्टि करता/करती हूँ कि श्रेणी और इलाका सही हैं' },
  population: { en: 'Population', hi: 'जनसंख्या' },
  serviceGap: { en: 'Service gap', hi: 'सेवा अंतर' },
  existingPlans: { en: 'Existing plans', hi: 'मौजूदा योजनाएँ' },
  scoreFormula: { en: 'Score formula v1', hi: 'स्कोर फॉर्मूला v1' },
  sources: { en: 'Sources', hi: 'स्रोत' },
  synthetic: { en: 'Synthetic', hi: 'सिंथेटिक' },
  noData: { en: 'No data available', hi: 'कोई डेटा उपलब्ध नहीं' },
  stale: { en: 'Stale — evidence has changed', hi: 'पुराना — साक्ष्य बदल गया है' },
  sessionExpired: { en: 'Demo session expired. Please start a new session.', hi: 'डेमो सत्र समाप्त। कृपया नया सत्र शुरू करें।' },
  newSession: { en: 'Start new session', hi: 'नया सत्र शुरू करें' },
  exampleWater: { en: 'Example: Water supply is unreliable. Please repair the supply system.', hi: 'उदाहरण: हमारे मोहल्ले में पानी नहीं आ रहा है। कृपया पानी की आपूर्ति ठीक कराएं।' },
  insertExample: { en: 'Insert example', hi: 'उदाहरण डालें' },
  categories: {
    en: { water: 'Water', roads: 'Roads', sanitation: 'Sanitation', lighting: 'Lighting', education: 'Education', healthcare_access: 'Healthcare access', other: 'Other' },
    hi: { water: 'पानी', roads: 'सड़कें', sanitation: 'स्वच्छता', lighting: 'रोशनी', education: 'शिक्षा', healthcare_access: 'स्वास्थ्य सेवा', other: 'अन्य' },
  },
  urgencies: {
    en: { routine: 'Routine', elevated: 'Elevated', urgent: 'Urgent' },
    hi: { routine: 'सामान्य', elevated: 'बढ़ी हुई', urgent: 'अत्यावश्यक' },
  },
  planStatuses: {
    en: { proposed: 'Proposed', funded: 'Funded', in_progress: 'In progress', completed: 'Completed' },
    hi: { proposed: 'प्रस्तावित', funded: 'वित्तपोषित', in_progress: 'प्रगति में', completed: 'पूर्ण' },
  },
} as const;

export type StringKey = keyof typeof strings;

export function t(key: StringKey, lang: Lang): string {
  const value = strings[key];
  if (typeof value === 'object' && 'en' in value && typeof value.en === 'string') {
    return (value as Record<Lang, string>)[lang];
  }
  return key;
}

export function tCategory(category: string, lang: Lang): string {
  const cats = strings.categories[lang] as Record<string, string>;
  return cats[category] || category;
}

export function tUrgency(urgency: string, lang: Lang): string {
  const urgs = strings.urgencies[lang] as Record<string, string>;
  return urgs[urgency] || urgency;
}

export function tPlanStatus(status: string, lang: Lang): string {
  const statuses = strings.planStatuses[lang] as Record<string, string>;
  return statuses[status] || status;
}

export default strings;
