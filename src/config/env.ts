// src/config/env.ts

export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://plqfewlztgsojgvmygsl.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mU_PNBeM9V3oi4IrsnVmWw_3w9NBbKh',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'دُو ماركت',
  APP_URL: import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://doo-market.vercel.app'),
  MAX_LOGIN_ATTEMPTS: Number(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5,
  LOCKOUT_MINUTES: Number(import.meta.env.VITE_LOCKOUT_MINUTES) || 15,
  SESSION_TIMEOUT_MINUTES: Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 60,
  ENABLE_GUEST_LOGIN: import.meta.env.VITE_ENABLE_GUEST_LOGIN !== 'false',
  ENABLE_SOCIAL_LOGIN: import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials check: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables.');
}
