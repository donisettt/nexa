<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_sessions', function (Blueprint $table) {
            $table->string('type', 20)->default('random')->after('partner_id')->index();
        });

        Schema::create('friendships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_one_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_two_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('requested_by_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('direct_match_session_id')->nullable()->constrained('match_sessions')->nullOnDelete();
            $table->string('status', 20)->default('pending')->index();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();

            $table->unique(['user_one_id', 'user_two_id']);
            $table->index(['user_one_id', 'status']);
            $table->index(['user_two_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friendships');

        Schema::table('match_sessions', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
