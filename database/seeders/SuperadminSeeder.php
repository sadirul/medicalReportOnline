<?php

namespace Database\Seeders;

use App\Models\Superadmin;
use Illuminate\Database\Seeder;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        Superadmin::query()->updateOrCreate(
            ['login_id' => env('SUPERADMIN_LOGIN_ID', 'superadmin')],
            [
                'name' => env('SUPERADMIN_NAME', 'Default Superadmin'),
                'password' => env('SUPERADMIN_PASSWORD', 'password'),
                'is_active' => true,
            ]
        );
    }
}
