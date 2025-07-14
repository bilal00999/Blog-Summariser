import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Summary {
  id?: string;
  url: string;
  english_summary: string;
  urdu_summary: string;
  created_at?: string;
}

export interface SummaryInsert {
  url: string;
  english_summary: string;
  urdu_summary: string;
}
