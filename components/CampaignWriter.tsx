'use client'

import { useState } from 'react'
import { Zap, MessageSquare, Mail, Bell, Phone, Loader2, Copy, Check, Sparkles } from 'lucide-react'

const CHANNELS = [
  { key: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4" />, limit: 160 },
  { key: 'push_body', label: 'Push', icon: <Bell className="w-4 h-4" />, limit: 80 },
  { key: 'email_subject', label: 'Email subject', icon: <Mail className="w-4 h-4" />, limit: 60 },
  { key: 'whatsapp', label: 'WhatsApp', icon: <Phone className="w-4 h-4" />, limit: 200 },
]

const GOALS = [
  { key: 'retention', label: 'Retention', color: 'bg-brand-400/10 text-brand-200' },
  { key: 'acquisition', label: 'Acquisition', color: 'bg-green-400/10 text-green-400' },
  { key: 'upsell', label: 'Upsell', color: 'bg-blue-400/10 text-blue-400' },
  { key: 'reactivation', label: 'Reactivation', color: 'bg-amber-400/10 text-amber-400' },
]

const TONES = ['friendly', 'urgent', 'premium', 'casual']

export default function CampaignWriter() {
  const [segmentName, setSegmentName] = useState('High-value at risk postpaid users')
  const [segmentDescription, setSegmentDescription] = useState('Postpaid customers with $40+ monthly spend who showed declining data usage in the last 30 days')
  const [goal, setGoal] = useState('retention')
  const [offer, setOffer] = useState('3 months at 50% off + free 50GB data boost')
  const [tone, setTone] = useState('friendly')
  const [loading, setLoading] = useState(false)
  const [campaign, setCampaign] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setCampaign(null)
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentName, segmentDescription, goal, offer, tone }),
      })
      const data = await res.json()
      if (data.success) setCampaign(data.campaign)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Campaign config */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-medium text-white">Campaign brief</h3>
          </div>

          <div className="space-y-4">
            <Field label="Target segment">
              <input
                type="text"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                className="w-full bg-ink-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-400/50"
              />
            </Field>

            <Field label="Segment description">
              <textarea
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
                rows={2}
                className="w-full bg-ink-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-400/50 resize-none"
              />
            </Field>

            <Field label="Goal">
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                      goal === g.key 
                        ? `${g.color} border border-current/30` 
                        : 'bg-white/5 text-white/40 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Offer or message">
              <input
                type="text"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="w-full bg-ink-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-400/50"
              />
            </Field>

            <Field label="Tone">
              <div className="flex gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition capitalize ${
                      tone === t 
                        ? 'bg-brand-400 text-white' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full glow-brand bg-white text-black hover:bg-white/90 disabled:opacity-50 px-4 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating with Claude...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate multi-channel campaign</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Generated content */}
      <div className="lg:col-span-3 space-y-3">
        {!campaign && !loading && (
          <div className="bg-ink-800/30 border border-white/[0.06] border-dashed rounded-xl p-12 text-center">
            <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <div className="text-white/40 text-sm mb-1">No campaign generated yet</div>
            <div className="text-white/30 text-xs">Configure your campaign on the left and click Generate</div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5 animate-pulse">
                <div className="h-3 w-24 bg-white/5 rounded mb-3" />
                <div className="h-4 w-full bg-white/5 rounded mb-2" />
                <div className="h-4 w-3/4 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )}

        {campaign && (
          <>
            {campaign.reasoning && (
              <div className="bg-brand-400/5 border border-brand-400/20 rounded-xl p-4 flex gap-3 animate-slide-up">
                <Sparkles className="w-4 h-4 text-brand-200 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-brand-200 mb-1">Claude's strategy</div>
                  <div className="text-sm text-white/80">{campaign.reasoning}</div>
                </div>
              </div>
            )}

            {CHANNELS.map((channel, idx) => {
              const content = campaign[channel.key] || ''
              const charCount = content.length
              const overLimit = charCount > channel.limit
              return (
                <div key={channel.key} className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5 animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-400/10 flex items-center justify-center text-brand-200">
                        {channel.icon}
                      </div>
                      <span className="text-sm font-medium text-white">{channel.label}</span>
                      <span className={`text-xs ${overLimit ? 'text-red-400' : 'text-white/40'}`}>
                        {charCount}/{channel.limit} chars
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(channel.key, content)}
                      className="text-xs text-white/40 hover:text-white transition flex items-center gap-1"
                    >
                      {copied === channel.key ? (
                        <><Check className="w-3 h-3 text-green-400" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-white/80 leading-relaxed">
                    {content}
                  </div>
                </div>
              )
            })}

            {campaign.email_body && (
              <div className="bg-ink-800/30 border border-white/[0.06] rounded-xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-400/10 flex items-center justify-center text-brand-200">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white">Email body</span>
                  </div>
                  <button
                    onClick={() => handleCopy('email_body', campaign.email_body)}
                    className="text-xs text-white/40 hover:text-white transition flex items-center gap-1"
                  >
                    {copied === 'email_body' ? <><Check className="w-3 h-3 text-green-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {campaign.email_body}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-medium text-white/40 tracking-wider uppercase mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}
