import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Paperclip, Phone, Send, ShieldAlert, Timer, UserRoundCheck, Video, X } from 'lucide-react';
import { readErrorMessage } from '../../utils/helpers';
import { getFriendButtonState } from '../friends/friendUtils';
import { containsBannedWord, findBannedWord } from '../../utils/wordFilter';
import useWebRTC from '../../hooks/useWebRTC';
import { ActiveCallModal, CallingModal, IncomingCallModal } from './CallModal';

/* ─── Message Bubble ─────────────────────────────────────────── */
function MessageBubble({ msg, isMe }) {
    const hasFile = !!msg.file_url;
    const isImage = msg.file_type === 'image';

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[75%] rounded-2xl text-sm shadow-sm ${
                    isMe
                        ? 'bg-[#6366f2] text-white rounded-br-none'
                        : 'bg-white border border-[#c7d2fe] text-[#1f2933] rounded-bl-none'
                }`}
            >
                {/* Image attachment */}
                {hasFile && isImage ? (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                        <img
                            alt={msg.file_name || 'Gambar'}
                            className="max-h-60 w-full rounded-2xl object-cover"
                            loading="lazy"
                            src={msg.file_url}
                        />
                    </a>
                ) : null}

                {/* Non-image file attachment */}
                {hasFile && !isImage ? (
                    <a
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                            isMe ? 'text-white hover:bg-white/10' : 'text-[#1f2933] hover:bg-[#eef2ff]'
                        }`}
                        href={msg.file_url}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        <FileText size={20} className="shrink-0" />
                        <span className="min-w-0 truncate text-xs font-semibold">{msg.file_name || 'File'}</span>
                    </a>
                ) : null}

                {/* Text content */}
                {msg.content ? (
                    <p className="px-4 py-2">{msg.content}</p>
                ) : null}
            </div>
        </div>
    );
}

/* ─── File Preview ───────────────────────────────────────────── */
function FilePreview({ file, onRemove }) {
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    return (
        <div className="flex items-center gap-2 rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-3 py-2">
            {isImage ? (
                <img alt="preview" className="h-10 w-10 rounded-md object-cover" src={previewUrl} />
            ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e0e7ff] text-[#6366f2]">
                    <FileText size={18} />
                </span>
            )}
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#1e1033]">{file.name}</span>
            <button
                className="flex h-6 w-6 items-center justify-center rounded-full text-[#7c6b97] transition hover:bg-[#c7d2fe] hover:text-[#1e1033]"
                onClick={onRemove}
                type="button"
            >
                <X size={14} />
            </button>
        </div>
    );
}

/* ─── Main ChatRoom ──────────────────────────────────────────── */
/* ─── Banned Word Modal ──────────────────────────────────────── */
function BannedWordModal({ word, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff3ef] text-[#e53e3e]">
                        <ShieldAlert size={32} />
                    </span>
                    <h2 className="mt-4 text-lg font-black text-[#1e1033]">Pesan Tidak Diizinkan</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#7c6b97]">
                        Pesanmu mengandung kata tidak sopan{word ? <> (<span className="font-bold text-[#e53e3e]">***</span>)</> : ''}.
                        Nexa mendorong percakapan yang ramah dan saling menghormati.
                    </p>
                    <p className="mt-1 text-xs text-[#9a8fb0]">Harap gunakan bahasa yang sopan dan santun.</p>
                    <button
                        className="mt-5 w-full rounded-xl bg-[#6366f2] py-2.5 text-sm font-bold text-white transition hover:bg-[#4f46e5]"
                        onClick={onClose}
                        type="button"
                    >
                        Oke, Saya Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Countdown Timer Hook ───────────────────────────────────── */
function useCountdown(expiresAt) {
    const [remaining, setRemaining] = React.useState(() => {
        if (!expiresAt) return null;
        return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    });

    React.useEffect(() => {
        if (!expiresAt) return;
        const tick = () => {
            const secs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
            setRemaining(secs);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [expiresAt]);

    return remaining;
}

function formatCountdown(secs) {
    if (secs === null) return null;
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
}

/* ═══ Main ChatRoom ═══════════════════════════════════════════ */
export default function ChatRoom({ allowFriendRequest = false, match, user, onEndSession, onFriendRequestChanged, busy = false }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [friendRequestBusy, setFriendRequestBusy] = useState(false);
    const [friendRequestMessage, setFriendRequestMessage] = useState('');
    const [friendship, setFriendship] = useState(match.friendship ?? null);
    const [bannedWordAlert, setBannedWordAlert] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const echoChannelRef = useRef(null);
    const [echoChannel, setEchoChannel] = useState(null);

    // Countdown for timed random sessions
    const expiresAt = match?.expires_at ?? null;
    const timeRemaining = useCountdown(expiresAt);
    const isNearExpiry = timeRemaining !== null && timeRemaining <= 120 && timeRemaining > 0;
    const isSessionExpiredLocally = timeRemaining !== null && timeRemaining <= 0 && match?.type === 'random';

    const {
        callState, callMode, localStream, remoteStream,
        isMuted, isVideoOff,
        startCall, acceptCall, endCall, toggleMute, toggleVideo,
    } = useWebRTC({ matchId: match.id, myUserId: user.id, echoChannel });

    const loadMessages = useCallback(async () => {
        try {
            const { data } = await window.axios.get(`/matching/${match.id}/messages`);
            setMessages(data);
        } catch (err) {
            console.error('Failed to load messages', err);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    }, [match.id]);

    useEffect(() => {
        loadMessages();

        const echo = window.getEcho?.();

        if (!echo) {
            return undefined;
        }

        const channel = echo.private(`match.${match.id}`)
            .listen('MessageSent', (e) => {
                setMessages((prev) => {
                    if (prev.some(m => m.id === e.message.id)) return prev;
                    return [...prev, e.message];
                });
            });

        echoChannelRef.current = channel;
        setEchoChannel(channel);

        return () => {
            channel.stopListening('MessageSent');
            echo.leave(`match.${match.id}`);
            echoChannelRef.current = null;
            setEchoChannel(null);
        };
    }, [loadMessages, match.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        setFriendship(match.friendship ?? null);
    }, [match.friendship]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedFile) return;
        if (sending) return;

        // ── Word Filter ──────────────────────────────────────────
        if (newMessage.trim() && containsBannedWord(newMessage)) {
            const found = findBannedWord(newMessage);
            setBannedWordAlert(found);
            return;
        }

        setSending(true);

        const formData = new FormData();
        if (newMessage.trim()) formData.append('content', newMessage.trim());
        if (selectedFile) formData.append('file', selectedFile);

        const tempContent = newMessage;
        const tempFile = selectedFile;
        setNewMessage('');
        setSelectedFile(null);

        // Optimistic UI update for text only
        if (!tempFile) {
            const tempId = Date.now();
            setMessages((prev) => [...prev, {
                id: tempId,
                content: tempContent,
                file_url: null,
                file_type: null,
                file_name: null,
                user_id: user.id,
                user,
            }]);
            try {
                const { data } = await window.axios.post(`/matching/${match.id}/messages`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setMessages((prev) => prev.map(m => m.id === tempId ? data : m));
            } catch (err) {
                console.error('Failed to send message', err);
                setMessages((prev) => prev.filter(m => m.id !== tempId));
            }
        } else {
            // With file: wait for server response
            try {
                const { data } = await window.axios.post(`/matching/${match.id}/messages`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setMessages((prev) => [...prev, data]);
            } catch (err) {
                console.error('Failed to send file', err);
            }
        }

        setSending(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    const sendFriendRequest = async () => {
        setFriendRequestBusy(true);
        setFriendRequestMessage('');

        try {
            const { data } = await window.axios.post(`/matching/${match.id}/friend-request`);
            setFriendRequestMessage(data.message || 'Permintaan teman terkirim.');
            setFriendship(data.friendship ?? null);
            onFriendRequestChanged?.();
        } catch (err) {
            setFriendRequestMessage(readErrorMessage(err));
        } finally {
            setFriendRequestBusy(false);
        }
    };

    const acceptFriendRequest = async () => {
        if (!friendship?.id) return;

        setFriendRequestBusy(true);
        setFriendRequestMessage('');

        try {
            await window.axios.post(`/friends/${friendship.id}/accept`);
            setFriendship({ ...friendship, status: 'accepted', requested_by_me: false });
            setFriendRequestMessage('Kalian sudah berteman.');
            onFriendRequestChanged?.();
        } catch (err) {
            setFriendRequestMessage(readErrorMessage(err));
        } finally {
            setFriendRequestBusy(false);
        }
    };

    const friendButtonState = getFriendButtonState(friendship, friendRequestBusy);
    const FriendButtonIcon = friendButtonState.icon;
    const canSend = (newMessage.trim() || selectedFile) && !sending;

    // ─── Accept incoming call with pending offer ───────────────
    const handleAcceptCall = () => {
        const pending = window.__pendingCallOffer;
        if (pending) {
            acceptCall(pending.mode, pending.sdp);
            window.__pendingCallOffer = null;
        } else {
            alert('Sinyal penawaran (offer) panggilan belum lengkap. Silakan coba lagi.');
            endCall();
        }
    };

    return (
        <>
        {bannedWordAlert !== null ? (
            <BannedWordModal word={bannedWordAlert} onClose={() => setBannedWordAlert(null)} />
        ) : null}

        {/* ─── Call Modals ─── */}
        {callState === 'ringing' ? (
            <IncomingCallModal
                callMode={callMode}
                partnerAlias={match?.partner_alias}
                onAccept={handleAcceptCall}
                onReject={() => endCall()}
            />
        ) : null}
        {callState === 'calling' ? (
            <CallingModal
                partnerAlias={match?.partner_alias}
                onCancel={() => endCall()}
            />
        ) : null}
        {callState === 'active' ? (
            <ActiveCallModal
                callMode={callMode}
                localStream={localStream}
                remoteStream={remoteStream}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
                partnerAlias={match?.partner_alias}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onEndCall={() => endCall()}
            />
        ) : null}

        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-[#c7d2fe] bg-[#eef2ff]">
            {/* ─── Chat Header ─── */}
            <div className="flex flex-col gap-3 border-b border-[#c7d2fe] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e0e7ff] ring-1 ring-[#c7d2fe]">
                        {match?.partner_avatar_url ? (
                            <img src={match.partner_avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <UserRoundCheck size={20} className="text-[#6366f2]" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[#1e1033]">{match?.partner_alias || 'Teman Anonim'}</h3>
                        <p className="text-xs font-semibold text-[#6366f2]">Terhubung</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Countdown Timer Badge */}
                    {timeRemaining !== null && match?.type === 'random' && (
                        <div className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-black tabular-nums ${
                            timeRemaining <= 60
                                ? 'bg-[#fff3ef] text-[#a53f2b] animate-pulse'
                                : timeRemaining <= 120
                                ? 'bg-[#fff5df] text-[#8a5b12]'
                                : 'bg-[#eef2ff] text-[#6366f2]'
                        }`}>
                            <Timer size={13} />
                            {formatCountdown(timeRemaining)}
                        </div>
                    )}
                    {allowFriendRequest ? (
                        <button
                            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-75 ${friendButtonState.className}`}
                            disabled={friendButtonState.disabled}
                            onClick={friendButtonState.action === 'accept' ? acceptFriendRequest : sendFriendRequest}
                            type="button"
                        >
                            <FriendButtonIcon size={15} aria-hidden="true" />
                            {friendButtonState.label}
                        </button>
                    ) : null}

                    {/* ─── Call Buttons ─── */}
                    {callState === 'idle' ? (
                        <>
                            <button
                                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-[#6366f2] transition hover:bg-[#e0e7ff]"
                                onClick={() => startCall('audio')}
                                title="Panggilan Suara"
                                type="button"
                            >
                                <Phone size={16} />
                            </button>
                            <button
                                className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef2ff] text-[#6366f2] transition hover:bg-[#e0e7ff]"
                                onClick={() => startCall('video')}
                                title="Video Call"
                                type="button"
                            >
                                <Video size={16} />
                            </button>
                        </>
                    ) : null}

                    {onEndSession ? (
                        <button
                            onClick={onEndSession}
                            disabled={busy}
                            className="h-9 rounded-md bg-white px-3 text-xs font-bold text-[#a25545] ring-1 ring-[#c7d2fe] transition hover:bg-[#fff7f5] disabled:opacity-50"
                            type="button"
                        >
                            {busy ? 'Mengakhiri...' : 'Akhiri Sesi'}
                        </button>
                    ) : null}
                </div>
            </div>

            {/* ─── Near-Expiry Warning Bar ─── */}
            {isNearExpiry && (
                <div className={`border-b px-4 py-2.5 text-sm font-bold flex items-center gap-2 ${
                    timeRemaining <= 60
                        ? 'border-[#fca5a5] bg-[#fff3ef] text-[#a53f2b]'
                        : 'border-[#fde68a] bg-[#fff5df] text-[#8a5b12]'
                }`}>
                    <Timer size={15} className="shrink-0" />
                    <span>
                        {timeRemaining <= 60
                            ? `Kurang dari 1 menit! Segera klik "Tambah Teman" agar chat tidak terputus.`
                            : `Waktu tersisa ${formatCountdown(timeRemaining)} - Tambah teman sekarang untuk melanjutkan chat!`
                        }
                    </span>
                </div>
            )}

            {/* ─── Friend Request Notice ─── */}
            {friendRequestMessage ? (
                <div className="border-b border-[#c7d2fe] bg-white px-4 py-2 text-sm font-semibold text-[#3d2a5c]">
                    {friendRequestMessage}
                </div>
            ) : null}

            {/* ─── Messages List ─── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#6366f2] border-t-transparent" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-[#64727a] py-8">
                        Belum ada pesan. Sapa teman barumu!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} isMe={msg.user_id === user.id} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ─── Input Bar ─── */}
            <div className="border-t border-[#c7d2fe] bg-white">
                {/* File preview strip */}
                {selectedFile ? (
                    <div className="border-b border-[#c7d2fe] px-3 pt-2 pb-1">
                        <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
                    </div>
                ) : null}

                <form onSubmit={sendMessage} className="flex items-center gap-2 p-3">
                    {/* Hidden file input */}
                    <input
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                        className="hidden"
                        id="chat-file-input"
                        onChange={handleFileSelect}
                        ref={fileInputRef}
                        type="file"
                    />

                    {/* Attach button */}
                    <button
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#7c6b97] transition hover:bg-[#eef2ff] hover:text-[#6366f2]"
                        onClick={() => fileInputRef.current?.click()}
                        title="Lampirkan file"
                        type="button"
                    >
                        <Paperclip size={18} />
                    </button>

                    <input
                        className={`flex-1 rounded-lg border px-4 py-2 text-sm outline-none transition ${
                            isSessionExpiredLocally
                                ? 'border-[#e7a08d] bg-[#fff3ef] text-[#a53f2b] cursor-not-allowed'
                                : 'border-[#c7d2fe] bg-[#eef2ff] focus:border-[#6366f2] focus:ring-2 focus:ring-[#6366f2]/15'
                        }`}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={isSessionExpiredLocally ? 'Waktu chat telah habis...' : (selectedFile ? 'Tambah keterangan (opsional)...' : 'Ketik pesan...')}
                        value={newMessage}
                        disabled={isSessionExpiredLocally}
                    />

                    <button
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6366f2] text-white transition hover:bg-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!canSend}
                        type="submit"
                    >
                        {sending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </form>
            </div>
        </div>
        </>
    );
}
