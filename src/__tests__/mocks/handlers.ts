import { http, HttpResponse } from 'msw';

export const handlers = [
  // tRPC batch handler
  http.post('/api/trpc/*', async ({ request }) => {
    const url = new URL(request.url);
    const _procedure = url.pathname.replace('/api/trpc/', '');

    // Add mock responses for procedures as needed
    // This is a catch-all that returns empty success
    return HttpResponse.json({
      result: {
        data: null,
      },
    });
  }),
];
