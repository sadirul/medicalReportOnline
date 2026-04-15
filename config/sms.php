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
                'generate_fee' => [
                    'message_id' => '209140',
                ],
                'fee_paid' => [
                    'message_id' => '209139',
                ],
            ],
        ],
        'whatsapp' => [
            'phone_id' => env('FAST2SMS_PHONE_ID'),
            'templates' => [
                'otp' => [
                    'message_id' => '14428',
                ],
                'generate_fee' => [
                    'message_id' => '14519',
                ],
                'fee_paid' => [
                    'message_id' => '14518',
                ],
            ],
        ],
    ],
];
