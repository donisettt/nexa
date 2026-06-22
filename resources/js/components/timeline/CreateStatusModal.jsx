import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, X, Globe, Users, ChevronDown } from 'lucide-react';

const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Publik', icon: Globe, desc: 'Semua orang dapat melihat' },
    { value: 'friends', label: 'Teman', icon: Users, desc: 'Hanya teman yang dapat melihat' },
];

export default function CreateStatusModal({ user, onCreated, onClose }) {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        setTimeout(() => textareaRef.current?.focus(), 50);
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) return;

        setIsSubmitting(true);
        const formData = new FormData();
        if (content.trim()) formData.append('content', content);
        if (image) formData.append('image', image);
        formData.append('visibility', visibility);

        try {
            const { data } = await window.axios.post('/statuses', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onCreated(data.status);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal memposting status.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentVisibility = VISIBILITY_OPTIONS.find(v => v.value === visibility);
    const VisIcon = currentVisibility.icon;
    const canSubmit = (content.trim() || image) && !isSubmitting;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-visible animate-modal-in">
                {/* Header */}
                <div className="relative flex items-center justify-center py-4 px-5 border-b border-[#e2e8f0]">
                    <h2 className="text-base font-black text-[#1e1033]">Buat Status</h2>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2ff] text-[#7c6b97] hover:bg-[#e0e7ff] hover:text-[#6366f2] transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto max-h-[80vh]">
                    <div className="p-5 flex-1">
                        {/* User info + Visibility */}
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e0e7ff&color=6366f2`}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#eef2ff]"
                            />
                            <div>
                                <p className="text-sm font-black text-[#1e1033]">{user.name}</p>

                                {/* Visibility Picker Button */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowVisibilityPicker(!showVisibilityPicker)}
                                        className="flex items-center gap-1.5 mt-1 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#6366f2] px-2.5 py-0.5 rounded-full text-xs font-bold transition"
                                    >
                                        <VisIcon size={12} />
                                        {currentVisibility.label}
                                        <ChevronDown size={12} className={`transition-transform ${showVisibilityPicker ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showVisibilityPicker && (
                                        <div className="absolute left-0 top-full mt-1 z-10 bg-white border border-[#e2e8f0] rounded-xl shadow-xl w-56 overflow-hidden">
                                            {VISIBILITY_OPTIONS.map(opt => {
                                                const OIcon = opt.icon;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => { setVisibility(opt.value); setShowVisibilityPicker(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#eef2ff] transition ${visibility === opt.value ? 'bg-[#eef2ff]' : ''}`}
                                                    >
                                                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${visibility === opt.value ? 'bg-[#6366f2] text-white' : 'bg-[#f1f4fe] text-[#6366f2]'}`}>
                                                            <OIcon size={16} />
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#1e1033]">{opt.label}</p>
                                                            <p className="text-xs text-[#7c6b97]">{opt.desc}</p>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`Apa yang ada di pikiran Anda, ${user.name.split(' ')[0]}?`}
                            rows={4}
                            className="w-full bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 resize-none text-[#1e1033] placeholder-[#b0a3c0] text-[17px] leading-relaxed"
                            disabled={isSubmitting}
                        />

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative mt-3 rounded-xl overflow-hidden bg-gray-100 max-h-[240px]">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full max-h-[240px] object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-black/60 text-white rounded-full hover:bg-black/80 transition"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Attachment bar */}
                    <div className="mx-5 mb-4 flex items-center justify-between rounded-xl border border-[#e2e8f0] px-4 py-2.5">
                        <span className="text-sm font-semibold text-[#7c6b97]">Tambahkan ke postingan</span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-8 w-8 items-center justify-center text-[#6366f2] hover:bg-[#eef2ff] rounded-lg transition"
                            disabled={isSubmitting}
                        >
                            <ImageIcon size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Submit */}
                    <div className="px-5 pb-5">
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full py-2.5 rounded-xl text-sm font-black transition disabled:cursor-not-allowed disabled:bg-[#e2e8f0] disabled:text-[#a0aec0] bg-[#6366f2] text-white hover:bg-[#4f46e5]"
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
