-- ==========================================
-- SUPABASE SCHEMA SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Users Table
-- NOTE: password_hash is empty string ('') for Supabase Auth users
--       since their password is managed by Supabase Auth, not our app.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. If users table already exists but password_hash has NOT NULL without default, fix it:
ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT '';
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Create Chat Messages Table
-- user_id is TEXT (not UUID FK) so anonymous users can also have messages stored
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'unknown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies (safe to re-run)
DO $$
BEGIN
    DROP POLICY IF EXISTS "service_role full access users" ON users;
    DROP POLICY IF EXISTS "service_role full access chat_messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can insert own messages" ON chat_messages;
END $$;

-- 7. Allow service_role (our backend) full access — frontend never touches DB directly
CREATE POLICY "service_role full access users" ON users
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role full access chat_messages" ON chat_messages
    USING (true)
    WITH CHECK (true);

-- ==========================================
-- RESET (DANGER ZONE):
-- Uncomment only if you want to wipe everything:
-- ==========================================
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
