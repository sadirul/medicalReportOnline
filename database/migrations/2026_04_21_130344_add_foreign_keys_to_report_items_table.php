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
            $table->foreign('report_id')->references('id')->on('reports')->cascadeOnDelete();
            $table->foreign('test_master_id')->references('id')->on('test_masters')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_items', function (Blueprint $table) {
            $table->dropForeign(['report_id']);
            $table->dropForeign(['test_master_id']);
        });
    }
};
