import { useCallback, useEffect, useRef, useState } from 'react';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
    ],
};

/* ─── SDP base64 helpers (protect newlines during transport) ── */
const encodeSdp = (sdpObj) => btoa(unescape(encodeURIComponent(JSON.stringify({ type: sdpObj.type, sdp: sdpObj.sdp }))));
const decodeSdp = (b64) => JSON.parse(decodeURIComponent(escape(atob(b64))));

/**
 * useWebRTC - Manages a WebRTC peer connection for voice/video calls.
 *
 * @param {object} params
 * @param {number}   params.matchId       - MatchSession ID (for signaling route)
 * @param {number}   params.myUserId      - Authenticated user's ID
 * @param {object}   params.echoChannel   - Laravel Echo private channel already subscribed
 */
export default function useWebRTC({ matchId, myUserId, echoChannel }) {
    // 'idle' | 'calling' | 'ringing' | 'active' | 'ended'
    const [callState, setCallState] = useState('idle');
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callMode, setCallMode] = useState('audio'); // 'audio' | 'video'

    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    // Buffer ALL remote ICE candidates until remoteDescription is set
    const pendingCandidates = useRef([]);
    const endCallRef = useRef(() => {});
    // Buffer ICE candidates generated locally before answer arrives (caller side)
    const localCandidateBuffer = useRef([]);
    const remoteDescSet = useRef(false);

    /* ─── Signaling helper ─────────────────────────────────── */
    const sendSignal = useCallback(async (type, payload = {}) => {
        try {
            const { data } = await window.axios.post(`/matching/${matchId}/call-signal`, { type, payload });
            if (data?.ok === false) {
                console.warn('Signal relay failed on server:', data?.message);
                return false;
            }
            return true;
        } catch (err) {
            console.warn(`Failed to send signal "${type}":`, err?.response?.data?.message || err.message);
            return false;
        }
    }, [matchId]);

    /* ─── Get user media ───────────────────────────────────── */
    const getMedia = useCallback(async (mode) => {
        try {
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
                video: mode === 'video' ? { width: 640, height: 480 } : false,
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('getUserMedia error:', err);
            alert('Gagal mengakses Mikrofon. Pastikan izin browser telah diberikan dan tidak ada aplikasi lain yang menggunakan mikrofon.');
            throw err;
        }
    }, []);

    /* ─── Create peer connection ───────────────────────────── */
    const createPeer = useCallback((stream) => {
        // Close any existing peer first
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }

        const pc = new RTCPeerConnection(STUN_SERVERS);

        // Add all local tracks to the connection
        stream.getTracks().forEach((track) => {
            console.log('[WebRTC] Adding local track:', track.kind);
            pc.addTrack(track, stream);
        });

        // When we receive remote tracks — this is where the audio comes from
        pc.ontrack = (event) => {
            console.log('[WebRTC] Remote track received:', event.track.kind, event.streams);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            } else {
                // Fallback: create a new stream from the track
                const stream = new MediaStream([event.track]);
                setRemoteStream(stream);
            }
        };

        // Send ICE candidates to the remote peer via signaling
        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                console.log('[WebRTC] Sending ICE candidate');
                sendSignal('ice-candidate', { candidate: candidate.toJSON() });
            }
        };

        pc.onicegatheringstatechange = () => {
            console.log('[WebRTC] ICE gathering state:', pc.iceGatheringState);
        };

        pc.oniceconnectionstatechange = () => {
            console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                console.log('[WebRTC] ✅ Peers connected!');
                setCallState('active');
            }
            if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
                console.warn('[WebRTC] Connection lost:', pc.iceConnectionState);
                endCallRef.current();
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[WebRTC] Connection state:', pc.connectionState);
        };

        peerRef.current = pc;
        remoteDescSet.current = false;
        return pc;
    }, [sendSignal]);

    /* ─── Apply buffered remote ICE candidates ─────────────── */
    const flushPendingCandidates = useCallback(async () => {
        const pc = peerRef.current;
        if (!pc || !remoteDescSet.current) return;
        console.log('[WebRTC] Flushing', pendingCandidates.current.length, 'buffered ICE candidates');
        for (const c of pendingCandidates.current) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch (err) {
                console.warn('[WebRTC] Failed to add buffered candidate:', err.message);
            }
        }
        pendingCandidates.current = [];
    }, []);

    /* ─── Initiate a call (caller side) ────────────────────── */
    const startCall = useCallback(async (mode = 'audio') => {
        if (callState !== 'idle') return;
        setCallMode(mode);
        setCallState('calling');

        try {
            const stream = await getMedia(mode);
            const pc = createPeer(stream);

            // Create offer and send it bundled with the call-request signal
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: mode === 'video',
            });
            await pc.setLocalDescription(offer);
            console.log('[WebRTC] Offer created and local description set');

            const sent = await sendSignal('call-request', {
                mode,
                sdp: encodeSdp(offer),
            });

            if (!sent) {
                console.warn('[WebRTC] Failed to send call-request signal');
                endCallRef.current(false);
            }
        } catch (err) {
            console.error('[WebRTC] Error starting call:', err);
            endCallRef.current(false);
        }
    }, [callState, getMedia, createPeer, sendSignal]);

    /* ─── Accept incoming call (callee side) ───────────────── */
    const acceptCall = useCallback(async (incomingMode, encodedSdp) => {
        setCallMode(incomingMode);
        setCallState('active');

        try {
            const stream = await getMedia(incomingMode);
            const pc = createPeer(stream);

            // Set the remote offer as remote description
            const offerSdp = decodeSdp(encodedSdp);
            console.log('[WebRTC] Setting remote description (offer)');
            await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
            remoteDescSet.current = true;

            // Flush any ICE candidates that arrived before we set the remote desc
            await flushPendingCandidates();

            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('[WebRTC] Answer created and local description set');

            await sendSignal('answer', { sdp: encodeSdp(answer) });
        } catch (err) {
            console.error('[WebRTC] Error accepting call:', err);
            endCallRef.current();
        }
    }, [getMedia, createPeer, sendSignal, flushPendingCandidates]);

    /* ─── End / reject call ────────────────────────────────── */
    const endCall = useCallback((sendHangup = true) => {
        if (sendHangup) sendSignal('hang-up');

        peerRef.current?.close();
        peerRef.current = null;

        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;

        setLocalStream(null);
        setRemoteStream(null);
        setCallState('idle');
        setIsMuted(false);
        setIsVideoOff(false);
        pendingCandidates.current = [];
        localCandidateBuffer.current = [];
        remoteDescSet.current = false;
    }, [sendSignal]);

    // Keep the stable ref in sync so other callbacks can call endCall safely
    endCallRef.current = endCall;

    /* ─── Toggle mute ──────────────────────────────────────── */
    const toggleMute = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        stream.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
        setIsMuted((prev) => !prev);
    }, []);

    /* ─── Toggle video ─────────────────────────────────────── */
    const toggleVideo = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        stream.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
        setIsVideoOff((prev) => !prev);
    }, []);

    /* ─── Handle incoming signals ──────────────────────────── */
    useEffect(() => {
        if (!echoChannel) return;

        let pendingMode = 'audio';

        const onSignal = async (e) => {
            console.log('[WebRTC] Signal received:', e.type, 'from user:', e.fromUserId);

            // Ignore own signals (loose equality in case of string vs int)
            if (e.fromUserId == myUserId) return;

            const { type, payload } = e;

            if (type === 'call-request') {
                pendingMode = payload.mode ?? 'audio';
                setCallMode(pendingMode);
                // Store encoded offer for when user accepts
                if (payload.sdp) {
                    window.__pendingCallOffer = { sdp: payload.sdp, mode: pendingMode };
                }
                setCallState('ringing');
            }

            // Caller receives the answer from callee
            if (type === 'answer' && peerRef.current && payload.sdp) {
                try {
                    console.log('[WebRTC] Received answer, setting remote description');
                    const answerSdp = decodeSdp(payload.sdp);
                    await peerRef.current.setRemoteDescription(
                        new RTCSessionDescription(answerSdp)
                    );
                    remoteDescSet.current = true;
                    // Flush any ICE candidates buffered before answer arrived
                    await flushPendingCandidates();
                    setCallState('active');
                } catch (err) {
                    console.error('[WebRTC] Failed to apply remote answer SDP:', err);
                    endCallRef.current();
                }
            }

            // ICE candidate received — buffer if remote desc not yet set
            if (type === 'ice-candidate' && payload.candidate) {
                if (peerRef.current && remoteDescSet.current) {
                    try {
                        console.log('[WebRTC] Adding ICE candidate immediately');
                        await peerRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
                    } catch (err) {
                        console.warn('[WebRTC] Failed to add ICE candidate:', err.message);
                    }
                } else {
                    console.log('[WebRTC] Buffering ICE candidate (remote desc not set yet)');
                    pendingCandidates.current.push(payload.candidate);
                }
            }

            if (type === 'hang-up') {
                endCall(false);
            }
        };

        echoChannel.listen('CallSignal', onSignal);

        return () => {
            echoChannel.stopListening('CallSignal');
        };
    }, [echoChannel, myUserId, endCall, flushPendingCandidates]);

    return {
        callState,
        callMode,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        startCall,
        acceptCall,
        endCall,
        toggleMute,
        toggleVideo,
    };
}
