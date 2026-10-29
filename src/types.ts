export interface Notice {
  id: string;
  title: string;
  type: 'exam' | 'holiday' | 'announcement' | 'admission' | 'general';
  date: string;
  important?: boolean;
  pinned?: boolean;
  description: string;
  attachment?: string;
  updatedAt?: number;
}

export interface SubjectResult {
  name: string;
  marks: number;
  highestMarks?: number;
}

export interface StudentResult {
  id?: string;
  roll: string | number;
  regNo?: string;
  name: string;
  className: string; // e.g. কিতাব বিভাগ / নূরানী বিভাগ
  year: string; // e.g. ২০২৬ / দ্বিতীয় বর্ষ
  examSession?: string;
  jamaat?: string;
  branch?: string;
  subjects: SubjectResult[];
  total: number;
  average: string | number;
  grade: 'মুমতাজ' | 'জায়্যিদ জিদ্দান' | 'জায়্যিদ' | 'মাকবুল' | 'রাসিব' | string;
  gradeClass?: string;
  meritPosition?: number;
  remarks?: string;
  updatedAt?: number;
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone?: string;
  photo?: string;
  qualifications?: string;
  order?: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  date?: number;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: 'student' | 'guardian' | 'teacher' | 'alumnus' | 'visitor' | 'moderator' | 'admin';
  isAdmin: boolean;
  isModerator?: boolean;
  isRootAdmin?: boolean;
  savedRoll?: string;
  bookmarks?: {
    notices?: string[];
    surahs?: number[];
    duas?: string[];
  };
}

export interface SiteSettings {
  resultPublish: {
    enabled: boolean;
    examName?: string;
    publishTimestamp?: number;
  };
  meritSettings?: {
    enabled: boolean;
    count: string;
    type: string;
  };
  tickerNotice?: string;
  madrasaInfo?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    established?: string;
  };
}

export interface PrayerTimeData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sehriEnd: string;
  iftar: string;
}

export interface SurahSummary {
  number: number;
  nameBangla: string;
  nameArabic: string;
  nameEnglish: string;
  totalAyahs: number;
  revelationType: 'মাক্কী' | 'মাদানী';
  meaning: string;
  audioUrl?: string;
}

export interface DuaItem {
  id: string;
  title: string;
  category: 'দৈনন্দিন' | 'সালাত' | 'রমজান ও রোজা' | 'বিপদ-আপদ' | 'সকাল-সন্ধ্যা';
  arabic: string;
  transliteration: string;
  meaning: string;
  reference: string;
}

export interface HadithItem {
  id: string;
  title: string;
  category: 'ঈমান' | 'সালাত' | 'ইলম' | 'আখলাক' | 'রমজান' | 'দান-সদকা';
  arabic?: string;
  bengali: string;
  narrator?: string;
  source: string;
}

export interface AllahName {
  number: number;
  arabic: string;
  transliteration: string;
  meaningBangla: string;
  virtue: string;
}
