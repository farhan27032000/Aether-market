'use client'

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ChangeEvent, type FormEvent, type KeyboardEvent, type PointerEvent, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowRight, BarChart2, Bath, Bed, Building2, Calendar, Check, CheckCircle2, CreditCard, Flame, Heart, ImagePlus, Loader2, Lock, MapPin, Maximize, Menu, MessageCircle, MoveHorizontal, Radio, Repeat2, RotateCcw, Search, Send, ShieldCheck, SlidersHorizontal, Sparkles, Star, Upload, Wand2, X, Zap, BadgeCheck } from 'lucide-react'

// ---------------------------------------------------------------------------
// utils
// ---------------------------------------------------------------------------

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// listings & types
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
  'Living Room': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
  Kitchen: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
  Bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  Office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
  'Dining Room': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=80',
  Commercial: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
  'Raw Land / Plot': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  'Exterior & Lawn': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80',
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
    beforeImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    description:
      '0.42 acres of pristine sloping land with panoramic hill country views. Zoned R-1 with utility hookups available at curb. Rendered vision shows potential 4,200 sqft modern cantilevered villa.',
    features: ['0.42 Acres', 'Hill country views', 'Utilities at street', 'Architectural plans optional'],
    seller: { name: 'Maya Chen', agency: 'Lone Star Urban Realty', initials: 'MC', responseTime: '~10 min', isVerifiedAgent: true },
    listedDaysAgo: 2,
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
    beforeImage: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    description:
      'A sun-filled downtown loft with 14-foot ceilings, polished concrete floors, and unobstructed skyline views. Walking distance to Lady Bird Lake and the Rainey Street district.',
    features: ['14 ft ceilings', 'Skyline views', 'Rooftop pool access', 'Secured parking'],
    seller: { name: 'Maya Chen', agency: 'Lone Star Urban Realty', initials: 'MC', responseTime: '~10 min', isVerifiedAgent: true },
    listedDaysAgo: 3,
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
    beforeImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80',
    description:
      'Renovated chef’s kitchen with a quartz island overlooking Elliott Bay. Bright, open-plan living with radiant floor heating throughout the main level.',
    features: ['Quartz island', 'Bay views', 'Radiant heating', 'EV charger'],
    seller: { name: 'Jonas Berg', agency: 'Pacific Crest Homes', initials: 'JB', responseTime: '~1 hr', isVerifiedAgent: false },
    listedDaysAgo: 7,
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
    beforeImage: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1600&q=80',
    afterImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    description:
      'A calm, light-washed retreat with hand-troweled plaster walls and framed views of the McDowell Mountains. Private courtyard and low-maintenance desert landscaping.',
    features: ['Mountain views', 'Private courtyard', 'Smart home', 'Solar panels'],
    seller: { name: 'Elena Ruiz', agency: 'Sonoran Living Group', initials: 'ER', responseTime: '~30 min', isVerifiedAgent: true },
    listedDaysAgo: 12,
  },
]

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
    <Modal title="Verify Broker & Agency Account" onClose={onClose} className="sm:max-w-md">
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
            Verified brokers receive top marketplace priority, trusted badge placement, and unrestricted buyer leads.
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
          VIRTUALLY STAGED · AETHER MARKET
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

function PropertyDetailModal({ listing, onClose, initialChatOpen = false }: { listing: Listing; onClose: () => void; initialChatOpen?: boolean }) {
  const [chatOpen, setChatOpen] = useState(initialChatOpen)

  if (chatOpen) {
    return <ChatModal listing={listing} onClose={() => setChatOpen(false)} />
  }

  return (
    <Modal title={listing.title} onClose={onClose} className="sm:max-w-4xl">
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <BeforeAfterSlider beforeImage={listing.beforeImage} afterImage={listing.afterImage} alt={listing.title} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent-indigo/10 px-3 py-0.5 text-xs text-accent-indigo-light">{listing.category}</span>
            <span className="rounded-full bg-white/5 px-3 py-0.5 text-xs text-slate-300">{listing.style}</span>
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-accent-emerald-light">{listing.price}</p>
          <p className="mt-1 text-sm text-slate-400"><MapPin className="inline h-4 w-4" /> {listing.location}</p>
          <p className="mt-4 text-sm text-slate-300">{listing.description}</p>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/5 bg-ink-700/60 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-indigo font-bold text-white">
              {listing.seller.initials}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-white">{listing.seller.name}</p>
                {listing.seller.isVerifiedAgent && <BadgeCheck className="h-4 w-4 text-accent-emerald" title="Verified Broker" />}
              </div>
              <p className="text-xs text-slate-400">{listing.seller.agency}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-indigo py-3.5 font-semibold text-white transition hover:bg-accent-indigo-light"
          >
            <MessageCircle className="h-5 w-5" /> Contact Seller
          </button>
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
            onClick={onOpenVerify}
            className="flex items-center gap-1 rounded-lg border border-accent-indigo/30 bg-accent-indigo/10 px-3 py-1.5 text-xs font-semibold text-accent-indigo-light transition hover:bg-accent-indigo/20"
          >
            <ShieldCheck className="h-4 w-4" /> Verify Agency
          </button>
          <button onClick={() => onNavigate('staging-studio')} className="rounded-lg bg-accent-indigo px-4 py-2 text-sm font-semibold text-white">
            List a Property
          </button>
        </div>
      </nav>
    </header>
  )
}

function Hero({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-indigo/30 bg-accent-indigo/10 px-3 py-1 text-xs font-semibold text-accent-indigo-light">
          <Sparkles className="h-3.5 w-3.5" /> AI Virtual Staging & Raw Land Renders
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold text-white sm:text-6xl">
          Empty land & rooms in. <span className="text-accent-emerald-light">Sold properties</span> out.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
          Transform empty room photos or raw land plots into stunning architectural masterworks instantly.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => onNavigate('staging-studio')} className="rounded-xl bg-accent-indigo px-6 py-3.5 font-semibold text-white">
            Stage a Property or Land
          </button>
          <button onClick={() => onNavigate('marketplace')} className="rounded-xl border border-white/10 px-6 py-3.5 font-semibold text-white">
            Browse Marketplace
          </button>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Marketplace & StageForm
// ---------------------------------------------------------------------------

function Marketplace() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  return (
    <section id="marketplace" className="bg-ink-900 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-display text-3xl font-bold text-white">Interactive Listing Marketplace</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LISTINGS.map((l) => (
            <div key={l.id} className="rounded-2xl border border-white/5 bg-ink-800/60 p-4">
              <BeforeAfterSlider beforeImage={l.beforeImage} afterImage={l.afterImage} alt={l.title} />
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{l.title}</h3>
                  {l.seller.isVerifiedAgent && <BadgeCheck className="h-4 w-4 text-accent-emerald" title="Verified Broker" />}
                </div>
                <p className="text-xs text-slate-400">{l.location}</p>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="font-display text-xl font-bold text-accent-emerald-light">{l.price}</span>
                  <button onClick={() => setSelectedListing(l)} className="text-xs font-semibold text-accent-indigo-light">
                    View Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedListing && <PropertyDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
    </section>
  )
}

function StageForm() {
  const [category, setCategory] = useState<SpaceCategory>('Living Room')
  const [style, setStyle] = useState<StagingStyle>('Modern')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [generation, setGeneration] = useState<'idle' | 'generating' | 'ready'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = useId()

  const isLand = category === 'Raw Land / Plot' || category === 'Exterior & Lawn'

  // Release the object URL when it is replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Simulated AI generation: whenever a photo is uploaded (or the category /
  // style changes with a photo loaded) show a processing state, then reveal a
  // before/after comparison. Swap this timeout for a real staging API call.
  useEffect(() => {
    if (!previewUrl) {
      setGeneration('idle')
      return
    }
    setGeneration('generating')
    const timer = window.setTimeout(() => setGeneration('ready'), 2500)
    return () => window.clearTimeout(timer)
  }, [previewUrl, category, style])

  const stagedPreviewUrl = SAMPLE_RENDERS[category]

  const selectFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    setPreviewUrl(URL.createObjectURL(file))
    setFileName(file.name)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0])
  }

  const clearFile = () => {
    setPreviewUrl(null)
    setFileName(null)
    // Reset so choosing the same file again still fires onChange.
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCategoryChange = (cat: SpaceCategory) => {
    setCategory(cat)
    setStyle(cat === 'Raw Land / Plot' || cat === 'Exterior & Lawn' ? 'Modern Luxury Villa' : 'Modern')
  }

  return (
    <section id="staging-studio" className="scroll-mt-16 border-y border-white/5 bg-ink-800/40 py-24">
      <div className="mx-auto max-w-4xl px-6 rounded-2xl border border-white/5 bg-ink-800/80 p-8">
        <h2 className="font-display text-2xl font-bold text-white">AI Staging & Architectural Studio</h2>
        <p className="mt-1 text-xs text-slate-400">Upload a room or raw land plot photo to generate instant AI previews.</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="relative">
            {previewUrl && generation === 'ready' ? (
              <>
                <BeforeAfterSlider
                  beforeImage={previewUrl}
                  afterImage={stagedPreviewUrl}
                  beforeLabel="Original"
                  afterLabel="AI Staged"
                  alt={fileName ?? 'Uploaded photo'}
                  className="border border-accent-indigo/30"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-xs text-accent-emerald-light">
                    <CheckCircle2 className="h-3.5 w-3.5" /> AI preview ready: {style}
                  </p>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Replace
                    </button>
                    <button
                      type="button"
                      onClick={clearFile}
                      aria-label="Remove selected photo"
                      className="flex items-center justify-center rounded-lg border border-white/10 px-2 py-1.5 text-white transition hover:border-white/20 hover:bg-white/5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
            <label
              hidden={Boolean(previewUrl && generation === 'ready')}
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
                'relative flex aspect-[4/3] cursor-pointer [&[hidden]]:hidden flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition focus-within:border-accent-indigo focus-within:ring-2 focus-within:ring-accent-indigo/40',
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
                  {generation === 'generating' && (
                    <span
                      role="status"
                      aria-live="polite"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900/75 backdrop-blur-sm"
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-accent-indigo-light" />
                      <span className="text-sm font-semibold text-white">Generating AI Staging Preview...</span>
                      <span className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-accent-indigo to-accent-emerald" />
                      </span>
                    </span>
                  )}
                </>
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-accent-indigo-light" />
                  <span className="mt-2 text-xs font-semibold text-white">{isLand ? 'Upload Raw Land Photo' : 'Upload Room Photo'}</span>
                  <span className="mt-1 text-[11px] text-slate-500">Tap, click, or drop an image</span>
                </>
              )}
            </label>
            {previewUrl && generation !== 'ready' && (
              <button
                type="button"
                onClick={clearFile}
                aria-label="Remove selected photo"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/80 text-white backdrop-blur transition hover:bg-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as SpaceCategory)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300">{isLand ? 'Architectural Concept' : 'Staging Style'}</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as StagingStyle)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
              >
                {(isLand ? ARCHITECTURAL_STYLES : INTERIOR_STYLES).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setEmailModalOpen(true)}
              className="w-full rounded-xl bg-gradient-to-r from-accent-emerald to-accent-emerald-light py-3 font-semibold text-ink-900 shadow-lg"
            >
              Generate Free Watermarked Preview
            </button>
          </div>
        </div>

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

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

type PricingPlanId = 'single-listing' | 'pro-subscription'

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
    id: 'single-listing',
    name: 'Single Listing',
    price: '$5',
    period: '/ per listing',
    description: 'Perfect for owners and agents staging a single property or plot.',
    features: [
      '1 Active Listing (Stays active for 3 Months)',
      'Before & After Interactive Staging',
      'AI photo modification for future furnished outlook',
      'HD Image Support',
    ],
    cta: 'Get Started',
    checkoutUrl: process.env.NEXT_PUBLIC_STRIPE_SINGLE_LISTING_URL,
  },
  {
    id: 'pro-subscription',
    name: 'Pro Subscription',
    price: '$99',
    period: '/ month',
    description: 'Built for agencies and developers moving inventory at scale.',
    features: [
      'Maximum 50 Verified Property Listings (Stay active up to 6 Months)',
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

function Pricing({
  onNavigate,
  onSelectPlan,
}: {
  onNavigate: (id: string) => void
  /** Override to call a Stripe Checkout API endpoint, track analytics, etc. */
  onSelectPlan?: (plan: PricingPlan) => void | Promise<void>
}) {
  const [proModalPlan, setProModalPlan] = useState<PricingPlan | null>(null)

  // Close the Pro modal if the visitor returns from Stripe via the back button.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => {
      if (e.persisted) setProModalPlan(null)
    }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  // Each plan has its own action:
  // - Single Listing: smoothly scroll to the AI Staging & Architectural Studio
  //   so the visitor can upload and stage an individual photo.
  // - Pro Subscription: open the Pro agency setup modal, which hands off to
  //   Stripe checkout once it is configured.
  const handlePlanClick = (plan: PricingPlan) => {
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
          <p className="mt-3 text-slate-400">Pay per listing or go unlimited. No hidden fees.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-2xl border p-8 transition',
                plan.popular
                  ? 'border-accent-indigo/50 bg-gradient-to-b from-accent-indigo/15 to-ink-800/80 shadow-2xl shadow-accent-indigo/20'
                  : 'border-white/5 bg-ink-800/60 hover:border-white/10',
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent-indigo to-accent-emerald px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  <Star className="h-3 w-3 fill-current" /> Popular
                </span>
              )}

              <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
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
                        plan.popular ? 'bg-accent-indigo/20 text-accent-indigo-light' : 'bg-accent-emerald/15 text-accent-emerald-light',
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
                aria-haspopup={plan.id === 'pro-subscription' ? 'dialog' : undefined}
                data-plan={plan.id}
                className={cn(
                  'mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition',
                  plan.popular
                    ? 'bg-accent-indigo text-white hover:bg-accent-indigo-light hover:text-ink-900'
                    : 'border border-white/10 text-white hover:border-white/20 hover:bg-white/5',
                )}
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
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
  const navigate = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-ink-900 text-slate-200">
      <Navbar onNavigate={navigate} onOpenVerify={() => setVerifyModalOpen(true)} />
      <main>
        <Hero onNavigate={navigate} />
        <Marketplace />
        <StageForm />
        <Pricing onNavigate={navigate} />
      </main>
      {verifyModalOpen && <SellerVerificationModal onClose={() => setVerifyModalOpen(false)} />}
    </div>
  )
}
