ALTER TABLE "open_egypt"."brands" RENAME COLUMN "name" TO "name_en";--> statement-breakpoint
ALTER TABLE "open_egypt"."models" RENAME COLUMN "name" TO "name_en";--> statement-breakpoint
ALTER TABLE "open_egypt"."variants" RENAME COLUMN "name" TO "name_en";--> statement-breakpoint
ALTER TABLE "open_egypt"."brands" ADD COLUMN "name_ar" text;--> statement-breakpoint
ALTER TABLE "open_egypt"."models" ADD COLUMN "name_ar" text;--> statement-breakpoint
ALTER TABLE "open_egypt"."variants" ADD COLUMN "name_ar" text;