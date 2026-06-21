import React from 'react';

export default function FormShell({ children, description, onSubmit, submitIcon: SubmitIcon, submitLabel, submitting, title }) {
    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <div>
                <h2 className="text-2xl font-black text-[#1e1033]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#7c6b97]">{description}</p>
            </div>

            {children}

            <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#6366f2] px-4 text-sm font-bold text-white transition hover:bg-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submitting}
                type="submit"
            >
                <SubmitIcon size={18} aria-hidden="true" />
                {submitting ? 'Memproses...' : submitLabel}
            </button>
        </form>
    );
}
