<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('unique_clinic_id', 32)->nullable()->after('uuid');
        });

        DB::table('users')
            ->whereNull('unique_clinic_id')
            ->orderBy('id')
            ->get(['id'])
            ->each(function (object $user): void {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'unique_clinic_id' => $this->generateUniqueClinicId(),
                    ]);
            });

        Schema::table('users', function (Blueprint $table): void {
            $table->unique('unique_clinic_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique('users_unique_clinic_id_unique');
            $table->dropColumn('unique_clinic_id');
        });
    }

    private function generateUniqueClinicId(): string
    {
        do {
            $code = 'MML'.Str::upper(Str::random(10));
            $exists = DB::table('users')->where('unique_clinic_id', $code)->exists();
        } while ($exists);

        return $code;
    }
};
