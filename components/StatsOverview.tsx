'use client'

import { Users, AlertTriangle, DollarSign, Zap } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface Stat {
  label: string
  value: string
  change: string
  icon: React.ReactNode
  trend: 'up' | 'down' | 'neutral'
}

const STATS: Stat[] = [
  {
    label: 'Total subscribers',
    value: formatNumber(10000),
    change: '+2.3% vs last month',
    icon: <Users className="w-4 h-4" />,
    trend: 'up',
  },
  {
    label: 'At risk of churn',
    value: formatNumber(878),
    change: '8.8% of base',
    icon: <AlertTriangle className="w-4 h-4" />,
    trend: 'down',
  },
  {
    label: 'Revenue at risk',
    value: formatCurrency(8520),
    change: 'monthly MRR',
    icon: <DollarSign className="w-4 h-4" />,
    trend: 'down',
  },
  {
    label: 'Campaigns ready',
    value: '4',
    change: 'AI-generated',
    icon: <Zap className="w-4 h-4" />,
    trend: 'up',
  },
]

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STATS.map((stat, i) => (
        <div 
          key={stat.label}
          className="bg-ink-800/50 border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition animate-slide-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              stat.trend === 'up' ? 'bg-green-400/10 text-green-400' :
              stat.trend === 'down' ? 'bg-brand-400/10 text-brand-200' :
              'bg-white/5 text-white/40'
            }`}>
              {stat.icon}
            </div>
          </div>
          <div className="text-xs text-white/40 mb-1.5">{stat.label}</div>
          <div className="text-2xl font-medium text-white mb-1">{stat.value}</div>
          <div className="text-xs text-white/40">{stat.change}</div>
        </div>
      ))}
    </div>
  )
}
