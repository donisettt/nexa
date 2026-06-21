import React, { useCallback, useEffect, useState } from 'react';
import { Clock3, Search, XCircle } from 'lucide-react';
import { readErrorMessage, formatDateTime } from '../../utils/helpers';
import StateBlock from '../ui/StateBlock';
import ActionButton from '../ui/ActionButton';
import ChatRoom from './ChatRoom';

function MatchingBadge({ state }) {
    const labels = {
        idle: 'Siap',
        loading: 'Memuat',
        matched: 'Terhubung',
        searching: 'Mencari',
    };

    const classes = {
        idle: 'bg-[#e0e7ff] text-[#6366f2]',
        loading: 'bg-[#eef2ff] text-[#7c6b97]',
        matched: 'bg-[#e0e7ff] text-[#6366f2]',
        searching: 'bg-[#fff5df] text-[#8a5b12]',
    };

    return (
        <span className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-black uppercase tracking-wide ${classes[state] || classes.idle}`}>
            {labels[state] || labels.idle}
        </span>
    );
}

function MatchingLoading() {
    return (
        <div className="flex items-center gap-3 rounded-md border border-[#c7d2fe] bg-white px-4 py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#6366f2] border-t-transparent" />
            <p className="text-sm font-semibold text-[#5a4d6e]">Memuat status matching...</p>
        </div>
    );
}

function IdleState({ message }) {
    return (
        <div className="rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-6 py-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#6366f2] ring-1 ring-[#c7d2fe]">
                <Search size={28} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-black text-[#1e1033]">Mulai Random Matching</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7c6b97]">{message}</p>
        </div>
    );
}

function SearchingState({ message, startedAt }) {
    return (
        <div className="space-y-4">
            <StateBlock
                icon={Clock3}
                message={message}
                title="Menunggu teman tersedia"
                tone="amber"
            />
            {startedAt ? (
                <div className="rounded-md bg-[#f7ead6] px-4 py-3 text-sm font-semibold text-[#7a4b17]">
                    Mulai mencari: {formatDateTime(startedAt)}
                </div>
            ) : null}
        </div>
    );
}

export default function MatchingPanel({ onFriendRequestChanged, user }) {
    const [matching, setMatching] = useState({ state: 'loading' });
    const [busyAction, setBusyAction] = useState(null);
    const [error, setError] = useState('');

    const loadMatching = useCallback(async () => {
        try {
            const { data } = await window.axios.get('/matching/status');
            setMatching(data);
            setError('');
        } catch (requestError) {
            setError(readErrorMessage(requestError));
        }
    }, []);

    useEffect(() => {
        loadMatching();
    }, [loadMatching]);

    useEffect(() => {
        if (!['matched', 'searching'].includes(matching.state)) {
            return undefined;
        }

        const intervalId = window.setInterval(loadMatching, 3000);

        return () => window.clearInterval(intervalId);
    }, [loadMatching, matching.state]);

    const runAction = async (action, request) => {
        setBusyAction(action);
        setError('');

        try {
            const { data } = await request();
            setMatching(data);
        } catch (requestError) {
            setError(readErrorMessage(requestError));
        } finally {
            setBusyAction(null);
        }
    };

    const startSearch = () => runAction('start', () => window.axios.post('/matching/start'));
    const cancelSearch = () => runAction('cancel', () => window.axios.post('/matching/cancel'));
    const endMatch = () => runAction('end', () => window.axios.post(`/matching/${matching.match.id}/end`));

    return (
        <section className="rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-black text-[#1e1033]">Cari Teman</h2>
                    <p className="mt-1 text-sm leading-6 text-[#7c6b97]">Mulai random matching atau lanjutkan sesi aktif.</p>
                </div>
                <MatchingBadge state={matching.state} />
            </div>

            <div className="mt-6">
                {matching.state === 'loading' ? (
                    <MatchingLoading />
                ) : matching.state === 'searching' ? (
                    <SearchingState message={matching.message} startedAt={matching.queue?.started_at} />
                ) : matching.state === 'matched' ? (
                    <ChatRoom
                        allowFriendRequest
                        busy={busyAction === 'end'}
                        match={matching.match}
                        onEndSession={endMatch}
                        onFriendRequestChanged={onFriendRequestChanged}
                        user={user}
                    />
                ) : (
                    <IdleState message={matching.message} />
                )}
            </div>

            {error ? (
                <div className="mt-4 rounded-md border border-[#e7a08d] bg-[#fff3ef] px-4 py-3 text-sm font-semibold text-[#a53f2b]">
                    {error}
                </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {matching.state === 'searching' ? (
                    <ActionButton
                        busy={busyAction === 'cancel'}
                        icon={XCircle}
                        label="Batalkan"
                        onClick={cancelSearch}
                        tone="muted"
                    />
                ) : null}



                {matching.state === 'idle' ? (
                    <ActionButton
                        busy={busyAction === 'start'}
                        icon={Search}
                        label="Cari Teman Sekarang"
                        onClick={startSearch}
                        tone="primary"
                    />
                ) : null}
            </div>
        </section>
    );
}
