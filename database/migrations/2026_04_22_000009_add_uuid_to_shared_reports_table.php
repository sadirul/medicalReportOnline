<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shared_reports', function (Blueprint $table): void {
            $table->uuid('uuid')->nullable()->after('id');
        });

        DB::table('shared_reports')
            ->select('id')
            ->orderBy('id')
            ->get()
            ->each(function (object $row): void {
                do {
                    $uuid = (string) Str::uuid();
                    $exists = DB::table('shared_reports')->where('uuid', $uuid)->exists();
                } while ($exists);

                DB::table('shared_reports')
                    ->where('id', $row->id)
                    ->update(['uuid' => $uuid]);
            });

        Schema::table('shared_reports', function (Blueprint $table): void {
            $table->unique('uuid');
        });
    }

    public function down(): void
    {
        Schema::table('shared_reports', function (Blueprint $table): void {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};
