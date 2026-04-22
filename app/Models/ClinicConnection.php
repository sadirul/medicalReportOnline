<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicConnection extends Model
{
    protected $fillable = [
        'clinic_user_id',
        'connected_clinic_user_id',
    ];

    public function clinicUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clinic_user_id');
    }

    public function connectedClinicUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'connected_clinic_user_id');
    }
}
