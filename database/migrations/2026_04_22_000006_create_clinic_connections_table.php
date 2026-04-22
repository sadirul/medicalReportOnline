<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_connections', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('clinic_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('connected_clinic_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['clinic_user_id', 'connected_clinic_user_id'], 'clinic_connections_pair_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_connections');
    }
};
