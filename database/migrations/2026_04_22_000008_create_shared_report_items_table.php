<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_report_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shared_report_id')->constrained('shared_reports')->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('investigation_id')->nullable()->constrained('investigations')->nullOnDelete();
            $table->string('department_name')->nullable();
            $table->string('parameter_name');
            $table->string('method')->nullable();
            $table->string('value')->nullable();
            $table->string('unit')->nullable();
            $table->string('bio_ref_interval')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index(['shared_report_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_report_items');
    }
};
