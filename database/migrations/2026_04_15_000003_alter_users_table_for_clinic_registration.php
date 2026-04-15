<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'uuid')) {
                $table->uuid('uuid')->nullable()->after('id');
            }

            if (Schema::hasColumn('users', 'name') && !Schema::hasColumn('users', 'full_name')) {
                $table->renameColumn('name', 'full_name');
            }

            if (!Schema::hasColumn('users', 'clinic_name')) {
                $table->string('clinic_name')->nullable()->after('full_name');
            }

            if (!Schema::hasColumn('users', 'mobile')) {
                $table->string('mobile', 20)->nullable()->after('clinic_name');
            }

            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('password');
            }

            if (!Schema::hasColumn('users', 'logo')) {
                $table->string('logo')->nullable()->after('address');
            }

            if (!Schema::hasColumn('users', 'alternate_mobile')) {
                $table->string('alternate_mobile', 20)->nullable()->after('logo');
            }
        });

        DB::table('users')
            ->whereNull('uuid')
            ->orderBy('id')
            ->get(['id'])
            ->each(function ($user): void {
                DB::table('users')->where('id', $user->id)->update([
                    'uuid' => (string) Str::uuid(),
                ]);
            });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'uuid')) {
                $table->unique('uuid');
            }

            if (Schema::hasColumn('users', 'mobile')) {
                $table->unique('mobile');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'mobile')) {
                $table->dropUnique('users_mobile_unique');
            }

            if (Schema::hasColumn('users', 'uuid')) {
                $table->dropUnique('users_uuid_unique');
            }

            if (Schema::hasColumn('users', 'alternate_mobile')) {
                $table->dropColumn('alternate_mobile');
            }

            if (Schema::hasColumn('users', 'logo')) {
                $table->dropColumn('logo');
            }

            if (Schema::hasColumn('users', 'address')) {
                $table->dropColumn('address');
            }

            if (Schema::hasColumn('users', 'mobile')) {
                $table->dropColumn('mobile');
            }

            if (Schema::hasColumn('users', 'clinic_name')) {
                $table->dropColumn('clinic_name');
            }

            if (Schema::hasColumn('users', 'full_name') && !Schema::hasColumn('users', 'name')) {
                $table->renameColumn('full_name', 'name');
            }

            if (Schema::hasColumn('users', 'uuid')) {
                $table->dropColumn('uuid');
            }
        });
    }
};
