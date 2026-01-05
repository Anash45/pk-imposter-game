# Quick Start Guide - Authenticated Game Flow

## Setup Steps

1. **Ensure migrations are run:**
   ```bash
   php artisan migrate
   ```

2. **Register a user account:**
   - Go to `/register`
   - Create account with email and password

3. **Access Game Hub:**
   - After login, go to `/games-hub`
   - Two options available:
     - **Create Game** (become moderator)
     - **Join Game** (enter game code)

## Moderator Workflow

1. Click "Create New Game"
2. Get redirected to Moderator Dashboard with:
   - **Game Code** at top (share this with players)
   - **Players List** (auto-updates as players join)
   - **Category Selection** (pick what to play)
   - **Imposters Count** (how many imposters)
3. Select at least 30 words worth of categories
4. Choose number of imposters
5. Click "Start Game!" button

## Player Workflow

1. Ask moderator for 6-character **Game Code**
2. Go to `/games-hub`
3. Enter the code in "Join Game" section
4. Click "Join Game"
5. Wait in lobby for moderator to start
6. When game starts, **touch & hold card** to reveal:
   - If you're the imposter: "YOU ARE THE IMPOSTER!"
   - If you're not: The secret word
7. Once viewed, card is locked (can't view again)

## Key URLs

- `/games-hub` - Create/Join games (requires auth)
- `/authenticated-games/{slug}/moderator` - Moderator dashboard
- `/authenticated-games/{slug}/lobby/{playerToken}` - Player lobby
- `/dashboard` - Main dashboard

## Notes

- Game codes are 6 random characters, case-insensitive
- Each game must have at least 30 words from selected categories
- Maximum imposters allowed depends on player count:
  - 3-5 players: max 1 imposter
  - 6-9 players: max 2 imposters
  - 10+ players: max 3 imposters
- Players can't join after game starts
- Viewing a card marks it as "already viewed" for everyone

## Troubleshooting

**"Game has already started"** - You're trying to join a game that started
**"Need 30+ words"** - Select more categories before starting
**"You have already joined"** - You're already in this game
**Game code not found** - Check spelling (6 characters)

## Testing

### Test Account:
```
Email: test@example.com
Password: password
```

Create this with:
```bash
php artisan tinker
>>> User::create(['name' => 'Test', 'email' => 'test@example.com', 'password' => Hash::make('password')])
```

### Test Flow:
1. Login with test@example.com
2. Create 2 games in separate browser tabs
3. Join first game from second account in incognito window
4. Start game, watch cards reveal in real-time
