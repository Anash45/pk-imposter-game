<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Game;
use App\Models\GameMessage;
use App\Models\GamePlayer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GameSessionController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'mode' => 'required|in:online',
            'players' => 'required|array|min:3',
            'players.*' => 'required|string|min:1|max:100',
            'categories' => 'required|array|min:1',
            'categories.*' => 'required|string',
        ]);

        $categories = Category::with('words:id,category_id,value')
            ->whereIn('name', $data['categories'])
            ->get();

        $wordPool = $categories
            ->flatMap(fn ($cat) => $cat->words->pluck('value'))
            ->values();

        abort_if($wordPool->count() < 30, 422, 'Need at least 30 words from selected categories.');

        $word = $wordPool->shuffle()->first();
        $slug = Str::lower(Str::random(10));
        $imposterIndex = random_int(0, count($data['players']) - 1);

        $game = Game::create([
            'slug' => $slug,
            'mode' => 'online',
            'categories' => $data['categories'],
            'word' => $word,
            'status' => 'active',
        ]);

        $players = [];
        foreach (array_values($data['players']) as $idx => $name) {
            $token = Str::random(40);
            $player = GamePlayer::create([
                'game_id' => $game->id,
                'name' => $name,
                'token' => $token,
                'is_imposter' => $idx === $imposterIndex,
                'position' => $idx,
            ]);

            $players[] = [
                'name' => $player->name,
                'url' => URL::route('games.player', ['game' => $game->slug, 'token' => $token]),
            ];
        }

        return response()->json([
            'game' => [
                'slug' => $game->slug,
            ],
            'players' => $players,
        ], 201);
    }

    public function showLobby(Game $game)
    {
        $players = $game->players()
            ->orderBy('position')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'position' => $p->position,
                'hasViewed' => $p->viewed_at !== null,
            ]);

        $voiceUrl = sprintf('https://meet.jit.si/pk-imposter-%s', $game->slug);

        return Inertia::render('GameLobby', [
            'gameSlug' => $game->slug,
            'players' => $players,
            'voiceUrl' => $voiceUrl,
        ]);
    }

    public function revealCard(Game $game, GamePlayer $player)
    {
        abort_if($player->game_id !== $game->id, 404);

        $alreadyViewed = $player->viewed_at !== null;

        if (! $alreadyViewed) {
            $player->forceFill(['viewed_at' => now()])->save();
        }

        return response()->json([
            'alreadyViewed' => $alreadyViewed,
            'isImposter' => $player->is_imposter,
            'word' => $alreadyViewed ? null : $game->word,
        ]);
    }

    public function messages(Game $game)
    {
        $messages = GameMessage::where('game_id', $game->id)
            ->latest()
            ->take(100)
            ->get()
            ->sortBy('id')
            ->values()
            ->map(fn ($m) => [
                'id' => $m->id,
                'sender' => $m->sender ?? 'Player',
                'body' => $m->body,
                'created_at' => $m->created_at->toIso8601String(),
            ]);

        return response()->json(['messages' => $messages]);
    }

    public function sendMessage(Request $request, Game $game)
    {
        $data = $request->validate([
            'sender' => 'nullable|string|max:100',
            'body' => 'required|string|max:1000',
        ]);

        $message = GameMessage::create([
            'game_id' => $game->id,
            'sender' => $data['sender'] ?? 'Player',
            'body' => $data['body'],
        ]);

        return response()->json([
            'message' => [
                'id' => $message->id,
                'sender' => $message->sender ?? 'Player',
                'body' => $message->body,
                'created_at' => $message->created_at->toIso8601String(),
            ],
        ], 201);
    }

    public function showPlayer(Game $game, string $token)
    {
        $player = $game->players()->where('token', $token)->firstOrFail();
        $alreadyViewed = $player->viewed_at !== null;

        $voiceUrl = sprintf('https://meet.jit.si/pk-imposter-%s', $game->slug);

        if (! $alreadyViewed) {
            $player->forceFill(['viewed_at' => now()])->save();
        }

        return Inertia::render('PlayerCard', [
            'playerName' => $player->name,
            'alreadyViewed' => $alreadyViewed,
            'isImposter' => $player->is_imposter,
            'word' => $alreadyViewed ? null : $game->word,
            'voiceUrl' => $voiceUrl,
            'gameSlug' => $game->slug,
        ]);
    }
}
