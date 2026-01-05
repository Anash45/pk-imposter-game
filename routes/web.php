<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\GameLobbyController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GameSessionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest routes
Route::get('/', GameController::class);
Route::post('/games', [GameSessionController::class, 'store'])->name('games.store');
Route::get('/games/{game:slug}', [GameSessionController::class, 'showLobby'])->name('games.lobby');
Route::post('/games/{game:slug}/reveal/{player}', [GameSessionController::class, 'revealCard'])->name('games.reveal');
Route::get('/games/{game:slug}/messages', [GameSessionController::class, 'messages'])->name('games.messages');
Route::post('/games/{game:slug}/messages', [GameSessionController::class, 'sendMessage'])->name('games.messages.send');
Route::get('/games/{game:slug}/players/{token}', [GameSessionController::class, 'showPlayer'])->name('games.player');

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::get('/games-hub', function () {
        return Inertia::render('GameHub');
    })->name('games.hub');
    
    Route::post('/authenticated-games', [GameLobbyController::class, 'createGame'])->name('games.create-authenticated');
    Route::post('/authenticated-games/join', [GameLobbyController::class, 'joinGame'])->name('games.join');
    Route::get('/authenticated-games/{game:slug}/moderator', [GameLobbyController::class, 'showModerator'])->name('games.moderator');
    Route::get('/authenticated-games/{game:slug}/lobby/{playerToken}', [GameLobbyController::class, 'showPlayerLobby'])->name('games.player-lobby');
    Route::get('/authenticated-games/{game:slug}/card/{token}', [GameLobbyController::class, 'getCard'])->name('games.card');
    Route::post('/authenticated-games/{game:slug}/start', [GameLobbyController::class, 'startGame'])->name('games.start');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
