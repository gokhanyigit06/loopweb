'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Heart className="w-8 h-8 text-primary fill-primary" />
                    <span className="text-xl font-bold tracking-tight text-white">LoopWeb</span>
                </Link>

                <div className="hidden md:flex items-center space-x-8">
                    <Link href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href="#stories" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                        Stories
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                        Pricing
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-white hover:text-primary transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.nav>
    )
}
