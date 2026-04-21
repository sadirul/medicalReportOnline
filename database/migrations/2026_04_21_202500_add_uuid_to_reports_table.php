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
        Schema::table('reports', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        DB::table('reports')
            ->whereNull('uuid')
            ->orderBy('id')
            ->get(['id'])
            ->each(function ($report): void {
                DB::table('reports')->where('id', $report->id)->update([
                    'uuid' => (string) Str::uuid(),
                ]);
            });

        Schema::table('reports', function (Blueprint $table) {
            $table->unique('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropUnique('reports_uuid_unique');
            $table->dropColumn('uuid');
        });
    }
};
