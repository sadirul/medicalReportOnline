<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="application-name" content="{{ config('app.name', 'Laravel') }}">
        <meta name="theme-color" content="#2563eb">
        <meta name="description" content="Manage diagnostics online with secure records, smart workflows, and faster report delivery for your clinic.">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
        <link rel="manifest" href="/manifest.webmanifest">
        <link rel="canonical" href="{{ url()->current() }}">
        <link rel="sitemap" type="application/xml" href="{{ url('/sitemap.xml') }}">

        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ config('app.name', 'Laravel') }}">
        <meta property="og:description" content="Manage diagnostics online with secure records, smart workflows, and faster report delivery for your clinic.">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ asset('assets/images/logo.jpeg') }}">
        <meta property="og:site_name" content="{{ config('app.name', 'Laravel') }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('app.name', 'Laravel') }}">
        <meta name="twitter:description" content="Manage diagnostics online with secure records, smart workflows, and faster report delivery for your clinic.">
        <meta name="twitter:image" content="{{ asset('assets/images/logo.jpeg') }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        @php
            $seoSchema = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    [
                        '@type' => 'WebSite',
                        '@id' => url('/').'/#website',
                        'url' => url('/').'/',
                        'name' => config('app.name', 'Laravel'),
                        'description' => 'Manage diagnostics online with secure records, smart workflows, and faster report delivery for your clinic.',
                    ],
                    [
                        '@type' => 'Organization',
                        '@id' => url('/').'/#organization',
                        'name' => config('app.name', 'Laravel'),
                        'url' => url('/').'/',
                        'logo' => asset('assets/images/logo.jpeg'),
                    ],
                ],
            ];
        @endphp
        <script type="application/ld+json">{!! json_encode($seoSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
