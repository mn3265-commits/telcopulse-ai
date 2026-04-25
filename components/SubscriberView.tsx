'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Phone, Mail, MapPin, Clock, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, XCircle, Shield, RotateCcw, Send, PhoneCall } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Papa from 'papaparse'

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
    case 'High': case 'Critical': return 'bg-red-500/15 text-red-400 border-red-500/20'
    case 'Medium': case 'Medium-High': return 'bg-amber-500/15 text-amber-400 border-amber-500/20'
    default: return 'bg-green-500/15 text-green-400 border-green-500/20'
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
  const [workflows, setWorkflows] = useState<Record<string, { step: number; action?: string; outcome?: string }>>({})

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
  }

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, phone, city, or plan..."
              className="w-full bg-ink-900/80 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-400/50 transition"
            />
          </div>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-ink-900/80 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-400/50"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High / Critical</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="text-xs text-white/40 mt-2">{filtered.length} subscriber(s) found</div>
      </div>

      {/* Subscriber list */}
      <div className="space-y-2">
        {filtered.slice(0, 30).map(sub => {
          const isOpen = expanded === sub.user_id
          const wf = workflows[sub.user_id] || { step: 1 }
          const drivers = getDrivers(sub)
          const prob = (sub.predicted_churn_prob * 100).toFixed(1)

          return (
            <div key={sub.user_id} className={`bg-ink-800/30 border border-white/[0.06] rounded-xl overflow-hidden transition border-l-4 ${getRiskBorder(sub.risk_tier)}`}>
              {/* Header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : sub.user_id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{sub.user_id}</span>
                      <span className="text-xs text-white/40">{sub.phone}</span>
                      {wf.step > 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-400/10 text-brand-200 font-medium">
                          {STEPS[wf.step - 1]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {sub.city}
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      {sub.plan_name} ({sub.plan_type})
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      {formatCurrency(sub.monthly_spend_usd)}/mo
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getRiskColor(sub.risk_tier)}`}>
                    {prob}% risk
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-white/[0.06] p-5 space-y-5 animate-in fade-in duration-200">
                  {/* Step tracker */}
                  <div className="flex gap-1">
                    {STEPS.map((step, idx) => (
                      <div key={idx} className={`flex-1 text-center py-1.5 rounded text-[10px] font-semibold tracking-wider ${
                        idx + 1 < wf.step ? 'bg-green-500/20 text-green-400' :
                        idx + 1 === wf.step ? 'bg-brand-400/20 text-brand-200' :
                        'bg-white/5 text-white/30'
                      }`}>
                        {idx + 1}. {step.toUpperCase()}
                      </div>
                    ))}
                  </div>

                  {/* Profile grid */}
                  <div>
                    <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Customer Profile</div>
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
                        <div key={idx} className="bg-ink-900/50 rounded-lg p-3">
                          <div className="text-[10px] text-white/40 uppercase tracking-wider">{item.label}</div>
                          <div className="text-sm font-medium text-white mt-0.5">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk drivers */}
                  <div>
                    <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Churn Risk Drivers</div>
                    <div className={`rounded-lg p-4 border-l-4 ${
                      sub.risk_tier === 'High' || sub.risk_tier === 'Critical' ? 'bg-red-500/5 border-l-red-500' :
                      sub.risk_tier === 'Medium' || sub.risk_tier === 'Medium-High' ? 'bg-amber-500/5 border-l-amber-500' :
                      'bg-green-500/5 border-l-green-500'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl font-bold text-white">{prob}%</div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRiskColor(sub.risk_tier)}`}>
                          {sub.risk_tier} RISK
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {drivers.map((d, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-white/70">
                            <AlertTriangle className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Marketer Decision</div>
                    <div className="flex gap-2">
                      <button onClick={() => doAction(sub.user_id, 'approved', 2)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                          wf.action === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve AI
                      </button>
                      <button onClick={() => doAction(sub.user_id, 'escalated', 2)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                          wf.action === 'escalated' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}>
                        <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                      </button>
                      <button onClick={() => doAction(sub.user_id, 'safe', 2)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                          wf.action === 'safe' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 text-white/60'}`}>
                        <Shield className="w-3.5 h-3.5" /> Mark Safe
                      </button>
                      <button onClick={() => doReset(sub.user_id)}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/40 transition">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact actions */}
                  {wf.step >= 2 && (
                    <div>
                      <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Send Retention Message</div>
                      <div className="flex gap-2">
                        <button onClick={() => doAction(sub.user_id, wf.action, 3)}
                          className="flex-1 bg-brand-400 hover:bg-brand-400/90 text-white px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Send Email
                        </button>
                        <button onClick={() => doAction(sub.user_id, wf.action, 3)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5">
                          <PhoneCall className="w-3.5 h-3.5" /> Voice Call
                        </button>
                      </div>
                      {wf.step >= 3 && (
                        <div className="mt-2 text-xs text-green-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Retention message sent to {sub.phone}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outcome */}
                  {wf.step >= 3 && (
                    <div>
                      <div className="text-[10px] font-semibold text-brand-200 tracking-wider uppercase mb-3">Record Outcome</div>
                      <div className="flex gap-2">
                        {['Retained', 'Churned', 'No response'].map(outcome => (
                          <button key={outcome} onClick={() => doOutcome(sub.user_id, outcome)}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                              wf.outcome === outcome
                                ? outcome === 'Retained' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : outcome === 'Churned' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-white/60'
                            }`}>
                            {outcome}
                          </button>
                        ))}
                      </div>
                      {wf.outcome && (
                        <div className="mt-2 text-xs text-white/50">
                          Outcome recorded. This data feeds into the monthly model retraining pipeline.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length > 30 && (
        <div className="text-center text-xs text-white/40 py-4">
          Showing 30 of {filtered.length} subscribers. Use search or filters to narrow results.
        </div>
      )}
    </div>
  )
}
