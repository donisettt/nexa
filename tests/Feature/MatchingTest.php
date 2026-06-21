<?php

namespace Tests\Feature;

use App\Models\MatchingQueue;
use App\Models\MatchSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchingTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_enter_matching_queue(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->postJson('/matching/start');

        $response
            ->assertOk()
            ->assertJsonPath('state', 'searching');

        $this->assertDatabaseHas('matching_queues', [
            'user_id' => $user->id,
            'status' => 'waiting',
        ]);
    }

    public function test_second_user_is_matched_with_waiting_user(): void
    {
        $waitingUser = User::factory()->create();
        $nextUser = User::factory()->create();

        $this
            ->actingAs($waitingUser)
            ->postJson('/matching/start')
            ->assertJsonPath('state', 'searching');

        $response = $this
            ->actingAs($nextUser)
            ->postJson('/matching/start');

        $response
            ->assertOk()
            ->assertJsonPath('state', 'matched');

        $session = MatchSession::query()->firstOrFail();

        $this->assertSame($waitingUser->id, $session->initiator_id);
        $this->assertSame($nextUser->id, $session->partner_id);
        $this->assertSame('active', $session->status);

        $this
            ->actingAs($waitingUser)
            ->getJson('/matching/status')
            ->assertOk()
            ->assertJsonPath('state', 'matched')
            ->assertJsonPath('match.id', $session->id);
    }

    public function test_user_can_cancel_waiting_queue(): void
    {
        $user = User::factory()->create();

        MatchingQueue::create([
            'user_id' => $user->id,
            'status' => 'waiting',
        ]);

        $response = $this
            ->actingAs($user)
            ->postJson('/matching/cancel');

        $response
            ->assertOk()
            ->assertJsonPath('state', 'idle');

        $this->assertDatabaseHas('matching_queues', [
            'user_id' => $user->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_user_can_end_active_match_session(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        $session = MatchSession::create([
            'initiator_id' => $firstUser->id,
            'partner_id' => $secondUser->id,
            'status' => 'active',
            'started_at' => now(),
        ]);

        $response = $this
            ->actingAs($firstUser)
            ->postJson("/matching/{$session->id}/end");

        $response
            ->assertOk()
            ->assertJsonPath('state', 'idle');

        $this->assertDatabaseHas('match_sessions', [
            'id' => $session->id,
            'status' => 'ended',
        ]);
    }
}
