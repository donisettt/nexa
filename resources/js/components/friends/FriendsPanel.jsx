import React, { useCallback, useEffect, useState } from 'react';
import { Check, MessageCircle, User as UserIcon, UserPlus, XCircle } from 'lucide-react';
import { readErrorMessage } from '../../utils/helpers';

function FriendSection({ children, title }) {
    return (
        <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#7c6b97]">{title}</h3>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function FriendRequestItem({ busyId, friendship, onAccept, onReject }) {
    return (
        <div className="rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-3 py-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[#c7d2fe]">
                        {friendship.user?.avatar_url ? (
                            <img src={friendship.user.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <UserIcon size={20} className="text-[#a5b4fc]" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#1e1033]">{friendship.user?.name || 'Teman'}</p>
                        <p className="mt-1 truncate text-xs text-[#7c6b97]">{friendship.user?.email}</p>
                    </div>
                </div>
                <div className="flex shrink-0 gap-2">
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-[#6366f2] text-white transition hover:bg-[#4f46e5] disabled:opacity-50"
                        disabled={busyId === `accept-${friendship.id}`}
                        onClick={onAccept}
                        title="Terima"
                        type="button"
                    >
                        <Check size={16} aria-hidden="true" />
                    </button>
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#a25545] ring-1 ring-[#c7d2fe] transition hover:bg-[#fff7f5] disabled:opacity-50"
                        disabled={busyId === `reject-${friendship.id}`}
                        onClick={onReject}
                        title="Tolak"
                        type="button"
                    >
                        <XCircle size={16} aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function FriendListItem({ active, busy, friendship, onOpen }) {
    return (
        <button
            className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition ${
                active
                    ? 'border-[#6366f2] bg-[#e0e7ff]'
                    : 'border-[#c7d2fe] bg-[#eef2ff] hover:border-[#c4b0e0] hover:bg-white'
            }`}
            disabled={busy}
            onClick={onOpen}
            type="button"
        >
            <span className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[#c7d2fe]">
                    {friendship.user?.avatar_url ? (
                        <img src={friendship.user.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <UserIcon size={20} className="text-[#a5b4fc]" />
                    )}
                </div>
                <span className="min-w-0 text-left">
                    <span className="block truncate text-sm font-bold text-[#1e1033]">{friendship.user?.name || 'Teman'}</span>
                    <span className="mt-1 block truncate text-xs text-[#7c6b97]">{friendship.user?.email}</span>
                </span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#6366f2] ring-1 ring-[#c7d2fe]">
                <MessageCircle size={16} aria-hidden="true" />
            </span>
        </button>
    );
}

function StateBlock({ icon: Icon, message, title, tone }) {
    const toneClass = {
        amber: 'bg-[#f7ead6] text-[#9a5a17]',
        blue: 'bg-[#ede5ff] text-[#6366f2]',
        green: 'bg-[#ede5ff] text-[#6366f2]',
    }[tone];

    return (
        <div className="rounded-md border border-[#c7d2fe] bg-white p-4">
            <div className="flex items-start gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
                    <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                    <h3 className="text-lg font-black text-[#1e1033]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#7c6b97]">{message}</p>
                </div>
            </div>
        </div>
    );
}

export default function FriendsPanel({ activeChatId, onOpenChat, onStateChange, refreshKey, compact = false }) {
    const [friendsState, setFriendsState] = useState({
        friends: [],
        pending_received: [],
        pending_sent: [],
    });
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');

    const loadFriends = useCallback(async () => {
        try {
            const { data } = await window.axios.get('/friends');
            setFriendsState(data);
            onStateChange?.(data);
            setError('');
        } catch (requestError) {
            setError(readErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, [onStateChange]);

    useEffect(() => {
        loadFriends();
    }, [loadFriends, refreshKey]);

    useEffect(() => {
        const intervalId = window.setInterval(loadFriends, 5000);

        return () => window.clearInterval(intervalId);
    }, [loadFriends]);

    const runFriendAction = async (action, friendshipId, request) => {
        setBusyId(`${action}-${friendshipId}`);
        setError('');

        try {
            const { data } = await request();
            setFriendsState(data);
        } catch (requestError) {
            setError(readErrorMessage(requestError));
        } finally {
            setBusyId(null);
        }
    };

    const acceptRequest = (friendship) => runFriendAction(
        'accept',
        friendship.id,
        () => window.axios.post(`/friends/${friendship.id}/accept`)
    );

    const rejectRequest = (friendship) => runFriendAction(
        'reject',
        friendship.id,
        () => window.axios.post(`/friends/${friendship.id}/reject`)
    );

    const openChat = async (friendship) => {
        setBusyId(`chat-${friendship.id}`);
        setError('');

        try {
            const { data } = await window.axios.post(`/friends/${friendship.id}/chat`);
            onOpenChat(data.chat);
        } catch (requestError) {
            setError(readErrorMessage(requestError));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section className={compact ? "" : "rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm"}>
            {!compact && (
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black text-[#1e1033]">Daftar Teman</h2>
                        <p className="mt-1 text-sm text-[#7c6b97]">Chat langsung dengan teman yang sudah diterima.</p>
                    </div>
                    <span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-black text-[#6366f2]">
                        {friendsState.friends.length}
                    </span>
                </div>
            )}

            <div className={compact ? "space-y-4" : "mt-4 space-y-4"}>
                {loading ? (
                    <div className="flex items-center gap-3 rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-4 py-3">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#6366f2] border-t-transparent" />
                        <p className="text-sm font-semibold text-[#5a4d6e]">Memuat teman...</p>
                    </div>
                ) : null}

                {friendsState.pending_received.length > 0 ? (
                    <FriendSection title="Permintaan Masuk">
                        {friendsState.pending_received.map((friendship) => (
                            <FriendRequestItem
                                busyId={busyId}
                                friendship={friendship}
                                key={friendship.id}
                                onAccept={() => acceptRequest(friendship)}
                                onReject={() => rejectRequest(friendship)}
                            />
                        ))}
                    </FriendSection>
                ) : null}

                {friendsState.friends.length > 0 ? (
                    <FriendSection title="Teman Aktif">
                        {friendsState.friends.map((friendship) => (
                            <FriendListItem
                                active={activeChatId === friendship.chat?.id}
                                busy={busyId === `chat-${friendship.id}`}
                                friendship={friendship}
                                key={friendship.id}
                                onOpen={() => openChat(friendship)}
                            />
                        ))}
                    </FriendSection>
                ) : (
                    !loading && (
                        <StateBlock
                            icon={UserPlus}
                            message="Tambahkan teman dari sesi random untuk chat lagi tanpa matching."
                            title="Belum ada teman"
                            tone="blue"
                        />
                    )
                )}

                {friendsState.pending_sent.length > 0 ? (
                    <FriendSection title="Menunggu Konfirmasi">
                        {friendsState.pending_sent.map((friendship) => (
                            <div
                                className="rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-4 py-3"
                                key={friendship.id}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[#c7d2fe]">
                                        {friendship.user?.avatar_url ? (
                                            <img src={friendship.user.avatar_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon size={20} className="text-[#a5b4fc]" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#1e1033]">{friendship.user?.name || 'Teman'}</p>
                                        <p className="mt-1 text-xs font-semibold text-[#7a4b17]">Permintaan terkirim</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </FriendSection>
                ) : null}
            </div>

            {error ? (
                <div className="mt-4 rounded-md border border-[#e7a08d] bg-[#fff3ef] px-4 py-3 text-sm font-semibold text-[#a53f2b]">
                    {error}
                </div>
            ) : null}
        </section>
    );
}
