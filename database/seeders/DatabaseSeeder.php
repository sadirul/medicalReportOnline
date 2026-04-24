<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'full_name' => 'Test User',
            'clinic_name' => 'Test Clinic',
            'mobile' => '9876543210',
            'email' => 'test@example.com',
        ]);

        $this->call(SuperadminSeeder::class);
    }
}
