import React from 'react';

function ActivityItem({ activity }) {
    return (
        <div className="flex items-center gap-3 py-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#6366f2]" />
            <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#1e1033]">{activity.title}</p>
                <p className="mt-1 text-xs font-semibold text-[#9a8fb0]">{activity.time}</p>
            </div>
        </div>
    );
}

export default function ActivityCard({ friendSummary }) {
    const activities = [
        {
            title: friendSummary.friends.length > 0 ? 'Kamu mendapatkan teman baru' : 'Random matching siap dipakai',
            time: friendSummary.friends.length > 0 ? 'Baru saja' : 'Mulai kapan saja',
        },
        {
            title: friendSummary.pending_received.length > 0
                ? `${friendSummary.pending_received.length} permintaan perlu dikonfirmasi`
                : 'Pesan teman tersimpan di daftar teman',
            time: 'Realtime aktif',
        },
        {
            title: 'Profil anonim tetap terlindungi',
            time: 'Privasi dijaga',
        },
        {
            title: friendSummary.pending_sent.length > 0
                ? `${friendSummary.pending_sent.length} permintaan menunggu`
                : 'Tambah teman dari random chat',
            time: 'Bisa lanjut chat langsung',
        },
    ];

    return (
        <section className="rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black text-[#1e1033]">Aktivitas</h2>
                <span className="text-xs font-bold uppercase tracking-wide text-[#9a8fb0]">Hari ini</span>
            </div>

            <div className="mt-4 divide-y divide-[#e8e0f5]">
                {activities.map((activity) => (
                    <ActivityItem activity={activity} key={activity.title} />
                ))}
            </div>
        </section>
    );
}
