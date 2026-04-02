// Auto-select storage based on environment
// Use Supabase in production (online), SQLite for local development
import { SQLiteStorage } from "./sqlite-storage";
import { SupabaseStorage } from "./supabase-storage";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Use Supabase if credentials are provided, otherwise use SQLite
const useSupabase = !!(supabaseUrl && supabaseKey);

if (useSupabase) {
  console.log("🗄️  Using Supabase (cloud database)");
  console.log(`   URL: ${supabaseUrl}`);
} else {
  console.log("🗄️  Using SQLite (local database)");
}

export const storage = useSupabase 
  ? new SupabaseStorage() 
  : new SQLiteStorage();

export type { IStorage } from "./sqlite-storage";
