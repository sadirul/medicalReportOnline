<?php

namespace App\Http\Controllers;

use App\Models\RenewTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $pkg = config('subscription.yearly_package');
        $amountRupees = (float) ($pkg['amount_rupees'] ?? 0);
        $amountPaise = $this->toPaise($amountRupees);
        $amountFormatted = number_format($amountRupees, 2, '.', ',');

        return Inertia::render('subscription/index', [
            'yearly_package' => [
                'amount_paise' => $amountPaise,
                'amount_rupees' => $amountRupees,
                'amount_formatted' => $amountFormatted,
                'currency' => $pkg['currency'] ?? 'INR',
                'billing_period' => $pkg['billing_period'] ?? 'year',
                'label' => $pkg['label'] ?? 'Annual subscription',
            ],
            'razorpay_key' => (string) config('services.razorpay.key', ''),
            'subscription_expired' => $user->isSubscriptionExpired(),
            'expiry_datetime' => $user->expiry_datetime?->toIso8601String(),
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $key = (string) config('services.razorpay.key', '');
        $secret = (string) config('services.razorpay.secret', '');

        if ($key === '' || $secret === '') {
            return response()->json(['message' => __('Payment gateway is not configured.')], 503);
        }

        $amountRupees = (float) config('subscription.yearly_package.amount_rupees', 0);
        $amountPaise = $this->toPaise($amountRupees);

        if ($amountPaise < 100) {
            return response()->json(['message' => __('Invalid subscription amount configuration.')], 500);
        }

        $user = $request->user();

        try {
            $api = new Api($key, $secret);
            $receipt = 'sub_'.$user->id.'_'.uniqid('', true);

            $order = $api->order->create([
                'amount' => $amountPaise,
                'currency' => config('subscription.yearly_package.currency', 'INR'),
                'receipt' => $receipt,
                'payment_capture' => 1,
                'notes' => [
                    'user_id' => (string) $user->id,
                ],
            ]);

            /** @var array<string, mixed> $orderArr */
            $orderArr = $order->toArray();
            $orderId = (string) ($orderArr['id'] ?? '');

            if ($orderId === '') {
                return response()->json(['message' => __('Unable to create payment order.')], 502);
            }

            RenewTransaction::query()->updateOrCreate(
                ['razorpay_order_id' => $orderId],
                [
                    'user_id' => $user->id,
                    'amount' => $amountRupees,
                    'status' => RenewTransaction::STATUS_CREATED,
                    'currency' => (string) config('subscription.yearly_package.currency', 'INR'),
                    'receipt' => $receipt,
                    'json_response' => $orderArr,
                ]
            );

            return response()->json([
                'order_id' => $orderId,
                'amount' => $amountPaise,
                'currency' => config('subscription.yearly_package.currency', 'INR'),
                'key' => $key,
            ]);
        } catch (\Throwable $e) {
            Log::error('Razorpay order create failed', ['exception' => $e]);

            return response()->json(['message' => __('Unable to start payment. Please try again.')], 502);
        }
    }

    public function verify(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'razorpay_order_id' => ['required', 'string', 'max:255'],
            'razorpay_payment_id' => ['required', 'string', 'max:255'],
            'razorpay_signature' => ['required', 'string', 'max:512'],
        ]);

        $key = (string) config('services.razorpay.key', '');
        $secret = (string) config('services.razorpay.secret', '');

        if ($key === '' || $secret === '') {
            return $this->verifyFailureResponse($request, __('Payment gateway is not configured.'));
        }

        try {
            $api = new Api($key, $secret);
            $api->utility->verifyPaymentSignature([
                'razorpay_signature' => $validated['razorpay_signature'],
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_order_id' => $validated['razorpay_order_id'],
            ]);
        } catch (SignatureVerificationError) {
            $this->markTransactionFailed($request->user()->id, $validated, ['reason' => 'signature_verification_failed']);

            return $this->verifyFailureResponse($request, __('Payment verification failed.'), $validated['razorpay_payment_id']);
        }

        $paymentId = $validated['razorpay_payment_id'];

        if (! Cache::add('razorpay_payment_processed:'.$paymentId, true, now()->addDays(366))) {
            RenewTransaction::query()
                ->where('razorpay_order_id', $validated['razorpay_order_id'])
                ->update([
                    'status' => RenewTransaction::STATUS_CAPTURED,
                    'transaction_id' => $paymentId,
                    'razorpay_payment_id' => $paymentId,
                    'razorpay_signature' => $validated['razorpay_signature'],
                    'json_response' => $validated,
                ]);

            return $this->verifySuccessResponse($request, $paymentId);
        }

        $user = $request->user();
        $user->extendAnnualSubscription();

        RenewTransaction::query()->updateOrCreate(
            ['razorpay_order_id' => $validated['razorpay_order_id']],
            [
                'user_id' => $user->id,
                'amount' => (float) config('subscription.yearly_package.amount_rupees', 0),
                'status' => RenewTransaction::STATUS_CAPTURED,
                'transaction_id' => $paymentId,
                'currency' => (string) config('subscription.yearly_package.currency', 'INR'),
                'razorpay_payment_id' => $paymentId,
                'razorpay_signature' => $validated['razorpay_signature'],
                'expiry_date' => $user->expiry_datetime,
                'json_response' => $validated,
            ]
        );

        return $this->verifySuccessResponse($request, $paymentId);
    }

    public function markFailed(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'razorpay_order_id' => ['required', 'string', 'max:255'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        RenewTransaction::query()->updateOrCreate(
            ['razorpay_order_id' => $validated['razorpay_order_id']],
            [
                'user_id' => $request->user()->id,
                'amount' => (float) config('subscription.yearly_package.amount_rupees', 0),
                'status' => RenewTransaction::STATUS_FAILED,
                'currency' => (string) config('subscription.yearly_package.currency', 'INR'),
                'json_response' => $validated,
            ]
        );

        return response()->json(['ok' => true]);
    }

    private function verifySuccessResponse(Request $request, ?string $paymentId = null): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json([
                'status' => RenewTransaction::STATUS_CAPTURED,
                'message' => __('Payment captured successfully.'),
                'payment_id' => $paymentId,
            ]);
        }

        return redirect()->route('dashboard')->with([
            'status' => __('Your subscription is active. Thank you!'),
            'status_type' => 'success',
        ]);
    }

    private function verifyFailureResponse(Request $request, string $message, ?string $paymentId = null): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json([
                'status' => RenewTransaction::STATUS_FAILED,
                'message' => $message,
                'payment_id' => $paymentId,
            ], 422);
        }

        return redirect()->route('subscription.index')->with([
            'status' => $message,
            'status_type' => 'error',
        ]);
    }

    private function toPaise(float $amountRupees): int
    {
        return (int) round($amountRupees * 100);
    }

    /**
     * @param  array{razorpay_order_id:string,razorpay_payment_id:string,razorpay_signature:string}  $validated
     * @param  array<string, mixed>  $extra
     */
    private function markTransactionFailed(int $userId, array $validated, array $extra = []): void
    {
        RenewTransaction::query()->updateOrCreate(
            ['razorpay_order_id' => $validated['razorpay_order_id']],
            [
                'user_id' => $userId,
                'amount' => (float) config('subscription.yearly_package.amount_rupees', 0),
                'status' => RenewTransaction::STATUS_FAILED,
                'transaction_id' => $validated['razorpay_payment_id'],
                'currency' => (string) config('subscription.yearly_package.currency', 'INR'),
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_signature' => $validated['razorpay_signature'],
                'json_response' => array_merge($validated, $extra),
            ]
        );
    }
}
