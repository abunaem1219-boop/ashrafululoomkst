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
  status?: 'pending' | 'approved' | 'rejected';
  uploadedByUid?: string;
  uploaderName?: string;
  likeCount?: number;
  commentCount?: number;
  rejectionReason?: string;
  likedByMe?: boolean;
}

export interface GalleryComment {
  id: string;
  imageId: string;
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: number;
}

export interface GalleryCategory {
  id: string;
  name: string;
  order: number;
  disabled?: boolean;
}

export interface ModeratorPermissions {
  uid: string;
  canUploadGallery: boolean;
  canEditOwnGallery: boolean;
  canEditOthersGallery: boolean;
  canPublishGallery: boolean;
  canDeleteGallery: boolean;
  canModerateComments: boolean;
  canManageGalleryCategories: boolean;
  canApproveMealRequests: boolean;
}

export type MealRequestType = 'stop' | 'start'; // খানা বন্ধ করতে চাই | খানা চালু করতে চাই
export type MealPeriod = 'breakfast' | 'lunch' | 'dinner'; // সকাল | দুপুর | রাত
export type AffectedMealsSet =
  | 'breakfast_only' // শুধু সকাল
  | 'lunch_only'     // শুধু দুপুর
  | 'dinner_only'    // শুধু রাত
  | 'breakfast_lunch' // সকাল ও দুপুর
  | 'breakfast_dinner' // সকাল ও রাত
  | 'lunch_dinner'   // দুপুর ও রাত
  | 'all_three';      // তিন বেলা

export interface MealRequest {
  id: string;
  studentName: string;
  studentId: string; // 3 or 4 digits
  className: string;
  branch: string;
  requestType: MealRequestType;
  startMealPeriod: MealPeriod;
  affectedMeals: AffectedMealsSet;
  note?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'superseded';
  proposedEffectiveDate: string; // YYYY-MM-DD
  approvedEffectiveDate?: string; // YYYY-MM-DD
  approvedMealPeriod?: MealPeriod;
  rejectionReason?: string;
  submittedAt: number;
  submittedByUid: string;
  reviewedAt?: number;
  reviewedByUid?: string;
  reviewedByName?: string;
}

export interface StudentMealRecord {
  studentId: string;
  studentName: string;
  className: string;
  branch: string;
  verifiedUid?: string;
  isVerified: boolean;
  breakfastActive: boolean;
  lunchActive: boolean;
  dinnerActive: boolean;
  lastUpdated: number;
  lastRequestId?: string;
}

export interface MealAccountingSummary {
  date: string; // YYYY-MM-DD
  isFinalized?: boolean;
  finalizedAt?: number;
  finalizedByUid?: string;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  breakfastStudents: { studentId: string; studentName: string; className: string; branch: string }[];
  lunchStudents: { studentId: string; studentName: string; className: string; branch: string }[];
  dinnerStudents: { studentId: string; studentName: string; className: string; branch: string }[];
}

export interface DepartmentBranch {
  id: string;
  name: string;
}

export interface DepartmentClass {
  id: string;
  name: string;
  branches: DepartmentBranch[];
}

export interface MadrasaDepartment {
  id: string;
  name: string; // 'নূরানী' | 'মক্তব' | 'হিফজ বিভাগ' | 'কিতাব বিভাগ' | 'ফতোয়া বিভাগ'
  code: string;
  order: number;
  classes: DepartmentClass[];
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  userType?: 'guardian' | 'teacher' | 'student' | 'visitor';
  role: 'student' | 'guardian' | 'teacher' | 'alumnus' | 'visitor' | 'moderator' | 'admin';
  isAdmin: boolean;
  isModerator?: boolean;
  isRootAdmin?: boolean;
  department?: string;
  className?: string;
  branch?: string;
  savedRoll?: string;
  studentId?: string;
  studentVerified?: boolean;
  guardianStudentName?: string;
  guardianStudentId?: string;
  teacherDesignation?: string;
  permissions?: ModeratorPermissions;
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
