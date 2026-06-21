<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('match.{matchSessionId}', function ($user, $matchSessionId) {
    $session = \App\Models\MatchSession::find($matchSessionId);
    if (! $session || $session->status !== 'active') {
        return false;
    }
    return in_array((int) $user->id, [(int) $session->initiator_id, (int) $session->partner_id]);
});
