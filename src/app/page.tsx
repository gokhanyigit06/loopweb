import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
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
