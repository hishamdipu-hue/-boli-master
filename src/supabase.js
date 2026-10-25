import { createClient } from '@supabase/supabase-js';

// Pin the API URL to BOLI's intended project so stale deployment variables cannot redirect its data.
const url = 'https://iefaujrbqsntgbwszzfy.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_a4wuI9JTUhEeKyg-UOXBZQ_vR8qChwW';

export const supabase = url && key ? createClient(url, key) : null;