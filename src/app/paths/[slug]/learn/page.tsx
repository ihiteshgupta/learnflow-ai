'use client';

import dynamic from 'next/dynamic';

const PathLearnContent = dynamic(
  () => import('@/components/paths/path-learn-content'),
  { ssr: false }
);

export default function PathLearnPage() {
  return <PathLearnContent />;
}
