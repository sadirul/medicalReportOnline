<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Report extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'patient_id',
        'patient_name',
        'memo_number',
        'memo_sequence',
        'publication_status',
        'released_at',
        'patient_v_id',
        'patient_age',
        'patient_sex',
        'patient_address',
        'patient_referred_by',
        'billing_date',
        'collection_date',
        'report_date',
        'include_header_footer',
        'department',
        'sample_note',
        'equipment_note',
        'interpretation_note',
    ];

    protected static function booted(): void
    {
        static::creating(function (Report $report): void {
            if (! $report->uuid) {
                $report->uuid = (string) Str::uuid();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'billing_date' => 'datetime',
            'collection_date' => 'datetime',
            'report_date' => 'datetime',
            'include_header_footer' => 'boolean',
            'released_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReportItem::class)->orderBy('display_order');
    }
}
