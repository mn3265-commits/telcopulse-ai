import Link from 'next/link'
import { ArrowRight, Activity, Zap, Target, Brain, TrendingUp, Users, Sparkles, SlidersHorizontal, UserCheck, ClipboardCheck, UserCircle, Rocket } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-gray-900 font-medium tracking-tight">TelcoPulse</span>
            <span className="text-xs text-gray-600 px-2 py-0.5 border border-gray-200 rounded-full">v1.0</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition">Features</Link>
            <Link href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition">How it works</Link>
            <Link href="https://github.com/mn3265-commits/telcopulse-ai" className="text-sm text-gray-500 hover:text-gray-900 transition">GitHub</Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white bg-brand-400 hover:bg-brand-400/90 px-4 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              Launch app
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-400/10 border border-brand-400/20 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-3 h-3 text-brand-400" />
            <span className="text-xs text-brand-400 font-medium tracking-wide">AI-POWERED MARKETING INTELLIGENCE FOR TELECOM</span>
          </div>

          <h1 className="text-6xl font-medium text-gray-900 tracking-tight leading-[1.05] mb-6 animate-slide-up">
            AI that understands<br />your subscribers.
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Predict churn, segment customers in plain English, generate multi-channel campaigns,
            and forecast impact — all powered by Claude and real telecom patterns from Southeast Asia.
          </p>

          <div className="flex items-center justify-center gap-3 mb-16 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link
              href="/dashboard"
              className="glow-brand bg-brand-400 text-white hover:bg-brand-400/90 px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              Launch dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="border border-gray-200 text-gray-900 hover:bg-gray-100 px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              How it works
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div>
              <div className="text-3xl font-medium text-gray-900">10K</div>
              <div className="text-xs text-gray-600 mt-1">Synthetic subscribers</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <div className="text-3xl font-medium text-gray-900">XGBoost</div>
              <div className="text-xs text-gray-600 mt-1">ML churn model</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div>
              <div className="text-3xl font-medium text-gray-900">9-in-1</div>
              <div className="text-xs text-gray-600 mt-1">AI modules</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-medium text-brand-400 tracking-wider uppercase mb-3">Nine intelligent modules</div>
            <h2 className="text-4xl font-medium text-gray-900 tracking-tight">
              One platform. Every growth lever.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
            <FeatureCard
              icon={<Brain className="w-5 h-5" />}
              title="Churn Radar"
              tag="ML-POWERED"
              description="XGBoost model trained on 18 behavioral features. Identifies high-risk subscribers before they leave, with explanations of why each one might churn."
            />
            <FeatureCard
              icon={<UserCheck className="w-5 h-5" />}
              title="Subscriber Workflow"
              tag="HUMAN-IN-THE-LOOP"
              description="Individual subscriber retention workflow with 4-step tracker: AI Scored, Reviewed, Contacted, Outcome. Approve, escalate, or override AI predictions."
            />
            <FeatureCard
              icon={<Target className="w-5 h-5" />}
              title="Smart Segments"
              tag="NATURAL LANGUAGE"
              description="Type 'high-value postpaid with declining usage' and get instant SQL filters, subscriber counts, and strategic recommendations."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Campaign Writer"
              tag="MULTI-CHANNEL"
              description="Generate on-brand SMS, push notifications, email, and WhatsApp messages in one click. Tone-adjustable, compliance-aware."
            />
            <FeatureCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Impact Predictor"
              tag="FORECASTING"
              description="Before you hit send, estimate reach, conversion rate, and revenue impact based on telecom industry benchmarks and your segment data."
            />
            <FeatureCard
              icon={<SlidersHorizontal className="w-5 h-5" />}
              title="What-If Simulator"
              tag="INTERPRETABILITY"
              description="Adjust subscriber features with interactive sliders and watch churn predictions change in real time. Understand which factors drive risk up or down."
            />
            <FeatureCard
              icon={<ClipboardCheck className="w-5 h-5" />}
              title="Model Evaluation"
              tag="GO / NO-GO"
              description="Full evaluation suite: performance metrics, baseline comparison, Go/No-Go assessment, business impact estimation, edge case analysis, and AI factory architecture."
            />
            <FeatureCard
              icon={<UserCircle className="w-5 h-5" />}
              title="Persona Architect"
              tag="ICP GENERATOR"
              description="Type a product and industry to generate a complete Ideal Customer Profile with pain points, goals, preferred channels, and customer lifecycle journey."
            />
            <FeatureCard
              icon={<Rocket className="w-5 h-5" />}
              title="Launch Copilot"
              tag="GTM STRATEGY"
              description="Generate positioning, tagline, messaging pillars, a phased launch plan, and channel strategy with budget allocation for any product and audience."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 px-6 py-20 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-medium text-brand-400 tracking-wider uppercase mb-3">The stack</div>
            <h2 className="text-4xl font-medium text-gray-900 tracking-tight mb-4">
              Production-grade architecture.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Not a demo. A real application with trained ML, typed APIs, and streaming AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StackCard num="01" title="Next.js 14" subtitle="Server components · Streaming UI" />
            <StackCard num="02" title="Claude API" subtitle="Multi-step AI reasoning" />
            <StackCard num="03" title="XGBoost" subtitle="Trained churn classifier" />
            <StackCard num="04" title="Vercel" subtitle="Edge deployment" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <Users className="w-12 h-12 text-brand-400 mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="text-4xl font-medium text-gray-900 tracking-tight mb-4">
            Designed from real operator challenges.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            TelcoPulse addresses the gap between churn prediction and retention execution in
            Indonesian telecom. The AI pipeline was designed around actual CRM workflows at operators
            like Indosat Ooredoo Hutchison, where reactive retention processes leave millions of
            at-risk subscribers unaddressed each month.
          </p>
          <Link
            href="/dashboard"
            className="glow-brand inline-flex items-center gap-2 bg-brand-400 text-white hover:bg-brand-400/90 px-6 py-3 rounded-lg text-sm font-medium transition"
          >
            Try the live demo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div>Built by <Link href="https://linkedin.com/in/mohagungnugroho" className="text-gray-500 hover:text-gray-900 transition">Agung Nugroho</Link> · Columbia University SPS</div>
          <div className="flex gap-6">
            <Link href="https://github.com/mn3265-commits/telcopulse-ai" className="hover:text-gray-900 transition">GitHub</Link>
            <Link href="https://linkedin.com/in/mohagungnugroho" className="hover:text-gray-900 transition">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, tag, description }: { icon: React.ReactNode, title: string, tag: string, description: string }) {
  return (
    <div className="bg-white p-8 hover:bg-gray-50 transition group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-brand-400/10 text-brand-400 flex items-center justify-center group-hover:bg-brand-400/20 transition">
          {icon}
        </div>
        <div className="text-[10px] font-medium text-brand-400 tracking-wider uppercase px-2 py-0.5 bg-brand-400/10 rounded">{tag}</div>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function StackCard({ num, title, subtitle }: { num: string, title: string, subtitle: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:border-brand-400/30 transition">
      <div className="text-xs font-mono text-gray-600 mb-3">{num}</div>
      <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </div>
  )
}
