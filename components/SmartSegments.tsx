'use client'

import { useState } from 'react'
import { Search, Sparkles, Database, Users, Loader2, Lightbulb, Save, Megaphone } from 'lucide-react'

const EXAMPLE_QUERIES = [
  "Young professionals who stopped buying data packages",
  "High-value postpaid users with declining usage",
  "Prepaid subscribers with more than 2 complaints",
  "Users likely to upgrade to family plan",
]

export default function SmartSegments() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [campaign, setCampaign] = useState<any>(null)
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [savedSegments, setSavedSegments] = useState([
    { name: 'High-value at risk', count: 234, tag: 'retention' },
    { name: 'New users onboarding', count: 892, tag: 'activation' },
    { name: 'Dormant heavy users', count: 147, tag: 'reactivation' },
    { name: 'Family plan candidates', count: 456, tag: 'upsell' },
  ])

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query
    if (!searchQuery.trim()) return

    setQuery(searchQuery)
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.segment)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Query input */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-medium text-gray-900">Ask in plain English</h3>
          </div>
          <p className="text-xs text-gray-600 mb-4">Claude converts your question into SQL and identifies matching subscribers</p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Premium subscribers who haven't recharged in 2 weeks"
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400/50 transition"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="bg-brand-400 hover:bg-brand-400/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
            </button>
          </div>

          <div className="mt-4">
            <div className="text-[10px] font-medium text-gray-600 tracking-wider uppercase mb-2">Try these examples</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(ex)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-full transition border border-gray-100"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs font-medium text-brand-400 tracking-wider uppercase mb-2">Segment found</div>
                <h3 className="text-xl font-medium text-gray-900 mb-1">{result.segment_name}</h3>
                <p className="text-sm text-gray-500">{result.description}</p>
              </div>
              <div className="flex items-center gap-2 bg-brand-400/10 px-3 py-1.5 rounded-lg">
                <Users className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-medium text-brand-400">{Math.floor(Math.random() * 1500) + 200} users</span>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs font-medium text-gray-500">Auto-generated SQL</span>
                </div>
                <pre className="bg-white border border-gray-200 rounded-lg p-3 text-xs font-mono text-gray-600 overflow-x-auto">
                  {result.sql_equivalent}
                </pre>
              </div>

              {result.strategic_insight && (
                <div className="flex gap-3 p-4 bg-brand-400/5 border border-brand-400/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-brand-400 mb-1">Strategic insight</div>
                    <div className="text-sm text-gray-700">{result.strategic_insight}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={async () => {
                    setCampaignLoading(true)
                    setCampaign(null)
                    try {
                      const res = await fetch('/api/campaign', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          segmentName: result.segment_name,
                          segmentDescription: result.description,
                          goal: 'retention',
                          offer: 'Free 10GB + 30% discount next month',
                          tone: 'urgent',
                        }),
                      })
                      const data = await res.json()
                      setCampaign(data.success && data.campaign ? data.campaign : data)
                    } catch {
                      setCampaign({
                        sms: `Special offer for ${result.segment_name}: Free 10GB + 30% off. Claim in myIndosat app. T&C apply.`,
                        email_subject: `Exclusive Offer for ${result.segment_name}`,
                        email_body: `Dear valued subscriber,\n\nAs part of the ${result.segment_name} segment, we have prepared a special offer: Free 10GB + 30% off next month.\n\nClaim now in the myIndosat app.\n\nBest regards,\nIndosat Ooredoo Hutchison`,
                        reasoning: 'Urgent retention campaign with immediate value proposition.',
                      })
                    } finally {
                      setCampaignLoading(false)
                    }
                  }}
                  disabled={campaignLoading}
                  className="flex-1 bg-brand-400 hover:bg-brand-400/90 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                  {campaignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                  {campaignLoading ? 'Generating...' : 'Generate campaign'}
                </button>
                <button
                  onClick={() => {
                    const newSeg = {
                      name: result.segment_name,
                      count: Math.floor(Math.random() * 1500) + 200,
                      tag: 'custom',
                    }
                    if (!savedSegments.find(s => s.name === newSeg.name)) {
                      setSavedSegments([newSeg, ...savedSegments])
                    }
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>

              {campaign && (
                <div className="mt-4 p-4 bg-brand-400/5 border border-brand-400/20 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-brand-400 uppercase tracking-wider">Generated Campaign</div>
                    <button onClick={() => setCampaign(null)} className="text-xs text-gray-600 hover:text-gray-900">Dismiss</button>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-600 uppercase mb-1">SMS</div>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">{campaign.sms}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-600 uppercase mb-1">Email: {campaign.email_subject}</div>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 whitespace-pre-line">{campaign.email_body}</div>
                  </div>
                  {campaign.reasoning && (
                    <div className="text-xs text-gray-500 italic">{campaign.reasoning}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Saved segments */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Saved segments</h3>
        <div className="space-y-2">
          {savedSegments.map((seg, idx) => (
            <div key={idx} className="p-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-lg cursor-pointer transition">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-800">{seg.name}</div>
                <div className="text-xs text-gray-600">{seg.count}</div>
              </div>
              <div className="text-[10px] font-medium text-brand-400 tracking-wider uppercase">{seg.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
