'use client'

import { useState } from 'react'
import { User, Target, MessageSquare, BarChart3, ArrowRight, Loader2 } from 'lucide-react'

interface Persona {
  summary: {
    name: string
    role: string
    ageRange: string
    companySize: string
    location: string
  }
  painPoints: string[]
  goals: string[]
  channels: { name: string; percentage: number }[]
  lifecycle: { stage: string; description: string }[]
}

const PERSONA_TEMPLATES: Record<string, Persona> = {
  prepaid_youth: {
    summary: {
      name: 'Rina Putri',
      role: 'University Student / Part-time Content Creator',
      ageRange: '18-24',
      companySize: 'Individual consumer',
      location: 'Jakarta, Bandung, Surabaya - Urban Indonesia',
    },
    painPoints: [
      'Runs out of data quota before the end of the month and cannot afford top-ups',
      'Experiences throttled speeds during peak hours on campus and public areas',
      'Confused by too many package options with unclear pricing and hidden fees',
      'Lacks affordable international roaming for study-abroad or travel plans',
    ],
    goals: [
      'Stay connected on social media and streaming platforms 24/7 without interruptions',
      'Find the most cost-effective data plan that fits a tight student budget',
      'Get reliable high-speed connectivity for online classes and content uploads',
      'Earn rewards or cashback through loyalty programs and referrals',
    ],
    channels: [
      { name: 'WhatsApp', percentage: 92 },
      { name: 'TikTok / Instagram', percentage: 78 },
      { name: 'In-app notifications', percentage: 65 },
      { name: 'SMS', percentage: 25 },
    ],
    lifecycle: [
      { stage: 'Awareness', description: 'Discovers brand through influencer promos and peer recommendations on social media' },
      { stage: 'Consideration', description: 'Compares prepaid bundles on price aggregator apps and campus community forums' },
      { stage: 'Activation', description: 'Purchases starter pack at convenience store or activates via e-wallet top-up' },
      { stage: 'Retention', description: 'Engages with gamified loyalty rewards, streak bonuses, and flash data deals' },
      { stage: 'Advocacy', description: 'Shares referral codes with classmates and posts unboxing or review content' },
    ],
  },
  enterprise_5g: {
    summary: {
      name: 'Budi Santoso',
      role: 'IT Manager / Digital Transformation Lead',
      ageRange: '35-48',
      companySize: '50-200 employees (SMB Manufacturing)',
      location: 'Bekasi, Karawang, Cikarang - Java Industrial Corridor',
    },
    painPoints: [
      'Legacy network infrastructure cannot support real-time IoT sensor monitoring on factory floors',
      'High latency and unreliable connections cause costly downtime in automated production lines',
      'Difficulty justifying 5G investment ROI to cost-conscious ownership and finance teams',
      'Lack of in-house technical expertise to deploy and manage private 5G network slices',
    ],
    goals: [
      'Enable predictive maintenance and real-time quality control through connected machinery',
      'Reduce unplanned downtime by at least 30% within the first year of 5G deployment',
      'Implement a scalable private network that grows with production capacity expansion',
      'Access dedicated enterprise support with SLA guarantees and on-site technical assistance',
    ],
    channels: [
      { name: 'Email', percentage: 85 },
      { name: 'LinkedIn', percentage: 62 },
      { name: 'WhatsApp Business', percentage: 58 },
      { name: 'Industry trade events', percentage: 45 },
    ],
    lifecycle: [
      { stage: 'Awareness', description: 'Learns about 5G enterprise solutions at trade expos and through industry analyst reports' },
      { stage: 'Consideration', description: 'Requests pilot program proposals and benchmarks against competitor offerings' },
      { stage: 'Activation', description: 'Signs 12-24 month contract after successful proof-of-concept on one production line' },
      { stage: 'Retention', description: 'Expands deployment to additional sites based on measurable productivity gains' },
      { stage: 'Advocacy', description: 'Presents case study at industry events and refers partner companies in the supply chain' },
    ],
  },
  family_plan: {
    summary: {
      name: 'Dewi Handayani',
      role: 'Working Mother / Household Decision Maker',
      ageRange: '30-42',
      companySize: 'Household of 4-5 members',
      location: 'Greater Jakarta, Surabaya, Medan - Urban middle class',
    },
    painPoints: [
      'Managing separate prepaid plans for each family member is expensive and time-consuming',
      'Children exceed data limits on gaming and streaming, causing unexpected charges',
      'No easy way to monitor or control screen time and content access for younger users',
      'Customer service wait times are too long when resolving billing or connectivity issues',
    ],
    goals: [
      'Consolidate family connectivity under one affordable plan with shared data pools',
      'Have parental controls to set usage limits and content filters for children',
      'Get reliable home and mobile coverage for remote work, online school, and entertainment',
      'Save at least 20-30% compared to individual plans while getting more overall data',
    ],
    channels: [
      { name: 'WhatsApp', percentage: 88 },
      { name: 'Email', percentage: 55 },
      { name: 'In-app self-service', percentage: 48 },
      { name: 'Retail store visits', percentage: 35 },
    ],
    lifecycle: [
      { stage: 'Awareness', description: 'Sees family plan ads on social media, YouTube, or hears recommendations from parent groups' },
      { stage: 'Consideration', description: 'Compares family bundles across providers focusing on total cost and parental features' },
      { stage: 'Activation', description: 'Signs up online or at retail store, adds family members through a simple invite flow' },
      { stage: 'Retention', description: 'Uses the family dashboard to manage usage, appreciates auto-renewal and flexible add-ons' },
      { stage: 'Advocacy', description: 'Recommends the plan at school parent groups and shares referral links via WhatsApp' },
    ],
  },
  iot_logistics: {
    summary: {
      name: 'Hendra Wijaya',
      role: 'Fleet Operations Director',
      ageRange: '38-52',
      companySize: '200-1000 employees (Mid-size logistics)',
      location: 'Jakarta, Semarang, Makassar - Multi-island operations',
    },
    painPoints: [
      'Inconsistent cellular coverage across remote Indonesian islands causes GPS tracking blind spots',
      'High per-device SIM management costs when scaling to thousands of connected vehicles and sensors',
      'Difficulty integrating multiple IoT platforms with existing fleet management and ERP systems',
      'Data security concerns when transmitting sensitive shipment and route information over public networks',
    ],
    goals: [
      'Achieve 99.5% fleet visibility across all operational routes including rural and inter-island corridors',
      'Reduce per-device connectivity costs by 40% through bulk IoT SIM plans and eSIM management',
      'Implement real-time cold chain monitoring for perishable goods with automated alerts',
      'Access a unified API dashboard to manage all connected devices from a single platform',
    ],
    channels: [
      { name: 'Email', percentage: 80 },
      { name: 'WhatsApp Business', percentage: 70 },
      { name: 'Direct sales meetings', percentage: 65 },
      { name: 'Industry webinars', percentage: 40 },
    ],
    lifecycle: [
      { stage: 'Awareness', description: 'Identifies connectivity gaps during route expansion planning and fleet scaling initiatives' },
      { stage: 'Consideration', description: 'Evaluates IoT connectivity providers on coverage maps, API quality, and bulk pricing' },
      { stage: 'Activation', description: 'Deploys pilot with 50-100 devices on key routes before committing to full fleet rollout' },
      { stage: 'Retention', description: 'Scales to full deployment as coverage proves reliable, negotiates volume discounts annually' },
      { stage: 'Advocacy', description: 'Shares ROI metrics with logistics industry associations and recommends to partner carriers' },
    ],
  },
}

const GENERIC_PERSONA: Persona = {
  summary: {
    name: 'Ahmad Prasetyo',
    role: 'Mid-level Professional / Tech-savvy Consumer',
    ageRange: '25-40',
    companySize: 'Individual or small team',
    location: 'Major Indonesian cities',
  },
  painPoints: [
    'Network congestion during peak hours leads to frustrating slowdowns and dropped connections',
    'Plan pricing feels opaque with too many add-ons and hidden terms buried in fine print',
    'Customer support channels are slow and often require repeating issues to multiple agents',
    'Switching providers is inconvenient despite dissatisfaction with current service quality',
  ],
  goals: [
    'Get consistent high-speed connectivity for both work and personal use throughout the day',
    'Find a transparent, fairly-priced plan that matches actual usage patterns without waste',
    'Access fast and helpful customer support through preferred digital channels',
    'Enjoy value-added services like streaming bundles, cloud storage, or device financing',
  ],
  channels: [
    { name: 'WhatsApp', percentage: 85 },
    { name: 'Email', percentage: 60 },
    { name: 'In-app notifications', percentage: 45 },
    { name: 'SMS', percentage: 30 },
  ],
  lifecycle: [
    { stage: 'Awareness', description: 'Encounters brand through digital ads, word-of-mouth, or street-level retail presence' },
    { stage: 'Consideration', description: 'Researches plans online, reads reviews, and compares coverage in their area' },
    { stage: 'Activation', description: 'Purchases SIM or subscribes online, completes KYC, and activates first plan' },
    { stage: 'Retention', description: 'Stays engaged through personalized offers, reliable service, and loyalty perks' },
    { stage: 'Advocacy', description: 'Recommends provider to friends and family when satisfied with overall experience' },
  ],
}

function seededInt(seed: string, min: number, max: number): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const norm = ((h >>> 0) % 1000) / 1000
  return Math.floor(min + norm * (max - min + 1))
}

function titleCase(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function generatePersona(product: string, industry: string): Persona {
  const input = `${product} ${industry}`.toLowerCase()
  const seed = `${product}|${industry}`.toLowerCase()

  let base: Persona
  if (input.includes('prepaid') || input.includes('youth') || input.includes('student') || input.includes('young')) {
    base = PERSONA_TEMPLATES.prepaid_youth
  } else if (input.includes('enterprise') || input.includes('5g') || input.includes('manufactur')) {
    base = PERSONA_TEMPLATES.enterprise_5g
  } else if (input.includes('family') || input.includes('household') || input.includes('middle class') || input.includes('urban')) {
    base = PERSONA_TEMPLATES.family_plan
  } else if (input.includes('iot') || input.includes('logistics') || input.includes('fleet') || input.includes('connected')) {
    base = PERSONA_TEMPLATES.iot_logistics
  } else {
    base = GENERIC_PERSONA
  }

  const productLabel = product.trim() ? titleCase(product) : 'the offering'
  const industryLabel = industry.trim() ? titleCase(industry) : 'the target segment'
  const productLower = product.trim().toLowerCase() || 'this offering'
  const industryLower = industry.trim().toLowerCase() || 'this segment'

  const ageLow = seededInt(seed + 'age', 22, 32)
  const ageHigh = ageLow + seededInt(seed + 'span', 8, 16)
  const locShuffle = seededInt(seed + 'loc', 0, 2)
  const cityPools = [
    'Jakarta, Surabaya, Bandung — Tier-1 Indonesian metros',
    'Medan, Semarang, Makassar — emerging regional hubs',
    'Greater Jakarta, Yogyakarta, Denpasar — mixed urban / lifestyle markets',
  ]

  const baseChannelJitter = base.channels.map((c, i) => ({
    name: c.name,
    percentage: Math.max(15, Math.min(96, c.percentage + seededInt(seed + 'ch' + i, -6, 6))),
  }))

  const tailoredPainPoint = `Existing ${productLower} options on the market do not feel built for ${industryLower}, forcing workarounds and manual effort.`
  const tailoredGoal = `Adopt a ${productLower} that fits ${industryLower} workflows out of the box and shows measurable value within the first 30 days.`

  return {
    summary: {
      name: base.summary.name,
      role: industry.trim() ? `${base.summary.role} — ${industryLabel}` : base.summary.role,
      ageRange: `${ageLow}-${ageHigh}`,
      companySize: base.summary.companySize,
      location: cityPools[locShuffle] || base.summary.location,
    },
    painPoints: [tailoredPainPoint, ...base.painPoints.slice(0, 3)],
    goals: [tailoredGoal, ...base.goals.slice(0, 3)],
    channels: baseChannelJitter,
    lifecycle: base.lifecycle.map(stage =>
      stage.stage === 'Consideration'
        ? { stage: stage.stage, description: `Evaluates ${productLower} options against alternatives, focused on fit for ${industryLower}.` }
        : stage,
    ),
  }
}

const EXAMPLES = [
  { product: 'Prepaid data bundle', industry: 'Indonesian youth' },
  { product: 'Enterprise 5G plan', industry: 'Manufacturing SMBs' },
  { product: 'Family plan', industry: 'Urban middle class' },
  { product: 'IoT connectivity', industry: 'Logistics companies' },
]

export default function PersonaArchitect() {
  const [product, setProduct] = useState('')
  const [industry, setIndustry] = useState('')
  const [persona, setPersona] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(false)

  const [source, setSource] = useState<'claude' | 'template' | null>(null)

  const handleGenerate = async () => {
    if (!product.trim() || !industry.trim()) return
    setLoading(true)
    setPersona(null)
    setSource(null)
    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, industry }),
      })
      if (res.ok) {
        const data = await res.json()
        setPersona(data.persona)
        setSource('claude')
      } else {
        // No API key (503) or other failure → fallback to local template
        setPersona(generatePersona(product, industry))
        setSource('template')
      }
    } catch {
      setPersona(generatePersona(product, industry))
      setSource('template')
    } finally {
      setLoading(false)
    }
  }

  const handleExample = (ex: typeof EXAMPLES[0]) => {
    setProduct(ex.product)
    setIndustry(ex.industry)
    setPersona(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-medium text-gray-900">Define your target</h3>
            </div>
            <p className="text-xs text-gray-600 mb-5">
              Enter a product or service and the target industry to generate a detailed Ideal Customer Profile with persona insights, pain points, and lifecycle mapping.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase block mb-1.5">
                  Product or service
                </label>
                <input
                  type="text"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="e.g. 5G enterprise data plan"
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 placeholder:text-gray-500 transition"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase block mb-1.5">
                  Industry or market
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="e.g. Indonesian telecom, SMB segment"
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400 placeholder:text-gray-500 transition"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={!product.trim() || !industry.trim() || loading}
                className="w-full px-4 py-2.5 bg-brand-400 text-white text-sm font-medium rounded-lg hover:bg-brand-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Persona'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="text-xs font-medium text-gray-500 mb-1">Example queries</div>
            <p className="text-[10px] text-gray-600 mb-3">Click to auto-fill the inputs with a sample product and market combination.</p>
            <div className="flex gap-2 flex-wrap">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExample(ex)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-full transition border border-gray-100"
                >
                  {ex.product} / {ex.industry}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Placeholder or Loading */}
        {!persona && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[280px]">
              {loading ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Building persona profile...</p>
                  <p className="text-[10px] text-gray-600 mt-1">Analyzing product-market fit</p>
                </div>
              ) : (
                <div className="text-center">
                  <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Click Generate to create an ICP</p>
                  <p className="text-[10px] text-gray-500 mt-1">Fill in a product and industry above</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generated output */}
      {persona && (
        <div className="space-y-4">
          {/* Persona Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-400" />
                <h3 className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase">Persona Summary</h3>
              </div>
              {source === 'claude' ? (
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-400/10 text-brand-400 border border-brand-400/20">
                  Claude Sonnet 4
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Name', value: persona.summary.name },
                { label: 'Role', value: persona.summary.role },
                { label: 'Age Range', value: persona.summary.ageRange },
                { label: 'Company Size', value: persona.summary.companySize },
                { label: 'Location', value: persona.summary.location },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-0.5">{item.label}</div>
                  <div className="text-sm text-gray-900 font-medium">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pain Points */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-red-600" />
                <h3 className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase">Pain Points</h3>
              </div>
              <ul className="space-y-2.5">
                {persona.painPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span className="text-sm text-gray-600 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Goals & Motivations */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUpIcon className="w-4 h-4 text-green-500" />
                <h3 className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase">Goals &amp; Motivations</h3>
              </div>
              <ul className="space-y-2.5">
                {persona.goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <span className="text-sm text-gray-600 leading-relaxed">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Preferred Channels */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-brand-400" />
                <h3 className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase">Preferred Channels</h3>
              </div>
              <div className="space-y-3">
                {persona.channels.map((ch, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{ch.name}</span>
                      <span className="text-xs font-mono text-gray-500">{ch.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full transition-all duration-500"
                        style={{ width: `${ch.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Lifecycle Journey */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                <h3 className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase">Customer Lifecycle Journey</h3>
              </div>
              <div className="flex flex-col gap-3">
                {persona.lifecycle.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-7 h-7 rounded-full bg-brand-400/10 border border-brand-400/30 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-brand-400">{idx + 1}</span>
                      </div>
                      {idx < persona.lifecycle.length - 1 && (
                        <div className="w-px h-4 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <div className="text-xs font-semibold text-gray-900">{step.stage}</div>
                      <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
