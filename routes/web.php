<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GameSessionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', GameController::class);
Route::post('/games', [GameSessionController::class, 'store'])->name('games.store');
Route::get('/games/{game:slug}', [GameSessionController::class, 'showLobby'])->name('games.lobby');
Route::post('/games/{game:slug}/reveal/{player}', [GameSessionController::class, 'revealCard'])->name('games.reveal');
Route::get('/games/{game:slug}/messages', [GameSessionController::class, 'messages'])->name('games.messages');
Route::post('/games/{game:slug}/messages', [GameSessionController::class, 'sendMessage'])->name('games.messages.send');
Route::get('/games/{game:slug}/players/{token}', [GameSessionController::class, 'showPlayer'])->name('games.player');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
