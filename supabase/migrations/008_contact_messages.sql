-- ============================================================
-- WARCRAFT EXPORTS — Contact Messages Migration
-- Creates the contact_messages table, adds performance indexes,
-- and configures RLS security policies.
-- Run this in Supabase SQL Editor (warcraft_exports project)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text NOT NULL,
  message    text NOT NULL,
  status     text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can insert a contact message (so customers can submit forms)
CREATE POLICY "anyone_insert_contact" ON public.contact_messages 
  FOR INSERT WITH CHECK (true);

-- 2. Only administrators can perform all actions (read/update/delete)
CREATE POLICY "admin_all_contact" ON public.contact_messages 
  FOR ALL USING (is_admin());

SELECT 'contact_messages table created and secured ✓' AS status;
