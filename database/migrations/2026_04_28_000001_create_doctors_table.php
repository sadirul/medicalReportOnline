<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('mobile', 10);
            $table->string('email')->nullable();
            $table->string('hospital');
            $table->timestamps();

            $table->unique(['user_id', 'mobile']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
