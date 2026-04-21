<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ReportItem extends Model
{
    protected $fillable = [
        'report_id',
        'test_master_id',
        'investigation_id',
        'parameter_name',
        'method',
        'value',
        'unit',
        'bio_ref_interval',
        'display_order',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function testMaster(): BelongsTo
    {
        return $this->belongsTo(TestMaster::class);
    }

    public function investigation(): BelongsTo
    {
        return $this->belongsTo(Investigation::class);
    }
}
