import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Clock3,
    Mic,
    MicOff,
    Phone,
    PhoneCall,
    PhoneOff,
    Shield,
    Sparkles,
    Users,
    Video,
    VideoOff,
    XCircle,
} from 'lucide-react';
import { readErrorMessage, formatDateTime } from '../../utils/helpers';
import ActionButton from '../ui/ActionButton';
import useWebRTC from '../../hooks/useWebRTC';

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

/* ─── Video Box ───────────────────────────────────────────────── */
function VideoBox({ stream, muted = false, label, className = '' }) {
    const videoRef = useRef(null);
    useEffect(() => {
        if (videoRef.current && stream) videoRef.current.srcObject = stream;
    }, [stream]);
    return (
        <div className={`relative overflow-hidden rounded-2xl bg-[#1a1040] ${className}`}>
            {stream ? (
                <video autoPlay muted={muted} playsInline ref={videoRef} className="h-full w-full object-cover" />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#3d2a5c] text-[#c4b0e0]">
                        <PhoneCall size={40} />
                    </span>
                </div>
            )}
            {label && (
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    {label}
                </span>
            )}
        </div>
    );
}

/* ─── Remote Audio (for audio-only mode) ──────────────────────── */
function RemoteAudio({ stream }) {
    const audioRef = useRef(null);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;

        if (stream) {
            el.srcObject = stream;
            el.play().catch(err => console.warn('[RemoteAudio] Autoplay blocked:', err));
        } else {
            el.srcObject = null;
        }
    }, [stream]);

    return (
        <audio autoPlay playsInline ref={audioRef} style={{ display: 'none' }} />
    );
}

/* ─── Idle Hero (Call Mode) ───────────────────────────────────── */
function CallIdleHero({ busy, onStart }) {
    return (
        <div className="relative overflow-hidden rounded-xl border border-[#c7d2fe] bg-gradient-to-br from-[#1e1033] via-[#2d1f5e] to-[#1e1033] px-6 py-12 text-center shadow-lg sm:px-10 sm:py-16">
            {/* Decorative circles */}
            <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#6366f2]/20 blur-2xl" />
            <span className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#22c55e]/10 blur-2xl" />

            <span className="relative mx-auto flex h-24 w-24 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#6366f2]/20" style={{ animationDuration: '2.5s' }} />
                <span className="absolute inset-2 animate-ping rounded-full bg-[#6366f2]/15" style={{ animationDuration: '2.5s', animationDelay: '0.6s' }} />
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f2] to-[#4f46e5] text-white shadow-2xl shadow-[#6366f2]/30">
                    <Phone size={40} />
                </span>
            </span>

            <h2 className="mt-6 text-2xl font-black text-white sm:text-3xl">
                Cari Teman via Telepon
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#c4b0e0]">
                Masuk ke antrian voice call dan temukan teman ngobrol anonim secara spontan melalui suara.
            </p>

            <div className="mt-8 flex justify-center">
                <button
                    className="inline-flex h-14 items-center gap-3 rounded-xl bg-gradient-to-r from-[#6366f2] to-[#4f46e5] px-8 py-3.5 text-base font-black text-white shadow-xl shadow-[#6366f2]/30 transition hover:from-[#4f46e5] hover:to-[#3730a3] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={busy}
                    onClick={onStart}
                    type="button"
                >
                    <Phone size={22} />
                    {busy ? 'Memproses...' : 'Mulai Panggilan Random'}
                </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#c4b0e0]/70">
                <span className="flex items-center gap-1.5"><Shield size={13} /> Anonim & Aman</span>
                <span className="h-3 w-px bg-[#6366f2]/30" />
                <span className="flex items-center gap-1.5"><Sparkles size={13} /> Matching Otomatis</span>
                <span className="h-3 w-px bg-[#6366f2]/30" />
                <span className="flex items-center gap-1.5"><Phone size={13} /> Voice Realtime</span>
            </div>
        </div>
    );
}

/* ─── Searching View (Call Mode) ──────────────────────────────── */
function CallSearchingView({ startedAt, busy, onCancel }) {
    const elapsed = useElapsedTimer(startedAt);
    return (
        <div className="rounded-xl border border-[#c7d2fe] bg-gradient-to-br from-[#1e1033] via-[#2d1f5e] to-[#1e1033] p-8 text-center shadow-lg">
            <span className="relative mx-auto flex h-32 w-32 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#6366f2]/20" style={{ animationDuration: '1.8s' }} />
                <span className="absolute inset-3 animate-ping rounded-full bg-[#6366f2]/15" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }} />
                <span className="absolute inset-6 animate-ping rounded-full bg-[#6366f2]/10" style={{ animationDuration: '1.8s', animationDelay: '1s' }} />
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f2] to-[#4f46e5] text-white shadow-2xl shadow-[#6366f2]/40">
                    <Phone size={36} className="animate-pulse" />
                </span>
            </span>

            <h2 className="mt-6 animate-pulse text-2xl font-black text-white" style={{ animationDuration: '2s' }}>
                Mencari Teman...
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c4b0e0]">
                Sedang mencari teman anonim untuk telepon bersama. Harap tunggu sebentar.
            </p>

            {startedAt && (
                <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-[#3d2a5c] px-5 py-3 font-mono text-lg font-black text-[#c4b0e0] shadow-inner">
                    <Clock3 size={18} className="animate-pulse text-[#6366f2]" />
                    <span className="text-xs font-bold uppercase tracking-wide opacity-70">Waktu Menunggu</span>
                    <span className="min-w-[80px] text-center tabular-nums text-white">{elapsed}</span>
                </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-1.5">
                {[0, 150, 300].map(delay => (
                    <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-[#6366f2]" style={{ animationDelay: `${delay}ms` }} />
                ))}
            </div>

            <div className="mt-6 flex justify-center">
                <ActionButton busy={busy} icon={XCircle} label="Batalkan Pencarian" onClick={onCancel} tone="muted" />
            </div>
        </div>
    );
}

/* ─── Active Call View (Matched) ──────────────────────────────── */
function ActiveCallView({ match, user, echoChannel, onEndSession, busy }) {
    const {
        callState, callMode, localStream, remoteStream,
        isMuted, isVideoOff,
        startCall, acceptCall, endCall, toggleMute, toggleVideo,
    } = useWebRTC({ matchId: match.id, myUserId: user.id, echoChannel });

    const callElapsed = useElapsedTimer(match.started_at);
    const isVideo = callMode === 'video';
    const hasCalledRef = useRef(false);

    // Auto-start voice call when matched
    useEffect(() => {
        if (callState === 'idle' && echoChannel && !hasCalledRef.current) {
            hasCalledRef.current = true;
            // Small delay to let both users subscribe to channel
            const t = setTimeout(() => startCall('audio'), 1500);
            return () => clearTimeout(t);
        }
    }, [callState, echoChannel, startCall]);

    // Handle incoming call when receiver
    const handleAcceptCall = useCallback(() => {
        const pending = window.__pendingCallOffer;
        if (pending) {
            acceptCall(pending.mode, pending.sdp);
            window.__pendingCallOffer = null;
        }
    }, [acceptCall]);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl bg-[#0d0920]">
            {/* ─── Header Info ─── */}
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3d2a5c] text-[#c4b0e0]">
                        <Users size={20} />
                    </span>
                    <div>
                        <p className="text-sm font-black text-white">{match.partner_alias || 'Teman Anonim'}</p>
                        <p className="text-xs font-semibold text-[#c4b0e0]">
                            {callState === 'active' ? `${callElapsed} • Sedang berlangsung` : callState === 'calling' ? 'Memanggil...' : callState === 'ringing' ? 'Ada panggilan masuk...' : 'Menghubungkan...'}
                        </p>
                    </div>
                </div>
                <button
                    className="h-9 rounded-lg bg-[#e53e3e]/80 px-4 text-xs font-bold text-white transition hover:bg-[#e53e3e] disabled:opacity-60"
                    disabled={busy}
                    onClick={onEndSession}
                    type="button"
                >
                    {busy ? 'Mengakhiri...' : 'Akhiri Sesi'}
                </button>
            </div>

            {/* ─── Video / Audio Area ─── */}
            <div className="relative flex-1">
                {!isVideo && <RemoteAudio stream={remoteStream} />}
                {isVideo ? (
                    <>
                        <VideoBox className="h-full w-full" label={match.partner_alias} stream={remoteStream} />
                        <div className="absolute bottom-4 right-4 h-36 w-28 shadow-2xl">
                            <VideoBox className="h-full w-full" label="Saya" muted stream={localStream} />
                        </div>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-4">
                        <span className="relative flex h-36 w-36 items-center justify-center">
                            {callState === 'active' && (
                                <>
                                    <span className="absolute inset-0 animate-ping rounded-full bg-[#6366f2]/20" style={{ animationDuration: '2s' }} />
                                    <span className="absolute inset-4 animate-ping rounded-full bg-[#6366f2]/15" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                                </>
                            )}
                            <span className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f2] to-[#4f46e5] shadow-2xl shadow-[#6366f2]/30">
                                <Phone size={56} className="text-white" />
                            </span>
                        </span>
                        <p className="text-2xl font-black text-white">{match.partner_alias || 'Teman Anonim'}</p>
                        {callState === 'active' && (
                            <p className="animate-pulse text-sm font-semibold text-[#c4b0e0]">
                                🎙️ Panggilan berlangsung • {callElapsed}
                            </p>
                        )}
                        {callState === 'calling' && (
                            <p className="animate-pulse text-sm font-semibold text-[#c4b0e0]">Memanggil teman anon...</p>
                        )}
                        {callState === 'ringing' && (
                            <div className="flex gap-4">
                                <button
                                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e53e3e] text-white shadow-lg transition hover:bg-[#c53030]"
                                    onClick={onEndSession}
                                    type="button"
                                >
                                    <PhoneOff size={28} />
                                </button>
                                <button
                                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-lg transition hover:bg-[#16a34a]"
                                    onClick={handleAcceptCall}
                                    type="button"
                                >
                                    <Phone size={28} />
                                </button>
                            </div>
                        )}
                        {callState === 'idle' && (
                            <div className="flex gap-3">
                                <button
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6366f2] text-white shadow-lg"
                                    onClick={() => startCall('audio')}
                                    type="button"
                                    title="Mulai Voice Call"
                                >
                                    <Phone size={24} />
                                </button>
                                <button
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3d2a5c] text-[#c4b0e0] shadow-lg"
                                    onClick={() => startCall('video')}
                                    type="button"
                                    title="Mulai Video Call"
                                >
                                    <Video size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Controls ─── */}
            {callState === 'active' && (
                <div className="flex items-center justify-center gap-5 bg-[#1a1040] py-5">
                    <button
                        className={`flex h-14 w-14 items-center justify-center rounded-full transition ${isMuted ? 'bg-[#e53e3e] text-white' : 'bg-[#2d1f5e] text-[#c4b0e0] hover:bg-[#3d2a5c]'}`}
                        onClick={toggleMute}
                        title={isMuted ? 'Aktifkan Mikrofon' : 'Bisukan'}
                        type="button"
                    >
                        {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>

                    {isVideo && (
                        <button
                            className={`flex h-14 w-14 items-center justify-center rounded-full transition ${isVideoOff ? 'bg-[#e53e3e] text-white' : 'bg-[#2d1f5e] text-[#c4b0e0] hover:bg-[#3d2a5c]'}`}
                            onClick={toggleVideo}
                            title={isVideoOff ? 'Aktifkan Kamera' : 'Matikan Kamera'}
                            type="button"
                        >
                            {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                        </button>
                    )}

                    <button
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e53e3e] text-white shadow-xl shadow-red-900/40 transition hover:bg-[#c53030]"
                        onClick={onEndSession}
                        title="Akhiri Panggilan"
                        type="button"
                    >
                        <PhoneOff size={28} />
                    </button>
                </div>
            )}
        </div>
    );
}

/* ═══ Call Matching Page ══════════════════════════════════════ */
export default function CallMatchingPage({ user }) {
    const [matching, setMatching] = useState({ state: 'loading', mode: 'call' });
    const [busyAction, setBusyAction] = useState(null);
    const [error, setError] = useState('');
    const [echoChannel, setEchoChannel] = useState(null);

    const loadMatching = useCallback(async () => {
        try {
            const { data } = await window.axios.get('/matching/status');
            // If current session is not a call session, treat as idle
            if (data.state === 'matched' && data.match?.mode !== 'call') {
                setMatching({ state: 'idle', mode: 'call' });
            } else {
                setMatching(data);
            }
            setError('');
        } catch (err) {
            setError(readErrorMessage(err));
        }
    }, []);

    useEffect(() => { loadMatching(); }, [loadMatching]);

    useEffect(() => {
        if (!['matched', 'searching'].includes(matching.state)) return undefined;
        const id = setInterval(loadMatching, 3000);
        return () => clearInterval(id);
    }, [loadMatching, matching.state]);

    // Subscribe Echo channel when matched
    useEffect(() => {
        if (matching.state !== 'matched' || !matching.match) {
            setEchoChannel(null);
            return undefined;
        }
        const echo = window.getEcho?.();
        if (!echo) return undefined;

        const channel = echo.private(`match.${matching.match.id}`);
        setEchoChannel(channel);

        return () => {
            channel.stopListening('CallSignal');
            echo.leave(`match.${matching.match.id}`);
            setEchoChannel(null);
        };
    }, [matching.state, matching.match?.id]);

    const runAction = async (action, request) => {
        setBusyAction(action);
        setError('');
        try {
            const { data } = await request();
            setMatching(data);
        } catch (err) {
            setError(readErrorMessage(err));
        } finally {
            setBusyAction(null);
        }
    };

    const startSearch = () => runAction('start', () =>
        window.axios.post('/matching/start', { mode: 'call' })
    );
    const cancelSearch = () => runAction('cancel', () =>
        window.axios.post('/matching/cancel')
    );
    const endMatch = () => runAction('end', () =>
        window.axios.post(`/matching/${matching.match.id}/end`)
    );

    return (
        <div className="space-y-6">
            {/* ─── Page Header ─── */}
            {matching.state !== 'matched' && (
                <section className="flex flex-col gap-4 rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-[#6366f2]">Fitur</p>
                        <h1 className="mt-1 text-2xl font-black leading-tight text-[#1e1033] sm:text-3xl">
                            Cari Teman via Telepon
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#7c6b97]">
                            Temukan teman anonim untuk ngobrol lewat suara secara spontan dan acak.
                        </p>
                    </div>
                    <span className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-black uppercase tracking-wide ${
                        matching.state === 'searching' ? 'bg-[#fff5df] text-[#8a5b12]' : 'bg-[#e0e7ff] text-[#6366f2]'
                    }`}>
                        {matching.state === 'searching' ? 'Mencari' : 'Siap'}
                    </span>
                </section>
            )}

            {/* ─── Content ─── */}
            {matching.state === 'matched' ? (
                <>
                    <style>{`body { overflow: hidden !important; } footer { display: none !important; }`}</style>
                    <div className="h-[calc(100vh-104px)]">
                        <ActiveCallView
                            busy={busyAction === 'end'}
                            echoChannel={echoChannel}
                            match={matching.match}
                            onEndSession={endMatch}
                            user={user}
                        />
                    </div>
                </>
            ) : matching.state === 'loading' ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-[#c7d2fe] bg-white px-6 py-16 shadow-sm">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#6366f2] border-t-transparent" />
                    <p className="text-sm font-semibold text-[#5a4d6e]">Memuat status...</p>
                </div>
            ) : matching.state === 'searching' ? (
                <CallSearchingView
                    busy={busyAction === 'cancel'}
                    onCancel={cancelSearch}
                    startedAt={matching.queue?.started_at}
                />
            ) : (
                <CallIdleHero busy={busyAction === 'start'} onStart={startSearch} />
            )}

            {error && (
                <div className="rounded-lg border border-[#e7a08d] bg-[#fff3ef] px-5 py-4 text-sm font-semibold text-[#a53f2b]">
                    {error}
                </div>
            )}
        </div>
    );
}
