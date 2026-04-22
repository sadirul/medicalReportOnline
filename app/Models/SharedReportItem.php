<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SharedReportItem extends Model
{
    protected $fillable = [
        'shared_report_id',
        'department_id',
        'investigation_id',
        'department_name',
        'parameter_name',
        'method',
        'value',
        'unit',
        'bio_ref_interval',
        'amount',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function sharedReport(): BelongsTo
    {
        return $this->belongsTo(SharedReport::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }
}
