import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Some features will be disabled. Check your .env file.",
  );
}

// Use placeholder values if not configured yet
const url = supabaseUrl || "https://placeholder.supabase.co";
const key = supabaseAnonKey || "placeholder-key";

export const supabase = createClient(url, key);

export type UserRole = "owner" | "manager" | "qc_rep";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  warehouse_id?: string | null;
  created_at?: string;
}
