<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('test_masters') || ! Schema::hasTable('departments') || ! Schema::hasTable('investigations')) {
            return;
        }

        $masters = DB::table('test_masters')->get();
        $departmentMap = [];
        $investigationMap = [];

        foreach ($masters as $master) {
            $departmentKey = $master->user_id.'|'.$master->department;

            if (! isset($departmentMap[$departmentKey])) {
                $departmentId = DB::table('departments')->insertGetId([
                    'user_id' => $master->user_id,
                    'name' => $master->department,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $departmentMap[$departmentKey] = $departmentId;
            }

            $investigationId = DB::table('investigations')->insertGetId([
                'department_id' => $departmentMap[$departmentKey],
                'name' => $master->test_name,
                'unit' => $master->unit,
                'bio_ref_interval' => $master->bio_ref_interval,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $investigationMap[$master->id] = $investigationId;
        }

        if (Schema::hasColumn('report_items', 'test_master_id') && Schema::hasColumn('report_items', 'investigation_id')) {
            $items = DB::table('report_items')
                ->whereNotNull('test_master_id')
                ->get(['id', 'test_master_id']);

            foreach ($items as $item) {
                DB::table('report_items')
                    ->where('id', $item->id)
                    ->update([
                        'investigation_id' => $investigationMap[$item->test_master_id] ?? null,
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down migration for data transfer.
    }
};
