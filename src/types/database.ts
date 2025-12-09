export interface Portal {
  id: string
  name: string
  slug: string
  domain: string
  tagline: string | null
  primary_color: string
  secondary_color: string | null
  logo_url: string | null
  og_image_url: string | null
  ga_measurement_id: string | null
  gtm_container_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Edition {
  id: string
  portal_id: string
  name: string
  year: number
  season: 'spring' | 'winter' | 'fall' | null
  location: string | null
  pdf_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  og_image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyEdition {
  id: string
  company_id: string
  edition_id: string
  display_order: number
  created_at: string
}

export interface CompanyPage {
  id: string
  company_edition_id: string
  page_number: number
  image_url: string
  created_at: string
}

export interface Fair {
  id: string
  portal_id: string
  name: string
  date: string | null
  time_start: string | null
  time_end: string | null
  location_name: string | null
  location_address: string | null
  description: string | null
  map_svg_url: string | null
  og_image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FairExhibitor {
  id: string
  fair_id: string
  company_id: string
  booth_id: string | null
  created_at: string
}

export interface Contest {
  id: string
  fair_id: string
  name: string
  description: string | null
  prize: string | null
  ecomail_list_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContestEntry {
  id: string
  contest_id: string
  name: string
  email: string
  gdpr_consent: boolean
  synced_to_ecomail: boolean
  created_at: string
}

// Joined types
export interface CompanyWithPages extends Company {
  pages?: CompanyPage[]
}

export interface CompanyEditionWithDetails extends CompanyEdition {
  company?: Company
  edition?: Edition
  pages?: CompanyPage[]
}

export interface EditionWithCompanies extends Edition {
  companies?: CompanyWithPages[]
}

export interface FairWithExhibitors extends Fair {
  exhibitors?: (FairExhibitor & { company: Company })[]
}
