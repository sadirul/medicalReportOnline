<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table): void {
            $table->string('patient_whatsapp_number', 30)->nullable()->after('patient_referred_by');
        });

        Schema::table('shared_reports', function (Blueprint $table): void {
            $table->string('patient_whatsapp_number', 30)->nullable()->after('patient_referred_by');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table): void {
            $table->dropColumn('patient_whatsapp_number');
        });

        Schema::table('shared_reports', function (Blueprint $table): void {
            $table->dropColumn('patient_whatsapp_number');
        });
    }
};
