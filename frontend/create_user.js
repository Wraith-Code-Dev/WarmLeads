require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpAdmin() {
  console.log('Attempting to create admin user...');
  const { data, error } = await supabase.auth.signUp({
    email: 'ADMIN@WARMLEADS.AI',
    password: 'admin123',
  });
  
  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully!');
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      console.log('Note: This email might already be registered.');
    }
  }
}

signUpAdmin();
