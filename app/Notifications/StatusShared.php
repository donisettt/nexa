<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\Status;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class StatusShared extends Notification implements ShouldQueue
{
    use Queueable;

    public User $sender;
    public Status $status;

    public function __construct(User $sender, Status $status)
    {
        $this->sender = $sender;
        $this->status = $status;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'status_shared',
            'user_id' => $this->sender->id,
            'user_name' => $this->sender->name,
            'user_avatar' => $this->sender->avatar_url,
            'status_id' => $this->status->id,
            'message' => $this->sender->name . ' membagikan status Anda.',
        ];
    }
}
