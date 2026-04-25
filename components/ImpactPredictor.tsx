'use client'

import { useState } from 'react'
import { TrendingUp, Target, DollarSign, Users, AlertTriangle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function ImpactPredictor() {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<any>(null)

  const handlePredict = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/churn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign: {
            channel: 'sms',
            offer: '50% off for 3 months + 50GB bonus',
            goal: 'retention',
            content: 'High-value retention offer'
          },
          segment: {
            count: 234,
            avgSpend: 40,
            churnRate: 28
          }
        }),
      })
      const data = await res.json()
      if (data.success) setPrediction(data.prediction)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-medium text-white">Campaign to predict</h3>
          </div>

          <div className="space-y-4">
            <Detail label="Segment" value="High-value at risk" />
            <Detail label="Size" value="234 subscribers" />
            <Detail label="Avg spend" value="$40.00/month" />
            <Detail label="Current churn rate" value="28%" />
            <Detail label="Channel" value="SMS + Email" />
            <Detail label="Offer" value="50% off × 3 months" />
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="mt-5 w-full glow-brand bg-brand-400 hover:bg-brand-400/90 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Predicting...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Predict impact</>
            )}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {!prediction && !loading && (
          <div className="bg-ink-800/30 border border-white/[0.06] border-dashed rounded-xl p-12 text-center">
            <TrendingUp className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <div className="text-white/40 text-sm mb-1">Click Predict to forecast impact</div>
            <div className="text-white/30 text-xs">Claude will use industry benchmarks and your segment data</div>
          </div>
        )}

        {loading && (
          <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-8 text-center">
            <Loader2 className="w-6 h-6 text-brand-400 mx-auto animate-spin mb-3" />
            <div className="text-sm text-white/60">Analyzing campaign fit, benchmarks, and segment behavior...</div>
          </div>
        )}

        {prediction && (
          <>
            <div className="grid grid-cols-3 gap-3 animate-slide-up">
              <MetricCard 
                icon={<Users className="w-4 h-4" />}
                label="Expected reach"
                value={formatNumber(prediction.expected_reach || 234)}
                trend="neutral"
              />
              <MetricCard 
                icon={<Target className="w-4 h-4" />}
                label="Conversion rate"
                value={`${prediction.expected_conversion_rate || 23}%`}
                trend="up"
              />
              <MetricCard 
                icon={<DollarSign className="w-4 h-4" />}
                label="Revenue impact"
                value={formatCurrency(prediction.estimated_revenue_impact_usd || 2845)}
                trend="up"
              />
            </div>

            <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Confidence level</h3>
                <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  prediction.confidence === 'high' ? 'bg-green-400/10 text-green-400' :
                  prediction.confidence === 'medium' ? 'bg-amber-400/10 text-amber-400' :
                  'bg-white/5 text-white/60'
                }`}>
                  {(prediction.confidence || 'medium').toUpperCase()}
                </div>
              </div>

              {prediction.key_assumptions && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-white/60 mb-2">Key assumptions</div>
                  <div className="space-y-1.5">
                    {prediction.key_assumptions.map((a: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-white/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prediction.risks && (
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="text-xs font-medium text-white/60 mb-2">Risks to consider</div>
                  <div className="space-y-1.5">
                    {prediction.risks.map((r: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-white/70">
                        <AlertTriangle className="w-3.5 h-3.5 text-brand-200 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 glow-brand bg-white text-black hover:bg-white/90 px-4 py-2.5 rounded-lg text-sm font-medium transition">
                Approve & schedule campaign
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2.5 rounded-lg text-sm font-medium transition">
                Run A/B test variant
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-4">
      <div className={`w-7 h-7 rounded-lg mb-3 flex items-center justify-center ${
        trend === 'up' ? 'bg-green-400/10 text-green-400' :
        trend === 'down' ? 'bg-brand-400/10 text-brand-200' :
        'bg-white/5 text-white/60'
      }`}>
        {icon}
      </div>
      <div className="text-xs text-white/40 mb-1">{label}</div>
      <div className="text-xl font-medium text-white">{value}</div>
    </div>
  )
}

function Detail({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-sm text-white/80 font-medium">{value}</span>
    </div>
  )
}
