'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrg } from '../../layout';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Settings,
  UserPlus,
  Trash2,
  Loader2,
  Users2,
  UserMinus,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const { orgId, org } = useOrg();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const { data: team, isLoading } = trpc.organization.getTeam.useQuery(
    { orgId: orgId!, teamId },
    { enabled: !!orgId && !!teamId }
  );

  const { data: orgMembers } = trpc.organization.listMembers.useQuery(
    { orgId: orgId! },
    { enabled: !!orgId && isAddMemberOpen }
  );

  const updateMutation = trpc.organization.updateTeam.useMutation({
    onSuccess: () => {
      toast({ title: 'Team updated', description: 'Team details have been saved.' });
      setIsEditOpen(false);
      utils.organization.getTeam.invalidate({ orgId: orgId!, teamId });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = trpc.organization.deleteTeam.useMutation({
    onSuccess: () => {
      toast({ title: 'Team deleted', description: 'The team has been deleted.' });
      router.push('/org/teams');
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addMemberMutation = trpc.organization.addTeamMember.useMutation({
    onSuccess: () => {
      toast({ title: 'Member added', description: 'The member has been added to the team.' });
      setIsAddMemberOpen(false);
      setSelectedUserId('');
      utils.organization.getTeam.invalidate({ orgId: orgId!, teamId });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const removeMemberMutation = trpc.organization.removeTeamMember.useMutation({
    onSuccess: () => {
      toast({ title: 'Member removed', description: 'The member has been removed from the team.' });
      utils.organization.getTeam.invalidate({ orgId: orgId!, teamId });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleEdit = () => {
    if (!team) return;
    setEditName(team.name);
    setEditDescription(team.description || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!orgId || !editName.trim()) return;
    updateMutation.mutate({
      orgId,
      teamId,
      name: editName.trim(),
      description: editDescription.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (!orgId) return;
    deleteMutation.mutate({ orgId, teamId });
  };

  const handleAddMember = () => {
    if (!orgId || !selectedUserId) return;
    addMemberMutation.mutate({ orgId, teamId, userId: selectedUserId });
  };

  const handleRemoveMember = (userId: string) => {
    if (!orgId) return;
    removeMemberMutation.mutate({ orgId, teamId, userId });
  };

  const canManageTeam = org?.userRole === 'owner' || org?.userRole === 'admin' || org?.userRole === 'manager';

  // Get members not already in the team
  const availableMembers = orgMembers?.filter(
    (m) => !team?.members?.some((tm) => tm.userId === m.userId)
  );

  if (!orgId || !org) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Team not found</h2>
        <Button asChild variant="outline">
          <Link href="/org/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/org/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users2 className="h-8 w-8" />
              {team.name}
            </h1>
            {team.description && (
              <p className="text-muted-foreground mt-1">{team.description}</p>
            )}
          </div>
        </div>

        {canManageTeam && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Settings className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Team</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this team? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {team.members?.length || 0} {team.members?.length === 1 ? 'member' : 'members'}
            </CardDescription>
          </div>

          {canManageTeam && (
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Select an organization member to add to this team.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>Select Member</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMembers?.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.user.name || member.user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableMembers?.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      All organization members are already in this team.
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || addMemberMutation.isPending}
                  >
                    {addMemberMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {team.members && team.members.length > 0 ? (
            <div className="space-y-3">
              {team.members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {member.user.name?.charAt(0) || member.user.email?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.name || 'Unnamed'}</p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'lead' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    {canManageTeam && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={removeMemberMutation.isPending}
                      >
                        <UserMinus className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No members in this team yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>Update team details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Team Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
