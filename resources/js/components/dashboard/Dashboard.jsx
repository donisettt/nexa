import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Settings, Shield, Users } from 'lucide-react';
import AppSidebar from '../AppSidebar';
import DashboardNavbar from '../DashboardNavbar';
import DashboardFooter from '../DashboardFooter';
import DashboardHero from './DashboardHero';
import StatsCard from './StatsCard';
import ActivityCard from './ActivityCard';
import AnonymousCard from './AnonymousCard';
import MatchingPanel from '../matching/MatchingPanel';
import MatchingPage from '../matching/MatchingPage';
import CallMatchingPage from '../matching/CallMatchingPage';
import DirectChatPanel from '../friends/DirectChatPanel';
import FriendsPanel from '../friends/FriendsPanel';
import MessagesPage from '../messages/MessagesPage';
import ProfilePage from '../profile/ProfilePage';
import NotificationsPage from '../notifications/NotificationsPage';
import BottomNavigation from '../BottomNavigation';

/* ─── Placeholder Page ───────────────────────────────────────── */
function PlaceholderPage({ icon: Icon, title, description }) {
    return (
        <section className="flex flex-col items-center justify-center rounded-xl border border-[#c7d2fe] bg-white px-6 py-20 text-center shadow-sm">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e0e7ff] text-[#6366f2]">
                <Icon size={32} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-black text-[#1e1033]">{title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#7c6b97]">{description}</p>
            <span className="mt-4 inline-flex h-8 items-center rounded-md bg-[#fff5df] px-3 text-xs font-black uppercase tracking-wide text-[#8a5b12]">
                Segera Hadir
            </span>
        </section>
    );
}

/* ─── Friends Full Page ──────────────────────────────────────── */
function FriendsPage({ activeFriendChat, onOpenChat, onBack, friendSummary, refreshKey, user }) {
    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-4 rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[#6366f2]">Fitur</p>
                    <h1 className="mt-1 text-2xl font-black leading-tight text-[#1e1033] sm:text-3xl">
                        Daftar Teman
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#7c6b97]">
                        Kelola daftar teman dan chat langsung dengan teman yang sudah diterima.
                    </p>
                </div>
                <span className="inline-flex h-8 items-center rounded-md bg-[#e0e7ff] px-3 text-xs font-black uppercase tracking-wide text-[#6366f2]">
                    {friendSummary.friends.length} Teman
                </span>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0">
                    {activeFriendChat ? (
                        <DirectChatPanel
                            chat={activeFriendChat}
                            onBack={onBack}
                            user={user}
                        />
                    ) : (
                        <FriendsPageList
                            activeChatId={null}
                            onOpenChat={onOpenChat}
                            onStateChange={() => {}}
                            refreshKey={refreshKey}
                        />
                    )}
                </div>
                <aside className="space-y-5">
                    <div className="rounded-lg border border-[#c7d2fe] bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ede5ff] text-[#6366f2]">
                                <Users size={21} aria-hidden="true" />
                            </span>
                            <div>
                                <h3 className="text-sm font-black text-[#1e1033]">Statistik Teman</h3>
                                <div className="mt-3 space-y-2.5">
                                    <StatRow label="Teman aktif" value={friendSummary.friends.length} />
                                    <StatRow label="Permintaan masuk" value={friendSummary.pending_received.length} />
                                    <StatRow label="Permintaan terkirim" value={friendSummary.pending_sent.length} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <AnonymousCard />
                </aside>
            </div>
        </div>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#7c6b97]">{label}</span>
            <span className="font-black text-[#1e1033]">{value}</span>
        </div>
    );
}

/* A full-page version of the FriendsPanel for the friends page */
function FriendsPageList({ activeChatId, onOpenChat, onStateChange, refreshKey }) {
    return (
        <FriendsPanel
            activeChatId={activeChatId}
            onOpenChat={onOpenChat}
            onStateChange={onStateChange}
            refreshKey={refreshKey}
        />
    );
}

/* ═══ Main Dashboard ═══════════════════════════════════════════ */
export default function Dashboard({ onLogout, user, setUser }) {
    const firstName = useMemo(() => user.name.split(' ')[0], [user.name]);
    const [activeFriendChat, setActiveFriendChat] = useState(null);
    const [friendsRefreshKey, setFriendsRefreshKey] = useState(0);
    const [activeSidebarItem, setActiveSidebarItem] = useState(() => {
        const path = window.location.pathname.replace(/^\/+/, '');
        if (!path || path === 'dashboard') return 'dashboard';
        // Handle cases where there might be sub-paths (though we don't have them yet)
        const item = path.split('/')[0];
        return item;
    });
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
    const [friendSummary, setFriendSummary] = useState({
        friends: [],
        pending_received: [],
        pending_sent: [],
    });
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    const loadUnreadCount = useCallback(async () => {
        try {
            const { data } = await window.axios.get('/notifications');
            setUnreadNotificationCount(data.unread_count || 0);
        } catch (err) {
            // Ignore silently
        }
    }, []);

    useEffect(() => {
        loadUnreadCount();
        const interval = window.setInterval(loadUnreadCount, 5000);
        return () => window.clearInterval(interval);
    }, [loadUnreadCount]);

    const refreshFriends = useCallback(() => {
        setFriendsRefreshKey((current) => current + 1);
    }, []);

    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname.replace(/^\/+/, '');
            const item = path.split('/')[0];
            setActiveSidebarItem(!item || item === 'dashboard' ? 'dashboard' : item);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigateTo = (item) => {
        setActiveSidebarItem(item);
        
        const newUrl = item === 'dashboard' ? '/dashboard' : `/${item}`;
        window.history.pushState({}, '', newUrl);

        if (item === 'matching') {
            setActiveFriendChat(null);
        }

        if (window.innerWidth < 1024 && item !== activeSidebarItem) {
            setSidebarOpen(false);
        }
    };

    const renderContent = () => {
        switch (activeSidebarItem) {
            case 'profile':
                return (
                    <ProfilePage 
                        user={user} 
                        onProfileUpdated={(updatedUser) => {
                            if (setUser) setUser(updatedUser);
                        }}
                        onLogout={onLogout}
                    />
                );

            case 'matching':
                return (
                    <MatchingPage
                        onNavigate={navigateTo}
                        onFriendRequestChanged={refreshFriends}
                        user={user}
                    />
                );

            case 'call-matching':
                return (
                    <CallMatchingPage
                        user={user}
                    />
                );

            case 'friends':
                return (
                    <FriendsPage
                        activeFriendChat={activeFriendChat}
                        friendSummary={friendSummary}
                        onBack={() => {
                            setActiveFriendChat(null);
                            navigateTo('friends');
                        }}
                        onOpenChat={(chat) => {
                            setActiveFriendChat(chat);
                            navigateTo('messages');
                        }}
                        refreshKey={friendsRefreshKey}
                        user={user}
                    />
                );

            case 'messages':
                return (
                    <>
                        <style>{`body { overflow: hidden !important; } footer { display: none !important; }`}</style>
                        <MessagesPage
                            activeFriendChat={activeFriendChat}
                            friendSummary={friendSummary}
                            onBack={() => {
                                setActiveFriendChat(null);
                            }}
                            onOpenChat={(chat) => {
                                setActiveFriendChat(chat);
                            }}
                            refreshKey={friendsRefreshKey}
                            user={user}
                        />
                    </>
                );

            case 'notifications':
                return (
                    <NotificationsPage onNavigate={navigateTo} />
                );

            case 'settings':
                return (
                    <PlaceholderPage
                        icon={Settings}
                        title="Pengaturan"
                        description="Fitur pengaturan akun dan preferensi sedang dalam pengembangan."
                    />
                );

            default: // 'dashboard'
                return (
                    <>
                        <DashboardHero firstName={firstName} user={user} />

                        <StatsCard
                            friendCount={friendSummary.friends.length}
                            pendingCount={friendSummary.pending_received.length}
                            sentCount={friendSummary.pending_sent.length}
                        />

                        <div className="mt-6 grid gap-6 xl:grid-cols-2">
                            <main className="min-w-0 space-y-6">
                                <ActivityCard friendSummary={friendSummary} />
                                
                                <div className="rounded-2xl border border-[#c7d2fe] bg-white p-5 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ede5ff] text-[#6366f2]">
                                            <Shield size={24} aria-hidden="true" />
                                        </span>
                                        <div>
                                            <h2 className="text-sm font-bold text-[#1e1033]">Privasi Terjamin</h2>
                                            <p className="mt-1.5 text-sm leading-relaxed text-[#7c6b97]">
                                                Seluruh sesi chat random bersifat anonim sampai Anda saling memilih untuk berteman. Identitas asli Anda aman bersama Nexa.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </main>

                            <aside className="space-y-6">
                                <div className="min-w-0">
                                    <FriendsPanel
                                        activeChatId={activeFriendChat?.id}
                                        onOpenChat={(chat) => {
                                            setActiveFriendChat(chat);
                                            navigateTo('messages');
                                        }}
                                        onStateChange={setFriendSummary}
                                        refreshKey={friendsRefreshKey}
                                    />
                                </div>
                                <AnonymousCard />
                            </aside>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className={`min-h-screen bg-[#eef2ff] transition-[padding] duration-200 ${sidebarOpen ? 'lg:pl-[252px]' : 'lg:pl-0'}`}>
            <AppSidebar
                activeItem={activeSidebarItem}
                onSelectItem={navigateTo}
                open={sidebarOpen}
            />

            <DashboardNavbar
                onLogout={onLogout}
                onToggleSidebar={() => setSidebarOpen((current) => !current)}
                onSelectProfile={() => navigateTo('profile')}
                onNotificationsClick={() => navigateTo('notifications')}
                unreadNotificationCount={unreadNotificationCount}
                sidebarOpen={sidebarOpen}
                user={user}
            />

            <div className="px-4 pb-24 pt-5 sm:px-6 lg:pb-5 lg:px-8">
                <div className="mx-auto max-w-[1180px]">
                    {renderContent()}

                    <DashboardFooter />
                </div>
            </div>

            <BottomNavigation 
                activeItem={activeSidebarItem}
                onSelectItem={navigateTo}
                notificationCount={friendSummary.pending_received.length}
            />
        </div>
    );
}
