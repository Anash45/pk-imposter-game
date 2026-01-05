<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->foreignId('moderator_id')->nullable()->constrained('users')->cascadeOnDelete()->after('id');
            $table->string('game_code', 6)->unique()->nullable()->after('slug');
            $table->enum('game_status', ['waiting', 'active', 'finished'])->default('waiting')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['moderator_id']);
            $table->dropColumn('moderator_id', 'game_code', 'game_status');
        });
    }
};
