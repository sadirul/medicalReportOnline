<?php

namespace Tests\Feature\Superadmin;

use App\Models\Superadmin;
use App\Models\User;
use App\Models\RenewTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperadminPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/superadmin/login');

        $response->assertStatus(200);
    }

    public function test_superadmin_can_login_and_is_redirected_to_dashboard(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin01',
            'password' => 'password',
            'is_active' => true,
        ]);

        $response = $this->post('/superadmin/login', [
            'login_id' => $superadmin->login_id,
            'password' => 'password',
        ]);

        $this->assertAuthenticated('superadmin');
        $response->assertRedirect(route('superadmin.dashboard', absolute: false));
    }

    public function test_non_authenticated_user_is_redirected_to_superadmin_login(): void
    {
        $response = $this->get('/superadmin');

        $response->assertRedirect('/superadmin/login');
    }

    public function test_regular_user_cannot_access_superadmin_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'web')->get('/superadmin');

        $response->assertRedirect('/superadmin/login');
    }

    public function test_superadmin_can_view_clinic_list_and_detail(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin02',
            'password' => 'password',
            'is_active' => true,
        ]);
        $clinic = User::factory()->create();

        $this->actingAs($superadmin, 'superadmin');

        $this->get('/superadmin/clinics')->assertStatus(200);
        $this->get("/superadmin/clinics/{$clinic->id}")->assertStatus(200);
    }

    public function test_clinic_detail_shows_transactions_for_that_clinic(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin_txn',
            'password' => 'password',
            'is_active' => true,
        ]);
        $clinic = User::factory()->create();
        $otherClinic = User::factory()->create();

        RenewTransaction::query()->create([
            'user_id' => $clinic->id,
            'amount' => 500.00,
            'status' => RenewTransaction::STATUS_CAPTURED,
            'currency' => 'INR',
            'transaction_id' => 'TXN-CLINIC-1',
            'razorpay_order_id' => 'order_clinic_1',
        ]);

        RenewTransaction::query()->create([
            'user_id' => $otherClinic->id,
            'amount' => 900.00,
            'status' => RenewTransaction::STATUS_FAILED,
            'currency' => 'INR',
            'transaction_id' => 'TXN-OTHER-1',
            'razorpay_order_id' => 'order_other_1',
        ]);

        $response = $this->actingAs($superadmin, 'superadmin')->get("/superadmin/clinics/{$clinic->id}");

        $response->assertStatus(200);
        $response->assertSee('TXN-CLINIC-1');
        $response->assertDontSee('TXN-OTHER-1');
    }

    public function test_superadmin_dashboard_shows_total_earning_for_this_year(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin_earning',
            'password' => 'password',
            'is_active' => true,
        ]);
        $clinic = User::factory()->create();

        RenewTransaction::query()->create([
            'user_id' => $clinic->id,
            'amount' => 1200.50,
            'status' => RenewTransaction::STATUS_CAPTURED,
            'currency' => 'INR',
            'razorpay_order_id' => 'order_this_year_1',
        ]);

        RenewTransaction::query()->create([
            'user_id' => $clinic->id,
            'amount' => 799.50,
            'status' => RenewTransaction::STATUS_CAPTURED,
            'currency' => 'INR',
            'razorpay_order_id' => 'order_this_year_2',
        ]);

        RenewTransaction::query()->create([
            'user_id' => $clinic->id,
            'amount' => 999.00,
            'status' => RenewTransaction::STATUS_FAILED,
            'currency' => 'INR',
            'razorpay_order_id' => 'order_failed',
        ]);

        $response = $this->actingAs($superadmin, 'superadmin')->get('/superadmin');

        $response->assertStatus(200);
        $response->assertSee('2,000.00');
        $response->assertSee('latestTransactions');
        $response->assertSee('captured');
    }

    public function test_superadmin_can_view_all_transactions_page_with_filters(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin_filter',
            'password' => 'password',
            'is_active' => true,
        ]);
        $clinicOne = User::factory()->create();
        $clinicTwo = User::factory()->create();

        RenewTransaction::query()->create([
            'user_id' => $clinicOne->id,
            'amount' => 300.00,
            'status' => RenewTransaction::STATUS_CAPTURED,
            'currency' => 'INR',
            'transaction_id' => 'FILTER-TXN-1',
            'razorpay_order_id' => 'FILTER-ORDER-1',
        ]);
        RenewTransaction::query()->create([
            'user_id' => $clinicTwo->id,
            'amount' => 700.00,
            'status' => RenewTransaction::STATUS_FAILED,
            'currency' => 'INR',
            'transaction_id' => 'FILTER-TXN-2',
            'razorpay_order_id' => 'FILTER-ORDER-2',
        ]);

        $response = $this->actingAs($superadmin, 'superadmin')->get('/superadmin/transactions?clinic_id='.$clinicOne->id.'&status=captured');

        $response->assertStatus(200);
        $response->assertSee('FILTER-TXN-1');
        $response->assertDontSee('FILTER-TXN-2');
    }

    public function test_superadmin_can_view_password_settings_page(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin_settings',
            'password' => 'password',
            'is_active' => true,
        ]);

        $response = $this->actingAs($superadmin, 'superadmin')->get('/superadmin/settings/password');

        $response->assertStatus(200);
        $response->assertSee('superadmin/settings/password');
    }

    public function test_superadmin_can_update_password_from_settings(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin_pw',
            'password' => 'password',
            'is_active' => true,
        ]);

        $response = $this->actingAs($superadmin, 'superadmin')->put('/superadmin/settings/password', [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('new-password-123', $superadmin->fresh()->password));
    }

    public function test_clinic_status_filter_supports_expired_and_active(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin03',
            'password' => 'password',
            'is_active' => true,
        ]);
        $expiredClinic = User::factory()->create(['expiry_datetime' => now()->subDay()]);
        $activeClinic = User::factory()->create(['expiry_datetime' => now()->addDay()]);

        $this->actingAs($superadmin, 'superadmin');

        $this->get('/superadmin/clinics?status=expired')->assertSee($expiredClinic->clinic_name)->assertDontSee($activeClinic->clinic_name);
        $this->get('/superadmin/clinics?status=active')->assertSee($activeClinic->clinic_name)->assertDontSee($expiredClinic->clinic_name);
    }

    public function test_superadmin_can_add_sms_to_existing_balance(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin04',
            'password' => 'password',
            'is_active' => true,
        ]);
        $clinic = User::factory()->create(['sms_balance' => 10]);

        $response = $this->actingAs($superadmin, 'superadmin')->post("/superadmin/clinics/{$clinic->id}/sms/add", [
            'sms_count' => 7,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame(17, $clinic->fresh()->sms_balance);
    }

    public function test_superadmin_cannot_add_invalid_sms_amount(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin05',
            'password' => 'password',
            'is_active' => true,
        ]);
        $clinic = User::factory()->create(['sms_balance' => 10]);

        $response = $this->actingAs($superadmin, 'superadmin')->from("/superadmin/clinics/{$clinic->id}")->post("/superadmin/clinics/{$clinic->id}/sms/add", [
            'sms_count' => 0,
        ]);

        $response->assertRedirect("/superadmin/clinics/{$clinic->id}");
        $response->assertSessionHasErrors('sms_count');
        $this->assertSame(10, $clinic->fresh()->sms_balance);
    }

    public function test_superadmin_can_update_expiry_datetime(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin06',
            'password' => 'password',
            'is_active' => true,
        ]);
        $clinic = User::factory()->create(['expiry_datetime' => now()->subDay()]);
        $newExpiry = now()->addDays(30)->startOfMinute();

        $response = $this->actingAs($superadmin, 'superadmin')->post("/superadmin/clinics/{$clinic->id}/expiry/update", [
            'expiry_datetime' => $newExpiry->toDateTimeString(),
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame($newExpiry->toDateTimeString(), $clinic->fresh()->expiry_datetime?->toDateTimeString());
    }

    public function test_superadmin_cannot_update_expiry_datetime_with_invalid_value(): void
    {
        $superadmin = Superadmin::query()->create([
            'name' => 'Admin',
            'login_id' => 'admin07',
            'password' => 'password',
            'is_active' => true,
        ]);
        $clinic = User::factory()->create(['expiry_datetime' => now()->addDay()]);
        $currentExpiry = $clinic->expiry_datetime?->toDateTimeString();

        $response = $this->actingAs($superadmin, 'superadmin')
            ->from("/superadmin/clinics/{$clinic->id}")
            ->post("/superadmin/clinics/{$clinic->id}/expiry/update", [
                'expiry_datetime' => 'not-a-date',
            ]);

        $response->assertRedirect("/superadmin/clinics/{$clinic->id}");
        $response->assertSessionHasErrors('expiry_datetime');
        $this->assertSame($currentExpiry, $clinic->fresh()->expiry_datetime?->toDateTimeString());
    }
}
