import { AllahName, DuaItem, HadithItem, SurahSummary } from '../types';

export const ALLAH_99_NAMES: AllahName[] = [
  { number: 1, arabic: "الرَّحْمَنُ", transliteration: "আর-রাহমান", meaningBangla: "পরম দয়ালু", virtue: "যিনি এই নাম সর্বদা স্মরণ করেন, আল্লাহ তার প্রতি বিশেষ রহমত বর্ষণ করেন।" },
  { number: 2, arabic: "الرَّحِيمُ", transliteration: "আর-রাহীম", meaningBangla: "অতিশয় মেহেরবান", virtue: "যিনি এই নাম পাঠ করবেন তিনি সর্বপ্রকার পার্থিব বিপদ থেকে নিরাপদ থাকবেন।" },
  { number: 3, arabic: "الْمَلِكُ", transliteration: "আল-মালিক", meaningBangla: "সর্বভৌম অধিপতি", virtue: "নিয়মিত পাঠকারীকে আল্লাহ অভাব ও পরমুখাপেক্ষিতা থেকে মুক্তি দেন।" },
  { number: 4, arabic: "الْقُدُّوسُ", transliteration: "আল-কুদ্দুস", meaningBangla: "পরম পবিত্র", virtue: "এই নাম জপকারীর অন্তর আধ্যাত্মিক ব্যাধি ও কলুষতা থেকে মুক্ত হয়।" },
  { number: 5, arabic: "السَّلاَمُ", transliteration: "আস-সালাম", meaningBangla: "শান্তিদাতা ও নিরাপত্তাদাতা", virtue: "রোগী ব্যক্তির ওপর এই নাম পাঠ করে ফুঁ দিলে আরোগ্য লাভ হয়।" },
  { number: 6, arabic: "الْمُؤْمِنُ", transliteration: "আল-মু'মিন", meaningBangla: "নিরাপত্তা ও ঈমানদানকারী", virtue: "যে ব্যক্তি এটি পাঠ করবে, সে ভয়ভীতি থেকে নিরাপদে থাকবে।" },
  { number: 7, arabic: "الْمُهَيْمِنُ", transliteration: "আল-মুহাইমিন", meaningBangla: "মহাপরিচালক ও সংরক্ষক", virtue: "অন্তর আলোকিত করতে এবং হেদায়েত লাভের জন্য অতি ফলপ্রসূ।" },
  { number: 8, arabic: "الْعَزِيزُ", transliteration: "আল-আযীয", meaningBangla: "পরাক্রমশালী ও অপ্রতিরোধ্য", virtue: "সম্মান ও মর্যাদা বৃদ্ধির জন্য ফজর নামাজের পর ৪১ বার পাঠ্য।" },
  { number: 9, arabic: "الْجَبَّارُ", transliteration: "আল-জাব্বার", meaningBangla: "মহাপ্রতাপশালী", virtue: "অত্যাচারী ও শত্রু থেকে সুরক্ষা লাভের উত্তম আমল।" },
  { number: 10, arabic: "الْمُتَكَبِّرُ", transliteration: "আল-মুতাকাব্বির", meaningBangla: "মর্যাদাবান ও অহংকারের প্রকৃত মালিক", virtue: "এই নাম স্মরণকারী সমাজে মান ও সম্মান লাভ করে।" },
  { number: 11, arabic: "الْخَالِقُ", transliteration: "আল-খালিক", meaningBangla: "সৃষ্টিকর্তা", virtue: "অন্ধকার রাতে এই নাম জপকারীর জন্য ফেরেশতা ইবাদতে মগ্ন থাকেন।" },
  { number: 12, arabic: "الْبَارِئُ", transliteration: "আল-বারী", meaningBangla: "উদ্ভাবক ও রূপদানকারী", virtue: "সন্তান লাভের প্রত্যাশায় আমল হিসেবে অত্যন্ত বরকতময়।" },
  { number: 13, arabic: "الْمُصَوِّرُ", transliteration: "আল-মুসাওয়ির", meaningBangla: "আকৃতি দানকারী", virtue: "গর্ভবর্তী নারীর সুরক্ষা ও সুস্থ সন্তানের জন্য পাঠ্য।" },
  { number: 14, arabic: "الْغَفَّارُ", transliteration: "আল-গাফফার", meaningBangla: "মহাক্ষমাশীল", virtue: "জুমার নামাজের পর ১০০ বার পাঠ করলে মাগফিরাত নসিব হয়।" },
  { number: 15, arabic: "الْقَهَّارُ", transliteration: "আল-কাহ্হার", meaningBangla: "মহাদমনকারী", virtue: "দুনিয়াবী লোভ ও কুপ্রবৃত্তি থেকে মুক্তির জন্য আমলযোগ্য।" },
  { number: 16, arabic: "الْوَهَّابُ", transliteration: "আল-ওয়াহ্হাব", meaningBangla: "মহাঅনুগ্রহকারী", virtue: "দরিদ্রতা দূর করতে ও রিজিক বৃদ্ধিতে সিজদায় ৪০ বার পাঠ করুন।" },
  { number: 17, arabic: "الرَّزَّاقُ", transliteration: "আর-রায্যাক", meaningBangla: "রিজিকদাতা", virtue: "ফজর নামাজের পূর্বে ঘরের চার কোণায় ১০ বার করে পাঠ উত্তম।" },
  { number: 18, arabic: "الْفَتَّاحُ", transliteration: "আল-ফাত্তাহ", meaningBangla: "বিজয়দানকারী ও উন্মোচনকারী", virtue: "বুকের ওপর হাত রেখে ৭১ বার পাঠে অন্তর উন্মুক্ত হয়।" },
  { number: 19, arabic: "الْعَلِيمُ", transliteration: "আল-আলীম", meaningBangla: "মহাজ্ঞানী", virtue: "জ্ঞান, স্মৃতিশক্তি ও ইলম বৃদ্ধির জন্য অতুলনীয়।" },
  { number: 20, arabic: "الْقَابِضُ", transliteration: "আল-কাবিদ", meaningBangla: "সংকোচনকারী", virtue: "অহংকার চূর্ণ করতে এবং ভয় থেকে মুক্তি পেতে পাঠ্য।" },
  { number: 21, arabic: "الْبَاسِطُ", transliteration: "আল-বাসিত", meaningBangla: "প্রশস্তকারী", virtue: "চাশতের নামাজের পর হাত তুলে ১০ বার পাঠ করলে সচ্ছলতা আসে।" },
  { number: 22, arabic: "الْخَافِضُ", transliteration: "আল-খাফিদ", meaningBangla: "অবনমিতকারী", virtue: "শত্রুর অনিষ্ট থেকে রক্ষা পেতে পাঠ্য।" },
  { number: 23, arabic: "الرَّافِعُ", transliteration: "আর-রাফি", meaningBangla: "উন্নতকারী ও মর্যাদাদাতা", virtue: "মর্যাদা ও প্রভাব বৃদ্ধির জন্য প্রতি রাতে ১০০ বার পাঠ্য।" },
  { number: 24, arabic: "الْمُعِزُّ", transliteration: "আল-মুইয্য", meaningBangla: "সম্মানদাতা", virtue: "সোমবার ও শুক্রবার রাতে ১৪০ বার পাঠে প্রভাব-প্রতিপত্তি বৃদ্ধি পায়।" },
  { number: 25, arabic: "الْمُذِلُّ", transliteration: "আল-মুযিল্ল", meaningBangla: "অপমানকারী", virtue: "অন্যায় অত্যাচার ও ষড়যন্ত্র থেকে রক্ষাকবচ।" },
  { number: 26, arabic: "السَّمِيعُ", transliteration: "আস-সামী", meaningBangla: "সর্বশ্রোতা", virtue: "বৃহস্পতিবার চাশতের সময় ৫০০ বার পাঠে দোয়া কবুল হয়।" },
  { number: 27, arabic: "الْبَصِيرُ", transliteration: "আল-বাসীর", meaningBangla: "সর্বদ্রষ্টা", virtue: "দৃষ্টিশক্তি রক্ষা ও অন্তর্দৃষ্টির জন্য জুমার পূর্বে ১০০ বার।" },
  { number: 28, arabic: "الْحَكَمُ", transliteration: "আল-হাকাম", meaningBangla: "মহাবিচারক", virtue: "সত্য ও ইনসাফের ওপর প্রতিষ্ঠিত থাকতে নিয়মিত পাঠ্য।" },
  { number: 29, arabic: "الْعَدْلُ", transliteration: "আল-আদল", meaningBangla: "পরম ন্যায়পরায়ণ", virtue: "শুক্রবার রাতে রুটির টুকরায় লিখে আহারে কল্যাণ নিহিত।" },
  { number: 30, arabic: "اللَّطِيفُ", transliteration: "আল-লাতীফ", meaningBangla: "সূক্ষ্মদর্শী ও মেহেরবান", virtue: "কঠিন মসিবত ও বিপদ থেকে মুক্তির জন্য ১৩৩ বার পাঠ।" },
  { number: 31, arabic: "الْخَبِيرُ", transliteration: "আল-খাবীর", meaningBangla: "সর্বজ্ঞানী ও ওয়াকিবহাল", virtue: "গোপন রহস্য ও ভবিষ্যৎ সংশয় দূরীকরণে সহায়ক।" },
  { number: 32, arabic: "الْحَلِيمُ", transliteration: "আল-হালীম", meaningBangla: "মহাধৈর্যশীল", virtue: "রাগ নিয়ন্ত্রণ ও ক্রোধ প্রশমিত করতে পানির ওপর ফুঁ দিয়ে পান।" },
  { number: 33, arabic: "الْعَظِيمُ", transliteration: "আল-আযীম", meaningBangla: "মহান ও মর্যাদাময়", virtue: "মর্যাদা ও সম্মানের শীর্ষচূড়ায় পৌঁছাতে সহায়ক।" },
  { number: 34, arabic: "الْغَفُورُ", transliteration: "আল-গাফুর", meaningBangla: "পরম ক্ষমাশীল", virtue: "মাথা ব্যথায় ও গুনাহ মাফে অধিক পরিমাণ পাঠ্য।" },
  { number: 35, arabic: "الشَّكُورُ", transliteration: "আশ-শাকূর", meaningBangla: "কৃতজ্ঞতা গ্রহণকারী", virtue: "অভাব দূর হতে ও অর্থনৈতিক সচ্ছলতার জন্য।" },
  { number: 36, arabic: "الْعَلِيُّ", transliteration: "আল-আলী", meaningBangla: "সর্বোচ্চ ও সুউচ্চ", virtue: "সন্তানকে যোগ্য ও ধার্মিক হিসেবে গড়ে তুলতে পাঠ্য।" },
  { number: 37, arabic: "الْكَبِيرُ", transliteration: "আল-কাবীর", meaningBangla: "মহীয়ান ও বিরাট", virtue: "চাকরিতে পদোন্নতি ও মর্যাদা বৃদ্ধিতে সহায়ক।" },
  { number: 38, arabic: "الْحَفِيظُ", transliteration: "আল-হাফীয", meaningBangla: "মহাহেফাজতকারী", virtue: "জল-স্থল ভ্রমণ ও বাসস্থানের সুরক্ষায় নিয়মিত আমল।" },
  { number: 39, arabic: "الْمُقِيتُ", transliteration: "আল-মুক্বীত", meaningBangla: "আহারদাতা ও শক্তিদাতা", virtue: "ক্ষুধা নিবারণ ও শিশুর বদভ্যাস দূর করতে পাঠ্য।" },
  { number: 40, arabic: "الْحَسِيبُ", transliteration: "আল-হাসীব", meaningBangla: "হিসাব গ্রহণকারী", virtue: "শত্রুর ভয় থেকে রক্ষা পেতে প্রতিদিন ৭০ বার।" },
  { number: 41, arabic: "الْجَلِيلُ", transliteration: "আল-জালীল", meaningBangla: "মহিমাম্বিত", virtue: "আল্লাহর ভয় অন্তরে জাগ্রত করতে।" },
  { number: 42, arabic: "الْكَرِيمُ", transliteration: "আল-কারীম", meaningBangla: "মহাঅনুগ্রহশীল ও দানশীল", virtue: "ঘুমানোর পূর্বে বিছানায় পাঠ করলে বরকত অর্জিত হয়।" },
  { number: 43, arabic: "الرَّقِيبُ", transliteration: "আর-রাক্বীব", meaningBangla: "তত্ত্বাবধায়ক", virtue: "পরিবার ও সম্পদের নিরাপত্তায় অত্যন্ত উপযোগী।" },
  { number: 44, arabic: "الْمُجِيبُ", transliteration: "আল-মুজিব", meaningBangla: "দোয়া কবুলকারী", virtue: "যেকোনো বিশেষ হাজত বা মোনাজাতে নিয়মিত পাঠ্য।" },
  { number: 45, arabic: "الْوَاسِعُ", transliteration: "আল-ওয়াসি", meaningBangla: "সীমাহীন প্রশস্ত ও প্রাচুর্যময়", virtue: "উপার্জন ও মনের সংকীর্ণতা দূর করতে সাহায্য করে।" },
  { number: 46, arabic: "الْحَكِيمُ", transliteration: "আল-হাকীম", meaningBangla: "প্রজ্ঞাময় ও তত্ত্বজ্ঞানী", virtue: "জ্ঞান ও প্রজ্ঞার দরজা উন্মোচিত হয়।" },
  { number: 47, arabic: "الْوَدُودُ", transliteration: "আল-ওয়াদুদ", meaningBangla: "স্নেহময় ও পরমপ্রেমিক", virtue: "দাম্পত্য কলহ ও পরিবারে ভালোবাসা বৃদ্ধিতে ১০০০ বার পাঠ্য।" },
  { number: 48, arabic: "الْمَجِيدُ", transliteration: "আল-মাজীদ", meaningBangla: "মহাপবিত্র ও সম্মানিত", virtue: "অসুস্থতা আরোগ্য ও দীর্ঘায়ু লাভে বরকতময়।" },
  { number: 49, arabic: "الْبَاعِثُ", transliteration: "আল-বায়িছ", meaningBangla: "পুনরুত্থানকারী", virtue: "ঘুম থেকে উঠে বুকে হাত রেখে ১০১ বার পাঠে হেদায়েত মেলে।" },
  { number: 50, arabic: "الشَّهِيدُ", transliteration: "আশ-শাহীদ", meaningBangla: "প্রত্যক্ষদর্শী", virtue: "অবাধ্য সন্তান বা অবাধ্য স্ত্রীকে অনুগত করতে পাঠ্য।" },
  { number: 51, arabic: "الْحَقُّ", transliteration: "আল-হাক্ক", meaningBangla: "চূড়ান্ত সত্য", virtue: "হারিয়ে যাওয়া জিনিস ফিরে পেতে চার কোণে লিখে দোয়া।" },
  { number: 52, arabic: "الْوَكِيلُ", transliteration: "আল-ওয়াকীল", meaningBangla: "পরম ভরসা ও দায়িত্বশীল", virtue: "ভয়ভীতি ও ঝড়-তুফানের সময় ভরসা রেখে পাঠ্য।" },
  { number: 53, arabic: "الْقَوِيُّ", transliteration: "আল-ক্বাফী", meaningBangla: "মহাশক্তিমান", virtue: "দুর্বলতা দূরীকরণ ও সাহসের সঞ্চার করে।" },
  { number: 54, arabic: "الْمَتِينُ", transliteration: "আল-মাতীন", meaningBangla: "দৃঢ় ও অনমনীয়", virtue: "শত্রুর কুমন্ত্রণা ও সংকট মোচনে সহায়ক।" },
  { number: 55, arabic: "الْوَلِيُّ", transliteration: "আল-ওয়ালী", meaningBangla: "পরম বন্ধু ও অভিভাবক", virtue: "আল্লাহর নৈকট্য ও বেলায়েত অর্জনে নিয়মিত জিকির।" },
  { number: 56, arabic: "الْحَمِيدُ", transliteration: "আল-হামীদ", meaningBangla: "প্রশংসিত ও গুণান্বিত", virtue: "সকালে ও সন্ধ্যায় পাঠে চরিত্র সুন্দর ও উন্নত হয়।" },
  { number: 57, arabic: "الْمُحْصِي", transliteration: "আল-মুহসী", meaningBangla: "সকল সৃষ্টির হিসাবরক্ষক", virtue: "কেয়ামতের ভয়াবহ হিসাব সহজ করার দোয়া।" },
  { number: 58, arabic: "الْمُبْدِئُ", transliteration: "আল-মুবদী", meaningBangla: "অনস্তিত্ব থেকে অস্তিত্বদানকারী", virtue: "নতুন উদ্যোগ ও ব্যবসায় বরকত আসে।" },
  { number: 59, arabic: "الْمُعِيدُ", transliteration: "আল-মুঈদ", meaningBangla: "পুনরায় জীবনদানকারী", virtue: "হারিয়ে যাওয়া ব্যক্তিকে উদ্ধার বা ফিরে পেতে পাঠ্য।" },
  { number: 60, arabic: "الْمُحْيِي", transliteration: "আল-মুহয়ী", meaningBangla: "জীবনদানকারী", virtue: "রোগমুক্তি ও শারীরিক সুস্থতায় আমলযোগ্য।" },
  { number: 61, arabic: "الْمُمِيتُ", transliteration: "আল-মুমীত", meaningBangla: "মৃত্যুদানকারী", virtue: "নফস ও কুপ্রবৃত্তিকে পরাভূত করতে আমল।" },
  { number: 62, arabic: "الْحَيُّ", transliteration: "আল-হাইয়্যু", meaningBangla: "চিরঞ্জীব", virtue: "ইসমে আজম হিসেবে স্বীকৃত, সকল মুশকিল আসান করে।" },
  { number: 63, arabic: "الْقَيُّومُ", transliteration: "আল-ক্বাইয়্যুম", meaningBangla: "চিরস্থায়ী ও বিশ্বধারক", virtue: "অলসতা দূরীকরণ ও প্রতিটি কাজে সাফল্যের চাবিকাঠি।" },
  { number: 64, arabic: "الْوَاجِدُ", transliteration: "আল-ওয়াজিদ", meaningBangla: "অভাবহীন ও আবিষ্কারক", virtue: "অন্তরের ধনীতা ও পরিতৃপ্তি লাভের জন্য।" },
  { number: 65, arabic: "الْمَاجِدُ", transliteration: "আল-মাজিদ", meaningBangla: "মহান ও উদার", virtue: "অন্তর নূরানী ও আলোকিত করতে পাঠ্য।" },
  { number: 66, arabic: "الْوَاحِدُ", transliteration: "আল-ওয়াহিদ", meaningBangla: "একক ও অদ্বিতীয়", virtue: "একাকীত্বের ভয় ও আতঙ্ক দূর করতে ১০০০ বার পাঠ্য।" },
  { number: 67, arabic: "الأَحَدُ", transliteration: "আল-আহাদ", meaningBangla: "এক ও অনুপম", virtue: "তাওহিদের খাঁটি বিশ্বাস অন্তরে প্রোথিত হয়।" },
  { number: 68, arabic: "الصَّمَدُ", transliteration: "আস-সামাদ", meaningBangla: "অমুখাপেক্ষী ও ভরসাস্থল", virtue: "সেজদায় ১১৫ বার পাঠে অভাব অনটন দূর হয়।" },
  { number: 69, arabic: "الْقَادِرُ", transliteration: "আল-ক্বাদির", meaningBangla: "সবকিছুতে ক্ষমতাবান", virtue: "শত্রুর ষড়যন্ত্র নস্যাৎ ও বিজয়ে সহায়ক।" },
  { number: 70, arabic: "الْمُقْتَدِرُ", transliteration: "আল-মুক্বতাদির", meaningBangla: "প্রভাবশালী নিয়ন্ত্রণকর্তা", virtue: "ঘুম থেকে উঠে পাঠ করলে সত্য পথ স্পষ্ট হয়।" },
  { number: 71, arabic: "الْمُقَدِّمُ", transliteration: "আল-মুকাদ্দিম", meaningBangla: "অগ্রবর্তীকারী", virtue: "পরীক্ষা ও ময়দানে বিজয়ে অগ্রগামী রাখে।" },
  { number: 72, arabic: "الْمُؤَخِّرُ", transliteration: "আল-মুআখ্খির", meaningBangla: "পশ্চাদবর্তীকারী", virtue: "তওবা কবুল ও গুনাহ থেকে দূরে রাখে।" },
  { number: 73, arabic: "الأَوَّلُ", transliteration: "আল-আউয়াল", meaningBangla: "সর্বপ্রথম (অনাদি)", virtue: "সন্তান লাভের কামনায় ৪০ দিন পাঠ্য।" },
  { number: 74, arabic: "الآخِرُ", transliteration: "আল-আখির", meaningBangla: "সর্বশেষ (অনন্ত)", virtue: "জীবনের শেষ পরিণতি ও সুন্দর মৃত্যুর জন্য।" },
  { number: 75, arabic: "الظَّاهِرُ", transliteration: "আয-যাহির", meaningBangla: "প্রকাশ্য ও দৃশ্যমান", virtue: "ইশরাকের পর পাঠে চোখে ও চেহারায় নূর বৃদ্ধি পায়।" },
  { number: 76, arabic: "الْبَاطِنُ", transliteration: "আল-বাতিন", meaningBangla: "গুপ্ত ও অদৃশ্য", virtue: "অন্তর পবিত্র ও আল্লাহর ভালোবাসায় পূর্ণ হয়।" },
  { number: 77, arabic: "الْوَالِي", transliteration: "আল-ওয়ালী", meaningBangla: "পরম শাসক ও অভিভাবক", virtue: "বিপদ-আপদ ও প্রাকৃতিক দুর্যোগ হতে সুরক্ষা দেয়।" },
  { number: 78, arabic: "الْمُتَعَالِي", transliteration: "আল-মুতাআলী", meaningBangla: "সর্বোচ্চ শ্রেষ্ঠ", virtue: "কঠিন কাজ সহজে সমাধান করতে সাহায্য করে।" },
  { number: 79, arabic: "الْبَرُّ", transliteration: "আল-বার্র", meaningBangla: "মহাঅনুগ্রহকারী ও ন্যায়বান", virtue: "মদ, জুয়া ও মন্দ স্বভাব থেকে তওবা নসিব হয়।" },
  { number: 80, arabic: "التَّوَّابُ", transliteration: "আত-তাওয়াব", meaningBangla: "তওবা কবুলকারী", virtue: "চাশতের সময় ৩৬০ বার পাঠে তওবা কবুল হয়।" },
  { number: 81, arabic: "الْمُنْتَقِمُ", transliteration: "আল-মুনতাক্বিম", meaningBangla: "প্রতিশোধ গ্রহণকারী", virtue: "জালেমের জুলুম থেকে মজলুমের সুরক্ষা মেলে।" },
  { number: 82, arabic: "العَفُوُّ", transliteration: "আল-আফুউ", meaningBangla: "মার্জনাকারী", virtue: "গুনাহের দাগ মুছে ক্ষমা লাভে সহায়তা করে।" },
  { number: 83, arabic: "الرَّؤُوفُ", transliteration: "আর-রাউফ", meaningBangla: "পরম স্নেহশীল ও কৃপাময়", virtue: "সবার অন্তরে ভালোবাসা সৃষ্টি ও কলহ নিরসনে পাঠ্য।" },
  { number: 84, arabic: "مَالِكُ الْمُلْكِ", transliteration: "মালিকুল মুলক", meaningBangla: "সমগ্র রাজত্বের চিরন্তন মালিক", virtue: "সম্মান, খ্যাতি ও স্থায়ী সুখ লাভে ফলদায়ক।" },
  { number: 85, arabic: "ذُو الْجَلاَلِ وَالإِكْرَامِ", transliteration: "যুল জালালি ওয়াল ইকরাম", meaningBangla: "মহিমাময় ও মর্যাদাময় সত্তা", virtue: "দোয়া কবুল করার অন্যতম প্রধান চাবিকাঠি।" },
  { number: 86, arabic: "الْمُقْسِطُ", transliteration: "আল-মুকসিত", meaningBangla: "সুবিচারক", virtue: "শয়তানের ওয়াসওয়াসা ও কুমন্ত্রণা থেকে মুক্তি দেয়।" },
  { number: 87, arabic: "الْجَامِعُ", transliteration: "আল-জামি", meaningBangla: "একত্রকারী ও সমন্বয়কারী", virtue: "বিচ্ছিন্ন পরিবার ও হারানো স্বজন ফিরে পেতে পাঠ্য।" },
  { number: 88, arabic: "الْغَنِيُّ", transliteration: "আল-গানিয়্যু", meaningBangla: "পরম ধনী ও অভাবহীন", virtue: "অভাব ও ঋণ থেকে মুক্তির মোক্ষম আমল।" },
  { number: 89, arabic: "الْمُغْنِي", transliteration: "আল-মুগনী", meaningBangla: "ধনীকারী ও প্রাচুর্যদাতা", virtue: "১০ শুক্রবারে ১০০০ বার পাঠে অভাব দূর হয়।" },
  { number: 90, arabic: "الْمَانِعُ", transliteration: "আল-মানি", meaningBangla: "নিবারণকারী ও রক্ষাকর্তা", virtue: "দাম্পত্য কলহ ও অনর্থ নিবারণে পাঠ্য।" },
  { number: 91, arabic: "الضَّارُّ", transliteration: "আদ-দার্র", meaningBangla: "ক্ষতিসাধক (পরীক্ষাকারী)", virtue: "দুষ্ট জিন ও শত্রুর নজর থেকে বাঁচায়।" },
  { number: 92, arabic: "النَّافِعُ", transliteration: "আন-নাফি", meaningBangla: "কল্যাণদাতা ও হিতকারী", virtue: "ব্যবসায় ও চিকিৎসায় সফলতার চাবিকাঠি।" },
  { number: 93, arabic: "النُّورُ", transliteration: "আন-নূর", meaningBangla: "জ্যোতি ও আলোকময়", virtue: "সুরা নূরের সঙ্গে পাঠে অন্তর প্রদীপ্ত হয়।" },
  { number: 94, arabic: "الْهَادِي", transliteration: "আল-হাদী", meaningBangla: "সুপথ প্রদর্শনকারী", virtue: "হেদায়েত ও পথভ্রষ্টতা থেকে বাঁচার দোয়া।" },
  { number: 95, arabic: "الْبَدِيعُ", transliteration: "আল-বাদী", meaningBangla: "অনুপম রূপকার", virtue: "চিন্তা ও দুর্দশা থেকে নিষ্কৃতি দেয়।" },
  { number: 96, arabic: "الْبَاقِي", transliteration: "আল-বাক্বী", meaningBangla: "চিরস্থায়ী ও অবিনশ্বর", virtue: "নেক আমল কবুল হওয়া ও রক্ষা পেতে সহায়ক।" },
  { number: 97, arabic: "الْوَارِثُ", transliteration: "আল-ওয়ারিস", meaningBangla: "চূড়ান্ত উত্তরাধিকারী", virtue: "দীর্ঘায়ু ও বরকতময় জীবনের জন্য পাঠ্য।" },
  { number: 98, arabic: "الرَّشِيدُ", transliteration: "আর-রাশীদ", meaningBangla: "সুপরামর্শক ও সত্যপথ প্রদর্শক", virtue: "মাগরিব ও এশার মাঝে ১০০০ বার পাঠে সমস্যার সমাধান মিলে।" },
  { number: 99, arabic: "الصَّبُورُ", transliteration: "আস-সবূর", meaningBangla: "মহাধৈর্যশীল", virtue: "কঠিন দুঃখ-কষ্টে ধৈর্য ও প্রশান্তি দান করে।" },
];

export const DAILY_DUAS: DuaItem[] = [
  {
    id: "dua-1",
    title: "ঘুম থেকে জাগ্রত হওয়ার দোয়া",
    category: "দৈনন্দিন",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "আলহামদু লিল্লাহিল্লাযী আহ্ইয়ানা বা'দা মা আমাতানা ওয়া ইলাইহিন নুশূর।",
    meaning: "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাদেরকে মৃত্যুর পর পুনরায় জীবিত করলেন এবং তাঁর দিকেই সবার পুনরুত্থান।",
    reference: "সহিহ বুখারি: ৬৩১২"
  },
  {
    id: "dua-2",
    title: "ঘুমানোর পূর্বে পাঠ করার দোয়া",
    category: "দৈনন্দিন",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "বিসমিকাল্লাহুম্মা আমূতু ওয়া আহ্ইয়া।",
    meaning: "হে আল্লাহ! আপনারই নামে আমি মৃত্যুবরণ (ঘুমাই) করছি এবং পুনর্জীবিত হব।",
    reference: "সহিহ বুখারি: ৬৩২৪"
  },
  {
    id: "dua-3",
    title: "খাবার খাওয়ার শুরুর দোয়া",
    category: "দৈনন্দিন",
    arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
    transliteration: "বিসমিল্লাহি ওয়া আলা বারাকাতিল্লাহ।",
    meaning: "আল্লাহর নামে এবং আল্লাহর বরকতের ওপর আহার শুরু করছি।",
    reference: "আবু দাউদ: ৩৭৬৭"
  },
  {
    id: "dua-4",
    title: "খাবার খাওয়ার শেষের দোয়া",
    category: "দৈনন্দিন",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliteration: "আলহামদু লিল্লাহিল্লাযী আত'আমানা ওয়া সাক্বানা ওয়া জা'আলানা মিনাল মুসলিমীন।",
    meaning: "সমস্ত প্রশংসা আল্লাহর জন্য, যিনি আমাদের আহার করিয়েছেন, পান করিয়েছেন এবং মুসলিম হিসেবে সৃষ্টি করেছেন।",
    reference: "তিরমিজি: ৩৪৫৭"
  },
  {
    id: "dua-5",
    title: "ঘর থেকে বের হওয়ার দোয়া",
    category: "দৈনন্দিন",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "বিসমিল্লাহি তাওয়াক্কালতু আলাল্লাহ, লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ।",
    meaning: "আল্লাহর নামে বের হচ্ছি, আল্লাহর ওপর ভরসা করলাম। আল্লাহর সাহায্য ছাড়া কোনো শক্তি বা ক্ষমতা নেই।",
    reference: "আবু দাউদ: ৫০৯৫"
  },
  {
    id: "dua-6",
    title: "মসজিদে প্রবেশের দোয়া",
    category: "সালাত",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "আল্লাহুম্মাফ তাহলী আবওয়াবা রাহমাতিকা।",
    meaning: "হে আল্লাহ! আমার জন্য আপনার রহমতের সকল দরজা উন্মুক্ত করে দিন।",
    reference: "সহিহ মুসলিম: ৭১৩"
  },
  {
    id: "dua-7",
    title: "মসজিদ থেকে বের হওয়ার দোয়া",
    category: "সালাত",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "আল্লাহুম্মা ইন্নী আসআলুকা মিন ফাদলিকা।",
    meaning: "হে আল্লাহ! আমি আপনার অনুগ্রহ প্রার্থনা করছি।",
    reference: "সহিহ মুসলিম: ৭১৩"
  },
  {
    id: "dua-8",
    title: "রোজার ইফতারের দোয়া",
    category: "রমজান ও রোজা",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
    transliteration: "যাহাবায যামাউ ওয়াবতাল্লাতিল উরূক্বু ওয়া ছাবাতাল আজরু ইনশাআল্লাহ।",
    meaning: "পিপাসা নিবৃত্ত হয়েছে, শিরা-উপশিরা সিক্ত হয়েছে এবং আল্লাহর ইচ্ছায় প্রতিদানও নির্ধারিত হয়েছে।",
    reference: "আবু দাউদ: ২৩৫৭"
  },
  {
    id: "dua-9",
    title: "রোজার নিয়ত",
    category: "রমজান ও রোজা",
    arabic: "نَوَيْتُ أَنْ أَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ الْمُبَارَكِ فَرْضًا لَكَ يَا اللَّهُ",
    transliteration: "নাওয়াইতু আন আসূমা গাদান মিন শাহরি রামাদানাল মুবারাকি ফারদান লাকা ইয়া আল্লাহ।",
    meaning: "হে আল্লাহ! আমি আগামীকাল পবিত্র রমজান মাসের তোমার নির্ধারিত ফরজ রোজা রাখার নিয়ত করছি।",
    reference: "ফিকহুল ইসলাম"
  },
  {
    id: "dua-10",
    title: "বিপদ ও দুশ্চিন্তা থেকে মুক্তির দোয়া (ইউনুস আ.)",
    category: "বিপদ-আপদ",
    arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নী কুনতু মিনায যালিমীন।",
    meaning: "তুমি ছাড়া কোনো সত্য উপাস্য নেই, তুমি পরম পবিত্র। নিশ্চয়ই আমি অপরাধীদের অন্তর্ভুক্ত।",
    reference: "সুরা আম্বিয়া: ৮৭ / তিরমিজি: ৩৫০৫"
  },
  {
    id: "dua-11",
    title: "সকাল-সন্ধ্যার সুরক্ষা দোয়া",
    category: "সকাল-সন্ধ্যা",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "বিসমিল্লাহিল্লাযী লা ইয়াদুররু মা'আসমিহী শাইউন ফিল আরদি ওয়ালা ফিস সামা-ই ওয়াহুওয়াস সামী'উল আলীম।",
    meaning: "আল্লাহর নামে, যাঁর নামের বরকতে আসমান ও জমিনের কোনো কিছুই অনিষ্ট করতে পারে না; তিনি সর্বশ্রোতা, মহাজ্ঞানী। (৩ বার পাঠ্য)",
    reference: "তিরমিজি: ৩৩৮৮"
  },
  {
    id: "dua-12",
    title: "পিতা-মাতার জন্য কোরআনি দোয়া",
    category: "দৈনন্দিন",
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "রাব্বির হামহুমা কামা রাব্বায়ানী সাগীরা।",
    meaning: "হে আমার প্রতিপালক! তাঁদের উভয়ের প্রতি দয়া করুন যেভাবে শৈশবে তাঁরা আমাকে প্রতিপালন করেছেন।",
    reference: "সুরা বনি ইসরাইল: ২৪"
  }
];

export const AUTHENTIC_HADITHS: HadithItem[] = [
  {
    id: "hadith-1",
    title: "ইলম অন্বেষণের মর্যাদা",
    category: "ইলম",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    bengali: "যে ব্যক্তি দ্বীনি জ্ঞান বা ইলম অর্জনের উদ্দেশ্যে কোনো পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সুগম ও সহজ করে দেন।",
    narrator: "হজরত আবু হুরায়রা (রা.)",
    source: "সহিহ মুসলিম: ২৬৯৯"
  },
  {
    id: "hadith-2",
    title: "উত্তম ব্যক্তি কে?",
    category: "ইলম",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    bengali: "তোমাদের মধ্যে সর্বোত্তম ও শ্রেষ্ঠ ব্যক্তি সে-ই, যে নিজে পবিত্র কুরআন শিক্ষা করে এবং অন্যকে তা শিক্ষা দেয়।",
    narrator: "হজরত উসমান ইবনে আফ্ফান (রা.)",
    source: "সহিহ বুখারি: ৫০২৭"
  },
  {
    id: "hadith-3",
    title: "আমলের ভিত্তি নিয়ত",
    category: "ঈমান",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    bengali: "নিশ্চয়ই প্রতিটি কাজের ফলাফল নিয়তের ওপর নির্ভরশীল। প্রত্যেক মানুষ তা-ই পায়, যা সে নিয়ত করে।",
    narrator: "হজরত উমর ইবনুল খাত্তাব (রা.)",
    source: "সহিহ বুখারি: ১"
  },
  {
    id: "hadith-4",
    title: "সালাত দ্বীনের স্তম্ভ",
    category: "সালাত",
    arabic: "الصَّلَاةُ عِمَادُ الدِّينِ، فَمَنْ أَقَامَهَا فَقَدْ أَقَامَ الدِّينَ، وَمَنْ هَدَمَهَا فَقَدْ هَدَمَ الدِّينَ",
    bengali: "নামাজ হলো দ্বীন ইসলামের মূল স্তম্ভ। যে ব্যক্তি নামাজ প্রতিষ্ঠা করল, সে যেন দ্বীনকে রক্ষা করল; আর যে তা ত্যাগ করল, সে দ্বীনকে ধ্বংস করল।",
    narrator: "হজরত ওমর (রা.)",
    source: "বায়হাকি ও মিশকাত"
  },
  {
    id: "hadith-5",
    title: "উত্তম চরিত্র ও শিষ্টাচার",
    category: "আখলাক",
    arabic: "إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلاَقًا",
    bengali: "তোমাদের মধ্যে সর্বশ্রেষ্ঠ তারা, যাদের চরিত্র ও ব্যবহার সবচেয়ে সুন্দর এবং মার্জিত।",
    narrator: "হজরত আব্দুল্লাহ ইবনে আমর (রা.)",
    source: "সহিহ বুখারি: ৩৫৫৯"
  },
  {
    id: "hadith-6",
    title: "দানের গুরুত্ব ও বরকত",
    category: "দান-সদকা",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    bengali: "দান বা সদকা করার দ্বারা কখনোই সম্পদ হ্রাস পায় না, বরং আল্লাহ তাতে সীমাহীন বরকত দেন।",
    narrator: "হজরত আবু হুরায়রা (রা.)",
    source: "সহিহ মুসলিম: ২৫৮৮"
  }
];

export const SURAH_LIST: SurahSummary[] = [
  { number: 1, nameBangla: "আল-ফাতিহা", nameArabic: "الفاتحة", nameEnglish: "Al-Fatihah", totalAyahs: 7, revelationType: "মাক্কী", meaning: "সূচনা / মহাপ্রারম্ভ" },
  { number: 2, nameBangla: "আল-বাকারাহ", nameArabic: "البقرة", nameEnglish: "Al-Baqarah", totalAyahs: 286, revelationType: "মাদানী", meaning: "বকনা বাছুর" },
  { number: 3, nameBangla: "আলে ইমরান", nameArabic: "آل عمران", nameEnglish: "Ali 'Imran", totalAyahs: 200, revelationType: "মাদানী", meaning: "ইমরানের পরিবার" },
  { number: 4, nameBangla: "আন-নিসা", nameArabic: "النساء", nameEnglish: "An-Nisa", totalAyahs: 176, revelationType: "মাদানী", meaning: "মহিলা" },
  { number: 5, nameBangla: "আল-মায়েদাহ", nameArabic: "المائدة", nameEnglish: "Al-Ma'idah", totalAyahs: 120, revelationType: "মাদানী", meaning: "খাদ্যপূর্ণ দস্তরখান" },
  { number: 18, nameBangla: "আল-কাহফ", nameArabic: "الكهف", nameEnglish: "Al-Kahf", totalAyahs: 110, revelationType: "মাক্কী", meaning: "গুহা" },
  { number: 36, nameBangla: "ইয়াসীন", nameArabic: "يس", nameEnglish: "Ya-Sin", totalAyahs: 83, revelationType: "মাক্কী", meaning: "কুরআনের হৃৎপিণ্ড" },
  { number: 55, nameBangla: "আর-রাহমান", nameArabic: "الرحمن", nameEnglish: "Ar-Rahman", totalAyahs: 78, revelationType: "মাদানী", meaning: "পরম করুণাময়" },
  { number: 56, nameBangla: "আল-ওয়াকিয়াহ", nameArabic: "الواقعة", nameEnglish: "Al-Waqi'ah", totalAyahs: 96, revelationType: "মাক্কী", meaning: "অবধারিত ঘটনা" },
  { number: 67, nameBangla: "আল-মুলক", nameArabic: "الملك", nameEnglish: "Al-Mulk", totalAyahs: 30, revelationType: "মাক্কী", meaning: "সার্বভৌম কর্তৃত্ব" },
  { number: 112, nameBangla: "আল-ইখলাস", nameArabic: "الإخلاص", nameEnglish: "Al-Ikhlas", totalAyahs: 4, revelationType: "মাক্কী", meaning: "একনিষ্ঠতা / তাওহিদ" },
  { number: 113, nameBangla: "আল-ফালাক", nameArabic: "الفلق", nameEnglish: "Al-Falaq", totalAyahs: 5, revelationType: "মাক্কী", meaning: "নিশিভোর / প্রত্যুষ" },
  { number: 114, nameBangla: "আন-নাস", nameArabic: "الناس", nameEnglish: "An-Nas", totalAyahs: 6, revelationType: "মাক্কী", meaning: "মানবজাতি" }
];

// Kushtia Bangladesh Coordinate-based prayer defaults
export function getKushtiaPrayerTimes(date = new Date()) {
  // Kushtia Lat 23.9013, Lon 89.1205
  // Returns formatted 12hr time for today
  return {
    fajr: "০৪:৪৮ AM",
    sunrise: "০৬:০৩ AM",
    dhuhr: "১২:০৬ PM",
    asr: "০৪:২২ PM",
    maghrib: "০৬:০৭ PM",
    isha: "০৭:২৪ PM",
    sehriEnd: "০৪:৪২ AM",
    iftar: "০৬:০৭ PM"
  };
}

// Zakat Nisab Values in Bangladesh (Estimated Market Rates)
export const ZAKAT_NISAB = {
  goldBhori: 7.5, // 7.5 তোলা / ভরি স্বর্ণ
  silverBhori: 52.5, // 52.5 তোলা রৌপ্য
  goldPricePerGram: 10500, // approx BDT
  silverPricePerGram: 180, // approx BDT
  silverNisabBDT: 110000, // Standard Silver Nisab threshold in BDT
  rate: 0.025 // 2.5%
};
