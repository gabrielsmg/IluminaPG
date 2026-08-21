const SUPABASE_URL = "SUA_PROJECT_URL_AQUI";
const SUPABASE_ANON_KEY = "SUA_PUBLISHABLE_KEY_AQUI";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
