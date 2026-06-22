<?php

namespace App\Http\Controllers;

use App\Models\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatusShareController extends Controller
{
    public function store(Request $request, Status $status): JsonResponse
    {
        $user = $request->user();

        // Notify status owner if someone else shared
        if ($status->user_id !== $user->id) {
            $status->user->notify(new \App\Notifications\StatusShared($user, $status));
        }

        return response()->json([
            'message' => 'Status berhasil dibagikan.'
        ]);
    }
}
