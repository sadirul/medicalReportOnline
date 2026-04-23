<?php

/**
 * Yearly subscription package (Razorpay). Change SUBSCRIPTION_YEARLY_PACKAGE_AMOUNT in .env
 * (amount in paise). After updating .env in production, run `php artisan config:cache` or
 * `php artisan config:clear` as appropriate.
 */
return [

    'yearly_package' => [
        // INR amount in paise (e.g. 1188000 = ₹11,880.00)
        'amount_paise' => (int) env('SUBSCRIPTION_YEARLY_PACKAGE_AMOUNT', 1188000),
        'currency' => 'INR',
        'billing_period' => 'year',
        'label' => env('SUBSCRIPTION_YEARLY_PACKAGE_LABEL', 'Annual clinic subscription'),
    ],

];
