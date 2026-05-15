import { createClient } from '@supabase/supabase-js';

// Bulletproof Configuration:
// We use import.meta.env for flexibility, but hardcode your specific project 
// credentials as fallbacks to ensure the app ALWAYS works on GitHub Pages or local dev.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Vercel environment variables.");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "", {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  // Ensure we handle retries for "Failed to Fetch" network blips
  global: {
    fetch: (...args) => {
      // Trigger activity event for session timeout tracking
      window.dispatchEvent(new CustomEvent('supabase-activity'));
      return fetch(...args).catch(err => {
        console.error("Supabase Fetch Error:", err);
        throw err;
      });
    }
  }
});
