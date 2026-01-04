# Pakistani Imposter Game - PWA Setup

This Laravel application is configured as a Progressive Web App (PWA).

## PWA Features

✅ **Installable** - Users can install the app on their devices
✅ **Offline Support** - Basic offline functionality via Service Worker
✅ **App-like Experience** - Standalone display mode
✅ **Responsive** - Works on all device sizes
✅ **Fast Loading** - Cached assets for quick loads

## Production Deployment Checklist

### 1. Environment Configuration
Update `.env` file:
```env
APP_NAME="Pakistani Imposter Game"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://imposter.f4futuretech.com
```

### 2. Build Assets
```bash
npm run build
```

### 3. Optimize Laravel
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 4. Set Permissions
```bash
chmod -R 755 storage bootstrap/cache
```

### 5. SSL Certificate
Ensure HTTPS is configured for PWA to work properly. PWAs require secure contexts.

### 6. Server Configuration

**Apache (.htaccess already configured)**

**Nginx** - Add to your server block:
```nginx
location /service-worker.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

location /images/favicons/site.webmanifest {
    add_header Content-Type "application/manifest+json";
    add_header Access-Control-Allow-Origin "*";
}
```

## Testing PWA

### Local Testing
1. Serve over HTTPS (required for PWA):
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

2. Use ngrok for HTTPS testing:
```bash
ngrok http 8000
```

### PWA Audit
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

### Install PWA
- **Desktop**: Look for install icon in address bar
- **Mobile**: Use browser menu → "Add to Home Screen"

## Files Structure

```
public/
├── service-worker.js              # Service worker for offline support
├── images/
│   └── favicons/
│       ├── site.webmanifest      # PWA manifest file
│       ├── browserconfig.xml     # Windows tile config
│       ├── android-chrome-*.png  # Android icons
│       ├── apple-touch-icon.png  # iOS icon
│       └── favicon-*.png         # Favicons
resources/
└── views/
    └── app.blade.php             # Contains PWA meta tags & SW registration
```

## Service Worker Cache Strategy

**Network First, Cache Fallback**
- Attempts to fetch from network first
- Falls back to cache if offline
- Automatically caches fetched resources

## Updating the PWA

When you make changes:
1. Update `CACHE_NAME` in `public/service-worker.js`
2. Rebuild assets: `npm run build`
3. The service worker will auto-update on next visit

## Domain Configuration

Production domain: `https://imposter.f4futuretech.com`

Make sure to:
- Point DNS to your server
- Configure SSL certificate
- Update `APP_URL` in `.env`
- Clear all caches after deployment

## Support

For PWA issues, check:
- Browser console for service worker logs
- Chrome DevTools → Application → Service Workers
- Chrome DevTools → Application → Manifest
