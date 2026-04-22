<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SharedReport extends Model
{
    protected $fillable = [
        'uuid',
        'sender_user_id',
        'receiver_user_id',
        'status',
        'patient_name',
        'patient_age',
        'patient_sex',
        'patient_address',
        'patient_referred_by',
        'billing_date',
        'collection_date',
        'report_date',
        'include_header_footer',
        'sample_note',
        'equipment_note',
        'interpretation_note',
        'sent_at',
        'received_at',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'billing_date' => 'datetime',
            'collection_date' => 'datetime',
            'report_date' => 'datetime',
            'include_header_footer' => 'boolean',
            'sent_at' => 'datetime',
            'received_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $sharedReport): void {
            if (blank($sharedReport->uuid)) {
                $sharedReport->uuid = (string) Str::uuid();
            }
        });
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SharedReportItem::class)->orderBy('display_order');
    }
}
