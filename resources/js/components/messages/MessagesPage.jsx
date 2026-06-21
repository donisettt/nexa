import React from 'react';
import { MessageSquare } from 'lucide-react';
import FriendsPanel from '../friends/FriendsPanel';
import DirectChatPanel from '../friends/DirectChatPanel';

export default function MessagesPage({ activeFriendChat, onOpenChat, onBack, friendSummary, refreshKey, user }) {
    return (
        <div className="flex h-[calc(100vh-104px)] overflow-hidden rounded-xl border border-[#c7d2fe] bg-white shadow-sm">
            {/* Left Sidebar (Contact List) */}
            <div className={`flex w-full flex-col border-r border-[#c7d2fe] bg-[#f8faff] md:w80 lg:w-96 shrink-0 ${activeFriendChat ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-[#c7d2fe] bg-white px-5 py-4">
                    <h2 className="text-lg font-black text-[#1e1033]">Pesan</h2>
                    <span className="rounded-md bg-[#e0e7ff] px-2.5 py-1 text-xs font-black text-[#6366f2]">
                        {friendSummary.friends.length} Teman
                    </span>
                </div>
                
                {/* Contact List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <FriendsPanel
                        activeChatId={activeFriendChat?.id}
                        onOpenChat={onOpenChat}
                        onStateChange={() => {}}
                        refreshKey={refreshKey}
                        compact={true}
                    />
                </div>
            </div>

            {/* Right Pane (Active Chat) */}
            <div className={`flex-1 flex-col bg-white ${!activeFriendChat ? 'hidden md:flex' : 'flex'}`}>
                {activeFriendChat ? (
                    <DirectChatPanel
                        chat={activeFriendChat}
                        onBack={onBack}
                        user={user}
                        fullHeight={true}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center p-6">
                        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef2ff] text-[#6366f2]">
                            <MessageSquare size={40} className="opacity-80" />
                        </span>
                        <h3 className="mt-5 text-xl font-black text-[#1e1033]">Pesan Nexa</h3>
                        <p className="mt-2 max-w-sm text-sm text-[#7c6b97]">
                            Pilih teman dari daftar di sebelah kiri untuk mulai mengobrol secara private.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
