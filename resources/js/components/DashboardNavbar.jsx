import React, { useEffect, useRef, useState } from 'react';
import { Bell, LogOut, Menu, UserRound, MessageCircle } from 'lucide-react';

export default function DashboardNavbar({ onLogout, onToggleSidebar, onSelectProfile, onNotificationsClick, unreadNotificationCount = 0, sidebarOpen, user }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const closeProfile = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', closeProfile);

        return () => document.removeEventListener('mousedown', closeProfile);
    }, []);

    return (
        <header className="sticky top-0 z-30 lg:border-b lg:border-[#c7d2fe] bg-[#f8f9fc] lg:bg-white/95 lg:backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Desktop Left Side */}
                <div className="hidden lg:flex items-center gap-3">
                    <button
                        aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c7d2fe] bg-white text-[#1e1033] transition hover:bg-[#eef2ff]"
                        onClick={onToggleSidebar}
                        type="button"
                    >
                        <Menu size={21} aria-hidden="true" />
                    </button>
                    <div>
                        <p className="text-sm font-black text-[#1e1033]">Dashboard</p>
                        <p className="text-xs font-semibold text-[#9a8fb0]">Nexa workspace</p>
                    </div>
                </div>

                {/* Mobile Left Side */}
                <div className="flex lg:hidden items-center">
                    <h1 className="text-2xl font-black text-[#6366f2] tracking-tighter">nexa</h1>
                </div>

                <div className="flex items-center gap-2 relative" ref={profileRef}>
                    {/* Desktop Right Side */}
                    <div className="hidden lg:flex items-center gap-2">
                        <button
                            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-transparent text-[#5a4d6e] transition hover:bg-[#eef2ff] hover:text-[#6366f2]"
                            onClick={onNotificationsClick}
                            type="button"
                            aria-label="Notifikasi"
                        >
                            <Bell size={20} />
                            {unreadNotificationCount > 0 ? (
                                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e53e3e] px-1 text-[10px] font-bold text-white shadow-sm">
                                    {unreadNotificationCount}
                                </span>
                            ) : null}
                        </button>
                        <div className="h-6 w-px bg-[#c7d2fe] mx-1"></div>
                        <button
                            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-[#eef2ff]"
                            onClick={() => setProfileOpen((current) => !current)}
                            type="button"
                        >
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="h-9 w-9 rounded-full object-cover shadow-sm" />
                            ) : (
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ede5ff] text-sm font-black text-[#6366f2]">
                                    {initials(user.name)}
                                </span>
                            )}
                            <span className="hidden min-w-0 sm:block">
                                <span className="block max-w-[180px] truncate text-sm font-black text-[#1e1033]">{user.name}</span>
                                <span className="block max-w-[180px] truncate text-xs text-[#8b7fa3]">{user.email}</span>
                            </span>
                        </button>
                    </div>

                    {/* Mobile Right Side */}
                    <div className="flex lg:hidden items-center gap-3">
                        <button
                            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#5a4d6e] transition hover:bg-gray-50 shadow-sm"
                            onClick={onNotificationsClick}
                            type="button"
                            aria-label="Notifikasi"
                        >
                            <Bell size={20} strokeWidth={2.5} />
                            {unreadNotificationCount > 0 ? (
                                <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-[#e53e3e] ring-2 ring-white"></span>
                            ) : null}
                        </button>
                    </div>

                    {/* Profile Dropdown */}
                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-lg border border-[#c7d2fe] bg-white shadow-lg shadow-[#1e1033]/10">
                            <div className="border-b border-[#ede5ff] px-4 py-3">
                                <p className="truncate text-sm font-black text-[#1e1033]">{user.name}</p>
                                <p className="mt-1 truncate text-xs text-[#8b7fa3]">{user.email}</p>
                            </div>
                            <button
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-[#3d2a5c] transition hover:bg-[#eef2ff]"
                                type="button"
                                onClick={() => {
                                    setProfileOpen(false);
                                    if (onSelectProfile) onSelectProfile();
                                }}
                            >
                                <UserRound size={17} aria-hidden="true" />
                                Profile
                            </button>
                            <button
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-[#a25545] transition hover:bg-[#fff7f5]"
                                onClick={onLogout}
                                type="button"
                            >
                                <LogOut size={17} aria-hidden="true" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function initials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}
