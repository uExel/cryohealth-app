/**
 * Static demo data matching the design reference (CryoHealth Screen.dc.html).
 * Replaced by the offline store + sync engine in the G1 milestone work.
 */
import { Tier } from '../design/theme';

export type Lake = {
  id: string;
  name: string;
  nameUr: string;
  detail: string;
  detailUr: string;
  mapDetail: string;
  tier: Tier;
};

export const LAKES: Lake[] = [
  { id: 'shishper', name: 'Shishper Lake', nameUr: 'شیشپر جھیل', detail: '4.2 km · volume rising 3 days', detailUr: '۴.۲ کلومیٹر · پانی بڑھ رہا ہے', mapDetail: '4.2 km NW · 2,750 m · rising', tier: 'high' },
  { id: 'passu', name: 'Passu Glacier Pond', nameUr: 'پاسو جھیل', detail: '12 km · normal', detailUr: '۱۲ کلومیٹر · معمول', mapDetail: '12 km N · 2,480 m · stable', tier: 'normal' },
  { id: 'khurdopin', name: 'Khurdopin Lake', nameUr: 'خردوپن جھیل', detail: '31 km · stable', detailUr: '۳۱ کلومیٹر · مستحکم', mapDetail: '31 km NE · 3,610 m · stable', tier: 'watch' },
  { id: 'badswat', name: 'Badswat', nameUr: 'بدسوات', detail: '88 km · stable', detailUr: '۸۸ کلومیٹر · مستحکم', mapDetail: '88 km W · 2,900 m · stable', tier: 'normal' },
];

export type Alert = {
  id: string;
  tier: Tier;
  tag?: string;
  when: string;
  title: string;
  place: string;
  chips: string[];
  cleared?: boolean;
  acked?: string;
};

export const ALERTS: Alert[] = [
  {
    id: '1', tier: 'critical', tag: 'GLOF', when: '2h ago',
    title: 'Shishper Lake outburst likely tonight',
    place: 'Hassanabad nala · Aliabad, Hunza',
    chips: ['Impact 18:00–02:00', 'Move to high ground'],
  },
  {
    id: '2', tier: 'high', when: 'Yesterday',
    title: 'Meltwater surge in Hassanabad',
    place: 'Hassanabad nala',
    chips: ['Avoid the nala 12:00–18:00 daily'],
    acked: 'Acknowledged · 8 households warned',
  },
  {
    id: '3', tier: 'watch', when: '3 days ago', cleared: true,
    title: 'Khurdopin drainage slowing',
    place: 'Shimshal valley',
    chips: [],
  },
];

export const ALERT_DETAIL = {
  id: '1',
  badge: 'CRITICAL · GLOF',
  title: 'Shishper Lake outburst likely tonight',
  facts: [
    ['Area', 'Hassanabad'],
    ['Window', '18:00 – 02:00'],
    ['Source', 'Sentinel-1 · 4 Aug'],
    ['Confidence', 'High'],
  ] as [string, string][],
  checklist: [
    'Move people and animals above the flood mark',
    'Fill clean water containers now',
    'Keep the KKH bridge route clear for rescue',
  ],
};

export const CRITICAL = {
  head: 'MOVE TO HIGH GROUND NOW',
  headUr: 'فوراً اونچی جگہ پر جائیں',
  rows: [
    ['WHERE', 'Hassanabad nala, Aliabad'],
    ['WHEN', 'Tonight 18:00 – 02:00'],
    ['TAKE', 'People, animals, water, papers'],
  ] as [string, string][],
  honest: 'This warning may not have made a sound if your phone is silent.',
};

export type Lesson = {
  id: string;
  cat: string;
  isNew?: boolean;
  title: string;
  state: 'done' | 'progress' | 'none' | 'evicted';
  size: string;
};

export const LESSONS: Lesson[] = [
  { id: 'l1', cat: 'GLOF', isNew: true, title: 'Reading the river: early signs of an outburst', state: 'done', size: '2.1 MB' },
  { id: 'l2', cat: 'Cold', title: 'Hypothermia in children: warm them safely', state: 'none', size: '1.4 MB' },
  { id: 'l3', cat: 'Water', title: 'Safe water after a flood', state: 'progress', size: '38% · paused' },
  { id: 'l4', cat: 'Earthquake', title: 'Removed by your phone to free space', state: 'evicted', size: '1.8 MB' },
];

/** Assistant entry chips */
export const COMMON_COMPLAINTS = ['Child breathing fast', 'Watery diarrhoea', 'Fever 3 days', 'Very cold, shivering'];

export const VALLEYS = ['Hunza · Hassanabad', 'Nagar · Hoper'];

export const STAMP = { en: 'Updated 4 hours ago', ur: 'آخری اپ ڈیٹ: ۴ گھنٹے پہلے' };
