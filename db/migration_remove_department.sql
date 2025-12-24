-- Remove department column as it is replaced by Company
-- Run this in your Supabase SQL Editor

ALTER TABLE public.employees 
DROP COLUMN department;
