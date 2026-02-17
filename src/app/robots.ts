import type { MetadataRoute } from 'next'

const getAppUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.dronacharya.app'
}

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/settings/', '/admin/'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
