'use client';

import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader, StatCard } from '@/components/brand';
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  BookOpen,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for certifications
const certifications = [
  {
    id: '1',
    name: 'Python Fundamentals',
    issuer: 'Dronacharya',
    status: 'completed',
    completedAt: '2024-01-15',
    credentialId: 'LF-PY-2024-001',
    skills: ['Python', 'Data Types', 'Control Flow', 'Functions'],
    progress: 100,
  },
  {
    id: '2',
    name: 'Data Science Basics',
    issuer: 'Dronacharya',
    status: 'in_progress',
    progress: 65,
    skills: ['pandas', 'NumPy', 'Data Visualization'],
  },
  {
    id: '3',
    name: 'Machine Learning Foundations',
    issuer: 'Dronacharya',
    status: 'locked',
    progress: 0,
    skills: ['Supervised Learning', 'Model Training', 'Evaluation'],
    prerequisite: 'Data Science Basics',
  },
];

export default function CertificationsPage() {
  const earnedCount = certifications.filter(c => c.status === 'completed').length;
  const inProgressCount = certifications.filter(c => c.status === 'in_progress').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Certifications"
          description="Earn certificates and showcase your skills"
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Earned" value={earnedCount} icon={<Award className="h-5 w-5" />} />
          <StatCard label="In Progress" value={inProgressCount} icon={<Clock className="h-5 w-5" />} />
          <StatCard label="Available" value={certifications.length} icon={<BookOpen className="h-5 w-5" />} />
        </div>

        {/* Certifications List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Certifications</h2>

          <div className="grid gap-4">
            {certifications.map((cert) => (
              <Card
                key={cert.id}
                className={cn(
                  'overflow-hidden',
                  cert.status === 'locked' && 'opacity-60'
                )}
              >
                {cert.status === 'completed' && (
                  <div className="h-1 gradient-success" />
                )}
                {cert.status === 'in_progress' && (
                  <div className="h-1 gradient-brand" />
                )}

                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Certificate Icon */}
                    <div className={cn(
                      'p-4 rounded-xl w-fit',
                      cert.status === 'completed' && 'gradient-brand',
                      cert.status === 'in_progress' && 'bg-amber/20',
                      cert.status === 'locked' && 'bg-muted'
                    )}>
                      {cert.status === 'locked' ? (
                        <Lock className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <Award className={cn(
                          'h-8 w-8',
                          cert.status === 'completed' ? 'text-white' : 'text-amber'
                        )} />
                      )}
                    </div>

                    {/* Certificate Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{cert.name}</h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            cert.status === 'completed' && 'border-emerald text-emerald',
                            cert.status === 'in_progress' && 'border-amber text-amber',
                            cert.status === 'locked' && 'border-muted-foreground text-muted-foreground'
                          )}
                        >
                          {cert.status === 'completed' && 'Completed'}
                          {cert.status === 'in_progress' && 'In Progress'}
                          {cert.status === 'locked' && 'Locked'}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        Issued by {cert.issuer}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {cert.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Progress bar for in-progress */}
                      {cert.status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{cert.progress}%</span>
                          </div>
                          <Progress value={cert.progress} className="h-2" />
                        </div>
                      )}

                      {/* Prerequisite for locked */}
                      {cert.status === 'locked' && cert.prerequisite && (
                        <p className="text-sm text-muted-foreground">
                          Requires: {cert.prerequisite}
                        </p>
                      )}

                      {/* Completed info */}
                      {cert.status === 'completed' && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {cert.completedAt ? new Date(cert.completedAt).toLocaleDateString() : '—'}
                          </span>
                          <span>ID: {cert.credentialId}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {cert.status === 'completed' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-1" /> Share
                          </Button>
                        </>
                      )}
                      {cert.status === 'in_progress' && (
                        <Button className="gradient-brand text-white">
                          Continue <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                      {cert.status === 'locked' && (
                        <Button variant="outline" disabled>
                          <Lock className="h-4 w-4 mr-1" /> Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
