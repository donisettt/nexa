<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friendship extends Model
{
    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'requested_by_id',
        'direct_match_session_id',
        'status',
        'accepted_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
        ];
    }

    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_id');
    }

    public function directSession(): BelongsTo
    {
        return $this->belongsTo(MatchSession::class, 'direct_match_session_id');
    }

    public function scopeForUser(Builder $query, User|int $user): Builder
    {
        $userId = $user instanceof User ? $user->id : $user;

        return $query->where(function (Builder $query) use ($userId) {
            $query->where('user_one_id', $userId)
                ->orWhere('user_two_id', $userId);
        });
    }

    public function scopeForPair(Builder $query, User|int $firstUser, User|int $secondUser): Builder
    {
        [$userOneId, $userTwoId] = self::pairIds($firstUser, $secondUser);

        return $query->where('user_one_id', $userOneId)
            ->where('user_two_id', $userTwoId);
    }

    public static function pairIds(User|int $firstUser, User|int $secondUser): array
    {
        $firstId = $firstUser instanceof User ? $firstUser->id : $firstUser;
        $secondId = $secondUser instanceof User ? $secondUser->id : $secondUser;

        return [(int) min($firstId, $secondId), (int) max($firstId, $secondId)];
    }

    public function otherUserFor(User|int $user): ?User
    {
        $userId = $user instanceof User ? $user->id : $user;

        if ((int) $this->user_one_id === (int) $userId) {
            return $this->userTwo;
        }

        if ((int) $this->user_two_id === (int) $userId) {
            return $this->userOne;
        }

        return null;
    }
}
