<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ServiceProxyController extends Controller
{
    private const SERVICES = [
        'catalog' => 'SERVICE_CATALOG_URL',
        'inventory' => 'SERVICE_INVENTORY_URL',
        'cart' => 'SERVICE_CART_URL',
        'drive-sync' => 'SERVICE_DRIVE_SYNC_URL',
        'image-processor' => 'SERVICE_IMAGE_PROCESSOR_URL',
    ];

    public function proxy(Request $request, string $service, ?string $path = ''): JsonResponse
    {
        if (! isset(self::SERVICES[$service])) {
            throw new NotFoundHttpException("Service {$service} not found");
        }

        $baseUrl = env(self::SERVICES[$service]);
        if (! $baseUrl) {
            return response()->json(['error' => "Service {$service} is not configured"], 503);
        }

        $targetUrl = rtrim($baseUrl, '/').'/'.ltrim($path, '/');
        $query = $request->getQueryString();
        if ($query) {
            $targetUrl .= '?'.$query;
        }

        $response = Http::withHeaders($this->forwardHeaders($request))
            ->withBody($request->getContent(), $request->header('Content-Type'))
            ->send($request->getMethod(), $targetUrl);

        return response()->json($response->json(), $response->status());
    }

    private function forwardHeaders(Request $request): array
    {
        $headers = collect($request->headers->all())
            ->map(fn ($value) => is_array($value) ? $value[0] : $value)
            ->except(['host', 'connection'])
            ->toArray();

        $headers['X-Gateway-User-Id'] = $request->user()?->id;

        return $headers;
    }
}
