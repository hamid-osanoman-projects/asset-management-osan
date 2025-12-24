-- Add company and custom_id columns to employees table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.employees 
ADD COLUMN company text,
ADD COLUMN custom_id text;
