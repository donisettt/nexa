import React from 'react';
import { Sparkles } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthIllustration() {
    return (
        <div className="flex w-full max-w-md flex-col items-center text-center">
            {/* Circular background with SVG */}
            <div className="relative mb-12 flex h-80 w-80 items-center justify-center rounded-full bg-[#4f46e5]/20">
                <div className="absolute inset-4 rounded-full bg-[#4f46e5]/40" />
                <div className="absolute inset-10 rounded-full bg-[#4f46e5]/60" />
                
                {/* Simulated Floating Browser Window */}
                <div className="relative z-10 w-48 overflow-hidden rounded-xl bg-white shadow-2xl">
                    <div className="flex h-6 items-center gap-1 bg-[#e0e7ff] px-3">
                        <div className="h-2 w-2 rounded-full bg-[#fca5a5]" />
                        <div className="h-2 w-2 rounded-full bg-[#fcd34d]" />
                        <div className="h-2 w-2 rounded-full bg-[#86efac]" />
                    </div>
                    <div className="p-4 space-y-3 bg-[#f8fafc]">
                        <div className="flex items-center gap-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-6 w-6 rounded-full bg-[#c7d2fe]" />
                            <div className="space-y-1">
                                <div className="h-1.5 w-16 rounded-full bg-[#e2e8f0]" />
                                <div className="h-1.5 w-24 rounded-full bg-[#f1f5f9]" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-6 w-6 rounded-full bg-[#c7d2fe]" />
                            <div className="space-y-1">
                                <div className="h-1.5 w-20 rounded-full bg-[#e2e8f0]" />
                                <div className="h-1.5 w-24 rounded-full bg-[#f1f5f9]" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-white p-2 shadow-sm">
                            <div className="h-6 w-6 rounded-full bg-[#c7d2fe]" />
                            <div className="space-y-1">
                                <div className="h-1.5 w-12 rounded-full bg-[#e2e8f0]" />
                                <div className="h-1.5 w-24 rounded-full bg-[#f1f5f9]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating app icons */}
                <div className="absolute -left-4 top-16 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                    <div className="h-6 w-6 rounded-md bg-[#3b82f6]" />
                </div>
                <div className="absolute -top-4 left-1/4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                    <div className="h-6 w-6 rounded-full bg-[#10b981]" />
                </div>
                <div className="absolute bottom-12 left-0 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                    <div className="flex h-6 w-6 items-center justify-center font-bold text-[#ef4444]">G</div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Temukan teman ngobrol baru.
            </h2>
            <p className="mt-4 text-sm text-[#e0e7ff] sm:text-base">
                Segala yang kamu butuhkan untuk mulai berinteraksi dengan aman secara anonim.
            </p>
            
            {/* Pagination dots (decorative) */}
            <div className="mt-10 flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            </div>
        </div>
    );
}

export default function AuthScreen({ mode, onAuthenticated, onNavigate }) {
    const isRegister = mode === 'register';

    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left Side - Form Container */}
            <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    {/* Brand Logo */}
                    <div className="mb-10 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f2] text-white">
                            <Sparkles size={16} />
                        </div>
                        <span className="text-xl font-black text-[#1e1033]">Nexa</span>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-[#1e1033]">
                        {isRegister ? 'Create an Account' : 'Log in to your Account'}
                    </h1>
                    <p className="mt-2 text-sm text-[#7c6b97]">
                        {isRegister 
                            ? 'Welcome! Please fill in the details to get started.' 
                            : 'Welcome back! Select method to log in:'}
                    </p>

                    <div className="mt-8">
                        {isRegister ? (
                            <RegisterForm onAuthenticated={onAuthenticated} onNavigate={onNavigate} />
                        ) : (
                            <LoginForm onAuthenticated={onAuthenticated} onNavigate={onNavigate} />
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Illustration (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center bg-[#6366f2] px-12 relative overflow-hidden">
                <AuthIllustration />
            </div>
        </div>
    );
}
