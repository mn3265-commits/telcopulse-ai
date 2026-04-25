'use client'

import { useState } from 'react'
import { Search, Sparkles, Database, Users, Loader2, Lightbulb } from 'lucide-react'

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
        <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-medium text-white">Ask in plain English</h3>
          </div>
          <p className="text-xs text-white/40 mb-4">Claude converts your question into SQL and identifies matching subscribers</p>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Premium subscribers who haven't recharged in 2 weeks"
                className="w-full bg-ink-900/80 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-400/50 transition"
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
            <div className="text-[10px] font-medium text-white/30 tracking-wider uppercase mb-2">Try these examples</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(ex)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition border border-white/5"
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
          <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs font-medium text-brand-200 tracking-wider uppercase mb-2">Segment found</div>
                <h3 className="text-xl font-medium text-white mb-1">{result.segment_name}</h3>
                <p className="text-sm text-white/60">{result.description}</p>
              </div>
              <div className="flex items-center gap-2 bg-brand-400/10 px-3 py-1.5 rounded-lg">
                <Users className="w-4 h-4 text-brand-200" />
                <span className="text-sm font-medium text-brand-200">{Math.floor(Math.random() * 1500) + 200} users</span>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-xs font-medium text-white/60">Auto-generated SQL</span>
                </div>
                <pre className="bg-ink-900 border border-white/[0.06] rounded-lg p-3 text-xs font-mono text-white/70 overflow-x-auto">
                  {result.sql_equivalent}
                </pre>
              </div>

              {result.strategic_insight && (
                <div className="flex gap-3 p-4 bg-brand-400/5 border border-brand-400/20 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-brand-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-brand-200 mb-1">Strategic insight</div>
                    <div className="text-sm text-white/80">{result.strategic_insight}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-brand-400 hover:bg-brand-400/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
                  Generate campaign for this segment
                </button>
                <button className="bg-white/5 hover:bg-white/10 text-white/70 px-4 py-2.5 rounded-lg text-sm font-medium transition">
                  Save segment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Saved segments */}
      <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-4">Saved segments</h3>
        <div className="space-y-2">
          {[
            { name: 'High-value at risk', count: 234, tag: 'retention' },
            { name: 'New users onboarding', count: 892, tag: 'activation' },
            { name: 'Dormant heavy users', count: 147, tag: 'reactivation' },
            { name: 'Family plan candidates', count: 456, tag: 'upsell' },
          ].map((seg, idx) => (
            <div key={idx} className="p-3 bg-ink-900/50 hover:bg-ink-900 border border-white/[0.04] hover:border-white/10 rounded-lg cursor-pointer transition">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-white/90">{seg.name}</div>
                <div className="text-xs text-white/40">{seg.count}</div>
              </div>
              <div className="text-[10px] font-medium text-brand-200 tracking-wider uppercase">{seg.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
