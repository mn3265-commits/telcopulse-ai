import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'TelcoPulse AI — Marketing intelligence for subscription businesses',
  description: 'AI-powered churn prediction, segmentation, and campaign generation for telecom operators. Built on real patterns from 100M+ subscribers.',
  keywords: ['telecom', 'AI', 'marketing', 'churn prediction', 'CVM', 'customer lifecycle'],
  authors: [{ name: 'Mohammad Agung Nugroho' }],
  openGraph: {
    title: 'TelcoPulse AI',
    description: 'AI-powered marketing intelligence for subscription businesses',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-white text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
