import React from 'react';
import { Lock } from 'lucide-react';

export default function AnonymousCard() {
    return (
        <section className="rounded-lg border border-[#c7d2fe] bg-white p-4 shadow-sm">
            <div className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff] text-[#3d2a5c]">
                    <Lock size={19} aria-hidden="true" />
                </span>
                <div>
                    <h2 className="text-sm font-black text-[#1e1033]">Anonim sampai kamu memilih</h2>
                    <p className="mt-1 text-sm leading-6 text-[#7c6b97]">
                        Identitas asli kamu tidak akan pernah dibagikan ke pengguna lain.
                    </p>
                </div>
            </div>
        </section>
    );
}
