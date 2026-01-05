<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class GameController extends Controller
{
    public function __invoke()
    {
        // Cache categories + words to reduce queries on repeat loads.
        $categories = Cache::remember('game.categories-with-words', 60, function () {
            return Category::with('words:id,category_id,value')
                ->orderBy('name')
                ->get()
                ->map(function (Category $category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'words' => $category->words->pluck('value')->values(),
                    ];
                });
        });

        return Inertia::render('Welcome', [
            'categories' => $categories,
        ]);
    }
}
