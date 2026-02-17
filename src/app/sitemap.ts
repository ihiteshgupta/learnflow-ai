import type { MetadataRoute } from 'next'

const getAppUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.dronacharya.app'
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl()

  return [
    {
      url: `${appUrl}/`,
    },
    {
      url: `${appUrl}/auth/login`,
    },
    {
      url: `${appUrl}/auth/register`,
    },
  ]
}
