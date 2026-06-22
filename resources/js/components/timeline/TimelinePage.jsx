import React, { useState, useEffect, useCallback } from 'react';
import CreateStatus from './CreateStatus';
import CreateStatusModal from './CreateStatusModal';
import StatusCard from './StatusCard';
import { Loader2, Globe, Users } from 'lucide-react';

const FILTERS = [
    { key: 'all', label: 'Semua', icon: Globe },
    { key: 'friends', label: 'Teman', icon: Users },
];

export default function TimelinePage({ user }) {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);

    const fetchStatuses = useCallback(async (pageNum = 1, append = false, activeFilter = filter) => {
        setLoading(true);
        try {
            const { data } = await window.axios.get(`/statuses?page=${pageNum}&filter=${activeFilter}`);
            if (append) {
                setStatuses(prev => [...prev, ...data.data]);
            } else {
                setStatuses(data.data);
            }
            setHasMore(data.current_page < data.last_page);
        } catch (error) {
            console.error('Failed to fetch statuses:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        setPage(1);
        fetchStatuses(1, false, filter);
    }, [filter]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchStatuses(nextPage, true, filter);
        }
    };

    const handleStatusCreated = (newStatus) => {
        setStatuses(prev => [newStatus, ...prev]);
    };

    const handleStatusDeleted = (statusId) => {
        setStatuses(prev => prev.filter(s => s.id !== statusId));
    };

    const handleFilterChange = (key) => {
        if (key === filter) return;
        setFilter(key);
    };

    return (
        <div className="space-y-5">
            {/* Trigger Card */}
            <CreateStatus user={user} onOpenModal={() => setShowModal(true)} />

            {/* Modal */}
            {showModal && (
                <CreateStatusModal
                    user={user}
                    onCreated={handleStatusCreated}
                    onClose={() => setShowModal(false)}
                />
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-white rounded-xl border border-[#c7d2fe] p-1.5 shadow-sm w-fit">
                {FILTERS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => handleFilterChange(key)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                            filter === key
                                ? 'bg-[#6366f2] text-white shadow-sm'
                                : 'text-[#7c6b97] hover:bg-[#eef2ff] hover:text-[#6366f2]'
                        }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Status List */}
            <div className="space-y-4">
                {statuses.map(status => (
                    <StatusCard
                        key={status.id}
                        status={status}
                        currentUser={user}
                        onDeleted={handleStatusDeleted}
                    />
                ))}

                {loading && (
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-[#6366f2]" />
                    </div>
                )}

                {!loading && hasMore && (
                    <button
                        onClick={handleLoadMore}
                        className="w-full py-3 text-sm font-semibold text-[#6366f2] bg-white border border-[#c7d2fe] rounded-xl hover:bg-[#eef2ff] transition"
                    >
                        Muat Lebih Banyak
                    </button>
                )}

                {!loading && !hasMore && statuses.length > 0 && (
                    <p className="text-center text-sm text-[#7c6b97] py-6">
                        Kamu sudah melihat semua status.
                    </p>
                )}

                {!loading && statuses.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-[#c7d2fe]">
                        <p className="text-[#7c6b97]">
                            {filter === 'friends'
                                ? 'Belum ada status dari teman kamu.'
                                : 'Belum ada status terbaru.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
