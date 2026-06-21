import React, { useEffect, useRef } from 'react';
import {
    Mic,
    MicOff,
    Phone,
    PhoneCall,
    PhoneIncoming,
    PhoneMissed,
    PhoneOff,
    Video,
    VideoOff,
} from 'lucide-react';

/* ─── Video element ─────────────────────────────────────────── */
function VideoBox({ stream, muted = false, label, className = '' }) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-[#1a1040] ${className}`}>
            {stream ? (
                <video
                    autoPlay
                    className="h-full w-full object-cover"
                    muted={muted}
                    playsInline
                    ref={videoRef}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#3d2a5c] text-[#c4b0e0]">
                        <PhoneCall size={36} />
                    </span>
                </div>
            )}
            {label ? (
                <span className="absolute bottom-2 left-3 rounded-md bg-black/50 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {label}
                </span>
            ) : null}
        </div>
    );
}

/* ─── Incoming Call UI ──────────────────────────────────────── */
export function IncomingCallModal({ callMode, partnerAlias, onAccept, onReject }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm animate-[scale-in_0.2s_ease-out] rounded-3xl bg-white p-8 text-center shadow-2xl">
                <span className="relative mx-auto flex h-24 w-24 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#e0e7ff] opacity-60" />
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#6366f2] text-white shadow-lg shadow-[#6366f2]/30">
                        <Phone size={36} />
                    </span>
                </span>

                <h2 className="mt-5 text-xl font-black text-[#1e1033]">{partnerAlias || 'Teman Anonim'}</h2>
                <p className="mt-1 text-sm text-[#7c6b97]">
                    {callMode === 'video' ? 'Video Call Masuk' : 'Panggilan Suara Masuk'}
                </p>

                <div className="mt-8 flex justify-center gap-8">
                    {/* Reject */}
                    <button
                        className="flex flex-col items-center gap-2"
                        onClick={onReject}
                        type="button"
                    >
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e53e3e] text-white shadow-lg transition hover:bg-[#c53030]">
                            <PhoneOff size={28} />
                        </span>
                        <span className="text-xs font-bold text-[#7c6b97]">Tolak</span>
                    </button>

                    {/* Accept */}
                    <button
                        className="flex flex-col items-center gap-2"
                        onClick={onAccept}
                        type="button"
                    >
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e] text-white shadow-lg transition hover:bg-[#16a34a]">
                            <Phone size={28} />
                        </span>
                        <span className="text-xs font-bold text-[#7c6b97]">Terima</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Calling (outbound waiting) UI ────────────────────────── */
export function CallingModal({ partnerAlias, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
                <span className="relative mx-auto flex h-24 w-24 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#e0e7ff] opacity-50" style={{ animationDuration: '1.5s' }} />
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[#6366f2] text-white">
                        <PhoneCall size={36} />
                    </span>
                </span>

                <h2 className="mt-5 text-xl font-black text-[#1e1033]">Memanggil...</h2>
                <p className="mt-1 text-sm text-[#7c6b97]">{partnerAlias || 'Teman Anonim'}</p>

                <button
                    className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#e53e3e] text-white shadow-lg transition hover:bg-[#c53030] mx-auto"
                    onClick={onCancel}
                    type="button"
                >
                    <PhoneOff size={24} />
                </button>
                <p className="mt-2 text-xs text-[#9a8fb0]">Batalkan</p>
            </div>
        </div>
    );
}

/* ─── Audio element for audio-only calls ───────────────────── */
function RemoteAudio({ stream }) {
    const audioRef = useRef(null);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;

        if (stream) {
            console.log('[RemoteAudio] Attaching stream to audio element. Tracks:', stream.getTracks().length);
            el.srcObject = stream;
            // Some browsers require an explicit play() call
            el.play().catch((err) => {
                console.warn('[RemoteAudio] Autoplay blocked, user interaction needed:', err.message);
            });
        } else {
            el.srcObject = null;
        }
    }, [stream]);

    // Always render - never conditionally unmount the audio element
    return (
        <audio
            autoPlay
            playsInline
            ref={audioRef}
            style={{ display: 'none' }}
        />
    );
}

/* ─── Active Call UI ────────────────────────────────────────── */
export function ActiveCallModal({
    callMode,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    partnerAlias,
    onToggleMute,
    onToggleVideo,
    onEndCall,
}) {
    const isVideo = callMode === 'video';

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0920]">
            {/* Hidden audio element for audio-only calls */}
            {!isVideo && <RemoteAudio stream={remoteStream} />}

            {/* ─── Video area ─── */}
            <div className="relative flex-1">
                {/* Remote (main) */}
                <VideoBox
                    className="h-full w-full"
                    label={partnerAlias || 'Teman Anonim'}
                    stream={isVideo ? remoteStream : null}
                />

                {/* Audio only placeholder */}
                {!isVideo && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <span className="flex h-28 w-28 items-center justify-center rounded-full bg-[#6366f2] text-white shadow-xl">
                            <Phone size={48} />
                        </span>
                        <p className="text-xl font-black text-white">{partnerAlias || 'Teman Anonim'}</p>
                        <p className="animate-pulse text-sm font-semibold text-[#c4b0e0]">Panggilan berlangsung...</p>
                    </div>
                )}

                {/* Local (picture-in-picture) */}
                {isVideo && (
                    <div className="absolute bottom-4 right-4 h-32 w-24 shadow-2xl sm:h-40 sm:w-28">
                        <VideoBox
                            className="h-full w-full"
                            label="Saya"
                            muted
                            stream={localStream}
                        />
                    </div>
                )}
            </div>

            {/* ─── Controls bar ─── */}
            <div className="flex items-center justify-center gap-6 bg-[#1a1040] py-6">
                {/* Mute */}
                <button
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition ${
                        isMuted ? 'bg-[#e53e3e] text-white' : 'bg-[#2d1f5e] text-[#c4b0e0] hover:bg-[#3d2a5c]'
                    }`}
                    onClick={onToggleMute}
                    title={isMuted ? 'Aktifkan Mikrofon' : 'Bisukan Mikrofon'}
                    type="button"
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                {/* Video toggle (only in video mode) */}
                {isVideo ? (
                    <button
                        className={`flex h-14 w-14 items-center justify-center rounded-full transition ${
                            isVideoOff ? 'bg-[#e53e3e] text-white' : 'bg-[#2d1f5e] text-[#c4b0e0] hover:bg-[#3d2a5c]'
                        }`}
                        onClick={onToggleVideo}
                        title={isVideoOff ? 'Aktifkan Kamera' : 'Matikan Kamera'}
                        type="button"
                    >
                        {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                    </button>
                ) : null}

                {/* End call */}
                <button
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e53e3e] text-white shadow-lg shadow-red-900/50 transition hover:bg-[#c53030]"
                    onClick={onEndCall}
                    title="Akhiri Panggilan"
                    type="button"
                >
                    <PhoneOff size={28} />
                </button>
            </div>
        </div>
    );
}
