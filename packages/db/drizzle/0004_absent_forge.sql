CREATE TABLE IF NOT EXISTS "open_egypt"."price_changes_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"brand_name" text NOT NULL,
	"report_date" date NOT NULL,
	"new_entries" integer DEFAULT 0 NOT NULL,
	"updated_entries" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brand_date_unique" UNIQUE("brand_id","report_date")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "report_date_idx" ON "open_egypt"."price_changes_report" ("report_date");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."price_changes_report" ADD CONSTRAINT "price_changes_report_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "open_egypt"."brands"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
