'use client'

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ChangeEvent, type FormEvent, type KeyboardEvent, type PointerEvent, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowRight, BarChart2, Bath, Bed, Building2, Calendar, Check, CheckCircle2, CreditCard, Flame, Heart, ImagePlus, Loader2, Lock, MapPin, Maximize, Menu, MessageCircle, MoveHorizontal, Radio, Repeat2, RotateCcw, Search, Send, ShieldCheck, SlidersHorizontal, Sparkles, Star, Upload, Wand2, X, Zap, BadgeCheck, Trees } from 'lucide-react'

// ---------------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------------

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// types & listings
// ---------------------------------------------------------------------------

type SpaceCategory =
  | 'Living Room'
  | 'Kitchen'
  | 'Bedroom'
  | 'Office'
  | 'Dining Room'
  | 'Commercial'
  | 'Raw Land / Plot'
  | 'Exterior & Lawn'

type InteriorStyle =
  | 'Modern'
  | 'Scandinavian'
  | 'Japandi'
  | 'Industrial'
  | 'Mid-Century'
  | 'Coastal'

type ArchitecturalStyle =
  | 'Modern Luxury Villa'
  | 'Suburban Family Home'
  | 'Commercial Plaza'
  | 'Eco-Glass Cabin'
  | 'High-Rise Residential'

type StagingStyle = InteriorStyle | ArchitecturalStyle

interface Seller {
  name: string
  agency: string
  initials: string
  responseTime: string
  isVerifiedAgent?: boolean
}

interface Listing {
  id: string
  title: string
  location: string
  category: SpaceCategory
  style: StagingStyle
  price: string
  rating: number
  beds?: number
  baths?: number
  sqft?: number
  beforeImage: string
  afterImage: string
  description: string
  features: string[]
  seller: Seller
  listedDaysAgo: number
  watermarked?: boolean
}

const INTERIOR_STYLES: InteriorStyle[] = [
  'Modern',
  'Scandinavian',
  'Japandi',
  'Industrial',
  'Mid-Century',
  'Coastal',
]

const ARCHITECTURAL_STYLES: ArchitecturalStyle[] = [
  'Modern Luxury Villa',
  'Suburban Family Home',
  'Commercial Plaza',
  'Eco-Glass Cabin',
  'High-Rise Residential',
]

const CATEGORIES: { value: SpaceCategory; label: string; isLand?: boolean }[] = [
  { value: 'Living Room', label: 'Living Room' },
  { value: 'Kitchen', label: 'Kitchen' },
  { value: 'Bedroom', label: 'Bedroom' },
  { value: 'Office', label: 'Home Office' },
  { value: 'Dining Room', label: 'Dining Room' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Raw Land / Plot', label: 'Raw Land / Plot', isLand: true },
  { value: 'Exterior & Lawn', label: 'Exterior & Lawn', isLand: true },
]

const SAMPLE_RENDERS: Record<SpaceCategory, string> = {
  'Living Room': '/listings/loft-after.png',
  Kitchen: '/listings/kitchen-after.png',
  Bedroom: '/listings/bedroom-after.png',
  Office: '/listings/study-after.png',
  'Dining Room': '/listings/dining-after.png',
  Commercial: '/listings/lounge-after.png',
  'Raw Land / Plot': '/listings/land-after.png',
  'Exterior & Lawn': '/listings/exterior-after.png',
}

const LISTINGS: Listing[] = [
  {
    id: 'austin-land-plot',
    title: 'Austin Hillside Development Plot',
    location: 'Austin, TX',
    category: 'Raw Land / Plot',
    style: 'Modern Luxury Villa',
    price: '$450,000',
    rating: 5.0,
    sqft: 18500,
    beforeImage: '/listings/land-before.png',
    afterImage: '/listings/land-after.png',
    description:
      '0.42 acres of pristine sloping land with panoramic hill country views. Zoned R-1 with utility hookups available at curb. Rendered vision shows potential 4,200 sqft modern cantilevered villa.',
    features: ['0.42 Acres', 'Hill country views', 'Utilities at street', 'Architectural plans optional'],
    seller: { name: 'Maya Chen', agency: 'Lone Star Urban Realty', initials: 'MC', responseTime: '~10 min', isVerifiedAgent: true },
    listedDaysAgo: 2,
    watermarked: true,
  },
  {
    id: 'skyline-loft',
    title: 'Skyline Loft',
    location: 'Austin, TX',
    category: 'Living Room',
    style: 'Modern',
    price: '$685,000',
    rating: 4.9,
    beds: 2,
    baths: 2,
    sqft: 1240,
    beforeImage: '/listings/loft-before.png',
    afterImage: '/listings/loft-after.png',
    description:
      'A sun-filled downtown loft with 14-foot ceilings, polished concrete floors, and unobstructed skyline views. Walking distance to Lady Bird Lake and the Rainey Street district.',
    features: ['14 ft ceilings', 'Skyline views', 'Rooftop pool access', 'Secured parking'],
    seller: { name: 'Maya Chen', agency: 'Lone Star Urban Realty', initials: 'MC', responseTime: '~10 min', isVerifiedAgent: true },
    listedDaysAgo: 3,
    watermarked: true,
  },
  {
    id: 'harbor-kitchen',
    title: 'Harbor View Residence',
    location: 'Seattle, WA',
    category: 'Kitchen',
    style: 'Scandinavian',
    price: '$1,120,000',
    rating: 4.8,
    beds: 3,
    baths: 2.5,
    sqft: 2100,
    beforeImage: '/listings/kitchen-before.png',
    afterImage: '/listings/kitchen-after.png',
    description:
      'Renovated chef’s kitchen with a quartz island overlooking Elliott Bay. Bright, open-plan living with radiant floor heating throughout the main level.',
    features: ['Quartz island', 'Bay views', 'Radiant heating', 'EV charger'],
    seller: { name: 'Jonas Berg', agency: 'Pacific Crest Homes', initials: 'JB', responseTime: '~1 hr', isVerifiedAgent: false },
    listedDaysAgo: 7,
    watermarked: true,
  },
  {
    id: 'desert-suite',
    title: 'Desert Retreat',
    location: 'Scottsdale, AZ',
    category: 'Bedroom',
    style: 'Japandi',
    price: '$540,000',
    rating: 4.7,
    beds: 2,
    baths: 2,
    sqft: 1480,
    beforeImage: '/listings/bedroom-before.png',
    afterImage: '/listings/bedroom-after.png',
    description:
      'A calm, light-washed retreat with hand-troweled plaster walls and framed views of the McDowell Mountains. Private courtyard and low-maintenance desert landscaping.',
    features: ['Mountain views', 'Private courtyard', 'Smart home', 'Solar panels'],
    seller: { name: 'Elena Ruiz', agency: 'Sonoran Living Group', initials: 'ER', responseTime: '~30 min', isVerifiedAgent: true },
    listedDaysAgo: 12,
    watermarked: true,
  },
]

// ---------------------------------------------------------------------------
// Modal
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

    const onKey = (e: KeyboardEvent) => {
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

// ---------------------------------------------------------------------------
// BeforeAfterSlider
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - step))
    else if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + step))
    else if (e.key === 'Home') setPosition(0)
    else if (e.key === 'End') setPosition(100)
    else return
    e.preventDefault()
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
      aria-valuetext={`${Math.round(position)}% ${beforeLabel.toLowerCase()} image shown`}
      className={cn(
        'relative w-full aspect-[4/3] touch-none overflow-hidden rounded-xl bg-ink-700 cursor-ew-resize select-none outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo-light',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      <img
        src={afterImage || '/placeholder.svg'}
        alt={`${alt} — ${afterLabel.toLowerCase()} AI staging`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      
      {/* Watermark Overlay for Legal Compliance */}
      {watermarked && (
        <span
          className="absolute bottom-3 right-3 z-20 rounded bg-ink-900/60 px-2 py-1 text-[10px] font-mono tracking-wider text-white/70 backdrop-blur-sm pointer-events-none"
          style={{ opacity: position > 85 ? 0 : 1 }}
        >
          VIRTUALLY STAGED · AETHER MARKET
        </span>
      )}

      <span
        className="absolute right-3 top-3 z-20 rounded-full bg-accent-emerald/90 px-3 py-1 text-xs font-semibold text-ink-900 backdrop-blur transition-opacity"
        style={{ opacity: position > 85 ? 0 : 1 }}
      >
        {afterLabel}
      </span>

      <img
        src={beforeImage || '/placeholder.svg'}
        alt={`${alt} — ${beforeLabel.toLowerCase()} AI staging`}
        className="absolute inset-0 z-10 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />
      <span
        className="absolute left-3 top-3 z-20 rounded-full bg-ink-900/80 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur transition-opacity"
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
// ChatModal & PropertyDetailModal & StageForm & Main Page
// ---------------------------------------------------------------------------

function StageForm() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [category, setCategory] = useState<SpaceCategory>('Living Room')
  const [style, setStyle] = useState<StagingStyle>('Modern')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [step, setStep] = useState(0)

  const isLandCategory = category === 'Raw Land / Plot' || category === 'Exterior & Lawn'

  // Dynamic Steps based on Room vs Land
  const STEPS = isLandCategory
    ? ['Analyzing land contours & elevation', 'Clearing brush & environment mapping', 'Generating architectural concept render', 'Publishing to marketplace']
    : ['Analyzing room geometry', 'Removing clutter & lighting', 'Placing furniture & decor', 'Publishing to marketplace']

  const handleCategoryChange = (cat: SpaceCategory) => {
    setCategory(cat)
    if (cat === 'Raw Land / Plot' || cat === 'Exterior & Lawn') {
      setStyle('Modern Luxury Villa')
    } else {
      setStyle('Modern')
    }
  }

  return (
    <section id="stage" className="relative border-y border-white/5 bg-ink-800/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-emerald/30 bg-accent-emerald/10 px-3 py-1 text-xs font-semibold text-accent-emerald-light">
            <Sparkles className="h-3.5 w-3.5" />
            AI Staging & Architectural Studio
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Stage Rooms or Render Buildings on Raw Land
          </h2>
          <p className="mt-4 text-slate-400">
            Upload a photo of an empty room or raw land plot, select a style, and generate instant AI visualizations.
          </p>
        </div>

        <div className="grid gap-8 rounded-2xl border border-white/5 bg-ink-800/80 p-6 lg:grid-cols-2 lg:p-8">
          <div>
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-white/10 hover:border-accent-indigo/40 hover:bg-white/[0.02]">
              <ImagePlus className="h-8 w-8 text-accent-indigo-light" />
              <span className="mt-4 text-sm font-semibold text-white">
                {isLandCategory ? 'Upload Raw Land / Plot Photo' : 'Upload Room Photo'}
              </span>
              <span className="mt-1 text-xs text-slate-500">JPG, PNG or WebP · up to 10 MB</span>
            </label>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Listing Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as SpaceCategory)}
                className="w-full rounded-lg border border-white/10 bg-ink-700 px-4 py-2.5 text-sm text-white outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} {c.isLand ? '(Architectural Renders)' : '(Interior Staging)'}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-300">
                {isLandCategory ? 'Proposed Architectural Concept' : 'Staging Style'}
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(isLandCategory ? ARCHITECTURAL_STYLES : INTERIOR_STYLES).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s as StagingStyle)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-center text-xs font-medium transition',
                      style === s
                        ? 'border-accent-indigo bg-accent-indigo/15 text-white'
                        : 'border-white/10 text-slate-400 hover:text-white',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-emerald to-accent-emerald-light px-6 py-3.5 font-semibold text-ink-900 shadow-lg shadow-accent-emerald/20 transition hover:opacity-95"
            >
              <Sparkles className="h-5 w-5" />
              {isLandCategory ? 'Render Building Concept & Publish' : 'Stage Room & Publish'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StageForm
