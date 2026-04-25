'use client'

import { useState } from 'react'
import { Rocket, Sparkles, Target, Megaphone, Calendar, BarChart3, Loader2 } from 'lucide-react'

interface LaunchPlan {
  positioning: string
  boldPhrase: string
  tagline: string
  pillars: { title: string; description: string }[]
  phases: {
    name: string
    timeline: string
    items: string[]
    borderColor: string
  }[]
  channels: {
    channel: string
    priority: string
    budgetPct: string
    reach: string
    cta: string
  }[]
}

function generateLaunchPlan(product: string, audience: string, budget: string): LaunchPlan {
  const p = product.toLowerCase()
  const a = audience.toLowerCase()

  // Template 1: Churn / retention / prediction related
  if (p.includes('churn') || p.includes('retention') || p.includes('prediction')) {
    return {
      positioning: `For ${audience || 'telecom operators'} who struggle with subscriber attrition, ${product || 'our platform'} is an `,
      boldPhrase: 'AI-powered churn intelligence platform that turns reactive firefighting into proactive retention.',
      tagline: 'Predict. Prevent. Retain. — Churn intelligence that pays for itself.',
      pillars: [
        { title: 'Predictive Accuracy', description: 'Machine learning models trained on telecom-specific behavioral signals deliver 92%+ prediction accuracy, identifying at-risk subscribers weeks before they leave.' },
        { title: 'Actionable Insights', description: 'Every prediction comes with recommended retention actions — personalized offers, timing windows, and channel preferences — so your CVM team can act immediately.' },
        { title: 'Measurable ROI', description: 'Real-time dashboards track retention lift, revenue saved, and campaign effectiveness. Most operators see 3-5x ROI within the first quarter.' },
      ],
      phases: [
        { name: 'Pre-launch', timeline: 'Week 1-2', borderColor: 'border-l-gray-400', items: [
          'Develop 3 operator case studies with anonymized churn reduction metrics',
          'Create demo environment with sample telecom dataset and live predictions',
          'Brief 10-15 industry analysts and telecom media contacts under NDA',
          'Launch teaser campaign on LinkedIn targeting CVM and analytics leaders',
        ]},
        { name: 'Launch', timeline: 'Week 3-4', borderColor: 'border-l-brand-400', items: [
          'Host virtual launch event with live demo and guest operator testimonial',
          'Publish benchmark report: "State of Churn Prediction in Telecom 2026"',
          'Activate paid LinkedIn and Google Ads campaigns targeting decision-makers',
          'Begin outbound sequence to top 50 target operator accounts',
        ]},
        { name: 'Scale', timeline: 'Month 2-3', borderColor: 'border-l-green-500', items: [
          'Launch free trial program with guided onboarding for qualified operators',
          'Publish monthly "Churn Intelligence Digest" newsletter for lead nurturing',
          'Present at 2-3 regional telecom conferences (MWC, CommunicAsia)',
          'Expand partner channel through system integrator and consultancy alliances',
        ]},
      ],
      channels: [
        { channel: 'LinkedIn', priority: 'High', budgetPct: '30%', reach: '15K-25K impressions/mo', cta: 'Book a Demo' },
        { channel: 'Email Outreach', priority: 'High', budgetPct: '15%', reach: '2K-5K qualified contacts', cta: 'See Your Churn Score' },
        { channel: 'Webinar Series', priority: 'High', budgetPct: '20%', reach: '500-1K registrants', cta: 'Reserve Your Seat' },
        { channel: 'Content Marketing', priority: 'Medium', budgetPct: '15%', reach: '10K-20K organic visits', cta: 'Download Report' },
        { channel: 'Paid Search', priority: 'Medium', budgetPct: '10%', reach: '3K-8K clicks/mo', cta: 'Start Free Trial' },
        { channel: 'Partner Channel', priority: 'Medium', budgetPct: '10%', reach: '20-50 referrals', cta: 'Join Partner Program' },
      ],
    }
  }

  // Template 2: 5G / enterprise / network related
  if (p.includes('5g') || p.includes('enterprise') || p.includes('network') || p.includes('manufacturing')) {
    return {
      positioning: `For ${audience || 'enterprise decision-makers'} seeking to modernize operations, ${product || 'our solution'} delivers `,
      boldPhrase: 'next-generation connectivity that transforms industrial workflows from cost centers into competitive advantages.',
      tagline: 'Enterprise-grade 5G. Industrial-strength results.',
      pillars: [
        { title: 'Ultra-Reliable Connectivity', description: 'Private 5G network slicing with 99.99% uptime SLA, purpose-built for mission-critical manufacturing and logistics operations.' },
        { title: 'Edge Intelligence', description: 'On-premise edge computing integrated with 5G delivers sub-10ms latency for real-time quality control, predictive maintenance, and autonomous systems.' },
        { title: 'Total Cost of Ownership', description: 'Bundled pricing with transparent per-device economics. Customers typically reduce connectivity costs by 40% while gaining 10x the bandwidth.' },
      ],
      phases: [
        { name: 'Pre-launch', timeline: 'Week 1-2', borderColor: 'border-l-gray-400', items: [
          'Conduct 5 pilot deployments with manufacturing partners for proof-of-concept data',
          'Develop ROI calculator tool for enterprise prospects to model their savings',
          'Create vertical-specific solution briefs for manufacturing, logistics, and healthcare',
        ]},
        { name: 'Launch', timeline: 'Week 3-4', borderColor: 'border-l-brand-400', items: [
          'Host industry roundtable with pilot customers sharing deployment results',
          'Launch dedicated enterprise microsite with interactive coverage and latency maps',
          'Activate account-based marketing campaigns targeting top 100 enterprise accounts',
          'Partner announcement with major equipment vendors and system integrators',
        ]},
        { name: 'Scale', timeline: 'Month 2-3', borderColor: 'border-l-green-500', items: [
          'Expand pilot program to 20+ enterprise customers across 3 verticals',
          'Launch enterprise developer portal with APIs and integration documentation',
          'Establish enterprise advisory board with 8-10 strategic customer representatives',
          'Begin regional expansion with localized sales teams and support infrastructure',
        ]},
      ],
      channels: [
        { channel: 'LinkedIn ABM', priority: 'High', budgetPct: '25%', reach: '5K-10K target accounts', cta: 'Request Pilot' },
        { channel: 'Industry Events', priority: 'High', budgetPct: '25%', reach: '3K-5K attendees', cta: 'Visit Our Booth' },
        { channel: 'Email Sequences', priority: 'High', budgetPct: '10%', reach: '1K-3K enterprise contacts', cta: 'Calculate Your ROI' },
        { channel: 'Webinar Series', priority: 'Medium', budgetPct: '15%', reach: '300-700 registrants', cta: 'Join the Roundtable' },
        { channel: 'Content / SEO', priority: 'Medium', budgetPct: '15%', reach: '8K-15K organic visits', cta: 'Read Case Study' },
        { channel: 'Partner Referrals', priority: 'Medium', budgetPct: '10%', reach: '30-60 referrals', cta: 'Become a Partner' },
      ],
    }
  }

  // Template 3: Digital wallet / fintech / payments / unbanked
  if (p.includes('wallet') || p.includes('fintech') || p.includes('payment') || p.includes('banking') || a.includes('unbanked') || a.includes('rural')) {
    return {
      positioning: `For ${audience || 'underserved communities'} who lack access to traditional financial services, ${product || 'our platform'} is a `,
      boldPhrase: 'mobile-first financial inclusion tool that makes saving, sending, and spending money as simple as sending a text.',
      tagline: 'Your money. Your phone. Your future.',
      pillars: [
        { title: 'Zero-Barrier Onboarding', description: 'Sign up with just a phone number and national ID. No minimum balance, no monthly fees, no bank account required. Works on basic feature phones via USSD.' },
        { title: 'Trust Through Transparency', description: 'Real-time transaction notifications, clear fee structures displayed before confirmation, and local-language support in 12 regional dialects build confidence.' },
        { title: 'Community-Powered Growth', description: 'Agent network of 50,000+ local merchants enables cash-in/cash-out. Referral rewards and group savings circles drive organic adoption through existing social trust.' },
      ],
      phases: [
        { name: 'Pre-launch', timeline: 'Week 1-2', borderColor: 'border-l-gray-400', items: [
          'Recruit and train 500 local agents in 3 pilot districts with highest unbanked population',
          'Partner with 2-3 local NGOs and microfinance institutions for credibility and reach',
          'Run community town halls and radio spots explaining the service in local languages',
          'Soft-launch with 1,000 beta users to stress-test USSD and app flows',
        ]},
        { name: 'Launch', timeline: 'Week 3-4', borderColor: 'border-l-brand-400', items: [
          'Official launch event with local government endorsement and media coverage',
          'Activate sign-up bonus: free first 5 transactions for new users',
          'Deploy branded agent kiosks at markets, transport hubs, and community centers',
          'Launch referral program: earn credit for every friend who completes first transaction',
        ]},
        { name: 'Scale', timeline: 'Month 2-3', borderColor: 'border-l-green-500', items: [
          'Expand to 10 additional districts based on pilot performance data',
          'Introduce group savings and micro-lending features for existing users',
          'Partner with utility companies for bill payment integration',
          'Launch merchant payment acceptance to drive daily transaction volume',
        ]},
      ],
      channels: [
        { channel: 'Agent Network', priority: 'High', budgetPct: '30%', reach: '50K-100K direct contacts', cta: 'Sign Up Now' },
        { channel: 'Radio / Local Media', priority: 'High', budgetPct: '20%', reach: '200K-500K listeners', cta: 'Visit Your Nearest Agent' },
        { channel: 'Community Events', priority: 'High', budgetPct: '20%', reach: '10K-30K attendees', cta: 'Try It Free' },
        { channel: 'Social Media', priority: 'Medium', budgetPct: '15%', reach: '50K-100K impressions', cta: 'Download the App' },
        { channel: 'NGO Partnerships', priority: 'Medium', budgetPct: '10%', reach: '5K-15K beneficiaries', cta: 'Learn More' },
        { channel: 'SMS Campaigns', priority: 'Low', budgetPct: '5%', reach: '100K-300K messages', cta: 'Dial *123# to Start' },
      ],
    }
  }

  // Generic B2B SaaS fallback
  return {
    positioning: `For ${audience || 'business leaders'} looking to gain a competitive edge, ${product || 'our solution'} is a `,
    boldPhrase: 'purpose-built platform that eliminates manual processes and delivers measurable business outcomes from day one.',
    tagline: 'Smarter tools. Faster decisions. Better outcomes.',
    pillars: [
      { title: 'Ease of Adoption', description: 'Intuitive interface with guided onboarding means your team is productive within hours, not weeks. No coding required and seamless integration with existing tools.' },
      { title: 'Data-Driven Decisions', description: 'Real-time analytics and customizable dashboards surface the insights that matter most. Automated reporting saves 10+ hours per week for every team member.' },
      { title: 'Enterprise Ready', description: 'SOC 2 Type II certified, SSO/SAML support, role-based access controls, and 99.9% uptime SLA. Built for teams of 5 to 5,000.' },
    ],
    phases: [
      { name: 'Pre-launch', timeline: 'Week 1-2', borderColor: 'border-l-gray-400', items: [
        'Finalize product messaging and create core sales collateral (deck, one-pager, demo script)',
        'Build landing page with early-access signup and product walkthrough video',
        'Identify and brief 20 target accounts for personalized outreach',
        'Secure 3-5 beta customer testimonials and case study commitments',
      ]},
      { name: 'Launch', timeline: 'Week 3-4', borderColor: 'border-l-brand-400', items: [
        'Send launch announcement to full prospect and customer database',
        'Publish product launch blog post and distribute via social channels',
        'Host live product demo webinar with Q&A session',
        'Activate paid advertising campaigns on LinkedIn and Google',
      ]},
      { name: 'Scale', timeline: 'Month 2-3', borderColor: 'border-l-green-500', items: [
        'Launch self-serve trial with automated onboarding email sequence',
        'Begin publishing weekly thought leadership content for SEO',
        'Establish partner and reseller program with co-marketing resources',
        'Analyze funnel metrics and optimize conversion at each stage',
      ]},
    ],
    channels: [
      { channel: 'LinkedIn', priority: 'High', budgetPct: '25%', reach: '10K-20K impressions/mo', cta: 'Request a Demo' },
      { channel: 'Email Marketing', priority: 'High', budgetPct: '15%', reach: '3K-8K contacts', cta: 'Start Free Trial' },
      { channel: 'Webinars', priority: 'High', budgetPct: '20%', reach: '400-800 registrants', cta: 'Save Your Spot' },
      { channel: 'Content / Blog', priority: 'Medium', budgetPct: '15%', reach: '8K-15K organic visits', cta: 'Read More' },
      { channel: 'Paid Search', priority: 'Medium', budgetPct: '15%', reach: '5K-12K clicks/mo', cta: 'Try It Free' },
      { channel: 'Partnerships', priority: 'Low', budgetPct: '10%', reach: '15-40 referrals', cta: 'Partner With Us' },
    ],
  }
}

const EXAMPLES = [
  { product: 'Churn prediction SaaS', audience: 'Telecom operators' },
  { product: '5G enterprise plan', audience: 'Manufacturing SMBs' },
  { product: 'Digital wallet', audience: 'Unbanked rural users' },
]

const BUDGET_OPTIONS = ['< $10K', '$10K - $50K', '$50K - $200K', '> $200K']

export default function LaunchCopilot() {
  const [product, setProduct] = useState('')
  const [audience, setAudience] = useState('')
  const [budget, setBudget] = useState('$10K - $50K')
  const [plan, setPlan] = useState<LaunchPlan | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = () => {
    if (!product.trim() && !audience.trim()) return
    setLoading(true)
    setPlan(null)
    setTimeout(() => {
      const result = generateLaunchPlan(product, audience, budget)
      setPlan(result)
      setLoading(false)
    }, 1200)
  }

  const loadExample = (ex: typeof EXAMPLES[0]) => {
    setProduct(ex.product)
    setAudience(ex.audience)
  }

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-medium text-gray-900">Launch details</h3>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Describe your product and target audience to generate a complete go-to-market launch strategy with positioning, messaging, phased plan, and channel mix.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Product or service</label>
                <input
                  type="text"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="e.g. AI-powered churn prediction platform"
                  className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Target audience</label>
                <input
                  type="text"
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  placeholder="e.g. Telecom CVM managers in Southeast Asia"
                  className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Launch budget</label>
                <select
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400"
                >
                  {BUDGET_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || (!product.trim() && !audience.trim())}
                className="w-full bg-brand-400 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-500 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating launch plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Launch Plan
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="text-xs font-medium text-gray-500 mb-1">Try an example</div>
            <p className="text-[10px] text-gray-400 mb-3">Click to pre-fill a product and audience, then generate the plan.</p>
            <div className="flex gap-2 flex-wrap">
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => loadExample(ex)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-full transition border border-gray-100"
                >
                  {ex.product} / {ex.audience}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Placeholder / Loading */}
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center min-h-[280px]">
            {loading ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
                <p className="text-sm text-gray-500">Crafting your launch strategy...</p>
                <p className="text-[10px] text-gray-400">Analyzing product-market fit, channels, and timing</p>
              </div>
            ) : plan ? (
              <div className="space-y-3 w-full">
                <div className="bg-brand-400/10 border border-brand-400/20 rounded-lg p-4">
                  <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-2">Tagline</div>
                  <p className="text-sm font-semibold text-gray-900">{plan.tagline}</p>
                </div>
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Target className="w-3.5 h-3.5 text-brand-400" />
                    <span>3 messaging pillars</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    <span>3-phase launch timeline</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BarChart3 className="w-3.5 h-3.5 text-brand-400" />
                    <span>{plan.channels.length} channel strategies</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Megaphone className="w-3.5 h-3.5 text-brand-400" />
                    <span>Budget: {budget}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Rocket className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm text-gray-400">Your launch plan will appear here</p>
                <p className="text-[10px] text-gray-300">Enter a product and audience, then click generate</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated output */}
      {plan && (
        <div className="space-y-6">
          {/* Positioning Statement */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Positioning Statement</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {plan.positioning}<span className="font-bold text-gray-900">{plan.boldPhrase}</span>
            </p>
          </div>

          {/* Messaging Pillars */}
          <div>
            <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Messaging Pillars</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.pillars.map((pillar, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-brand-400/10 text-brand-400 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                    <h4 className="text-sm font-medium text-gray-900">{pillar.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phased Launch Plan */}
          <div>
            <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Phased Launch Plan</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.phases.map((phase, idx) => (
                <div key={idx} className={`bg-gray-50 border border-gray-200 rounded-xl p-5 border-l-4 ${phase.borderColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Phase {idx + 1}: {phase.name}</h4>
                    <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded">{phase.timeline}</span>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map((item, i) => (
                      <li key={i} className="text-xs text-gray-500 leading-relaxed flex gap-2">
                        <span className="text-brand-400 mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Strategy */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Channel Strategy</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 pr-4">Channel</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 pr-4">Priority</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 pr-4">Budget %</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 pr-4">Expected Reach</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.channels.map((ch, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="text-xs font-medium text-gray-900 py-2.5 pr-4">{ch.channel}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          ch.priority === 'High' ? 'bg-brand-400/10 text-brand-400' :
                          ch.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {ch.priority}
                        </span>
                      </td>
                      <td className="text-xs text-gray-600 py-2.5 pr-4 font-mono">{ch.budgetPct}</td>
                      <td className="text-xs text-gray-500 py-2.5 pr-4">{ch.reach}</td>
                      <td className="text-xs text-brand-400 font-medium py-2.5">{ch.cta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
