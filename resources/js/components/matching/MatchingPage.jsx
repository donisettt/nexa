import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Clock3,
    MessageCircle,
    Search,
    Shield,
    Sparkles,
    Users,
    XCircle,
    Phone,
    Mic,
} from 'lucide-react';
import { readErrorMessage, formatDateTime } from '../../utils/helpers';
import ActionButton from '../ui/ActionButton';
import ChatRoom from './ChatRoom';
import RecommendationPanel from '../friends/RecommendationPanel';
import SessionExpiredScreen from './SessionExpiredScreen';

/* ─── Matching Badge ──────────────────────────────────────────── */
function MatchingBadge({ state }) {
    const labels = { idle: 'Siap', loading: 'Memuat', matched: 'Terhubung', searching: 'Mencari' };
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

/* ─── Game Options (Litmatch Style) ──────────────────────────── */
function GameCard({ title, count, icon: Icon, color, onClick, busy }) {
    const bgColors = {
        pink: 'bg-[#fff0f5]',
        green: 'bg-[#f0fdf4]',
        purple: 'bg-[#f5f3ff]'
    };
    const iconColors = {
        pink: 'text-[#fb7185]',
        green: 'text-[#4ade80]',
        purple: 'text-[#c084fc]'
    };
    const dotColors = {
        pink: 'bg-[#38bdf8]',
        green: 'bg-[#38bdf8]',
        purple: 'bg-[#fb7185]'
    };

    return (
        <button 
            type="button"
            disabled={busy}
            onClick={onClick}
            className={`flex flex-col items-center justify-center min-w-[105px] flex-1 rounded-2xl p-4 transition-transform active:scale-95 ${bgColors[color]} disabled:opacity-70 disabled:cursor-not-allowed`}
        >
            <div className={`flex h-12 w-12 items-center justify-center ${iconColors[color]}`}>
                <Icon size={44} strokeWidth={1.5} fill="currentColor" className="opacity-90" />
            </div>
            <h3 className="mt-3 text-[13px] font-black text-[#1e1033] whitespace-nowrap">{title}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-[#9a8fb0]">
                <span className={`h-1.5 w-1.5 rounded-full ${dotColors[color]}`}></span>
                {count} Bermain
            </div>
        </button>
    );
}

function GameOptions({ busyAction, onStartRandom, onNavigate }) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            <GameCard
                title="Random Chat"
                count="54.560"
                icon={MessageCircle}
                color="pink"
                onClick={onStartRandom}
                busy={busyAction === 'start'}
            />
            <GameCard
                title="Voice Game"
                count="49.205"
                icon={Phone}
                color="green"
                onClick={() => onNavigate && onNavigate('call-matching')}
                busy={false}
            />
            <GameCard
                title="Party Match"
                count="21.824"
                icon={Mic}
                color="purple"
                onClick={() => alert('Fitur Party Match segera hadir!')}
                busy={false}
            />
        </div>
    );
}

function OnlineMatchBanner({ onStartRandom }) {
    return (
        <div 
            className="mt-4 flex items-center justify-between rounded-2xl bg-[#f8f9fc] p-4 cursor-pointer hover:bg-[#f1f3f9] transition"
            onClick={onStartRandom}
        >
            <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#60a5fa] to-[#3b82f6] text-white shadow-sm shadow-blue-200">
                    <MessageCircle size={22} fill="currentColor" />
                    <Sparkles size={12} className="absolute -top-1 -left-1 text-yellow-300" fill="currentColor" />
                </div>
                <div>
                    <h3 className="flex items-center gap-1 text-sm font-black text-[#1e1033]">
                        OnlineMatch <span className="text-[#9a8fb0]">›</span>
                    </h3>
                    <p className="text-[11px] font-semibold text-[#9a8fb0]">Temui teman baru online</p>
                </div>
            </div>
            <span className="rounded-full bg-[#ede5ff] px-3 py-1.5 text-[10px] font-bold text-[#6366f2]">
                Seluruh Dunia ⇌
            </span>
        </div>
    );
}

/* ─── Elapsed Timer Hook ──────────────────────────────────────── */
function useElapsedTimer(startedAt) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startedAt) return;
        const start = new Date(startedAt).getTime();
        const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startedAt]);

    const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
}

/* ─── Running Person SVG Icon ─────────────────────────────────── */
function RunningPersonIcon({ size = 34, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Head */}
            <circle cx="28" cy="8" r="4" fill="currentColor" />
            {/* Body & legs in running pose */}
            <path
                d="M26 14l-4 8-6 2 1.5 3 5-1.5 2.5 6-5 8h3.5l5-7 4 7h3.5l-5-9 1-7 4 2 1-3-6-4-2-4.5Z"
                fill="currentColor"
                strokeLinejoin="round"
            />
            {/* Motion lines */}
            <path
                d="M10 16h6M8 22h5M10 28h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
            />
        </svg>
    );
}

/* ─── Searching View ─────────────────────────────────────────── */
function SearchingView({ message, startedAt, busy, onCancel }) {
    const elapsed = useElapsedTimer(startedAt);

    return (
        <div className="rounded-xl border border-[#c7d2fe] bg-white p-6 shadow-sm sm:p-8">
            <div className="text-center">
                {/* Animated radar icon */}
                <span className="relative mx-auto flex h-28 w-28 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#fff5df] opacity-20" style={{ animationDuration: '2s' }} />
                    <span className="absolute inset-2 animate-ping rounded-full bg-[#fff5df] opacity-30" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                    <span className="absolute inset-4 animate-ping rounded-full bg-[#fff5df] opacity-20" style={{ animationDuration: '2s', animationDelay: '1s' }} />
                    <span className="relative flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-[#fff5df] text-[#8a5b12] shadow-lg shadow-[#fff5df]/40">
                        <RunningPersonIcon size={36} className="animate-[bounce_1.2s_ease-in-out_infinite]" />
                    </span>
                </span>

                <h2 className="mt-6 animate-pulse text-2xl font-black text-[#1e1033]" style={{ animationDuration: '2.5s' }}>
                    Mencari Teman...
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#7c6b97]">
                    {message || 'Sedang mencari teman anonim yang tersedia. Harap tunggu sebentar.'}
                </p>

                {startedAt ? (
                    <div className="mt-5 inline-flex items-center gap-2.5 rounded-lg bg-[#f7ead6] px-5 py-3 font-mono text-lg font-black tracking-wider text-[#7a4b17] shadow-sm">
                        <Clock3 size={18} className="animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wide opacity-70">Waktu Pencarian</span>
                        <span className="min-w-[80px] text-center tabular-nums">{elapsed}</span>
                    </div>
                ) : null}
            </div>

            {/* Animated dots */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#6366f2]" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#6366f2]" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[#6366f2]" style={{ animationDelay: '300ms' }} />
            </div>

            <div className="mt-6 rounded-lg border border-[#c7d2fe] bg-[#eef2ff] p-5">
                <h3 className="text-sm font-black text-[#1e1033]">Tips sambil menunggu</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-[#7c6b97]">
                    <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f2]" />
                        Pastikan koneksi internet kamu stabil agar matching berjalan lancar.
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f2]" />
                        Setelah terhubung, sapa teman barumu dengan ramah.
                    </li>
                    <li className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f2]" />
                        Kamu bisa menambah teman dari sesi chat untuk ngobrol lagi kapan saja.
                    </li>
                </ul>
            </div>

            <div className="mt-6 flex justify-center">
                <ActionButton
                    busy={busy}
                    icon={XCircle}
                    label="Batalkan Pencarian"
                    onClick={onCancel}
                    tone="muted"
                />
            </div>
        </div>
    );
}

/* ─── Matched Chat View ──────────────────────────────────────── */
function MatchedChatView({ match, user, busy, onEndSession, onFriendRequestChanged }) {
    return (
        <div className="flex h-full flex-col space-y-5">
            <div className="flex shrink-0 flex-col gap-3 rounded-xl border border-[#c7d2fe] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e0e7ff] text-[#6366f2]">
                        <Users size={22} />
                    </span>
                    <div>
                        <h2 className="text-lg font-black text-[#1e1033]">Sesi Matching Aktif</h2>
                        <p className="text-sm text-[#7c6b97]">
                            Terhubung dengan <span className="font-bold text-[#1e1033]">{match?.partner_alias}</span>
                            {match?.started_at ? ` sejak ${formatDateTime(match.started_at)}` : ''}
                        </p>
                    </div>
                </div>
                <MatchingBadge state="matched" />
            </div>
            <div className="flex-1 min-h-0">
                <ChatRoom
                    allowFriendRequest
                    busy={busy}
                    match={match}
                    onEndSession={onEndSession}
                    onFriendRequestChanged={onFriendRequestChanged}
                    user={user}
                />
            </div>
        </div>
    );
}

/* ═══ Main Page ═══════════════════════════════════════════════ */
export default function MatchingPage({ onNavigate, onFriendRequestChanged, user }) {
    const [matching, setMatching] = useState({ state: 'loading' });
    const [busyAction, setBusyAction] = useState(null);
    const [error, setError] = useState('');
    const [localTimedOut, setLocalTimedOut] = useState(false);

    const loadMatching = useCallback(async () => {
        try {
            const { data } = await window.axios.get('/matching/status');
            setMatching(data);
            if (data.state === 'timed_out') setLocalTimedOut(true);
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
            if (data.state === 'timed_out') setLocalTimedOut(true);
        } catch (requestError) {
            setError(readErrorMessage(requestError));
        } finally {
            setBusyAction(null);
        }
    };

    const resetToIdle = () => {
        setLocalTimedOut(false);
        setMatching({ state: 'idle' });
    };

    const startSearch = () => { resetToIdle(); runAction('start', () => window.axios.post('/matching/start')); };
    const cancelSearch = () => runAction('cancel', () => window.axios.post('/matching/cancel'));
    const endMatch = () => runAction('end', () => window.axios.post(`/matching/${matching.match.id}/end`));

    return (
        <div className="space-y-6">
            {/* ─── Timed-Out State ────────────────────────────── */}
            {(matching.state === 'timed_out' || localTimedOut) ? (
                <>
                    <style>{`body { overflow: hidden !important; } footer { display: none !important; }`}</style>
                    <div className="h-[calc(100vh-104px)]">
                        <SessionExpiredScreen
                            onFindNew={startSearch}
                            onGoToFriends={() => window.location.href = '/friends'}
                        />
                    </div>
                </>
            ) : null}

            {/* ─── Page Header ─────────────────────────────── */}
            {matching.state !== 'matched' ? (
                <section className="hidden sm:flex flex-col gap-4 rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-[#6366f2]">Fitur</p>
                        <h1 className="mt-1 text-2xl font-black leading-tight text-[#1e1033] sm:text-3xl">
                            Cari Teman Ngobrol
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#7c6b97]">
                            Masuk ke antrian random matching dan temukan teman anonim untuk ngobrol secara spontan.
                        </p>
                    </div>
                    <MatchingBadge state={matching.state} />
                </section>
            ) : null}

            {/* ─── Two-Panel Layout ───────────────────────── */}
            {matching.state === 'matched' && !localTimedOut ? (
                <>
                    <style>{`
                        body { overflow: hidden !important; }
                        footer { display: none !important; }
                    `}</style>
                    <div className="h-[calc(100vh-104px)]">
                        <MatchedChatView
                            busy={busyAction === 'end'}
                            match={matching.match}
                            onEndSession={endMatch}
                            onFriendRequestChanged={onFriendRequestChanged}
                            user={user}
                        />
                    </div>
                </>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="min-w-0">
                        {matching.state === 'loading' ? (
                            <div className="flex items-center justify-center gap-3 rounded-xl border border-[#c7d2fe] bg-white px-6 py-16 shadow-sm">
                                <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#6366f2] border-t-transparent" />
                                <p className="text-sm font-semibold text-[#5a4d6e]">Memuat status matching...</p>
                            </div>
                        ) : matching.state === 'searching' ? (
                            <SearchingView
                                busy={busyAction === 'cancel'}
                                message={matching.message}
                                onCancel={cancelSearch}
                                startedAt={matching.queue?.started_at}
                            />
                        ) : (
                            <div>
                                <GameOptions 
                                    busyAction={busyAction} 
                                    onStartRandom={startSearch} 
                                    onNavigate={onNavigate} 
                                />
                                <OnlineMatchBanner 
                                    onStartRandom={startSearch} 
                                />
                            </div>
                        )}
                    </div>

                    <aside>
                        <RecommendationPanel onFriendRequestChanged={onFriendRequestChanged} />
                    </aside>
                </div>
            )}

            {error ? (
                <div className="rounded-lg border border-[#e7a08d] bg-[#fff3ef] px-5 py-4 text-sm font-semibold text-[#a53f2b]">
                    {error}
                </div>
            ) : null}
        </div>
    );
}
