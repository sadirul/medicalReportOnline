<?php

namespace Tests\Feature;

use App\Models\ClinicConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicConnectionsTest extends TestCase
{
    use RefreshDatabase;

    private function validCreateAccountPayload(array $overrides = []): array
    {
        return array_merge([
            'full_name' => 'Dr John Doe',
            'clinic_name' => 'Sunrise Diagnostics',
            'mobile' => '9876543210',
            'email' => 'clinic@example.com',
            'address' => '22 Health Street, Kolkata',
            'password' => 'password',
            'password_confirmation' => 'password',
        ], $overrides);
    }

    public function test_clinics_can_connect_by_unique_clinic_id(): void
    {
        $clinicA = User::factory()->create();
        $clinicB = User::factory()->create();

        $this->actingAs($clinicA)
            ->post(route('clinics.other.connect'), [
                'clinic_unique_id' => $clinicB->unique_clinic_id,
            ])
            ->assertSessionHas('status', 'Clinic connected successfully.');

        $this->assertDatabaseHas('clinic_connections', [
            'clinic_user_id' => min($clinicA->id, $clinicB->id),
            'connected_clinic_user_id' => max($clinicA->id, $clinicB->id),
        ]);
    }

    public function test_same_pair_is_not_added_twice(): void
    {
        $clinicA = User::factory()->create();
        $clinicB = User::factory()->create();

        $this->actingAs($clinicA)->post(route('clinics.other.connect'), [
            'clinic_unique_id' => $clinicB->unique_clinic_id,
        ]);

        $this->actingAs($clinicA)
            ->post(route('clinics.other.connect'), [
                'clinic_unique_id' => $clinicB->unique_clinic_id,
            ])
            ->assertSessionHas('status', 'This clinic is already connected.');

        $this->assertSame(1, ClinicConnection::query()->count());
    }

    public function test_reverse_direction_still_keeps_single_connection_row(): void
    {
        $clinicA = User::factory()->create();
        $clinicB = User::factory()->create();

        $this->actingAs($clinicA)->post(route('clinics.other.connect'), [
            'clinic_unique_id' => $clinicB->unique_clinic_id,
        ]);

        $this->actingAs($clinicB)
            ->post(route('clinics.other.connect'), [
                'clinic_unique_id' => $clinicA->unique_clinic_id,
            ])
            ->assertSessionHas('status', 'This clinic is already connected.');

        $this->assertSame(1, ClinicConnection::query()->count());
    }

    public function test_self_connect_is_blocked(): void
    {
        $clinic = User::factory()->create();

        $this->actingAs($clinic)
            ->post(route('clinics.other.connect'), [
                'clinic_unique_id' => $clinic->unique_clinic_id,
            ])
            ->assertSessionHas('status', 'You cannot connect your own clinic.');

        $this->assertSame(0, ClinicConnection::query()->count());
    }

    public function test_clinic_account_can_be_created_and_auto_connected(): void
    {
        $currentClinic = User::factory()->create();

        $this->actingAs($currentClinic)
            ->post(route('clinics.other.create-account'), $this->validCreateAccountPayload())
            ->assertSessionHas('status', 'Clinic account created and connected successfully.');

        $createdClinic = User::query()->where('email', 'clinic@example.com')->first();

        $this->assertNotNull($createdClinic);
        $this->assertTrue((bool) $createdClinic->is_verified);
        $this->assertNotEmpty($createdClinic->unique_clinic_id);

        $this->assertDatabaseHas('clinic_connections', [
            'clinic_user_id' => min($currentClinic->id, $createdClinic->id),
            'connected_clinic_user_id' => max($currentClinic->id, $createdClinic->id),
        ]);
    }

    public function test_create_clinic_account_fails_for_duplicate_mobile(): void
    {
        $currentClinic = User::factory()->create();
        User::factory()->create(['mobile' => '9876543210']);

        $this->actingAs($currentClinic)
            ->post(route('clinics.other.create-account'), $this->validCreateAccountPayload())
            ->assertSessionHasErrors(['mobile']);
    }

    public function test_create_clinic_account_fails_for_duplicate_email(): void
    {
        $currentClinic = User::factory()->create();
        User::factory()->create(['email' => 'clinic@example.com']);

        $this->actingAs($currentClinic)
            ->post(route('clinics.other.create-account'), $this->validCreateAccountPayload())
            ->assertSessionHasErrors(['email']);
    }

    public function test_create_clinic_account_fails_for_invalid_payload(): void
    {
        $currentClinic = User::factory()->create();

        $this->actingAs($currentClinic)
            ->post(route('clinics.other.create-account'), [])
            ->assertSessionHasErrors([
                'full_name',
                'clinic_name',
                'mobile',
                'email',
                'address',
                'password',
            ]);
    }

    public function test_guest_cannot_create_clinic_account(): void
    {
        $response = $this->post(route('clinics.other.create-account'), $this->validCreateAccountPayload());
        $response->assertStatus(302);
        $this->assertStringContainsString(route('login', absolute: false), (string) $response->headers->get('Location'));

        $this->assertDatabaseMissing('users', [
            'email' => 'clinic@example.com',
        ]);
    }
}
