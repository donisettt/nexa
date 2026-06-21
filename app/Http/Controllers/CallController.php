<?php

namespace App\Http\Controllers;

use App\Events\CallSignal;
use App\Models\MatchSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CallController extends Controller
{
    /**
     * Relay a WebRTC signaling payload to the other user in the match session.
     * Types: 'call-request', 'offer', 'answer', 'ice-candidate', 'hang-up'
     */
    public function signal(Request $request, MatchSession $matchSession): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            in_array((int) $user->id, [(int) $matchSession->initiator_id, (int) $matchSession->partner_id]),
            403
        );

        $validated = $request->validate([
            'type'    => 'required|in:call-request,offer,answer,ice-candidate,hang-up',
            'payload' => 'nullable|array',
        ]);

        try {
            broadcast(new CallSignal(
                matchSessionId: $matchSession->id,
                fromUserId:     $user->id,
                type:           $validated['type'],
                payload:        $validated['payload'] ?? [],
            ))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('CallSignal broadcast failed', [
                'match_id' => $matchSession->id,
                'user_id'  => $user->id,
                'type'     => $validated['type'],
                'error'    => $e->getMessage(),
            ]);

            return response()->json([
                'ok'      => false,
                'message' => 'Gagal mengirim sinyal panggilan. Pastikan server WebSocket (Reverb) berjalan.',
            ], 503);
        }

        return response()->json(['ok' => true]);
    }
}
