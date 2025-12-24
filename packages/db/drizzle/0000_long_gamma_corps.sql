CREATE SCHEMA "open_egypt";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_egypt"."brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"website" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_egypt"."models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_egypt"."price_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"year_model" integer NOT NULL,
	"price_amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'EGP' NOT NULL,
	"type" text NOT NULL,
	"source_url" text,
	"is_verified" boolean DEFAULT false,
	"confidence_score" integer DEFAULT 0,
	"valid_from" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_egypt"."variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"name" text NOT NULL,
	"transmission" text,
	"engine_cc" integer,
	"specs" jsonb
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."models" ADD CONSTRAINT "models_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "open_egypt"."brands"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."price_entries" ADD CONSTRAINT "price_entries_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "open_egypt"."variants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_egypt"."variants" ADD CONSTRAINT "variants_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "open_egypt"."models"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
