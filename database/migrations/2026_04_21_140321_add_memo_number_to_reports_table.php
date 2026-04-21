<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('memo_number', 20)->nullable()->after('patient_name');
        });

        DB::table('reports')
            ->whereNull('memo_number')
            ->orderBy('id')
            ->get(['id'])
            ->each(function ($report): void {
                DB::table('reports')->where('id', $report->id)->update([
                    'memo_number' => str_pad((string) $report->id, 9, '0', STR_PAD_LEFT),
                ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('memo_number');
        });
    }
};
