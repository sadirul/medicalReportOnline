<?php

namespace Tests\Feature\Subscription;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_user_is_redirected_from_restricted_routes(): void
    {
        $user = User::factory()->create([
            'expiry_datetime' => now()->subDay(),
        ]);

        $this->actingAs($user)
            ->get(route('reports.create'))
            ->assertRedirect(route('subscription.index'));
    }

    public function test_expired_user_can_access_dashboard_and_allowlisted_clinic_routes(): void
    {
        $user = User::factory()->create([
            'expiry_datetime' => now()->subDay(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk();

        $this->actingAs($user)
            ->get(route('clinics.sent.create'))
            ->assertOk();

        $this->actingAs($user)
            ->get(route('clinics.requested.index'))
            ->assertOk();
    }

    public function test_expired_user_can_access_settings_profile(): void
    {
        $user = User::factory()->create([
            'expiry_datetime' => now()->subDay(),
        ]);

        $this->actingAs($user)
            ->get(route('profile.edit'))
            ->assertOk();
    }

    public function test_expired_user_can_open_subscription_page(): void
    {
        $user = User::factory()->create([
            'expiry_datetime' => now()->subDay(),
        ]);

        $this->actingAs($user)
            ->get(route('subscription.index'))
            ->assertOk();
    }

    public function test_active_user_can_access_restricted_routes(): void
    {
        $user = User::factory()->create([
            'expiry_datetime' => now()->addMonth(),
        ]);

        $this->actingAs($user)
            ->get(route('reports.create'))
            ->assertOk();
    }

    public function test_expired_user_can_download_own_report_bill(): void
    {
        $user = User::factory()->create([
            'expiry_datetime' => now()->subDay(),
        ]);

        $report = Report::query()->create([
            'user_id' => $user->id,
            'patient_name' => 'Bill Patient',
            'memo_number' => '000000001',
            'memo_sequence' => 1,
            'patient_age' => 32,
            'patient_sex' => 'Female',
            'billing_date' => now()->subMinutes(10),
            'collection_date' => now()->subMinutes(7),
            'report_date' => now(),
            'department' => 'DEPARTMENT OF BIOCHEMISTRY',
        ]);

        $this->actingAs($user)
            ->get(route('reports.bill', $report))
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }
}
