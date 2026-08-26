<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Use ?: instead of env() default: an empty-string env var (e.g.
        // ADMIN_EMAIL= passed through docker-compose) must fall back too.
        $email = env('ADMIN_EMAIL') ?: 'admin@lavillasb.com';
        $password = env('ADMIN_PASSWORD') ?: null;

        if (! $password) {
            $password = Str::password(24);
            Log::warning('Generated admin password for seeding. Store it securely.', [
                'email' => $email,
                'password' => $password,
            ]);
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Admin',
                'password' => Hash::make($password),
                'is_admin' => true,
            ]
        );
    }
}
