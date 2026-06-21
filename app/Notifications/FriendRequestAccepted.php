<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class FriendRequestAccepted extends Notification implements ShouldQueue
{
    use Queueable;

    public $accepter;

    public function __construct(User $accepter)
    {
        $this->accepter = $accepter;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'friend_request_accepted',
            'user_id' => $this->accepter->id,
            'user_name' => $this->accepter->name,
            'user_avatar' => $this->accepter->avatar_url,
            'message' => $this->accepter->name . ' menerima permintaan teman Anda.',
        ];
    }
}
