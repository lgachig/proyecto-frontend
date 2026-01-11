import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// We use createBrowserClient to synchronize cookies with the Middleware
export const supabase = createBrowserClient( supabaseUrl, supabaseAnonKey)

//Log in
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

//Register new user
export const register = async ({ email, password, full_name, institutional_id, role_id }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        institutional_id,
        role_id,
        email_verified: true
      }
    }
  });

  if (error) throw error;
  return data;
};

//Update Function: Synchronizes Auth and the Vehicle table
export const updateFullUserProfile = async (userId, userData) => {
  // 1. Update data in the Authentication layer (Metadata)
  const { error: authError } = await supabase.auth.updateUser({
    email: userData.email,
    data: { 
      full_name: userData.name,
      phone: userData.phone 
    }
  })
  if (authError) throw authError

  // 2. Update the 'profiles' table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      full_name: userData.name,
      phone: userData.phone 
    })
    .eq('id', userId)

  if (profileError) throw profileError

  // 3. Update or Insert into the vehicle table
  const { error: vehicleError } = await supabase
    .from('vehicles')
    .upsert({
      user_id: userId,
      license_plate: userData.plate.toUpperCase(),
      make: userData.make,
      model: userData.model,
      color: userData.color
    }, { 
      onConflict: 'user_id'
    })

  if (vehicleError) throw vehicleError

  return { success: true }
}