<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppHelper
{
    protected static $baseUrl = 'https://www.fast2sms.com/dev/whatsapp';

    /**
     * Generic send function
     */
    public static function send($messageId, $mobileNumber, $variables = [], $mediaUrl = null, $documentFilename = null)
    {
        $params = [
            'authorization'     => config('sms.fast2sms.sms.api_key'),
            'message_id'        => $messageId,
            'phone_number_id'   => config('sms.fast2sms.whatsapp.phone_id'),
            'numbers'           => $mobileNumber,
            'variables_values'  => implode('|', $variables),
        ];

        if ($mediaUrl) {
            $params['media_url'] = $mediaUrl;
        }

        if ($documentFilename) {
            $params['document_filename'] = $documentFilename;
        }
        Log::info("📤 Trying WhatsApp for {$mobileNumber} with message ID {$messageId} and variables: " . implode('|', $variables));
        $response = Http::get(self::$baseUrl, $params);
        Log::info("📤 WhatsApp API response for {$mobileNumber}: " . $response->body());
        return $response->json();
    }

    /**
     * API 1: Single variable
     */
    public static function sendSingleVar($messageId, $mobileNumber, $var1)
    {
        return self::send($messageId, $mobileNumber, [$var1]);
    }

    /**
     * API 2: Multiple variables + media
     */
    public static function sendWithMedia($mobileNumber, $vars, $mediaUrl, $documentFilename, $messageId = null)
    {
        $resolvedMessageId = $messageId ?: config('sms.fast2sms.whatsapp.templates.send_pdf.message_id');

        return self::send($resolvedMessageId, $mobileNumber, $vars, $mediaUrl, $documentFilename);
    }

    /**
     * API 3: Multiple variables
     */
    public static function sendMultiVar($mobileNumber, $vars)
    {
        return self::send(12283, $mobileNumber, $vars);
    }
}
