<?php

namespace Tests\Feature;

use App\Models\Friendship;
use App\Models\MatchSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_friend_request_from_active_random_match(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        $session = MatchSession::create([
            'initiator_id' => $firstUser->id,
            'partner_id' => $secondUser->id,
            'type' => 'random',
            'status' => 'active',
            'started_at' => now(),
        ]);

        $this
            ->actingAs($firstUser)
            ->postJson("/matching/{$session->id}/friend-request")
            ->assertOk()
            ->assertJsonPath('friendship.status', 'pending')
            ->assertJsonPath('friendship.requested_by_me', true);

        $this->assertDatabaseHas('friendships', [
            'user_one_id' => min($firstUser->id, $secondUser->id),
            'user_two_id' => max($firstUser->id, $secondUser->id),
            'requested_by_id' => $firstUser->id,
            'status' => 'pending',
        ]);
    }

    public function test_recipient_can_accept_friend_request_and_get_direct_chat(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        $friendship = Friendship::create([
            'user_one_id' => min($firstUser->id, $secondUser->id),
            'user_two_id' => max($firstUser->id, $secondUser->id),
            'requested_by_id' => $firstUser->id,
            'status' => 'pending',
        ]);

        $this
            ->actingAs($secondUser)
            ->postJson("/friends/{$friendship->id}/accept")
            ->assertOk()
            ->assertJsonCount(1, 'friends')
            ->assertJsonPath('friends.0.status', 'accepted');

        $friendship->refresh();

        $this->assertSame('accepted', $friendship->status);
        $this->assertNotNull($friendship->direct_match_session_id);

        $this->assertDatabaseHas('match_sessions', [
            'id' => $friendship->direct_match_session_id,
            'type' => 'direct',
            'status' => 'active',
        ]);
    }

    public function test_direct_friend_chat_does_not_override_random_matching_status(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        $directSession = MatchSession::create([
            'initiator_id' => $firstUser->id,
            'partner_id' => $secondUser->id,
            'type' => 'direct',
            'status' => 'active',
            'started_at' => now(),
        ]);

        Friendship::create([
            'user_one_id' => min($firstUser->id, $secondUser->id),
            'user_two_id' => max($firstUser->id, $secondUser->id),
            'requested_by_id' => $firstUser->id,
            'direct_match_session_id' => $directSession->id,
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        $this
            ->actingAs($firstUser)
            ->getJson('/matching/status')
            ->assertOk()
            ->assertJsonPath('state', 'idle');
    }

    public function test_random_matching_status_includes_friendship_state_for_both_users(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();

        $session = MatchSession::create([
            'initiator_id' => $firstUser->id,
            'partner_id' => $secondUser->id,
            'type' => 'random',
            'status' => 'active',
            'started_at' => now(),
        ]);

        $friendship = Friendship::create([
            'user_one_id' => min($firstUser->id, $secondUser->id),
            'user_two_id' => max($firstUser->id, $secondUser->id),
            'requested_by_id' => $firstUser->id,
            'status' => 'pending',
        ]);

        $this
            ->actingAs($firstUser)
            ->getJson('/matching/status')
            ->assertOk()
            ->assertJsonPath('match.id', $session->id)
            ->assertJsonPath('match.friendship.id', $friendship->id)
            ->assertJsonPath('match.friendship.status', 'pending')
            ->assertJsonPath('match.friendship.requested_by_me', true);

        $this
            ->actingAs($secondUser)
            ->getJson('/matching/status')
            ->assertOk()
            ->assertJsonPath('match.friendship.id', $friendship->id)
            ->assertJsonPath('match.friendship.status', 'pending')
            ->assertJsonPath('match.friendship.requested_by_me', false);

        $friendship->update(['status' => 'accepted', 'accepted_at' => now()]);

        $this
            ->actingAs($firstUser)
            ->getJson('/matching/status')
            ->assertOk()
            ->assertJsonPath('match.friendship.status', 'accepted');
    }
}
