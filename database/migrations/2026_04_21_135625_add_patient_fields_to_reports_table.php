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
        Schema::table('reports', function (Blueprint $table) {
            $table->string('patient_name')->nullable()->after('patient_id');
            $table->string('patient_v_id')->nullable()->after('patient_name');
            $table->unsignedInteger('patient_age')->nullable()->after('patient_v_id');
            $table->string('patient_sex', 20)->nullable()->after('patient_age');
            $table->text('patient_address')->nullable()->after('patient_sex');
            $table->string('patient_referred_by')->nullable()->after('patient_address');
            $table->foreignId('patient_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn([
                'patient_name',
                'patient_v_id',
                'patient_age',
                'patient_sex',
                'patient_address',
                'patient_referred_by',
            ]);
            $table->foreignId('patient_id')->nullable(false)->change();
        });
    }
};
