<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CatalogPublicRoutesTest extends TestCase
{
    public function test_public_products_route_is_proxied_without_authentication(): void
    {
        Http::fake(fn () => Http::response([
            [
                'id' => 1,
                'name' => 'Deck 8.0',
                'price' => '120.00',
                'categoryGroup' => 'decks',
            ],
        ], 200));

        $response = $this->getJson('/api/v1/catalog/products');

        $response->assertOk();
        $response->assertJsonPath('0.name', 'Deck 8.0');
        $response->assertJsonPath('0.categoryGroup', 'decks');
        Http::assertSent(fn ($request) => str_contains($request->url(), '/products'));
    }

    public function test_non_allowlisted_catalog_route_remains_protected(): void
    {
        $response = $this->postJson('/api/v1/catalog/media/presign', [
            'filename' => 'deck.png',
            'contentType' => 'image/png',
        ]);

        $response->assertUnauthorized();
    }

    public function test_public_product_detail_route_is_proxied_without_authentication(): void
    {
        Http::fake(fn () => Http::response([
            'id' => 12,
            'name' => 'Dark Side Deck 8.5',
            'price' => '72.00',
            'categoryGroup' => 'decks',
        ], 200));

        $response = $this->getJson('/api/v1/catalog/products/12');

        $response->assertOk();
        $response->assertJsonPath('id', 12);
        Http::assertSent(fn ($request) => str_contains($request->url(), '/products/12'));
    }

    public function test_non_numeric_product_detail_route_is_not_allowlisted(): void
    {
        $response = $this->getJson('/api/v1/catalog/products/deck-8-25');

        $response->assertUnauthorized();
    }

    public function test_only_explicit_read_routes_are_public(): void
    {
        Http::fake(fn () => Http::response(['status' => 'ok'], 200));

        $this->getJson('/api/v1/catalog/categories')->assertOk();
        $this->getJson('/api/v1/catalog/health')->assertOk();
        $this->getJson('/api/v1/catalog/media')->assertUnauthorized();

        Http::assertSentCount(2);
        Http::assertSent(fn ($request) => str_contains($request->url(), '/categories'));
        Http::assertSent(fn ($request) => str_contains($request->url(), '/health'));
    }
}
