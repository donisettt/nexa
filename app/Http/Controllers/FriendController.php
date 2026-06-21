<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\MatchSession;
use App\Models\User;
use App\Notifications\FriendRequestAccepted;
use App\Notifications\FriendRequestReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json($this->friendState($request->user()));
    }

    public function requestFromMatch(Request $request, MatchSession $matchSession): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            $matchSession->type === 'random'
                && $matchSession->status === 'active'
                && in_array((int) $user->id, [(int) $matchSession->initiator_id, (int) $matchSession->partner_id], true),
            403
        );

        $matchSession->loadMissing(['initiator', 'partner']);
        $partner = $matchSession->otherUserFor($user);

        abort_unless($partner, 404);

        $friendship = DB::transaction(function () use ($user, $partner) {
            [$userOneId, $userTwoId] = Friendship::pairIds($user, $partner);

            $friendship = Friendship::query()
                ->forPair($user, $partner)
                ->lockForUpdate()
                ->first();

            if (! $friendship) {
                return Friendship::create([
                    'user_one_id' => $userOneId,
                    'user_two_id' => $userTwoId,
                    'requested_by_id' => $user->id,
                    'status' => 'pending',
                ]);
            }

            if ($friendship->status === 'declined') {
                $friendship->update([
                    'requested_by_id' => $user->id,
                    'status' => 'pending',
                    'accepted_at' => null,
                    'direct_match_session_id' => null,
                ]);
            }

            return $friendship;
        });

        // Notify partner about the request
        $partner->notify(new FriendRequestReceived($user));

        $friendship->load(['userOne', 'userTwo', 'requestedBy', 'directSession']);

        return response()->json([
            'message' => $this->statusMessage($friendship, $user),
            'friendship' => $this->serializeFriendship($friendship, $user),
            'friends' => $this->friendState($user),
        ]);
    }

    public function accept(Request $request, Friendship $friendship): JsonResponse
    {
        $user = $request->user();

        abort_unless($this->canReceiveRequest($friendship, $user), 403);

        DB::transaction(function () use ($friendship) {
            $friendship->loadMissing(['directSession']);

            $directSession = $friendship->directSession;

            if (! $directSession) {
                $directSession = MatchSession::create([
                    'initiator_id' => $friendship->requested_by_id,
                    'partner_id' => $this->recipientId($friendship),
                    'type' => 'direct',
                    'status' => 'active',
                    'started_at' => now(),
                ]);
            }

            $friendship->update([
                'status' => 'accepted',
                'accepted_at' => now(),
                'direct_match_session_id' => $directSession->id,
            ]);

            $requester = User::find($friendship->requested_by_id);
            if ($requester) {
                $requester->notify(new FriendRequestAccepted(request()->user()));
            }
        });

        return response()->json($this->friendState($user));
    }

    public function reject(Request $request, Friendship $friendship): JsonResponse
    {
        $user = $request->user();

        abort_unless($this->canReceiveRequest($friendship, $user), 403);

        $friendship->update([
            'status' => 'declined',
            'accepted_at' => null,
            'direct_match_session_id' => null,
        ]);

        return response()->json($this->friendState($user));
    }

    public function chat(Request $request, Friendship $friendship): JsonResponse
    {
        $user = $request->user();

        abort_unless(
            $friendship->status === 'accepted'
                && in_array((int) $user->id, [(int) $friendship->user_one_id, (int) $friendship->user_two_id], true),
            403
        );

        $friendship->loadMissing(['userOne', 'userTwo', 'directSession']);

        if (! $friendship->directSession) {
            $recipientId = $this->recipientId($friendship);

            $directSession = MatchSession::create([
                'initiator_id' => $friendship->requested_by_id,
                'partner_id' => $recipientId,
                'type' => 'direct',
                'status' => 'active',
                'started_at' => now(),
            ]);

            $friendship->update(['direct_match_session_id' => $directSession->id]);
            $friendship->setRelation('directSession', $directSession);
        }

        return response()->json([
            'chat' => $this->serializeDirectChat($friendship, $user),
        ]);
    }

    private function friendState(User $user): array
    {
        $friendships = Friendship::query()
            ->forUser($user)
            ->with(['userOne', 'userTwo', 'requestedBy', 'directSession'])
            ->latest('updated_at')
            ->get();

        return [
            'friends' => $friendships
                ->where('status', 'accepted')
                ->map(fn (Friendship $friendship) => $this->serializeFriendship($friendship, $user))
                ->values(),
            'pending_received' => $friendships
                ->where('status', 'pending')
                ->where('requested_by_id', '!=', $user->id)
                ->map(fn (Friendship $friendship) => $this->serializeFriendship($friendship, $user))
                ->values(),
            'pending_sent' => $friendships
                ->where('status', 'pending')
                ->where('requested_by_id', $user->id)
                ->map(fn (Friendship $friendship) => $this->serializeFriendship($friendship, $user))
                ->values(),
        ];
    }

    private function serializeFriendship(Friendship $friendship, User $user): array
    {
        $friendship->loadMissing(['userOne', 'userTwo', 'requestedBy', 'directSession']);
        $otherUser = $friendship->otherUserFor($user);

        return [
            'id' => $friendship->id,
            'status' => $friendship->status,
            'requested_by_me' => (int) $friendship->requested_by_id === (int) $user->id,
            'user' => $otherUser ? array_merge(
                $otherUser->only(['id', 'name', 'email']),
                ['avatar_url' => $otherUser->avatar_url]
            ) : null,
            'chat' => $friendship->status === 'accepted' ? $this->serializeDirectChat($friendship, $user) : null,
            'accepted_at' => $friendship->accepted_at?->toISOString(),
            'updated_at' => $friendship->updated_at?->toISOString(),
        ];
    }

    private function serializeDirectChat(Friendship $friendship, User $user): array
    {
        $otherUser = $friendship->otherUserFor($user);

        return [
            'id' => $friendship->direct_match_session_id,
            'type' => 'direct',
            'partner_alias' => $otherUser?->name ?? 'Teman',
            'partner_email' => $otherUser?->email,
            'partner_avatar_url' => $otherUser?->avatar_url,
            'status' => 'active',
        ];
    }

    private function canReceiveRequest(Friendship $friendship, User $user): bool
    {
        return $friendship->status === 'pending'
            && in_array((int) $user->id, [(int) $friendship->user_one_id, (int) $friendship->user_two_id], true)
            && (int) $friendship->requested_by_id !== (int) $user->id;
    }

    private function recipientId(Friendship $friendship): int
    {
        return (int) (
            $friendship->requested_by_id === $friendship->user_one_id
                ? $friendship->user_two_id
                : $friendship->user_one_id
        );
    }

    public function recommendations(Request $request): JsonResponse
    {
        $user = $request->user();
        $radius = (float) $request->query('radius', 50); // km

        $friendIds = Friendship::query()
            ->forUser($user)
            ->where('status', 'accepted')
            ->get()
            ->map(fn (Friendship $f) => $f->otherUserFor($user)?->id)
            ->filter()
            ->push($user->id)
            ->toBase()
            ->unique()
            ->toArray();

        $query = User::query()
            ->whereNotIn('id', $friendIds);

        // If current user has location, filter by distance using Haversine
        if ($user->latitude !== null && $user->longitude !== null) {
            $lat = (float) $user->latitude;
            $lng = (float) $user->longitude;

            $query->select(['id', 'name', 'email', 'avatar', 'latitude', 'longitude'])
                ->selectRaw("(
                    6371 * acos(
                        cos(radians(?)) * cos(radians(latitude)) *
                        cos(radians(longitude) - radians(?)) +
                        sin(radians(?)) * sin(radians(latitude))
                    )
                ) AS distance", [$lat, $lng, $lat])
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->having('distance', '<=', $radius)
                ->orderBy('distance');
        } else {
            $query->select(['id', 'name', 'email', 'avatar'])
                ->orderBy('name');
        }

        $users = $query->limit(10)->get()->map(function ($u) {
            $item = ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'avatar_url' => $u->avatar_url];
            if (isset($u->distance)) {
                $item['distance'] = round((float) $u->distance, 1);
            }
            return $item;
        });

        return response()->json([
            'users' => $users,
            'has_location' => $user->latitude !== null && $user->longitude !== null,
        ]);
    }

    public function updateLocation(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $user = $request->user();
        $user->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json(['message' => 'Lokasi berhasil diperbarui.']);
    }

    public function sendRequest(Request $request): JsonResponse
    {
        $request->validate(['user_id' => 'required|exists:users,id|different:' . $request->user()->id]);

        $user = $request->user();
        $target = User::findOrFail($request->user_id);

        [$userOneId, $userTwoId] = Friendship::pairIds($user, $target);

        $friendship = DB::transaction(function () use ($user, $userOneId, $userTwoId, $target) {
            $existing = Friendship::query()
                ->forPair($user, $target)
                ->lockForUpdate()
                ->first();

            if ($existing && $existing->status === 'accepted') {
                abort(422, 'Kalian sudah berteman.');
            }

            if ($existing && (int) $existing->requested_by_id === (int) $user->id) {
                abort(422, 'Permintaan teman sudah terkirim.');
            }

            if ($existing) {
                $existing->update([
                    'requested_by_id' => $user->id,
                    'status' => 'pending',
                    'accepted_at' => null,
                    'direct_match_session_id' => null,
                ]);
                return $existing;
            }

            return Friendship::create([
                'user_one_id' => $userOneId,
                'user_two_id' => $userTwoId,
                'requested_by_id' => $user->id,
                'status' => 'pending',
            ]);
        });

        $target->notify(new FriendRequestReceived($user));

        return response()->json([
            'message' => 'Permintaan teman terkirim.',
            'friendship_id' => $friendship->id,
        ]);
    }

    private function statusMessage(Friendship $friendship, User $user): string
    {
        if ($friendship->status === 'accepted') {
            return 'Kalian sudah berteman.';
        }

        if ((int) $friendship->requested_by_id === (int) $user->id) {
            return 'Permintaan teman terkirim.';
        }

        return 'Pengguna ini sudah mengirim permintaan teman ke kamu.';
    }
}
