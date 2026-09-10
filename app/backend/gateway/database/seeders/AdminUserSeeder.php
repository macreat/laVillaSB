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

        $existing = User::where('email', $email)->first();

        if ($existing) {
            // The entrypoint seeds on every container start, so overwriting the
            // password here silently reverted any change the admin made from
            // the panel - they would be locked out by the next deploy with a
            // password they believed was current. Only the admin flag is
            // reasserted; the password is left alone once the account exists.
            $existing->forceFill([
                'name' => $existing->name ?: 'Admin',
                'is_admin' => true,
            ])->save();

            return;
        }

        $password = env('ADMIN_PASSWORD') ?: null;

        if (! $password) {
            $password = Str::password(24);
            Log::warning('Generated admin password for seeding. Store it securely.', [
                'email' => $email,
                'password' => $password,
            ]);
        }

        User::create([
            'name' => 'Admin',
            'email' => $email,
            'password' => Hash::make($password),
            'is_admin' => true,
        ]);
    }
}
