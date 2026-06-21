import React from 'react';
import { Users, UserPlus, Clock } from 'lucide-react';

function StatNumber({ icon: Icon, colorClass, bgClass, label, value }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-bold text-[#7c6b97]">{label}</p>
                <p className="mt-1 text-2xl font-black text-[#1e1033]">{value}</p>
            </div>
        </div>
    );
}

export default function StatsCard({ friendCount, pendingCount, sentCount }) {
    const metrics = [
        { 
            label: 'Teman Aktif', 
            value: friendCount, 
            icon: Users,
            bgClass: 'bg-[#e0e7ff]',
            colorClass: 'text-[#6366f2]'
        },
        { 
            label: 'Permintaan Masuk', 
            value: pendingCount, 
            icon: UserPlus,
            bgClass: 'bg-[#fce7f3]',
            colorClass: 'text-[#ec4899]'
        },
        { 
            label: 'Menunggu', 
            value: sentCount, 
            icon: Clock,
            bgClass: 'bg-[#ffedd5]',
            colorClass: 'text-[#f97316]'
        },
    ];

    return (
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
                <StatNumber key={metric.label} {...metric} />
            ))}
        </section>
    );
}
