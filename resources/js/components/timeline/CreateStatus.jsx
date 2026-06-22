import React from 'react';

export default function CreateStatus({ user, onOpenModal }) {
    return (
        <div className="bg-white rounded-2xl border border-[#c7d2fe] p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e0e7ff&color=6366f2`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-[#eef2ff]"
                />
                <button
                    type="button"
                    onClick={onOpenModal}
                    className="flex-1 text-left px-4 py-2.5 bg-[#f1f4fe] hover:bg-[#e8edfd] text-[#9a8fb0] text-[15px] rounded-full cursor-text transition"
                >
                    Apa yang ada di pikiran Anda?
                </button>
            </div>

            <div className="mt-3 pt-3 border-t border-[#eef2ff]">
                <button
                    type="button"
                    onClick={onOpenModal}
                    className="flex items-center gap-2 text-sm font-semibold text-[#6366f2] hover:bg-[#eef2ff] px-3 py-1.5 rounded-lg transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    Foto
                </button>
            </div>
        </div>
    );
}
