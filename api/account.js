// api/account.js
import supabase from './db-client.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const CLIENT_ROLES = new Set(['buyer', 'guest']);
const VALID_ROLES = new Set(['buyer', 'admin', 'manager', 'support', 'guest']);

const clean = (value) =>
  String(value || '')
    .replace(/[\uFEFF\u200B-\u200D\uFFFE\uFFFF]/g, '')
    .trim();

function applyCors(req, res) {
  const allowedOrigins = (process.env.APP_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const requestOrigin = req.headers.origin;

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (!requestOrigin) return;

  if (allowedOrigins.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return;
  }

  if (allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
}

async function getUserFromReq(req) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) return null;

  const token = header.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

async function isAdmin(userId) {
  if (!UUID_RE.test(userId)) return false;

  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  return !error && !!data;
}

async function resolveRequester(req) {
  const user = await getUserFromReq(req).catch(() => null);
  if (user) return user;

  const body = req.body || {};
  const query = req.query || {};
  const requesterId = clean(body.requesterId || query.requesterId || '');

  if (requesterId && UUID_RE.test(requesterId)) {
    const admin = await isAdmin(requesterId);
    if (admin) {
      return { id: requesterId, role: 'admin' };
    }
  }

  return null;
}

async function cleanupResidualData(targetId, targetEmail, reviewIds = []) {
  const warnings = [];

  const run = async (label, query) => {
    try {
      const { error } = await query;
      if (error) warnings.push(`${label}: ${error.message}`);
    } catch (e) {
      warnings.push(`${label}: ${e.message || 'unknown error'}`);
    }
  };

  await run('users', supabase.from('users').delete().eq('id', targetId));
  await run('user_roles', supabase.from('user_roles').delete().eq('user_id', targetId));
  await run('carts', supabase.from('carts').delete().eq('user_id', targetId));
  await run('wishlists', supabase.from('wishlists').delete().eq('user_id', targetId));
  await run('notifications', supabase.from('notifications').delete().eq('user_id', targetId));

  if (reviewIds.length > 0) {
    await run('reviews', supabase.from('reviews').delete().in('id', reviewIds));
  } else {
    await run('reviews', supabase.from('reviews').delete().eq('user_id', targetId));
  }

  await run(
    'orders',
    supabase.from('orders').update({ user_id: null }).eq('user_id', targetId)
  );

  if (targetEmail) {
    await run(
      'login_attempts',
      supabase.from('login_attempts').delete().ilike('identifier', targetEmail)
    );
  }

  return warnings;
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // ─────────────────────────────────────────────
    // POST: إنشاء حساب جديد
    // ─────────────────────────────────────────────
    if (req.method === 'POST' && req.body?.action !== 'delete') {
      const { email, password, fullName, phone, role } = req.body || {};

      const cleanEmail = clean(email).toLowerCase();
      const cleanName = clean(fullName).slice(0, 100) || cleanEmail.split('@')[0];
      const cleanPhone = clean(phone).slice(0, 32);
      const requestedRole = clean(role).toLowerCase();

      const safeRole = CLIENT_ROLES.has(requestedRole) ? requestedRole : 'buyer';

      if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 254) {
        return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
      }

      if (!PASSWORD_RE.test(String(password || ''))) {
        return res.status(400).json({
          error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتتضمن حرفًا كبيرًا وحرفًا صغيرًا ورقمًا'
        });
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          name: cleanName,
          phone: cleanPhone,
          role: safeRole
        }
      });

      if (authError || !authData?.user) {
        const message = authError?.message || 'فشل إنشاء المستخدم';

        if (/already|registered|exists|duplicate/i.test(message)) {
          return res.status(409).json({
            error: 'هذا البريد الإلكتروني مسجل مسبقاً'
          });
        }

        console.error('Create user error:', message);
        return res.status(400).json({ error: 'تعذر إنشاء الحساب' });
      }

      const userId = authData.user.id;

      const { error: profileError } = await supabase.from('users').upsert({
        id: userId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: safeRole,
        joined_at: 'اليوم'
      });

      if (profileError) {
        console.error('Profile upsert error:', profileError.message);
      }

      const { error: roleError } = await supabase.from('user_roles').upsert({
        user_id: userId,
        role: safeRole
      });

      if (roleError) {
        console.error('Role upsert error:', roleError.message);
      }

      return res.status(201).json({
        ok: true,
        user: {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          role: safeRole
        }
      });
    }

    // ─────────────────────────────────────────────
    // GET: جلب حساب المستخدم الحالي
    // ─────────────────────────────────────────────
    if (req.method === 'GET') {
      const user = await getUserFromReq(req);
      if (!user) {
        return res.status(401).json({ error: 'غير مصرح' });
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        return res.status(200).json(profile);
      }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      const verifiedRole = VALID_ROLES.has(roleRow?.role || '')
        ? roleRow.role
        : 'buyer';

      const fallbackName =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        (user.email ? user.email.split('@')[0] : 'مستخدم');

      const createdProfile = {
        id: user.id,
        name: fallbackName,
        email: user.email,
        phone: user.user_metadata?.phone || '',
        role: verifiedRole,
        joined_at: 'اليوم'
      };

      await supabase.from('users').upsert(createdProfile);

      if (!roleRow) {
        await supabase
          .from('user_roles')
          .upsert({ user_id: user.id, role: verifiedRole });
      }

      return res.status(200).json(createdProfile);
    }

    // ─────────────────────────────────────────────
    // DELETE: حذف حساب نهائي
    // ─────────────────────────────────────────────
    if (
      req.method === 'DELETE' ||
      (req.method === 'POST' && req.body?.action === 'delete')
    ) {
      const query = req.query || {};
      const body = req.body || {};

      const requestedTargetId = clean(
        query.targetUserId ||
          query.userId ||
          query.id ||
          body.targetUserId ||
          body.userId ||
          body.id ||
          ''
      );

      const targetEmailParam = clean(
        query.targetEmail || query.email || body.targetEmail || body.email || ''
      ).toLowerCase();

      const authUser = await resolveRequester(req).catch(() => null);

      let targetId = requestedTargetId || authUser?.id || '';
      let targetEmail = targetEmailParam || authUser?.email || null;

      // If targetId is not a valid UUID, resolve it from DB by email
      if ((!targetId || !UUID_RE.test(targetId)) && targetEmail) {
        const { data: userByEmail } = await supabase
          .from('users')
          .select('id')
          .ilike('email', targetEmail)
          .maybeSingle();

        if (userByEmail?.id) {
          targetId = userByEmail.id;
        }
      }

      if (!targetId || !UUID_RE.test(targetId)) {
        if (targetEmail) {
          const warnings = await cleanupResidualData(null, targetEmail, []);
          return res.status(200).json({
            ok: true,
            deletedByEmail: targetEmail,
            warnings
          });
        }
        return res.status(400).json({ error: 'معرف أو بريد المستخدم غير صالح' });
      }

      const { data: targetData } =
        await supabase.auth.admin.getUserById(targetId).catch(() => ({ data: null }));

      if (targetData?.user?.email) {
        targetEmail = targetData.user.email;
      }

      const { data: reviewRows } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', targetId);

      const reviewIds = (reviewRows || [])
        .map((row) => row.id)
        .filter(Boolean);

      // Clean up residual data in public schema tables FIRST
      const warnings = await cleanupResidualData(
        targetId,
        targetEmail,
        reviewIds
      );

      // THEN delete user from auth
      if (UUID_RE.test(targetId) && !targetId.startsWith('guest-')) {
        try {
          const { error: deleteError } =
            await supabase.auth.admin.deleteUser(targetId);

          if (deleteError) {
            console.warn('Auth delete error (handled):', deleteError.message);
            warnings.push(`auth.deleteUser: ${deleteError.message}`);
          }
        } catch (authErr) {
          console.warn('Auth delete exception:', authErr.message);
          warnings.push(`auth.deleteUser exception: ${authErr.message}`);
        }
      }

      return res.status(200).json({
        ok: true,
        deletedUserId: targetId,
        warnings
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({
      error: err.message || 'خطأ في الخادم'
    });
  }
}
