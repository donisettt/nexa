<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StatusController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user   = $request->user();
        $userId = $user->id;
        $filter = $request->query('filter', 'all'); // 'all' or 'friends'

        // Get friend IDs once (used for filter & friendship status)
        $friendships = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('user_one_id', $userId)->orWhere('user_two_id', $userId);
            })->get();

        $friendIds = $friendships
            ->toBase()
            ->map(fn($f) => (int)$f->user_one_id === (int)$userId ? (int)$f->user_two_id : (int)$f->user_one_id)
            ->push($userId);

        // Get pending-sent user IDs
        $pendingSentIds = Friendship::where('status', 'pending')
            ->where('requested_by_id', $userId)
            ->where(function ($q) use ($userId) {
                $q->where('user_one_id', $userId)->orWhere('user_two_id', $userId);
            })->get()
            ->toBase()
            ->map(fn($f) => (int)$f->user_one_id === (int)$userId ? (int)$f->user_two_id : (int)$f->user_one_id);

        $query = Status::with(['user', 'likes' => function ($q) use ($userId) {
            $q->where('user_id', $userId);
        }])
            ->withCount(['likes', 'comments'])
            ->latest();

        if ($filter === 'friends') {
            $query->whereIn('user_id', $friendIds);
        }

        // Always hide friends-only statuses from non-friends
        $query->where(function ($q) use ($userId, $friendIds) {
            $q->where('visibility', 'public')
              ->orWhere('user_id', $userId) // own posts
              ->orWhere(function ($q2) use ($friendIds) {
                  $q2->where('visibility', 'friends')
                     ->whereIn('user_id', $friendIds);
              });
        });

        $statuses = $query->paginate(15);

        $statuses->getCollection()->transform(function ($status) use ($userId, $friendIds, $pendingSentIds) {
            $status->is_liked = $status->likes->isNotEmpty();
            unset($status->likes);

            // Friend relationship info for "Add Friend" button
            $statusUserId = (int) $status->user_id;
            if ($statusUserId === (int) $userId) {
                $status->friend_status = 'self';
            } elseif ($friendIds->contains($statusUserId)) {
                $status->friend_status = 'friends';
            } elseif ($pendingSentIds->contains($statusUserId)) {
                $status->friend_status = 'pending';
            } else {
                $status->friend_status = 'none';
            }

            return $status;
        });

        return response()->json($statuses);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content'    => ['nullable', 'string', 'max:1000'],
            'image'      => ['nullable', 'image', 'max:5120'],
            'visibility' => ['sometimes', 'in:public,friends'],
        ]);

        if (empty($validated['content']) && !$request->hasFile('image')) {
            return response()->json(['message' => 'Status tidak boleh kosong.'], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('statuses', 'public');
        }

        $status = Status::create([
            'user_id'    => $request->user()->id,
            'content'    => $validated['content'] ?? null,
            'image_path' => $imagePath,
            'visibility' => $validated['visibility'] ?? 'public',
        ]);

        $status->load('user');
        $status->likes_count    = 0;
        $status->comments_count = 0;
        $status->is_liked       = false;
        $status->friend_status  = 'self';

        return response()->json([
            'message' => 'Status berhasil diposting.',
            'status'  => $status,
        ], 201);
    }

    public function destroy(Request $request, Status $status): JsonResponse
    {
        if ($status->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($status->image_path) {
            Storage::disk('public')->delete($status->image_path);
        }

        $status->delete();

        return response()->json(['message' => 'Status berhasil dihapus.']);
    }
}
