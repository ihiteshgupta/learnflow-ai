'use client';

import dynamic from 'next/dynamic';

const LearningPathDetailContent = dynamic(
  () => import('@/components/paths/path-detail-content'),
  { ssr: false }
);

export default function LearningPathDetailPage() {
  return <LearningPathDetailContent />;
}
