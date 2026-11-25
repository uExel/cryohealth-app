/** Interface text in English and Urdu, for the public hazard path.
 *
 *  Interface labels only. Dosing, diagnosis and protocol text must never be added here: it
 *  comes from lookup tables and reviewed content, never from a drafted string
 *  (PRD §9 R5). Alert titles, bodies, checklists and chips arrive from the API already
 *  written; this file does not touch them.
 *
 *  The Urdu is a draft for review by a native speaker. Rules the tests enforce: every English
 *  key has an Urdu one with the same `{placeholders}`, Urdu strings contain no ASCII digits
 *  (numbers are written in Urdu digits, or passed in through a placeholder), and every Urdu
 *  string is written in Arabic script except the few that are deliberately Latin. */
import type { Lang } from '../design/theme';
import { formatNumber } from './i18n';

export const en = {
  // --- app bar, banner, freshness, SOS sheet
  'a11y.back': 'Back',
  'a11y.settings': 'Settings',
  'a11y.switchLanguage': 'Switch language',
  'a11y.sos': 'SOS — emergency options',
  'a11y.close': 'Close',
  'a11y.tier': 'Hazard tier: {tier}',
  'a11y.unread': 'Unread. {title}',
  'a11y.unreadCriticalOne': '{n} unread critical alert',
  'a11y.unreadCriticalMany': '{n} unread critical alerts',
  'banner.offline': 'Offline — showing saved information',
  'banner.syncing': 'Syncing…',
  'banner.failed': 'Sync failed — tap to retry',
  'banner.stale': 'Data is 3 days old',
  'banner.syncNow': 'SYNC NOW',
  'fresh.live': 'Live',
  'fresh.updating': 'Updating',
  'fresh.stale': 'Old data',
  'fresh.failed': 'May be old',
  'fresh.saved': 'Saved copy',
  'sos.title': 'Emergency',
  // {n} is the number as a string, so a phone number is never grouped as "1,122".
  'sos.call': 'Call rescue {n}',
  'sos.callNote': 'Needs signal — dials as soon as you have any network',

  // --- shared words and time
  'place.gb': 'Gilgit-Baltistan',
  'unit.m': 'm',
  'time.justNow': 'Just now',
  'time.minutesAgo': '{n}m ago',
  'time.hoursAgo': '{n}h ago',
  'time.daysAgo': '{n}d ago',
  'common.stale': 'stale',
  'common.updated': 'Updated',
  'common.separator': ', ',

  // --- tabs
  'tab.home': 'HOME',
  'tab.alerts': 'ALERTS',
  'tab.health': 'HEALTH',
  'tab.lakes': 'LAKES',

  // --- home
  'home.hazardTier': 'HAZARD TIER',
  'home.noAdvisory': 'No active advisory for this lake.',
  'home.atRisk': 'Most at-risk lakes',
  'home.noLakes': 'No lake data on this phone yet. Pull down to sync when you have signal.',
  'home.queue': 'YOUR QUEUE',
  'home.queueOne': '{n} case waiting to sync',
  'home.queueMany': '{n} cases waiting to sync',
  'home.queueNote': 'Saved on this phone. Nothing is lost.',
  'home.newCase': 'New case',

  // --- lakes
  'lakes.title': 'Lakes',
  'lakes.fresh': 'Tiers current as of last sync · {time}',
  'lakes.section': 'Monitored lakes · by hazard tier',

  // --- alerts list
  'alerts.title': 'Alerts',
  'alerts.sub': 'All monitored lakes',
  'alerts.fresh': 'Feed updated {time}',
  'alerts.none': 'No alerts yet',
  'alerts.empty': 'No alerts on this phone yet. Pull down to sync when you have signal.',
  'alerts.cleared': 'CLEARED',
  'alerts.new': 'NEW',

  // --- alert detail
  'alert.title': 'Alert',
  'alert.missing': "This alert isn't on this phone yet. Connect to sync.",
  'alert.area': 'Area',
  'alert.window': 'Window',
  'alert.doNow': 'Do these now',

  // --- critical interstitial
  'critical.where': 'WHERE',
  'critical.when': 'WHEN',
  'critical.take': 'TAKE',
  'critical.honest': 'This warning may not have made a sound if your phone is silent.',
  'critical.seeWhat': 'See what to do',
  'critical.seen': 'I have seen this',

  // --- splash
  'splash.tagline': 'Glacier hazard warnings and health guidance for Gilgit-Baltistan.',
  'splash.offline': 'Offline — starting with saved data',
  'splash.checking': 'Checking alerts…',

  // --- welcome
  'welcome.title': 'Alerts work without an account',
  'welcome.body': 'CryoHealth warns you about glacial lakes across Gilgit-Baltistan. No phone number, no sign up.',
  'welcome.note': 'An account is only for health workers who record cases.',
  'welcome.start': 'Start with alerts',
  'welcome.login': 'Health worker log in',

  // --- notification permission
  'permission.title': 'A flood warning must reach you at night',
  'permission.body':
    'CryoHealth sends important hazard alerts for monitored lakes. You can turn notifications off later in Settings.',
  'permission.silentIos': 'Focus and Silent mode settings may silence notifications.',
  'permission.silent': 'Your notification and Do Not Disturb settings may silence alerts.',
  'permission.swipe':
    'Some phones stop an app when you swipe it away. To keep alerts coming, open Settings later and choose “Open app settings” under Hazard notifications.',
  'permission.denied': 'Permission was not granted. You can enable notifications later in Settings.',
  'permission.registerFail': 'Could not register this device for alerts.',
  'permission.updateFail': 'Could not update notification settings.',
  'permission.working': 'Setting up alerts…',
  'permission.allow': 'Allow alerts',
  'permission.later': 'Not now — I will check each morning',

  // --- battery prompt
  'battery.title': 'Keep flood warnings reaching you',
  'battery.body':
    'Some phones stop an app once it is closed or swiped away. CryoHealth cannot warn you then. Allow it to run in the background now.',
  'battery.steps':
    '1. Tap Open battery settings.\n2. Choose CryoHealth.\n3. Select Don’t optimize (or Unrestricted).\n4. Come back and tap Continue.',
  'battery.open': 'Open battery settings',
  'battery.continue': 'Continue',

  // --- settings
  'settings.title': 'Settings',
  'settings.noAccount': 'No account',
  'settings.worker': 'Health worker',
  'settings.language': 'Language',
  'settings.appearance': 'Appearance',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.system': 'System',
  'settings.localData': 'Local data',
  'settings.lakes': 'Lakes',
  'settings.alerts': 'Alerts',
  'settings.protocols': 'Protocols',
  'settings.synced': '{n} synced',
  'settings.hazardNotifications': 'Hazard notifications',
  'settings.push': 'Push alerts',
  'settings.pushUpdating': 'Updating…',
  'settings.pushOn': 'Enabled on this device',
  'settings.pushOff': 'Disabled on this device',
  'settings.keepWorking': 'Keep alerts working when the app is closed',
  'settings.keepWorkingBody':
    'Some phones stop an app when you swipe it away, and a stopped app cannot receive alerts. In app settings, open Battery and choose “Don’t optimize” or “Unrestricted” for CryoHealth.',
  'settings.openAppSettings': 'Open app settings',
  'settings.readFail': 'Could not read notification settings.',
  'settings.notGranted': 'Notification permission was not granted.',
  'settings.openFail': 'Could not open app settings.',
  'settings.account': 'Account',
  'settings.signOut': 'Sign out',
  'settings.logIn': 'Log in (health workers only)',
} as const;

export type StringKey = keyof typeof en;

export const ur: Record<StringKey, string> = {
  'a11y.back': 'واپس',
  'a11y.settings': 'ترتیبات',
  'a11y.switchLanguage': 'زبان تبدیل کریں',
  'a11y.sos': 'SOS — ہنگامی اختیارات',
  'a11y.close': 'بند کریں',
  'a11y.tier': 'خطرے کا درجہ: {tier}',
  'a11y.unread': 'نہ کھولا گیا۔ {title}',
  'a11y.unreadCriticalOne': '{n} نہ کھولا گیا بحرانی الرٹ',
  'a11y.unreadCriticalMany': '{n} نہ کھولے گئے بحرانی الرٹ',
  'banner.offline': 'آف لائن — محفوظ شدہ معلومات دکھائی جا رہی ہیں',
  'banner.syncing': 'سنک ہو رہا ہے…',
  'banner.failed': 'سنک ناکام — دوبارہ کوشش کے لیے دبائیں',
  'banner.stale': 'ڈیٹا ۳ دن پرانا ہے',
  'banner.syncNow': 'ابھی سنک کریں',
  'fresh.live': 'براہِ راست',
  'fresh.updating': 'اپ ڈیٹ ہو رہا ہے',
  'fresh.stale': 'پرانا ڈیٹا',
  'fresh.failed': 'پرانا ہو سکتا ہے',
  'fresh.saved': 'محفوظ کاپی',
  'sos.title': 'ہنگامی مدد',
  'sos.call': 'ریسکیو {n} کو کال کریں',
  'sos.callNote': 'سگنل درکار ہے — نیٹ ورک ملتے ہی کال ہو جائے گی',

  'place.gb': 'گلگت بلتستان',
  'unit.m': 'میٹر',
  'time.justNow': 'ابھی',
  'time.minutesAgo': '{n} منٹ پہلے',
  'time.hoursAgo': '{n} گھنٹے پہلے',
  'time.daysAgo': '{n} دن پہلے',
  'common.stale': 'پرانا',
  'common.updated': 'تازہ کاری',
  'common.separator': '، ',

  'tab.home': 'ہوم',
  'tab.alerts': 'الرٹس',
  'tab.health': 'صحت',
  'tab.lakes': 'جھیلیں',

  'home.hazardTier': 'خطرے کا درجہ',
  'home.noAdvisory': 'اس جھیل کے لیے کوئی فعال وارننگ نہیں۔',
  'home.atRisk': 'سب سے زیادہ خطرے والی جھیلیں',
  'home.noLakes': 'اس فون پر ابھی جھیلوں کا ڈیٹا نہیں ہے۔ سگنل ملنے پر نیچے کھینچ کر سنک کریں۔',
  'home.queue': 'آپ کی قطار',
  'home.queueOne': '{n} کیس سنک کا منتظر ہے',
  'home.queueMany': '{n} کیس سنک کے منتظر ہیں',
  'home.queueNote': 'اس فون میں محفوظ ہے۔ کچھ ضائع نہیں ہوگا۔',
  'home.newCase': 'نیا کیس',

  'lakes.title': 'جھیلیں',
  'lakes.fresh': 'درجے آخری سنک کے مطابق · {time}',
  'lakes.section': 'زیرِ نگرانی جھیلیں · خطرے کے درجے کے مطابق',

  'alerts.title': 'الرٹس',
  'alerts.sub': 'تمام زیرِ نگرانی جھیلیں',
  'alerts.fresh': 'فہرست اپ ڈیٹ: {time}',
  'alerts.none': 'ابھی کوئی الرٹ نہیں',
  'alerts.empty': 'اس فون پر ابھی کوئی الرٹ نہیں ہے۔ سگنل ملنے پر نیچے کھینچ کر سنک کریں۔',
  'alerts.cleared': 'ختم',
  'alerts.new': 'نیا',

  'alert.title': 'الرٹ',
  'alert.missing': 'یہ الرٹ ابھی اس فون پر نہیں ہے۔ سنک کرنے کے لیے انٹرنیٹ سے جڑیں۔',
  'alert.area': 'علاقہ',
  'alert.window': 'وقت کی حد',
  'alert.doNow': 'ابھی یہ کریں',

  'critical.where': 'کہاں',
  'critical.when': 'کب',
  'critical.take': 'کیا کریں',
  'critical.honest': 'اگر آپ کا فون خاموش ہے تو ہو سکتا ہے یہ وارننگ آواز کے ساتھ نہ آئی ہو۔',
  'critical.seeWhat': 'دیکھیں کیا کرنا ہے',
  'critical.seen': 'میں نے دیکھ لیا',

  'splash.tagline': 'گلگت بلتستان کے لیے گلیشیائی خطرے کی وارننگ اور صحت کی رہنمائی۔',
  'splash.offline': 'آف لائن — محفوظ ڈیٹا کے ساتھ شروع ہو رہا ہے',
  'splash.checking': 'الرٹس چیک ہو رہے ہیں…',

  'welcome.title': 'الرٹس بغیر اکاؤنٹ کے کام کرتے ہیں',
  'welcome.body':
    'کرائیو ہیلتھ آپ کو گلگت بلتستان کی گلیشیائی جھیلوں کے خطرے سے خبردار کرتا ہے۔ نہ فون نمبر، نہ سائن اپ۔',
  'welcome.note': 'اکاؤنٹ صرف ان ہیلتھ ورکرز کے لیے ہے جو کیس درج کرتے ہیں۔',
  'welcome.start': 'الرٹس کے ساتھ شروع کریں',
  'welcome.login': 'ہیلتھ ورکر لاگ اِن',

  'permission.title': 'سیلاب کی وارننگ رات کو بھی آپ تک پہنچنی چاہیے',
  'permission.body':
    'کرائیو ہیلتھ زیرِ نگرانی جھیلوں کے اہم خطرے کے الرٹ بھیجتا ہے۔ آپ بعد میں ترتیبات میں اطلاعات بند کر سکتے ہیں۔',
  'permission.silentIos': 'فوکس اور سائلنٹ موڈ کی ترتیبات اطلاعات کو خاموش کر سکتی ہیں۔',
  'permission.silent': 'آپ کی اطلاعات اور ڈسٹرب نہ کریں کی ترتیبات الرٹس کو خاموش کر سکتی ہیں۔',
  'permission.swipe':
    'کچھ فون ایپ کو سوائپ کر کے ہٹانے پر اسے بند کر دیتے ہیں۔ الرٹ آتے رہنے کے لیے بعد میں ترتیبات کھولیں اور خطرے کی اطلاعات کے تحت “ایپ کی ترتیبات کھولیں” چنیں۔',
  'permission.denied': 'اجازت نہیں دی گئی۔ آپ بعد میں ترتیبات میں اطلاعات فعال کر سکتے ہیں۔',
  'permission.registerFail': 'اس ڈیوائس کو الرٹس کے لیے رجسٹر نہیں کیا جا سکا۔',
  'permission.updateFail': 'اطلاعات کی ترتیبات تبدیل نہیں ہو سکیں۔',
  'permission.working': 'الرٹس تیار ہو رہے ہیں…',
  'permission.allow': 'الرٹس کی اجازت دیں',
  'permission.later': 'ابھی نہیں — ہر صبح خود دیکھ لوں گا/گی',

  'battery.title': 'سیلاب کی وارننگ آپ تک پہنچتی رہے',
  'battery.body':
    'کچھ فون ایپ کو بند یا سوائپ کرنے پر روک دیتے ہیں۔ تب کرائیو ہیلتھ آپ کو خبردار نہیں کر سکتا۔ اب اسے بیک گراؤنڈ میں چلنے کی اجازت دیں۔',
  'battery.steps':
    '۱۔ “بیٹری کی ترتیبات کھولیں” دبائیں۔\n۲۔ کرائیو ہیلتھ منتخب کریں۔\n۳۔ Don’t optimize (یا Unrestricted) چنیں۔\n۴۔ واپس آ کر “جاری رکھیں” دبائیں۔',
  'battery.open': 'بیٹری کی ترتیبات کھولیں',
  'battery.continue': 'جاری رکھیں',

  'settings.title': 'ترتیبات',
  'settings.noAccount': 'کوئی اکاؤنٹ نہیں',
  'settings.worker': 'ہیلتھ ورکر',
  'settings.language': 'زبان',
  'settings.appearance': 'ظاہری شکل',
  'settings.light': 'روشن',
  'settings.dark': 'گہرا',
  'settings.system': 'سسٹم',
  'settings.localData': 'مقامی ڈیٹا',
  'settings.lakes': 'جھیلیں',
  'settings.alerts': 'الرٹس',
  'settings.protocols': 'پروٹوکول',
  'settings.synced': '{n} سنک ہو چکے',
  'settings.hazardNotifications': 'خطرے کی اطلاعات',
  'settings.push': 'الرٹ اطلاعات',
  'settings.pushUpdating': 'اپ ڈیٹ ہو رہا ہے…',
  'settings.pushOn': 'اس ڈیوائس پر فعال',
  'settings.pushOff': 'اس ڈیوائس پر غیر فعال',
  'settings.keepWorking': 'ایپ بند ہونے پر بھی الرٹ آتے رہیں',
  'settings.keepWorkingBody':
    'کچھ فون ایپ کو سوائپ کر کے ہٹانے پر اسے روک دیتے ہیں، اور رکی ہوئی ایپ الرٹ وصول نہیں کر سکتی۔ ایپ کی ترتیبات میں بیٹری کھولیں اور کرائیو ہیلتھ کے لیے “Don’t optimize” یا “Unrestricted” چنیں۔',
  'settings.openAppSettings': 'ایپ کی ترتیبات کھولیں',
  'settings.readFail': 'اطلاعات کی ترتیبات پڑھی نہیں جا سکیں۔',
  'settings.notGranted': 'اطلاعات کی اجازت نہیں دی گئی۔',
  'settings.openFail': 'ایپ کی ترتیبات کھولی نہیں جا سکیں۔',
  'settings.account': 'اکاؤنٹ',
  'settings.signOut': 'سائن آؤٹ',
  'settings.logIn': 'لاگ اِن (صرف ہیلتھ ورکرز کے لیے)',
};

export type StringVars = Record<string, string | number>;

/** Looks up `key` in `lang`. `{name}` placeholders are filled from `vars`: a number is written in
 *  the language's own digits, a string is inserted as is (so pass already-localized text). A
 *  missing key can only happen through a cast, but falls back to English, then to the key, so
 *  the screen never shows nothing. */
export const translate = (lang: Lang, key: StringKey, vars?: StringVars): string => {
  const table: Record<string, string> = lang === 'ur' ? ur : en;
  const template = table[key] ?? (en as Record<string, string>)[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = vars[name];
    if (value === undefined) return whole;
    return typeof value === 'number' ? formatNumber(value, lang) : value;
  });
};
