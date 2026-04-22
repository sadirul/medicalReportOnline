<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('sender_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('sent');

            $table->string('patient_name');
            $table->unsignedInteger('patient_age');
            $table->string('patient_sex', 20);
            $table->text('patient_address')->nullable();
            $table->string('patient_referred_by')->nullable();

            $table->dateTime('billing_date');
            $table->dateTime('collection_date');
            $table->dateTime('report_date');
            $table->boolean('include_header_footer')->default(false);
            $table->string('sample_note')->nullable();
            $table->string('equipment_note')->nullable();
            $table->text('interpretation_note')->nullable();

            $table->timestamp('sent_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['sender_user_id', 'status']);
            $table->index(['receiver_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_reports');
    }
};
