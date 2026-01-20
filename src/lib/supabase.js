import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://iikocmitzoznwqrjjonh.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpa29jbWl0em96bndxcmpqb25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDg4NzksImV4cCI6MjA4MzU4NDg3OX0.6hlEXCvaJ_IpbpXC_DpZ1a--czXvxOEo1RNnGpqHUfI"
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'uce-parking-auth'
    }
  }
)