// TODO: REPLACE WITH YOUR SUPABASE PROJECT DETAILS
const SUPABASE_URL = 'https://lizriuedwqhvhcotfyvb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpenJpdWVkd3Fodmhjb3RmeXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTA2NTgsImV4cCI6MjA4MjEyNjY1OH0.IQ8_s8glkKldJWEl1JBfUYkPaoEhpWcH_CCiNfM404E';

if (SUPABASE_URL === 'https://lizriuedwqhvhcotfyvb.supabase.co' || SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpenJpdWVkd3Fodmhjb3RmeXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTA2NTgsImV4cCI6MjA4MjEyNjY1OH0.IQ8_s8glkKldJWEl1JBfUYkPaoEhpWcH_CCiNfM404E') {
    console.error('Supabase keys are missing! Please update js/supabase-client.js');
    alert('Please configure your Supabase URL and Key in js/supabase-client.js');
}

// Initialize the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabase;
