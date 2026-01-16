'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Search, MessageSquare, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { icon: Search, label: 'Discover', href: '/discover' },
    { icon: Sparkles, label: 'Matches', href: '/matches' },
    { icon: MessageSquare, label: 'Chat', href: '/chat' },
    { icon: User, label: 'Profile', href: '/profile' },
]

export function BottomNav() {
    const pathname = usePathname()

    // Only show bottom nav on app pages
    const isAppPage = ['/discover', '/matches', '/chat', '/profile'].some(path => pathname.startsWith(path))

    if (!isAppPage) return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 pb-6 pt-3 h-20 flex items-center justify-between pointer-events-auto">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 transition-all duration-300",
                            isActive ? "text-primary scale-110" : "text-white/40 hover:text-white/70"
                        )}
                    >
                        <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
                        <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                        {isActive && (
                            <span className="w-1 h-1 bg-primary rounded-full mt-0.5" />
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
