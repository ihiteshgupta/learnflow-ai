'use client';

import dynamic from 'next/dynamic';

const LearningPathsContent = dynamic(
  () => import('@/components/paths/paths-list-content'),
  { ssr: false }
);

export default function LearningPathsPage() {
  return <LearningPathsContent />;
}
