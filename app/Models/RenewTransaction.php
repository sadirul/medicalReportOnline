<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RenewTransaction extends Model
{
    public const STATUS_CREATED = 'created';

    public const STATUS_CAPTURED = 'captured';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'uuid',
        'user_id',
        'amount',
        'expiry_date',
        'status',
        'transaction_id',
        'currency',
        'receipt',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        'json_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expiry_date' => 'datetime',
            'json_response' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $transaction): void {
            if (blank($transaction->uuid)) {
                $transaction->uuid = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
