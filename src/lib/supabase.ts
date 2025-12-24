import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  password_hash: string;
  is_admin: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  author: string;
  password_hash: string;
  is_admin: boolean;
  created_at: string;
}

export interface Visitor {
  id: string;
  ip_address: string;
  visit_date: string;
  created_at: string;
}

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}
