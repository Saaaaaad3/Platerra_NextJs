-- Brand Kit storage — run once in the Supabase SQL editor.
--
-- A single nullable JSONB column holds the whole Brand Kit. NULL = default theme,
-- so existing restaurants are untouched. New branding fields (typography, presets,
-- seasonal, AI) are added INSIDE the JSON later and need NO further migration.
-- Validation lives in the app (lib/branding/parseBranding), not in Postgres.

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS branding jsonb;

-- Example: give one restaurant a gold-and-black Brand Kit (Shalimar).
-- Replace the slug with the real one.
--
-- UPDATE restaurants
-- SET branding = '{
--   "version": 1,
--   "colors": { "primary": "#0b0b0b", "secondary": "#1f1f1f", "accent": "#c8a04f" }
-- }'::jsonb
-- WHERE slug = 'shalimar';
