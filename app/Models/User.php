<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'unique_clinic_id',
        'full_name',
        'clinic_name',
        'mobile',
        'email',
        'password',
        'address',
        'logo',
        'report_header_image',
        'report_footer_image',
        'signature_image',
        'alternate_mobile',
        'is_verified',
        'otp_hash',
        'otp_expires_at',
    ];

    /**
     * Appended attributes for serialization.
     *
     * @var list<string>
     */
    protected $appends = [
        'name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_hash',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'otp_expires_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $user): void {
            if (blank($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }

            if (blank($user->unique_clinic_id)) {
                $user->unique_clinic_id = self::generateUniqueClinicId();
            }
        });
    }

    public static function generateUniqueClinicId(): string
    {
        do {
            $code = 'MML'.Str::upper(Str::random(10));
            $exists = self::query()->where('unique_clinic_id', $code)->exists();
        } while ($exists);

        return $code;
    }

    public function getNameAttribute(): ?string
    {
        return $this->full_name;
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function testMasters(): HasMany
    {
        return $this->hasMany(TestMaster::class);
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function initiatedClinicConnections(): HasMany
    {
        return $this->hasMany(\App\Models\ClinicConnection::class, 'clinic_user_id');
    }

    public function receivedClinicConnections(): HasMany
    {
        return $this->hasMany(\App\Models\ClinicConnection::class, 'connected_clinic_user_id');
    }

    public function sentSharedReports(): HasMany
    {
        return $this->hasMany(\App\Models\SharedReport::class, 'sender_user_id');
    }

    public function receivedSharedReports(): HasMany
    {
        return $this->hasMany(\App\Models\SharedReport::class, 'receiver_user_id');
    }
}
