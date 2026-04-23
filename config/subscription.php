<?php

/**
 * Yearly subscription package (Razorpay). Change SUBSCRIPTION_YEARLY_PACKAGE_AMOUNT_RUPEES in .env
 * (amount in INR rupees). After updating .env in production, run `php artisan config:cache` or
 * `php artisan config:clear` as appropriate.
 */
return [

    'yearly_package' => [
        // INR amount in rupees (e.g. 11880 = ₹11,880.00)
        'amount_rupees' => (float) env(
            'SUBSCRIPTION_YEARLY_PACKAGE_AMOUNT_RUPEES',
            env('SUBSCRIPTION_YEARLY_PACKAGE_AMOUNT', 11880)
        ),
        'currency' => 'INR',
        'billing_period' => 'year',
        'label' => env('SUBSCRIPTION_YEARLY_PACKAGE_LABEL', 'Annual clinic subscription'),
    ],

];
