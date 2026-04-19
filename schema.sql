-- Supabase SQL schema for IELTS Productivity Web App
-- NOTE: Please execute this in your Supabase SQL Editor.

-- Users Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Daily Progress Table
CREATE TABLE daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Listening
  listening_tests_done INT DEFAULT 0,
  listening_correct_answers INT DEFAULT 0,
  listening_total_questions INT DEFAULT 0,
  
  -- Reading
  reading_passages_done INT DEFAULT 0,
  reading_correct_answers INT DEFAULT 0,
  reading_total_questions INT DEFAULT 0,
  
  -- Tasks
  writing_task1_done BOOLEAN DEFAULT FALSE,
  writing_task2_done BOOLEAN DEFAULT FALSE,
  mistakes_analyzed BOOLEAN DEFAULT FALSE,
  synonyms_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Ensure only one entry per user per day
  UNIQUE(user_id, date)
);

-- Daily Vocabulary Table
CREATE TABLE daily_vocab (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  words JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note: No Row Level Security (RLS) is applied here because
-- the Node.js backend handles all the database operations using
-- the Supabase URL and ANON/SERVICE Key. Our backend acts as the secure gatekeeper.
