<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GamePlayer extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'name',
        'token',
        'is_imposter',
        'position',
        'viewed_at',
    ];

    protected $casts = [
        'is_imposter' => 'boolean',
        'viewed_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Game, GamePlayer>
     */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
