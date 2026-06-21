import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Check, Users } from 'lucide-react';
import { readErrorMessage } from '../../utils/helpers';

export default function NotificationsPage({ onNavigate }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadNotifications = useCallback(async () => {
        try {
            const { data } = await window.axios.get('/notifications');
            setNotifications(data.notifications || []);
        } catch (err) {
            setError(readErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAsRead = async (id) => {
        try {
            await window.axios.post(`/notifications/${id}/mark-read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await window.axios.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }

        if (notification.data.type === 'friend_request_received' || notification.data.type === 'friend_request_accepted') {
            onNavigate('friends');
        }
    };

    const hasUnread = notifications.some(n => !n.read_at);

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-[#1e1033]">Notifikasi</h1>
                    <p className="mt-2 text-[#7c6b97]">Pembaruan aktivitas dan permintaan teman.</p>
                </div>
                {hasUnread && (
                    <button
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#eef2ff] px-4 text-sm font-bold text-[#6366f2] transition hover:bg-[#e0e7ff]"
                        onClick={markAllAsRead}
                        type="button"
                    >
                        <Check size={16} /> Tandai Semua Dibaca
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 rounded-md border border-[#e7a08d] bg-[#fff3ef] px-4 py-3 text-sm font-semibold text-[#a53f2b]">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-[#c7d2fe] bg-white shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e0e7ff] border-t-[#6366f2]" />
                        <p className="mt-4 font-bold text-[#5a4d6e]">Memuat notifikasi...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] text-[#9a8fb0]">
                            <Bell size={32} />
                        </span>
                        <h2 className="mt-4 text-xl font-black text-[#1e1033]">Belum ada notifikasi</h2>
                        <p className="mt-2 max-w-sm text-[#7c6b97]">
                            Kamu belum memiliki notifikasi baru. Aktivitas terbaru akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#e0e7ff]">
                        {notifications.map((notification) => {
                            const isUnread = !notification.read_at;
                            return (
                                <button
                                    key={notification.id}
                                    className={`w-full flex items-start gap-4 p-4 text-left transition hover:bg-[#fafafa] ${
                                        isUnread ? 'bg-[#f5f7ff]' : 'bg-white'
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-[#c7d2fe] bg-[#eef2ff]">
                                        {notification.data.user_avatar ? (
                                            <img src={notification.data.user_avatar} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <Users size={20} className="text-[#6366f2]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <p className={`text-sm ${isUnread ? 'font-bold text-[#1e1033]' : 'font-semibold text-[#5a4d6e]'}`}>
                                            {notification.data.message}
                                        </p>
                                        <p className="mt-1 text-xs text-[#9a8fb0]">
                                            {new Date(notification.created_at).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    {isUnread && (
                                        <div className="flex shrink-0 items-center justify-center pt-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#6366f2]"></span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
