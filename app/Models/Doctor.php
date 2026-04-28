<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Doctor extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'mobile',
        'email',
        'hospital',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
