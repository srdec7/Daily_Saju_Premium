import { createClient } from '@supabase/supabase-js';

// Fallback to production values to prevent fatal crash if .env file is missing during Xcode build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yjubnrongyvkstpttzzc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mYGgEMZjfATXynzMI5lRWg_XmEb75mb';

export const supabase = createClient(supabaseUrl, supabaseKey);
