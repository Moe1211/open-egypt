import { pgSchema, uuid, text, integer, decimal, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const openEgyptSchema = pgSchema('open_egypt');

export const brands = openEgyptSchema.table('brands', {
  id: uuid('id').defaultRandom().primaryKey(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar'),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
  website: text('website'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const models = openEgyptSchema.table('models', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id).notNull(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const variants = openEgyptSchema.table('variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  modelId: uuid('model_id').references(() => models.id).notNull(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar'),
  transmission: text('transmission'),
  engineCc: integer('engine_cc'),
  specs: jsonb('specs'),
});

export const priceEntries = openEgyptSchema.table('price_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id').references(() => variants.id).notNull(),
  yearModel: integer('year_model').notNull(),
  priceAmount: decimal('price_amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('EGP').notNull(),
  type: text('type').notNull(), // 'OFFICIAL', 'MARKET_AVG', etc.
  sourceUrl: text('source_url'),
  isVerified: boolean('is_verified').default(false),
  confidenceScore: integer('confidence_score').default(0),
  validFrom: timestamp('valid_from').defaultNow(),
});
