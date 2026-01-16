'use client'

import { useEffect, useRef } from 'react'

export default function AdBanner() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Prevent double injection
        if (containerRef.current && containerRef.current.childElementCount > 0) return

        if (containerRef.current) {
            const script = document.createElement('script')
            script.src = "https://pl18543731.effectivegatecpm.com/c371e91e2986679b4f62760dc23a0547/invoke.js"
            script.async = true
            script.setAttribute('data-cfasync', 'false')

            containerRef.current.appendChild(script)
        }
    }, [])

    return (
        <div className="w-full flex justify-center items-center py-4 bg-black overflow-hidden">
            {/* The script looks for this specific ID */}
            <div id="container-c371e91e2986679b4f62760dc23a0547" ref={containerRef}></div>
        </div>
    )
}
