<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Word extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'value',
    ];

    /**
     * @return BelongsTo<Category, Word>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
