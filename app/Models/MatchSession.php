<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchSession extends Model
{
    protected $fillable = [
        'initiator_id',
        'partner_id',
        'type',
        'mode',
        'status',
        'started_at',
        'chat_expires_at',
        'ended_at',
    ];

    /** Duration in minutes for random chat sessions */
    const CHAT_DURATION_MINUTES = 10;

    protected function casts(): array
    {
        return [
            'started_at'      => 'datetime',
            'chat_expires_at' => 'datetime',
            'ended_at'        => 'datetime',
        ];
    }

    /**
     * Check if the session's chat time has expired.
     */
    public function isExpired(): bool
    {
        return $this->type === 'random'
            && $this->chat_expires_at !== null
            && now()->greaterThan($this->chat_expires_at);
    }

    /**
     * Check whether the two participants are already friends (accepted).
     */
    public function participantsAreFriends(): bool
    {
        return \App\Models\Friendship::query()
            ->where(function ($q) {
                $q->where('user_one_id', $this->initiator_id)
                  ->where('user_two_id', $this->partner_id);
            })
            ->orWhere(function ($q) {
                $q->where('user_one_id', $this->partner_id)
                  ->where('user_two_id', $this->initiator_id);
            })
            ->where('status', 'accepted')
            ->exists();
    }

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function scopeForUser(Builder $query, User|int $user): Builder
    {
        $userId = $user instanceof User ? $user->id : $user;

        return $query->where(function (Builder $query) use ($userId) {
            $query->where('initiator_id', $userId)
                ->orWhere('partner_id', $userId);
        });
    }

    public function otherUserFor(User|int $user): ?User
    {
        $userId = $user instanceof User ? $user->id : $user;

        if ($this->initiator_id === $userId) {
            return $this->partner;
        }

        if ($this->partner_id === $userId) {
            return $this->initiator;
        }

        return null;
    }
}
