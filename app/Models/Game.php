<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'mode',
        'categories',
        'word',
        'status',
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
}
