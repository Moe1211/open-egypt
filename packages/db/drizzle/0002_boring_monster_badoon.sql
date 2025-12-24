CREATE TABLE IF NOT EXISTS "open_egypt"."api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid NOT NULL,
	"key_hash" text NOT NULL,
	"prefix" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"last_used_at" timestamp,
	"is_revoked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_egypt"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid,
	"action" text NOT NULL,
	"entity_table" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_egypt"."partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"contact_info" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "partners_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_egypt"."price_change_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price_entry_id" uuid NOT NULL,
	"old_price" numeric(12, 2),
	"new_price" numeric(12, 2) NOT NULL,
	"changed_by_partner_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "open_egypt"."price_entries" ADD COLUMN "partner_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."price_entries" ADD CONSTRAINT "price_entries_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "open_egypt"."partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."api_keys" ADD CONSTRAINT "api_keys_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "open_egypt"."partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."audit_logs" ADD CONSTRAINT "audit_logs_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "open_egypt"."partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."price_change_logs" ADD CONSTRAINT "price_change_logs_price_entry_id_price_entries_id_fk" FOREIGN KEY ("price_entry_id") REFERENCES "open_egypt"."price_entries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."price_change_logs" ADD CONSTRAINT "price_change_logs_changed_by_partner_id_partners_id_fk" FOREIGN KEY ("changed_by_partner_id") REFERENCES "open_egypt"."partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
