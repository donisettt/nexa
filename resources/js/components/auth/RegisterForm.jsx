import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import TextField from '../ui/TextField';
import { readErrors, setFormValue, syncCsrfToken } from '../../utils/helpers';

const blankRegister = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
        </svg>
    );
}

export default function RegisterForm({ onAuthenticated, onNavigate }) {
    const [form, setForm] = useState(blankRegister);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const { data } = await window.axios.post('/auth/register', form);
            syncCsrfToken(data.csrf_token);
            onAuthenticated(data.user);
        } catch (error) {
            setErrors(readErrors(error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="w-full space-y-5" onSubmit={submit}>
            {/* Google Registration Button */}
            <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-sm font-semibold text-[#1e1033] shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6366f2]/20"
                onClick={() => alert('Fitur Google Login belum diintegrasikan di backend.')}
            >
                <GoogleIcon />
                <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-[#e2e8f0]"></div>
                <span className="mx-4 shrink-0 text-xs text-[#9a8fb0]">or continue with email</span>
                <div className="flex-grow border-t border-[#e2e8f0]"></div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                <TextField
                    error={errors.name}
                    icon={User}
                    placeholder="Name"
                    name="name"
                    onChange={setFormValue(setForm)}
                    value={form.name}
                />
                <TextField
                    error={errors.email}
                    icon={Mail}
                    placeholder="Email"
                    name="email"
                    onChange={setFormValue(setForm)}
                    type="email"
                    value={form.email}
                />
                <TextField
                    error={errors.password}
                    icon={Lock}
                    placeholder="Password"
                    name="password"
                    onChange={setFormValue(setForm)}
                    type="password"
                    value={form.password}
                />
                <TextField
                    error={errors.password_confirmation}
                    icon={Lock}
                    placeholder="Confirm Password"
                    name="password_confirmation"
                    onChange={setFormValue(setForm)}
                    type="password"
                    value={form.password_confirmation}
                />
            </div>

            {/* Submit Button */}
            <button
                className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#6366f2] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#4f46e5] focus:outline-none focus:ring-4 focus:ring-[#6366f2]/20 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submitting}
                type="submit"
            >
                {submitting ? 'Processing...' : 'Create Account'}
            </button>

            {/* Switch to Login */}
            <div className="pt-2 text-center text-xs text-[#7c6b97]">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={() => onNavigate('/login')}
                    className="font-semibold text-[#6366f2] hover:underline focus:outline-none"
                >
                    Log in
                </button>
            </div>
        </form>
    );
}
