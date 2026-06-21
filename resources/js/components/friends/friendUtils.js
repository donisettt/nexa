import { Check, UserPlus } from 'lucide-react';

export function getFriendButtonState(friendship, busy) {
    if (busy) {
        return {
            action: null,
            className: 'bg-[#eef1ef] text-[#60777b]',
            disabled: true,
            icon: UserPlus,
            label: 'Memproses...',
        };
    }

    if (friendship?.status === 'accepted') {
        return {
            action: null,
            className: 'bg-[#eef6f3] text-[#0f7d61]',
            disabled: true,
            icon: Check,
            label: 'Teman',
        };
    }

    if (friendship?.status === 'pending' && friendship.requested_by_me) {
        return {
            action: null,
            className: 'bg-[#eef1ef] text-[#60777b]',
            disabled: true,
            icon: UserPlus,
            label: 'Terkirim',
        };
    }

    if (friendship?.status === 'pending') {
        return {
            action: 'accept',
            className: 'bg-[#0b4b49] text-white hover:bg-[#083c3a]',
            disabled: false,
            icon: Check,
            label: 'Konfirmasi Pertemanan',
        };
    }

    return {
        action: 'request',
        className: 'bg-[#0b4b49] text-white hover:bg-[#083c3a]',
        disabled: false,
        icon: UserPlus,
    };
}
