'use client';

import dynamic from 'next/dynamic';

const AdminPathsContent = dynamic(
  () => import('@/components/admin/paths-content'),
  { ssr: false }
);

export default function AdminPathsPage() {
  return <AdminPathsContent />;
}
