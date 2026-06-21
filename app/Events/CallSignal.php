<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallSignal implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $matchSessionId;
    public int $fromUserId;
    public string $type;
    public array $payload;

    public function __construct(int $matchSessionId, int $fromUserId, string $type, array $payload)
    {
        $this->matchSessionId = $matchSessionId;
        $this->fromUserId = $fromUserId;
        $this->type = $type;
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('match.' . $this->matchSessionId),
        ];
    }
}
