import supabase from './db-client.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getUserFromReq(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // ─── 1. إنشاء حساب جديد ─────────────────────────────────────────
    if (req.method === 'POST') {
      const { email, password, fullName, phone, role } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanName = String(fullName || '').trim() || cleanEmail.split('@')[0];
      const cleanPhone = String(phone || '').trim();

      if (!EMAIL_RE.test(cleanEmail)) {
        return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
      }
      if (!password || String(password).length < 6) {
        return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      }

      // Check if user exists in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: { name: cleanName, phone: cleanPhone, role: role || 'buyer' }
      });

      if (authError) {
        const exists = /already|registered|exists|duplicate/i.test(authError.message);
        if (exists) {
          // Check if profile exists
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
      const newUser = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: role || 'buyer',
        joined_at: 'اليوم'
      };

      await supabase.from('users').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        joined_at: newUser.joined_at
      });

      await supabase.from('user_roles').upsert({
        user_id: userId,
        role: role || 'buyer'
      });

      return res.status(201).json({ ok: true, user: newUser });
    }

    // ─── 2. جلب بيانات الحساب الحالي ─────────────────────────────────
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
        user.user_metadata?.full_name ||
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

    // ─── 3. حذف الحساب نهائياً ─────────────────────────────────────────
    if (req.method === 'DELETE') {
      const user = await getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'غير مصرح' });

      // Delete from public tables
      await supabase.from('users').delete().eq('id', user.id);
      await supabase.from('user_roles').delete().eq('user_id', user.id);
      await supabase.from('carts').delete().eq('user_id', user.id);
      await supabase.from('wishlists').delete().eq('user_id', user.id);

      // Delete from auth.users permanently via Admin API
      const { error: deleteErr } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteErr) {
        console.warn('Admin deleteUser warning:', deleteErr.message);
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message || 'خطأ في الخادم' });
  }
}
