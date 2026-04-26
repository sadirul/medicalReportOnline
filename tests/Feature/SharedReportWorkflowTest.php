<?php

namespace Tests\Feature;

use App\Models\ClinicConnection;
use App\Models\Department;
use App\Models\Investigation;
use App\Models\SharedReport;
use App\Models\User;
use App\Notifications\IncomingSharedReportNotification;
use App\Notifications\SharedReportPublishedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

class SharedReportWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function connectUsers(User $a, User $b): void
    {
        [$leftId, $rightId] = [min($a->id, $b->id), max($a->id, $b->id)];
        ClinicConnection::query()->create([
            'clinic_user_id' => $leftId,
            'connected_clinic_user_id' => $rightId,
        ]);
    }

    private function senderPayload(int $receiverId, int $departmentId, int $investigationId): array
    {
        return [
            'receiver_user_id' => $receiverId,
            'patient_name' => 'Shared Patient',
            'patient_age' => 40,
            'patient_sex' => 'Male',
            'billing_date' => now()->toDateTimeString(),
            'collection_date' => now()->toDateTimeString(),
            'report_date' => now()->toDateTimeString(),
            'items' => [
                [
                    'department_id' => $departmentId,
                    'investigation_id' => $investigationId,
                    'parameter_name' => 'GLUCOSE',
                    'method' => '',
                    'unit' => 'mg/dL',
                    'bio_ref_interval' => '(70 - 110)',
                ],
            ],
        ];
    }

    public function test_sender_can_send_report_to_connected_clinic(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();
        $this->connectUsers($sender, $receiver);

        $department = Department::query()->create([
            'user_id' => $receiver->id,
            'name' => 'BIOCHEMISTRY',
        ]);
        $investigation = Investigation::query()->create([
            'department_id' => $department->id,
            'name' => 'GLUCOSE',
            'unit' => 'mg/dL',
            'bio_ref_interval' => '(70 - 110)',
            'amount' => 120,
        ]);

        $this->actingAs($sender)
            ->post(route('clinics.sent.store'), $this->senderPayload($receiver->id, $department->id, $investigation->id))
            ->assertRedirect(route('clinics.requested.index'));

        $this->assertDatabaseHas('shared_reports', [
            'sender_user_id' => $sender->id,
            'receiver_user_id' => $receiver->id,
            'status' => 'sent',
        ]);

        $notification = $receiver->notifications()->latest()->first();
        $this->assertNotNull($notification);
        $this->assertSame(IncomingSharedReportNotification::class, $notification->type);
        $this->assertStringContainsString($sender->clinic_name, (string) data_get($notification->data, 'message', ''));
        $this->assertSame(
            route('clinics.client.show', SharedReport::query()->latest('id')->first()),
            data_get($notification->data, 'target_url')
        );
    }

    public function test_sender_cannot_send_to_non_connected_clinic(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $department = Department::query()->create([
            'user_id' => $receiver->id,
            'name' => 'BIOCHEMISTRY',
        ]);
        $investigation = Investigation::query()->create([
            'department_id' => $department->id,
            'name' => 'GLUCOSE',
        ]);

        $this->actingAs($sender)
            ->post(route('clinics.sent.store'), $this->senderPayload($receiver->id, $department->id, $investigation->id))
            ->assertStatus(422);
    }

    public function test_receiver_opening_report_marks_received(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();
        $sharedReport = SharedReport::query()->create([
            'sender_user_id' => $sender->id,
            'receiver_user_id' => $receiver->id,
            'status' => 'sent',
            'patient_name' => 'P',
            'patient_age' => 20,
            'patient_sex' => 'Male',
            'billing_date' => now(),
            'collection_date' => now(),
            'report_date' => now(),
            'sent_at' => now(),
        ]);

        $this->actingAs($receiver)
            ->get(route('clinics.client.edit', $sharedReport))
            ->assertOk();

        $this->assertSame('received', $sharedReport->fresh()->status);
    }

    public function test_publish_blocked_with_missing_values_and_allowed_after_fill(): void
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $department = Department::query()->create([
            'user_id' => $receiver->id,
            'name' => 'BIOCHEMISTRY',
        ]);
        $investigation = Investigation::query()->create([
            'department_id' => $department->id,
            'name' => 'GLUCOSE',
            'unit' => 'mg/dL',
            'bio_ref_interval' => '(70 - 110)',
        ]);

        $sharedReport = SharedReport::query()->create([
            'sender_user_id' => $sender->id,
            'receiver_user_id' => $receiver->id,
            'status' => 'received',
            'patient_name' => 'P',
            'patient_age' => 20,
            'patient_sex' => 'Male',
            'billing_date' => now(),
            'collection_date' => now(),
            'report_date' => now(),
            'sent_at' => now(),
            'received_at' => now(),
        ]);

        $sharedReport->items()->create([
            'department_id' => $department->id,
            'investigation_id' => $investigation->id,
            'department_name' => 'BIOCHEMISTRY',
            'parameter_name' => 'GLUCOSE',
            'value' => null,
            'unit' => 'mg/dL',
            'bio_ref_interval' => '(70 - 110)',
            'display_order' => 0,
        ]);

        $this->actingAs($receiver)
            ->post(route('clinics.client.publish', $sharedReport))
            ->assertSessionHas('status', 'Fill all result values before publishing this report.');

        $payload = [
            'patient_name' => 'P',
            'patient_age' => 20,
            'patient_sex' => 'Male',
            'billing_date' => now()->toDateTimeString(),
            'collection_date' => now()->toDateTimeString(),
            'report_date' => now()->toDateTimeString(),
            'include_header_footer' => true,
            'items' => [
                [
                    'department_id' => $department->id,
                    'investigation_id' => $investigation->id,
                    'parameter_name' => 'GLUCOSE',
                    'value' => '95',
                    'unit' => 'mg/dL',
                    'bio_ref_interval' => '(70 - 110)',
                ],
            ],
        ];

        $this->actingAs($receiver)
            ->patch(route('clinics.client.update', $sharedReport), $payload)
            ->assertSessionHasNoErrors();

        $this->actingAs($receiver)
            ->post(route('clinics.client.publish', $sharedReport))
            ->assertSessionHas('status', 'Client report published successfully.');

        $sharedReport->refresh();
        $this->assertSame('published', $sharedReport->status);

        $this->actingAs($sender)->get(route('clinics.shared.pdf', $sharedReport->uuid))->assertOk();

        $publishNotification = $sender->notifications()->latest()->first();
        $this->assertNotNull($publishNotification);
        $this->assertSame(SharedReportPublishedNotification::class, $publishNotification->type);
        $this->assertStringContainsString($receiver->clinic_name, (string) data_get($publishNotification->data, 'message', ''));
        $this->assertSame(route('clinics.requested.index'), data_get($publishNotification->data, 'target_url'));
    }

    public function test_notification_mark_as_read_is_user_scoped(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $owner->notify(new IncomingSharedReportNotification(
            SharedReport::query()->create([
                'sender_user_id' => $otherUser->id,
                'receiver_user_id' => $owner->id,
                'status' => 'sent',
                'patient_name' => 'Scoped',
                'patient_age' => 30,
                'patient_sex' => 'Male',
                'billing_date' => now(),
                'collection_date' => now(),
                'report_date' => now(),
                'sent_at' => now(),
            ]),
            $otherUser
        ));

        /** @var DatabaseNotification $notification */
        $notification = $owner->notifications()->latest()->firstOrFail();
        $this->assertNull($notification->read_at);

        $this->actingAs($owner)
            ->post(route('notifications.read', $notification->id))
            ->assertRedirect();

        $this->assertNotNull($notification->fresh()->read_at);

        $this->actingAs($otherUser)
            ->post(route('notifications.read', $notification->id))
            ->assertNotFound();
    }
}
