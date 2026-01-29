'use client';

import dynamic from 'next/dynamic';

const AdminUsersContent = dynamic(
  () => import('@/components/admin/users-content'),
  { ssr: false }
);

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
