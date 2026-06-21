import React from 'react';
import { LogIn, LogOut, Sparkles, UserPlus } from 'lucide-react';
import { syncCsrfToken } from '../../utils/helpers';

export default function TopBar({ user, onNavigate, onLogout }) {
    const handleLogout = async () => {
        const { data } = await window.axios.post('/auth/logout');
        syncCsrfToken(data.csrf_token);
        onLogout();
        onNavigate('/login');
    };

    return (
        <header className="border-b border-[#c7d2fe] bg-[#eef2ff]/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                <button
                    className="flex items-center gap-3 text-left"
                    onClick={() => onNavigate(user ? '/dashboard' : '/login')}
                    type="button"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#6366f2] text-white">
                        <Sparkles size={20} aria-hidden="true" />
                    </span>
                    <span>
                        <span className="block text-lg font-bold leading-tight">Nexa</span>
                        <span className="block text-xs font-medium uppercase tracking-wide text-[#8b7fa3]">
                            Anonymous Matching
                        </span>
                    </span>
                </button>

                {user ? (
                    <button
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-[#d95f43] px-4 text-sm font-semibold text-white transition hover:bg-[#bd4b32]"
                        onClick={handleLogout}
                        type="button"
                    >
                        <LogOut size={18} aria-hidden="true" />
                        Keluar
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[#3d2a5c] transition hover:bg-[#ede5ff]"
                            onClick={() => onNavigate('/login')}
                            type="button"
                        >
                            <LogIn size={18} aria-hidden="true" />
                            Login
                        </button>
                        <button
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#6366f2] px-3 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
                            onClick={() => onNavigate('/register')}
                            type="button"
                        >
                            <UserPlus size={18} aria-hidden="true" />
                            Daftar
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
