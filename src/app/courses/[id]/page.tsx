'use client';

import dynamic from 'next/dynamic';

const CourseDetailContent = dynamic(
  () => import('@/components/courses/course-detail-content'),
  { ssr: false }
);

export default function CourseDetailPage() {
  return <CourseDetailContent />;
}
