<?php

namespace App\Http\Controllers;

use App\Models\Status;
use App\Models\StatusComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;

class StatusCommentController extends Controller
{
    public function index(Status $status): JsonResponse
    {
        // Only fetch top-level comments and include their replies
        $comments = $status->comments()
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->get();
            
        return response()->json($comments);
    }

    public function store(Request $request, Status $status): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', 'image', 'max:5120'],
            'parent_id' => ['nullable', 'exists:status_comments,id'],
        ]);

        if (empty($validated['content']) && !$request->hasFile('image')) {
            return response()->json(['message' => 'Komentar tidak boleh kosong.'], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('comments', 'public');
        }

        $user = $request->user();

        $comment = $status->comments()->create([
            'user_id' => $user->id,
            'content' => $validated['content'] ?? null,
            'image_path' => $imagePath,
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        $comment->load(['user', 'replies.user']);

        // Notify status owner if someone else commented
        if ($status->user_id !== $user->id) {
            $notifContent = $validated['content'] ?? 'mengirimkan foto';
            $status->user->notify(new \App\Notifications\StatusCommented($user, $status, $notifContent));
        }

        return response()->json([
            'message' => 'Komentar berhasil ditambahkan.',
            'comment' => $comment,
        ], 201);
    }

    public function destroy(Request $request, StatusComment $comment): JsonResponse
    {
        $user = $request->user();
        $status = $comment->status;

        // User can delete if they own the comment OR they own the status
        if ($comment->user_id !== $user->id && $status->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($comment->image_path) {
            Storage::disk('public')->delete($comment->image_path);
        }

        $comment->delete();

        return response()->json(['message' => 'Komentar berhasil dihapus.']);
    }
}
