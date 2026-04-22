<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('sms.fast2sms.sms.send_sms', false);
    }

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_otp_can_be_requested_for_verified_mobile(): void
    {
        $user = User::factory()->create([
            'mobile' => '9876543210',
            'is_verified' => true,
        ]);

        $response = $this->post('/forgot-password', ['mobile' => $user->mobile]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('password.reset.otp.page'));

        $user->refresh();
        $this->assertNotNull($user->otp_hash);
        $this->assertNotNull($user->otp_expires_at);
    }

    public function test_reset_password_request_rejects_unknown_mobile(): void
    {
        $response = $this->from(route('password.request'))->post('/forgot-password', [
            'mobile' => '9111111111',
        ]);

        $response->assertSessionHasErrors('mobile');
    }

    public function test_reset_password_screen_can_be_rendered_after_otp(): void
    {
        $user = User::factory()->create([
            'mobile' => '9876543210',
            'is_verified' => true,
        ]);

        $this->post('/forgot-password', ['mobile' => $user->mobile]);

        $plainOtp = '123456';
        $user->otp_hash = Hash::make($plainOtp);
        $user->otp_expires_at = now()->addMinutes(5);
        $user->save();

        $this->post('/forgot-password/verify-otp', ['otp' => $plainOtp]);

        $response = $this->get('/reset-password');

        $response->assertStatus(200);
    }

    public function test_password_can_be_reset_after_otp_verification(): void
    {
        $user = User::factory()->create([
            'mobile' => '9876543210',
            'is_verified' => true,
        ]);

        $this->post('/forgot-password', ['mobile' => $user->mobile]);

        $plainOtp = '654321';
        $user->otp_hash = Hash::make($plainOtp);
        $user->otp_expires_at = now()->addMinutes(5);
        $user->save();

        $this->post('/forgot-password/verify-otp', ['otp' => $plainOtp]);

        $response = $this->post('/reset-password', [
            'password' => 'new-password-11',
            'password_confirmation' => 'new-password-11',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        $this->assertTrue(Hash::check('new-password-11', $user->fresh()->password));
    }
}
