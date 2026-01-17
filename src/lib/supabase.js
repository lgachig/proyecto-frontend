import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://iikocmitzoznwqrjjonh.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpa29jbWl0em96bndxcmpqb25oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAwODg3OSwiZXhwIjoyMDgzNTg0ODc5fQ.HvzeHJMLSbNA_3MvZF15vqooi8CgqGjjRxLIYx3OhXs"

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan las variables de entorno de Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)