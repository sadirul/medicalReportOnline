<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Throwable;

class SmsPriorityHelper
{
    /**
     * Ultra-fast OTP sender (no retry).
     */
    public static function sendOtp($mobile, $otp, $priority = 'whatsapp')
    {
        $priority = strtolower($priority);

        if (! (bool) config('sms.fast2sms.sms.send_sms', true)) {
            return [
                'status' => true,
                'sent_via' => 'mock',
                'response' => [
                    'return' => true,
                    'mock' => true,
                ],
            ];
        }

        $messageId = [
            'sms' => config('sms.fast2sms.sms.templates.otp.message_id'),
            'whatsapp' => config('sms.fast2sms.whatsapp.templates.otp.message_id'),
        ];

        $variablesValues = [
            'sms' => $otp,
            'whatsapp' => $otp,
        ];

        return self::send(
            phone: $mobile,
            messageId: $messageId,
            variablesValues: $variablesValues,
            mediaUrl: null,
            documentFilename: null,
            priority: $priority,
        );
    }

    /**
     * Universal sender (single fallback).
     */
    public static function send(
        string $phone,
        array $messageId,
        array $variablesValues = [],
        ?string $mediaUrl = null,
        ?string $documentFilename = null,
        string $priority = 'whatsapp',
    ): array {
        $priority = strtolower($priority);

        $first = $priority === 'sms' ? 'sms' : 'whatsapp';
        $second = $first === 'sms' ? 'whatsapp' : 'sms';

        try {
            $firstResult = self::sendVia(
                $first,
                $phone,
                $messageId,
                $variablesValues,
                $mediaUrl,
                $documentFilename,
            );

            $firstSuccess = self::channelResponseSucceeded($first, $firstResult);
            self::logFast($phone, $first, $firstSuccess);

            if ($firstSuccess) {
                return [
                    'status' => true,
                    'sent_via' => $first,
                    'response' => $firstResult,
                ];
            }

            $secondResult = self::sendVia(
                $second,
                $phone,
                $messageId,
                $variablesValues,
                $mediaUrl,
                $documentFilename,
            );

            $secondSuccess = self::channelResponseSucceeded($second, $secondResult);
            self::logFast($phone, $second, $secondSuccess);

            if (! $secondSuccess) {
                Log::channel('sms')->error('OTP_TOTAL_FAILED', [
                    'm' => $phone,
                    'first_channel' => $first,
                    'second_channel' => $second,
                    't' => now()->timestamp,
                ]);
            }

            return [
                'status' => $secondSuccess,
                'sent_via' => $secondSuccess ? $second : null,
                'response' => $secondResult,
            ];
        } catch (Throwable $e) {
            Log::channel('sms')->critical('OTP_EXCEPTION', [
                'm' => $phone,
                'error' => $e->getMessage(),
                't' => now()->timestamp,
            ]);

            return [
                'status' => false,
                'sent_via' => null,
                'response' => [
                    'return' => false,
                    'error' => $e->getMessage(),
                ],
            ];
        }
    }

    private static function sendVia(
        $channel,
        $phone,
        $messageId,
        $variablesValues,
        $mediaUrl,
        $documentFilename,
    ) {
        try {
            if ($channel === 'sms') {
                if (! class_exists(SmsHelper::class)) {
                    return ['return' => false, 'error' => 'SmsHelper class not found'];
                }

                $result = SmsHelper::sendSms(
                    phone: $phone,
                    messageId: $messageId['sms'] ?? null,
                    variablesValues: $variablesValues['sms'] ?? [],
                );

                return is_array($result) ? $result : ['return' => $result];
            }

            if (! class_exists(WhatsAppHelper::class)) {
                return ['return' => false, 'error' => 'WhatsAppHelper class not found'];
            }

            $wa = WhatsAppHelper::send(
                $messageId['whatsapp'] ?? null,
                '91'.$phone,
                is_array($variablesValues['whatsapp'] ?? null)
                    ? $variablesValues['whatsapp']
                    : explode('|', (string) ($variablesValues['whatsapp'] ?? '')),
                $mediaUrl,
                $documentFilename,
            );

            return is_array($wa) ? $wa : ['return' => false, 'error' => 'Invalid WhatsApp API response'];
        } catch (Throwable $e) {
            Log::channel('sms')->error('OTP_CHANNEL_EXCEPTION', [
                'channel' => $channel,
                'mobile' => $phone,
                'error' => $e->getMessage(),
                't' => now()->timestamp,
            ]);

            return ['return' => false, 'error' => $e->getMessage()];
        }
    }

    private static function logFast($mobile, $channel, $status): void
    {
        Log::channel('sms')->info('OTP_FAST', [
            'm' => $mobile,
            'c' => $channel,
            's' => $status,
            't' => now()->timestamp,
        ]);
    }

    /**
     * Fast2SMS bulk SMS uses "return"; WhatsApp /dev/whatsapp uses "status" (boolean).
     *
     * @param  array<string, mixed>  $result
     */
    private static function channelResponseSucceeded(string $channel, array $result): bool
    {
        if ($channel === 'whatsapp') {
            if (array_key_exists('status', $result) && is_bool($result['status'])) {
                return $result['status'];
            }

            $status = $result['status'] ?? null;
            if (is_string($status)) {
                return in_array(strtolower($status), ['true', '1', 'success'], true);
            }

            return ! empty($result['return']);
        }

        return ! empty($result['return']);
    }
}
