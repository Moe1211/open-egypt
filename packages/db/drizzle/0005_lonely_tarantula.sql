CREATE TABLE IF NOT EXISTS "open_egypt"."api_tiers" (
	"id" text PRIMARY KEY NOT NULL,
	"requests_per_hour" integer NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_egypt"."api_usage" (
	"key_id" uuid NOT NULL,
	"hour_bucket" timestamp NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "api_usage_key_id_hour_bucket_pk" PRIMARY KEY("key_id","hour_bucket")
);
--> statement-breakpoint
ALTER TABLE "open_egypt"."partners" ALTER COLUMN "status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "open_egypt"."api_keys" ADD COLUMN "tier_id" text DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "open_egypt"."api_keys" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "open_egypt"."partners" ADD COLUMN "type" text DEFAULT 'DEVELOPER' NOT NULL;--> statement-breakpoint
ALTER TABLE "open_egypt"."partners" ADD COLUMN "owner_user_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."api_keys" ADD CONSTRAINT "api_keys_tier_id_api_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "open_egypt"."api_tiers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."api_usage" ADD CONSTRAINT "api_usage_key_id_api_keys_id_fk" FOREIGN KEY ("key_id") REFERENCES "open_egypt"."api_keys"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint
-- Seed API Tiers
INSERT INTO "open_egypt"."api_tiers" ("id", "requests_per_hour", "description")
VALUES 
    ('free', 15, 'Free tier for testing. 15 requests per hour.'),
    ('partner', 3000, 'Partner tier. 3000 requests per hour.'),
    ('enterprise', 2147483647, 'Unlimited enterprise access.')
ON CONFLICT ("id") DO UPDATE 
SET "requests_per_hour" = EXCLUDED."requests_per_hour";

--> statement-breakpoint
-- Enable RLS
ALTER TABLE "open_egypt"."partners" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "open_egypt"."api_keys" ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint
-- RLS Policies
CREATE POLICY "Users can view own partner" ON "open_egypt"."partners"
    FOR SELECT
    USING (auth.uid() = owner_user_id);

--> statement-breakpoint
CREATE POLICY "Users can update own partner" ON "open_egypt"."partners"
    FOR UPDATE
    USING (auth.uid() = owner_user_id);

--> statement-breakpoint
CREATE POLICY "Users can insert own partner" ON "open_egypt"."partners"
    FOR INSERT
    WITH CHECK (auth.uid() = owner_user_id);

--> statement-breakpoint
CREATE POLICY "Users can view own keys" ON "open_egypt"."api_keys"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "open_egypt"."partners"
            WHERE "partners"."id" = "api_keys"."partner_id"
            AND "partners"."owner_user_id" = auth.uid()
        )
    );

--> statement-breakpoint
CREATE POLICY "Users can create own keys" ON "open_egypt"."api_keys"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "open_egypt"."partners"
            WHERE "partners"."id" = "api_keys"."partner_id"
            AND "partners"."owner_user_id" = auth.uid()
        )
    );

--> statement-breakpoint
-- RPC: Increment Usage & Check Limit (Atomic)
CREATE OR REPLACE FUNCTION "open_egypt"."increment_api_usage"(p_key_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tier_limit int;
    v_count int;
    v_bucket timestamp;
    v_allowed boolean;
BEGIN
    v_bucket := date_trunc('hour', now());
    
    -- Get Limit
    SELECT t.requests_per_hour INTO v_tier_limit
    FROM "open_egypt"."api_keys" k
    JOIN "open_egypt"."api_tiers" t ON k.tier_id = t.id
    WHERE k.id = p_key_id;
    
    IF v_tier_limit IS NULL THEN
        RETURN json_build_object('allowed', false, 'error', 'Invalid Key');
    END IF;

    -- Upsert Usage
    INSERT INTO "open_egypt"."api_usage" (key_id, hour_bucket, count)
    VALUES (p_key_id, v_bucket, 1)
    ON CONFLICT (key_id, hour_bucket)
    DO UPDATE SET count = "open_egypt"."api_usage"."count" + 1
    RETURNING "count" INTO v_count;

    v_allowed := v_count <= v_tier_limit;

    RETURN json_build_object(
        'allowed', v_allowed, 
        'current_usage', v_count, 
        'limit', v_tier_limit
    );
END;
$$;
