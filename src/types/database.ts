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

export interface HRContact {
  name?: string
  email?: string
  phone?: string
}

export interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  og_image_url: string | null
  is_active: boolean
  featured: boolean
  created_at: string
  updated_at: string

  // Nova pole pro Homepage
  location: string[]
  sectors: string[]
  opportunities: string[]
  positions: string[]
  description: string | null
  employee_count: string | null
  years_on_market: number | null
  benefits: string[]
  hr_contact: HRContact | null
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

export interface ContactLead {
  id: string
  company_id: string | null
  portal_id: string | null
  name: string
  email: string
  phone: string | null
  message: string | null
  gdpr_consent: boolean
  source: 'contact_form' | 'fair' | string
  status: 'new' | 'contacted' | 'converted' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ClickTracking {
  id: string
  company_id: string | null
  portal_id: string | null
  action_type: 'email' | 'phone' | 'website' | 'profile_view'
  session_id: string | null
  user_agent: string | null
  referer: string | null
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

// ============================================
// ČLÁNKY / BLOG
// ============================================

export interface ArticleTag {
  id: string
  portal_id: string
  name: string
  slug: string
  created_at: string
}

export interface Article {
  id: string
  portal_id: string
  title: string
  slug: string
  perex: string
  content: string
  featured_image_url: string
  author_name: string
  status: 'draft' | 'published' | 'archived'
  sort_order: number
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ArticleGalleryImage {
  id: string
  article_id: string
  image_url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export interface ArticleTagRelation {
  article_id: string
  tag_id: string
}

// Joined types pro články
export interface ArticleWithTags extends Article {
  tags?: ArticleTag[]
}

export interface ArticleWithDetails extends Article {
  tags?: ArticleTag[]
  gallery?: ArticleGalleryImage[]
  portal?: Portal
}

export interface ArticleTagWithCount extends ArticleTag {
  article_count?: number
}

// ============================================
// PROHLÍŽEČ KATALOGU
// ============================================

export interface CatalogPage {
  id: string
  portal_id: string
  edition_id: string
  type: 'intro' | 'outro'
  page_order: number
  image_url: string
  created_at: string
  updated_at: string
}

export interface CatalogCompanyOrder {
  id: string
  portal_id: string
  edition_id: string
  company_id: string
  order_position: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

// Joined types pro katalog
export interface CatalogCompanyOrderWithCompany extends CatalogCompanyOrder {
  company?: Company
  pages?: CompanyPage[]
}

export interface CatalogData {
  introPages: CatalogPage[]
  companies: CatalogCompanyOrderWithCompany[]
  outroPages: CatalogPage[]
}
