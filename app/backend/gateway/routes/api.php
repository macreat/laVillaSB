<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\ServiceProxyController;
use Illuminate\Support\Facades\Route;

Route::post('/admin/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/admin/logout', [AdminAuthController::class, 'logout'])
    ->middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdmin::class]);
Route::get('/admin/me', [AdminAuthController::class, 'me'])
    ->middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdmin::class]);
Route::put('/admin/me', [AdminAuthController::class, 'updateProfile'])
    ->middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdmin::class]);

// Public catalog allowlist - read-only endpoints only.
// Explicitly allows list reads and numeric product detail reads.
Route::get('/v1/catalog/{path?}', [ServiceProxyController::class, 'proxyCatalog'])
    ->where('path', 'health|categories|products|products/[0-9]+');

// Public health checks for all microservices (non-sensitive, useful for monitoring).
Route::get('/v1/{service}/health', [ServiceProxyController::class, 'proxy'])
    ->whereIn('service', ['catalog', 'inventory', 'orders', 'cart', 'notifications', 'payments', 'users'])
    ->name('health.{service}');

Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdmin::class])->group(function () {
    Route::any('/v1/{service}/{path?}', [ServiceProxyController::class, 'proxy'])
        ->where('path', '.*');
});
