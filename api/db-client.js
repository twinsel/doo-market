import { createClient } from '@supabase/supabase-js';

const sanitize = (val) => String(val || '').replace(/[\uFEFF\u200B-\u200D\uFFFE\uFFFF]/g, '').trim();

const rawUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cuhopbhqtoxccoflogyy.supabase.co';
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_secret_lpiRL6ug9oG2--c5cIWCew_S_KyqxKY';

const supabaseUrl = sanitize(rawUrl);
const serviceRoleKey = sanitize(rawKey);

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
