import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { redirect } from 'next/navigation'

import AdBanner from '@/components/ads/AdBanner'

export default function Home({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  // Emergency catch: If Supabase redirects here with a code, forward to callback
  if (searchParams.code) {
    redirect(`/auth/callback?code=${searchParams.code}`)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AdBanner />
      <Hero />
      <Features />

      <footer className="py-12 border-t border-white/10 bg-black/40">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} LoopWeb. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
