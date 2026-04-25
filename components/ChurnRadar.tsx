'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, TrendingDown, Phone, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Sample data representing ML model predictions
const riskDistribution = [
  { tier: 'Very Low', count: 3245, color: '#059669' },
  { tier: 'Low', count: 3218, color: '#10B981' },
  { tier: 'Medium-Low', count: 1522, color: '#84CC16' },
  { tier: 'Medium', count: 1137, color: '#EAB308' },
  { tier: 'Medium-High', count: 520, color: '#F97316' },
  { tier: 'High', count: 258, color: '#E85D24' },
  { tier: 'Critical', count: 100, color: '#DC2626' },
]

const highRiskSubscribers = [
  { phone: '+62-812-3847-****', plan: 'Prepaid 50GB', reason: 'No data usage for 6 days', risk: 0.92, spend: 13.30 },
  { phone: '+62-813-7291-****', plan: 'Postpaid Family', reason: 'Declining usage trend', risk: 0.87, spend: 40.00 },
  { phone: '+62-821-4458-****', plan: 'Prepaid 20GB', reason: '2 complaints last month', risk: 0.84, spend: 6.70 },
  { phone: '+62-822-1193-****', plan: 'Prepaid Daily', reason: 'NPS dropped to 3', risk: 0.81, spend: 1.30 },
  { phone: '+62-851-7712-****', plan: 'Postpaid Starter', reason: '12 dropped calls', risk: 0.78, spend: 10.00 },
  { phone: '+62-853-6634-****', plan: 'Prepaid 10GB', reason: 'Low engagement', risk: 0.74, spend: 3.30 },
]

export default function ChurnRadar() {
  const [selected, setSelected] = useState<typeof highRiskSubscribers[0] | null>(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Distribution chart + model info */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-white">Churn risk distribution</h3>
            <span className="text-xs text-white/40">XGBoost model</span>
          </div>
          <p className="text-xs text-white/40 mb-5">Predicted across 10,000 subscribers</p>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="tier" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: '#1A1A1C', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {riskDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5">
          <div className="text-xs font-medium text-brand-200 tracking-wider uppercase mb-3">Model details</div>
          <div className="space-y-2.5 text-sm">
            <Row label="Algorithm" value="XGBoost Classifier" />
            <Row label="Features" value="18 behavioral + demographic" />
            <Row label="Training samples" value="8,000" />
            <Row label="ROC-AUC" value="0.65" highlight />
            <Row label="Top signal" value="NPS score" />
          </div>
        </div>
      </div>

      {/* Right: High-risk list */}
      <div className="lg:col-span-3 bg-ink-800/30 border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brand-400" />
              High-risk subscribers
            </h3>
            <p className="text-xs text-white/40 mt-0.5">Sorted by predicted churn probability · Top 6 of 358</p>
          </div>
          <button className="text-xs text-brand-200 hover:text-white transition">
            Export list →
          </button>
        </div>

        <div className="space-y-2">
          {highRiskSubscribers.map((sub, idx) => (
            <div 
              key={idx}
              onClick={() => setSelected(sub)}
              className="flex items-center justify-between p-3 bg-ink-900/50 hover:bg-ink-900 border border-white/[0.04] hover:border-white/10 rounded-lg cursor-pointer transition group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-brand-400/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-brand-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white/90 truncate">{sub.phone}</div>
                  <div className="text-xs text-white/40 flex items-center gap-2 mt-0.5">
                    <span>{sub.plan}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="truncate">{sub.reason}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <div className="text-xs text-white/40">{formatCurrency(sub.spend)}/mo</div>
                <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  sub.risk >= 0.9 ? 'bg-red-500/15 text-red-400' :
                  sub.risk >= 0.8 ? 'bg-brand-400/15 text-brand-200' :
                  'bg-amber-500/15 text-amber-400'
                }`}>
                  {Math.round(sub.risk * 100)}% risk
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Projected MRR loss if no action: <span className="text-brand-200 font-medium">{formatCurrency(1247)}</span></span>
          </div>
          <button className="text-xs bg-brand-400 hover:bg-brand-400/90 text-white px-3 py-1.5 rounded-md font-medium transition">
            Generate retention campaign
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      <span className={highlight ? 'text-brand-200 font-medium' : 'text-white/80 font-mono text-xs'}>{value}</span>
    </div>
  )
}
