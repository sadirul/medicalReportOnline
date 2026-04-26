<?php

namespace App\Notifications;

use App\Models\SharedReport;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class IncomingSharedReportNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly SharedReport $sharedReport,
        private readonly User $sender,
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
        $clinicName = $this->sender->clinic_name ?: $this->sender->full_name;

        return [
            'type' => 'incoming_shared_report',
            'shared_report_id' => $this->sharedReport->id,
            'shared_report_uuid' => $this->sharedReport->uuid,
            'title' => 'New report received',
            'message' => sprintf('A new report for %s has been sent by %s.', $this->sharedReport->patient_name, $clinicName),
            'sender_clinic_name' => $this->sender->clinic_name,
            'sender_name' => $this->sender->full_name,
            'sender_logo' => $this->sender->logo,
            'sender_initials' => $this->buildInitials($clinicName),
            'target_url' => route('clinics.client.show', $this->sharedReport),
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
