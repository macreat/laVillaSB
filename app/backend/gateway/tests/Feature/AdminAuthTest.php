<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_returns_an_admin_token(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('secret-password'),
            'is_admin' => true,
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'secret-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertOk()
            ->assertJsonPath('user.id', $admin->id)
            ->assertJsonStructure(['token']);
        $this->assertTrue($admin->fresh()->tokens()->first()->can('admin'));
    }

    public function test_non_admin_login_is_rejected_with_the_generic_credentials_message(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret-password'),
            'is_admin' => false,
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => $user->email,
            'password' => 'secret-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'The provided credentials are incorrect.');
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_is_throttled_after_five_attempts(): void
    {
        $payload = [
            'email' => 'missing@example.com',
            'password' => 'incorrect-password',
            'device_name' => 'phpunit',
        ];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/admin/login', $payload)->assertUnprocessable();
        }

        $this->postJson('/api/admin/login', $payload)->assertTooManyRequests();
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/admin/me')->assertUnauthorized();
    }

    public function test_me_rejects_a_non_admin_token(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $token = $user->createToken('phpunit', ['admin'])->plainTextToken;

        $this->withToken($token)->getJson('/api/admin/me')->assertForbidden();
    }

    public function test_logout_revokes_the_current_token(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('phpunit', ['admin']);

        $this->withToken($token->plainTextToken)
            ->postJson('/api/admin/logout')
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->accessToken->id]);
    }

    public function test_password_changes_require_the_current_password(): void
    {
        $admin = User::factory()->create([
            'password' => Hash::make('old-password'),
            'is_admin' => true,
        ]);
        $token = $admin->createToken('phpunit', ['admin'])->plainTextToken;

        $this->withToken($token)->putJson('/api/admin/me', [
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');
    }

    public function test_expired_tokens_are_rejected(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('phpunit', ['admin'])->plainTextToken;

        $this->travel(721)->minutes();

        $this->withToken($token)->getJson('/api/admin/me')->assertUnauthorized();

        $this->travelBack();
    }
}
