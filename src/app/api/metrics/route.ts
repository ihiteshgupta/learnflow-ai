import { getHttpMetrics } from '@/lib/metrics/counters';

export const dynamic = 'force-dynamic';

const APP_VERSION = process.env.npm_package_version || '0.1.0';
const startTime = Date.now();

export async function GET() {
  const httpMetrics = getHttpMetrics();

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
    // HTTP requests counter
    '# HELP dronacharya_http_requests_total Total number of HTTP requests.',
    '# TYPE dronacharya_http_requests_total counter',
    `dronacharya_http_requests_total ${httpMetrics.total}`,
    '',
    // Per-method breakdown
    '# HELP dronacharya_http_requests_by_method HTTP requests broken down by method.',
    '# TYPE dronacharya_http_requests_by_method counter',
    ...Object.entries(httpMetrics.byMethod).map(
      ([method, count]) => `dronacharya_http_requests_by_method{method="${method}"} ${count}`
    ),
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
