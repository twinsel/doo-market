import { createClient } from '@supabase/supabase-js';

const sanitize = (val) => String(val || '').replace(/[\uFEFF\u200B-\u200D\uFFFE\uFFFF]/g, '').trim();

const supabaseUrl = sanitize(process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '');
const serviceRoleKey = sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('⚠️ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in serverless environment.');
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabase;
