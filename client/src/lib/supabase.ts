import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env.local file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "owner" | "manager" | "qc_rep";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  warehouse_id?: string | null;
  created_at?: string;
}
