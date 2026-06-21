import React from 'react';
import {
    Bell,
    Home,
    MessageCircle,
    Phone,
    Search,
    Settings,
    Sparkles,
    Users,
} from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'matching', label: 'Online Chat', icon: Search },
    { id: 'call-matching', label: 'Voice Game', icon: Phone },
    { id: 'friends', label: 'Daftar Teman', icon: Users },
    { id: 'messages', label: 'Pesan', icon: MessageCircle },
];

export default function AppSidebar({ activeItem, notificationCount = 0, onSelectItem, open }) {
    return (
        <aside className={`fixed inset-y-0 left-0 z-40 hidden lg:flex w-[252px] flex-col border-r border-[#c7d2fe] bg-[#eef2ff] px-4 py-5 text-[#1e1033] transition-transform duration-200 ${
            open ? 'translate-x-0' : '-translate-x-full'
        }`}>
            <div className="flex items-center gap-3 px-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6366f2] text-white">
                    <Sparkles size={21} aria-hidden="true" />
                </span>
                <span>
                    <span className="block text-xl font-black leading-tight">Nexa</span>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#8b7fa3]">Anonim Matching</span>
                </span>
            </div>

            <nav className="mt-9 flex-1 space-y-7">
                <div className="space-y-2">
                    {navItems.slice(0, 1).map((item) => (
                        <SidebarButton
                            active={activeItem === item.id}
                            item={item}
                            key={item.id}
                            onClick={() => onSelectItem(item.id)}
                        />
                    ))}
                </div>

                <div>
                    <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wide text-[#9a8fb0]">Menu</p>
                    <div className="space-y-2">
                        {navItems.slice(1).map((item) => (
                            <SidebarButton
                                active={activeItem === item.id}
                                item={item}
                                key={item.id}
                                notificationCount={item.id === 'notifications' ? notificationCount : 0}
                                onClick={() => onSelectItem(item.id)}
                            />
                        ))}
                    </div>
                </div>
            </nav>
        </aside>
    );
}

function SidebarButton({ active, item, notificationCount = 0, onClick }) {
    const Icon = item.icon;

    return (
        <button
            className={`flex h-11 w-full items-center justify-between rounded-lg px-3 text-sm font-bold transition ${
                active ? 'bg-[#6366f2] text-white shadow-sm' : 'text-[#5a4d6e] hover:bg-[#ede5ff] hover:text-[#1e1033]'
            }`}
            onClick={onClick}
            type="button"
        >
            <span className="flex items-center gap-4">
                <Icon size={20} aria-hidden="true" />
                {item.label}
            </span>
            {notificationCount > 0 ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#8b5cf6] px-2 text-xs text-white">
                    {notificationCount}
                </span>
            ) : null}
        </button>
    );
}
