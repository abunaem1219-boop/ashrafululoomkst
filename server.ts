import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
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

// Firebase RTDB REST & Admin Auth Initialization
const RTDB_BASE_URL = 'https://ashraful-uloom-madrasa-default-rtdb.firebaseio.com';

class RTDBRef {
  path: string;

  constructor(path: string) {
    this.path = (path || '').replace(/^\/+|\/+$/g, '');
  }

  child(subpath: string): RTDBRef {
    const cleanSub = (subpath || '').replace(/^\/+|\/+$/g, '');
    const newPath = this.path ? `${this.path}/${cleanSub}` : cleanSub;
    return new RTDBRef(newPath);
  }

  async once(event: 'value'): Promise<{ val: () => any; exists: () => boolean }> {
    try {
      const url = `${RTDB_BASE_URL}/${this.path}.json`;
      const res = await fetch(url);
      if (!res.ok) {
        return { val: () => null, exists: () => false };
      }
      const data = await res.json();
      return {
        val: () => data,
        exists: () => data !== null && data !== undefined
      };
    } catch (err) {
      console.error(`[RTDB REST Get Error] ${this.path}:`, err);
      return { val: () => null, exists: () => false };
    }
  }

  async set(val: any): Promise<void> {
    const url = `${RTDB_BASE_URL}/${this.path}.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(val)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`RTDB set failed at ${this.path}: ${res.statusText} ${errText}`);
    }
  }

  async update(val: any): Promise<void> {
    const url = `${RTDB_BASE_URL}/${this.path}.json`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(val)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`RTDB update failed at ${this.path}: ${res.statusText} ${errText}`);
    }
  }

  async push(val: any): Promise<{ key: string }> {
    const url = `${RTDB_BASE_URL}/${this.path}.json`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(val)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`RTDB push failed at ${this.path}: ${res.statusText} ${errText}`);
    }
    const data = await res.json();
    return { key: data.name };
  }

  async remove(): Promise<void> {
    const url = `${RTDB_BASE_URL}/${this.path}.json`;
    const res = await fetch(url, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`RTDB remove failed at ${this.path}: ${res.statusText} ${errText}`);
    }
  }

  async transaction(updateFn: (currentVal: any) => any): Promise<{ snapshot: { val: () => any } }> {
    const snap = await this.once('value');
    const currentVal = snap.val();
    const newVal = updateFn(currentVal);
    if (newVal === undefined) {
      return { snapshot: snap };
    }
    await this.set(newVal);
    return { snapshot: { val: () => newVal } };
  }
}

const db = {
  ref: (path: string) => new RTDBRef(path)
};

let adminAuth: any = null;
try {
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  let adminApp: any = null;
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    adminApp = getApps().length === 0 ? initializeApp({
      credential: cert(serviceAccount),
      projectId: 'ashraful-uloom-madrasa'
    }) : getApps()[0];
  } else {
    adminApp = getApps().length === 0 ? initializeApp({
      projectId: 'ashraful-uloom-madrasa'
    }) : getApps()[0];
  }
  adminAuth = getAdminAuth(adminApp);
  console.log('[Server] Firebase Admin Auth initialized successfully. Database connected via RTDB REST Client.');
} catch (err: any) {
  console.warn('[Server] Firebase Admin Auth initialization warning:', err.message);
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
   SECURITY AUTHENTICATION & TIMEZONE HELPERS
   ============================================================ */

/**
 * Server-side Firebase Auth Token verification
 * Extract Bearer token, verify via adminAuth SDK, check role/permissions
 */
async function getVerifiedUser(req: Request): Promise<{
  uid: string;
  email?: string;
  isAdmin: boolean;
  isModerator: boolean;
  permissions?: any;
} | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1];
  if (!token || !adminAuth) return null;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const isRoot = ADMIN_UIDS.includes(uid);

    let isAdmin = isRoot;
    let isModerator = isRoot;
    let permissions = null;

    if (db) {
      const snap = await db.ref(`users/${uid}`).once('value');
      const u = snap.val() || {};
      isAdmin = isRoot || u.role === 'admin' || u.isAdmin === true;
      isModerator = isRoot || isAdmin || u.role === 'moderator' || u.isModerator === true;
      permissions = u.permissions || null;
    }

    return {
      uid,
      email: decodedToken.email,
      isAdmin,
      isModerator,
      permissions
    };
  } catch (err: any) {
    console.warn('[Auth Helper] Token verification notice:', err.message);
    return null;
  }
}

/**
 * IANA Timezone helper for Asia/Dhaka (UTC+6)
 */
function getBangladeshDateTime(): { dateStr: string; hour: number; minute: number; isAfterCutoff: boolean } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  parts.forEach((p) => { map[p.type] = p.value; });

  const dateStr = `${map.year}-${map.month}-${map.day}`;
  const hour = parseInt(map.hour || '0', 10);
  const minute = parseInt(map.minute || '0', 10);
  const isAfterCutoff = hour >= 10; // Accounting cutoff 8:00 AM - 10:00 AM BD Time

  return { dateStr, hour, minute, isAfterCutoff };
}

/* ============================================================
   API ROUTES
   ============================================================ */

// 1. Health check & status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebaseConnected: !!db,
    adminUids: ADMIN_UIDS,
    bangladeshTime: getBangladeshDateTime()
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

// 6. Premium Gallery API
app.get('/api/gallery', async (req: Request, res: Response) => {
  try {
    if (!db) return res.json({ success: true, gallery: [] });

    const authUser = await getVerifiedUser(req);
    const snap = await db.ref('gallery').once('value');
    const val = snap.val() || {};
    const list: any[] = [];

    // Check user's likes map if authenticated
    let userLikes: Record<string, boolean> = {};
    if (authUser) {
      const likesSnap = await db.ref('galleryUserLikes/' + authUser.uid).once('value');
      userLikes = likesSnap.val() || {};
    }

    Object.keys(val).forEach((k) => {
      const item = val[k];
      const status = item.status || 'approved'; // Backward compatibility: legacy posts default to approved

      // Public users only see approved posts
      const isVisible = status === 'approved' || (authUser && (authUser.isAdmin || authUser.isModerator || item.uploadedByUid === authUser.uid));

      if (isVisible) {
        list.push({
          id: k,
          ...item,
          status,
          likeCount: item.likeCount || 0,
          commentCount: item.commentCount || 0,
          likedByMe: !!userLikes[k]
        });
      }
    });

    list.sort((a, b) => (b.date || 0) - (a.date || 0));
    return res.json({ success: true, count: list.length, gallery: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/gallery', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'ছবি আপলোড করতে লগইন করা আবশ্যক।' });
    }

    const { title, url, category, description } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'ছবির লিংক আবশ্যক' });

    // Permissions check
    const isAutoApproved = authUser.isAdmin || (authUser.permissions && authUser.permissions.canPublishGallery);
    const canUpload = authUser.isAdmin || authUser.isModerator || (authUser.permissions && authUser.permissions.canUploadGallery) || true;

    if (!canUpload) {
      return res.status(403).json({ success: false, error: 'ছবি আপলোড করার অনুমতি আপনার একাউন্টে নেই।' });
    }

    const item = {
      title: title || 'ক্যাম্পাস ছবি',
      url,
      category: category || 'মাদ্রাসা ক্যাম্পাস',
      description: description || '',
      date: Date.now(),
      uploadedByUid: authUser.uid,
      uploaderName: authUser.email || 'ব্যবহারকারী',
      status: isAutoApproved ? 'approved' : 'pending',
      likeCount: 0,
      commentCount: 0
    };

    const newRef = await db.ref('gallery').push(item);
    cache.gallery = null;
    return res.json({
      success: true,
      id: newRef.key,
      status: item.status,
      message: isAutoApproved ? 'ছবি সফলভাবে গ্যালারিতে প্রকাশিত হয়েছে।' : 'ছবি আপলোড হয়েছে। প্রশাসকের অনুমোদনের পর তা গ্যালারিতে প্রদর্শিত হবে।'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Gallery Moderation: Approve or Reject
app.post('/api/gallery/:id/status', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser || (!authUser.isAdmin && !authUser.isModerator)) {
      return res.status(403).json({ success: false, error: 'শুধুমাত্র এডমিন বা মডারেটর এই কার্যক্রম পরিচালনা করতে পারেন।' });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'সঠিক স্ট্যাটাস প্রদান করুন।' });
    }

    await db.ref(`gallery/${id}`).update({
      status,
      rejectionReason: rejectionReason || '',
      reviewedAt: Date.now(),
      reviewedByUid: authUser.uid
    });

    cache.gallery = null;
    return res.json({ success: true, id, status });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle Like / Unlike
app.post('/api/gallery/:id/like', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'লাইক দিতে লগইন করুন।' });
    }

    const { id } = req.params;
    const userLikeRef = db.ref(`galleryLikes/${id}/${authUser.uid}`);
    const myLikeIndexRef = db.ref(`galleryUserLikes/${authUser.uid}/${id}`);
    const galleryItemRef = db.ref(`gallery/${id}`);

    const snap = await userLikeRef.once('value');
    const hasLiked = snap.exists() && snap.val() === true;

    let newLikeCount = 0;
    await galleryItemRef.child('likeCount').transaction((currentCount: number | null) => {
      const c = currentCount || 0;
      return hasLiked ? Math.max(0, c - 1) : c + 1;
    });

    if (hasLiked) {
      await userLikeRef.remove();
      await myLikeIndexRef.remove();
    } else {
      await userLikeRef.set(true);
      await myLikeIndexRef.set(true);
    }

    const updatedSnap = await galleryItemRef.child('likeCount').once('value');
    newLikeCount = updatedSnap.val() || 0;

    cache.gallery = null;
    return res.json({ success: true, liked: !hasLiked, likeCount: newLikeCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Gallery Comments: GET & POST
app.get('/api/gallery/:id/comments', async (req: Request, res: Response) => {
  try {
    if (!db) return res.json({ success: true, comments: [] });
    const { id } = req.params;

    const snap = await db.ref(`galleryComments/${id}`).once('value');
    const val = snap.val() || {};
    const comments: any[] = [];

    Object.keys(val).forEach((ck) => {
      comments.push({ id: ck, ...val[ck] });
    });

    comments.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return res.json({ success: true, count: comments.length, comments });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/gallery/:id/comments', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'মন্তব্য করতে লগইন করা আবশ্যক।' });
    }

    const { id } = req.params;
    const { text, authorName, authorAvatar } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'মন্তব্যের বক্তব্য লিখুন।' });
    }

    const commentData = {
      imageId: id,
      authorUid: authUser.uid,
      authorName: authorName || authUser.email || 'ব্যবহারকারী',
      authorAvatar: authorAvatar || '',
      text: text.trim().slice(0, 500), // Max 500 chars
      timestamp: Date.now()
    };

    const newCommentRef = await db.ref(`galleryComments/${id}`).push(commentData);

    // Increment comment count on gallery item
    await db.ref(`gallery/${id}/commentCount`).transaction((c: number | null) => (c || 0) + 1);

    cache.gallery = null;
    return res.json({ success: true, comment: { id: newCommentRef.key, ...commentData } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/gallery/:id/comments/:commentId', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'অনুমতি নেই।' });
    }

    const { id, commentId } = req.params;
    const commentRef = db.ref(`galleryComments/${id}/${commentId}`);
    const commentSnap = await commentRef.once('value');

    if (!commentSnap.exists()) {
      return res.status(404).json({ success: false, error: 'মন্তব্যটি পাওয়া যায়নি।' });
    }

    const commentVal = commentSnap.val();
    const canDelete = authUser.isAdmin || authUser.isModerator || commentVal.authorUid === authUser.uid;

    if (!canDelete) {
      return res.status(403).json({ success: false, error: 'আপনি শুধুমাত্র আপনার নিজের মন্তব্য ডিলিট করতে পারবেন।' });
    }

    await commentRef.remove();
    await db.ref(`gallery/${id}/commentCount`).transaction((c: number | null) => Math.max(0, (c || 1) - 1));

    cache.gallery = null;
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/gallery/:id', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser || (!authUser.isAdmin && !authUser.isModerator)) {
      return res.status(403).json({ success: false, error: 'অনুমতি নেই।' });
    }

    const { id } = req.params;
    await db.ref(`gallery/${id}`).remove();
    await db.ref(`galleryComments/${id}`).remove();
    await db.ref(`galleryLikes/${id}`).remove();
    cache.gallery = null;
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Gallery Category Management API
app.get('/api/gallery/categories', async (req: Request, res: Response) => {
  try {
    const defaultCategories = [
      { id: 'cat_1', name: 'মাদ্রাসা ক্যাম্পাস', order: 1 },
      { id: 'cat_2', name: 'শিক্ষা কার্যক্রম', order: 2 },
      { id: 'cat_3', name: 'মাহফিল ও অনুষ্ঠান', order: 3 },
      { id: 'cat_4', name: 'পুরস্কার বিতরণী', order: 4 },
      { id: 'cat_5', name: 'খেলাধুলা', order: 5 },
      { id: 'cat_6', name: 'ভ্রমণ ও স্মৃতিচারণ', order: 6 },
      { id: 'cat_7', name: 'অন্যান্য', order: 7 }
    ];

    if (!db) return res.json({ success: true, categories: defaultCategories });

    const snap = await db.ref('galleryCategories').once('value');
    if (!snap.exists()) {
      return res.json({ success: true, categories: defaultCategories });
    }

    const val = snap.val() || {};
    const categoriesList = Object.keys(val).map(k => ({ id: k, ...val[k] }));
    categoriesList.sort((a, b) => (a.order || 99) - (b.order || 99));

    return res.json({ success: true, categories: categoriesList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/gallery/categories', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser || (!authUser.isAdmin && !authUser.isModerator)) {
      return res.status(403).json({ success: false, error: 'অনুমতি নেই।' });
    }

    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ success: false, error: 'ক্যাটাগরি লিস্ট আবশ্যক।' });
    }

    const catObj: Record<string, any> = {};
    categories.forEach((cat, idx) => {
      const id = cat.id || `cat_${idx + 1}_${Date.now()}`;
      catObj[id] = {
        name: cat.name || 'নতুন ক্যাটাগরি',
        order: cat.order || idx + 1,
        disabled: !!cat.disabled
      };
    });

    await db.ref('galleryCategories').set(catObj);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ============================================================
   6.1 DIGITAL KHANA MANAGEMENT API (MEAL SYSTEM)
   ============================================================ */

// Student Registry Verification Endpoint
app.post('/api/khana/verify-student', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'ছাত্রের আইডি ভেরিফাই করতে প্রথমে সাইন-ইন করুন।' });
    }

    const { studentId, studentName, className, branch } = req.body;
    if (!studentId || !studentName || !className) {
      return res.status(400).json({ success: false, error: 'ছাত্রের আইডি, নাম ও জামাত আবশ্যক।' });
    }

    const cleanId = String(studentId).trim();

    // Store/Link student record under studentRegistry/{cleanId}
    const studentRecord = {
      studentId: cleanId,
      studentName: studentName.trim(),
      className: className.trim(),
      branch: (branch || 'মূল শাখা').trim(),
      verifiedUid: authUser.uid,
      isVerified: true,
      updatedAt: Date.now()
    };

    await db.ref(`studentRegistry/${cleanId}`).set(studentRecord);

    // Also update user's profile with verified studentId
    await db.ref(`users/${authUser.uid}`).update({
      studentId: cleanId,
      studentVerified: true,
      updatedAt: Date.now()
    });

    // Ensure default recurring schedule exists if not set
    const schedRef = db.ref(`mealSchedules/${cleanId}`);
    const schedSnap = await schedRef.once('value');
    if (!schedSnap.exists()) {
      await schedRef.set({
        studentId: cleanId,
        studentName: studentName.trim(),
        className: className.trim(),
        branch: (branch || 'মূল শাখা').trim(),
        breakfastActive: true,
        lunchActive: true,
        dinnerActive: true,
        lastUpdated: Date.now()
      });
    }

    return res.json({ success: true, studentRecord });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch Student Current Recurring Schedule
app.get('/api/khana/student-schedule/:studentId', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { studentId } = req.params;
    const cleanId = String(studentId).trim();

    const snap = await db.ref(`mealSchedules/${cleanId}`).once('value');
    if (snap.exists()) {
      return res.json({ success: true, schedule: snap.val() });
    }

    // Default schedule if none exists yet
    return res.json({
      success: true,
      schedule: {
        studentId: cleanId,
        breakfastActive: true,
        lunchActive: true,
        dinnerActive: true,
        lastUpdated: Date.now()
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Submit New Khana Application / Request
app.post('/api/khana/requests', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'খানা আবেদনের জন্য লগইন করা আবশ্যক।' });
    }

    const {
      studentName,
      studentId,
      className,
      branch,
      requestType, // 'stop' | 'start'
      startMealPeriod, // 'breakfast' | 'lunch' | 'dinner'
      affectedMeals, // 'breakfast_only' | 'lunch_only' | 'dinner_only' | 'breakfast_lunch' | 'breakfast_dinner' | 'lunch_dinner' | 'all_three'
      note,
      proposedEffectiveDate
    } = req.body;

    if (!studentId || !studentName || !requestType || !startMealPeriod || !affectedMeals) {
      return res.status(400).json({ success: false, error: 'অনুরোধের সকল আবশ্যক ফিল্ড পূরণ করুন।' });
    }

    const cleanId = String(studentId).trim();
    const bdTime = getBangladeshDateTime();

    // Target effective date defaults to BD current date or user proposed date
    const targetDate = proposedEffectiveDate || bdTime.dateStr;

    const requestData = {
      studentName: studentName.trim(),
      studentId: cleanId,
      className: (className || 'কিতাব বিভাগ').trim(),
      branch: (branch || 'মূল শাখা').trim(),
      requestType,
      startMealPeriod,
      affectedMeals,
      note: (note || '').trim().slice(0, 300),
      status: 'pending',
      proposedEffectiveDate: targetDate,
      submittedAt: Date.now(),
      submittedByUid: authUser.uid
    };

    const newRef = await db.ref('mealRequests').push(requestData);

    return res.json({
      success: true,
      id: newRef.key,
      isAfterCutoff: bdTime.isAfterCutoff,
      message: bdTime.isAfterCutoff
        ? 'আপনার আবেদনটি গৃহীত হয়েছে। সকাল ১০:০০ টা অতিক্রম করায় এটি পরবর্তী খানা অনুযায়ী এডমিন অনুমোদনের পর কার্যকর হবে।'
        : 'আপনার আবেদনটি সফলভাবে জমা হয়েছে। ১০:০০ টা বাজে হিসাব চূড়ান্ত হওয়ার পর কার্যকর হবে।'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch Khana Requests (Students see own requests, Admins see all)
app.get('/api/khana/requests', async (req: Request, res: Response) => {
  try {
    if (!db) return res.json({ success: true, requests: [] });

    const authUser = await getVerifiedUser(req);
    const snap = await db.ref('mealRequests').once('value');
    const val = snap.val() || {};
    const list: any[] = [];

    Object.keys(val).forEach((k) => {
      const item = val[k];
      // Filter: Admin/Moderator sees all, Student sees their submitted UID or studentId
      const isMine = authUser && (authUser.isAdmin || authUser.isModerator || item.submittedByUid === authUser.uid);
      if (isMine) {
        list.push({ id: k, ...item });
      }
    });

    list.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    return res.json({
      success: true,
      count: list.length,
      requests: list,
      bangladeshTime: getBangladeshDateTime()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Approve Request
app.post('/api/khana/requests/:id/approve', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser || (!authUser.isAdmin && !authUser.isModerator)) {
      return res.status(403).json({ success: false, error: 'আবেদন অনুমোদনের ক্ষমতা শুধুমাত্র এডমিনের রয়েছে।' });
    }

    const { id } = req.params;
    const { approvedEffectiveDate, approvedMealPeriod } = req.body;

    const reqRef = db.ref(`mealRequests/${id}`);
    const snap = await reqRef.once('value');
    if (!snap.exists()) {
      return res.status(404).json({ success: false, error: 'আবেদনটি পাওয়া যায়নি।' });
    }

    const item = snap.val();
    const bdTime = getBangladeshDateTime();

    const finalEffectiveDate = approvedEffectiveDate || item.proposedEffectiveDate || bdTime.dateStr;
    const finalStartPeriod = approvedMealPeriod || item.startMealPeriod || 'breakfast';

    // 1. Mark request as approved
    await reqRef.update({
      status: 'approved',
      approvedEffectiveDate: finalEffectiveDate,
      approvedMealPeriod: finalStartPeriod,
      reviewedAt: Date.now(),
      reviewedByUid: authUser.uid,
      reviewedByName: authUser.email || 'এডমিন'
    });

    // 2. Update Student Recurring Schedule in /mealSchedules/{studentId}
    const studentId = item.studentId;
    const schedRef = db.ref(`mealSchedules/${studentId}`);
    const schedSnap = await schedRef.once('value');
    const existingSched = schedSnap.val() || {
      studentId,
      studentName: item.studentName,
      className: item.className,
      branch: item.branch,
      breakfastActive: true,
      lunchActive: true,
      dinnerActive: true
    };

    const isStop = item.requestType === 'stop';
    const targetActive = !isStop;
    const setRule = item.affectedMeals;

    let bActive = existingSched.breakfastActive;
    let lActive = existingSched.lunchActive;
    let dActive = existingSched.dinnerActive;

    if (setRule === 'breakfast_only') bActive = targetActive;
    else if (setRule === 'lunch_only') lActive = targetActive;
    else if (setRule === 'dinner_only') dActive = targetActive;
    else if (setRule === 'breakfast_lunch') { bActive = targetActive; lActive = targetActive; }
    else if (setRule === 'breakfast_dinner') { bActive = targetActive; dActive = targetActive; }
    else if (setRule === 'lunch_dinner') { lActive = targetActive; dActive = targetActive; }
    else if (setRule === 'all_three') { bActive = targetActive; lActive = targetActive; dActive = targetActive; }

    await schedRef.set({
      studentId,
      studentName: item.studentName,
      className: item.className,
      branch: item.branch,
      breakfastActive: bActive,
      lunchActive: lActive,
      dinnerActive: dActive,
      lastUpdated: Date.now(),
      lastRequestId: id
    });

    // Audit Log
    await db.ref('mealAuditLogs').push({
      action: 'APPROVE_MEAL_REQUEST',
      requestId: id,
      studentId,
      reviewedByUid: authUser.uid,
      effectiveDate: finalEffectiveDate,
      timestamp: Date.now()
    });

    return res.json({ success: true, id, status: 'approved' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Reject Request
app.post('/api/khana/requests/:id/reject', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser || (!authUser.isAdmin && !authUser.isModerator)) {
      return res.status(403).json({ success: false, error: 'আবেদন নাকচ করার ক্ষমতা শুধুমাত্র এডমিনের রয়েছে।' });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ success: false, error: 'আবেদন বাতিল করার কারণ উল্লেখ করা বাধ্যতামূলক।' });
    }

    const reqRef = db.ref(`mealRequests/${id}`);
    await reqRef.update({
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      reviewedAt: Date.now(),
      reviewedByUid: authUser.uid,
      reviewedByName: authUser.email || 'এডমিন'
    });

    return res.json({ success: true, id, status: 'rejected' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Student Cancel Own Request
app.post('/api/khana/requests/:id/cancel', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser) {
      return res.status(401).json({ success: false, error: 'অনুমতি নেই।' });
    }

    const { id } = req.params;
    const reqRef = db.ref(`mealRequests/${id}`);
    const snap = await reqRef.once('value');

    if (!snap.exists()) {
      return res.status(404).json({ success: false, error: 'আবেদনটি পাওয়া যায়নি।' });
    }

    const item = snap.val();
    if (item.submittedByUid !== authUser.uid && !authUser.isAdmin) {
      return res.status(403).json({ success: false, error: 'আপনি শুধুমাত্র আপনার নিজের আবেদন বাতিল করতে পারবেন।' });
    }

    await reqRef.update({
      status: 'cancelled',
      reviewedAt: Date.now()
    });

    return res.json({ success: true, id, status: 'cancelled' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Daily Accounting Calculation (Breakfast, Lunch, Dinner totals & student lists)
app.get('/api/khana/daily-accounting', async (req: Request, res: Response) => {
  try {
    if (!db) return res.json({ success: true, breakfastCount: 0, lunchCount: 0, dinnerCount: 0 });

    const dateParam = req.query.date as string || getBangladeshDateTime().dateStr;

    // Fetch all student schedules
    const schedSnap = await db.ref('mealSchedules').once('value');
    const schedVal = schedSnap.val() || {};

    const breakfastStudents: any[] = [];
    const lunchStudents: any[] = [];
    const dinnerStudents: any[] = [];

    Object.keys(schedVal).forEach((studentId) => {
      const s = schedVal[studentId];
      const studentObj = {
        studentId: s.studentId || studentId,
        studentName: s.studentName || 'ছাত্র',
        className: s.className || 'কিতাব বিভাগ',
        branch: s.branch || 'মূল শাখা'
      };

      if (s.breakfastActive !== false) breakfastStudents.push(studentObj);
      if (s.lunchActive !== false) lunchStudents.push(studentObj);
      if (s.dinnerActive !== false) dinnerStudents.push(studentObj);
    });

    return res.json({
      success: true,
      date: dateParam,
      breakfastCount: breakfastStudents.length,
      lunchCount: lunchStudents.length,
      dinnerCount: dinnerStudents.length,
      breakfastStudents,
      lunchStudents,
      dinnerStudents,
      bangladeshTime: getBangladeshDateTime()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Export CSV for Excel (UTF-8 BOM included)
app.get('/api/khana/export-csv', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).send('Database not ready');

    const authUser = await getVerifiedUser(req);
    if (!authUser || (!authUser.isAdmin && !authUser.isModerator)) {
      return res.status(403).send('অনুমতি নেই');
    }

    const dateParam = (req.query.date as string) || getBangladeshDateTime().dateStr;
    const schedSnap = await db.ref('mealSchedules').once('value');
    const schedVal = schedSnap.val() || {};

    // CSV Header with UTF-8 BOM (\uFEFF) for Bengali compatibility in Excel
    let csvContent = '\uFEFF';
    csvContent += 'ছাত্রের আইডি,ছাত্রের নাম,জামাত/বিভাগ,শাখা,সকালের খানা,দুপুরের খানা,রাতের খানা,সর্বশেষ আপডেট\n';

    Object.keys(schedVal).forEach((sId) => {
      const s = schedVal[sId];
      const bText = s.breakfastActive !== false ? 'চালু' : 'বন্ধ';
      const lText = s.lunchActive !== false ? 'চালু' : 'বন্ধ';
      const dText = s.dinnerActive !== false ? 'চালু' : 'বন্ধ';
      const dateFormatted = s.lastUpdated ? new Date(s.lastUpdated).toISOString().slice(0, 10) : '';

      csvContent += `"${s.studentId || sId}","${s.studentName || ''}","${s.className || ''}","${s.branch || ''}","${bText}","${lText}","${dText}","${dateFormatted}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="khana_accounting_${dateParam}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).send('Error generating CSV: ' + err.message);
  }
});

// Moderator Permissions Endpoint
app.get('/api/permissions/:uid', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const { uid } = req.params;
    const snap = await db.ref(`users/${uid}/permissions`).once('value');
    const perms = snap.val() || {
      canUploadGallery: true,
      canEditOwnGallery: true,
      canEditOthersGallery: false,
      canPublishGallery: false,
      canDeleteGallery: false,
      canModerateComments: false,
      canManageGalleryCategories: false,
      canApproveMealRequests: false
    };

    return res.json({ success: true, uid, permissions: perms });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/permissions/:uid', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser || !authUser.isAdmin) {
      return res.status(403).json({ success: false, error: 'শুধুমাত্র প্রধান প্রশাসক অনুমতি সেট করতে পারেন।' });
    }

    const { uid } = req.params;
    const { permissions } = req.body;

    await db.ref(`users/${uid}/permissions`).set(permissions);
    return res.json({ success: true, uid, permissions });
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

// 7.1 Madrasa Departments, Classes & Branches Management API
const DEFAULT_MADRASA_DEPARTMENTS = [
  {
    id: 'dept_1',
    name: 'নূরানী',
    code: 'noorani',
    order: 1,
    classes: [
      { id: 'cls_n1', name: 'নূরানী ১ম শ্রেণি', branches: [{ id: 'br_1', name: 'শাখা ক' }, { id: 'br_2', name: 'শাখা খ' }, { id: 'br_m', name: 'মূল শাখা' }] },
      { id: 'cls_n2', name: 'নূরানী ২য় শ্রেণি', branches: [{ id: 'br_1', name: 'শাখা ক' }, { id: 'br_2', name: 'শাখা খ' }, { id: 'br_m', name: 'মূল শাখা' }] },
      { id: 'cls_n3', name: 'নূরানী ৩য় শ্রেণি', branches: [{ id: 'br_1', name: 'শাখা ক' }, { id: 'br_2', name: 'শাখা খ' }, { id: 'br_m', name: 'মূল শাখা' }] }
    ]
  },
  {
    id: 'dept_2',
    name: 'মক্তব',
    code: 'maktab',
    order: 2,
    classes: [
      { id: 'cls_m1', name: 'মক্তব নূরানী', branches: [{ id: 'br_m1', name: 'সকাল শাখা' }, { id: 'br_m2', name: 'বিকেল শাখা' }, { id: 'br_m', name: 'মূল শাখা' }] },
      { id: 'cls_m2', name: 'মক্তব নাজেরা', branches: [{ id: 'br_m1', name: 'সকাল শাখা' }, { id: 'br_m2', name: 'বিকেল শাখা' }, { id: 'br_m', name: 'মূল শাখা' }] },
      { id: 'cls_m3', name: 'বয়স্ক মক্তব', branches: [{ id: 'br_e1', name: 'এশা শাখা' }, { id: 'br_f1', name: 'ফজর শাখা' }] }
    ]
  },
  {
    id: 'dept_3',
    name: 'হিফজ বিভাগ',
    code: 'hifz',
    order: 3,
    classes: [
      { id: 'cls_h1', name: 'নাজেরা হিফজ', branches: [{ id: 'br_h1', name: 'শাখা ক' }, { id: 'br_h2', name: 'শাখা খ' }] },
      { id: 'cls_h2', name: 'হিফজখানা (১ম - ১০ম পারা)', branches: [{ id: 'br_res', name: 'আবাসিক শাখা' }, { id: 'br_gen', name: 'সাধারণ শাখা' }] },
      { id: 'cls_h3', name: 'হিফজখানা (১১শ - ২০শ পারা)', branches: [{ id: 'br_res', name: 'আবাসিক শাখা' }, { id: 'br_gen', name: 'সাধারণ শাখা' }] },
      { id: 'cls_h4', name: 'হিফজখানা (২১শ - ৩০শ পারা)', branches: [{ id: 'br_res', name: 'আবাসিক শাখা' }, { id: 'br_gen', name: 'সাধারণ শাখা' }] },
      { id: 'cls_h5', name: 'পূর্ণ হিফজ শোনানো (রিভিশন)', branches: [{ id: 'br_res', name: 'আবাসিক শাখা' }] }
    ]
  },
  {
    id: 'dept_4',
    name: 'কিতাব বিভাগ',
    code: 'kitab',
    order: 4,
    classes: [
      { id: 'cls_k1', name: 'ইবতেদাইয়্যাহ (১ম-৩য়)', branches: [{ id: 'br_1', name: 'শাখা ক' }, { id: 'br_2', name: 'শাখা খ' }, { id: 'br_res', name: 'আবাসিক শাখা' }] },
      { id: 'cls_k2', name: 'সানাবিয়া আম্মাহ (মিছবাহ)', branches: [{ id: 'br_1', name: 'শাখা ক' }, { id: 'br_res', name: 'আবাসিক শাখা' }] },
      { id: 'cls_k3', name: 'সানাবিয়া খাস্ছাহ (শারহে বেকায়া)', branches: [{ id: 'br_1', name: 'শাখা ক' }, { id: 'br_res', name: 'আবাসিক শাখা' }] },
      { id: 'cls_k4', name: 'ফজিলাত (জালালাইন/হেদায়া)', branches: [{ id: 'br_1', name: 'শাখা ক' }, { id: 'br_res', name: 'আবাসিক শাখা' }] },
      { id: 'cls_k5', name: 'তাকমিল (দাওরায়ে হাদিস)', branches: [{ id: 'br_1', name: 'শাখা ক' }, { id: 'br_res', name: 'আবাসিক শাখা' }] }
    ]
  },
  {
    id: 'dept_5',
    name: 'ফতোয়া বিভাগ',
    code: 'fatwa',
    order: 5,
    classes: [
      { id: 'cls_f1', name: 'তাখাচ্ছুছ ফিল ফিকহ (প্রথম বর্ষ)', branches: [{ id: 'br_m', name: 'মূল শাখা' }, { id: 'br_res', name: 'আবাসিক গবেষণা শাখা' }] },
      { id: 'cls_f2', name: 'তাখাচ্ছুছ ফিল ফিকহ (দ্বিতীয় বর্ষ)', branches: [{ id: 'br_m', name: 'মূল শাখা' }, { id: 'br_res', name: 'আবাসিক গবেষণা শাখা' }] }
    ]
  }
];

app.get('/api/departments', async (req: Request, res: Response) => {
  try {
    if (!db) return res.json({ success: true, departments: DEFAULT_MADRASA_DEPARTMENTS });

    const snap = await db.ref('departments').once('value');
    if (!snap.exists()) {
      return res.json({ success: true, departments: DEFAULT_MADRASA_DEPARTMENTS });
    }

    const val = snap.val() || {};
    let list: any[] = [];
    if (Array.isArray(val)) {
      list = val;
    } else {
      list = Object.keys(val).map(k => ({ id: k, ...val[k] }));
    }

    list.sort((a, b) => (a.order || 99) - (b.order || 99));
    return res.json({ success: true, departments: list.length > 0 ? list : DEFAULT_MADRASA_DEPARTMENTS });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/departments', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ success: false, error: 'Database not initialized' });

    const authUser = await getVerifiedUser(req);
    if (!authUser || (!authUser.isAdmin && !authUser.isModerator)) {
      return res.status(403).json({ success: false, error: 'শুধুমাত্র এডমিন বা মডারেটর বিভাগ এডিট বা রিমুভ করতে পারবেন।' });
    }

    const { departments } = req.body;
    if (!Array.isArray(departments)) {
      return res.status(400).json({ success: false, error: 'সঠিক ফরম্যাটের ডিপার্টমেন্ট ডেটা প্রদান করুন।' });
    }

    await db.ref('departments').set(departments);
    return res.json({ success: true, departments });
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
        userType: u.userType || (isRoot ? 'teacher' : 'visitor'),
        role: isRoot ? 'admin' : (u.role || 'visitor'),
        isAdmin: isRoot || u.role === 'admin' || u.isAdmin === true,
        isModerator: u.role === 'moderator' || u.isModerator === true,
        isRootAdmin: isRoot,
        department: u.department || '',
        className: u.className || '',
        branch: u.branch || '',
        savedRoll: u.savedRoll || '',
        studentId: u.studentId || '',
        guardianStudentName: u.guardianStudentName || '',
        guardianStudentId: u.guardianStudentId || '',
        teacherDesignation: u.teacherDesignation || '',
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
        userType: 'teacher',
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
    const {
      displayName,
      phone,
      bio,
      avatar,
      email,
      userType,
      department,
      className,
      branch,
      savedRoll,
      studentId,
      guardianStudentName,
      guardianStudentId,
      teacherDesignation,
      bookmarks
    } = req.body;

    const payload: any = {
      updatedAt: Date.now()
    };
    if (displayName !== undefined) payload.displayName = displayName;
    if (phone !== undefined) payload.phone = phone;
    if (bio !== undefined) payload.bio = bio;
    if (avatar !== undefined) payload.avatar = avatar;
    if (email !== undefined) payload.email = email;
    if (userType !== undefined) payload.userType = userType;
    if (department !== undefined) payload.department = department;
    if (className !== undefined) payload.className = className;
    if (branch !== undefined) payload.branch = branch;
    if (savedRoll !== undefined) payload.savedRoll = savedRoll;
    if (studentId !== undefined) payload.studentId = studentId;
    if (guardianStudentName !== undefined) payload.guardianStudentName = guardianStudentName;
    if (guardianStudentId !== undefined) payload.guardianStudentId = guardianStudentId;
    if (teacherDesignation !== undefined) payload.teacherDesignation = teacherDesignation;
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
