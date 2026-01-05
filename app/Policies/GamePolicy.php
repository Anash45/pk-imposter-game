<?php

namespace App\Policies;

use App\Models\Game;
use App\Models\User;

class GamePolicy
{
    /**
     * Determine if the user is the moderator
     */
    public function isModerator(User $user, Game $game): bool
    {
        return $user->id === $game->moderator_id;
    }

    /**
     * Determine if user can join the game
     */
    public function canJoin(User $user, Game $game): bool
    {
        return $game->game_status === 'waiting';
    }
}
