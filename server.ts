import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Security and parse middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Multer memory storage for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
});

// Firebase Admin Initialization
let db: any = null;
let adminAuth: any = null;
const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    const adminApp = getApps().length === 0 ? initializeApp({
      credential: cert(serviceAccount),
      databaseURL: 'https://ashraful-uloom-madrasa-default-rtdb.firebaseio.com'
    }) : getApps()[0];
    db = getDatabase(adminApp);
    adminAuth = getAdminAuth(adminApp);
    console.log('[Server] Firebase Admin SDK connected to RTDB & Auth successfully.');
  } else {
    console.warn('[Server] serviceAccountKey.json not found in root.');
  }
} catch (err: any) {
  console.error('[Server] Firebase Admin SDK init error:', err.message);
}

// In-Memory cache for lightning-fast reads
interface CacheStore {
  notices: any[] | null;
  noticesLastFetch: number;
  results: any[] | null;
  resultsLastFetch: number;
  teachers: any[] | null;
  teachersLastFetch: number;
  gallery: any[] | null;
  galleryLastFetch: number;
  settings: any | null;
  settingsLastFetch: number;
}

const cache: CacheStore = {
  notices: null,
  noticesLastFetch: 0,
  results: null,
  resultsLastFetch: 0,
  teachers: null,
  teachersLastFetch: 0,
  gallery: null,
  galleryLastFetch: 0,
  settings: null,
  settingsLastFetch: 0,
};

const CACHE_TTL = 30 * 1000; // 30 seconds

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'zknlko0a';
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'al_ashraf';

// OneSignal Configuration
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || '7628254a-848b-4ea9-ae48-b490c49fd65a';
const ONESIGNAL_REST_KEY = process.env.ONESIGNAL_REST_KEY || 'os_v2_app_oyucksuernhktlsiwsimjh6wlj7htehgrvmecdmwthrltuysgdet5wjku4mchy65lb7yft72xzlghpikvseeexiq6v3v7mfakajr6ai';

// Designate Admin UID
export const ADMIN_UIDS = ['6m20RVo55GUWBL0gQrehsx8RsOF3'];

/* ============================================================
   API ROUTES
   ============================================================ */

// 1. Health check & status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebaseConnected: !!db,
    adminUids: ADMIN_UIDS
  });
});

// 2. Cloudinary Upload endpoint with auto-compression & WebP optimization
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let fileBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body && req.body.image) {
      // Base64 string
      const base64Str = req.body.image;
      const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        fileBuffer = Buffer.from(matches[2], 'base64');
      } else {
        fileBuffer = Buffer.from(base64Str, 'base64');
      }
    }

    if (!fileBuffer) {
      return res.status(400).json({ success: false, error: 'কোনো ফাইল পাওয়া যায়নি।' });
    }

    const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    const formData = new FormData();
    formData.append('file', base64Data);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'al_ashraf');

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await cloudinaryRes.json();
    if (cloudinaryRes.ok && data.secure_url) {
      return res.json({
        success: true,
        url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        bytes: data.bytes
      });
    } else {
      console.error('[Cloudinary Upload Error]', data);
      return res.status(500).json({ success: false, error: data.error?.message || 'ছবি আপলোড ব্যর্থ হয়েছে' });
    }
  } catch (err: any) {
    console.error('[API Upload Exception]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Notices API
app.get('/api/notices', async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cache.notices && (now - cache.noticesLastFetch < CACHE_TTL)) {
      return res.json({ success: true, notices: cache.notices });
    }

    if (!db) {
      return res.json({ success: true, notices: [] });
    }

    const snap = await db.ref('notices').once('value');
    const val = snap.val() || {};
    const noticesList: any[] = [];

    Object.keys(val).forEach((key) => {
      noticesList.push({ id: key, ...val[key] });
    });

    // Sort by date descending (pinned first)
    noticesList.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

    cache.notices = noticesList;
    cache.noticesLastFetch = now;

    return res.json({ success: true, notices: noticesList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notices', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { id, title, type, date, important, pinned, description, attachment } = req.body;
    if (!title || !date) {
      return res.status(400).json({ success: false, error: 'শিরোনাম ও তারিখ আবশ্যক' });
    }

    const noticeData = {
      title,
      type: type || 'announcement',
      date,
      important: !!important,
      pinned: !!pinned,
      description: description || '',
      attachment: attachment || '',
      updatedAt: Date.now()
    };

    let savedId = id;
    if (id) {
      await db.ref(`notices/${id}`).update(noticeData);
    } else {
      const newRef = await db.ref('notices').push(noticeData);
      savedId = newRef.key;
    }

    // Invalidate cache
    cache.notices = null;

    return res.json({ success: true, id: savedId, notice: noticeData });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/notices/:id', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });
    const { id } = req.params;
    await db.ref(`notices/${id}`).remove();
    cache.notices = null;
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Results API
app.get('/api/results', async (req: Request, res: Response) => {
  try {
    const { roll, className, year, session, jamaat } = req.query;
    const now = Date.now();

    let allResults = cache.results;
    if (!allResults || (now - cache.resultsLastFetch >= CACHE_TTL)) {
      if (db) {
        const snap = await db.ref('results').once('value');
        const val = snap.val() || {};
        allResults = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
        cache.results = allResults;
        cache.resultsLastFetch = now;
      } else {
        allResults = [];
      }
    }

    let filtered = allResults;
    if (roll) {
      filtered = filtered.filter((r) => String(r.roll).trim() === String(roll).trim());
    }
    if (className) {
      filtered = filtered.filter((r) => r.className === className || r.jamaat === className);
    }
    if (year) {
      filtered = filtered.filter((r) => String(r.year) === String(year));
    }
    if (session) {
      filtered = filtered.filter((r) => r.examSession === session);
    }

    return res.json({ success: true, count: filtered.length, results: filtered });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/results', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const resultData = req.body;
    if (!resultData.name || !resultData.roll) {
      return res.status(400).json({ success: false, error: 'শিক্ষার্থীর নাম ও রোল আবশ্যক' });
    }

    resultData.updatedAt = Date.now();
    let savedId = resultData.id;

    if (savedId) {
      delete resultData.id;
      await db.ref(`results/${savedId}`).update(resultData);
    } else {
      const newRef = await db.ref('results').push(resultData);
      savedId = newRef.key;
    }

    // Also update structured index for instant lookup if session & jamaat are present
    if (resultData.examSession && resultData.jamaat) {
      const branchKey = resultData.branch || 'general';
      const pathKey = `structuredResults/${resultData.examSession}/${resultData.jamaat}/${branchKey}/roll_${resultData.roll}`;
      await db.ref(pathKey).set({ ...resultData, legacyId: savedId });
    }

    cache.results = null;
    return res.json({ success: true, id: savedId });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/results/bulk', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'ফলাফলের তালিকা ফাঁকা' });
    }

    let successCount = 0;
    for (const item of items) {
      if (!item.name || !item.roll) continue;
      item.updatedAt = Date.now();
      const newRef = await db.ref('results').push(item);
      if (item.examSession && item.jamaat) {
        const branchKey = item.branch || 'general';
        await db.ref(`structuredResults/${item.examSession}/${item.jamaat}/${branchKey}/roll_${item.roll}`).set({
          ...item,
          legacyId: newRef.key
        });
      }
      successCount++;
    }

    cache.results = null;
    return res.json({ success: true, imported: successCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/results/:id', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });
    const { id } = req.params;
    await db.ref(`results/${id}`).remove();
    cache.results = null;
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Teachers & Staff API
app.get('/api/teachers', async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cache.teachers && (now - cache.teachersLastFetch < CACHE_TTL)) {
      return res.json({ success: true, teachers: cache.teachers });
    }

    if (!db) return res.json({ success: true, teachers: [] });

    const snap = await db.ref('teachers').once('value');
    const val = snap.val() || {};
    const list: any[] = [];
    Object.keys(val).forEach((k) => {
      list.push({ id: k, ...val[k] });
    });

    list.sort((a, b) => (a.order || 99) - (b.order || 99));
    cache.teachers = list;
    cache.teachersLastFetch = now;
    return res.json({ success: true, teachers: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/teachers', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });
    const { id, name, designation, phone, photo, department, qualifications, order } = req.body;
    if (!name || !designation) {
      return res.status(400).json({ success: false, error: 'নাম ও পদবি আবশ্যক' });
    }

    const teacherData = {
      name,
      designation,
      phone: phone || '',
      photo: photo || '',
      department: department || 'কিতাব বিভাগ',
      qualifications: qualifications || '',
      order: order ? parseInt(order) : 99,
      updatedAt: Date.now()
    };

    let savedId = id;
    if (id) {
      await db.ref(`teachers/${id}`).update(teacherData);
    } else {
      const newRef = await db.ref('teachers').push(teacherData);
      savedId = newRef.key;
    }

    cache.teachers = null;
    return res.json({ success: true, id: savedId });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/teachers/:id', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });
    const { id } = req.params;
    await db.ref(`teachers/${id}`).remove();
    cache.teachers = null;
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Gallery API
app.get('/api/gallery', async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (cache.gallery && (now - cache.galleryLastFetch < CACHE_TTL)) {
      return res.json({ success: true, gallery: cache.gallery });
    }

    if (!db) return res.json({ success: true, gallery: [] });

    const snap = await db.ref('gallery').once('value');
    const val = snap.val() || {};
    const list: any[] = [];
    Object.keys(val).forEach((k) => {
      list.push({ id: k, ...val[k] });
    });

    list.sort((a, b) => (b.date || 0) - (a.date || 0));
    cache.gallery = list;
    cache.galleryLastFetch = now;
    return res.json({ success: true, gallery: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/gallery', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });
    const { title, url, category, description } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'ছবির লিংক আবশ্যক' });

    const item = {
      title: title || 'ক্যাম্পাস ছবি',
      url,
      category: category || 'ক্যাম্পাস',
      description: description || '',
      date: Date.now()
    };

    const newRef = await db.ref('gallery').push(item);
    cache.gallery = null;
    return res.json({ success: true, id: newRef.key });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/gallery/:id', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });
    const { id } = req.params;
    await db.ref(`gallery/${id}`).remove();
    cache.gallery = null;
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Site Settings & Banners API
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    if (!db) {
      return res.json({
        success: true,
        siteSettings: {
          resultPublish: { enabled: false, examName: 'বার্ষিক পরীক্ষা ২০২৬' },
          meritSettings: { enabled: true, count: '10', type: 'overall' },
          tickerNotice: 'জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়ার অনলাইন পোর্টালে আপনাকে স্বাগতম।',
          madrasaInfo: {
            name: 'জামিয়া আরাবিয়া আশরাফুল উলূম কুষ্টিয়া',
            phone: '01716-652646',
            email: 'info.alashraf26@gmail.com',
            address: 'মাদরাসা রোড, মজমপুর, কুষ্টিয়া, বাংলাদেশ'
          }
        },
        banners: []
      });
    }

    const [settingsSnap, bannersSnap] = await Promise.all([
      db.ref('siteSettings').once('value'),
      db.ref('banners').once('value')
    ]);

    const siteSettings = settingsSnap.val() || {};
    const bannersVal = bannersSnap.val() || {};
    const bannersList = Object.keys(bannersVal).map((k) => ({ id: k, ...bannersVal[k] }));

    return res.json({
      success: true,
      siteSettings,
      banners: bannersList
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/settings', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });
    const { siteSettings, banners } = req.body;

    if (siteSettings) {
      await db.ref('siteSettings').update(siteSettings);
    }
    if (banners && Array.isArray(banners)) {
      // Overwrite banners if specified
      const bannersObj: any = {};
      banners.forEach((b: any, index: number) => {
        const id = b.id || `banner_${index}`;
        bannersObj[id] = { title: b.title || '', subtitle: b.subtitle || '', image: b.image || '' };
      });
      await db.ref('banners').set(bannersObj);
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 8. User Profile & Role Management API
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    if (!db) return res.json({ success: true, users: [] });

    const snap = await db.ref('users').once('value');
    const val = snap.val() || {};
    const usersList: any[] = [];

    // Ensure root super admin UID is always included
    const rootAdminUid = '6m20RVo55GUWBL0gQrehsx8RsOF3';
    let rootFound = false;

    Object.keys(val).forEach((uid) => {
      const u = val[uid] || {};
      const isRoot = uid === rootAdminUid;
      if (isRoot) rootFound = true;
      usersList.push({
        uid,
        displayName: u.displayName || (isRoot ? 'প্রধান এডমিন (অফিসিয়াল)' : 'ব্যবহারকারী'),
        email: u.email || '',
        phone: u.phone || '',
        avatar: u.avatar || '',
        role: isRoot ? 'admin' : (u.role || 'visitor'),
        isAdmin: isRoot || u.role === 'admin' || u.isAdmin === true,
        isModerator: u.role === 'moderator' || u.isModerator === true,
        isRootAdmin: isRoot,
        savedRoll: u.savedRoll || '',
        updatedAt: u.updatedAt || Date.now()
      });
    });

    if (!rootFound) {
      usersList.unshift({
        uid: rootAdminUid,
        displayName: 'প্রধান এডমিন (অফিসিয়াল)',
        email: 'info.alashraf26@gmail.com',
        phone: '01716-652646',
        avatar: '',
        role: 'admin',
        isAdmin: true,
        isModerator: true,
        isRootAdmin: true,
        savedRoll: '',
        updatedAt: Date.now()
      });
    }

    return res.json({ success: true, count: usersList.length, users: usersList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/users/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const isRoot = uid === '6m20RVo55GUWBL0gQrehsx8RsOF3';

    if (!db) {
      return res.json({
        success: true,
        user: {
          uid,
          role: isRoot ? 'admin' : 'visitor',
          isAdmin: isRoot,
          isModerator: isRoot,
          isRootAdmin: isRoot
        }
      });
    }

    const snap = await db.ref(`users/${uid}`).once('value');
    const userData = snap.val() || {};
    const isAdmin = isRoot || userData.role === 'admin' || userData.isAdmin === true;
    const isModerator = isRoot || isAdmin || userData.role === 'moderator' || userData.isModerator === true;

    return res.json({
      success: true,
      user: {
        uid,
        ...userData,
        role: isRoot ? 'admin' : (userData.role || 'visitor'),
        isAdmin,
        isModerator,
        isRootAdmin: isRoot,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/users/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const isRoot = uid === '6m20RVo55GUWBL0gQrehsx8RsOF3';
    const { displayName, phone, bio, avatar, email, savedRoll, bookmarks } = req.body;

    const payload: any = {
      updatedAt: Date.now()
    };
    if (displayName !== undefined) payload.displayName = displayName;
    if (phone !== undefined) payload.phone = phone;
    if (bio !== undefined) payload.bio = bio;
    if (avatar !== undefined) payload.avatar = avatar;
    if (email !== undefined) payload.email = email;
    if (savedRoll !== undefined) payload.savedRoll = savedRoll;
    if (bookmarks !== undefined) payload.bookmarks = bookmarks;

    if (isRoot) {
      payload.role = 'admin';
      payload.isAdmin = true;
      payload.isModerator = true;
    }

    if (db) {
      await db.ref(`users/${uid}`).update(payload);
    }

    return res.json({ success: true, user: payload });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Role assignment endpoint: can only be invoked by designated admin
app.post('/api/users/:uid/role', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { uid } = req.params;
    const { role, requesterUid } = req.body;

    // Verify requester
    const rootAdminUid = '6m20RVo55GUWBL0gQrehsx8RsOF3';
    let isAuthorized = requesterUid === rootAdminUid;

    if (!isAuthorized && requesterUid) {
      const snap = await db.ref(`users/${requesterUid}`).once('value');
      const reqData = snap.val() || {};
      if (reqData.role === 'admin' || reqData.isAdmin === true) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'শুধুমাত্র প্রধান প্রশাসক রোল পরিবর্তন করতে পারেন।' });
    }

    // Root admin can never be demoted
    if (uid === rootAdminUid && role !== 'admin') {
      return res.status(400).json({ success: false, error: 'প্রধান এডমিনের রোল পরিবর্তন করা সম্ভব নয়।' });
    }

    const isAdmin = role === 'admin';
    const isModerator = role === 'moderator' || role === 'admin';

    await db.ref(`users/${uid}`).update({
      role,
      isAdmin,
      isModerator,
      updatedAt: Date.now()
    });

    console.log(`[Role Update] User ${uid} assigned role: ${role} by ${requesterUid}`);
    return res.json({ success: true, uid, role, isAdmin, isModerator });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 8.1 Password Reset Link Generator
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন।' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (adminAuth) {
      try {
        const resetLink = await adminAuth.generatePasswordResetLink(cleanEmail);
        return res.json({
          success: true,
          message: 'পাসওয়ার্ড রিসেটের লিংক সফলভাবে তৈরি হয়েছে।',
          resetLink
        });
      } catch (adminErr: any) {
        if (adminErr.code === 'auth/user-not-found') {
          return res.status(404).json({
            success: false,
            error: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট নিবন্ধিত নেই। অনুগ্রহ করে নতুন একাউন্ট খুলুন।'
          });
        }
        return res.status(400).json({
          success: false,
          error: adminErr.message || 'পাসওয়ার্ড রিসেট লিংক তৈরি করা যায়নি।'
        });
      }
    }

    return res.status(500).json({ success: false, error: 'Firebase Auth সেবা প্রস্তুত নয়।' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Send Push Notification via OneSignal (Secure Backend)
app.post('/api/send-notification', async (req: Request, res: Response) => {
  try {
    const { title, message, url, big_picture } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'শিরোনাম ও বার্তা আবশ্যক' });
    }

    const payload: any = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['All'],
      headings: { en: title, bn: title },
      contents: { en: message, bn: message },
      url: url || ''
    };

    if (big_picture) {
      payload.big_picture = big_picture;
      payload.chrome_web_image = big_picture;
      payload.ios_attachments = { id1: big_picture };
    }

    console.log('[OneSignal] Sending notification:', title);
    const osRes = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Key ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const osData = await osRes.json();
    return res.json({ success: osRes.ok, data: osData });
  } catch (err: any) {
    console.error('[OneSignal Error]', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================================================
   VITE DEV SERVER / STATIC SERVE
   ============================================================ */

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Jamia Arabia Ashraful Uloom Kushtia running on port ${PORT}`);
  });
}

startServer();
