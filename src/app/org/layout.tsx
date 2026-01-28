'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  Users2,
  Settings,
  LayoutDashboard,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createContext, useContext, useState, useEffect } from 'react';

// Context for selected organization
interface OrgContextValue {
  orgId: string | null;
  setOrgId: (id: string) => void;
  org: {
    id: string;
    name: string;
    slug: string;
    userRole: string;
  } | null;
}

const OrgContext = createContext<OrgContextValue>({
  orgId: null,
  setOrgId: () => {},
  org: null,
});

export const useOrg = () => useContext(OrgContext);

const navItems = [
  { href: '/org', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/org/teams', label: 'Teams', icon: Users2 },
  { href: '/org/members', label: 'Members', icon: Users },
  { href: '/org/settings', label: 'Settings', icon: Settings },
];

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const { data: orgs, isLoading: orgsLoading } = trpc.organization.list.useQuery();

  const { data: selectedOrg, isLoading: orgLoading } = trpc.organization.get.useQuery(
    { orgId: selectedOrgId! },
    { enabled: !!selectedOrgId }
  );

  // Auto-select first org if none selected
  useEffect(() => {
    if (!selectedOrgId && orgs && orgs.length > 0) {
      setSelectedOrgId(orgs[0].id);
    }
  }, [orgs, selectedOrgId]);

  const isLoading = orgsLoading || (selectedOrgId && orgLoading);

  if (orgsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!orgs || orgs.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Organization</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You&apos;re not a member of any organization yet. Create one to get started with team learning.
          </p>
          <Button asChild>
            <Link href="/org/create">Create Organization</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <OrgContext.Provider
      value={{
        orgId: selectedOrgId,
        setOrgId: setSelectedOrgId,
        org: selectedOrg ? {
          id: selectedOrg.id,
          name: selectedOrg.name,
          slug: selectedOrg.slug,
          userRole: selectedOrg.userRole || 'member',
        } : null,
      }}
    >
      <MainLayout>
        <div className="flex gap-6">
          {/* Org Sidebar */}
          <aside className="w-64 shrink-0">
            {/* Org Selector */}
            <div className="mb-6">
              <Select value={selectedOrgId || ''} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {org.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/org' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Role Badge */}
            {selectedOrg && (
              <div className="mt-6 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Your role</p>
                <p className="text-sm font-medium capitalize">{selectedOrg.userRole}</p>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !selectedOrgId ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select an organization to continue</p>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </MainLayout>
    </OrgContext.Provider>
  );
}
