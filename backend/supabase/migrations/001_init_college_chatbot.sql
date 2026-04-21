create extension if not exists pgcrypto;

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    name text not null,
    password_hash text not null,
    role text not null default 'student' check (role in ('student', 'admin')),
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    user_message text not null,
    bot_response text not null,
    source text not null,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_chat_messages_user_id on public.chat_messages(user_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at desc);

alter table public.users disable row level security;
alter table public.chat_messages disable row level security;
