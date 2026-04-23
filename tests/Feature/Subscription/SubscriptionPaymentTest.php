<?php

namespace Tests\Feature\Subscription;

use App\Models\RenewTransaction;
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
        config(['subscription.yearly_package.amount_rupees' => 100]);

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
            ->assertJsonPath('status', RenewTransaction::STATUS_CAPTURED)
            ->assertJsonPath('payment_id', $paymentId);

        $user->refresh();
        $txn = RenewTransaction::query()->where('razorpay_order_id', $orderId)->first();

        $this->assertTrue($user->expiry_datetime->isFuture());
        $this->assertTrue($user->expiry_datetime->greaterThan(now()->addMonths(11)));
        $this->assertNotNull($txn);
        $this->assertSame(RenewTransaction::STATUS_CAPTURED, $txn->status);
    }

    public function test_verify_payment_is_idempotent_for_same_payment_id(): void
    {
        config(['services.razorpay.key' => 'rzp_test']);
        config(['services.razorpay.secret' => 'test_secret_123']);
        config(['subscription.yearly_package.amount_rupees' => 100]);

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

    public function test_failed_signature_marks_transaction_failed(): void
    {
        config(['services.razorpay.key' => 'rzp_test']);
        config(['services.razorpay.secret' => 'test_secret_123']);
        config(['subscription.yearly_package.amount_rupees' => 100]);

        $user = User::factory()->create([
            'expiry_datetime' => now()->subDay(),
        ]);

        $orderId = 'order_failed';
        $paymentId = 'pay_failed';

        $this->actingAs($user)
            ->postJson(route('subscription.verify'), [
                'razorpay_order_id' => $orderId,
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => 'invalid-signature',
            ])
            ->assertStatus(422);

        $txn = RenewTransaction::query()->where('razorpay_order_id', $orderId)->first();
        $this->assertNotNull($txn);
        $this->assertSame(RenewTransaction::STATUS_FAILED, $txn->status);
    }
}
