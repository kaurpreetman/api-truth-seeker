import { createFileRoute } from "@tanstack/react-router";

const API_BASE = "https://solve.ivy.homes";

export const Route = createFileRoute("/api/ivy/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => proxy(request, params._splat),
      POST: async ({ request, params }) => proxy(request, params._splat),
      DELETE: async ({ request, params }) => proxy(request, params._splat),
    },
  },
});

async function proxy(request: Request, splat: string | undefined) {
  const apiKey = process.env["IVY_API_KEY"];
  if (!apiKey) {
    return Response.json({ detail: "The property service is not configured." }, { status: 500 });
  }

  const path = splat ? `/${splat}` : "/";
  const incomingUrl = new URL(request.url);
  const target = new URL(`${API_BASE}${path}`);
  target.search = incomingUrl.search;
  target.searchParams.set("api_key", apiKey);

  const headers = new Headers();
  headers.set("X-API-Key", apiKey);
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("Authorization", authorization);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: body ?? null,
  });

  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", upstream.headers.get("content-type") ?? "application/json");
  const retryAfter = upstream.headers.get("retry-after");
  if (retryAfter) responseHeaders.set("Retry-After", retryAfter);
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
