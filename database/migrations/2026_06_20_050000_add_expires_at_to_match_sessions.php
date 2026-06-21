<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_sessions', function (Blueprint $table) {
            $table->timestamp('chat_expires_at')->nullable()->after('started_at');
        });
    }

    public function down(): void
    {
        Schema::table('match_sessions', function (Blueprint $table) {
            $table->dropColumn('chat_expires_at');
        });
    }
};
