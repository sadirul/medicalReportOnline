<?php

return [
    'fast2sms' => [
        'sms' => [
            'api_key' => env('FAST2SMS_API_KEY'),
            'sender_id' => env('FAST2SMS_SENDER_ID'),
            'send_sms' => env('FAST2SMS_SEND_SMS', true),
            'templates' => [
                'otp' => [
                    'message_id' => '209141',
                ],
            ],
        ],
        'whatsapp' => [
            'phone_id' => env('FAST2SMS_PHONE_ID'),
            'templates' => [
                'otp' => [
                    'message_id' => '13586',
                ],

            ],
        ],
    ],
];
