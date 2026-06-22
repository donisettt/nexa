<?php

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatusLikeController extends Controller
{
    public function toggle(Request $request, Status $status): JsonResponse
    {
        $user = $request->user();
        $like = $status->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            return response()->json([
                'liked' => false,
                'message' => 'Like dihapus.'
            ]);
        } else {
            $status->likes()->create([
                'user_id' => $user->id,
            ]);

            // Notify status owner
            if ($status->user_id !== $user->id) {
                $status->user->notify(new \App\Notifications\StatusLiked($user, $status));
            }

            return response()->json([
                'liked' => true,
                'message' => 'Status disukai.'
            ]);
        }
    }
}
