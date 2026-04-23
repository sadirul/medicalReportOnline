<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post('/register/send-otp', [
            'full_name' => 'Test User',
            'clinic_name' => 'Care Clinic',
            'mobile' => '9876543210',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'address' => 'Ahmedabad',
        ]);

        $response->assertRedirect('/veryfy-otp');

        $user = User::query()->where('mobile', '9876543210')->firstOrFail();
        $user->update([
            'otp_hash' => Hash::make('123456'),
            'otp_expires_at' => now()->addMinutes(5),
        ]);

        $verifyResponse = $this->post('/veryfy-otp', [
            'otp' => '123456',
        ]);

        $user->refresh();

        $this->assertAuthenticated();
        $verifyResponse->assertRedirect(route('dashboard', absolute: false));
        $this->assertNotNull($user->unique_clinic_id);
        $this->assertTrue(str_starts_with($user->unique_clinic_id, 'MML'));
        $this->assertNotNull($user->expiry_datetime);
        $this->assertTrue($user->expiry_datetime->isFuture());
        $this->assertTrue($user->expiry_datetime->lte(now()->addMonth()->addMinutes(5)));
    }
}
