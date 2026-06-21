import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, UserPlus, Check, Users, Navigation, AlertCircle } from 'lucide-react';
import { readErrorMessage } from '../../utils/helpers';

/* ─── Recommendation Card ─────────────────────────────────────── */
function RecommendationCard({ user, onSendRequest, sentIds }) {
    const sent = sentIds.has(user.id);

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-4 py-3 transition hover:bg-white">
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e0e7ff] ring-1 ring-[#c7d2fe]">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <Users size={20} className="text-[#6366f2]" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#1e1033]">{user.name}</p>
                    <p className="truncate text-xs text-[#7c6b97]">{user.email}</p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {user.distance != null ? (
                    <span className="inline-flex h-7 items-center rounded-md bg-[#e0e7ff] px-2 text-xs font-bold text-[#6366f2]">
                        {user.distance} km
                    </span>
                ) : null}
                {sent ? (
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#e0e7ff] px-3 text-xs font-bold text-[#6366f2]">
                        <Check size={14} /> Terkirim
                    </span>
                ) : (
                    <button
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#6366f2] px-3 text-xs font-bold text-white transition hover:bg-[#4f46e5]"
                        onClick={() => onSendRequest(user.id)}
                        type="button"
                    >
                        <UserPlus size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─── Location Status Bar ─────────────────────────────────────── */
function LocationStatusBar({ status, onRetry }) {
    if (status === 'requesting') {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-4 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#6366f2] border-t-transparent" />
                <p className="text-sm font-semibold text-[#5a4d6e]">Meminta izin akses lokasi...</p>
            </div>
        );
    }

    if (status === 'granted') {
        return (
            <div className="flex items-center gap-2.5 rounded-lg border border-[#c4b0e0] bg-[#e0e7ff] px-4 py-2.5">
                <MapPin size={16} className="text-[#6366f2]" />
                <p className="text-sm font-bold text-[#6366f2]">Lokasi terdeteksi</p>
            </div>
        );
    }

    if (status === 'denied') {
        return (
            <div className="flex items-center gap-2.5 rounded-lg border border-[#e7a08d] bg-[#fff3ef] px-4 py-2.5">
                <AlertCircle size={16} className="text-[#a53f2b]" />
                <p className="text-sm font-bold text-[#a53f2b]">Akses lokasi ditolak</p>
                <button
                    className="ml-auto text-xs font-bold text-[#6366f2] underline"
                    onClick={onRetry}
                    type="button"
                >
                    Coba lagi
                </button>
            </div>
        );
    }

    // error / unavailable
    return (
        <div className="flex items-center gap-2.5 rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-4 py-2.5">
            <Navigation size={16} className="text-[#9a8fb0]" />
            <p className="text-sm font-semibold text-[#7c6b97]">Lokasi tidak tersedia</p>
            <button
                className="ml-auto text-xs font-bold text-[#6366f2] underline"
                onClick={onRetry}
                type="button"
            >
                Coba lagi
            </button>
        </div>
    );
}

/* ═══ Main Panel ═══════════════════════════════════════════════ */
export default function RecommendationPanel({ onFriendRequestChanged }) {
    const [users, setUsers] = useState([]);
    const [locationStatus, setLocationStatus] = useState('requesting');
    const [loading, setLoading] = useState(true);
    const [sentIds, setSentIds] = useState(new Set());
    const [error, setError] = useState('');

    const loadRecommendations = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await window.axios.get('/friends/recommendations');
            setUsers(data.users || []);
            setError('');
        } catch (err) {
            setError(readErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationStatus('error');
            loadRecommendations();
            return;
        }

        setLocationStatus('requesting');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await window.axios.post('/friends/update-location', {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLocationStatus('granted');
                } catch (err) {
                    setLocationStatus('error');
                }
                loadRecommendations();
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setLocationStatus('denied');
                } else {
                    setLocationStatus('error');
                }
                loadRecommendations();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    }, [loadRecommendations]);

    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    const handleSendRequest = async (userId) => {
        setError('');
        try {
            await window.axios.post('/friends/request', { user_id: userId });
            setSentIds((prev) => new Set(prev).add(userId));
            onFriendRequestChanged?.();
        } catch (err) {
            setError(readErrorMessage(err));
        }
    };

    return (
        <section className="rounded-xl border border-[#c7d2fe] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-black text-[#1e1033]">Rekomendasi Teman</h2>
                    <p className="mt-1 text-sm text-[#7c6b97]">Pengguna terdekat di sekitarmu.</p>
                </div>
                <span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-black text-[#6366f2]">
                    {users.length}
                </span>
            </div>

            <div className="mt-4">
                <LocationStatusBar status={locationStatus} onRetry={requestLocation} />
            </div>

            <div className="mt-4 space-y-2 max-h-[440px] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center gap-3 rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-4 py-3">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#6366f2] border-t-transparent" />
                        <p className="text-sm font-semibold text-[#5a4d6e]">Memuat rekomendasi...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="rounded-lg border border-[#c7d2fe] bg-[#eef2ff] px-4 py-8 text-center">
                        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#9a8fb0] ring-1 ring-[#c7d2fe]">
                            <Users size={20} />
                        </span>
                        <p className="mt-3 text-sm font-bold text-[#1e1033]">Tidak ada rekomendasi</p>
                        <p className="mt-1 text-xs text-[#7c6b97]">
                            {locationStatus === 'granted'
                                ? 'Tidak ada pengguna lain dalam jangkauan.'
                                : 'Belum ada pengguna lain yang tersedia.'}
                        </p>
                    </div>
                ) : (
                    users.map((u) => (
                        <RecommendationCard
                            key={u.id}
                            onSendRequest={handleSendRequest}
                            sentIds={sentIds}
                            user={u}
                        />
                    ))
                )}
            </div>

            {error ? (
                <div className="mt-3 rounded-md border border-[#e7a08d] bg-[#fff3ef] px-4 py-2.5 text-sm font-semibold text-[#a53f2b]">
                    {error}
                </div>
            ) : null}
        </section>
    );
}
