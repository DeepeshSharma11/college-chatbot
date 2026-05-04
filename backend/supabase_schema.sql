-- ==========================================
-- SUPABASE SCHEMA SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Users Table (Safe creation)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Chat Messages Table (Safe creation)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Indexes for Performance
-- Note: Indexes don't support "IF NOT EXISTS" in the exact same simple way in older Postgres, 
-- but in modern Postgres we can use IF NOT EXISTS.
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid errors when re-running)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can insert own messages" ON chat_messages;
END $$;

-- 6. Create Policies
CREATE POLICY "Users can view own messages" ON chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- UTILITY (DANGER ZONE):
-- If you ever want to completely reset the tables, 
-- you can UNCOMMENT and run these lines:
-- ==========================================
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
