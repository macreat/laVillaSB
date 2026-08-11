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
        'catalog' => 'catalog_url',
        'inventory' => 'inventory_url',
        'cart' => 'cart_url',
        'drive-sync' => 'drive_sync_url',
        'image-processor' => 'image_processor_url',
    ];

    public function proxy(Request $request, string $service, ?string $path = ''): JsonResponse
    {
        return $this->proxyToService($request, $service, $path);
    }

    public function proxyCatalog(Request $request, ?string $path = ''): JsonResponse
    {
        return $this->proxyToService($request, 'catalog', $path);
    }

    private function proxyToService(Request $request, string $service, ?string $path = ''): JsonResponse
    {
        if (! isset(self::SERVICES[$service])) {
            throw new NotFoundHttpException("Service {$service} not found");
        }

        $baseUrl = config('services.internal.'.self::SERVICES[$service]);
        if (! $baseUrl) {
            return response()->json(['error' => "Service {$service} is not configured"], 503);
        }

        $targetUrl = rtrim($baseUrl, '/').'/'.ltrim($path, '/');
        $query = $request->getQueryString();
        if ($query) {
            $targetUrl .= '?'.$query;
        }

        $http = Http::withHeaders($this->forwardHeaders($request));
        $body = $request->getContent();
        $contentType = $request->header('Content-Type');

        if ($body !== '' && is_string($contentType) && $contentType !== '') {
            $http = $http->withBody($body, $contentType);
        }

        $response = $http->send($request->getMethod(), $targetUrl);

        return response()->json($response->json(), $response->status());
    }

    private function forwardHeaders(Request $request): array
    {
        $headers = collect($request->headers->all())
            ->map(fn ($value) => is_array($value) ? $value[0] : $value)
            ->except(['host', 'connection'])
            ->toArray();

        if ($request->user()) {
            $headers['X-Gateway-User-Id'] = (string) $request->user()->id;
        }

        return $headers;
    }
}
