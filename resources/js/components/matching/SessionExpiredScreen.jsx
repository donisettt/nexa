import React from 'react';
import { Clock, UserPlus, Users } from 'lucide-react';

export default function SessionExpiredScreen({ onFindNew, onGoToFriends }) {
    return (
        <div className="flex h-full flex-col items-center justify-center rounded-xl border border-[#e0c7fe] bg-gradient-to-br from-[#faf5ff] via-white to-[#eef2ff] px-6 py-16 text-center shadow-sm">
            {/* Animated icon */}
            <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-[#f7ead6] opacity-40 animate-ping" style={{ animationDuration: '3s' }} />
                <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#f7ead6] to-[#fde68a] shadow-lg">
                    <Clock size={44} className="text-[#8a5b12]" />
                </span>
            </div>

            <span className="mb-3 inline-flex items-center rounded-full bg-[#fff5df] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#8a5b12]">
                Sesi Berakhir
            </span>
            <h2 className="text-2xl font-black text-[#1e1033] sm:text-3xl">
                Waktu Chat Habis!
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#7c6b97]">
                Sesi chat 10 menit sudah berakhir. Kamu tidak sempat menjadi teman dengan lawan chatmu.
                Cari teman baru atau lihat daftar temanmu yang sudah ada.
            </p>

            {/* Info box */}
            <div className="mt-6 w-full max-w-sm rounded-xl border border-[#c7d2fe] bg-[#eef2ff] px-5 py-4 text-left">
                <p className="text-xs font-black uppercase tracking-wide text-[#6366f2]">💡 Tahukah Kamu?</p>
                <p className="mt-2 text-sm text-[#5a4d6e] leading-6">
                    Klik <span className="font-bold">"Tambah Teman"</span> di dalam chat sebelum waktu habis agar kamu bisa ngobrol terus kapan saja tanpa batas waktu!
                </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <button
                    className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[#6366f2] px-7 text-sm font-black text-white shadow-md shadow-[#6366f2]/20 transition hover:bg-[#4f46e5] sm:w-auto"
                    onClick={onFindNew}
                    type="button"
                >
                    <Users size={18} />
                    Cari Teman Baru
                </button>
                <button
                    className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#c7d2fe] bg-white px-7 text-sm font-bold text-[#3d2a5c] transition hover:bg-[#eef2ff] sm:w-auto"
                    onClick={onGoToFriends}
                    type="button"
                >
                    <UserPlus size={18} />
                    Daftar Teman
                </button>
            </div>
        </div>
    );
}
