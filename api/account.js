// api/account.js
import supabase from './db-client.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================================
// Helpers
// ============================================================

async function getUserFromReq(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return null;

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

async function isAdminUser(userId) {
  if (!userId || !UUID_RE.test(userId)) return false;
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return false;
    return data?.role === 'admin';
  } catch {
    return false;
  }
}

// ============================================================
// Handler
// ============================================================

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // ─────────────────────────────────────────────────────────
    // POST: إنشاء حساب جديد
    // ─────────────────────────────────────────────────────────
    if (req.method === 'POST' && req.body?.action !== 'delete') {
      const { email, password, fullName, phone } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanName = String(fullName || '').trim() || cleanEmail.split('@')[0];
      const cleanPhone = String(phone || '').trim();

      if (!EMAIL_RE.test(cleanEmail)) {
        return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
      }
      if (!password || String(password).length < 6) {
        return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          name: cleanName,
          phone: cleanPhone
        }
      });

      if (authError) {
        const exists = /already|registered|exists|duplicate/i.test(authError.message);
        if (exists) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();
          if (profile) {
            return res.status(200).json({ ok: true, user: profile, isExisting: true });
          }
        }
        return res.status(400).json({
          error: exists ? 'هذا البريد الإلكتروني مسجل مسبقاً' : authError.message
        });
      }

      const userId = authData.user.id;

      await supabase.from('users').upsert({
        id: userId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'buyer',
        joined_at: 'اليوم'
      });

      await supabase.from('user_roles').upsert({
        user_id: userId,
        role: 'buyer'
      });

      return res.status(201).json({
        ok: true,
        user: {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: 'buyer'
        }
      });
    }

    // ─────────────────────────────────────────────────────────
    // GET: جلب بيانات الحساب الحالي
    // ─────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const user = await getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'غير مصرح' });

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) return res.status(200).json(profile);

      const fallbackName =
        user.user_metadata?.name ||
        (user.email ? user.email.split('@')[0] : 'مستخدم');

      const created = {
        id: user.id,
        name: fallbackName,
        email: user.email,
        phone: user.user_metadata?.phone || '',
        role: 'buyer'
      };
      await supabase.from('users').upsert(created);
      return res.status(200).json(created);
    }

    // ─────────────────────────────────────────────────────────
    // DELETE: حذف حساب (مع دعم مرن للـ targetId والـ auth)
    // ─────────────────────────────────────────────────────────
    if (req.method === 'DELETE' || (req.method === 'POST' && req.body?.action === 'delete')) {
      const authUser = await getUserFromReq(req).catch(() => null);
      const body = req.body || {};
      const query = req.query || {};

      const requestedId = String(
        authUser?.id ||
        query.targetUserId ||
        query.userId ||
        query.id ||
        body.targetUserId ||
        body.userId ||
        body.id ||
        ''
      ).trim();

      if (!requestedId || !UUID_RE.test(requestedId)) {
        return res.status(400).json({ error: 'معرف المستخدم غير صالح أو غير موجود' });
      }

      // If user is authenticated via token, ensure they can only delete themselves unless they are admin
      if (authUser && requestedId !== authUser.id) {
        const admin = await isAdminUser(authUser.id);
        if (!admin) {
          return res.status(403).json({
            error: 'ممنوع: صلاحيات الأدمن مطلوبة لحذف مستخدم آخر'
          });
        }
      }

      console.log(`[DELETE] Target User ID -> ${requestedId}`);

      const tables = ['carts', 'wishlists', 'notifications', 'reviews', 'user_roles'];
      for (const table of tables) {
        try {
          await supabase.from(table).delete().eq('user_id', requestedId);
        } catch {}
      }

      try {
        await supabase.from('users').delete().eq('id', requestedId);
      } catch {}

      if (UUID_RE.test(requestedId) && !requestedId.startsWith('guest-')) {
        const { error: deleteErr } = await supabase.auth.admin.deleteUser(requestedId);
        if (deleteErr) {
          console.error('[DELETE] auth.admin.deleteUser FAILED:', deleteErr);
          return res.status(500).json({
            error: `فشل حذف المستخدم من نظام المصادقة: ${deleteErr.message || 'خطأ غير معروف'}`,
            details: deleteErr.message
          });
        }
      } else {
        console.log('[DELETE] Skipping auth.admin.deleteUser for non-UUID or guest ID:', requestedId);
      }

      return res.status(200).json({
        ok: true,
        deletedId: requestedId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[API ERROR]', err);
    return res.status(500).json({
      error: err?.message || 'خطأ غير متوقع في الخادم'
    });
  }
}
