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
Route::get('/v1/catalog/{path?}', [ServiceProxyController::class, 'proxyCatalog'])
    ->where('path', 'health|categories|products|products/[0-9]+|subscribers|subscribers/count');

// Public natural language search (POST, rate-limited).
Route::post('/v1/catalog/search', function () {
    return app(\App\Http\Controllers\ServiceProxyController::class)
        ->proxyCatalog(request(), 'search');
})->middleware('throttle:10,1');

// Public health checks for all microservices (non-sensitive, useful for monitoring).
Route::get('/v1/{service}/health', [ServiceProxyController::class, 'proxyHealth'])
    ->whereIn('service', ['catalog', 'products', 'inventory', 'orders', 'cart', 'notifications', 'payments', 'users'])
    ->name('health.{service}');

// Public order creation for storefront checkout (no auth, rate-limited).
Route::post('/v1/{service}/{path}', [ServiceProxyController::class, 'proxy'])
    ->whereIn('service', ['cart', 'orders', 'catalog'])
    ->where('path', 'orders|subscribers')
    ->middleware('throttle:20,1');

Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdmin::class])->group(function () {
    Route::any('/v1/{service}/{path?}', [ServiceProxyController::class, 'proxy'])
        ->where('path', '.*');
});
