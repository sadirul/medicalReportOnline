<?php

namespace App\Notifications;

use App\Models\SharedReport;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class SharedReportPublishedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly SharedReport $sharedReport,
        private readonly User $receiver,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $clinicName = $this->receiver->clinic_name ?: $this->receiver->full_name;

        return [
            'type' => 'shared_report_published',
            'shared_report_id' => $this->sharedReport->id,
            'shared_report_uuid' => $this->sharedReport->uuid,
            'title' => 'Report published',
            'message' => sprintf('A new report for %s has been published by %s.', $this->sharedReport->patient_name, $clinicName),
            'receiver_clinic_name' => $this->receiver->clinic_name,
            'receiver_name' => $this->receiver->full_name,
            'receiver_logo' => $this->receiver->logo,
            'receiver_initials' => $this->buildInitials($clinicName),
            'target_url' => route('clinics.requested.index'),
        ];
    }

    private function buildInitials(string $value): string
    {
        return Str::of($value)
            ->explode(' ')
            ->filter()
            ->take(2)
            ->map(fn (string $part) => Str::upper(Str::substr($part, 0, 1)))
            ->implode('');
    }
}
