-- Remove unique constraint from serial_number
-- Run this in your Supabase SQL Editor

ALTER TABLE public.assets 
DROP CONSTRAINT assets_serial_number_key;
