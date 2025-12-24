-- Add connectivity column to assets table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.assets 
ADD COLUMN connectivity text check (connectivity in ('Wired', 'Wireless'));
