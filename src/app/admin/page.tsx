'use client';

import dynamic from 'next/dynamic';

const AdminDashboardContent = dynamic(
  () => import('@/components/admin/dashboard-content'),
  { ssr: false }
);

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}
