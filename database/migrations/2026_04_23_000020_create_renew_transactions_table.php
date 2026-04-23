<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('renew_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->dateTime('expiry_date')->nullable();
            $table->string('status');
            $table->string('transaction_id')->nullable();
            $table->string('currency')->nullable();
            $table->string('receipt')->nullable();
            $table->string('razorpay_order_id')->unique();
            $table->string('razorpay_payment_id')->nullable();
            $table->string('razorpay_signature')->nullable();
            $table->json('json_response')->nullable();
            $table->timestamps();
        });

        DB::table('renew_transactions')
            ->whereNull('uuid')
            ->orderBy('id')
            ->get(['id'])
            ->each(function ($transaction): void {
                DB::table('renew_transactions')->where('id', $transaction->id)->update([
                    'uuid' => (string) Str::uuid(),
                ]);
            });

        Schema::table('renew_transactions', function (Blueprint $table) {
            $table->unique('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('renew_transactions');
    }
};
