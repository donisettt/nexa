import React from 'react';
import { Sparkles, MessageCircle, Phone, Search, Users, Shield, ArrowRight, UserCircle2, Mic, Lock } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
    return (
        <div className="min-h-screen bg-[#05050a] text-[#f8faff] selection:bg-[#6366f2] selection:text-white font-sans">
            {/* Ambient Background Glows - Wrapped in overflow-hidden to prevent horizontal scroll */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#6366f2]/20 blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/20 blur-[120px]" />
            </div>

            {/* Navigation (Glassmorphism) */}
            <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-md bg-[#05050a]/80 border-b border-white/[0.05]">
                <div className="mx-auto max-w-7xl flex w-full items-center justify-between px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6366f2] to-[#818cf8] text-white shadow-lg shadow-[#6366f2]/20">
                            <Sparkles size={18} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Nexa.</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => onNavigate('/login')}
                            className="hidden text-sm font-semibold text-[#9a8fb0] transition hover:text-white sm:block"
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => onNavigate('/register')}
                            className="relative group overflow-hidden rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#05050a] transition-all hover:scale-105"
                        >
                            <span className="relative z-10">Mulai Sekarang</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#e0e7ff] to-[#c7d2fe] opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section - 2 Panel SaaS Layout */}
                <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                            
                            {/* Left Panel: Text & CTA */}
                            <div className="flex flex-col items-start text-left z-10">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5 text-xs font-semibold text-[#a5b4fc] backdrop-blur-sm">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a5b4fc] opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a5b4fc]"></span>
                                    </span>
                                    Ribuan user online mencari teman ngobrol
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                                    Kebebasan Bercerita,<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#818cf8] bg-300% animate-gradient">
                                        Tanpa Identitas.
                                    </span>
                                </h1>
                                
                                <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#9a8fb0] font-light">
                                    Lepaskan beban pikiranmu. Temukan orang-orang yang mau mendengar. Nexa menghubungkanmu dengan teman baru secara anonim, aman, dan instan.
                                </p>

                                <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button 
                                        onClick={() => onNavigate('/register')}
                                        className="group flex items-center justify-center gap-2 rounded-xl bg-[#6366f2] px-8 py-4 text-sm font-bold text-white shadow-[0_0_30px_-10px_rgba(99,102,242,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(99,102,242,0.7)]"
                                    >
                                        Coba Nexa Gratis
                                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </button>
                                    <button 
                                        onClick={() => onNavigate('/login')}
                                        className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/[0.08]"
                                    >
                                        Sudah punya akun?
                                    </button>
                                </div>
                                
                                <div className="mt-10 flex items-center gap-4 text-sm font-medium text-[#9a8fb0]">
                                    <div className="flex -space-x-3">
                                        <div className="h-8 w-8 rounded-full border-2 border-[#05050a] bg-[#1e1e2d] flex items-center justify-center"><UserCircle2 size={16} className="text-[#a5b4fc]"/></div>
                                        <div className="h-8 w-8 rounded-full border-2 border-[#05050a] bg-[#1e1e2d] flex items-center justify-center"><UserCircle2 size={16} className="text-[#fbcfe8]"/></div>
                                        <div className="h-8 w-8 rounded-full border-2 border-[#05050a] bg-[#1e1e2d] flex items-center justify-center"><UserCircle2 size={16} className="text-[#a7f3d0]"/></div>
                                    </div>
                                    <span>Dipercaya oleh 10,000+ pengguna</span>
                                </div>
                            </div>

                            {/* Right Panel: SaaS Mockup */}
                            <div className="relative w-full max-w-lg mx-auto lg:max-w-none lg:mx-0">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#6366f2]/20 to-[#a855f7]/20 blur-3xl rounded-full" />
                                
                                <div className="relative z-10 animate-float-slow w-full rounded-2xl border border-white/[0.1] bg-[#0c0c16]/80 backdrop-blur-xl p-2 shadow-2xl shadow-black/50 overflow-hidden">
                                    {/* Mockup App Header */}
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
                                        <div className="flex gap-1.5">
                                            <div className="h-3 w-3 rounded-full bg-[#ef4444]"></div>
                                            <div className="h-3 w-3 rounded-full bg-[#f59e0b]"></div>
                                            <div className="h-3 w-3 rounded-full bg-[#10b981]"></div>
                                        </div>
                                        <div className="mx-auto h-5 w-32 rounded-md bg-white/[0.05]"></div>
                                    </div>
                                    
                                    {/* Mockup Content */}
                                    <div className="p-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMykiLz48L3N2Zz4=')]">
                                        <div className="flex flex-col gap-4">
                                            {/* Matching Card inside Mockup */}
                                            <div className="w-full rounded-xl bg-[#1a1a2e] border border-white/[0.08] p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 rounded-full bg-[#6366f2]/20 animate-ping"></div>
                                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#6366f2] to-[#818cf8] flex items-center justify-center relative z-10">
                                                            <Sparkles size={20} className="text-white" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="h-4 w-24 bg-white/[0.2] rounded-full mb-2"></div>
                                                        <div className="h-3 w-16 bg-white/[0.1] rounded-full"></div>
                                                    </div>
                                                    <div className="ml-auto h-10 w-10 rounded-full bg-white/[0.05] flex items-center justify-center">
                                                        <Phone size={16} className="text-[#a5b4fc]" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Chat Bubbles */}
                                            <div className="space-y-3 mt-2">
                                                <div className="flex gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-white/[0.1] shrink-0"></div>
                                                    <div className="rounded-2xl rounded-tl-none bg-white/[0.05] p-3 w-[70%] border border-white/[0.05]">
                                                        <div className="h-2 w-full bg-white/[0.2] rounded-full mb-2"></div>
                                                        <div className="h-2 w-2/3 bg-white/[0.2] rounded-full"></div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 flex-row-reverse">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#6366f2] to-[#a855f7] shrink-0"></div>
                                                    <div className="rounded-2xl rounded-tr-none bg-[#6366f2]/20 p-3 w-[60%] border border-[#6366f2]/30">
                                                        <div className="h-2 w-full bg-white/[0.4] rounded-full mb-2"></div>
                                                        <div className="h-2 w-1/2 bg-white/[0.4] rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="mt-4 flex gap-2">
                                                <div className="h-10 flex-1 rounded-xl bg-white/[0.05] border border-white/[0.05]"></div>
                                                <div className="h-10 w-10 shrink-0 rounded-xl bg-[#6366f2] flex items-center justify-center">
                                                    <div className="h-4 w-4 rounded-full bg-white"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Floating elements outside mockup */}
                                <div className="absolute right-0 top-12 z-20 translate-x-4 animate-float-delayed rounded-xl border border-white/[0.1] bg-[#1a1a2e]/90 p-4 shadow-xl backdrop-blur-md hidden sm:block">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Shield size={18} className="text-green-400" />
                                        </div>
                                        <div>
                                            <div className="h-2.5 w-20 bg-white/[0.2] rounded-full mb-1.5"></div>
                                            <div className="h-2 w-12 bg-green-400/50 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bento Grid Features */}
                <section className="py-24 relative z-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                Dirancang untuk kenyamanan.<br/>
                                <span className="text-[#9a8fb0] font-medium">Bukan pencitraan.</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Large */}
                            <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.05] p-8 md:p-12 transition-all hover:bg-white/[0.07]">
                                <div className="h-14 w-14 rounded-2xl bg-[#6366f2]/20 border border-[#6366f2]/30 flex items-center justify-center mb-8">
                                    <Shield size={28} className="text-[#a5b4fc]" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">100% Anonim. Privasi Terjaga.</h3>
                                <p className="text-[#9a8fb0] text-lg leading-relaxed max-w-lg">
                                    Tidak perlu foto profil asli. Tidak perlu nama asli. Kami tidak meminta data yang bisa melacakmu kembali. Ini adalah tempat di mana kamu dihargai karena ceritamu, bukan penampilanmu.
                                </p>
                            </div>

                            {/* Card 2: Small */}
                            <div className="rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.05] p-8 md:p-10 transition-all hover:bg-white/[0.07]">
                                <div className="h-12 w-12 rounded-2xl bg-[#ec4899]/20 border border-[#ec4899]/30 flex items-center justify-center mb-6">
                                    <Mic size={24} className="text-[#fbcfe8]" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Voice Game</h3>
                                <p className="text-[#9a8fb0] leading-relaxed">
                                    Lebih suka mengobrol langsung? Gunakan fitur Voice Game untuk panggilan suara anonim.
                                </p>
                            </div>

                            {/* Card 3: Small */}
                            <div className="rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.05] p-8 md:p-10 transition-all hover:bg-white/[0.07]">
                                <div className="h-12 w-12 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/30 flex items-center justify-center mb-6">
                                    <Search size={24} className="text-[#a7f3d0]" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Insta-Match</h3>
                                <p className="text-[#9a8fb0] leading-relaxed">
                                    Algoritma pintar kami mencarikan teman ngobrol dalam hitungan detik. Tanpa menunggu lama.
                                </p>
                            </div>

                            {/* Card 4: Medium/Wide */}
                            <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.05] p-8 md:p-10 transition-all hover:bg-white/[0.07] flex flex-col md:flex-row gap-8 items-center justify-between">
                                <div>
                                    <div className="h-12 w-12 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/30 flex items-center justify-center mb-6">
                                        <Users size={24} className="text-[#fde68a]" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Dari Orang Asing jadi Teman</h3>
                                    <p className="text-[#9a8fb0] leading-relaxed max-w-md">
                                        Merasa cocok saat ngobrol anonim? Simpan dia di Daftar Teman untuk terus berkomunikasi tanpa kehilangan privasi.
                                    </p>
                                </div>
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-16 w-16 rounded-full border-2 border-[#05050a] bg-[#1e1e2d] flex items-center justify-center">
                                            <UserCircle2 size={24} className="text-[#6366f2]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#6366f2]/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.05] blur-[2px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.05]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#6366f2]/20" />

                    <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
                            Dunia butuh mendengar ceritamu.
                        </h2>
                        <button 
                            onClick={() => onNavigate('/register')}
                            className="rounded-full bg-white px-10 py-5 text-lg font-bold text-[#05050a] transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
                        >
                            Bergabung dengan Nexa
                        </button>
                        <p className="mt-6 text-[#9a8fb0] text-sm">Gratis selamanya. Tidak perlu kartu kredit.</p>
                    </div>
                </section>
            </main>

            {/* Stark Minimal Footer */}
            <footer className="border-t border-white/[0.05] bg-[#05050a] py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#6366f2]" />
                        <span className="text-xl font-bold text-white tracking-tight">Nexa.</span>
                    </div>
                    <p className="text-sm text-[#9a8fb0] font-medium">
                        &copy; {new Date().getFullYear()} Nexa Anonymous Matching - Doni Sw
                    </p>
                </div>
            </footer>

            {/* Add global styles for custom animations in this component */}
            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float-slow {
                    animation: float-slow 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 7s ease-in-out infinite 1s;
                }
                .bg-300% {
                    background-size: 300% auto;
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 8s ease infinite;
                }
            `}</style>
        </div>
    );
}
