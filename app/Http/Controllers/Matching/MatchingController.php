<?php

namespace App\Http\Controllers\Matching;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\MatchingQueue;
use App\Models\MatchSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MatchingController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        return response()->json($this->matchingState($request->user()));
    }

    public function start(Request $request): JsonResponse
    {
        $mode = in_array($request->input('mode'), ['chat', 'call'], true)
            ? $request->input('mode')
            : 'chat';

        $state = DB::transaction(function () use ($request, $mode) {
            $user = $request->user();

            $activeSession = $this->activeSessionQuery($user)
                ->lockForUpdate()
                ->first();

            if ($activeSession) {
                return $this->matchedState($activeSession, $user);
            }

            $ownQueue = MatchingQueue::where('user_id', $user->id)
                ->where('status', 'waiting')
                ->where('mode', $mode)
                ->lockForUpdate()
                ->first();

            if ($ownQueue) {
                return $this->searchingState($ownQueue);
            }

            $candidate = MatchingQueue::where('status', 'waiting')
                ->where('mode', $mode)
                ->where('user_id', '!=', $user->id)
                ->oldest()
                ->lockForUpdate()
                ->first();

            if ($candidate) {
                $session = MatchSession::create([
                    'initiator_id'   => $candidate->user_id,
                    'partner_id'     => $user->id,
                    'type'           => 'random',
                    'mode'           => $mode,
                    'status'         => 'active',
                    'started_at'     => now(),
                    'chat_expires_at' => now()->addMinutes(MatchSession::CHAT_DURATION_MINUTES),
                ]);

                $candidate->update(['status' => 'matched']);

                MatchingQueue::updateOrCreate(
                    ['user_id' => $user->id],
                    ['status'  => 'matched', 'mode' => $mode]
                );

                return $this->matchedState($session->fresh(['initiator', 'partner']), $user);
            }

            $queue = MatchingQueue::updateOrCreate(
                ['user_id' => $user->id],
                ['status'  => 'waiting', 'mode' => $mode]
            );

            return $this->searchingState($queue);
        });

        return response()->json($state);
    }

    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();

        MatchingQueue::where('user_id', $user->id)
            ->where('status', 'waiting')
            ->update(['status' => 'cancelled']);

        return response()->json($this->matchingState($user));
    }

    public function end(Request $request, MatchSession $matchSession): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            in_array($user->id, [$matchSession->initiator_id, $matchSession->partner_id]),
            403
        );

        if ($matchSession->status === 'active') {
            $matchSession->update([
                'status' => 'ended',
                'ended_at' => now(),
            ]);

            MatchingQueue::whereIn('user_id', [$matchSession->initiator_id, $matchSession->partner_id])
                ->where('status', 'matched')
                ->update(['status' => 'done']);
        }

        return response()->json($this->matchingState($user));
    }

    private function matchingState(User $user): array
    {
        $activeSession = $this->activeSessionQuery($user)
            ->with(['initiator', 'partner'])
            ->latest('started_at')
            ->first();

        if ($activeSession) {
            // Auto-expire: if time is up and they're not friends yet, end the session
            if ($activeSession->isExpired() && ! $activeSession->participantsAreFriends()) {
                $activeSession->update([
                    'status'   => 'timed_out',
                    'ended_at' => now(),
                ]);

                MatchingQueue::whereIn('user_id', [$activeSession->initiator_id, $activeSession->partner_id])
                    ->where('status', 'matched')
                    ->update(['status' => 'done']);

                return [
                    'state'   => 'timed_out',
                    'message' => 'Waktu sesi chat telah habis. Tambahkan sebagai teman untuk bisa ngobrol lagi!',
                ];
            }

            return $this->matchedState($activeSession, $user);
        }

        $queue = MatchingQueue::where('user_id', $user->id)
            ->where('status', 'waiting')
            ->first();

        if ($queue) {
            return $this->searchingState($queue);
        }

        return [
            'state' => 'idle',
            'message' => 'Klik Cari Teman untuk masuk ke antrian random matching.',
        ];
    }

    private function activeSessionQuery(User $user)
    {
        return MatchSession::query()
            ->forUser($user)
            ->where('type', 'random')
            ->where('status', 'active');
    }

    private function searchingState(MatchingQueue $queue): array
    {
        return [
            'state' => 'searching',
            'message' => 'Sedang mencari teman anonim yang tersedia.',
            'queue' => [
                'id' => $queue->id,
                'started_at' => $queue->updated_at?->toISOString(),
            ],
        ];
    }

    private function matchedState(MatchSession $session, User $user): array
    {
        $session->loadMissing(['initiator', 'partner']);
        $partner = $session->otherUserFor($user);

        $expiresAt = $session->chat_expires_at;
        $timeRemainingSeconds = $expiresAt ? max(0, (int) now()->diffInSeconds($expiresAt, false)) : null;

        return [
            'state'   => 'matched',
            'message' => 'Match ditemukan. Kamu sudah terhubung dalam sesi anonim.',
            'match'   => [
                'id'                    => $session->id,
                'type'                  => $session->type,
                'mode'                  => $session->mode,
                'partner_alias'         => $partner ? 'Teman Anonim #'.$partner->id : 'Teman Anonim',
                'started_at'            => $session->started_at?->toISOString(),
                'expires_at'            => $expiresAt?->toISOString(),
                'time_remaining_seconds' => $timeRemainingSeconds,
                'status'                => $session->status,
                'friendship'            => $partner ? $this->friendshipState($user, $partner) : null,
            ],
        ];
    }

    private function friendshipState(User $user, User $partner): ?array
    {
        $friendship = Friendship::query()
            ->forPair($user, $partner)
            ->first();

        if (! $friendship) {
            return null;
        }

        return [
            'id' => $friendship->id,
            'status' => $friendship->status,
            'requested_by_me' => (int) $friendship->requested_by_id === (int) $user->id,
        ];
    }
}
