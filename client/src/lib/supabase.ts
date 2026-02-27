import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log("[Supabase Client] Initializing...");
console.log("[Supabase Client] URL:", supabaseUrl);
console.log(
  "[Supabase Client] Anon Key (first 50 chars):",
  supabaseAnonKey?.substring(0, 50),
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase Client] Missing environment variables!");
  console.error("[Supabase Client] URL exists:", !!supabaseUrl);
  console.error("[Supabase Client] Key exists:", !!supabaseAnonKey);
  console.warn(
    "Missing Supabase environment variables. Some features will be disabled. Check your .env file.",
  );
}

console.log("[Supabase Client] Creating client...");
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in localStorage for persistence across page reloads
    storage: window.localStorage,
    storageKey: "godam-auth-token",
    autoRefreshToken: true, // Automatically refresh tokens before expiry
    persistSession: true, // Persist session across browser sessions
    detectSessionInUrl: true, // Detect auth redirects with session in URL
    // Prevent storage lock issues by allowing requests to steal locks
    flowType: "pkce",
  },
});
console.log(
  "[Supabase Client] Client created successfully with session persistence",
);

// ─── Auth types ───────────────────────────────────────────────────────────────
export type UserRole = "owner" | "manager" | "qc_rep";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  warehouse_id?: string | null;
  created_at?: string;
}

// ─── Warehouse types ──────────────────────────────────────────────────────────
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Batch types ──────────────────────────────────────────────────────────────
export type BatchStatus = "active" | "dispatched" | "expired";

export interface Batch {
  id: string;
  batch_id: string;
  farmer_id: string;
  farmer_name?: string | null;
  farmer_contact?: string | null;
  crop: string;
  variety?: string | null;
  quantity: number;
  unit: string;
  entry_date: string;
  shelf_life: number;
  risk_score: number;
  zone: string;
  warehouse_id: string;
  status: BatchStatus;
  temperature?: number | null;
  humidity?: number | null;
  ethylene?: string | null;
  co2?: string | null;
  ammonia?: string | null;
  destination?: string | null;
  dispatch_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BatchInsert {
  batch_id: string;
  farmer_id: string;
  farmer_name?: string;
  farmer_contact?: string;
  crop: string;
  variety?: string;
  quantity: number;
  unit: string;
  shelf_life: number;
  zone: string;
  warehouse_id: string;
  temperature?: number;
  humidity?: number;
}

export interface BatchUpdate {
  farmer_name?: string;
  farmer_contact?: string;
  crop?: string;
  variety?: string;
  quantity?: number;
  unit?: string;
  shelf_life?: number;
  zone?: string;
  status?: BatchStatus;
  temperature?: number;
  humidity?: number;
  destination?: string;
  dispatch_date?: string;
}

// ─── Alert types ──────────────────────────────────────────────────────────────
export type AlertSeverity = "warning" | "critical";
export type AlertType =
  | "temperature"
  | "humidity"
  | "ethylene"
  | "co2"
  | "ammonia";

export interface Alert {
  id: string;
  warehouse_id: string;
  zone: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  message: string;
  current_value: number;
  threshold_value: number;
  acknowledged: boolean;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  triggered_at: string;
  created_at: string;
}
