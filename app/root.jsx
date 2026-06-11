import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, isRouteErrorResponse } from "react-router";
import { useEffect } from "react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * React Router v7 ErrorBoundary — exported from root so it catches ALL unhandled errors.
 *
 * Key behaviour:
 * - "Failed to fetch": caused by a deployment mismatch where the browser tries to
 *   load a stale JS chunk that no longer exists on the server. We auto-reload so
 *   the browser pulls the fresh manifest and assets.
 * - Everything else: render a clean error screen instead of a blank/crashed page.
 */
export function ErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    // "Failed to fetch" is the browser's signal that a JS chunk or resource
    // request was blocked/missing — most commonly triggered right after a
    // Vercel/Netlify deployment that invalidates old hashed chunk filenames.
    const message =
      error instanceof Error
        ? error.message
        : isRouteErrorResponse(error)
        ? String(error.data)
        : String(error);

    if (
      message.toLowerCase().includes("failed to fetch") ||
      message.toLowerCase().includes("loading chunk") ||
      message.toLowerCase().includes("loading css chunk") ||
      message.toLowerCase().includes("dynamically imported module")
    ) {
      console.warn("[ErrorBoundary] Stale chunk detected — forcing hard reload.");
      window.location.reload();
    }
  }, [error]);

  // Determine status code for HTTP response errors (e.g. 404, 500)
  const status = isRouteErrorResponse(error) ? error.status : null;
  const statusText = isRouteErrorResponse(error) ? error.statusText : null;
  const message =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
      ? error.data
      : "An unexpected error occurred.";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{status ? `${status} – ${statusText}` : "App Error"}</title>
        <Links />
        <style>{`
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f6f6f7; }
          .error-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }
          .error-code { font-size: 72px; font-weight: 700; color: #202223; margin: 0; }
          .error-title { font-size: 24px; font-weight: 600; color: #202223; margin: 8px 0; }
          .error-message { font-size: 14px; color: #6d7175; max-width: 480px; margin: 0 auto 24px; }
          .reload-btn { display: inline-block; padding: 10px 20px; background: #008060; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; }
          .reload-btn:hover { background: #006e52; }
        `}</style>
      </head>
      <body>
        <div className="error-container">
          {status && <p className="error-code">{status}</p>}
          <h1 className="error-title">
            {statusText ?? "Something went wrong"}
          </h1>
          <p className="error-message">{message}</p>
          <button className="reload-btn" onClick={() => window.location.reload()}>
            Reload app
          </button>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
