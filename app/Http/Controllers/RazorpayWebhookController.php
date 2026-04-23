<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api;

class RazorpayWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $webhookSecret = (string) config('services.razorpay.webhook_secret', '');

        if ($webhookSecret === '') {
            return response('Webhook not configured', 503);
        }

        $payload = $request->getContent();
        $signature = (string) $request->header('X-Razorpay-Signature', '');

        $expected = hash_hmac('sha256', $payload, $webhookSecret);

        if (! hash_equals($expected, $signature)) {
            return response('Invalid signature', 400);
        }

        try {
            /** @var array<string, mixed> $data */
            $data = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return response('Invalid JSON', 400);
        }

        $event = (string) ($data['event'] ?? '');

        if ($event !== 'payment.captured') {
            return response('OK', 200);
        }

        /** @var array<string, mixed>|null $paymentEntity */
        $paymentEntity = data_get($data, 'payload.payment.entity');

        if (! is_array($paymentEntity)) {
            return response('OK', 200);
        }

        $paymentId = (string) ($paymentEntity['id'] ?? '');
        $orderId = (string) ($paymentEntity['order_id'] ?? '');

        if ($paymentId === '' || $orderId === '') {
            return response('OK', 200);
        }

        $key = (string) config('services.razorpay.key', '');
        $secret = (string) config('services.razorpay.secret', '');

        if ($key === '' || $secret === '') {
            return response('Gateway not configured', 503);
        }

        try {
            $api = new Api($key, $secret);
            $order = $api->order->fetch($orderId);
            /** @var array<string, mixed> $orderArr */
            $orderArr = $order->toArray();
            $notes = $orderArr['notes'] ?? [];
            $userId = isset($notes['user_id']) ? (int) $notes['user_id'] : 0;

            if ($userId <= 0) {
                Log::warning('Razorpay webhook: missing user_id on order', ['order_id' => $orderId]);

                return response('OK', 200);
            }

            $expectedAmount = (int) config('subscription.yearly_package.amount_paise', 0);
            $amountPaid = (int) ($paymentEntity['amount'] ?? 0);

            if ($expectedAmount > 0 && $amountPaid !== $expectedAmount) {
                Log::warning('Razorpay webhook: amount mismatch', [
                    'order_id' => $orderId,
                    'expected' => $expectedAmount,
                    'paid' => $amountPaid,
                ]);

                return response('OK', 200);
            }

            $user = User::query()->find($userId);

            if ($user === null) {
                return response('OK', 200);
            }

            if (! Cache::add('razorpay_payment_processed:'.$paymentId, true, now()->addDays(366))) {
                return response('OK', 200);
            }

            $user->extendAnnualSubscription();
        } catch (\Throwable $e) {
            Log::error('Razorpay webhook processing failed', ['exception' => $e]);

            return response('Error', 500);
        }

        return response('OK', 200);
    }
}
