# 🎯 Quick Reference Guide

## URLs for Users

### Authenticated Users
| Page | URL | Purpose |
|------|-----|---------|
| Game Hub | `/games-hub` | Create or join games |
| Moderator Dashboard | `/authenticated-games/{slug}/moderator` | Control & configure |
| Player Lobby | `/authenticated-games/{slug}/lobby/{id}` | Wait & view card |

## Key Files to Modify

### Add a new moderator feature?
Edit: `resources/js/Pages/ModeratorDashboard.jsx`

### Add a new player feature?
Edit: `resources/js/Pages/PlayerLobby.jsx`

### Add a new endpoint?
1. Add method to `app/Http/Controllers/GameLobbyController.php`
2. Add route to `routes/web.php`
3. Add React component or fetch call

### Change authentication logic?
Edit: `app/Policies/GamePolicy.php`

## API Request Examples

### Create Game
```bash
curl -X POST /authenticated-games \
  -H "X-CSRF-Token: {token}" \
  -H "Content-Type: application/json"
```

### Join Game
```bash
curl -X POST /authenticated-games/join \
  -H "X-CSRF-Token: {token}" \
  -H "Content-Type: application/json" \
  -d '{"game_code":"ABC123"}'
```

### Start Game
```bash
curl -X POST /authenticated-games/{slug}/start \
  -H "X-CSRF-Token: {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "categories":["Food","Animals"],
    "imposters":2
  }'
```

### Get Card
```bash
curl -X GET /authenticated-games/{slug}/card/{token} \
  -H "Accept: application/json"
```

## Database Quick Queries

### View all games
```sql
SELECT id, game_code, moderator_id, game_status FROM games;
```

### View game players
```sql
SELECT * FROM game_players WHERE game_id = 1;
```

### Check imposters for game
```sql
SELECT name FROM game_players 
WHERE game_id = 1 AND is_imposter = 1;
```

### Get moderator of game
```sql
SELECT u.name FROM games g
JOIN users u ON g.moderator_id = u.id
WHERE g.id = 1;
```

## Environment Variables (if needed)

```env
# .env file - should already be configured
APP_DEBUG=true  # For development
LOG_CHANNEL=single
```

## Deployment Checklist

- [ ] Run migrations on production: `php artisan migrate`
- [ ] Clear caches: `php artisan cache:clear`
- [ ] Build frontend: `npm run build`
- [ ] Set `APP_DEBUG=false` in production
- [ ] Configure SMTP for emails (if needed)

## Troubleshooting

### "Route not found"
→ Check spelling in `/routes/web.php`

### "Unauthorized" error
→ Check if user is authenticated
→ Check if authorization policy allows action

### Card not appearing
→ Check browser console for JavaScript errors
→ Verify polling is running (Network tab)
→ Check game_status is 'active'

### Game code not working
→ Verify it's exactly 6 characters
→ Check case doesn't matter (auto-uppercase)
→ Verify game status is 'waiting'

### Players not showing in moderator view
→ Refresh page
→ Check database: `SELECT COUNT(*) FROM game_players WHERE game_id = X;`
→ Verify players joined correct game_id

## Performance Tips

- Polling every 2 seconds is good for most networks
- Change interval in PlayerLobby.jsx if needed:
  ```javascript
  const pollInterval = setInterval(() => { ... }, 2000); // milliseconds
  ```

- For better performance, consider WebSockets:
  ```javascript
  // Future enhancement:
  // npm install laravel-echo pusher-js
  // window.Echo.channel(`game.${gameSlug}`)
  //   .listen('GameStarted', () => { fetchCard(); })
  ```

## Feature Flags (Future)

```javascript
// In components, wrap future features:
const FEATURE_WEBSOCKETS = false;
const FEATURE_CHAT = false;
const FEATURE_LEADERBOARD = false;

if (FEATURE_WEBSOCKETS) {
  // Use WebSockets instead of polling
}
```

## Role-Based Access (Future)

Users table now has `role` field ready for:
```php
// In policies
if ($user->role === 'admin') { ... }
if ($user->role === 'moderator') { ... }
```

## Common Modifications

### Change polling interval
**File**: `resources/js/Pages/PlayerLobby.jsx` line ~40
```javascript
const pollInterval = setInterval(async () => {
  // Change 2000 to desired milliseconds
}, 2000);
```

### Change game code length
**File**: `app/Http/Controllers/GameLobbyController.php` line ~27
```php
$gameCode = strtoupper(Str::random(6)); // Change 6 to desired length
```

### Change max imposters calculation
**File**: `app/Http/Controllers/GameLobbyController.php` line ~122
```php
if ($playerCount >= 10) $imposterCount = min($imposterCount, 3); // Modify
```

### Change minimum word requirement
**File**: `resources/js/Pages/ModeratorDashboard.jsx` line ~4
```javascript
const MIN_WORDS = 30; // Change as needed
```

---

**Save this file for quick reference while developing!** 📌
