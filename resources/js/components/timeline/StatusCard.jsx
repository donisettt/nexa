import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Trash2, Globe, Users, Smile, Image as ImageIcon, X, SendHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import EmojiPicker from 'emoji-picker-react';

function VisibilityBadge({ visibility }) {
    if (visibility === 'friends') {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6366f2] bg-[#eef2ff] px-1.5 py-0.5 rounded-full">
                <Users size={9} />
                Teman
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7c6b97] bg-[#f1f4fe] px-1.5 py-0.5 rounded-full">
            <Globe size={9} />
            Publik
        </span>
    );
}

function FollowButton({ userId, initialStatus }) {
    const [status, setStatus] = useState(initialStatus); // 'none' | 'pending' | 'friends'
    const [loading, setLoading] = useState(false);

    const handleAddFriend = async () => {
        if (status !== 'none') return;
        setLoading(true);
        try {
            await window.axios.post('/friends/request', { user_id: userId });
            setStatus('friends');
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengirim permintaan.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'friends' || status === 'pending') {
        return (
            <span className="text-[13px] font-bold text-[#6366f2]">
                Teman
            </span>
        );
    }

    return (
        <button
            onClick={handleAddFriend}
            disabled={loading}
            className="text-[13px] font-bold text-blue-500 hover:text-blue-600 transition disabled:opacity-60"
        >
            {loading ? '...' : 'Ikuti'}
        </button>
    );
}

export default function StatusCard({ status, currentUser, onDeleted }) {
    const [isLiked, setIsLiked] = useState(status.is_liked);
    const [likesCount, setLikesCount] = useState(status.likes_count);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsCount, setCommentsCount] = useState(status.comments_count);
    const [loadingComments, setLoadingComments] = useState(false);
    
    // Top-level comment state
    const [newComment, setNewComment] = useState('');
    const [commentImage, setCommentImage] = useState(null);
    const [commentImagePreview, setCommentImagePreview] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);

    // Reply comment state
    const [replyingTo, setReplyingTo] = useState(null); // comment id
    const [replyText, setReplyText] = useState('');
    const [replyImage, setReplyImage] = useState(null);
    const [replyImagePreview, setReplyImagePreview] = useState(null);
    const [showReplyEmoji, setShowReplyEmoji] = useState(false);
    const replyFileInputRef = useRef(null);

    const toggleLike = async () => {
        const previouslyLiked = isLiked;
        setIsLiked(!previouslyLiked);
        setLikesCount(prev => previouslyLiked ? prev - 1 : prev + 1);
        try {
            await window.axios.post(`/statuses/${status.id}/like`);
        } catch {
            setIsLiked(previouslyLiked);
            setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1);
        }
    };

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const { data } = await window.axios.get(`/statuses/${status.id}/comments`);
                setComments(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleImageSelect = (e, isReply = false) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const previewUrl = URL.createObjectURL(file);
        if (isReply) {
            setReplyImage(file);
            setReplyImagePreview(previewUrl);
        } else {
            setCommentImage(file);
            setCommentImagePreview(previewUrl);
        }
    };

    const clearImage = (isReply = false) => {
        if (isReply) {
            setReplyImage(null);
            setReplyImagePreview(null);
            if (replyFileInputRef.current) replyFileInputRef.current.value = '';
        } else {
            setCommentImage(null);
            setCommentImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onEmojiClick = (emojiObject, isReply = false) => {
        if (isReply) {
            setReplyText(prev => prev + emojiObject.emoji);
        } else {
            setNewComment(prev => prev + emojiObject.emoji);
        }
    };

    const submitComment = async (e, parentId = null) => {
        e.preventDefault();
        const content = parentId ? replyText : newComment;
        const image = parentId ? replyImage : commentImage;
        
        if (!content.trim() && !image) return;

        const formData = new FormData();
        if (content.trim()) formData.append('content', content);
        if (image) formData.append('image', image);
        if (parentId) formData.append('parent_id', parentId);

        try {
            const { data } = await window.axios.post(`/statuses/${status.id}/comments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (parentId) {
                setComments(comments.map(c => {
                    if (c.id === parentId) {
                        return { ...c, replies: [...(c.replies || []), data.comment] };
                    }
                    return c;
                }));
                setReplyingTo(null);
                setReplyText('');
                clearImage(true);
                setShowReplyEmoji(false);
            } else {
                setComments([data.comment, ...comments]);
                setNewComment('');
                clearImage(false);
                setShowEmojiPicker(false);
            }
            setCommentsCount(prev => prev + 1);
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengirim komentar');
            console.error(error);
        }
    };

    const deleteComment = async (commentId, parentId = null) => {
        if (!window.confirm('Hapus komentar ini?')) return;
        try {
            await window.axios.delete(`/statuses/comments/${commentId}`);
            
            if (parentId) {
                setComments(comments.map(c => {
                    if (c.id === parentId) {
                        return { ...c, replies: c.replies.filter(r => r.id !== commentId) };
                    }
                    return c;
                }));
            } else {
                setComments(comments.filter(c => c.id !== commentId));
            }
            setCommentsCount(prev => prev - 1);
        } catch {
            alert('Gagal menghapus komentar.');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Hapus status ini?')) return;
        try {
            await window.axios.delete(`/statuses/${status.id}`);
            onDeleted(status.id);
        } catch {
            alert('Gagal menghapus status.');
        }
    };

    const handleShare = async () => {
        navigator.clipboard.writeText(window.location.origin + '/timeline');
        alert('Tautan disalin ke clipboard!');
        try {
            await window.axios.post(`/statuses/${status.id}/share`);
        } catch (e) {
            // ignore error
        }
    };

    const timeAgo = formatDistanceToNow(new Date(status.created_at), { addSuffix: true, locale: id });
    const isOwn = status.friend_status === 'self';

    const renderComment = (comment, isReply = false, parentId = null) => {
        const isCommentOwner = comment.user_id === currentUser.id;
        const canDelete = isCommentOwner || isOwn;

        return (
            <div key={comment.id} className={`flex gap-2 ${isReply ? 'mt-3' : 'mb-4'}`}>
                <img
                    src={comment.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=e0e7ff&color=6366f2`}
                    alt={comment.user.name}
                    className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover shrink-0 mt-1`}
                />
                <div className="flex-1">
                    <div className="bg-[#f8fafc] px-3 py-2 rounded-2xl rounded-tl-sm inline-block max-w-full">
                        <p className="text-[13px] font-bold text-[#1e1033]">{comment.user.name}</p>
                        {comment.content && <p className="text-[14px] text-[#3f3152] whitespace-pre-wrap">{comment.content}</p>}
                        {comment.image_path && (
                            <div className="mt-2 rounded-xl overflow-hidden max-w-[200px] sm:max-w-[250px]">
                                <img 
                                    src={`/storage/${comment.image_path}`} 
                                    alt="Lampiran" 
                                    className="w-full h-auto object-contain bg-gray-100 cursor-pointer hover:opacity-90 transition"
                                    onClick={() => window.open(`/storage/${comment.image_path}`, '_blank')}
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Comment Actions */}
                    <div className="flex items-center gap-3 px-2 mt-1">
                        {!isReply && (
                            <button 
                                onClick={() => {
                                    if (replyingTo === comment.id) {
                                        setReplyingTo(null);
                                    } else {
                                        setReplyingTo(comment.id);
                                        setReplyText('');
                                        clearImage(true);
                                        setShowReplyEmoji(false);
                                    }
                                }}
                                className="text-xs font-semibold text-[#7c6b97] hover:text-[#6366f2]"
                            >
                                Balas
                            </button>
                        )}
                        {canDelete && (
                            <button 
                                onClick={() => deleteComment(comment.id, parentId)}
                                className="text-xs font-semibold text-red-400 hover:text-red-500"
                            >
                                Hapus
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && !isReply && (
                        <div className="mt-3 relative">
                            {replyImagePreview && (
                                <div className="mb-2 relative inline-block ml-2">
                                    <img src={replyImagePreview} className="h-16 rounded-lg object-cover shadow-sm" alt="Preview" />
                                    <button type="button" onClick={() => clearImage(true)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
                                        <X size={10} />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={(e) => submitComment(e, comment.id)} className="flex items-end gap-2">
                                <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex items-center px-2 py-0.5 focus-within:ring-2 focus-within:ring-[#6366f2]/20">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder={`Balas ke ${comment.user.name.split(' ')[0]}...`}
                                        className="flex-1 bg-transparent px-2 py-1 text-[13px] focus:outline-none"
                                    />
                                    
                                    <div className="flex items-center gap-0.5 px-1 relative">
                                        <button type="button" onClick={() => setShowReplyEmoji(!showReplyEmoji)} className="p-1 text-gray-400 hover:text-[#6366f2] transition rounded-full hover:bg-gray-100">
                                            <Smile size={16} />
                                        </button>
                                        <button type="button" onClick={() => replyFileInputRef.current?.click()} className="p-1 text-gray-400 hover:text-[#6366f2] transition rounded-full hover:bg-gray-100">
                                            <ImageIcon size={16} />
                                        </button>
                                        <input type="file" accept="image/*" className="hidden" ref={replyFileInputRef} onChange={(e) => handleImageSelect(e, true)} />
                                        
                                        {showReplyEmoji && (
                                            <div className="absolute bottom-10 right-0 z-50 shadow-xl rounded-xl border border-gray-100 overflow-hidden">
                                                <EmojiPicker onEmojiClick={(e) => onEmojiClick(e, true)} width={280} height={350} searchDisabled />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button type="submit" disabled={!replyText.trim() && !replyImage} className="p-2 text-[#6366f2] disabled:opacity-40 transition hover:text-[#4f46e5]">
                                    <SendHorizontal size={18} />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Replies List */}
                    {!isReply && comment.replies && comment.replies.length > 0 && (
                        <div className="pl-2 border-l-2 border-[#e2e8f0] mt-1 pt-1">
                            {comment.replies.map(reply => renderComment(reply, true, comment.id))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-[#c7d2fe] p-4 sm:p-5 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={status.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(status.user.name)}&background=e0e7ff&color=6366f2`}
                        alt={status.user.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-[#1e1033] text-[15px] leading-tight">{status.user.name}</h3>
                            {!isOwn && (
                                <>
                                    <span className="text-[#c7d2fe] font-black">·</span>
                                    <FollowButton
                                        userId={status.user_id}
                                        initialStatus={status.friend_status}
                                    />
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs text-[#7c6b97]">{timeAgo}</span>
                            <span className="text-[#c7d2fe]">·</span>
                            <VisibilityBadge visibility={status.visibility} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isOwn && (
                        <button onClick={handleDelete} className="text-[#9a8fb0] hover:text-red-500 transition p-1">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mb-4 space-y-3">
                {status.content && (
                    <p className="text-[#3f3152] text-[15px] leading-relaxed whitespace-pre-wrap">
                        {status.content}
                    </p>
                )}
                {status.image_path && (
                    <div className="rounded-xl overflow-hidden bg-gray-100 h-[280px] sm:h-[320px]">
                        <img
                            src={`/storage/${status.image_path}`}
                            alt="Status"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                            onClick={() => window.open(`/storage/${status.image_path}`, '_blank')}
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-3 border-t border-[#eef2ff]">
                <button
                    onClick={toggleLike}
                    className={`flex items-center gap-2 text-sm font-medium transition ${isLiked ? 'text-pink-500' : 'text-[#7c6b97] hover:text-[#6366f2]'}`}
                >
                    <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likesCount > 0 ? likesCount : 'Suka'}</span>
                </button>
                <button
                    onClick={toggleComments}
                    className="flex items-center gap-2 text-sm font-medium text-[#7c6b97] hover:text-[#6366f2] transition"
                >
                    <MessageCircle size={18} />
                    <span>{commentsCount > 0 ? commentsCount : 'Komentar'}</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-sm font-medium text-[#7c6b97] hover:text-[#6366f2] transition"
                >
                    <Share2 size={18} />
                </button>
            </div>

            {/* Comment Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-[#eef2ff] space-y-4">
                    {/* Top Level Comment Form */}
                    <div className="relative">
                        {commentImagePreview && (
                            <div className="mb-2 relative inline-block">
                                <img src={commentImagePreview} className="h-20 rounded-lg object-cover shadow-sm" alt="Preview" />
                                <button type="button" onClick={() => clearImage(false)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition">
                                    <X size={12} />
                                </button>
                            </div>
                        )}
                        
                        <form onSubmit={(e) => submitComment(e)} className="flex items-end gap-2">
                            <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl flex items-center px-2 py-1 focus-within:ring-2 focus-within:ring-[#6366f2]/20">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Tulis komentar..."
                                    className="flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
                                />
                                
                                <div className="flex items-center gap-1 px-1 relative">
                                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 text-gray-400 hover:text-[#6366f2] transition rounded-full hover:bg-gray-100">
                                        <Smile size={18} />
                                    </button>
                                    
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 text-gray-400 hover:text-[#6366f2] transition rounded-full hover:bg-gray-100">
                                        <ImageIcon size={18} />
                                    </button>
                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleImageSelect(e, false)} />

                                    {showEmojiPicker && (
                                        <div className="absolute bottom-12 right-0 z-50 shadow-xl rounded-xl border border-gray-100 overflow-hidden">
                                            <EmojiPicker onEmojiClick={(e) => onEmojiClick(e, false)} width={300} height={400} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={!newComment.trim() && !commentImage}
                                className="p-2.5 rounded-full bg-[#6366f2] text-white disabled:opacity-40 transition hover:bg-[#4f46e5] shrink-0"
                            >
                                <SendHorizontal size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="max-h-80 overflow-y-auto pr-2 pt-2">
                        {loadingComments ? (
                            <p className="text-center text-xs text-[#7c6b97] py-2">Memuat komentar...</p>
                        ) : comments.length === 0 ? (
                            <p className="text-center text-xs text-[#7c6b97] py-2">Belum ada komentar.</p>
                        ) : (
                            comments.map(comment => renderComment(comment))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
