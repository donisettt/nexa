import React from 'react';

export default function StateBlock({ icon: Icon, message, title, tone }) {
    const toneClass = {
        amber: 'bg-[#f7ead6] text-[#9a5a17]',
        blue: 'bg-[#ede5ff] text-[#6366f2]',
        green: 'bg-[#ede5ff] text-[#6366f2]',
    }[tone];

    return (
        <div className="rounded-md border border-[#c7d2fe] bg-white p-4">
            <div className="flex items-start gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
                    <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                    <h3 className="text-lg font-black text-[#1e1033]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#7c6b97]">{message}</p>
                </div>
            </div>
        </div>
    );
}
