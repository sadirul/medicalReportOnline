<?php

namespace Tests\Feature;

use App\Models\ClinicConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicConnectionsTest extends TestCase
{
    use RefreshDatabase;

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
}
