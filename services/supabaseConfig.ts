import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Get these from your Supabase project: https://app.supabase.com
// Go to Project Settings > API
const supabaseUrl = 'https://osstbxuepumtuqithjig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zc3RieHVlcHVtdHVxaXRoamlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NzExODMsImV4cCI6MjA4MzE0NzE4M30.J2LkZmJDdEIEq4EgM4KEVJYaTe2NNS03LmfnTdk55qE';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

