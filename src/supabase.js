import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://iefaujrbqsntgbwszzfy.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_a4wuI9JTUhEeKyg-UOXBZQ_vR8qChwW';

export const supabase = url && key ? createClient(url, key) : null;