<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsHelper
{
    /**
     * Send a DLT template SMS via Fast2SMS using GET endpoint.
     *
     * @param string $phone   Comma-separated mobile numbers (or single number)
     * @param string $messageId   The DLT approved message ID (not the full text)
     * @param string $variablesValues   Pipe-separated variable values string e.g. "Rahul|January"
     * @param bool $flash   Whether to send as flash (true → 1, false → 0)
     * @param string|null $scheduleTime   Optional: schedule time in format YYYY-MM-DD-HH-MM
     * @return bool
     */
    public static function sendSms(
        string $phone,
        string $messageId,
        string $variablesValues = '',
        bool $flash = false,
        ?string $scheduleTime = null
    ): array {
        try {
            $apiKey   = config('sms.fast2sms.sms.api_key');
            $senderId = config('sms.fast2sms.sms.sender_id');
            $route    = 'dlt';

            $query = [
                'authorization'     => $apiKey,
                'route'             => $route,
                'sender_id'         => $senderId,
                'message'           => $messageId,
                'numbers'           => $phone,
                'flash'             => $flash ? '1' : '0',
            ];

            if ($variablesValues !== '') {
                $query['variables_values'] = $variablesValues;
            }

            if (! is_null($scheduleTime)) {
                $query['schedule_time'] = $scheduleTime;
            }

            $url = 'https://www.fast2sms.com/dev/bulkV2?' . http_build_query($query);
            $response = Http::get($url);

            $data = $response->json();

            Log::info('Fast2SMS send success', ['response' => $data]);
            return $data;
        } catch (\Throwable $e) {
            Log::error('Fast2SMS Exception: ' . $e->getMessage());
            return ["return" => false, "message" => $e->getMessage()];
        }
    }
}
