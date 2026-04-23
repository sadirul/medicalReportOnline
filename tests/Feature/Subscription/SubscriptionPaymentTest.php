<?php

namespace Tests\Feature\Subscription;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_verify_payment_json_extends_expiry_by_one_year_from_now_when_expired(): void
    {
        config(['services.razorpay.key' => 'rzp_test']);
        config(['services.razorpay.secret' => 'test_secret_123']);
        config(['subscription.yearly_package.amount_paise' => 10000]);

        $user = User::factory()->create([
            'expiry_datetime' => now()->subDay(),
        ]);

        $orderId = 'order_test123';
        $paymentId = 'pay_test456';
        $signature = hash_hmac('sha256', $orderId.'|'.$paymentId, 'test_secret_123');

        $this->actingAs($user)
            ->postJson(route('subscription.verify'), [
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
            ])
            ->assertOk()
            ->assertJsonStructure(['redirect']);

        $user->refresh();

        $this->assertTrue($user->expiry_datetime->isFuture());
        $this->assertTrue($user->expiry_datetime->greaterThan(now()->addMonths(11)));
    }

    public function test_verify_payment_is_idempotent_for_same_payment_id(): void
    {
        config(['services.razorpay.key' => 'rzp_test']);
        config(['services.razorpay.secret' => 'test_secret_123']);
        config(['subscription.yearly_package.amount_paise' => 10000]);

        $user = User::factory()->create([
            'expiry_datetime' => now()->subDay(),
        ]);

        $orderId = 'order_idem';
        $paymentId = 'pay_idem';
        $signature = hash_hmac('sha256', $orderId.'|'.$paymentId, 'test_secret_123');

        $this->actingAs($user)
            ->postJson(route('subscription.verify'), [
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
            ])
            ->assertOk();

        $firstExpiry = $user->fresh()->expiry_datetime;

        $this->actingAs($user)
            ->postJson(route('subscription.verify'), [
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $signature,
            ])
            ->assertOk();

        $this->assertTrue($user->fresh()->expiry_datetime->eq($firstExpiry));
    }
}
