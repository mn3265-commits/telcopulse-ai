'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Mail, MapPin, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, XCircle, Shield, RotateCcw, PhoneCall, Sparkles, Loader2, Brain, Target, Send } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Papa from 'papaparse'

interface SubscriberBrief {
  narrative: string
  recommendation: {
    channel: string
    offer: string
    urgency: string
    rationale: string
  }
  email: { subject: string; body: string }
  voice_script: string
}

interface EditedDraft {
  emailSubject: string
  emailBody: string
  voiceScript: string
}

interface Subscriber {
  user_id: string
  phone: string
  age: number
  gender: string
  city: string
  tenure_months: number
  plan_type: string
  plan_name: string
  monthly_spend_usd: number
  data_usage_pct: number
  voice_minutes: number
  complaints_last_90d: number
  nps_score: number
  dropped_calls_last_30d: number
  days_since_last_topup: number
  device_brand: string
  predicted_churn_prob: number
  risk_tier: string
  app_logins_last_30d: number
}

const STEPS = ['AI Scored', 'Reviewed', 'Contacted', 'Outcome']

function getRiskColor(tier: string) {
  switch (tier) {
    case 'High': case 'Critical': return 'bg-red-500/15 text-red-600 border-red-500/20'
    case 'Medium': case 'Medium-High': return 'bg-amber-500/15 text-amber-400 border-amber-500/20'
    default: return 'bg-green-500/15 text-green-600 border-green-500/20'
  }
}

function getRiskBorder(tier: string) {
  switch (tier) {
    case 'High': case 'Critical': return 'border-l-red-500'
    case 'Medium': case 'Medium-High': return 'border-l-amber-500'
    default: return 'border-l-green-500'
  }
}

function getDrivers(sub: Subscriber): string[] {
  const drivers: string[] = []
  if (sub.tenure_months <= 3) drivers.push(`New subscriber (${sub.tenure_months} months), still in trial phase`)
  if (sub.monthly_spend_usd < 3) drivers.push(`Very low spend ($${sub.monthly_spend_usd.toFixed(2)}/mo), highly price-sensitive`)
  if (sub.data_usage_pct < 30) drivers.push(`Low data utilization (${sub.data_usage_pct.toFixed(0)}% of quota used)`)
  if (sub.complaints_last_90d >= 2) drivers.push(`${sub.complaints_last_90d} complaints in the last 90 days`)
  if (sub.nps_score <= 5) drivers.push(`Low NPS score (${sub.nps_score}/10), indicating dissatisfaction`)
  if (sub.dropped_calls_last_30d >= 5) drivers.push(`${sub.dropped_calls_last_30d} dropped calls last month, poor network experience`)
  if (sub.days_since_last_topup > 20) drivers.push(`No top-up activity in ${sub.days_since_last_topup} days`)
  if (sub.app_logins_last_30d < 5) drivers.push(`Low app engagement (${sub.app_logins_last_30d} logins in 30 days)`)
  return drivers.length > 0 ? drivers.slice(0, 4) : ['No significant risk drivers detected']
}

export default function SubscriberView() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<Record<string, { step: number; action?: string; outcome?: string; sendStatus?: string; channelOverride?: 'email' | 'voice'; notes?: string }>>({})
  const [sending, setSending] = useState<string | null>(null)
  const [briefs, setBriefs] = useState<Record<string, SubscriberBrief>>({})
  const [briefSource, setBriefSource] = useState<Record<string, 'claude' | 'template'>>({})
  const [briefLoading, setBriefLoading] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, EditedDraft>>({})
  const [feedbackSaved, setFeedbackSaved] = useState<Record<string, { at: string; message: string }>>({})
  const [feedbackSaving, setFeedbackSaving] = useState<string | null>(null)
  const [feedbackError, setFeedbackError] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/data/subscribers_scored.csv')
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, { header: true, dynamicTyping: true })
        setSubscribers(parsed.data.slice(0, 200) as Subscriber[])
      })
  }, [])

  const filtered = useMemo(() => {
    let result = subscribers
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        s.user_id?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.plan_name?.toLowerCase().includes(q)
      )
    }
    if (riskFilter !== 'All') {
      if (riskFilter === 'High') result = result.filter(s => s.risk_tier === 'High' || s.risk_tier === 'Critical')
      else if (riskFilter === 'Medium') result = result.filter(s => s.risk_tier === 'Medium' || s.risk_tier === 'Medium-High')
      else result = result.filter(s => s.risk_tier === 'Low' || s.risk_tier === 'Very Low' || s.risk_tier === 'Medium-Low')
    }
    return result
  }, [subscribers, search, riskFilter])

  const doAction = (id: string, action: string, step: number) => {
    setWorkflows(prev => ({ ...prev, [id]: { ...prev[id], step, action } }))
  }

  const doOutcome = (id: string, outcome: string) => {
    setWorkflows(prev => ({ ...prev, [id]: { ...prev[id], step: 4, outcome } }))
  }

  const doReset = (id: string) => {
    setWorkflows(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    setBriefs(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    setEdits(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    setBriefSource(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    setFeedbackSaved(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    setFeedbackError(prev => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  function templateBrief(sub: Subscriber): SubscriberBrief {
    const drivers = getDrivers(sub)
    const topDriver = drivers[0] || 'general churn signal'
    const channel = sub.complaints_last_90d >= 2 || sub.dropped_calls_last_30d >= 5 ? 'voice' : 'email'
    const urgency = sub.predicted_churn_prob >= 0.7 ? 'high' : sub.predicted_churn_prob >= 0.5 ? 'medium' : 'low'
    const offer = sub.monthly_spend_usd > 15
      ? '15GB bonus data + 30% off next bill + free streaming pack'
      : '10GB bonus data for 7 days + 30% off next bill'
    const subject = `[Indosat] Special Offer for ${sub.plan_name} Subscriber`
    const body = `Dear valued subscriber ${sub.phone},

Greetings from Indosat Ooredoo Hutchison.

${sub.tenure_months <= 3 ? `As a new subscriber (${sub.tenure_months} months), we want to ensure you have the best possible experience.` : `We truly appreciate your loyalty over ${sub.tenure_months} months with Indosat.`}${sub.complaints_last_90d >= 2 ? ` We are aware of ${sub.complaints_last_90d} unresolved complaints and our team is prioritizing their resolution.` : ''}${sub.data_usage_pct < 30 ? ` We noticed your data usage has been declining recently.` : ''}

As a ${sub.plan_name} subscriber in ${sub.city}, we have prepared a special offer for you: ${offer}.

Claim easily through the myIndosat app > Special Offers menu.

Warm regards,
Customer Retention Team
Indosat Ooredoo Hutchison`
    const voice = `Hello. I am calling from Indosat Ooredoo Hutchison, reaching out from ${sub.city}. ${sub.complaints_last_90d >= 2 ? `We are aware of ${sub.complaints_last_90d} unresolved complaints. Our team is prioritizing their resolution.` : sub.data_usage_pct < 30 ? `We noticed your data usage has been declining recently.` : `As a loyal subscriber for ${sub.tenure_months} months, you are very important to us.`} We have prepared a special offer for you: ${offer}. Please open the myIndosat app, go to Special Offers, and tap Claim Now. Thank you.`
    return {
      narrative: `${sub.user_id} shows a ${(sub.predicted_churn_prob * 100).toFixed(0)}% churn probability driven primarily by ${topDriver.toLowerCase()}. ${drivers.length > 1 ? `Secondary signals include ${drivers[1].toLowerCase()}.` : ''} Without intervention this account is likely to churn within 30 days.`,
      recommendation: {
        channel,
        offer,
        urgency,
        rationale: channel === 'voice'
          ? 'Service-quality complaints and dropped calls warrant a personal voice contact rather than another email.'
          : 'Behavioral signals (low usage, declining engagement) respond better to a tangible offer reviewed at the subscriber\'s own pace via email.',
      },
      email: { subject, body },
      voice_script: voice,
    }
  }

  async function generateBrief(sub: Subscriber) {
    setBriefLoading(sub.user_id)
    try {
      const res = await fetch('/api/subscriber-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      let brief: SubscriberBrief
      let src: 'claude' | 'template' = 'template'
      if (res.ok) {
        const data = await res.json()
        brief = data.brief
        src = 'claude'
      } else {
        brief = templateBrief(sub)
      }
      setBriefs(prev => ({ ...prev, [sub.user_id]: brief }))
      setBriefSource(prev => ({ ...prev, [sub.user_id]: src }))
      setEdits(prev => ({
        ...prev,
        [sub.user_id]: {
          emailSubject: brief.email.subject,
          emailBody: brief.email.body,
          voiceScript: brief.voice_script,
        },
      }))
    } catch {
      const brief = templateBrief(sub)
      setBriefs(prev => ({ ...prev, [sub.user_id]: brief }))
      setBriefSource(prev => ({ ...prev, [sub.user_id]: 'template' }))
      setEdits(prev => ({
        ...prev,
        [sub.user_id]: {
          emailSubject: brief.email.subject,
          emailBody: brief.email.body,
          voiceScript: brief.voice_script,
        },
      }))
    } finally {
      setBriefLoading(null)
    }
  }

  function updateEdit(id: string, field: keyof EditedDraft, value: string) {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  async function submitFeedback(sub: Subscriber) {
    const wf = workflows[sub.user_id]
    if (!wf?.outcome) return
    setFeedbackSaving(sub.user_id)
    setFeedbackError(prev => {
      const copy = { ...prev }
      delete copy[sub.user_id]
      return copy
    })
    try {
      const channelUsed = wf.sendStatus
        ? wf.sendStatus.toLowerCase().includes('email')
          ? 'email'
          : wf.sendStatus.toLowerCase().includes('call')
            ? 'voice'
            : 'none'
        : 'none'
      const payload = {
        user_id: sub.user_id,
        predicted_churn_prob: sub.predicted_churn_prob,
        risk_tier: sub.risk_tier,
        human_action: wf.action,
        channel_used: channelUsed,
        outcome: wf.outcome,
        notes: wf.notes || '',
        ai_brief_used: !!briefs[sub.user_id],
        recommendation_channel: briefs[sub.user_id]?.recommendation.channel,
        timestamp_iso: new Date().toISOString(),
      }
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setFeedbackSaved(prev => ({
          ...prev,
          [sub.user_id]: { at: data.stored_at, message: data.message },
        }))
      } else {
        setFeedbackError(prev => ({ ...prev, [sub.user_id]: data.error || 'Save failed' }))
      }
    } catch (err: any) {
      setFeedbackError(prev => ({ ...prev, [sub.user_id]: err.message || 'Network error' }))
    } finally {
      setFeedbackSaving(null)
    }
  }

  function urgencyBadge(urgency: string) {
    const u = urgency.toLowerCase()
    if (u === 'high') return 'bg-red-500/15 text-red-600 border-red-500/20'
    if (u === 'medium') return 'bg-amber-500/15 text-amber-600 border-amber-500/20'
    return 'bg-green-500/15 text-green-600 border-green-500/20'
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <p className="text-xs text-gray-600 mb-3">Search for individual subscribers and manage the full retention workflow: review AI predictions, approve or override risk levels, send personalized messages, and record outcomes.</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, phone, city, or plan..."
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400/50 transition"
            />
          </div>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-brand-400/50"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High / Critical</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="text-xs text-gray-600 mt-2">{filtered.length} subscriber(s) found</div>
      </div>

      {/* Subscriber list */}
      <div className="space-y-2">
        {filtered.slice(0, 30).map(sub => {
          const isOpen = expanded === sub.user_id
          const wf = workflows[sub.user_id] || { step: 1 }
          const drivers = getDrivers(sub)
          const prob = (sub.predicted_churn_prob * 100).toFixed(1)

          return (
            <div key={sub.user_id} className={`bg-gray-50 border border-gray-200 rounded-xl overflow-hidden transition border-l-4 ${getRiskBorder(sub.risk_tier)}`}>
              {/* Header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : sub.user_id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{sub.user_id}</span>
                      <span className="text-xs text-gray-600">{sub.phone}</span>
                      {wf.step > 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-400/10 text-brand-400 font-medium">
                          {STEPS[wf.step - 1]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {sub.city}
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      {sub.plan_name} ({sub.plan_type})
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      {formatCurrency(sub.monthly_spend_usd)}/mo
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getRiskColor(sub.risk_tier)}`}>
                    {prob}% risk
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-gray-200 p-5 space-y-5 animate-in fade-in duration-200">
                  {/* Step tracker */}
                  <div className="flex gap-1">
                    {STEPS.map((step, idx) => (
                      <div key={idx} className={`flex-1 text-center py-1.5 rounded text-[10px] font-semibold tracking-wider ${
                        idx + 1 < wf.step ? 'bg-green-500/20 text-green-600' :
                        idx + 1 === wf.step ? 'bg-brand-400/20 text-brand-400' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {idx + 1}. {step.toUpperCase()}
                      </div>
                    ))}
                  </div>

                  {/* Profile grid */}
                  <div>
                    <div className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase mb-1">Customer Profile</div>
                    <p className="text-[10px] text-gray-600 mb-3">Subscriber demographics, plan details, and usage indicators from the CRM database.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Tenure', value: `${sub.tenure_months} months` },
                        { label: 'ARPU', value: formatCurrency(sub.monthly_spend_usd) },
                        { label: 'Data Usage', value: `${sub.data_usage_pct?.toFixed(0)}%` },
                        { label: 'NPS Score', value: `${sub.nps_score}/10` },
                        { label: 'Voice', value: `${sub.voice_minutes} min` },
                        { label: 'Complaints', value: `${sub.complaints_last_90d}` },
                        { label: 'Dropped Calls', value: `${sub.dropped_calls_last_30d}` },
                        { label: 'Device', value: sub.device_brand },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                          <div className="text-[10px] text-gray-600 uppercase tracking-wider">{item.label}</div>
                          <div className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk drivers */}
                  <div>
                    <div className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase mb-1">Churn Risk Drivers</div>
                    <p className="text-[10px] text-gray-600 mb-3">AI-generated churn probability and the top behavioral factors driving this subscriber&apos;s risk level.</p>
                    <div className={`rounded-lg p-4 border-l-4 ${
                      sub.risk_tier === 'High' || sub.risk_tier === 'Critical' ? 'bg-red-500/5 border-l-red-500' :
                      sub.risk_tier === 'Medium' || sub.risk_tier === 'Medium-High' ? 'bg-amber-500/5 border-l-amber-500' :
                      'bg-green-500/5 border-l-green-500'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl font-bold text-gray-900">{prob}%</div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRiskColor(sub.risk_tier)}`}>
                          {sub.risk_tier} RISK
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {drivers.map((d, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <AlertTriangle className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Brief — narrative + recommendation */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase">AI Retention Brief</div>
                      {briefSource[sub.user_id] === 'claude' && (
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-400/10 text-brand-400 border border-brand-400/20">Claude Sonnet 4</span>
                      )}
                      {briefSource[sub.user_id] === 'template' && (
                        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 border border-gray-300" title="Set ANTHROPIC_API_KEY for live Claude generation">Template fallback</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600 mb-3">Per-subscriber narrative explanation, recommended action, and personalized message drafts. Generated on demand and editable before sending.</p>

                    {!briefs[sub.user_id] ? (
                      <button
                        onClick={() => generateBrief(sub)}
                        disabled={briefLoading === sub.user_id}
                        className="w-full bg-brand-400/10 hover:bg-brand-400/20 disabled:opacity-50 text-brand-400 border border-brand-400/30 px-4 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
                      >
                        {briefLoading === sub.user_id ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating brief...</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5" /> Generate AI brief for this subscriber</>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {/* Narrative */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Brain className="w-3.5 h-3.5 text-brand-400" />
                            <div className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Why this subscriber is at risk</div>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed">{briefs[sub.user_id].narrative}</p>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-brand-400" />
                              <div className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Recommended action</div>
                            </div>
                            <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${urgencyBadge(briefs[sub.user_id].recommendation.urgency)}`}>
                              {briefs[sub.user_id].recommendation.urgency} urgency
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Suggested channel</div>
                              <div className="text-gray-900 font-medium capitalize">{briefs[sub.user_id].recommendation.channel}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Offer</div>
                              <div className="text-gray-900 font-medium">{briefs[sub.user_id].recommendation.offer}</div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-[10px] text-gray-600 italic">Rationale: {briefs[sub.user_id].recommendation.rationale}</div>
                          </div>

                          {/* Channel override (HITL) */}
                          <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5">Override channel (HITL)</div>
                            <div className="flex gap-1.5">
                              {(['email', 'voice'] as const).map(ch => (
                                <button
                                  key={ch}
                                  onClick={() => setWorkflows(prev => ({ ...prev, [sub.user_id]: { ...prev[sub.user_id], step: prev[sub.user_id]?.step ?? 1, channelOverride: ch } }))}
                                  className={`flex-1 px-2.5 py-1.5 rounded text-[11px] font-medium transition capitalize ${
                                    wf.channelOverride === ch
                                      ? 'bg-brand-400/15 text-brand-400 border border-brand-400/30'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-transparent'
                                  }`}
                                >
                                  {ch}
                                </button>
                              ))}
                              <button
                                onClick={() => setWorkflows(prev => ({ ...prev, [sub.user_id]: { ...prev[sub.user_id], step: prev[sub.user_id]?.step ?? 1, channelOverride: undefined } }))}
                                className="px-2.5 py-1.5 rounded text-[11px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                                title="Clear override"
                              >
                                Auto
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Re-generate */}
                        <button
                          onClick={() => generateBrief(sub)}
                          disabled={briefLoading === sub.user_id}
                          className="text-[11px] text-brand-400 hover:text-brand-400/80 font-medium flex items-center gap-1"
                        >
                          {briefLoading === sub.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          Re-generate brief
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div>
                    <div className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase mb-1">Marketer Decision</div>
                    <p className="text-[10px] text-gray-600 mb-3">Human-in-the-loop decision point. Review the AI prediction and decide: approve, escalate to high priority, or mark as safe.</p>
                    <div className="flex gap-2">
                      <button onClick={() => doAction(sub.user_id, 'approved', 2)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                          wf.action === 'approved' ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve AI
                      </button>
                      <button onClick={() => doAction(sub.user_id, 'escalated', 2)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                          wf.action === 'escalated' ? 'bg-red-500/20 text-red-600 border border-red-500/30' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>
                        <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                      </button>
                      <button onClick={() => doAction(sub.user_id, 'safe', 2)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                          wf.action === 'safe' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}>
                        <Shield className="w-3.5 h-3.5" /> Mark Safe
                      </button>
                      <button onClick={() => doReset(sub.user_id)}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact actions */}
                  {wf.step >= 2 && (() => {
                    // Use edited drafts if a brief was generated; otherwise fall back to the inline template.
                    const fallback = templateBrief(sub)
                    const draft = edits[sub.user_id] || {
                      emailSubject: fallback.email.subject,
                      emailBody: fallback.email.body,
                      voiceScript: fallback.voice_script,
                    }
                    const emailSubject = draft.emailSubject
                    const emailBody = draft.emailBody
                    const callScript = draft.voiceScript
                    return (
                    <div>
                      <div className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase mb-1">Send Retention Message — review &amp; edit before send</div>
                      <p className="text-[10px] text-gray-600 mb-3">Edit the email subject, body, and voice script below before dispatching. Changes are saved per-subscriber and used by the send buttons.</p>

                      {/* Editable Email + Voice */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider">Email — editable</div>
                            <span className="text-[10px] text-gray-500">{emailBody.length} chars</span>
                          </div>
                          <input
                            type="text"
                            value={emailSubject}
                            onChange={e => updateEdit(sub.user_id, 'emailSubject', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-t-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-400/50 transition"
                            placeholder="Email subject"
                          />
                          <textarea
                            value={emailBody}
                            onChange={e => updateEdit(sub.user_id, 'emailBody', e.target.value)}
                            rows={9}
                            className="w-full bg-white border border-t-0 border-gray-200 rounded-b-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-400/50 transition resize-y font-mono leading-relaxed"
                            placeholder="Email body"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="text-[10px] text-gray-600 uppercase tracking-wider">Voice script — editable</div>
                            <span className="text-[10px] text-gray-500">{callScript.length} chars</span>
                          </div>
                          <textarea
                            value={callScript}
                            onChange={e => updateEdit(sub.user_id, 'voiceScript', e.target.value)}
                            rows={11}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-400/50 transition resize-y font-mono leading-relaxed"
                            placeholder="Voice call script (Twilio TwiML will read this aloud)"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          disabled={sending === sub.user_id || (wf.channelOverride && wf.channelOverride !== 'email')}
                          onClick={async () => {
                            setSending(sub.user_id)
                            try {
                              const res = await fetch('/api/send-email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  to: 'mn3265@columbia.edu',
                                  subject: emailSubject,
                                  body: emailBody
                                }),
                              })
                              const data = await res.json()
                              setWorkflows(prev => ({
                                ...prev,
                                [sub.user_id]: { ...prev[sub.user_id], step: 3, sendStatus: data.success ? `Email sent to mn3265@columbia.edu` : `Failed: ${data.error}` }
                              }))
                            } catch (err: any) {
                              setWorkflows(prev => ({
                                ...prev,
                                [sub.user_id]: { ...prev[sub.user_id], step: 3, sendStatus: `Failed: ${err.message}` }
                              }))
                            } finally {
                              setSending(null)
                            }
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                            wf.channelOverride === 'email' || (briefs[sub.user_id]?.recommendation.channel === 'email' && !wf.channelOverride)
                              ? 'bg-brand-400 hover:bg-brand-400/90 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {sending === sub.user_id ? <span className="animate-spin">...</span> : <Mail className="w-3.5 h-3.5" />} Send Email
                        </button>
                        <button
                          disabled={sending === sub.user_id || (wf.channelOverride && wf.channelOverride !== 'voice')}
                          onClick={async () => {
                            setSending(sub.user_id)
                            try {
                              const res = await fetch('/api/send-call', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  to: '+16469890162',
                                  message: callScript
                                }),
                              })
                              const data = await res.json()
                              setWorkflows(prev => ({
                                ...prev,
                                [sub.user_id]: { ...prev[sub.user_id], step: 3, sendStatus: data.success ? `Calling +16469890162...` : `Failed: ${data.error}` }
                              }))
                            } catch (err: any) {
                              setWorkflows(prev => ({
                                ...prev,
                                [sub.user_id]: { ...prev[sub.user_id], step: 3, sendStatus: `Failed: ${err.message}` }
                              }))
                            } finally {
                              setSending(null)
                            }
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                            wf.channelOverride === 'voice' || (briefs[sub.user_id]?.recommendation.channel === 'voice' && !wf.channelOverride)
                              ? 'bg-brand-400 hover:bg-brand-400/90 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {sending === sub.user_id ? <span className="animate-spin">...</span> : <PhoneCall className="w-3.5 h-3.5" />} Voice Call
                        </button>
                      </div>
                      {wf.sendStatus && (
                        <div className={`mt-2 text-xs flex items-center gap-1.5 ${wf.sendStatus.startsWith('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                          {wf.sendStatus.startsWith('Failed') ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {wf.sendStatus}
                        </div>
                      )}
                    </div>
                  )})()}

                  {/* Outcome */}
                  {wf.step >= 3 && (
                    <div>
                      <div className="text-[10px] font-semibold text-brand-400 tracking-wider uppercase mb-1">Record Outcome</div>
                      <p className="text-[10px] text-gray-600 mb-3">Record the result after contacting this subscriber. Outcome data feeds back into the monthly model retraining pipeline.</p>
                      <div className="flex gap-2">
                        {['Retained', 'Churned', 'No response'].map(outcome => (
                          <button key={outcome}
                            onClick={() => doOutcome(sub.user_id, outcome)}
                            disabled={!!feedbackSaved[sub.user_id]}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              wf.outcome === outcome
                                ? outcome === 'Retained' ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                                : outcome === 'Churned' ? 'bg-red-500/20 text-red-600 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                            }`}>
                            {outcome}
                          </button>
                        ))}
                      </div>
                      {/* HITL reviewer notes */}
                      <div className="mt-3">
                        <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5">Reviewer notes (optional)</div>
                        <textarea
                          value={wf.notes || ''}
                          disabled={!!feedbackSaved[sub.user_id]}
                          onChange={e => setWorkflows(prev => ({ ...prev, [sub.user_id]: { ...prev[sub.user_id], step: prev[sub.user_id]?.step ?? 1, notes: e.target.value } }))}
                          rows={2}
                          placeholder="Why did this subscriber retain / churn? Any signal the model missed?"
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-brand-400/50 transition resize-y disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      {/* Save / submit feedback for retraining */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => submitFeedback(sub)}
                          disabled={!wf.outcome || feedbackSaving === sub.user_id || !!feedbackSaved[sub.user_id]}
                          className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
                            feedbackSaved[sub.user_id]
                              ? 'bg-green-500/15 text-green-700 border border-green-500/30 cursor-default'
                              : !wf.outcome
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-brand-400 hover:bg-brand-400/90 text-white'
                          }`}
                        >
                          {feedbackSaving === sub.user_id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving feedback...</>
                          ) : feedbackSaved[sub.user_id] ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Saved · queued for next retrain</>
                          ) : !wf.outcome ? (
                            <>Pick an outcome to enable Save</>
                          ) : (
                            <><Send className="w-3.5 h-3.5" /> Save feedback for retraining</>
                          )}
                        </button>
                        {feedbackSaved[sub.user_id] && (
                          <div className="mt-2 text-[11px] text-gray-600">
                            <span className="text-gray-500">{feedbackSaved[sub.user_id].message}</span>
                            <span className="text-gray-400"> Stored at {new Date(feedbackSaved[sub.user_id].at).toLocaleTimeString()}.</span>
                          </div>
                        )}
                        {feedbackError[sub.user_id] && (
                          <div className="mt-2 text-[11px] text-red-600 flex items-center gap-1.5">
                            <XCircle className="w-3 h-3" /> {feedbackError[sub.user_id]}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length > 30 && (
        <div className="text-center text-xs text-gray-600 py-4">
          Showing 30 of {filtered.length} subscribers. Use search or filters to narrow results.
        </div>
      )}
    </div>
  )
}
