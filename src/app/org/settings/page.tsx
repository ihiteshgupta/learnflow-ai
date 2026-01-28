'use client';

import { useState, useEffect } from 'react';
import { useOrg } from '../layout';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OrgSettings() {
  const { orgId, org } = useOrg();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: orgData, isLoading } = trpc.organization.get.useQuery(
    { orgId: orgId! },
    { enabled: !!orgId }
  );

  const updateMutation = trpc.organization.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Settings saved',
        description: 'Organization settings have been updated.',
      });
      utils.organization.get.invalidate({ orgId: orgId! });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form state
  const [name, setName] = useState('');
  const [gamificationMode, setGamificationMode] = useState<'full' | 'moderate' | 'minimal' | 'off'>('full');
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowSelfEnroll, setAllowSelfEnroll] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');

  // Initialize form with org data
  useEffect(() => {
    if (orgData) {
      setName(orgData.name);
      setGamificationMode(orgData.settings?.gamificationMode || 'full');
      setRequireApproval(orgData.settings?.requireApproval || false);
      setAllowSelfEnroll(orgData.settings?.allowSelfEnroll ?? true);
      setPrimaryColor(orgData.branding?.primaryColor || '#6366f1');
    }
  }, [orgData]);

  const handleSave = () => {
    if (!orgId) return;

    updateMutation.mutate({
      orgId,
      name,
      settings: {
        gamificationMode,
        requireApproval,
        allowSelfEnroll,
      },
      branding: {
        primaryColor,
      },
    });
  };

  const isAdmin = org?.userRole === 'admin' || org?.userRole === 'owner';

  if (!orgId || !org) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You need admin or owner permissions to access organization settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your organization settings</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic organization information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
            />
          </div>

          <div className="space-y-2">
            <Label>Organization Slug</Label>
            <Input value={orgData?.slug || ''} disabled />
            <p className="text-xs text-muted-foreground">
              The slug cannot be changed after creation.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Plan Type</Label>
            <Input value={orgData?.planType || 'free'} disabled className="capitalize" />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize your organization&apos;s appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#6366f1"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Settings</CardTitle>
          <CardDescription>Configure how learning works in your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gamification">Gamification Mode</Label>
            <Select value={gamificationMode} onValueChange={(v: string) => setGamificationMode(v as typeof gamificationMode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gamification level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full - All gamification features</SelectItem>
                <SelectItem value="moderate">Moderate - Points and badges only</SelectItem>
                <SelectItem value="minimal">Minimal - Progress tracking only</SelectItem>
                <SelectItem value="off">Off - No gamification</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls points, badges, streaks, and leaderboards for members.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Member Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Member Settings</CardTitle>
          <CardDescription>Control how members join and interact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Approval</Label>
              <p className="text-sm text-muted-foreground">
                New members must be approved by an admin before joining.
              </p>
            </div>
            <Switch
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Self-Enrollment</Label>
              <p className="text-sm text-muted-foreground">
                Members can enroll themselves in courses without approval.
              </p>
            </div>
            <Switch
              checked={allowSelfEnroll}
              onCheckedChange={setAllowSelfEnroll}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - only for owners */}
      {org.userRole === 'owner' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Organization</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this organization and all its data.
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Organization
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
