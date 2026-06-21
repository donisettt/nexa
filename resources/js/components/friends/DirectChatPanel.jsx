import React from 'react';
import ChatRoom from '../matching/ChatRoom';

export default function DirectChatPanel({ chat, onBack, user, fullHeight = false }) {
    if (fullHeight) {
        return (
            <section className="flex h-full flex-col">
                <div className="md:hidden flex shrink-0 items-center border-b border-[#c7d2fe] bg-white px-4 py-3">
                    <button
                        className="flex h-10 items-center gap-2 rounded-md bg-[#eef2ff] px-3 text-sm font-bold text-[#3d2a5c] transition hover:bg-[#e0e7ff]"
                        onClick={onBack}
                        type="button"
                    >
                        <span>←</span>
                        <span>Daftar Teman</span>
                    </button>
                </div>

                <div className="flex-1 min-h-0">
                    <ChatRoom match={chat} user={user} />
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#6366f2]">Chat Teman</p>
                    <h2 className="mt-2 text-xl font-black text-[#1e1033]">{chat.partner_alias}</h2>
                    {chat.partner_email ? (
                        <p className="mt-1 break-all text-sm text-[#7c6b97]">{chat.partner_email}</p>
                    ) : null}
                </div>
                <button
                    className="inline-flex h-10 items-center justify-center rounded-md border border-[#c7d2fe] bg-[#eef2ff] px-4 text-sm font-bold text-[#3d2a5c] transition hover:bg-white"
                    onClick={onBack}
                    type="button"
                >
                    Random Matching
                </button>
            </div>

            <div className="mt-6">
                <ChatRoom match={chat} user={user} />
            </div>
        </section>
    );
}
