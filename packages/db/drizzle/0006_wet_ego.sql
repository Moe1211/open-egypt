ALTER TABLE "open_egypt"."partners" ADD COLUMN "tier" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "open_egypt"."partners" ADD COLUMN "subscription_status" text DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE "open_egypt"."partners" ADD COLUMN "kyc_data" jsonb;--> statement-breakpoint
ALTER TABLE "open_egypt"."partners" ADD COLUMN "billing_email" text;--> statement-breakpoint
ALTER TABLE "open_egypt"."partners" ADD COLUMN "last_payment_date" timestamp;