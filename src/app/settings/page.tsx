'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Save,
  Camera,
  Loader2,
  Trophy,
  Flame,
  BookOpen,
  Users,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { NOTIFICATION_TYPES } from '@/lib/db/schema';

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: typeof Trophy; label: string; description: string }> = {
  achievement_unlocked: { icon: Trophy, label: 'Achievement Unlocked', description: 'When you earn a new achievement' },
  streak_milestone: { icon: Flame, label: 'Streak Milestones', description: 'When you reach streak milestones' },
  course_completed: { icon: BookOpen, label: 'Course Completed', description: 'When you complete a course' },
  certificate_earned: { icon: Trophy, label: 'Certificate Earned', description: 'When you earn a certificate' },
  lesson_reminder: { icon: BookOpen, label: 'Lesson Reminders', description: 'Daily reminders to continue learning' },
  team_update: { icon: Users, label: 'Team Updates', description: 'Updates from your team' },
  org_announcement: { icon: Building2, label: 'Organization Announcements', description: 'Announcements from your organization' },
  admin_alert: { icon: AlertCircle, label: 'Admin Alerts', description: 'Important system alerts' },
  system_message: { icon: Bell, label: 'System Messages', description: 'General system notifications' },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Form state for profile
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
  });

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  // Fetch notification preferences
  const { data: notificationPrefs, isLoading: prefsLoading } = trpc.notifications.getPreferences.useQuery();

  // Mutations
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast({ title: 'Profile updated', description: 'Your profile has been saved successfully.' });
      utils.user.getProfile.invalidate();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updatePrefsMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      toast({ title: 'Preferences updated', description: 'Your notification preferences have been saved.' });
      utils.notifications.getPreferences.invalidate();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Initialize profile from session
  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        bio: '',
      });
    }
  }, [session]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name: profile.name,
    });
  };

  const handleToggleNotification = (type: string, channel: 'inApp' | 'email' | 'push', value: boolean) => {
    updatePrefsMutation.mutate({
      type: type as typeof NOTIFICATION_TYPES[number],
      [channel]: value,
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                      {getInitials(profile.name || 'U')}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>

                <Button
                  className="gradient-brand text-white"
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive and how
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {prefsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Channel Headers */}
                    <div className="grid grid-cols-[1fr,80px,80px,80px] gap-4 items-center pb-2 border-b">
                      <div className="font-medium">Notification Type</div>
                      <div className="text-center text-sm font-medium text-muted-foreground">In-App</div>
                      <div className="text-center text-sm font-medium text-muted-foreground">
                        <Mail className="h-4 w-4 mx-auto" />
                      </div>
                      <div className="text-center text-sm font-medium text-muted-foreground">
                        <Smartphone className="h-4 w-4 mx-auto" />
                      </div>
                    </div>

                    {/* Notification Types */}
                    {notificationPrefs?.map((pref) => {
                      const config = NOTIFICATION_TYPE_CONFIG[pref.type];
                      if (!config) return null;
                      const Icon = config.icon;

                      return (
                        <div key={pref.type} className="grid grid-cols-[1fr,80px,80px,80px] gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium text-sm">{config.label}</p>
                              <p className="text-xs text-muted-foreground">{config.description}</p>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <Switch
                              checked={pref.inApp}
                              onCheckedChange={(checked) => handleToggleNotification(pref.type, 'inApp', checked)}
                              disabled={updatePrefsMutation.isPending}
                            />
                          </div>
                          <div className="flex justify-center">
                            <Switch
                              checked={pref.email}
                              onCheckedChange={(checked) => handleToggleNotification(pref.type, 'email', checked)}
                              disabled={updatePrefsMutation.isPending}
                            />
                          </div>
                          <div className="flex justify-center">
                            <Switch
                              checked={pref.push}
                              onCheckedChange={(checked) => handleToggleNotification(pref.type, 'push', checked)}
                              disabled={updatePrefsMutation.isPending}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how LearnFlow looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Theme</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'light'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Sun className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Light</p>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Moon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Dark</p>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        theme === 'system'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Globe className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">System</p>
                    </button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Language</h4>
                  <select className="w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy and data preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your profile and achievements
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Learning Activity</p>
                      <p className="text-sm text-muted-foreground">
                        Display your learning streak and progress publicly
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Leaderboard Visibility</p>
                      <p className="text-sm text-muted-foreground">
                        Appear on course and global leaderboards
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-destructive mb-4">Danger Zone</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
