import { createClient } from '@supabase/supabase-js';

// Bulletproof Configuration:
// We use import.meta.env for flexibility, but hardcode your specific project 
// credentials as fallbacks to ensure the app ALWAYS works on GitHub Pages or local dev.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://zeyxhvrymjdypgfporuy.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpleXhodnJ5bWpkeXBnZnBvcnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODU4MDgsImV4cCI6MjA4NjQ2MTgwOH0.0hC9nFXyxk-ZPoRwXZQTkVYSGA2bCIo0ZrszdJFNK74";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
