'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Activity, Brain, Target, Zap, TrendingUp, ArrowLeft, Sparkles } from 'lucide-react'
import { Users, SlidersHorizontal } from 'lucide-react'
import ChurnRadar from '@/components/ChurnRadar'
import SmartSegments from '@/components/SmartSegments'
import CampaignWriter from '@/components/CampaignWriter'
import ImpactPredictor from '@/components/ImpactPredictor'
import StatsOverview from '@/components/StatsOverview'
import SubscriberView from '@/components/SubscriberView'
import WhatIfSimulator from '@/components/WhatIfSimulator'
import ModelEvaluation from '@/components/ModelEvaluation'
import PersonaArchitect from '@/components/PersonaArchitect'
import LaunchCopilot from '@/components/LaunchCopilot'
import { ClipboardCheck, UserCircle, Rocket } from 'lucide-react'

type TabKey = 'churn' | 'subscribers' | 'segments' | 'campaign' | 'impact' | 'whatif' | 'evaluation' | 'persona' | 'launch'

const TABS: { key: TabKey; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'churn', label: 'Churn Radar', icon: <Brain className="w-3.5 h-3.5" />, desc: 'ML-powered risk prediction' },
  { key: 'subscribers', label: 'Subscribers', icon: <Users className="w-3.5 h-3.5" />, desc: 'Individual retention workflow' },
  { key: 'segments', label: 'Segments', icon: <Target className="w-3.5 h-3.5" />, desc: 'Natural language queries' },
  { key: 'campaign', label: 'Campaigns', icon: <Zap className="w-3.5 h-3.5" />, desc: 'Multi-channel content' },
  { key: 'impact', label: 'Impact', icon: <TrendingUp className="w-3.5 h-3.5" />, desc: 'Revenue forecasting' },
  { key: 'whatif', label: 'What-If', icon: <SlidersHorizontal className="w-3.5 h-3.5" />, desc: 'Model interpretability' },
  { key: 'persona', label: 'Persona', icon: <UserCircle className="w-3.5 h-3.5" />, desc: 'ICP generator' },
  { key: 'launch', label: 'Launch', icon: <Rocket className="w-3.5 h-3.5" />, desc: 'GTM copilot' },
  { key: 'evaluation', label: 'Evaluation', icon: <ClipboardCheck className="w-3.5 h-3.5" />, desc: 'Metrics & Go/No-Go' },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('churn')

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-brand-400 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-gray-900 font-medium tracking-tight">TelcoPulse</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>Demo mode · 10,000 subscribers loaded</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-medium text-brand-400 tracking-wider uppercase">Live dashboard</span>
          </div>
          <h1 className="text-3xl font-medium text-gray-900 tracking-tight mb-1">Marketing intelligence</h1>
          <p className="text-gray-500 text-sm">Real-time AI insights across your subscriber base</p>
        </div>

        <StatsOverview />

        {/* Tabs */}
        <div className="mt-10 mb-6 border-b border-gray-200">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-3 py-3 text-xs font-medium transition flex items-center gap-1.5 group ${
                  activeTab === tab.key
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab description + content */}
        <div className="animate-fade-in" key={activeTab}>
          <p className="text-xs text-gray-600 mb-5">
            {activeTab === 'churn' && 'Overview of churn risk distribution across the subscriber base. XGBoost model scores 10,000 subscribers and surfaces the highest-risk accounts for immediate action.'}
            {activeTab === 'subscribers' && 'Individual subscriber retention workflow. Search, review AI predictions, approve or override risk levels, send personalized email or voice call, and record outcomes for model retraining.'}
            {activeTab === 'segments' && 'Create customer segments using natural language. The system converts your query into SQL filters, identifies matching subscribers, and suggests targeted campaign strategies.'}
            {activeTab === 'campaign' && 'Generate multi-channel retention campaigns with AI. Create personalized SMS, email, push notification, and WhatsApp messages with tone and goal customization.'}
            {activeTab === 'impact' && 'Forecast campaign performance before launch. Predict reach, conversion rate, and revenue impact using telecom industry benchmarks from Southeast Asia.'}
            {activeTab === 'whatif' && 'Explore model interpretability by adjusting subscriber features and watching churn predictions change in real time. Understand which factors drive risk up or down.'}
            {activeTab === 'evaluation' && 'Comprehensive model evaluation: performance metrics, baseline comparison, Go/No-Go assessment, business impact estimation, edge cases, technology stack, and AI factory architecture.'}
            {activeTab === 'persona' && 'Generate a detailed Ideal Customer Profile (ICP) for any product and industry. Includes pain points, goals, preferred channels, and full customer lifecycle journey.'}
            {activeTab === 'launch' && 'Generate a complete go-to-market launch plan. Includes positioning, tagline, messaging pillars, phased timeline, and channel strategy with budget allocation.'}
          </p>
          {activeTab === 'churn' && <ChurnRadar />}
          {activeTab === 'subscribers' && <SubscriberView />}
          {activeTab === 'segments' && <SmartSegments />}
          {activeTab === 'campaign' && <CampaignWriter />}
          {activeTab === 'impact' && <ImpactPredictor />}
          {activeTab === 'whatif' && <WhatIfSimulator />}
          {activeTab === 'evaluation' && <ModelEvaluation />}
          {activeTab === 'persona' && <PersonaArchitect />}
          {activeTab === 'launch' && <LaunchCopilot />}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-gray-600">
          <div>Powered by Claude Sonnet 4 · XGBoost · Next.js 14</div>
          <div>Synthetic data — no real subscriber info</div>
        </div>
      </footer>
    </div>
  )
}
