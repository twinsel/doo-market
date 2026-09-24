// api/db-client.js
import { createClient } from '@supabase/supabase-js';

const sanitize = (val) =>
  String(val || '').replace(/[\uFEFF\u200B-\u200D\uFFFE\uFFFF]/g, '').trim();

const supabaseUrl = sanitize(
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
);

const serviceRoleKey = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY || '');

if (!supabaseUrl) {
  throw new Error(
    '❌ Missing SUPABASE_URL. ' +
    'Add it in Vercel → Settings → Environment Variables.'
  );
}

if (!serviceRoleKey) {
  throw new Error(
    '❌ Missing SUPABASE_SERVICE_ROLE_KEY. ' +
    'This is REQUIRED for auth.admin.deleteUser() to work. ' +
    'Get it from Supabase Dashboard → Settings → API → service_role secret.'
  );
}

if (serviceRoleKey.includes('anon') || serviceRoleKey.startsWith('sb_publishable')) {
  throw new Error(
    '❌ SUPABASE_SERVICE_ROLE_KEY appears to be an anon/publishable key. ' +
    'You must use the service_role secret key.'
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

export default supabase;
