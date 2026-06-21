import React from 'react';

export default function ActionButton({ busy, icon: Icon, label, onClick, tone }) {
    const toneClass = {
        danger: 'bg-[#a25545] text-white hover:bg-[#854234]',
        muted: 'border border-[#c7d2fe] bg-white text-[#3d2a5c] hover:bg-[#eef2ff]',
        primary: 'bg-[#6366f2] text-white hover:bg-[#4f46e5]',
    }[tone];

    return (
        <button
            className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${toneClass}`}
            disabled={busy}
            onClick={onClick}
            type="button"
        >
            <Icon size={18} aria-hidden="true" />
            {busy ? 'Memproses...' : label}
        </button>
    );
}
