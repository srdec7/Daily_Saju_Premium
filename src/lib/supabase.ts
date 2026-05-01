import { createClient } from '@supabase/supabase-js';

// Fallback to hardcoded public keys if .env is missing during local Capacitor/Xcode builds
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yjubnrongyvkstpttzzc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mYGgEMZjfATXynzMI5lRWg_XmEb75mb';

export const supabase = createClient(supabaseUrl, supabaseKey);
