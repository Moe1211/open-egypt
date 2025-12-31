-- Enable RLS on api_usage
ALTER TABLE "open_egypt"."api_usage" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view usage for keys they own (via partner)
CREATE POLICY "Users can view own api_usage" ON "open_egypt"."api_usage"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "open_egypt"."api_keys" k
            JOIN "open_egypt"."partners" p ON k.partner_id = p.id
            WHERE k.id = "open_egypt"."api_usage"."key_id"
            AND p.owner_user_id = auth.uid()
        )
    );
