import { pgSchema, uuid, text, integer, decimal, timestamp, boolean, jsonb, unique, index, date, primaryKey } from 'drizzle-orm/pg-core';

export const openEgyptSchema = pgSchema('open_egypt');

// -- API Tiers & Config --

export const apiTiers = openEgyptSchema.table('api_tiers', {
  id: text('id').primaryKey(), // 'free', 'partner', 'enterprise'
  requestsPerHour: integer('requests_per_hour').notNull(),
  description: text('description'),
});

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
  partnerId: uuid('partner_id').references(() => partners.id), // Nullable for system-scraped data
  createdAt: timestamp('created_at').defaultNow(),
});

// -- Partner Portal & Auth --

export const partners = openEgyptSchema.table('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: text('status').default('PENDING').notNull(), // PENDING, ACTIVE, REVOKED, REJECTED
  type: text('type').default('DEVELOPER').notNull(), // DEALER, DEVELOPER
  contactInfo: jsonb('contact_info'),
  ownerUserId: uuid('owner_user_id'), // Link to Supabase Auth User ID
  createdAt: timestamp('created_at').defaultNow(),
  // Phase 2: Verification & Billing
  tier: text('tier').default('free').notNull(),
  subscriptionStatus: text('subscription_status').default('inactive'), // inactive, active, past_due, verification_pending
  kycData: jsonb('kyc_data'),
  billingEmail: text('billing_email'),
  lastPaymentDate: timestamp('last_payment_date'),
});

export const apiKeys = openEgyptSchema.table('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  tierId: text('tier_id').references(() => apiTiers.id).default('free'),
  name: text('name'), // User-friendly name e.g. "My App"
  keyHash: text('key_hash').notNull(),
  prefix: text('prefix').notNull(), // Store first 8 chars for display
  createdAt: timestamp('created_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  isRevoked: boolean('is_revoked').default(false),
});

export const apiUsage = openEgyptSchema.table('api_usage', {
  keyId: uuid('key_id').references(() => apiKeys.id).notNull(),
  hourBucket: timestamp('hour_bucket').notNull(),
  count: integer('count').default(0).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.keyId, table.hourBucket] }),
}));

// -- Audit & Logs --

export const auditLogs = openEgyptSchema.table('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  partnerId: uuid('partner_id').references(() => partners.id),
  action: text('action').notNull(), // UPDATE, CREATE, DELETE
  entityTable: text('entity_table').notNull(),
  entityId: uuid('entity_id').notNull(),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const priceChangeLogs = openEgyptSchema.table('price_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  priceEntryId: uuid('price_entry_id').references(() => priceEntries.id).notNull(),
  oldPrice: decimal('old_price', { precision: 12, scale: 2 }),
  newPrice: decimal('new_price', { precision: 12, scale: 2 }).notNull(),
  changedByPartnerId: uuid('changed_by_partner_id').references(() => partners.id),
  createdAt: timestamp('created_at').defaultNow(),
});


    export const priceChangesReport = openEgyptSchema.table('price_changes_report', {
      id: uuid('id').defaultRandom().primaryKey(),
      brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull
  (),
      brandName: text('brand_name').notNull(),
      reportDate: date('report_date').notNull(),
      newEntries: integer('new_entries').default(0).notNull(),
      updatedEntries: integer('updated_entries').default(0).notNull(),
      createdAt: timestamp('created_at').defaultNow().notNull(),
    }, (table) => {
     return {
       brandDateUnique: unique('brand_date_unique').on(table.brandId, table.reportDate),
       dateIdx: index('report_date_idx').on(table.reportDate),
     };
   });