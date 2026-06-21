<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matching_queues', function (Blueprint $table) {
            // 'chat' | 'call'
            $table->string('mode', 10)->default('chat')->after('status');
        });

        Schema::table('match_sessions', function (Blueprint $table) {
            // 'chat' | 'call'
            $table->string('mode', 10)->default('chat')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('matching_queues', function (Blueprint $table) {
            $table->dropColumn('mode');
        });

        Schema::table('match_sessions', function (Blueprint $table) {
            $table->dropColumn('mode');
        });
    }
};
