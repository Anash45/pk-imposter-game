<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'game_code',
        'moderator_id',
        'mode',
        'categories',
        'word',
        'imposters_count',
        'status',
        'game_status',
        'next_game_slug',
    ];

    protected $casts = [
        'categories' => 'array',
    ];

    /**
     * @return HasMany<GamePlayer>
     */
    public function players(): HasMany
    {
        return $this->hasMany(GamePlayer::class);
    }

    /**
     * @return BelongsTo
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'moderator_id');
    }
}
