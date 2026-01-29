'use client';

import dynamic from 'next/dynamic';

const AdminCoursesContent = dynamic(
  () => import('@/components/admin/courses-content'),
  { ssr: false }
);

export default function AdminCoursesPage() {
  return <AdminCoursesContent />;
}
