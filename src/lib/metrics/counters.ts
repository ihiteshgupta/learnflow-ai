// Simple in-memory HTTP request counters for Prometheus metrics.
// These counters reset on process restart, which is fine for K8s pods
// where Prometheus handles long-term storage.

let httpRequestsTotal = 0;
const httpRequestsByMethod: Record<string, number> = {};
const httpRequestsByStatus: Record<string, number> = {};

export function incrementHttpRequests(method: string, status?: number) {
  httpRequestsTotal++;
  httpRequestsByMethod[method] = (httpRequestsByMethod[method] || 0) + 1;
  if (status) {
    const statusGroup = `${Math.floor(status / 100)}xx`;
    httpRequestsByStatus[statusGroup] = (httpRequestsByStatus[statusGroup] || 0) + 1;
  }
}

export function getHttpMetrics() {
  return {
    total: httpRequestsTotal,
    byMethod: { ...httpRequestsByMethod },
    byStatus: { ...httpRequestsByStatus },
  };
}
