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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->dateTime('billing_date');
            $table->dateTime('collection_date');
            $table->dateTime('report_date');
            $table->string('department')->nullable();
            $table->string('sample_note')->nullable();
            $table->string('equipment_note')->nullable();
            $table->text('interpretation_note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'patient_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
