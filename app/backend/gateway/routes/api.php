<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\ServiceProxyController;
use Illuminate\Support\Facades\Route;

Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/admin/logout', [AdminAuthController::class, 'logout'])
    ->middleware('auth:sanctum');
Route::get('/admin/me', [AdminAuthController::class, 'me'])
    ->middleware('auth:sanctum');
Route::put('/admin/me', [AdminAuthController::class, 'updateProfile'])
    ->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::any('/v1/{service}/{path?}', [ServiceProxyController::class, 'proxy'])
        ->where('path', '.*');
});
