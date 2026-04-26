<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (DatabaseNotification $notification): array => [
                'id' => $notification->id,
                'read_at' => $notification->read_at?->toIso8601String(),
                'created_at' => $notification->created_at?->toIso8601String(),
                'data' => $notification->data,
            ])
            ->values();

        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
            'items' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, string $notification): RedirectResponse
    {
        $notificationModel = $request->user()
            ->notifications()
            ->whereKey($notification)
            ->firstOrFail();

        if ($notificationModel->read_at === null) {
            $notificationModel->markAsRead();
        }

        $targetUrl = (string) data_get($notificationModel->data, 'target_url', route('dashboard'));

        return redirect()->to($targetUrl);
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
