'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Simple churn probability model (mimics the GradientBoosting logic)
function predictChurn(features: {
  tenure: number, spend: number, dataUsage: number, complaints: number,
  nps: number, droppedCalls: number, topupDays: number, appLogins: number
}): number {
  let score = 0.15 // base

  // Tenure
  if (features.tenure <= 2) score += 0.25
  else if (features.tenure <= 6) score += 0.12
  else if (features.tenure >= 18) score -= 0.10

  // Spend
  if (features.spend < 3) score += 0.18
  else if (features.spend < 8) score += 0.05
  else if (features.spend >= 20) score -= 0.08

  // Data usage
  if (features.dataUsage < 20) score += 0.15
  else if (features.dataUsage < 40) score += 0.05
  else if (features.dataUsage >= 80) score -= 0.05

  // Complaints
  score += features.complaints * 0.12

  // NPS
  if (features.nps <= 3) score += 0.20
  else if (features.nps <= 5) score += 0.10
  else if (features.nps >= 8) score -= 0.10

  // Dropped calls
  if (features.droppedCalls >= 10) score += 0.15
  else if (features.droppedCalls >= 5) score += 0.08

  // Top-up days
  if (features.topupDays > 25) score += 0.12
  else if (features.topupDays > 15) score += 0.05

  // App logins
  if (features.appLogins < 3) score += 0.08
  else if (features.appLogins >= 15) score -= 0.05

  return Math.max(0, Math.min(1, score))
}

function getRiskTier(prob: number): { label: string, color: string, bg: string } {
  if (prob >= 0.7) return { label: 'CRITICAL', color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20' }
  if (prob >= 0.5) return { label: 'HIGH', color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20' }
  if (prob >= 0.3) return { label: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' }
  return { label: 'LOW', color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/20' }
}

const SCENARIOS = [
  { name: 'New price-sensitive user', values: { tenure: 1, spend: 2, dataUsage: 15, complaints: 1, nps: 4, droppedCalls: 3, topupDays: 20, appLogins: 2 } },
  { name: 'Loyal high-value subscriber', values: { tenure: 24, spend: 35, dataUsage: 85, complaints: 0, nps: 9, droppedCalls: 0, topupDays: 0, appLogins: 22 } },
  { name: 'Frustrated mid-tier user', values: { tenure: 8, spend: 12, dataUsage: 45, complaints: 3, nps: 3, droppedCalls: 8, topupDays: 15, appLogins: 5 } },
]

export default function WhatIfSimulator() {
  const [tenure, setTenure] = useState(12)
  const [spend, setSpend] = useState(15)
  const [dataUsage, setDataUsage] = useState(60)
  const [complaints, setComplaints] = useState(0)
  const [nps, setNps] = useState(7)
  const [droppedCalls, setDroppedCalls] = useState(2)
  const [topupDays, setTopupDays] = useState(5)
  const [appLogins, setAppLogins] = useState(12)

  const features = { tenure, spend, dataUsage, complaints, nps, droppedCalls, topupDays, appLogins }
  const prob = useMemo(() => predictChurn(features), [tenure, spend, dataUsage, complaints, nps, droppedCalls, topupDays, appLogins])
  const risk = getRiskTier(prob)

  const baselineProb = useMemo(() => predictChurn({ tenure: 12, spend: 15, dataUsage: 60, complaints: 0, nps: 7, droppedCalls: 2, topupDays: 5, appLogins: 12 }), [])
  const diff = prob - baselineProb

  const loadScenario = (s: typeof SCENARIOS[0]) => {
    setTenure(s.values.tenure); setSpend(s.values.spend); setDataUsage(s.values.dataUsage)
    setComplaints(s.values.complaints); setNps(s.values.nps); setDroppedCalls(s.values.droppedCalls)
    setTopupDays(s.values.topupDays); setAppLogins(s.values.appLogins)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sliders */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-medium text-gray-900">Subscriber profile</h3>
          </div>
          <p className="text-xs text-gray-600 mb-5">Adjust subscriber features below and watch how the churn prediction changes in real time. This demonstrates which factors the model considers most important.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <SliderInput label="Tenure (months)" value={tenure} min={0} max={36} onChange={setTenure} />
            <SliderInput label="Monthly spend ($)" value={spend} min={0} max={50} step={0.5} onChange={setSpend} />
            <SliderInput label="Data usage (%)" value={dataUsage} min={0} max={100} onChange={setDataUsage} />
            <SliderInput label="Complaints (90d)" value={complaints} min={0} max={6} onChange={setComplaints} />
            <SliderInput label="NPS score" value={nps} min={1} max={10} onChange={setNps} />
            <SliderInput label="Dropped calls (30d)" value={droppedCalls} min={0} max={20} onChange={setDroppedCalls} />
            <SliderInput label="Days since top-up" value={topupDays} min={0} max={40} onChange={setTopupDays} />
            <SliderInput label="App logins (30d)" value={appLogins} min={0} max={30} onChange={setAppLogins} />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-medium text-gray-500 mb-1">Pre-built scenarios</div>
          <p className="text-[10px] text-gray-600 mb-3">Click to load a realistic subscriber profile and see how the model responds.</p>
          <div className="flex gap-2 flex-wrap">
            {SCENARIOS.map((s, idx) => (
              <button key={idx} onClick={() => loadScenario(s)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-full transition border border-gray-100">
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="space-y-4">
        <div className={`rounded-xl p-6 border ${risk.bg} transition-all duration-300`}>
          <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Predicted churn risk</div>
          <div className="text-5xl font-bold text-gray-900 mb-2">{(prob * 100).toFixed(1)}%</div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${risk.color} ${risk.bg}`}>
            {risk.label} RISK
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-1">vs. average subscriber</div>
            <div className="flex items-center gap-2">
              {diff > 0.01 ? <TrendingUp className="w-4 h-4 text-red-600" /> :
               diff < -0.01 ? <TrendingDown className="w-4 h-4 text-green-600" /> :
               <Minus className="w-4 h-4 text-gray-600" />}
              <span className={`text-lg font-semibold ${diff > 0.01 ? 'text-red-600' : diff < -0.01 ? 'text-green-600' : 'text-gray-500'}`}>
                {diff > 0 ? '+' : ''}{(diff * 100).toFixed(1)}pp
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="text-xs font-medium text-gray-500 mb-1">Interpretation</div>
          <p className="text-[10px] text-gray-600 mb-2">What this risk level means and recommended next steps.</p>
          <div className="text-sm text-gray-600 leading-relaxed">
            {prob >= 0.5
              ? 'This subscriber profile shows strong churn signals. Immediate retention outreach recommended within 24 hours. Consider personalized offer based on usage pattern and complaint history.'
              : prob >= 0.3
              ? 'Moderate churn risk. Monitor weekly and consider proactive engagement through upsell offers or loyalty rewards to strengthen the relationship.'
              : 'Low churn risk. This profile indicates a stable subscriber. Focus on cross-sell opportunities and loyalty program enrollment.'
            }
          </div>
        </div>
      </div>
    </div>
  )
}

function SliderInput({ label, value, min, max, step = 1, onChange }: {
  label: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-mono text-gray-700 bg-white px-2 py-0.5 rounded">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-400"
      />
    </div>
  )
}
