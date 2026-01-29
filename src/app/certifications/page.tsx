'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { generateLinkedInShareUrl, getVerificationUrl } from '@/lib/certificates/utils';
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Calendar,
  Clock,
  BookOpen,
  Loader2,
  Linkedin,
  Link2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const tierColors = {
  bronze: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  silver: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
};

export default function CertificationsPage() {
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: certifications, isLoading } = trpc.certification.list.useQuery();

  const handleDownload = async (certId: string, credentialId: string) => {
    setDownloadingId(certId);
    try {
      const response = await fetch(`/api/certificates/${certId}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${credentialId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download started',
        description: 'Your certificate is being downloaded.',
      });
    } catch {
      toast({
        title: 'Download failed',
        description: 'Unable to download certificate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyLink = (credentialId: string) => {
    const url = getVerificationUrl(credentialId);
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied',
      description: 'Verification link copied to clipboard.',
    });
  };

  const handleLinkedInShare = (cert: {
    course?: { name?: string } | null;
    credentialId: string;
    issuedAt: Date | null;
  }) => {
    const url = generateLinkedInShareUrl({
      courseName: cert.course?.name || 'Course',
      credentialId: cert.credentialId,
      issuedAt: cert.issuedAt ? new Date(cert.issuedAt) : new Date(),
    });
    window.open(url, '_blank', 'width=600,height=400');
  };

  const earnedCount = certifications?.filter(c => !c.isPending).length || 0;
  const pendingCount = certifications?.filter(c => c.isPending).length || 0;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
            <p className="text-muted-foreground">
              Earn certificates and showcase your skills
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl gradient-brand">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{earnedCount}</p>
                  <p className="text-sm text-muted-foreground">Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber/20">
                  <Clock className="h-6 w-6 text-amber" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{certifications?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certifications List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Certifications</h2>

          {!certifications || certifications.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No certifications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete courses to earn Bronze, Silver, and Gold certifications.
                </p>
                <Button asChild>
                  <a href="/courses">Browse Courses</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {certifications.map((cert) => {
                const tier = cert.tier as keyof typeof tierColors;
                const colors = tierColors[tier] || tierColors.bronze;

                return (
                  <Card
                    key={cert.id}
                    className={cn(
                      'border-0 shadow-md overflow-hidden',
                      cert.isPending && 'opacity-75'
                    )}
                  >
                    <div className={cn(
                      'h-1',
                      tier === 'bronze' && 'bg-amber-500',
                      tier === 'silver' && 'bg-slate-400',
                      tier === 'gold' && 'bg-yellow-500'
                    )} />

                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Certificate Icon */}
                        <div className={cn(
                          'p-4 rounded-xl w-fit',
                          colors.bg
                        )}>
                          <Award className={cn('h-8 w-8', colors.text)} />
                        </div>

                        {/* Certificate Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {cert.course?.name || 'Course'}
                            </h3>
                            <Badge className={cn(colors.bg, colors.text, colors.border)}>
                              {tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </Badge>
                            {cert.isPending && (
                              <Badge variant="outline" className="border-amber-500 text-amber-600">
                                Pending Review
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            Issued by LearnFlow AI
                          </p>

                          {/* Skills */}
                          {cert.metadata?.skills && cert.metadata.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {cert.metadata.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Completed info */}
                          {!cert.isPending && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                {cert.credentialId}
                              </span>
                            </div>
                          )}

                          {/* Pending info */}
                          {cert.isPending && (
                            <p className="text-sm text-amber-600">
                              Your project is being reviewed. You'll be notified when approved.
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!cert.isPending && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(cert.id, cert.credentialId)}
                                disabled={downloadingId === cert.id}
                              >
                                {downloadingId === cert.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4 mr-1" />
                                )}
                                Download
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Share2 className="h-4 w-4 mr-1" /> Share
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleCopyLink(cert.credentialId)}>
                                    <Link2 className="h-4 w-4 mr-2" />
                                    Copy verification link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleLinkedInShare(cert)}>
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    Add to LinkedIn
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a
                                      href={getVerificationUrl(cert.credentialId)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View certificate
                                    </a>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
