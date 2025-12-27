export interface Partner {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  tier: 'free' | 'partner';
  status: 'ACTIVE' | 'REJECTED' | 'PENDING';
  subscription_status: 'active' | 'verification_pending' | 'inactive';
  kyc_data?: {
    business_name?: string;
    website?: string;
    billing_email?: string;
  };
  phone_number?: string;
  use_case?: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  partner_id: string;
  prefix: string;
  created_at: string;
  is_revoked: boolean;
}
