import React from 'react';
import { Home, MessageCircle, Search, UserRound, Users } from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'matching', label: 'Chat', icon: Search },
    { id: 'friends', label: 'Teman', icon: Users },
    { id: 'messages', label: 'Pesan', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: UserRound },
];

export default function BottomNavigation({ activeItem, onSelectItem, notificationCount = 0 }) {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#c7d2fe] bg-white pb-safe lg:hidden">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;
                    const showBadge = item.id === 'friends' && notificationCount > 0; // If pending requests

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectItem(item.id)}
                            className="group relative flex flex-col items-center justify-center w-full h-full"
                        >
                            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-colors duration-200 ${
                                isActive ? 'text-[#6366f2]' : 'text-[#8b7fa3] hover:text-[#5a4d6e]'
                            }`}>
                                <div className="relative mb-1">
                                    <Icon size={22} className={isActive ? 'stroke-[2.5px]' : ''} />
                                    {showBadge && (
                                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#8b5cf6] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                                            {notificationCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] tracking-wide transition-all ${
                                    isActive ? 'font-bold scale-100 opacity-100' : 'font-semibold scale-95 opacity-80'
                                }`}>
                                    {item.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
