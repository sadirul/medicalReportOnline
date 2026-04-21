<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('report_items', function (Blueprint $table) {
            $table->unsignedBigInteger('investigation_id')->nullable()->after('test_master_id');
            $table->index('investigation_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_items', function (Blueprint $table) {
            $table->dropIndex(['investigation_id']);
            $table->dropColumn('investigation_id');
        });
    }
};
