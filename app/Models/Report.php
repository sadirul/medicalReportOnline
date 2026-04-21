<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'patient_id',
        'billing_date',
        'collection_date',
        'report_date',
        'department',
        'sample_note',
        'equipment_note',
        'interpretation_note',
    ];

    protected function casts(): array
    {
        return [
            'billing_date' => 'datetime',
            'collection_date' => 'datetime',
            'report_date' => 'datetime',
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
