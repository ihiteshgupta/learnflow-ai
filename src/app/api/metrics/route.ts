export const dynamic = 'force-dynamic';

const APP_VERSION = process.env.npm_package_version || '0.1.0';
const startTime = Date.now();

// Simple in-memory counter for HTTP requests to the metrics endpoint itself.
// In a production setup this would be replaced by middleware-level counters,
// but it demonstrates the pattern without any external dependency.
let metricsRequestCount = 0;

export async function GET() {
  metricsRequestCount++;

  const mem = process.memoryUsage();
  const uptimeSeconds = (Date.now() - startTime) / 1000;

  const lines: string[] = [
    // Application info
    '# HELP dronacharya_info Application version information.',
    '# TYPE dronacharya_info gauge',
    `dronacharya_info{version="${APP_VERSION}"} 1`,
    '',
    // Up gauge
    '# HELP dronacharya_up Whether the application is up (always 1 when reachable).',
    '# TYPE dronacharya_up gauge',
    'dronacharya_up 1',
    '',
    // HTTP requests counter (placeholder)
    '# HELP dronacharya_http_requests_total Total number of HTTP requests (metrics endpoint only, placeholder).',
    '# TYPE dronacharya_http_requests_total counter',
    `dronacharya_http_requests_total ${metricsRequestCount}`,
    '',
    // Process uptime
    '# HELP process_uptime_seconds Time in seconds since the process started.',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${uptimeSeconds.toFixed(2)}`,
    '',
    // Node.js heap used
    '# HELP nodejs_heap_used_bytes Process heap used in bytes.',
    '# TYPE nodejs_heap_used_bytes gauge',
    `nodejs_heap_used_bytes ${mem.heapUsed}`,
    '',
    // Node.js heap total
    '# HELP nodejs_heap_total_bytes Process heap total in bytes.',
    '# TYPE nodejs_heap_total_bytes gauge',
    `nodejs_heap_total_bytes ${mem.heapTotal}`,
    '',
    // Node.js external memory
    '# HELP nodejs_external_bytes External memory used by V8-managed objects.',
    '# TYPE nodejs_external_bytes gauge',
    `nodejs_external_bytes ${mem.external}`,
    '',
    // RSS
    '# HELP nodejs_rss_bytes Resident set size in bytes.',
    '# TYPE nodejs_rss_bytes gauge',
    `nodejs_rss_bytes ${mem.rss}`,
    '',
  ];

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
