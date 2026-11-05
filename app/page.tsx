'use client'

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ChangeEvent, type FormEvent, type KeyboardEvent, type PointerEvent, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { AlertTriangle, ArrowRight, BarChart2, Bath, Bed, Building2, Calendar, Check, CheckCircle2, CreditCard, Flame, Heart, ImagePlus, LayoutGrid, Loader2, Lock, Map as MapIcon, MapPin, Maximize, Menu, MessageCircle, MoveHorizontal, Radio, Repeat2, RotateCcw, Search, Send, ShieldCheck, SlidersHorizontal, Sparkles, Star, Upload, Wand2, X, Zap, BadgeCheck, Briefcase, Phone, Car, Cpu, Factory, Tag } from 'lucide-react'

// ---------------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------------

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// listings & types
// ---------------------------------------------------------------------------

type MarketCategory = 'real-estate' | 'vehicles' | 'electronics' | 'industrial' | 'services'

const MARKET_CATEGORIES: { value: MarketCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Items' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'vehicles', label: 'Vehicles & Motors' },
  { value: 'electronics', label: 'Electronics & Tech' },
  { value: 'industrial', label: 'Industrial & Factory' },
  { value: 'services', label: 'Services & Business Ads' },
]

type MarketFilter = (typeof MARKET_CATEGORIES)[number]['value']

const MARKET_CATEGORY_ICONS: Record<MarketFilter, typeof Building2> = {
  all: LayoutGrid,
  'real-estate': Building2,
  vehicles: Car,
  electronics: Cpu,
  industrial: Factory,
  services: Briefcase,
}

// ---------------------------------------------------------------------------
// countries & regions
// ---------------------------------------------------------------------------

const COUNTRY_GROUPS = [
  {
    region: 'Middle East',
    countries: [
      { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
      { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
      { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
      { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
      { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
      { code: 'OM', name: 'Oman', flag: '🇴🇲' },
    ],
  },
  {
    region: 'Asia & Asia-Pacific',
    countries: [
      { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
      { code: 'JP', name: 'Japan', flag: '🇯🇵' },
      { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
      { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
      { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
      { code: 'IN', name: 'India', flag: '🇮🇳' },
      { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
      { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
      { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    ],
  },
  {
    region: 'Europe & Americas',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    ],
  },
] as const

type CountryCode = (typeof COUNTRY_GROUPS)[number]['countries'][number]['code']
type CountryFilter = CountryCode | 'all'

const ALL_COUNTRIES: readonly { code: CountryCode; name: string; flag: string }[] = COUNTRY_GROUPS.flatMap(
  (g): readonly { code: CountryCode; name: string; flag: string }[] => g.countries,
)

// Shortlist shown in the Hero search bar's country dropdown.
const HERO_COUNTRY_CODES: readonly CountryCode[] = ['US', 'GB', 'AE', 'SA', 'QA', 'SG', 'JP', 'DE', 'CA', 'AU']

function countryLabel(code: CountryFilter) {
  if (code === 'all') return 'All Countries'
  return ALL_COUNTRIES.find((c) => c.code === code)?.name ?? code
}

interface Seller {
  name: string
  agency: string
  initials: string
  responseTime: string
  isVerifiedAgent?: boolean
  /** Seller subscribes to the $15/month Verified Seller plan. */
  plan?: 'verified-seller'
  /** Public business phone, shown as a Call button for Verified Seller subscribers. */
  phone?: string
}

interface Listing {
  id: string
  title: string
  location: string
  /** Country the item is located in, used by the search bar's country filter. */
  country: CountryCode
  marketCategory: MarketCategory
  /** Short type label shown on the card, e.g. "Raw Land / Plot" or "Luxury Sedan". */
  subcategory: string
  condition: string
  price: string
  /** Optional price suffix, e.g. "/ hr" for service ads. */
  priceNote?: string
  /** Up to three headline specs shown as chips on the card. */
  specs: string[]
  /** Main photo (the AI-enhanced version when `rawImage` is set). */
  image: string
  /** Original photo. When set, cards show a before/after slider. */
  rawImage?: string
  /** Label for the enhanced side of the slider. */
  enhancedLabel?: string
  description: string
  features: string[]
  seller: Seller
  listedDaysAgo: number
  /** Listing has passed ownership & document checks. Shows the "Verified Listing" badge. */
  isVerifiedListing?: boolean
  /** Approximate location, used to place the pin in Map View. */
  coordinates: { lat: number; lng: number }
}

const LISTINGS: Listing[] = [
  {
    id: 'austin-land-plot',
    title: 'Austin Hillside Development Plot',
    location: 'Austin, TX',
    country: 'US',
    marketCategory: 'real-estate',
    subcategory: 'Raw Land / Plot',
    condition: 'Shovel-ready',
    price: '$450,000',
    specs: ['0.42 acres', 'Zoned R-1', '18,500 sqft'],
    rawImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    enhancedLabel: 'AI Render',
    description:
      '0.42 acres of pristine sloping land with panoramic hill country views. Zoned R-1 with utility hookups available at curb. Rendered vision shows potential 4,200 sqft modern cantilevered villa.',
    features: ['0.42 Acres', 'Hill country views', 'Utilities at street', 'Architectural plans optional'],
    seller: { name: 'Maya Chen', agency: 'Lone Star Urban Realty', initials: 'MC', responseTime: '~10 min', isVerifiedAgent: true },
    listedDaysAgo: 2,
    isVerifiedListing: true,
    coordinates: { lat: 30.34, lng: -97.86 },
  },
  {
    id: 'commercial-warehouse',
    title: 'Commercial Distribution Warehouse',
    location: 'Dallas, TX',
    country: 'US',
    marketCategory: 'real-estate',
    subcategory: 'Commercial Warehouse',
    condition: 'Move-in ready',
    price: '$2,850,000',
    specs: ['42,000 sqft', '32 ft clear height', '8 dock doors'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80',
    description:
      'Class A distribution facility minutes from I-35E with heavy racking already installed, ESFR sprinklers, and a fenced truck court. Ideal for e-commerce fulfilment or 3PL operations.',
    features: ['ESFR sprinklers', 'Heavy racking included', 'Fenced truck court', '3-phase power'],
    seller: { name: 'Marcus Lee', agency: 'Metroplex Commercial Group', initials: 'ML', responseTime: '~20 min', isVerifiedAgent: true },
    listedDaysAgo: 4,
    isVerifiedListing: true,
    coordinates: { lat: 32.78, lng: -96.8 },
  },
  {
    id: 'luxury-sedan',
    title: '2022 BMW M5 Competition',
    location: 'Miami, FL',
    country: 'US',
    marketCategory: 'vehicles',
    subcategory: 'Luxury Sedan',
    condition: 'Used – Excellent',
    price: '$89,900',
    specs: ['12,400 mi', '617 hp V8', 'Automatic'],
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80',
    description:
      'One-owner M5 Competition in Brands Hatch Grey with full dealer service history, clean title, and remaining factory warranty. Carbon ceramic brakes and Executive Package.',
    features: ['Clean title', 'Dealer serviced', 'Carbon ceramic brakes', 'Factory warranty'],
    seller: { name: 'Daniel Ortiz', agency: 'Coastal Prestige Motors', initials: 'DO', responseTime: '~15 min', isVerifiedAgent: true },
    listedDaysAgo: 1,
    isVerifiedListing: true,
    coordinates: { lat: 25.76, lng: -80.19 },
  },
  {
    id: 'industrial-generator',
    title: '500 kW Industrial Diesel Generator',
    location: 'Houston, TX',
    country: 'US',
    marketCategory: 'industrial',
    subcategory: 'Power Generation',
    condition: 'Refurbished',
    price: '$64,500',
    specs: ['500 kW / 625 kVA', '1,820 run hrs', '480V 3-phase'],
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1600&q=80',
    description:
      'Fully load-bank tested standby generator with sound-attenuated enclosure and automatic transfer switch. Ideal backup power for factories, data centres, and hospitals.',
    features: ['Load-bank tested', 'Sound-attenuated enclosure', 'ATS included', 'Freight available'],
    seller: { name: 'Priya Nair', agency: 'Gulf Industrial Supply', initials: 'PN', responseTime: '~1 hr', isVerifiedAgent: true },
    listedDaysAgo: 6,
    isVerifiedListing: true,
    coordinates: { lat: 29.76, lng: -95.37 },
  },
  {
    id: 'mac-studio',
    title: 'Apple Mac Studio (M2 Ultra)',
    location: 'San Francisco, CA',
    country: 'US',
    marketCategory: 'electronics',
    subcategory: 'Desktop Computer',
    condition: 'Like New',
    price: '$3,299',
    specs: ['M2 Ultra 24-core', '64GB RAM', '2TB SSD'],
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1600&q=80',
    description:
      'Barely used Mac Studio from a design studio upgrade. Original box, AppleCare+ until 2027, battery-free desktop with zero cosmetic wear. Local pickup or insured shipping.',
    features: ['AppleCare+ until 2027', 'Original packaging', 'Zero cosmetic wear', 'Insured shipping'],
    seller: { name: 'Alex Kim', agency: 'Bay Area Tech Resale', initials: 'AK', responseTime: '~5 min', isVerifiedAgent: true },
    listedDaysAgo: 3,
    isVerifiedListing: true,
    coordinates: { lat: 37.77, lng: -122.42 },
  },
  {
    id: 'skyline-loft',
    title: 'Skyline Loft',
    location: 'Austin, TX',
    country: 'US',
    marketCategory: 'real-estate',
    subcategory: 'Apartment · Living Room',
    condition: 'Renovated',
    price: '$685,000',
    specs: ['2 bd · 2 ba', '1,240 sqft', '14 ft ceilings'],
    rawImage: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    enhancedLabel: 'AI Staged',
    description:
      'A sun-filled downtown loft with 14-foot ceilings, polished concrete floors, and unobstructed skyline views. Walking distance to Lady Bird Lake and the Rainey Street district.',
    features: ['14 ft ceilings', 'Skyline views', 'Rooftop pool access', 'Secured parking'],
    seller: { name: 'Maya Chen', agency: 'Lone Star Urban Realty', initials: 'MC', responseTime: '~10 min', isVerifiedAgent: true },
    listedDaysAgo: 3,
    isVerifiedListing: true,
    coordinates: { lat: 30.26, lng: -97.74 },
  },
  {
    id: 'harbor-kitchen',
    title: 'Harbor View Residence',
    location: 'Seattle, WA',
    country: 'US',
    marketCategory: 'real-estate',
    subcategory: 'House · Kitchen',
    condition: 'Renovated',
    price: '$1,120,000',
    specs: ['3 bd · 2.5 ba', '2,100 sqft', 'Bay views'],
    rawImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
    enhancedLabel: 'AI Staged',
    description:
      'Renovated chef’s kitchen with a quartz island overlooking Elliott Bay. Bright, open-plan living with radiant floor heating throughout the main level.',
    features: ['Quartz island', 'Bay views', 'Radiant heating', 'EV charger'],
    seller: { name: 'Jonas Berg', agency: 'Pacific Crest Homes', initials: 'JB', responseTime: '~1 hr', isVerifiedAgent: false },
    listedDaysAgo: 7,
    isVerifiedListing: true,
    coordinates: { lat: 47.61, lng: -122.35 },
  },
  {
    id: 'product-photography',
    title: 'Pro Product & Property Photography',
    location: 'Phoenix, AZ',
    country: 'US',
    marketCategory: 'services',
    subcategory: 'Business Service',
    condition: 'Available this week',
    price: '$120',
    priceNote: '/ hr',
    specs: ['Same-day edits', 'Drone add-on', 'Studio or on-site'],
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80',
    description:
      'Commercial photographer for listings, dealerships, and online stores. Packages include lighting setup, retouching, and AI-ready raw files for the Aether Enhancer Studio.',
    features: ['Licensed drone pilot', 'Retouching included', 'Commercial usage rights', '48-hour delivery'],
    seller: {
      name: 'Elena Ruiz',
      agency: 'Sonoran Visual Co.',
      initials: 'ER',
      responseTime: '~30 min',
      isVerifiedAgent: true,
      plan: 'verified-seller',
      phone: '+1 (602) 555-0148',
    },
    listedDaysAgo: 5,
    coordinates: { lat: 33.45, lng: -112.07 },
  },
  {
    id: 'licensed-electrician',
    title: 'Licensed Electrician & Generator Installs',
    location: 'Denver, CO',
    country: 'US',
    marketCategory: 'services',
    subcategory: 'Contractor Service',
    condition: 'Booking next 48 hrs',
    price: '$95',
    priceNote: '/ hr',
    specs: ['Master licensed', 'Insured to $2M', 'Emergency call-outs'],
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1600&q=80',
    description:
      'Residential and light-commercial electrical work: panel upgrades, EV chargers, standby generator installs, and code-compliance inspections. Free on-site quotes across the Denver metro.',
    features: ['Free on-site quotes', 'Panel & EV charger upgrades', 'Standby generator installs', '1-year workmanship warranty'],
    seller: {
      name: 'Tyrone Brooks',
      agency: 'Brooks Electric LLC',
      initials: 'TB',
      responseTime: '~10 min',
      isVerifiedAgent: true,
      plan: 'verified-seller',
      phone: '+1 (303) 555-0172',
    },
    listedDaysAgo: 1,
    coordinates: { lat: 39.74, lng: -104.99 },
  },
  {
    id: 'refurbished-macbook',
    title: 'Refurbished MacBook Pro 14" (M3 Pro)',
    location: 'Chicago, IL',
    country: 'US',
    marketCategory: 'electronics',
    subcategory: 'Retail · Independent Shop',
    condition: 'Shop Refurbished',
    price: '$1,649',
    specs: ['18GB RAM', '512GB SSD', '6-month shop warranty'],
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1600&q=80',
    description:
      'Graded A refurbished by our in-store technicians with a new battery and full diagnostics. Walk-in pickup at our Wicker Park shop or same-day local delivery.',
    features: ['New battery fitted', 'Full diagnostics report', 'Walk-in pickup', 'Same-day local delivery'],
    seller: {
      name: 'Sofia Marino',
      agency: 'Wicker Park Tech Repair',
      initials: 'SM',
      responseTime: '~5 min',
      isVerifiedAgent: true,
      plan: 'verified-seller',
      phone: '+1 (312) 555-0119',
    },
    listedDaysAgo: 2,
    isVerifiedListing: true,
    coordinates: { lat: 41.91, lng: -87.68 },
  },
  {
    id: 'dubai-commercial-tower',
    title: 'Dubai, UAE — Commercial Tower',
    location: 'Business Bay, Dubai, UAE',
    country: 'AE',
    marketCategory: 'real-estate',
    subcategory: 'Commercial Office Tower',
    condition: 'Grade A · Fully leased',
    price: 'AED 185,000,000',
    specs: ['28 floors', '310,000 sqft NLA', 'Canal frontage'],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
    description:
      'Freehold Grade A office tower in Business Bay with direct Dubai Canal frontage, 94% occupancy across multinational tenants, and LEED Gold certification. Sold with full tenancy schedules and service-charge history.',
    features: ['Freehold title', 'LEED Gold', '94% occupancy', '450 basement parking bays'],
    seller: { name: 'Layla Al Mansoori', agency: 'Gulf Prime Commercial Realty', initials: 'LM', responseTime: '~30 min', isVerifiedAgent: true },
    listedDaysAgo: 3,
    isVerifiedListing: true,
    coordinates: { lat: 25.19, lng: 55.27 },
  },
  {
    id: 'riyadh-logistics-hub',
    title: 'Riyadh, Saudi Arabia — Industrial Logistics',
    location: 'Second Industrial City, Riyadh, Saudi Arabia',
    country: 'SA',
    marketCategory: 'industrial',
    subcategory: 'Logistics Park · Warehousing',
    condition: 'New build',
    price: 'SAR 64,000,000',
    specs: ['120,000 sqm plot', '14 m clear height', '36 dock levellers'],
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80',
    description:
      'Newly completed temperature-zoned logistics facility with direct access to the Riyadh–Dammam highway. Includes cold-chain chambers, mezzanine offices, and an approved MODON operating licence.',
    features: ['Cold-chain ready', 'Highway access', 'MODON licensed', 'Solar-ready roof'],
    seller: { name: 'Faisal Al Harbi', agency: 'Najd Industrial Estates', initials: 'FH', responseTime: '~1 hr', isVerifiedAgent: true },
    listedDaysAgo: 5,
    isVerifiedListing: true,
    coordinates: { lat: 24.6, lng: 46.83 },
  },
  {
    id: 'tokyo-tech-equipment',
    title: 'Tokyo, Japan — Tech Equipment',
    location: 'Akihabara, Tokyo, Japan',
    country: 'JP',
    marketCategory: 'electronics',
    subcategory: 'Lab & Server Equipment Lot',
    condition: 'Used – Tested',
    price: '¥18,500,000',
    specs: ['8× GPU servers', '2 network racks', 'Full test reports'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    description:
      'Decommissioned R&D lab lot including GPU compute servers, managed switches, and precision test instruments. Every unit has been bench-tested with logs and is ready for export or local pickup.',
    features: ['Bench-tested units', 'Export paperwork available', 'Pallet packing', 'Local pickup in Akihabara'],
    seller: {
      name: 'Kenji Watanabe',
      agency: 'Akiba Pro Equipment',
      initials: 'KW',
      responseTime: '~10 min',
      isVerifiedAgent: true,
      plan: 'verified-seller',
      phone: '+81 3-5555-0142',
    },
    listedDaysAgo: 1,
    isVerifiedListing: true,
    coordinates: { lat: 35.7, lng: 139.77 },
  },
  {
    id: 'singapore-retail-hub',
    title: 'Singapore — Retail Hub',
    location: 'Orchard Road, Singapore',
    country: 'SG',
    marketCategory: 'real-estate',
    subcategory: 'Retail Podium · Strata',
    condition: 'Fitted & trading',
    price: 'S$42,000,000',
    specs: ['3 retail levels', '58,000 sqft GFA', 'MRT-linked'],
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80',
    description:
      'Prime strata retail podium on Orchard Road with an underground MRT link, anchor F&B tenants, and strong weekend footfall. Sold with existing leases and an approved façade refresh.',
    features: ['MRT underground link', 'Anchor F&B tenants', 'Approved façade works', '99-year leasehold'],
    seller: { name: 'Rachel Tan', agency: 'Lion City Commercial', initials: 'RT', responseTime: '~20 min', isVerifiedAgent: true },
    listedDaysAgo: 2,
    isVerifiedListing: true,
    coordinates: { lat: 1.3, lng: 103.84 },
  },
]

// ---------------------------------------------------------------------------
// Supabase listings
// ---------------------------------------------------------------------------

/** Row shape of the Supabase `listings` table (see supabase/listings.sql). */
interface ListingRow {
  id: string | number
  title: string
  location: string | null
  country: string | null
  market_category: string | null
  subcategory: string | null
  condition: string | null
  price: string | null
  description: string | null
  image_url: string | null
  seller_name: string | null
  seller_phone: string | null
  latitude: number | null
  longitude: number | null
  created_at: string | null
}

type NewListingRow = Omit<ListingRow, 'id' | 'created_at'>

const LISTING_IMAGES_BUCKET = 'listing-images'
const LISTING_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80'

/** Approximate country centres, used to pin listings without exact coordinates in Map View. */
const COUNTRY_CENTERS: Record<CountryCode, { lat: number; lng: number }> = {
  AE: { lat: 24.45, lng: 54.38 },
  SA: { lat: 24.71, lng: 46.68 },
  QA: { lat: 25.29, lng: 51.53 },
  KW: { lat: 29.38, lng: 47.99 },
  BH: { lat: 26.23, lng: 50.59 },
  OM: { lat: 23.59, lng: 58.41 },
  SG: { lat: 1.35, lng: 103.82 },
  JP: { lat: 35.68, lng: 139.69 },
  KR: { lat: 37.57, lng: 126.98 },
  MY: { lat: 3.14, lng: 101.69 },
  TH: { lat: 13.76, lng: 100.5 },
  IN: { lat: 28.61, lng: 77.21 },
  ID: { lat: -6.21, lng: 106.85 },
  VN: { lat: 21.03, lng: 105.85 },
  PH: { lat: 14.6, lng: 120.98 },
  US: { lat: 39.83, lng: -98.58 },
  GB: { lat: 51.51, lng: -0.13 },
  CA: { lat: 45.42, lng: -75.7 },
  DE: { lat: 52.52, lng: 13.4 },
  FR: { lat: 48.86, lng: 2.35 },
  AU: { lat: -35.28, lng: 149.13 },
}

function isCountryCode(value: string | null): value is CountryCode {
  return ALL_COUNTRIES.some((c) => c.code === value)
}

function isMarketCategory(value: string | null): value is MarketCategory {
  return MARKET_CATEGORIES.some((c) => c.value !== 'all' && c.value === value)
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function rowToListing(row: ListingRow): Listing {
  const country = isCountryCode(row.country) ? row.country : 'US'
  const sellerName = row.seller_name?.trim() || 'Aether Seller'
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now()
  return {
    id: `db-${row.id}`,
    title: row.title,
    location: row.location?.trim() || countryLabel(country),
    country,
    marketCategory: isMarketCategory(row.market_category) ? row.market_category : 'services',
    subcategory: row.subcategory?.trim() || 'Direct Listing',
    condition: row.condition?.trim() || 'Original photo',
    price: row.price?.trim() || 'Price on request',
    specs: [],
    image: row.image_url || LISTING_PLACEHOLDER_IMAGE,
    description: row.description ?? '',
    features: [],
    seller: {
      name: sellerName,
      agency: 'Independent Seller',
      initials: initialsOf(sellerName) || 'AS',
      responseTime: '~1 hr',
      phone: row.seller_phone || undefined,
    },
    listedDaysAgo: Math.max(0, Math.floor((Date.now() - createdAt) / 86_400_000)),
    coordinates:
      row.latitude != null && row.longitude != null ? { lat: row.latitude, lng: row.longitude } : COUNTRY_CENTERS[country],
  }
}

/** Escapes LIKE wildcards so user input is matched literally by `.ilike()`. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}

/** Fetches listings from Supabase, filtered by country and title search. Empty when Supabase is not configured. */
function useSupabaseListings(query: string, country: CountryFilter, refreshKey: number) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    const client = supabase
    if (!client) return
    let cancelled = false
    setLoading(true)
    // Debounce so typing in the search bar doesn't fire a request per keystroke.
    const timer = window.setTimeout(async () => {
      let request = client.from('listings').select('*')
      if (country !== 'all') request = request.eq('country', country)
      const q = query.trim()
      if (q) request = request.ilike('title', `%${escapeLike(q)}%`)
      const { data, error } = await request.order('created_at', { ascending: false }).limit(100)
      if (cancelled) return
      if (error) console.error('Failed to load Supabase listings:', error.message)
      setListings(error || !data ? [] : (data as ListingRow[]).map(rowToListing))
      setLoading(false)
    }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, country, refreshKey])

  return { listings, loading }
}

/** Uploads the original photo to Supabase Storage. Returns null if the bucket is missing or the upload fails. */
async function uploadListingImage(file: File | null): Promise<string | null> {
  if (!supabase || !file) return null
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `direct/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
  const { error } = await supabase.storage.from(LISTING_IMAGES_BUCKET).upload(path, file, { contentType: file.type })
  if (error) {
    console.warn('Listing photo upload skipped:', error.message)
    return null
  }
  return supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
}

// ---------------------------------------------------------------------------
// Modal & Verification Components
// ---------------------------------------------------------------------------

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
  hideTitle?: boolean
}

function Modal({ title, onClose, children, className, hideTitle }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-ink-800 shadow-2xl outline-none animate-in fade-in slide-in-from-bottom-4 sm:rounded-2xl',
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2
            id={titleId}
            className={cn('font-display text-lg font-semibold text-white', hideTitle && 'sr-only')}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function SellerVerificationModal({ onClose }: { onClose: () => void }) {
  const [docType, setDocType] = useState('trade_license')
  const [taxId, setTaxId] = useState('')
  const [regNo, setRegNo] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'submitted'>('idle')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setStatus('uploading')
    setTimeout(() => setStatus('submitted'), 1500)
  }

  const handleStripeIdentityVerification = () => {
    setStatus('uploading')
    setTimeout(() => setStatus('submitted'), 1500)
  }

  return (
    <Modal title="Verify Seller & Business Account" onClose={onClose} className="sm:max-w-md">
      {status === 'submitted' ? (
        <div className="p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-accent-emerald" />
          <p className="mt-4 font-display text-xl font-semibold text-white">Verification Under Review</p>
          <p className="mt-2 text-sm text-slate-400">
            Your credentials have been securely submitted. Verified badges are typically issued within 24 hours.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-ink-700 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-6 p-6">
          <div className="rounded-xl border border-accent-indigo/30 bg-accent-indigo/10 p-4 text-xs text-accent-indigo-light">
            Verified sellers, dealers and brokers receive top marketplace priority, trusted badge placement, and unrestricted buyer leads.
          </div>

          <button
            type="button"
            onClick={handleStripeIdentityVerification}
            disabled={status === 'uploading'}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            <ShieldCheck className="h-5 w-5" />
            Verify instantly with Stripe Identity
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <span className="relative bg-ink-800 px-3 text-xs text-slate-500 uppercase">Or upload manual docs</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="trade_license">Company Trade License / Incorporation</option>
                <option value="rehab_license">Real Estate Brokerage License</option>
                <option value="dealer_license">Vehicle Dealer / Reseller License</option>
                <option value="tax_tin">Corporate e-TIN / Tax Registration</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Reg. No.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRAD/DNCC/1029"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-300">Tax ID / TIN</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 129481029"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Upload Official Scan (PDF / JPG)</label>
              <input
                type="file"
                required
                accept=".pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-indigo/20 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-accent-indigo-light"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'uploading'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-indigo-light py-3 font-semibold text-white transition hover:shadow-lg"
            >
              {status === 'uploading' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Documents for Verification'}
            </button>
          </form>
        </div>
      )}
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// BeforeAfterSlider with Watermark
// ---------------------------------------------------------------------------

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  alt?: string
  className?: string
  watermarked?: boolean
}

function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  alt = 'Property',
  className,
  watermarked = true,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, pct)))
  }, [])

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsDragging(true)
    updatePosition(e.clientX)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    updatePosition(e.clientX)
  }

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={`${beforeLabel} and ${afterLabel} comparison`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      className={cn(
        'relative w-full aspect-[4/3] touch-none overflow-hidden rounded-xl bg-ink-700 cursor-ew-resize select-none outline-none',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <img
        src={afterImage || '/placeholder.svg'}
        alt={`${alt} — ${afterLabel.toLowerCase()}`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {watermarked && (
        <span
          className="absolute bottom-3 right-3 z-20 rounded bg-ink-900/60 px-2 py-1 text-[10px] font-mono tracking-wider text-white/70 backdrop-blur-sm pointer-events-none"
          style={{ opacity: position > 85 ? 0 : 1 }}
        >
          AI ENHANCED · AETHER MARKET
        </span>
      )}

      <span
        className="absolute right-3 top-3 z-20 rounded-full bg-accent-emerald/90 px-3 py-1 text-xs font-semibold text-ink-900 backdrop-blur"
        style={{ opacity: position > 85 ? 0 : 1 }}
      >
        {afterLabel}
      </span>

      <img
        src={beforeImage || '/placeholder.svg'}
        alt={`${alt} — ${beforeLabel.toLowerCase()}`}
        className="absolute inset-0 z-10 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />
      <span
        className="absolute left-3 top-3 z-20 rounded-full bg-ink-900/80 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur"
        style={{ opacity: position < 15 ? 0 : 1 }}
      >
        {beforeLabel}
      </span>

      <div
        className="pointer-events-none absolute top-0 bottom-0 z-30 w-0.5 bg-white/90"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
          <MoveHorizontal className="h-5 w-5 text-ink-900" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ChatModal & PropertyDetailModal
// ---------------------------------------------------------------------------

function ChatModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [messages, setMessages] = useState<{ id: number; from: 'buyer' | 'seller'; text: string; time: string }[]>([
    {
      id: 1,
      from: 'seller',
      text: `Hi! I'm ${listing.seller.name.split(' ')[0]} with ${listing.seller.agency}. How can I help regarding ${listing.title}?`,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    },
  ])
  const [draft, setDraft] = useState('')

  return (
    <Modal title={`Message ${listing.seller.name}`} onClose={onClose} className="sm:max-w-lg" hideTitle>
      <div className="flex h-[70vh] flex-col p-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo to-accent-emerald font-bold text-white">
            {listing.seller.initials}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-white">{listing.seller.name}</p>
              {listing.seller.isVerifiedAgent && <BadgeCheck className="h-4 w-4 text-accent-emerald" />}
            </div>
            <p className="text-xs text-slate-400">{listing.seller.agency}</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {messages.map((m) => (
            <div key={m.id} className={m.from === 'buyer' ? 'flex justify-end' : 'flex justify-start'}>
              <p className={m.from === 'buyer' ? 'rounded-2xl bg-accent-indigo px-4 py-2.5 text-sm text-white' : 'rounded-2xl bg-ink-700 px-4 py-2.5 text-sm text-slate-200'}>
                {m.text}
              </p>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            setMessages((prev) => [...prev, { id: Date.now(), from: 'buyer', text: draft, time: 'Just now' }])
            setDraft('')
          }}
          className="flex gap-2 border-t border-white/5 pt-4"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 rounded-xl border border-white/10 bg-ink-700 px-4 py-2 text-sm text-white outline-none"
          />
          <button type="submit" className="rounded-xl bg-accent-indigo px-4 py-2 text-white">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </Modal>
  )
}

/**
 * WhatsApp number that receives buyer inquiries, in international format
 * without "+" or spaces (e.g. 15125550123). When unset, WhatsApp opens with the
 * message prefilled and the visitor picks who to send it to.
 */
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

function buildWhatsAppUrl(text: string) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}

function VerifiedListingBadge({ className }: { className?: string }) {
  return (
    <span
      title="Ownership and listing documents verified by Aether Market"
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 py-0.5 pl-1 pr-2 text-[11px] font-semibold text-accent-emerald-light',
        className,
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-emerald text-ink-900">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      Verified Listing
    </span>
  )
}

/** Official blue/green checkmark used for Verified Seller subscribers. */
function VerifiedCheckIcon({ className }: { className?: string }) {
  const gradientId = useId()
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('h-4 w-4 shrink-0', className)}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {/* Scalloped seal */}
      <path
        fill={`url(#${gradientId})`}
        d="M12 1.5l2.39 1.74 2.95-.07.9 2.81 2.39 1.74-.9 2.81.9 2.81-2.39 1.74-.9 2.81-2.95-.07L12 19.5l-2.39-1.74-2.95.07-.9-2.81-2.39-1.74.9-2.81-.9-2.81 2.39-1.74.9-2.81 2.95.07z"
        transform="translate(0 1.5)"
      />
      <path d="M8 12.6l2.6 2.6L16.2 9.6" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VerifiedSellerBadge({ className }: { className?: string }) {
  return (
    <span
      title="Verified Seller: identity and business documents checked by Aether Market"
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-400/30 bg-gradient-to-r from-sky-500/15 to-accent-emerald/15 py-0.5 pl-0.5 pr-2 text-[10px] font-semibold uppercase tracking-wide text-sky-200',
        className,
      )}
    >
      <VerifiedCheckIcon /> Verified Seller
    </span>
  )
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

/** Before/after slider for AI-enhanced listings, otherwise the single listing photo. */
function ListingMedia({ listing, className }: { listing: Listing; className?: string }) {
  if (listing.rawImage) {
    return (
      <BeforeAfterSlider
        beforeImage={listing.rawImage}
        afterImage={listing.image}
        beforeLabel="Original"
        afterLabel={listing.enhancedLabel ?? 'AI Enhanced'}
        alt={listing.title}
        className={className}
      />
    )
  }
  return (
    <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink-700', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
    </div>
  )
}

function InquiryModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const nameId = useId()
  const emailId = useId()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const message = [
      `Hi ${listing.seller.name.split(' ')[0]}, I'm interested in "${listing.title}" (${listing.price}, ${listing.location}) on Aether Market.`,
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      listing.marketCategory === 'real-estate'
        ? 'Could you share more details or arrange a viewing?'
        : 'Is it still available? I would love more details.',
    ].join('\n')
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return (
    <Modal title={listing.marketCategory === 'real-estate' ? 'Inquire About This Property' : 'Inquire About This Item'} onClose={onClose} className="sm:max-w-md">
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-700/60 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listing.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{listing.title}</p>
            <p className="truncate text-xs text-slate-400">
              {listing.seller.name} · {listing.seller.agency}
            </p>
            <p className="text-sm font-bold text-accent-emerald-light">{listing.price}</p>
          </div>
        </div>

        {sent ? (
          <div role="status" className="text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-accent-emerald" />
            <p className="mt-3 font-semibold text-white">Inquiry ready in WhatsApp</p>
            <p className="mt-1 text-sm text-slate-400">
              Hit send in WhatsApp to reach {listing.seller.name.split(' ')[0]}. Typical reply time {listing.seller.responseTime}.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setSent(false)}
                className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Edit Details
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-ink-700 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor={nameId} className="mb-1 block text-xs font-medium text-slate-300">Name</label>
              <input
                id={nameId}
                type="text"
                required
                autoComplete="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-indigo"
              />
            </div>
            <div>
              <label htmlFor={emailId} className="mb-1 block text-xs font-medium text-slate-300">Email</label>
              <input
                id={emailId}
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-indigo"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-semibold text-ink-900 transition hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" /> Send via WhatsApp
            </button>
            <p className="text-center text-[11px] text-slate-500">
              Opens WhatsApp with your inquiry prefilled. Avg. agent response {listing.seller.responseTime}.
            </p>
          </form>
        )}
      </div>
    </Modal>
  )
}

function PropertyDetailModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [view, setView] = useState<'details' | 'inquiry' | 'chat'>('details')

  if (view === 'inquiry') {
    return <InquiryModal listing={listing} onClose={() => setView('details')} />
  }
  if (view === 'chat') {
    return <ChatModal listing={listing} onClose={() => setView('details')} />
  }

  return (
    <Modal title={listing.title} onClose={onClose} className="sm:max-w-4xl">
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <ListingMedia listing={listing} />
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-indigo/10 px-3 py-0.5 text-xs text-accent-indigo-light">{listing.subcategory}</span>
            <span className="rounded-full bg-white/5 px-3 py-0.5 text-xs text-slate-300">{listing.condition}</span>
            {listing.isVerifiedListing && <VerifiedListingBadge />}
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-accent-emerald-light">
            {listing.price}
            {listing.priceNote && <span className="ml-1 text-base font-medium text-slate-400">{listing.priceNote}</span>}
          </p>
          <p className="mt-1 text-sm text-slate-400"><MapPin className="inline h-4 w-4" /> {listing.location}</p>
          <p className="mt-4 text-sm text-slate-300">{listing.description}</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {[...listing.specs, ...listing.features].map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-xs text-slate-300">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-emerald-light" /> {f}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/5 bg-ink-700/60 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-indigo font-bold text-white">
              {listing.seller.initials}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-white">{listing.seller.name}</p>
                {listing.seller.isVerifiedAgent && <VerifiedSellerBadge />}
              </div>
              <p className="text-xs text-slate-400">{listing.seller.agency}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              onClick={() => setView('inquiry')}
              aria-haspopup="dialog"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-indigo py-3.5 font-semibold text-white transition hover:bg-accent-indigo-light hover:text-ink-900"
            >
              <Send className="h-5 w-5" /> {listing.marketCategory === 'real-estate' ? 'Contact Agent' : 'Contact Seller'}
            </button>
            <button
              type="button"
              onClick={() => setView('chat')}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
            >
              <MessageCircle className="h-4 w-4" /> Chat
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Navbar & Hero
// ---------------------------------------------------------------------------

function Navbar({ onNavigate, onOpenVerify }: { onNavigate: (id: string) => void; onOpenVerify: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-900/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-indigo to-accent-emerald">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-lg font-bold text-white">Aether Market</span>
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenVerify}
            aria-haspopup="dialog"
            className="flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-gradient-to-r from-sky-500/10 to-accent-emerald/10 px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:from-sky-500/20 hover:to-accent-emerald/20"
          >
            <VerifiedCheckIcon className="h-4 w-4" /> Verify Seller
            <span className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white sm:inline">$15/mo</span>
          </button>
          <button onClick={() => onNavigate('staging-studio')} className="rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white">
            Post an Ad
          </button>
        </div>
      </nav>
    </header>
  )
}

function HeroSearchBar({
  query,
  onQueryChange,
  country,
  onCountryChange,
  onSubmit,
}: {
  query: string
  onQueryChange: (v: string) => void
  country: CountryFilter
  onCountryChange: (v: CountryFilter) => void
  onSubmit: () => void
}) {
  const id = useId()
  // Keep the current selection visible even if it was picked from the fuller list in the marketplace bar.
  const codes = country === 'all' || HERO_COUNTRY_CODES.includes(country) ? HERO_COUNTRY_CODES : [...HERO_COUNTRY_CODES, country]
  return (
    <form
      role="search"
      aria-label="Search the marketplace"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-2xl border border-white/10 bg-ink-800/80 p-2 text-left shadow-2xl shadow-violet-900/20 backdrop-blur sm:flex-row sm:items-center"
    >
      <label htmlFor={`${id}-q`} className="sr-only">Search listings</label>
      <div className="relative min-w-0 flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={`${id}-q`}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search properties, vehicles, machinery, tech..."
          className="w-full rounded-xl bg-ink-700 py-3 pl-9 pr-3 text-base text-white placeholder:text-slate-500 outline-none ring-violet-500/50 focus:ring-2 sm:text-sm"
        />
      </div>
      <label htmlFor={`${id}-country`} className="sr-only">Country</label>
      <div className="relative w-full sm:w-56 sm:shrink-0">
        <select
          id={`${id}-country`}
          value={country}
          onChange={(e) => onCountryChange(e.target.value as CountryFilter)}
          className="w-full max-w-full appearance-none truncate rounded-xl bg-ink-700 py-3 pl-3 pr-9 text-base text-white outline-none ring-violet-500/50 focus:ring-2 sm:text-sm"
        >
          <option value="all">🌐 All Countries (Global)</option>
          {codes.map((code) => {
            const c = ALL_COUNTRIES.find((x) => x.code === code)
            return c ? (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ) : null
          })}
        </select>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
      >
        <Search aria-hidden="true" className="h-4 w-4" /> Search
      </button>
    </form>
  )
}

function Hero({
  onNavigate,
  onBrowseCategory,
  query,
  onQueryChange,
  country,
  onCountryChange,
}: {
  onNavigate: (id: string) => void
  onBrowseCategory: (c: MarketFilter) => void
  query: string
  onQueryChange: (v: string) => void
  country: CountryFilter
  onCountryChange: (v: CountryFilter) => void
}) {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-indigo/30 bg-accent-indigo/10 px-3 py-1 text-xs font-semibold text-accent-indigo-light">
          <Sparkles className="h-3.5 w-3.5" /> Multi-category classifieds with AI photo enhancement
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold text-white sm:text-6xl">
          Aether Market — <span className="text-accent-emerald-light">Buy, Sell & Stage Anything</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          The modern marketplace for real estate, vehicles, industrial machinery, electronics, and commercial inventory.
        </p>
        <HeroSearchBar
          query={query}
          onQueryChange={onQueryChange}
          country={country}
          onCountryChange={onCountryChange}
          onSubmit={() => onNavigate('marketplace')}
        />
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => onNavigate('staging-studio')} className="rounded-xl bg-accent-indigo px-6 py-3.5 font-semibold text-white">
            Sell & Enhance an Item
          </button>
          <button onClick={() => onNavigate('marketplace')} className="rounded-xl border border-white/10 px-6 py-3.5 font-semibold text-white">
            Browse Marketplace
          </button>
        </div>
        <nav aria-label="Browse by category" className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2">
          {MARKET_CATEGORIES.filter((c) => c.value !== 'all').map((c) => {
            const Icon = MARKET_CATEGORY_ICONS[c.value]
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => onBrowseCategory(c.value)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-800/60 px-4 py-2 text-sm text-slate-300 transition hover:border-accent-indigo/40 hover:text-white"
              >
                <Icon className="h-4 w-4 text-accent-indigo-light" /> {c.label}
              </button>
            )
          })}
        </nav>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Marketplace & StageForm
// ---------------------------------------------------------------------------

type MarketplaceView = 'grid' | 'map'

type MapBounds = { minLat: number; maxLat: number; minLng: number; maxLng: number }

// Fit the map preview to whatever listings are visible, so one city, one country or the whole globe all read well.
function fitMapBounds(points: { lat: number; lng: number }[]): MapBounds {
  if (points.length === 0) return { minLat: -60, maxLat: 75, minLng: -180, maxLng: 180 }
  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  let minLat = Math.min(...lats)
  let maxLat = Math.max(...lats)
  let minLng = Math.min(...lngs)
  let maxLng = Math.max(...lngs)
  // Keep a minimum span so single-city results don't collapse onto one point.
  const latPad = Math.max((maxLat - minLat) * 0.15, 2)
  const lngPad = Math.max((maxLng - minLng) * 0.15, 3)
  minLat -= latPad
  maxLat += latPad
  minLng -= lngPad
  maxLng += lngPad
  return { minLat, maxLat, minLng, maxLng }
}

function projectToMap({ lat, lng }: { lat: number; lng: number }, bounds: MapBounds) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(6, Math.min(94, y)) }
}

function ViewToggle({ view, onChange }: { view: MarketplaceView; onChange: (v: MarketplaceView) => void }) {
  const options: { value: MarketplaceView; label: string; icon: ReactNode }[] = [
    { value: 'grid', label: 'Grid View', icon: <LayoutGrid className="h-4 w-4" /> },
    { value: 'map', label: 'Map View', icon: <MapIcon className="h-4 w-4" /> },
  ]
  return (
    <div role="group" aria-label="Listing view" className="relative inline-flex rounded-xl border border-white/10 bg-ink-800 p-1">
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-accent-indigo shadow-lg shadow-accent-indigo/30 transition-transform duration-300',
          view === 'map' && 'translate-x-full',
        )}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={view === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative z-10 flex w-32 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors',
            view === o.value ? 'text-white' : 'text-slate-400 hover:text-white',
          )}
        >
          {o.icon} {o.label}
        </button>
      ))}
    </div>
  )
}

function ListingCard({ listing, onView, onInquire }: { listing: Listing; onView: () => void; onInquire: () => void }) {
  const CategoryIcon = MARKET_CATEGORY_ICONS[listing.marketCategory]
  return (
    <article className="flex flex-col rounded-2xl border border-white/5 bg-ink-800/60 p-4 transition hover:border-white/10">
      <ListingMedia listing={listing} />
      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <CategoryIcon className="h-3.5 w-3.5 shrink-0" /> {listing.subcategory}
          </span>
          {listing.seller.plan === 'verified-seller' ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
              <Zap className="h-3 w-3" /> Priority
            </span>
          ) : (
            listing.isVerifiedListing && <VerifiedListingBadge />
          )}
        </div>
        <h3 className="mt-2 font-semibold text-white">{listing.title}</h3>

        <ul className="mt-2 flex flex-wrap gap-1.5">
          {listing.specs.map((spec) => (
            <li key={spec} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">{spec}</li>
          ))}
        </ul>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-ink-900/50 px-2.5 py-2">
            <dt className="text-[10px] uppercase tracking-wider text-slate-500">Condition</dt>
            <dd className="mt-0.5 flex items-center gap-1 font-medium text-slate-200">
              <Tag className="h-3 w-3 shrink-0 text-accent-indigo-light" /> {listing.condition}
            </dd>
          </div>
          <div className="rounded-lg bg-ink-900/50 px-2.5 py-2">
            <dt className="text-[10px] uppercase tracking-wider text-slate-500">Location</dt>
            <dd className="mt-0.5 flex items-center gap-1 truncate font-medium text-slate-200">
              <MapPin className="h-3 w-3 shrink-0 text-accent-indigo-light" /> {listing.location}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-indigo to-accent-emerald text-[10px] font-bold text-white">
            {listing.seller.initials}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-slate-400">
            <span className="font-medium text-slate-200">{listing.seller.name}</span> · {listing.seller.agency}
          </span>
          {listing.seller.isVerifiedAgent && <VerifiedSellerBadge />}
        </div>

        {listing.seller.plan === 'verified-seller' && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={buildWhatsAppUrl(`Hi ${listing.seller.name.split(' ')[0]}, I found "${listing.title}" on Aether Market. Is it still available?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366]/15 py-2 text-xs font-semibold text-[#5ee391] transition hover:bg-[#25D366] hover:text-ink-900"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            {listing.seller.phone && (
              <a
                href={telHref(listing.seller.phone)}
                aria-label={`Call ${listing.seller.agency} at ${listing.seller.phone}`}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-500/15 py-2 text-xs font-semibold text-sky-200 transition hover:bg-sky-500 hover:text-white"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <span className="font-display text-xl font-bold text-accent-emerald-light">
            {listing.price}
            {listing.priceNote && <span className="ml-0.5 text-xs font-medium text-slate-400">{listing.priceNote}</span>}
          </span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onView} className="text-xs font-semibold text-slate-300 transition hover:text-white">
              Details
            </button>
            <button
              type="button"
              onClick={onInquire}
              aria-haspopup="dialog"
              className="flex items-center gap-1 rounded-lg bg-accent-indigo/15 px-3 py-1.5 text-xs font-semibold text-accent-indigo-light transition hover:bg-accent-indigo hover:text-white"
            >
              <Send className="h-3.5 w-3.5" /> Inquire
            </button>
          </div>
        </div>
        </div>
      </div>
    </article>
  )
}

function MapPreview({
  listings,
  onView,
  onInquire,
}: {
  listings: Listing[]
  onView: (l: Listing) => void
  onInquire: (l: Listing) => void
}) {
  const [activeId, setActiveId] = useState<string>(listings[0]?.id ?? '')
  const bounds = useMemo(() => fitMapBounds(listings.map((l) => l.coordinates)), [listings])
  const active = listings.find((l) => l.id === activeId) ?? listings[0]
  if (!active) return null

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] sm:aspect-[16/10]">
        {/* Stylised dark basemap */}
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 62.5" preserveAspectRatio="none">
          <defs>
            <pattern id="map-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M5 0H0V5" fill="none" stroke="rgba(148,163,184,0.07)" strokeWidth="0.15" />
            </pattern>
            <radialGradient id="map-glow" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="rgba(99,102,241,0.18)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0)" />
            </radialGradient>
          </defs>
          <rect width="100" height="62.5" fill="url(#map-grid)" />
          <path
            d="M6 12 L14 8 L30 9 L48 10 L62 12 L74 10 L86 8 L93 14 L90 22 L88 30 L84 36 L80 44 L74 50 L68 52 L62 50 L56 55 L50 58 L44 54 L36 50 L28 47 L20 42 L12 36 L8 28 L5 20 Z"
            fill="rgba(30,41,59,0.55)"
            stroke="rgba(148,163,184,0.18)"
            strokeWidth="0.3"
          />
          <rect width="100" height="62.5" fill="url(#map-glow)" />
          <g fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="0.25">
            <path d="M8 24 Q30 20 50 26 T92 22" />
            <path d="M14 40 Q40 34 60 40 T86 34" />
            <path d="M24 10 Q28 30 22 46" />
            <path d="M52 10 Q48 30 54 56" />
            <path d="M76 10 Q72 28 78 46" />
          </g>
        </svg>

        <span className="absolute left-3 top-3 z-20 rounded-full bg-ink-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300 backdrop-blur">
          Map Preview · {listings.length} listings
        </span>

        {listings.map((l) => {
          const { x, y } = projectToMap(l.coordinates, bounds)
          const isActive = l.id === activeId
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setActiveId(l.id)}
              aria-pressed={isActive}
              aria-label={`${l.title}, ${l.price}, ${l.location}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold shadow-lg transition',
                isActive
                  ? 'z-20 scale-110 bg-accent-emerald text-ink-900 ring-4 ring-accent-emerald/25'
                  : 'z-10 bg-ink-800 text-white ring-1 ring-white/15 hover:bg-accent-indigo',
              )}
            >
              {l.price}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45',
                  isActive ? 'bg-accent-emerald' : 'bg-ink-800',
                )}
              />
            </button>
          )
        })}
      </div>

      {/* Selected listing */}
      <div className="flex flex-col rounded-2xl border border-white/5 bg-ink-800/60 p-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active.image} alt={active.title} className="h-full w-full object-cover" />
          {active.isVerifiedListing && (
            <VerifiedListingBadge className="absolute left-3 top-3 bg-ink-900/80 backdrop-blur" />
          )}
        </div>
        <h3 className="mt-4 font-semibold text-white">{active.title}</h3>
        <p className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin className="h-3 w-3" /> {active.location}
        </p>
        <p className="mt-2 font-display text-xl font-bold text-accent-emerald-light">
          {active.price}
          {active.priceNote && <span className="ml-0.5 text-xs font-medium text-slate-400">{active.priceNote}</span>}
        </p>
        <p className="mt-1 text-xs text-slate-400">{active.subcategory} · {active.condition}</p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <button
            type="button"
            onClick={() => onView(active)}
            className="rounded-lg border border-white/10 py-2 text-xs font-semibold text-white transition hover:bg-white/5"
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => onInquire(active)}
            aria-haspopup="dialog"
            className="flex items-center justify-center gap-1 rounded-lg bg-accent-indigo py-2 text-xs font-semibold text-white transition hover:bg-accent-indigo-light hover:text-ink-900"
          >
            <Send className="h-3.5 w-3.5" /> Inquire
          </button>
        </div>
      </div>
    </div>
  )
}

function MarketSearchBar({
  query,
  onQueryChange,
  country,
  onCountryChange,
}: {
  query: string
  onQueryChange: (v: string) => void
  country: CountryFilter
  onCountryChange: (v: CountryFilter) => void
}) {
  const id = useId()
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-ink-800/80 p-2 sm:flex-row sm:items-center"
    >
      <label htmlFor={`${id}-q`} className="sr-only">Search listings</label>
      <div className="relative min-w-0 flex-1">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={`${id}-q`}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search towers, vehicles, equipment, cities…"
          className="w-full rounded-xl bg-ink-700 py-2.5 pl-9 pr-3 text-base text-white placeholder:text-slate-500 outline-none ring-accent-indigo/50 focus:ring-2 sm:text-sm"
        />
      </div>
      <label htmlFor={`${id}-country`} className="sr-only">Country</label>
      <div className="relative w-full sm:w-64 sm:shrink-0">
        <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-indigo-light" />
        {/* Native select: iOS/iPadOS and Android render it as a scrollable picker sheet; desktop gets a scrollable list. */}
        <select
          id={`${id}-country`}
          value={country}
          onChange={(e) => onCountryChange(e.target.value as CountryFilter)}
          className="w-full max-w-full appearance-none truncate rounded-xl bg-ink-700 py-2.5 pl-9 pr-9 text-base text-white outline-none ring-accent-indigo/50 focus:ring-2 sm:text-sm"
        >
          <option value="all">🌐 All Countries (Global)</option>
          {COUNTRY_GROUPS.map((g) => (
            <optgroup key={g.region} label={`— ${g.region} —`}>
              {g.countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    </form>
  )
}

function CategoryFilterBar({ value, onChange, pool }: { value: MarketFilter; onChange: (v: MarketFilter) => void; pool: Listing[] }) {
  return (
    <div role="tablist" aria-label="Marketplace categories" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
      {MARKET_CATEGORIES.map((c) => {
        const Icon = MARKET_CATEGORY_ICONS[c.value]
        const count = c.value === 'all' ? pool.length : pool.filter((l) => l.marketCategory === c.value).length
        const selected = value === c.value
        return (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(c.value)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
              selected
                ? 'border-accent-indigo bg-accent-indigo text-white shadow-lg shadow-accent-indigo/25'
                : 'border-white/10 bg-ink-800/60 text-slate-300 hover:border-white/20 hover:text-white',
            )}
          >
            <Icon className="h-4 w-4" />
            {c.label}
            <span className={cn('rounded-full px-1.5 text-[11px]', selected ? 'bg-white/20' : 'bg-white/5 text-slate-400')}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}

function Marketplace({
  filter,
  onFilterChange,
  query,
  onQueryChange: setQuery,
  country,
  onCountryChange: setCountry,
  refreshKey,
}: {
  filter: MarketFilter
  onFilterChange: (v: MarketFilter) => void
  query: string
  onQueryChange: (v: string) => void
  country: CountryFilter
  onCountryChange: (v: CountryFilter) => void
  /** Bump to re-fetch listings from Supabase, e.g. after a new listing is published. */
  refreshKey: number
}) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [inquiryListing, setInquiryListing] = useState<Listing | null>(null)
  const [view, setView] = useState<MarketplaceView>('grid')

  const remote = useSupabaseListings(query, country, refreshKey)

  // Demo listings matching the search bar (keyword + country), used when Supabase returns nothing.
  const demoPool = useMemo(() => {
    const q = query.trim().toLowerCase()
    return LISTINGS.filter((l) => {
      if (country !== 'all' && l.country !== country) return false
      if (!q) return true
      return [l.title, l.location, l.subcategory, countryLabel(l.country), ...l.specs].some((t) => t.toLowerCase().includes(q))
    })
  }, [query, country])

  // Listings matching the search bar, before the category tabs are applied.
  const isLive = remote.listings.length > 0
  const pool = isLive ? remote.listings : demoPool

  const visible = useMemo(
    () =>
      filter === 'all'
        ? pool
        : pool
            .filter((l) => l.marketCategory === filter)
            // Verified Seller subscribers get priority placement inside category filters.
            .sort((a, b) => Number(b.seller.plan === 'verified-seller') - Number(a.seller.plan === 'verified-seller')),
    [filter, pool],
  )
  const filterLabel = MARKET_CATEGORIES.find((c) => c.value === filter)?.label ?? 'All Items'
  const scopeLabel = country === 'all' ? 'all countries' : countryLabel(country)

  return (
    <section id="marketplace" className="scroll-mt-16 bg-ink-900 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Marketplace Feed</h2>
            <p className="mt-1 text-sm text-slate-400">
              Property, vehicles, machinery, tech and services from verified sellers. Drag any before/after photo to compare.
            </p>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className="sticky top-16 z-30 -mx-6 mt-6 border-b border-white/5 bg-ink-900/85 px-6 py-3 backdrop-blur-xl">
          <MarketSearchBar query={query} onQueryChange={setQuery} country={country} onCountryChange={setCountry} />
          <div className="mt-3">
            <CategoryFilterBar value={filter} onChange={onFilterChange} pool={pool} />
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? 'item' : 'items'} in {filterLabel} · {scopeLabel}
          {remote.loading ? ' · Loading live listings…' : isLive ? ' · Live listings' : ' · Sample listings'}
        </p>

        <div className="mt-4">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <p className="font-semibold text-white">No items in {filterLabel} for {scopeLabel} yet</p>
              <p className="mt-1 text-sm text-slate-400">
                Try another country or choose All Countries (Global) — or be the first to post here.
              </p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((l) => (
                <ListingCard key={l.id} listing={l} onView={() => setSelectedListing(l)} onInquire={() => setInquiryListing(l)} />
              ))}
            </div>
          ) : (
            // Remount on filter change so the selected pin resets to a visible listing.
            <MapPreview key={`${filter}-${country}-${query}`} listings={visible} onView={setSelectedListing} onInquire={setInquiryListing} />
          )}
        </div>
      </div>
      {selectedListing && <PropertyDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
      {inquiryListing && <InquiryModal listing={inquiryListing} onClose={() => setInquiryListing(null)} />}
    </section>
  )
}

type StudioMode = 'awaiting-choice' | 'generating' | 'staged' | 'direct'

type EnhancerPresetId = 'interior-staging' | 'ecommerce-backdrop' | 'vehicle-lighting' | 'showroom-display'

interface EnhancerPreset {
  id: EnhancerPresetId
  label: string
  /** What the user is uploading, used in prompts and the direct-publish preview. */
  subject: string
  variantLabel: string
  variants: string[]
  resultLabel: string
  /** Sample "after" image used by the simulated AI result. */
  sampleRender: string
}

const ENHANCER_PRESETS: EnhancerPreset[] = [
  {
    id: 'interior-staging',
    label: 'Interior Room Staging',
    subject: 'Room',
    variantLabel: 'Interior Style',
    variants: ['Modern', 'Scandinavian', 'Japandi', 'Industrial', 'Mid-Century', 'Coastal'],
    resultLabel: 'AI Staged',
    sampleRender: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'ecommerce-backdrop',
    label: 'E-Commerce Studio Backdrop',
    subject: 'Product',
    variantLabel: 'Backdrop',
    variants: ['Seamless White', 'Bold Colour Pop', 'Soft Gradient', 'Marble Tabletop', 'Lifestyle Scene'],
    resultLabel: 'Studio Backdrop',
    sampleRender: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'vehicle-lighting',
    label: 'Vehicle Studio Lighting',
    subject: 'Vehicle',
    variantLabel: 'Lighting Setup',
    variants: ['Showroom Spotlight', 'Clean White Cyclorama', 'Golden Hour Outdoor', 'Neon Night'],
    resultLabel: 'Studio Lit',
    sampleRender: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'showroom-display',
    label: 'Showroom Display',
    subject: 'Item',
    variantLabel: 'Display Setting',
    variants: ['Retail Showroom', 'Trade Show Booth', 'Factory Floor', 'Gallery Pedestal'],
    resultLabel: 'Showroom',
    sampleRender: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
  },
]

const PRESET_MARKET_CATEGORY: Record<EnhancerPresetId, MarketCategory> = {
  'interior-staging': 'real-estate',
  'ecommerce-backdrop': 'electronics',
  'vehicle-lighting': 'vehicles',
  'showroom-display': 'industrial',
}

function StageForm({ onPublished }: { onPublished?: (listing: Listing) => void }) {
  const [presetId, setPresetId] = useState<EnhancerPresetId>('interior-staging')
  const [style, setStyle] = useState<string>(ENHANCER_PRESETS[0].variants[0])
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [publishedListing, setPublishedListing] = useState<Listing | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  // After upload the studio waits for the user to pick AI staging or a direct publish.
  const [mode, setMode] = useState<StudioMode>('awaiting-choice')
  const [generationRun, setGenerationRun] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = useId()

  const preset = ENHANCER_PRESETS.find((p) => p.id === presetId) ?? ENHANCER_PRESETS[0]
  const presetSelectId = useId()
  const variantSelectId = useId()
  const showUploadBox = !previewUrl || mode === 'awaiting-choice' || mode === 'generating'

  // Release the object URL when it is replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Simulated AI generation, only runs when the user picks AI staging.
  // Swap this timeout for a real staging API call.
  useEffect(() => {
    if (mode !== 'generating') return
    const timer = window.setTimeout(() => setMode('staged'), 2500)
    return () => window.clearTimeout(timer)
  }, [mode, generationRun])

  const stagedPreviewUrl = preset.sampleRender

  const selectFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    setPreviewUrl(URL.createObjectURL(file))
    setFileName(file.name)
    setSelectedFile(file)
    setPublishedListing(null)
    setMode('awaiting-choice')
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0])
  }

  const openFilePicker = () => fileInputRef.current?.click()

  const clearFile = () => {
    setPreviewUrl(null)
    setFileName(null)
    setSelectedFile(null)
    setPublishedListing(null)
    setMode('awaiting-choice')
    // Reset so choosing the same file again still fires onChange.
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const generateAiPreview = () => {
    if (!previewUrl) return
    setMode('generating')
    setGenerationRun((n) => n + 1)
  }

  const publishDirect = () => {
    if (!previewUrl) return
    setMode('direct')
    if (!publishedListing) setPublishModalOpen(true)
  }

  // Re-render the AI preview if the category or style changes after staging.
  const restageIfNeeded = () => {
    if (mode === 'staged' || mode === 'generating') generateAiPreview()
  }

  const handlePresetChange = (id: EnhancerPresetId) => {
    const next = ENHANCER_PRESETS.find((p) => p.id === id) ?? ENHANCER_PRESETS[0]
    setPresetId(next.id)
    setStyle(next.variants[0])
    restageIfNeeded()
  }

  const handleStyleChange = (next: string) => {
    setStyle(next)
    restageIfNeeded()
  }

  const secondaryButton =
    'flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/5'

  return (
    <section id="staging-studio" className="scroll-mt-16 border-y border-white/5 bg-ink-800/40 py-24">
      <div className="mx-auto max-w-4xl px-6 rounded-2xl border border-white/5 bg-ink-800/80 p-8">
        <h2 className="font-display text-2xl font-bold text-white">AI Product & Space Enhancer Studio</h2>
        <p className="mt-1 text-xs text-slate-400">
          Upload a photo of a room, product, vehicle or machine, then generate an instant AI-enhanced preview or publish your original photo directly.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            {/* AI result: before/after slider */}
            {previewUrl && mode === 'staged' && (
              <>
                <BeforeAfterSlider
                  beforeImage={previewUrl}
                  afterImage={stagedPreviewUrl}
                  beforeLabel="Original"
                  afterLabel={preset.resultLabel}
                  alt={fileName ?? 'Uploaded photo'}
                  className="border border-accent-indigo/30"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-xs text-accent-emerald-light">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> AI preview ready: {preset.label} · {style}
                  </p>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={openFilePicker} className={secondaryButton}>
                      <RotateCcw className="h-3.5 w-3.5" /> Replace
                    </button>
                    <button type="button" onClick={clearFile} aria-label="Remove selected photo" className={cn(secondaryButton, 'px-2')}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Direct publish: original photo in the marketplace listing card layout */}
            {previewUrl && mode === 'direct' && (
              <>
                <div className="rounded-2xl border border-white/5 bg-ink-800/60 p-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt={fileName ?? 'Original property photo'} className="h-full w-full object-cover" />
                    <span className="absolute left-3 top-3 rounded-full bg-ink-900/80 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
                      Original Photo · No AI
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-white">{publishedListing?.title ?? `${preset.subject} Listing`}</h3>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" /> {publishedListing ? publishedListing.location : 'Location added at publish'}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                      <span className="font-display text-xl font-bold text-accent-emerald-light">{publishedListing?.price ?? 'Price on request'}</span>
                      {publishedListing ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-accent-emerald-light">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Published
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPublishModalOpen(true)}
                          className="flex items-center gap-1 text-xs font-semibold text-accent-emerald-light hover:underline"
                        >
                          <Send className="h-3.5 w-3.5" /> Add details &amp; publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <button type="button" onClick={generateAiPreview} className={secondaryButton}>
                    <Wand2 className="h-3.5 w-3.5" /> Apply AI Enhancement Instead
                  </button>
                  <div className="flex gap-2">
                    <button type="button" onClick={openFilePicker} className={secondaryButton}>
                      <RotateCcw className="h-3.5 w-3.5" /> Replace
                    </button>
                    <button type="button" onClick={clearFile} aria-label="Remove selected photo" className={cn(secondaryButton, 'px-2')}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Upload dropzone (also shows the photo while waiting for a choice) */}
            <div className="relative" hidden={!showUploadBox}>
              <label
                htmlFor={fileInputId}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  selectFile(e.dataTransfer.files?.[0])
                }}
                className={cn(
                  'relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition focus-within:border-accent-indigo focus-within:ring-2 focus-within:ring-accent-indigo/40',
                  previewUrl ? 'border-accent-indigo/40' : 'border-white/10 hover:border-accent-indigo/40',
                  isDragging && 'border-accent-indigo bg-accent-indigo/10',
                )}
              >
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                {previewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt={fileName ?? 'Selected photo preview'} className="absolute inset-0 h-full w-full object-cover" />
                    {mode === 'generating' ? (
                      <span
                        role="status"
                        aria-live="polite"
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900/75 backdrop-blur-sm"
                      >
                        <Loader2 className="h-8 w-8 animate-spin text-accent-indigo-light" />
                        <span className="text-sm font-semibold text-white">Generating AI Enhancement Preview...</span>
                        <span className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
                          <span className="block h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-accent-indigo to-accent-emerald" />
                        </span>
                      </span>
                    ) : (
                      <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 truncate bg-gradient-to-t from-ink-900/90 to-transparent px-3 pb-2 pt-6 text-xs font-semibold text-white">
                        <RotateCcw className="h-3.5 w-3.5 shrink-0" /> Tap to replace photo
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-accent-indigo-light" />
                    <span className="mt-2 text-xs font-semibold text-white">Upload {preset.subject} Photo</span>
                    <span className="mt-1 text-[11px] text-slate-500">Tap, click, or drop an image</span>
                  </>
                )}
              </label>
              {previewUrl && mode !== 'generating' && (
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remove selected photo"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/80 text-white backdrop-blur transition hover:bg-ink-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* The two publishing choices */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={generateAiPreview}
                  disabled={!previewUrl || mode === 'generating'}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-emerald px-3 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
                >
                  {mode === 'generating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  Generate Preview
                </button>
                <button
                  type="button"
                  onClick={publishDirect}
                  disabled={!previewUrl}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-ink-700/60 px-3 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink-700/60"
                >
                  <Send className="h-4 w-4" /> Publish Direct (No AI)
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                {previewUrl
                  ? mode === 'generating'
                    ? 'Enhancing your photo with AI. You can publish the original instead once it finishes.'
                    : 'Choose AI enhancement, or publish your original photo as-is.'
                  : 'Upload a photo to choose AI enhancement or a direct publish.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor={presetSelectId} className="text-xs text-slate-300">Enhancement Preset</label>
              <select
                id={presetSelectId}
                value={presetId}
                onChange={(e) => handlePresetChange(e.target.value as EnhancerPresetId)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
              >
                {ENHANCER_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={variantSelectId} className="text-xs text-slate-300">{preset.variantLabel}</label>
              <select
                id={variantSelectId}
                value={style}
                onChange={(e) => handleStyleChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
              >
                {preset.variants.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">Used for AI enhancement only. Direct publishing keeps your photo unchanged.</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-ink-900/50 p-4 text-xs text-slate-400">
              <p className="font-semibold text-white">Two ways to publish</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start gap-2">
                  <Wand2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-indigo-light" />
                  <span><span className="text-slate-200">Generate Preview</span> enhances your photo with the selected AI preset and shows a before & after slider.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Send className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-emerald-light" />
                  <span><span className="text-slate-200">Publish Direct (No AI)</span> lists your original photo exactly as uploaded.</span>
                </li>
              </ul>
            </div>

            {mode === 'staged' && previewUrl && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-accent-emerald to-accent-emerald-light py-3 font-semibold text-ink-900 shadow-lg"
                >
                  Email Me the Watermarked Preview
                </button>
                <button
                  type="button"
                  onClick={publishDirect}
                  className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
                >
                  Publish Original Instead (No AI)
                </button>
              </div>
            )}
          </div>
        </div>

        {publishModalOpen && (
          <PublishDirectModal
            file={selectedFile}
            previewUrl={previewUrl}
            defaultCategory={PRESET_MARKET_CATEGORY[presetId]}
            onClose={() => setPublishModalOpen(false)}
            onPublished={(listing) => {
              setPublishedListing(listing)
              onPublished?.(listing)
            }}
          />
        )}

        {emailModalOpen && (
          <Modal title="Unlock Free Watermarked Preview" onClose={() => setEmailModalOpen(false)}>
            <div className="space-y-4 p-6 text-white">
              <p className="text-sm text-slate-300">Enter your email to instantly unlock your AI preview render and join Aether Market.</p>
              <input
                type="email"
                placeholder="you@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-ink-700 px-4 py-2.5 text-sm"
              />
              <button
                onClick={() => {
                  alert('Preview generated successfully! Check your email.')
                  setEmailModalOpen(false)
                }}
                className="w-full rounded-xl bg-accent-indigo py-3 font-semibold"
              >
                Unlock Preview
              </button>
            </div>
          </Modal>
        )}
      </div>
    </section>
  )
}

function PublishDirectModal({
  file,
  previewUrl,
  defaultCategory,
  onClose,
  onPublished,
}: {
  file: File | null
  previewUrl: string | null
  defaultCategory: MarketCategory
  onClose: () => void
  onPublished: (listing: Listing) => void
}) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [country, setCountry] = useState<CountryCode>('US')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<MarketCategory>(defaultCategory)
  const [description, setDescription] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'publishing' | 'published'>('idle')
  const [error, setError] = useState<string | null>(null)
  const formId = useId()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || status === 'publishing') return
    setStatus('publishing')
    setError(null)

    const imageUrl = await uploadListingImage(file)
    const row: NewListingRow = {
      title: title.trim(),
      location: location.trim() || null,
      country,
      market_category: category,
      subcategory: MARKET_CATEGORIES.find((c) => c.value === category)?.label ?? null,
      condition: 'Original photo',
      price: price.trim() || null,
      description: description.trim() || null,
      image_url: imageUrl,
      seller_name: sellerName.trim() || null,
      seller_phone: sellerPhone.trim() || null,
      latitude: null,
      longitude: null,
    }

    const { data, error: insertError } = await supabase.from('listings').insert(row).select().single()
    if (insertError) {
      setStatus('idle')
      setError(insertError.message)
      return
    }
    setStatus('published')
    onPublished(rowToListing(data as ListingRow))
  }

  const inputClass = 'w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white outline-none focus:border-accent-emerald/50'
  const labelClass = 'mb-1 block text-xs font-medium text-slate-300'

  return (
    <Modal title="Publish Direct (No AI)" onClose={onClose} className="sm:max-w-lg">
      {status === 'published' ? (
        <div className="p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-accent-emerald" />
          <p className="mt-4 font-display text-xl font-semibold text-white">Listing Published</p>
          <p className="mt-2 text-sm text-slate-400">Your listing is now live in the Marketplace Feed.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-ink-700 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {previewUrl && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-ink-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Listing photo" className="h-full w-full object-cover" />
            </div>
          )}

          {!isSupabaseConfigured && (
            <p className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Publishing is unavailable: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect Supabase.
            </p>
          )}

          <div>
            <label htmlFor={`${formId}-title`} className={labelClass}>Title</label>
            <input id={`${formId}-title`} required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2-Bedroom Apartment in Marina" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${formId}-price`} className={labelClass}>Price</label>
              <input id={`${formId}-price`} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $1,200" className={inputClass} />
            </div>
            <div>
              <label htmlFor={`${formId}-category`} className={labelClass}>Category</label>
              <select id={`${formId}-category`} value={category} onChange={(e) => setCategory(e.target.value as MarketCategory)} className={inputClass}>
                {MARKET_CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${formId}-country`} className={labelClass}>Country</label>
              <select id={`${formId}-country`} value={country} onChange={(e) => setCountry(e.target.value as CountryCode)} className={inputClass}>
                {COUNTRY_GROUPS.map((g) => (
                  <optgroup key={g.region} label={g.region}>
                    {g.countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${formId}-location`} className={labelClass}>City / Area</label>
              <input id={`${formId}-location`} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dubai Marina" className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-description`} className={labelClass}>Description</label>
            <textarea id={`${formId}-description`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${formId}-seller`} className={labelClass}>Your Name</label>
              <input id={`${formId}-seller`} value={sellerName} onChange={(e) => setSellerName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`${formId}-phone`} className={labelClass}>Phone (optional)</label>
              <input id={`${formId}-phone`} type="tel" value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} className={inputClass} />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-rose-300">Couldn&apos;t publish listing: {error}</p>
          )}

          <button
            type="submit"
            disabled={!isSupabaseConfigured || status === 'publishing'}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-emerald to-accent-emerald-light py-3 font-semibold text-ink-900 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'publishing' ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Publish Listing</>}
          </button>
        </form>
      )}
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

type PricingPlanId = 'free-listing' | 'single-listing' | 'verified-seller' | 'pro-subscription'

type PricingPlan = {
  id: PricingPlanId
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
  /**
   * Optional Stripe Checkout / Payment Link URL. Set the matching
   * NEXT_PUBLIC_* env var (Payment Links are public URLs) to go live,
   * or replace `handleCheckout` below with a call to your own API endpoint.
   */
  checkoutUrl?: string
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free-listing',
    name: 'Free Listing',
    price: '$0',
    period: '/ listing',
    description: 'Ideal for owners looking to test the marketplace.',
    features: [
      '1 Active Listing (30 Days)',
      'Watch 1 short video ad to publish',
      'Standard Photo Uploads',
      'Watermarked Staging Preview',
    ],
    cta: 'Watch Ad & Publish',
  },
  {
    id: 'single-listing',
    name: 'Single Listing',
    price: '$5',
    period: '/ per listing',
    description: 'Perfect for sellers wanting instant staging & longer exposure.',
    features: [
      '1 Active Listing (Stays active for 3 Months)',
      'Before & After Interactive Staging',
      'AI photo modification for future furnished outlook',
      'HD Image Support (No Ads)',
    ],
    cta: 'Get Started',
    checkoutUrl: process.env.NEXT_PUBLIC_STRIPE_SINGLE_LISTING_URL,
  },
  {
    id: 'verified-seller',
    name: 'Verified Seller',
    price: '$15',
    period: '/ month',
    description: 'Designed for local service providers, contractors, and independent shop owners.',
    features: [
      'Official Verified Seller Blue/Green Checkmark Badge on all listings',
      'Unlimited Service & Business Ads',
      'Direct WhatsApp & Call buttons on listing cards',
      'Priority in search & service filters',
    ],
    cta: 'Get Verified ($15/mo)',
    checkoutUrl: process.env.NEXT_PUBLIC_STRIPE_VERIFIED_SELLER_URL,
  },
  {
    id: 'pro-subscription',
    name: 'Pro Subscription',
    price: '$99',
    period: '/ month',
    description: 'Built for agencies and developers moving inventory at scale.',
    features: [
      'Maximum 50 Verified Property Listings (Up to 6 Months)',
      'Official Aether Brand Page & X Advertising Promotion',
      'Featured Placement on Marketplace',
      'Priority Rendering & Support',
    ],
    cta: 'Subscribe Now',
    popular: true,
    checkoutUrl: process.env.NEXT_PUBLIC_STRIPE_PRO_SUBSCRIPTION_URL,
  },
]

type CheckoutStatus = 'redirecting' | 'unavailable' | 'error'

const VERIFIED_SELLER_PLAN = PRICING_PLANS.find((p) => p.id === 'verified-seller') as PricingPlan

/**
 * Verified Seller ($15/month) sign-up and checkout. Opened from the header
 * "Verify Seller" button and the pricing card. Hands off to the Stripe Payment
 * Link in NEXT_PUBLIC_STRIPE_VERIFIED_SELLER_URL when it is configured.
 */
function VerifiedSellerModal({ onClose, onUploadDocuments }: { onClose: () => void; onUploadDocuments: () => void }) {
  const plan = VERIFIED_SELLER_PLAN
  const [status, setStatus] = useState<'review' | CheckoutStatus>('review')

  useEffect(() => {
    if (status !== 'redirecting') return
    const timer = window.setTimeout(() => {
      if (plan.checkoutUrl) {
        try {
          window.location.href = plan.checkoutUrl
        } catch {
          setStatus('error')
        }
        return
      }
      setStatus('unavailable')
    }, 1500)
    return () => window.clearTimeout(timer)
  }, [status, plan.checkoutUrl])

  return (
    <Modal title="Become a Verified Seller" onClose={onClose} className="sm:max-w-md">
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-4 rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-500/15 via-transparent to-accent-emerald/15 p-4">
          <VerifiedCheckIcon className="h-11 w-11" />
          <div className="min-w-0">
            <p className="font-semibold text-white">{plan.name}</p>
            <p className="text-sm text-slate-400">
              <span className="font-display text-lg font-bold text-white">{plan.price}</span> {plan.period} · cancel anytime
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400">{plan.description}</p>

        <ul className="space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-emerald-light" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Live preview of what buyers see */}
        <div className="rounded-xl border border-white/5 bg-ink-900/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">How buyers see your listings</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-accent-emerald text-[11px] font-bold text-white">
              YB
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-200">Your Business</span>
            <VerifiedSellerBadge />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold" aria-hidden="true">
            <span className="flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366]/15 py-1.5 text-[#5ee391]">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </span>
            <span className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-500/15 py-1.5 text-sky-200">
              <Phone className="h-3.5 w-3.5" /> Call
            </span>
          </div>
        </div>

        {status !== 'review' && (
          <div role="status" aria-live="polite" className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
            {status === 'redirecting' && (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-sky-300" />
                <p className="text-sm font-semibold text-white">Redirecting to secure checkout...</p>
              </div>
            )}
            {status === 'unavailable' && (
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-5 w-5 shrink-0 text-accent-emerald-light" />
                <div>
                  <p className="text-sm font-semibold text-white">Online checkout is launching soon</p>
                  <p className="text-xs text-slate-400">
                    You can submit your verification documents now and we&apos;ll activate billing once checkout opens.
                  </p>
                </div>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <p className="text-sm font-semibold text-white">We couldn&apos;t start checkout. Please try again.</p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setStatus('redirecting')}
          disabled={status === 'redirecting'}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-accent-emerald py-3.5 font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {status === 'redirecting' ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
          {status === 'unavailable' || status === 'error' ? 'Try Checkout Again' : `${plan.cta} `}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onUploadDocuments}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
        >
          <ShieldCheck className="h-4 w-4" /> Submit Verification Documents
        </button>
        <p className="text-center text-[11px] text-slate-500">
          Badge is issued after your ID or business documents are reviewed, usually within 24 hours.
        </p>
      </div>
    </Modal>
  )
}

const AD_DURATION_SECONDS = 15

/**
 * Simulated sponsored video ad for the Free Listing tier. Plays a placeholder
 * "ad" with a countdown, then lets the visitor continue to publish. Replace the
 * placeholder with a real ad network player when one is integrated.
 */
function SimulatedAdModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS)
  const finished = secondsLeft === 0

  useEffect(() => {
    if (finished) return
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft, finished])

  const progress = ((AD_DURATION_SECONDS - secondsLeft) / AD_DURATION_SECONDS) * 100

  return (
    <Modal title="Watch Ad & Publish" onClose={onClose} className="sm:max-w-lg">
      <div className="space-y-5 p-6">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-ink-700 via-accent-indigo/30 to-accent-emerald/20">
          <span className="absolute left-3 top-3 rounded bg-ink-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
            Sponsored · Sample Ad
          </span>
          <span className="absolute right-3 top-3 rounded bg-ink-900/80 px-2 py-0.5 font-mono text-[11px] text-white">
            {finished ? 'Done' : `0:${String(secondsLeft).padStart(2, '0')}`}
          </span>
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className={cn('flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur', !finished && 'animate-pulse')}>
              {finished ? <CheckCircle2 className="h-7 w-7 text-accent-emerald-light" /> : <Radio className="h-7 w-7 text-white" />}
            </span>
            <p className="px-6 text-sm font-semibold text-white">
              {finished ? 'Thanks for watching!' : 'Your sponsored video is playing...'}
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <div className="h-full bg-gradient-to-r from-accent-indigo to-accent-emerald transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <p role="status" aria-live="polite" className="text-center text-xs text-slate-400">
          {finished
            ? 'Your free listing is unlocked. Upload your photo in the studio to publish it.'
            : `Watch the ad to unlock 1 free listing for 30 days. ${secondsLeft}s remaining.`}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={!finished}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent-emerald py-3 text-sm font-semibold text-ink-900 transition hover:bg-accent-emerald-light disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent-emerald"
          >
            Continue to Publish <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ProSubscriptionModal({
  plan,
  onClose,
  onCheckout,
}: {
  plan: PricingPlan
  onClose: () => void
  onCheckout?: (plan: PricingPlan) => void | Promise<void>
}) {
  const [status, setStatus] = useState<CheckoutStatus>('redirecting')
  const [attempt, setAttempt] = useState(0)
  // Keep the latest handler in a ref so an inline prop doesn't restart the timer.
  const onCheckoutRef = useRef(onCheckout)
  onCheckoutRef.current = onCheckout

  // Show the "Redirecting to Checkout..." state briefly, then hand off to
  // Stripe: a custom checkout handler, then the configured Checkout URL.
  useEffect(() => {
    let cancelled = false
    setStatus('redirecting')
    const timer = window.setTimeout(async () => {
      const checkout = onCheckoutRef.current
      if (checkout) {
        try {
          await checkout(plan)
        } catch {
          if (!cancelled) setStatus('error')
        }
        return
      }
      if (plan.checkoutUrl) {
        window.location.href = plan.checkoutUrl
        return
      }
      if (!cancelled) setStatus('unavailable')
    }, 1800)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [plan, attempt])

  return (
    <Modal title="Pro Agency Account Setup" onClose={onClose} className="sm:max-w-md">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4 rounded-xl border border-accent-indigo/30 bg-gradient-to-br from-accent-indigo/15 to-transparent p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-indigo to-accent-emerald">
            <Building2 className="h-5 w-5 text-white" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-white">{plan.name}</p>
            <p className="text-sm text-slate-400">
              <span className="font-display text-lg font-bold text-white">{plan.price}</span> {plan.period}
            </p>
          </div>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-indigo/20 px-2.5 py-1 text-[11px] font-semibold text-accent-indigo-light">
            <Star className="h-3 w-3 fill-current" /> Popular
          </span>
        </div>

        <ul className="space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-indigo-light" />
              {feature}
            </li>
          ))}
        </ul>

        <div role="status" aria-live="polite" className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
          {status === 'redirecting' && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent-indigo-light" />
              <div>
                <p className="text-sm font-semibold text-white">Redirecting to Checkout...</p>
                <p className="text-xs text-slate-400">Preparing your secure Pro agency checkout.</p>
              </div>
            </div>
          )}
          {status === 'unavailable' && (
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-accent-emerald-light" />
              <div>
                <p className="text-sm font-semibold text-white">Secure checkout is almost ready</p>
                <p className="text-xs text-slate-400">
                  Online payments for Pro agency accounts are launching soon. Your plan details are saved here.
                </p>
              </div>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-white">We couldn&apos;t start checkout</p>
                <p className="text-xs text-slate-400">Please try again in a moment.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
          >
            {status === 'redirecting' ? 'Cancel' : 'Close'}
          </button>
          {status === 'error' && (
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="flex-1 rounded-xl bg-accent-indigo py-3 text-sm font-semibold text-white transition hover:bg-accent-indigo-light hover:text-ink-900"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

const TRADITIONAL_COST_PER_LISTING = 50
const AETHER_COST_PER_LISTING = 5
const MAX_LISTINGS = 20

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function ListingSavingsCalculator({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [listings, setListings] = useState(3)
  const sliderId = useId()
  const traditional = listings * TRADITIONAL_COST_PER_LISTING
  const aether = listings * AETHER_COST_PER_LISTING
  const savings = traditional - aether
  const savingsPct = Math.round((savings / traditional) * 100)
  const aetherBarWidth = Math.max((aether / traditional) * 100, 1.5)
  const fill = ((listings - 1) / (MAX_LISTINGS - 1)) * 100
  const listingWord = listings === 1 ? 'listing' : 'listings'

  return (
    <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 via-ink-800 to-accent-emerald/10 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-emerald-light">
            <BarChart2 className="h-3.5 w-3.5" /> ROI Calculator
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">Listing Savings Calculator</h3>
        </div>
        <p className="text-xs text-slate-400">Traditional Classifieds &amp; Agency Ads vs. Aether Market</p>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <label htmlFor={sliderId} className="text-sm font-medium text-slate-300">Number of Listings</label>
          <span className="font-display text-2xl font-bold text-white" aria-hidden="true">
            {listings} <span className="text-sm font-medium text-slate-400">{listingWord}</span>
          </span>
        </div>
        <input
          id={sliderId}
          type="range"
          min={1}
          max={MAX_LISTINGS}
          step={1}
          value={listings}
          onChange={(e) => setListings(Number(e.target.value))}
          aria-valuetext={`${listings} ${listingWord}`}
          className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full accent-accent-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emerald/50"
          style={{ background: `linear-gradient(to right, #10b981 ${fill}%, rgba(255,255,255,0.1) ${fill}%)` }}
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          <span>1</span>
          <span>{MAX_LISTINGS}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Traditional advertising <span className="text-slate-500">({usd.format(TRADITIONAL_COST_PER_LISTING)}/listing)</span></span>
            <span className="font-semibold text-slate-200 tabular-nums">{usd.format(traditional)}</span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-rose-500/70 to-amber-400/70" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Aether Market <span className="text-slate-500">({usd.format(AETHER_COST_PER_LISTING)}/listing)</span></span>
            <span className="font-semibold text-accent-emerald-light tabular-nums">{usd.format(aether)}</span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-accent-emerald transition-[width] duration-300" style={{ width: `${aetherBarWidth}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-accent-emerald/30 bg-accent-emerald/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite">
          <p className="text-xs font-medium text-accent-emerald-light">You save</p>
          <p className="font-display text-3xl font-bold text-white tabular-nums">{usd.format(savings)}</p>
          <p className="text-xs text-slate-400">{savingsPct}% less than traditional advertising</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('staging-studio')}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent-emerald px-5 py-3 text-sm font-semibold text-ink-900 transition hover:bg-accent-emerald-light"
        >
          {listings === 1 ? 'Post Listing' : `Post ${listings} Listings`} for {usd.format(aether)} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Estimates only. Traditional classified and agency ad prices vary by platform and market.</p>
    </div>
  )
}

function Pricing({
  onNavigate,
  onSelectPlan,
  onGetVerified,
}: {
  onNavigate: (id: string) => void
  /** Opens the shared Verified Seller ($15/month) checkout modal. */
  onGetVerified: () => void
  /** Override to call a Stripe Checkout API endpoint, track analytics, etc. */
  onSelectPlan?: (plan: PricingPlan) => void | Promise<void>
}) {
  const [proModalPlan, setProModalPlan] = useState<PricingPlan | null>(null)
  const [adModalOpen, setAdModalOpen] = useState(false)

  // Close the Pro modal if the visitor returns from Stripe via the back button.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => {
      if (e.persisted) setProModalPlan(null)
    }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  // Each plan has its own action:
  // - Free Listing: play a simulated video ad, then go to the studio to publish.
  // - Single Listing: smoothly scroll to the AI Staging & Architectural Studio
  //   so the visitor can upload and stage an individual photo.
  // - Verified Seller: open the $15/month Verified Seller checkout modal.
  // - Pro Subscription: open the Pro agency setup modal, which hands off to
  //   Stripe checkout once it is configured.
  const handlePlanClick = (plan: PricingPlan) => {
    if (plan.id === 'free-listing') {
      setAdModalOpen(true)
      return
    }
    if (plan.id === 'verified-seller') {
      onGetVerified()
      return
    }
    if (plan.id === 'pro-subscription') {
      setProModalPlan(plan)
      return
    }
    onNavigate('staging-studio')
  }

  return (
    <section id="pricing" className="bg-ink-900 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 px-3 py-1 text-xs font-semibold text-accent-emerald-light">
            <CreditCard className="h-3.5 w-3.5" /> Pricing & Packages
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-slate-400">Start free, pay per listing, get verified as a local business, or scale with Pro. No hidden fees.</p>
        </div>

        <ListingSavingsCalculator onNavigate={onNavigate} />

        <div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border p-6 transition lg:p-8',
                plan.popular
                  ? 'border-accent-indigo/50 bg-gradient-to-b from-accent-indigo/15 to-ink-800/80 shadow-2xl shadow-accent-indigo/20'
                  : plan.id === 'verified-seller'
                    ? 'border-sky-400/40 bg-gradient-to-b from-sky-500/10 via-ink-800/80 to-accent-emerald/10 shadow-xl shadow-sky-500/10'
                    : 'border-white/5 bg-ink-800/60 hover:border-white/10',
              )}
            >
              {plan.id === 'verified-seller' && (
                <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 to-accent-emerald px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  <Briefcase className="h-3 w-3" /> Local Businesses
                </span>
              )}
              {plan.popular && (
                <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent-indigo to-accent-emerald px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  <Star className="h-3 w-3 fill-current" /> Popular
                </span>
              )}

              <h3 className="flex items-center gap-2 font-display text-xl font-bold text-white">
                {plan.name}
                {plan.id === 'verified-seller' && <VerifiedCheckIcon className="h-5 w-5" />}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-slate-400">{plan.period}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                        plan.popular
                          ? 'bg-accent-indigo/20 text-accent-indigo-light'
                          : plan.id === 'verified-seller'
                            ? 'bg-sky-500/15 text-sky-300'
                            : plan.id === 'free-listing'
                            ? 'bg-white/10 text-slate-300'
                            : 'bg-accent-emerald/15 text-accent-emerald-light',
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handlePlanClick(plan)}
                aria-haspopup={plan.id === 'single-listing' ? undefined : 'dialog'}
                data-plan={plan.id}
                className={cn(
                  'mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition',
                  plan.popular
                    ? 'bg-accent-indigo text-white hover:bg-accent-indigo-light hover:text-ink-900'
                    : plan.id === 'verified-seller'
                      ? 'bg-gradient-to-r from-sky-500 to-accent-emerald text-white shadow-lg hover:brightness-110'
                      : 'border border-white/10 text-white hover:border-white/20 hover:bg-white/5',
                )}
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {adModalOpen && (
        <SimulatedAdModal
          onClose={() => setAdModalOpen(false)}
          onComplete={() => {
            setAdModalOpen(false)
            // Wait for the modal to unmount (it restores focus and page scroll) before scrolling.
            window.setTimeout(() => onNavigate('staging-studio'), 50)
          }}
        />
      )}
      {proModalPlan && (
        <ProSubscriptionModal plan={proModalPlan} onClose={() => setProModalPlan(null)} onCheckout={onSelectPlan} />
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// App Entry
// ---------------------------------------------------------------------------

export default function App() {
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [verifiedSellerOpen, setVerifiedSellerOpen] = useState(false)
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('all')
  // Shared by the Hero search bar and the marketplace search bar so both stay in sync.
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCountry, setSearchCountry] = useState<CountryFilter>('all')
  const [listingsVersion, setListingsVersion] = useState(0)
  const navigate = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // Close the Verified Seller checkout if the visitor returns from Stripe via the back button.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => {
      if (e.persisted) setVerifiedSellerOpen(false)
    }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  return (
    <div className="min-h-screen bg-ink-900 text-slate-200">
      <Navbar onNavigate={navigate} onOpenVerify={() => setVerifiedSellerOpen(true)} />
      <main>
        <Hero
          onNavigate={navigate}
          onBrowseCategory={(c) => {
            setMarketFilter(c)
            navigate('marketplace')
          }}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          country={searchCountry}
          onCountryChange={setSearchCountry}
        />
        <Marketplace
          filter={marketFilter}
          onFilterChange={setMarketFilter}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          country={searchCountry}
          onCountryChange={setSearchCountry}
          refreshKey={listingsVersion}
        />
        <StageForm onPublished={() => setListingsVersion((v) => v + 1)} />
        <Pricing onNavigate={navigate} onGetVerified={() => setVerifiedSellerOpen(true)} />
      </main>
      {verifiedSellerOpen && (
        <VerifiedSellerModal
          onClose={() => setVerifiedSellerOpen(false)}
          onUploadDocuments={() => {
            setVerifiedSellerOpen(false)
            setVerifyModalOpen(true)
          }}
        />
      )}
      {verifyModalOpen && <SellerVerificationModal onClose={() => setVerifyModalOpen(false)} />}
    </div>
  )
}
