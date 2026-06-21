import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, User as UserIcon, Loader2, ShieldCheck, UserCog, LogOut } from 'lucide-react';
import { readErrorMessage } from '../../utils/helpers';

const MaleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3b82f6]">
        <circle cx="10" cy="14" r="5"/>
        <path d="M13.5 10.5 21 3"/>
        <path d="M16 3h5v5"/>
    </svg>
);

const FemaleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ec4899]">
        <circle cx="12" cy="10" r="5"/>
        <path d="M12 15v7"/>
        <path d="M9 19h6"/>
    </svg>
);

const OtherIcon = () => (
    <span className="text-2xl font-bold text-[#7c6b97] leading-none">-</span>
);

export default function ProfilePage({ user, onProfileUpdated, onLogout }) {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="space-y-6">
            <section className="flex flex-col gap-4 rounded-lg border border-[#c7d2fe] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-[#6366f2]">Pengaturan</p>
                    <h1 className="mt-1 text-2xl font-black leading-tight text-[#1e1033] sm:text-3xl">
                        Profil & Keamanan
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#7c6b97]">
                        Kelola informasi pribadi, foto profil, dan pengaturan kata sandi akun Anda.
                    </p>
                </div>
            </section>

            <section className="rounded-xl border border-[#c7d2fe] bg-white shadow-sm overflow-hidden">
                <div className="flex border-b border-[#eef2ff]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${
                            activeTab === 'general'
                                ? 'border-b-2 border-[#6366f2] text-[#6366f2]'
                                : 'text-[#7c6b97] hover:bg-[#f8faff] hover:text-[#1e1033]'
                        }`}
                    >
                        <UserCog size={18} />
                        Profil Umum
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${
                            activeTab === 'security'
                                ? 'border-b-2 border-[#6366f2] text-[#6366f2]'
                                : 'text-[#7c6b97] hover:bg-[#f8faff] hover:text-[#1e1033]'
                        }`}
                    >
                        <ShieldCheck size={18} />
                        Keamanan
                    </button>
                </div>

                {activeTab === 'general' && (
                    <GeneralProfileTab user={user} onProfileUpdated={onProfileUpdated} />
                )}

                {activeTab === 'security' && (
                    <SecurityTab hasPassword={!!user?.has_password} />
                )}
            </section>

            {onLogout && (
                <div className="flex justify-center pb-6 lg:hidden">
                    <button
                        onClick={onLogout}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#fff0f2] px-6 py-3 text-sm font-black text-[#e53e3e] shadow-sm transition hover:bg-[#ffe4e6] border border-[#fecdd3]"
                        type="button"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

function GeneralProfileTab({ user, onProfileUpdated }) {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar_url || null);
    
    const [formData, setFormData] = useState({
        name: user.name || '',
        gender: user.gender || '',
        avatar: null,
    });
    
    const [status, setStatus] = useState({ state: 'idle', message: '' });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        setFormData(prev => ({ ...prev, avatar: file }));
        if (status.state === 'success') setStatus({ state: 'idle', message: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (status.state === 'success') setStatus({ state: 'idle', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ state: 'submitting', message: '' });
        
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('gender', formData.gender);
            if (formData.avatar) {
                data.append('avatar', formData.avatar);
            }
            
            const response = await window.axios.post('/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            setStatus({ state: 'success', message: response.data.message });
            if (onProfileUpdated) onProfileUpdated(response.data.user);
        } catch (error) {
            setStatus({ state: 'error', message: readErrorMessage(error) });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="divide-y divide-[#eef2ff]">
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 sm:gap-6 text-center sm:text-left">
                <div className="relative group shrink-0 mx-auto sm:mx-0">
                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-[#eef2ff] bg-[#f8faff] flex items-center justify-center">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                        ) : (
                            <UserIcon size={48} className="text-[#a5b4fc]" />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#6366f2] text-white shadow-lg shadow-[#6366f2]/30 transition hover:bg-[#4f46e5] hover:scale-105"
                        title="Ubah Foto Profil"
                    >
                        <Camera size={18} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <h3 className="text-lg font-black text-[#1e1033]">Foto Profil</h3>
                    <p className="mt-1 text-sm text-[#7c6b97]">
                        Gunakan gambar berformat PNG, JPG, atau WEBP. Maksimal ukuran file 2MB.
                    </p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 text-sm font-bold text-[#6366f2] hover:text-[#4f46e5] hover:underline"
                    >
                        Pilih gambar baru
                    </button>
                </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-bold text-[#1e1033]">
                            Nama Tampilan <span className="text-[#e53e3e]">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border border-[#c7d2fe] bg-[#f8faff] px-4 py-3 text-sm font-medium text-[#1e1033] outline-none transition focus:border-[#6366f2] focus:bg-white focus:ring-1 focus:ring-[#6366f2]"
                            placeholder="Masukkan nama tampilan Anda"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-bold text-[#1e1033]">
                            Alamat Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={user.email}
                            disabled
                            className="block w-full rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] px-4 py-3 text-sm font-medium text-[#64748b] cursor-not-allowed outline-none"
                        />
                        <p className="text-xs text-[#94a3b8]">Email tidak dapat diubah saat ini.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#1e1033]">
                        Jenis Kelamin
                    </label>
                    <div className="flex flex-wrap sm:flex-nowrap gap-4">
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#c7d2fe] bg-[#f8faff] px-4 py-4 transition hover:bg-white has-[:checked]:border-[#3b82f6] has-[:checked]:bg-[#eff6ff] has-[:checked]:ring-1 has-[:checked]:ring-[#3b82f6]">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={formData.gender === 'male'}
                                onChange={handleInputChange}
                                className="sr-only"
                            />
                            <MaleIcon />
                        </label>
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#c7d2fe] bg-[#f8faff] px-4 py-4 transition hover:bg-white has-[:checked]:border-[#ec4899] has-[:checked]:bg-[#fdf2f8] has-[:checked]:ring-1 has-[:checked]:ring-[#ec4899]">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={formData.gender === 'female'}
                                onChange={handleInputChange}
                                className="sr-only"
                            />
                            <FemaleIcon />
                        </label>
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#c7d2fe] bg-[#f8faff] px-4 py-4 transition hover:bg-white has-[:checked]:border-[#6366f2] has-[:checked]:bg-[#eef2ff] has-[:checked]:ring-1 has-[:checked]:ring-[#6366f2]" title="Tidak ingin menyebutkan">
                            <input
                                type="radio"
                                name="gender"
                                value="other"
                                checked={formData.gender === 'other'}
                                onChange={handleInputChange}
                                className="sr-only"
                            />
                            <OtherIcon />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f8faff] p-6 sm:px-8">
                <div className="w-full sm:w-auto">
                    {status.state === 'success' && (
                        <div className="flex items-center gap-2 text-sm font-bold text-[#059669]">
                            <CheckCircle2 size={18} />
                            <span>{status.message}</span>
                        </div>
                    )}
                    {status.state === 'error' && (
                        <div className="text-sm font-bold text-[#e53e3e]">
                            {status.message}
                        </div>
                    )}
                </div>
                
                <div className="w-full sm:w-auto">
                    <button
                        type="submit"
                        disabled={status.state === 'submitting'}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#6366f2] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#6366f2]/20 transition hover:bg-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {status.state === 'submitting' && <Loader2 size={16} className="animate-spin" />}
                        Simpan Profil
                    </button>
                </div>
            </div>
        </form>
    );
}

function SecurityTab({ hasPassword }) {
    const [formData, setFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    
    const [status, setStatus] = useState({ state: 'idle', message: '' });
    // Track locally if user has just created a password in this session
    const [localHasPassword, setLocalHasPassword] = useState(hasPassword);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (status.state === 'success') setStatus({ state: 'idle', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ state: 'submitting', message: '' });
        
        try {
            // Use different endpoint depending on whether user already has a password
            const endpoint = localHasPassword ? '/profile/password' : '/profile/set-password';
            const payload = localHasPassword
                ? { current_password: formData.current_password, password: formData.password, password_confirmation: formData.password_confirmation }
                : { password: formData.password, password_confirmation: formData.password_confirmation };

            const response = await window.axios.post(endpoint, payload);
            setStatus({ state: 'success', message: response.data.message });

            if (!localHasPassword) {
                // After creating password, switch to normal change-password UI
                setLocalHasPassword(true);
            }

            setFormData({ current_password: '', password: '', password_confirmation: '' });
        } catch (error) {
            setStatus({ state: 'error', message: readErrorMessage(error) });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="divide-y divide-[#eef2ff]">
            {/* Banner for Google users with no password */}
            {!localHasPassword && (
                <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-5 py-4">
                    <span className="text-2xl leading-none">🔐</span>
                    <div>
                        <p className="text-sm font-black text-[#92400e]">Belum punya password</p>
                        <p className="mt-1 text-xs leading-5 text-[#a16207]">
                            Akun Anda dibuat melalui Google. Buat password di bawah agar bisa login dengan email & password juga.
                        </p>
                    </div>
                </div>
            )}

            <div className="p-6 sm:p-8 space-y-6">
                <div className="max-w-md space-y-5">
                    {/* Only show current_password field if user already has a password */}
                    {localHasPassword && (
                        <div className="space-y-2">
                            <label htmlFor="current_password" className="block text-sm font-bold text-[#1e1033]">
                                Kata Sandi Saat Ini <span className="text-[#e53e3e]">*</span>
                            </label>
                            <input
                                type="password"
                                id="current_password"
                                name="current_password"
                                required
                                value={formData.current_password}
                                onChange={handleInputChange}
                                className="block w-full rounded-lg border border-[#c7d2fe] bg-[#f8faff] px-4 py-3 text-sm font-medium text-[#1e1033] outline-none transition focus:border-[#6366f2] focus:bg-white focus:ring-1 focus:ring-[#6366f2]"
                                placeholder="Masukkan kata sandi lama Anda"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-bold text-[#1e1033]">
                            {localHasPassword ? 'Kata Sandi Baru' : 'Buat Kata Sandi'} <span className="text-[#e53e3e]">*</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border border-[#c7d2fe] bg-[#f8faff] px-4 py-3 text-sm font-medium text-[#1e1033] outline-none transition focus:border-[#6366f2] focus:bg-white focus:ring-1 focus:ring-[#6366f2]"
                            placeholder={localHasPassword ? 'Masukkan kata sandi baru (min 8 karakter)' : 'Buat kata sandi (min 8 karakter)'}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password_confirmation" className="block text-sm font-bold text-[#1e1033]">
                            Konfirmasi Kata Sandi {localHasPassword ? 'Baru' : ''} <span className="text-[#e53e3e]">*</span>
                        </label>
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            required
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border border-[#c7d2fe] bg-[#f8faff] px-4 py-3 text-sm font-medium text-[#1e1033] outline-none transition focus:border-[#6366f2] focus:bg-white focus:ring-1 focus:ring-[#6366f2]"
                            placeholder="Ketik ulang kata sandi"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f8faff] p-6 sm:px-8">
                <div className="w-full sm:w-auto">
                    {status.state === 'success' && (
                        <div className="flex items-center gap-2 text-sm font-bold text-[#059669]">
                            <CheckCircle2 size={18} />
                            <span>{status.message}</span>
                        </div>
                    )}
                    {status.state === 'error' && (
                        <div className="text-sm font-bold text-[#e53e3e]">
                            {status.message}
                        </div>
                    )}
                </div>
                
                <div className="w-full sm:w-auto">
                    <button
                        type="submit"
                        disabled={status.state === 'submitting'}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#6366f2] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#6366f2]/20 transition hover:bg-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {status.state === 'submitting' && <Loader2 size={16} className="animate-spin" />}
                        {localHasPassword ? 'Ubah Kata Sandi' : 'Buat Kata Sandi'}
                    </button>
                </div>
            </div>
        </form>
    );
}
