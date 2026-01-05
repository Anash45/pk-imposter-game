# System Architecture Diagram

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Laravel Breeze Auth                         │
│              (Login/Register/User Management)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        GameHub.jsx                              │
│                   (/games-hub route)                            │
├─────────────────────┬───────────────────────────────────────────┤
│  Create Game        │  Join Game                                │
│  • POST /auth...    │  • POST /auth.../join                     │
│  • Returns code     │  • Takes 6-char code                      │
│  • -> Moderator     │  • -> PlayerLobby                         │
└─────────────────────┴───────────────────────────────────────────┘
          ↓                          ↓
    ┌──────────────┐         ┌───────────────┐
    │  Moderator   │         │ PlayerLobby   │
    │  Dashboard   │         │  (Polling)    │
    ├──────────────┤         ├───────────────┤
    │• Show Code   │         │• Player List  │
    │• Add Players │         │• Status: Wait │
    │• Select Cats │         │• Poll every 2s│
    │• Set Imposters          │• Auto-fetch   │
    │• START GAME  │         │  when ready   │
    └──────────────┘         └───────────────┘
          ↓                          ↓
    ┌──────────────────────────────────────────┐
    │   POST /start (GameLobbyController)      │
    │  • Validate categories (30+ words)       │
    │  • Calculate imposters                   │
    │  • Pick random imposters                 │
    │  • Update game_status to 'active'        │
    │  • Mark players as imposters             │
    └──────────────────────────────────────────┘
              ↓
    ┌──────────────────────────────────────────┐
    │   PlayerLobby detects game_status change │
    │   (via polling /card endpoint)           │
    └──────────────────────────────────────────┘
              ↓
    ┌──────────────────────────────────────────┐
    │   Cards Auto-Appear & Players            │
    │   Touch/Hold to Flip Card                │
    ├──────────────────────────────────────────┤
    │   Frontend: GET /card/{token}            │
    │   Backend:                               │
    │   • Check if imposter                    │
    │   • Get word (if not imposter)           │
    │   • Mark viewed_at                       │
    │   • Return isImposter + word             │
    └──────────────────────────────────────────┘
```

## Database Relationships

```
Users (Authentication)
  ├─ id
  ├─ name
  ├─ email
  ├─ password
  └─ role (new)
    │
    ├─→ has_many(Games as moderator) [moderator_id]
    └─→ has_many(GamePlayers) [user_id]


Games
  ├─ id
  ├─ slug (random string)
  ├─ game_code (unique 6-char) ← NEW
  ├─ moderator_id ← NEW (FK→Users)
  ├─ mode ('authenticated' | 'online' | 'offline')
  ├─ word (secret word)
  ├─ categories (JSON array)
  ├─ imposters_count ← NEW
  ├─ game_status ← NEW (waiting|active|finished)
  │
  └─→ has_many(GamePlayers)


GamePlayers
  ├─ id
  ├─ game_id (FK→Games)
  ├─ user_id ← NEW (FK→Users, nullable)
  ├─ name
  ├─ token (secret 40-char)
  ├─ is_imposter
  ├─ is_moderator ← NEW
  ├─ position
  └─ viewed_at (timestamp when card viewed)
```

## Request/Response Flow

### 1. Create Game
```
POST /authenticated-games
├─ Auth: User
├─ Body: {}
└─ Response:
   {
     "game_code": "ABC123",
     "slug": "x7f2p1w",
     "game_id": 42
   }
```

### 2. Join Game  
```
POST /authenticated-games/join
├─ Auth: User
├─ Body: { "game_code": "ABC123" }
└─ Response:
   {
     "game_id": 42,
     "slug": "x7f2p1w",
     "player_id": 15  ← Use for lobby route
   }
```

### 3. Start Game
```
POST /authenticated-games/{slug}/start
├─ Auth: User (must be moderator)
├─ Body: {
│   "categories": ["Food", "Animals"],
│   "imposters": 2
│ }
└─ Response:
   {
     "message": "Game started",
     "word": "Biryani",
     "impostersCount": 2
   }
```

### 4. Get Card
```
GET /authenticated-games/{slug}/card/{token}
├─ Response (first call):
│  {
│    "alreadyViewed": false,
│    "isImposter": false,
│    "word": "Biryani"
│  }
│
└─ Response (second call):
   {
     "alreadyViewed": true,
     "isImposter": false,
     "word": null  ← Hidden after first view
   }
```

## State Machine

```
Game Creation
    ↓
game_status = 'waiting' ← Players can join
    ↓
Moderator starts game
    ↓
game_status = 'active' ← No new joins allowed
    ↓
Players view cards
    ↓
Discussion & voting
    ↓
game_status = 'finished' ← Game over
```

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: User Authentication (Breeze)              │
│  └─ Required for all /authenticated-games routes   │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Layer 2: CSRF Token Validation                      │
│  └─ All POST/PUT/DELETE require X-CSRF-Token       │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Layer 3: Authorization Policies                     │
│  └─ GamePolicy checks moderator status             │
│  └─ Only moderator can start game                  │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Layer 4: Game Code Validation                       │
│  └─ 6-char random = hard to guess                  │
│  └─ Unique constraint in DB                        │
│  └─ Case-insensitive for UX                        │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Layer 5: Player Token (one-time card)              │
│  └─ 40-char random token                           │
│  └─ Marks viewed_at to prevent replay              │
│  └─ No re-fetching allowed after view              │
└─────────────────────────────────────────────────────┘
```

## Real-Time Updates (Polling)

```
PlayerLobby.jsx
  │
  └─→ setInterval(2000ms, () => {
        fetch(`/card/{token}`)
          └─→ If status === 422 (not started)
              │  Continue waiting...
              │
              └─→ If status === 200 (game started)
                 └─→ Fetch card automatically
                    └─→ Display on screen
      })
```

## File Organization

```
app/
├─ Http/Controllers/
│  ├─ GameLobbyController.php (NEW) ← Main logic
│  └─ GameSessionController.php (updated)
├─ Models/
│  ├─ Game.php (updated)
│  ├─ GamePlayer.php (updated)
│  └─ User.php (updated)
├─ Policies/
│  └─ GamePolicy.php (NEW) ← Authorization
└─ Providers/
   └─ AppServiceProvider.php (updated)

resources/js/Pages/
├─ GameHub.jsx (NEW) ← Create/Join
├─ ModeratorDashboard.jsx (NEW) ← Moderator settings
└─ PlayerLobby.jsx (NEW) ← Player waiting + cards

database/migrations/
├─ 2026_01_06_000000_add_imposters_count_to_games_table.php
├─ 2026_01_06_000001_add_role_to_users_table.php
├─ 2026_01_06_000002_add_moderator_and_code_to_games_table.php
└─ 2026_01_06_000003_add_user_and_moderator_to_game_players_table.php

routes/
└─ web.php (updated) ← 7 new authenticated routes
```

This architecture ensures:
✅ Secure user isolation  
✅ Real-time game state sync  
✅ Prevent duplicate joins  
✅ One-time card viewing  
✅ Moderator-only controls  
✅ Scalable to WebSockets later
