// api/db-client.js
import { createClient } from '@supabase/supabase-js';

const clean = (value) =>
  String(value || '')
    .replace(/[\uFEFF\u200B-\u200D\uFFFE\uFFFF]/g, '')
    .trim();

const supabaseUrl = clean(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
);

const serviceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY || '');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY server environment variables.'
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
