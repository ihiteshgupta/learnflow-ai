'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Search,
  MoreVertical,
  Shield,
  UserCog,
  Mail,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AdminUsersContent() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

  const { data: users, isLoading } = trpc.admin.listUsers.useQuery({
    search: search || undefined,
    role: roleFilter as 'user' | 'admin' | undefined,
    limit: 50,
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast({
        title: 'Role updated',
        description: 'User role has been updated successfully.',
      });
      utils.admin.listUsers.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRoleChange = (userId: string, newRole: 'user' | 'admin') => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage platform users and roles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-10"
          />
        </div>
        <Select value={roleFilter || 'all'} onValueChange={(v: string) => setRoleFilter(v === 'all' ? undefined : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Platform Users
          </CardTitle>
          <CardDescription>
            {users?.length || 0} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{user.name || 'Unnamed User'}</p>
                      {user.role === 'admin' && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      {user.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.profile && (
                      <Badge variant="outline">
                        Level {user.profile.level || 1}
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserCog className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.role === 'user' ? (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'admin')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, 'user')}
                          >
                            Remove Admin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'No users match your search.' : 'No users found.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
