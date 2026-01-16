import { CardStack } from '@/components/discover/CardStack'
import { Filter, Bell } from 'lucide-react'

export default function DiscoverPage() {
    return (
        <div className="min-h-screen pb-32 pt-6">
            <header className="px-6 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">L</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Discover</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="px-6">
                <CardStack />
            </main>
        </div>
    )
}
