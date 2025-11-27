// Supabase Configuration
// Replace with your actual Supabase URL and anon key after setup

export const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL', // Replace with your project URL
  anonKey: 'YOUR_SUPABASE_ANON_KEY' // Replace with your anon key
};

// Database Schema for reference:
/*
-- Meetings table
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_name TEXT,
  topic TEXT NOT NULL,
  date DATE NOT NULL,
  session TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration TEXT,
  type TEXT NOT NULL,
  site TEXT NOT NULL,
  conducted_by TEXT NOT NULL,
  conductor_signature BOOLEAN DEFAULT FALSE,
  conductor_sign_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendees table
CREATE TABLE attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  signature BOOLEAN DEFAULT FALSE,
  sign_time TIMESTAMP,
  is_late BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all operations on meetings" ON meetings FOR ALL USING (true);
CREATE POLICY "Allow all operations on attendees" ON attendees FOR ALL USING (true);
*/