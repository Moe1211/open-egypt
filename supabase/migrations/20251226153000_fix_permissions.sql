-- Grant Usage on Schema
GRANT USAGE ON SCHEMA "open_egypt" TO anon, authenticated, service_role;

-- Developer Portal Permissions (Authenticated Users)
GRANT SELECT, INSERT, UPDATE ON "open_egypt"."partners" TO authenticated;
GRANT SELECT, INSERT ON "open_egypt"."api_keys" TO authenticated;
GRANT SELECT ON "open_egypt"."api_usage" TO authenticated; -- View usage?

-- Public Data Read Access
GRANT SELECT ON "open_egypt"."brands" TO anon, authenticated;
GRANT SELECT ON "open_egypt"."models" TO anon, authenticated;
GRANT SELECT ON "open_egypt"."variants" TO anon, authenticated;
GRANT SELECT ON "open_egypt"."price_entries" TO anon, authenticated;
GRANT SELECT ON "open_egypt"."api_tiers" TO anon, authenticated;

-- Ensure Sequence Access (if any)
GRANT ALL ON ALL SEQUENCES IN SCHEMA "open_egypt" TO postgres, anon, authenticated, service_role;
