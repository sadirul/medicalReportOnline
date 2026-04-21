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
            $table->unsignedBigInteger('memo_sequence')->nullable()->after('memo_number');
        });

        $rows = DB::table('reports')
            ->select(['id', 'user_id'])
            ->orderBy('user_id')
            ->orderBy('id')
            ->get();

        $sequences = [];
        foreach ($rows as $row) {
            $userId = (int) $row->user_id;
            $sequences[$userId] = ($sequences[$userId] ?? 0) + 1;
            $sequence = $sequences[$userId];

            DB::table('reports')->where('id', $row->id)->update([
                'memo_sequence' => $sequence,
                'memo_number' => str_pad((string) $sequence, 9, '0', STR_PAD_LEFT),
            ]);
        }

        Schema::table('reports', function (Blueprint $table) {
            $table->unique(['user_id', 'memo_sequence']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropUnique('reports_user_id_memo_sequence_unique');
            $table->dropColumn('memo_sequence');
        });
    }
};
