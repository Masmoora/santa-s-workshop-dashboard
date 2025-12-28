-- Add country column to addresses table
ALTER TABLE public.addresses ADD COLUMN country text NOT NULL DEFAULT '';