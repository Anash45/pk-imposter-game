<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-JB97MDCF9V"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag("js", new Date());

        gtag("config", "G-JB97MDCF9V");
    </script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta
      name="description"
      content="Pakistani Imposter Game - A fun multiplayer party game featuring Pakistani culture, foods, occupations, and traditions. Perfect for family gatherings and social events."
    />
    <meta
      name="keywords"
      content="Pakistani game, imposter game, party game, Pakistani culture, word game, family game, multiplayer game, Pakistani words, Desi game"
    />
    <meta name="author" content="Pakistani Imposter Game" />
    <meta
      name="robots"
      content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
    />
    <meta name="language" content="English" />
    <meta name="revisit-after" content="7 days" />
    <meta name="theme-color" content="#ff4081" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta
      name="apple-mobile-web-app-status-bar-style"
      content="black-translucent"
    />
    <meta name="apple-mobile-web-app-title" content="Imposter Game" />
    <meta name="application-name" content="Pakistani Imposter Game" />
    <meta name="mobile-web-app-capable" content="yes" />

    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://imposter.f4futuretech.com/" />
    <meta
      property="og:title"
      content="Pakistani Imposter Game - Desi Party Game"
    />
    <meta
      property="og:description"
      content="Play the Pakistani Imposter Game online! Identify the imposter while learning about Pakistani culture, foods, and traditions. Fun for families and parties."
    />
    <meta
      property="og:image"
      content="https://imposter.f4futuretech.com/images/logo.png"
    />
    <meta property="og:site_name" content="Pakistani Imposter Game" />

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta
      name="twitter:title"
      content="Pakistani Imposter Game - Fun Party Game"
    />
    <meta
      name="twitter:description"
      content="Challenge your friends! Play the Pakistani Imposter Game online with Pakistani words and cultural themes. Free multiplayer party game."
    />
    <meta
      name="twitter:image"
      content="https://imposter.f4futuretech.com/images/logo.png"
    />

    <!-- Windows Metro Tile -->
    <meta
      name="msapplication-config"
      content="./images/favicons/browserconfig.xml"
    />
    <meta name="msapplication-TileColor" content="#00bcd4" />
    {{-- CSRF tag --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Pakistani Imposter Game - Online Party Game</title>

    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="/images/favicons/favicon.ico" />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="/images/favicons/favicon-32x32.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="/images/favicons/favicon-16x16.png"
    />
    <link
      rel="apple-touch-icon"
      href="/images/favicons/apple-touch-icon.png"
    />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="/images/favicons/apple-touch-icon.png"
    />
    <link
      rel="manifest"
      href="/images/favicons/site.webmanifest"
      crossorigin="use-credentials"
    />
    <link rel="canonical" href="https://imposter.f4futuretech.com/" />

    <!-- PWA Meta Tags -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="format-detection" content="telephone=no">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
    @inertiaHead

    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/service-worker.js')
                    .then(registration => {
                        console.log('SW registered:', registration);
                    })
                    .catch(err => {
                        console.log('SW registration failed:', err);
                    });
            });
        }
    </script>
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>