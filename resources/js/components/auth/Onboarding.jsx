import React, { useState } from 'react';
import { Search, ShieldCheck, MessageSquareMore, Sparkles, User, Lock, Users } from 'lucide-react';

/* ─── SVG Illustrations ─────────────────────────────────────── */

function Slide1Svg() {
    return (
        <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-40 w-32 rounded-2xl bg-[#e0e7ff] shadow-sm">
                    <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-white p-3">
                        <User size={32} className="text-[#c7d2fe]" />
                    </div>
                    <div className="absolute bottom-10 left-6 h-2 w-12 rounded-full bg-white opacity-60" />
                    <div className="absolute bottom-6 left-6 h-2 w-20 rounded-full bg-white opacity-60" />
                </div>
            </div>
            {/* Magnifying Glass floating */}
            <div className="absolute bottom-10 right-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#6366f2] text-white shadow-lg shadow-[#6366f2]/30">
                <Search size={32} />
            </div>
            <SparkleIcons />
        </div>
    );
}

function Slide2Svg() {
    return (
        <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
            <div className="relative flex h-40 w-36 items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full text-[#c7d2fe]">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pb-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6366f2] text-white shadow-lg shadow-[#6366f2]/20">
                        <Lock size={28} />
                    </div>
                </div>
            </div>
            {/* Eye mask floating */}
            <div className="absolute left-8 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#e0e7ff] text-[#6366f2]">
                <ShieldCheck size={20} />
            </div>
            <SparkleIcons />
        </div>
    );
}

function Slide3Svg() {
    return (
        <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
            {/* Top bubble */}
            <div className="absolute right-12 top-16 flex h-24 w-32 flex-col justify-center rounded-3xl rounded-br-sm bg-[#6366f2] p-4 text-white shadow-lg shadow-[#6366f2]/20">
                <div className="flex gap-1.5 justify-center">
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                    <span className="h-2 w-2 rounded-full bg-white" />
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                </div>
            </div>
            {/* Bottom bubble */}
            <div className="absolute bottom-16 left-12 flex h-20 w-28 flex-col justify-center rounded-3xl rounded-bl-sm bg-[#e0e7ff] p-4 shadow-sm">
                <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-white" />
                    <div className="h-2 w-2/3 rounded-full bg-white" />
                </div>
            </div>
            <SparkleIcons />
        </div>
    );
}

function Slide4Svg() {
    return (
        <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
            <div className="absolute top-12 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#6366f2] text-white shadow-lg shadow-[#6366f2]/20">
                <Sparkles size={40} className="animate-pulse" />
            </div>
            <div className="absolute bottom-12 flex items-end gap-2">
                <div className="flex h-24 w-20 flex-col items-center justify-end rounded-t-full bg-[#c7d2fe]">
                    <div className="mb-4 rounded-full bg-white p-2 text-[#6366f2]">
                        <User size={24} />
                    </div>
                </div>
                <div className="flex h-28 w-20 flex-col items-center justify-end rounded-t-full bg-[#e0e7ff]">
                    <div className="mb-6 rounded-full bg-white p-2 text-[#6366f2]">
                        <User size={24} />
                    </div>
                </div>
            </div>
            <SparkleIcons />
        </div>
    );
}

function SparkleIcons() {
    return (
        <>
            <Sparkles size={16} className="absolute right-10 top-10 text-[#c7d2fe] opacity-60" />
            <Sparkles size={12} className="absolute left-10 top-20 text-[#c7d2fe] opacity-40" />
            <Sparkles size={14} className="absolute bottom-16 right-4 text-[#c7d2fe] opacity-50" />
            <Sparkles size={20} className="absolute bottom-20 left-4 text-[#e0e7ff] opacity-80" />
        </>
    );
}


/* ─── Onboarding Component ─────────────────────────────────── */

export default function Onboarding({ initialMode, onComplete }) {
    const [step, setStep] = useState(0);

    const slides = [
        {
            title: "Temukan teman baru dengan mudah",
            description: "Mulai random matching dan temukan orang-orang baru yang siap berteman denganmu.",
            buttonText: "Selanjutnya",
            svg: <Slide1Svg />
        },
        {
            title: "Aman dan anonim",
            description: "Identitasmu tetap aman. Chat random berlangsung anonim sampai kamu memilih berteman.",
            buttonText: "Selanjutnya",
            svg: <Slide2Svg />
        },
        {
            title: "Chat & jalin koneksi",
            description: "Simpan teman yang cocok dan lanjutkan percakapan kapan saja. Perluas koneksi, perbanyak cerita.",
            buttonText: "Selanjutnya",
            svg: <Slide3Svg />
        },
        {
            title: "Siap bertemu teman baru?",
            description: "Yuk mulai petualanganmu bersama Nexa dan temukan teman baru sekarang!",
            buttonText: "Mulai Sekarang",
            svg: <Slide4Svg />
        }
    ];

    const isLastStep = step === slides.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete('register');
        } else {
            setStep((s) => s + 1);
        }
    };

    const handleSkip = () => {
        // If they skip, take them to the requested initial mode
        onComplete(initialMode);
    };

    const handleLogin = () => {
        onComplete('login');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#eef2ff] p-0 sm:p-8">
            <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-xl shadow-[#1e1033]/5 sm:h-[600px] sm:max-w-[400px] sm:rounded-3xl md:h-[500px] md:max-w-[800px] md:flex-row lg:h-[600px] lg:max-w-[1000px]">
                
                {/* Left Side (Hidden on Mobile) */}
                <div className="hidden w-1/2 flex-col bg-[#f5f7ff] md:flex">
                    <div className="relative flex-1 overflow-hidden">
                        <div 
                            className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${step * 100}%)` }}
                        >
                            {slides.map((slide, idx) => (
                                <div key={idx} className="flex h-full w-full shrink-0 items-center justify-center">
                                    <div className="scale-125 lg:scale-150">{slide.svg}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side (Content) */}
                <div className="flex h-full w-full flex-col md:w-1/2">
                    {/* Header: Logo and Skip Button */}
                    <header className="flex h-20 shrink-0 items-center justify-between px-6 md:px-10 lg:px-12">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f2] text-white">
                                <Sparkles size={16} />
                            </div>
                            <div className="leading-tight">
                                <span className="block text-sm font-black text-[#1e1033]">Nexa</span>
                                <span className="block text-[10px] font-bold text-[#9a8fb0]">ANONIM MATCHING</span>
                            </div>
                        </div>

                        {!isLastStep ? (
                            <button 
                                type="button" 
                                onClick={handleSkip}
                                className="text-sm font-bold text-[#7c6b97] transition hover:text-[#1e1033]"
                            >
                                Lewati
                            </button>
                        ) : null}
                    </header>

                    {/* Slides Container */}
                    <div className="relative flex-1 overflow-hidden">
                        <div 
                            className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${step * 100}%)` }}
                        >
                            {slides.map((slide, idx) => (
                                <div key={idx} className="flex h-full w-full shrink-0 flex-col justify-center px-8 pb-10 md:px-10 lg:px-12">
                                    {/* Only show SVG on mobile */}
                                    <div className="md:hidden">
                                        {slide.svg}
                                    </div>
                                    
                                    <div className="mt-8 text-center md:mt-0 md:text-left">
                                        <h2 className="text-2xl font-black text-[#1e1033] lg:text-3xl">{slide.title}</h2>
                                        <p className="mx-auto mt-4 text-sm leading-relaxed text-[#7c6b97] lg:text-base">
                                            {slide.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="shrink-0 px-8 pb-10 pt-4 md:px-10 lg:px-12">
                        {/* Pagination Dots */}
                        <div className="mb-8 flex justify-center gap-2 md:justify-start">
                            {slides.map((_, idx) => {
                                if (isLastStep) return null; 

                                const active = idx === step;
                                return (
                                    <span 
                                        key={idx} 
                                        className={`h-2 rounded-full transition-all duration-300 ${active ? 'w-6 bg-[#6366f2]' : 'w-2 bg-[#e0e7ff]'}`}
                                    />
                                );
                            })}
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex h-14 w-full items-center justify-center rounded-xl bg-[#6366f2] px-6 text-sm font-black text-white transition hover:bg-[#4f46e5]"
                            >
                                {slides[step].buttonText}
                            </button>

                            {isLastStep ? (
                                <p className="text-center text-sm font-semibold text-[#7c6b97] md:text-left">
                                    Sudah punya akun?{' '}
                                    <button 
                                        type="button" 
                                        onClick={handleLogin}
                                        className="font-black text-[#6366f2] hover:underline"
                                    >
                                        Masuk
                                    </button>
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
