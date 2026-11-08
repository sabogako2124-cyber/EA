// =========================================
// SUPABASE CONFIGURATION
// =========================================

import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Supabase Project Credentials
const SUPABASE_URL = "https://zvfwqblfoydpufooppzr.supabase.co";

const SUPABASE_KEY = "sb_publishable_hNgb2Ud0k9uqwM8kN0Ea-A_7eoJa7t_";

// Initialize Supabase
export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);