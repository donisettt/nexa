<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\Status;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class StatusCommented extends Notification implements ShouldQueue
{
    use Queueable;

    public User $sender;
    public Status $status;
    public string $commentContent;

    public function __construct(User $sender, Status $status, string $commentContent)
    {
        $this->sender = $sender;
        $this->status = $status;
        $this->commentContent = $commentContent;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'status_commented',
            'user_id' => $this->sender->id,
            'user_name' => $this->sender->name,
            'user_avatar' => $this->sender->avatar_url,
            'status_id' => $this->status->id,
            'message' => $this->sender->name . ' mengomentari status Anda: "' . \Str::limit($this->commentContent, 30) . '"',
        ];
    }
}
