<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'flash' => [
                'status' => $request->session()->get('status'),
                'status_type' => $request->session()->get('status_type'),
                'otp_sent' => $request->session()->get('otp_sent', false),
            ],
            'auth' => [
                'user' => $request->user(),
            ],
            'notifications' => $request->user()
                ? [
                    'unread_count' => $request->user()->unreadNotifications()->count(),
                    'items' => $request->user()
                        ->notifications()
                        ->latest()
                        ->limit(10)
                        ->get()
                        ->map(fn (DatabaseNotification $notification): array => [
                            'id' => $notification->id,
                            'type' => (string) data_get($notification->data, 'type', ''),
                            'title' => (string) data_get($notification->data, 'title', ''),
                            'message' => (string) data_get($notification->data, 'message', ''),
                            'target_url' => (string) data_get($notification->data, 'target_url', route('dashboard')),
                            'icon_type' => in_array((string) data_get($notification->data, 'type', ''), ['incoming_shared_report', 'shared_report_published'], true)
                                ? 'report'
                                : 'avatar',
                            'actor_name' => (string) (data_get($notification->data, 'sender_clinic_name')
                                ?? data_get($notification->data, 'receiver_clinic_name')
                                ?? ''),
                            'actor_logo' => (string) (data_get($notification->data, 'sender_logo')
                                ?? data_get($notification->data, 'receiver_logo')
                                ?? ''),
                            'actor_initials' => (string) (data_get($notification->data, 'sender_initials')
                                ?? data_get($notification->data, 'receiver_initials')
                                ?? ''),
                            'read_at' => $notification->read_at?->toIso8601String(),
                            'created_at' => $notification->created_at?->toIso8601String(),
                        ])
                        ->values(),
                ]
                : [
                    'unread_count' => 0,
                    'items' => [],
                ],
        ]);
    }
}
