<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Game;
use App\Models\GamePlayer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GameLobbyController extends Controller
{
    /**
     * Create a new game with a shareable code
     */
    public function createGame(Request $request)
    {
        $user = Auth::user();

        // Generate unique game code
        $gameCode = strtoupper(Str::random(6));
        while (Game::where('game_code', $gameCode)->exists()) {
            $gameCode = strtoupper(Str::random(6));
        }

        $game = Game::create([
            'moderator_id' => $user->id,
            'slug' => Str::lower(Str::random(10)),
            'game_code' => $gameCode,
            'mode' => 'authenticated',
            'categories' => [],
            'word' => '',
            'game_status' => 'waiting',
            'status' => 'active',
        ]);

        // Add moderator as a player (optional, or they manage from dashboard)
        GamePlayer::create([
            'game_id' => $game->id,
            'name' => $user->name,
            'token' => Str::random(40),
            'position' => 0,
            'is_moderator' => true,
        ]);

        return response()->json([
            'game_code' => $game->game_code,
            'game_id' => $game->id,
            'slug' => $game->slug,
        ], 201);
    }

    /**
     * Join a game using code
     */
    public function joinGame(Request $request)
    {
        $data = $request->validate([
            'game_code' => 'required|string|size:6',
        ]);

        $user = Auth::user();
        $game = Game::where('game_code', strtoupper($data['game_code']))->firstOrFail();

        // Check if user already joined
        if ($game->players()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'You have already joined this game',
            ], 409);
        }

        // Check if game is still in waiting status
        if ($game->game_status !== 'waiting') {
            return response()->json([
                'message' => 'Game has already started',
            ], 422);
        }

        $position = $game->players()->count();
        $token = Str::random(40);

        $player = GamePlayer::create([
            'game_id' => $game->id,
            'user_id' => $user->id,
            'name' => $user->name,
            'token' => $token,
            'position' => $position,
            'is_moderator' => false,
        ]);

        return response()->json([
            'game_id' => $game->id,
            'slug' => $game->slug,
            'player_id' => $player->id,
        ], 201);
    }

    /**
     * Show moderator dashboard
     */
    public function showModerator(Game $game)
    {
        $this->authorize('isModerator', $game);

        $players = $game->players()
            ->where('is_moderator', false)
            ->orderBy('position')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'position' => $p->position,
                'hasViewed' => $p->viewed_at !== null,
            ]);

        $categories = Category::with('words:id,category_id,value')->get();

        return Inertia::render('ModeratorDashboard', [
            'gameCode' => $game->game_code,
            'gameSlug' => $game->slug,
            'gameStatus' => $game->game_status,
            'players' => $players,
            'categories' => $categories,
            'selectedCategories' => $game->categories ?? [],
            'impostersCount' => $game->imposters_count ?? 1,
            'word' => $game->word,
        ]);
    }

    /**
     * Show player lobby (wait for moderator to start)
     */
    public function showPlayerLobby(Game $game, int $playerToken)
    {
        $player = $game->players()->findOrFail($playerToken);

        $players = $game->players()
            ->where('is_moderator', false)
            ->orderBy('position')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'position' => $p->position,
            ]);

        return Inertia::render('PlayerLobby', [
            'gameSlug' => $game->slug,
            'playerToken' => $playerToken,
            'playerName' => $player->name,
            'players' => $players,
            'gameStatus' => $game->game_status,
        ]);
    }

    /**
     * Moderator starts the game
     */
    public function startGame(Request $request, Game $game)
    {
        $this->authorize('isModerator', $game);

        $data = $request->validate([
            'categories' => 'required|array|min:1',
            'categories.*' => 'required|string',
            'imposters' => 'required|integer|min:1|max:5',
        ]);

        $categories = Category::with('words:id,category_id,value')
            ->whereIn('name', $data['categories'])
            ->get();

        $wordPool = $categories
            ->flatMap(fn ($cat) => $cat->words->pluck('value'))
            ->values();

        if ($wordPool->count() < 30) {
            return response()->json([
                'message' => 'Need at least 30 words from selected categories',
            ], 422);
        }

        $word = $wordPool->shuffle()->first();
        $playerCount = $game->players()->where('is_moderator', false)->count();
        $imposterCount = min($data['imposters'], $playerCount);

        // Calculate max imposters based on player count
        if ($playerCount >= 10) $imposterCount = min($imposterCount, 3);
        elseif ($playerCount >= 6) $imposterCount = min($imposterCount, 2);
        else $imposterCount = min($imposterCount, 1);

        // Randomly select imposter indexes
        $allIndexes = range(0, $playerCount - 1);
        shuffle($allIndexes);
        $imposterIndexes = array_slice($allIndexes, 0, $imposterCount);

        // Update game
        $game->update([
            'categories' => $data['categories'],
            'word' => $word,
            'imposters_count' => $imposterCount,
            'game_status' => 'active',
        ]);

        // Mark imposters
        $players = $game->players()->where('is_moderator', false)->orderBy('position')->get();
        foreach ($players as $idx => $player) {
            $player->update([
                'is_imposter' => in_array($idx, $imposterIndexes),
            ]);
        }

        return response()->json([
            'message' => 'Game started',
            'word' => $word,
            'impostersCount' => $imposterCount,
        ], 200);
    }

    /**
     * Get player's card
     */
    public function getCard(Game $game, string $token)
    {
        $player = $game->players()->where('token', $token)->firstOrFail();

        if ($game->game_status !== 'active') {
            return response()->json([
                'message' => 'Game has not started yet',
            ], 422);
        }

        $alreadyViewed = $player->viewed_at !== null;

        if (!$alreadyViewed) {
            $player->update(['viewed_at' => now()]);
        }

        return response()->json([
            'alreadyViewed' => $alreadyViewed,
            'isImposter' => $player->is_imposter,
            'word' => $alreadyViewed ? null : $game->word,
        ]);
    }
}
