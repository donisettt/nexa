<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class FriendRequestReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public $sender;

    public function __construct(User $sender)
    {
        $this->sender = $sender;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'friend_request_received',
            'user_id' => $this->sender->id,
            'user_name' => $this->sender->name,
            'user_avatar' => $this->sender->avatar_url,
            'message' => $this->sender->name . ' mengirimkan permintaan teman.',
        ];
    }
}
