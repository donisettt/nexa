import React from 'react';
import { Sparkles, MessageCircle, Heart } from 'lucide-react';

function HeroIllustration() {
    return (
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center sm:h-56 sm:w-56">
            {/* Background blobs */}
            <div className="absolute inset-0 rounded-full bg-white/10" />
            <div className="absolute inset-4 rounded-full bg-white/20" />
            
            {/* Center Chat Bubble */}
            <div className="relative z-10 flex h-12 w-14 items-center justify-center rounded-2xl rounded-br-sm bg-white shadow-xl sm:h-24 sm:w-28">
                <MessageCircle size={24} className="text-[#6366f2] sm:w-9 sm:h-9" />
            </div>

            {/* Floating avatars/icons */}
            <div className="absolute -left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ffb067] text-white shadow-lg shadow-[#ffb067]/30 sm:top-8 sm:h-12 sm:w-12">
                <Sparkles size={12} className="sm:w-5 sm:h-5" />
            </div>
            
            <div className="absolute bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#fca5a5] text-white shadow-lg shadow-[#fca5a5]/30 sm:bottom-6 sm:h-14 sm:w-14">
                <Heart size={14} className="sm:w-6 sm:h-6" />
            </div>

            {/* Floating dots */}
            <div className="absolute left-8 top-4 h-3 w-3 rounded-full bg-[#86efac]" />
            <div className="absolute bottom-12 left-4 h-2 w-2 rounded-full bg-white" />
            <div className="absolute right-8 top-12 h-2.5 w-2.5 rounded-full bg-[#fcd34d]" />
        </div>
    );
}

export default function DashboardHero({ firstName }) {
    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6366f2] to-[#4f46e5] text-white shadow-lg">
            <div className="flex flex-row items-center justify-between gap-4 px-5 py-6 sm:gap-8 sm:px-10 sm:py-12">
                <div className="flex-1 text-left">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        <Sparkles size={14} /> Welcome to Nexa
                    </span>
                    <h1 className="mt-3 sm:mt-6 text-xl font-black leading-tight sm:text-3xl lg:text-4xl">
                        Halo, {firstName}!
                    </h1>
                    <p className="mt-2 sm:mt-4 max-w-lg text-xs leading-relaxed text-[#e0e7ff] sm:text-base">
                        Mulai hari barumu dengan menemukan koneksi tak terduga. Ngobrol bebas, aman, dan tanpa tekanan secara anonim sekarang juga.
                    </p>
                </div>
                
                <div className="shrink-0">
                    <HeroIllustration />
                </div>
            </div>
            
            {/* Decorative background shapes */}
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        </section>
    );
}
