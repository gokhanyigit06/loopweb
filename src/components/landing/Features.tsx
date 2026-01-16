'use client'

import { motion } from 'framer-motion'
import { Sparkles, Shield, MessageCircle, Heart } from 'lucide-react'

const features = [
    {
        icon: Sparkles,
        title: "Smart Matching",
        description: "Our AI-driven algorithm finds people who truly match your personality and interests."
    },
    {
        icon: Shield,
        title: "Verified Profiles",
        description: "Safety first. We ensure every profile is verified so you can match with confidence."
    },
    {
        icon: MessageCircle,
        title: "Instant Chat",
        description: "Break the ice immediately with our smooth, real-time messaging platform."
    },
    {
        icon: Heart,
        title: "Meaningful Connections",
        description: "Designed for those looking for real relationships, not just another swipe."
    }
]

export function Features() {
    return (
        <section id="features" className="py-24 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose LoopWeb?</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Experience a better way to date online with our premium features designed for success.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-secondary/50 border border-white/5 hover:bg-secondary/80 transition-colors"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
