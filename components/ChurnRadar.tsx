'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, TrendingDown, Phone, Download, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [campaign, setCampaign] = useState<any>(null)

  const handleExport = () => {
    const header = 'phone,plan,risk_score,monthly_spend_usd,churn_reason\n'
    const rows = highRiskSubscribers
      .map(s => `${s.phone},${s.plan},${s.risk},${s.spend},"${s.reason}"`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `high_risk_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateCampaign = async () => {
    setCampaignLoading(true)
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segmentName: 'High-Risk Churners',
          segmentDescription: '358 subscribers with >70% churn probability, avg spend $12.43/mo',
          goal: 'retention',
          offer: 'Free 10GB data + 50% off next month',
          tone: 'urgent',
        }),
      })
      const data = await res.json()
      setCampaign(data.success && data.campaign ? data.campaign : data)
    } catch {
      setCampaign({
        sms: 'Don\'t go! Get 10GB free + 50% off next month. Claim in the myIndosat app. T&C apply.',
        email_subject: 'We want you to stay with us',
        email_body: 'Dear valued customer,\n\nWe noticed changes in your usage. As a thank you for your loyalty, enjoy 10GB free data + 50% off your next bill.\n\nClaim now in the myIndosat app.\n\nBest regards,\nIndosat Ooredoo Hutchison',
        reasoning: 'Urgent retention with immediate value proposition to prevent imminent churn.',
      })
    } finally {
      setCampaignLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Distribution chart + model info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-gray-900">Churn risk distribution</h3>
              <span className="text-xs text-gray-400">XGBoost model</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">How subscribers are distributed across risk tiers, from very low to critical churn probability.</p>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="tier" stroke="rgba(0,0,0,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(0,0,0,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.1)',
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

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <div className="text-xs font-medium text-brand-200 tracking-wider uppercase mb-1">Model details</div>
            <p className="text-[10px] text-gray-400 mb-3">Configuration and performance of the churn prediction model.</p>
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
        <div className="lg:col-span-3 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-400" />
                High-risk subscribers
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Subscribers most likely to churn, sorted by predicted probability. Export to CSV or generate a retention campaign.</p>
            </div>
            <button
              onClick={handleExport}
              className="text-xs text-brand-200 hover:text-gray-900 transition flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Export list
            </button>
          </div>

          <div className="space-y-2">
            {highRiskSubscribers.map((sub, idx) => (
              <div
                key={idx}
                onClick={() => setSelected(sub)}
                className={`flex items-center justify-between p-3 bg-gray-50 hover:bg-white border rounded-lg cursor-pointer transition group ${
                  selected?.phone === sub.phone ? 'border-brand-400/40' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-brand-400/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-brand-200" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-800 truncate">{sub.phone}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>{sub.plan}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="truncate">{sub.reason}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div className="text-xs text-gray-400">{formatCurrency(sub.spend)}/mo</div>
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

          <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Projected MRR loss if no action: <span className="text-brand-200 font-medium">{formatCurrency(1247)}</span></span>
            </div>
            <button
              onClick={handleGenerateCampaign}
              disabled={campaignLoading}
              className="text-xs bg-brand-400 hover:bg-brand-400/90 text-white px-3 py-1.5 rounded-md font-medium transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {campaignLoading && <Loader2 className="w-3 h-3 animate-spin" />}
              {campaignLoading ? 'Generating...' : 'Generate retention campaign'}
            </button>
          </div>
        </div>
      </div>

      {/* Campaign result */}
      {campaign && (
        <div className="bg-gray-50 border border-brand-400/20 rounded-xl p-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-brand-200">Generated Retention Campaign</h3>
            <button
              onClick={() => setCampaign(null)}
              className="text-xs text-gray-400 hover:text-gray-900 transition"
            >
              Dismiss
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">SMS</div>
              <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{campaign.sms}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Email Subject</div>
              <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{campaign.email_subject}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Email Body</div>
              <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-line">{campaign.email_body}</div>
            </div>
            {campaign.reasoning && (
              <div className="md:col-span-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1.5">Strategy</div>
                <div className="text-sm text-gray-500 italic">{campaign.reasoning}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={highlight ? 'text-brand-200 font-medium' : 'text-gray-700 font-mono text-xs'}>{value}</span>
    </div>
  )
}
