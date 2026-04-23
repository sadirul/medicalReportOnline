<?php

namespace App\Http\Controllers;

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
        $amountPaise = (int) ($pkg['amount_paise'] ?? 0);
        $amountFormatted = number_format($amountPaise / 100, 2, '.', ',');

        return Inertia::render('subscription/index', [
            'yearly_package' => [
                'amount_paise' => $amountPaise,
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

        $amountPaise = (int) config('subscription.yearly_package.amount_paise', 0);

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

            return response()->json([
                'order_id' => $orderArr['id'] ?? null,
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
            return $this->verifyFailureResponse($request, __('Payment verification failed.'));
        }

        $paymentId = $validated['razorpay_payment_id'];

        if (! Cache::add('razorpay_payment_processed:'.$paymentId, true, now()->addDays(366))) {
            return $this->verifySuccessResponse($request);
        }

        $user = $request->user();
        $user->extendAnnualSubscription();

        return $this->verifySuccessResponse($request);
    }

    private function verifySuccessResponse(Request $request): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['redirect' => route('dashboard')]);
        }

        return redirect()->route('dashboard')->with([
            'status' => __('Your subscription is active. Thank you!'),
            'status_type' => 'success',
        ]);
    }

    private function verifyFailureResponse(Request $request, string $message): RedirectResponse|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message], 422);
        }

        return redirect()->route('subscription.index')->with([
            'status' => $message,
            'status_type' => 'error',
        ]);
    }
}
