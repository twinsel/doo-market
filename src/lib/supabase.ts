import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://plqfewlztgsojgvmygsl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mU_PNBeM9V3oi4IrsnVmWw_3w9NBbKh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
