'use client';

import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const tierStyles = {
  bronze: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: 'text-amber-600',
  },
  silver: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: 'text-slate-500',
  },
  gold: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: 'text-yellow-600',
  },
};

export default function VerifyPage() {
  const params = useParams();
  const credentialId = params.credentialId as string;

  const { data, isLoading, error } = trpc.certification.verify.useQuery(
    { credentialId },
    { enabled: !!credentialId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Verification Error
            </h2>
            <p className="text-slate-600">
              Unable to verify this credential. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Certificate Not Found
            </h2>
            <p className="text-slate-600 mb-4">
              The credential ID <code className="bg-slate-100 px-2 py-1 rounded text-sm">{credentialId}</code> could not be verified.
            </p>
            <p className="text-sm text-slate-500">
              This may mean the credential does not exist or has been revoked.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const styles = tierStyles[data.tier as keyof typeof tierStyles] || tierStyles.bronze;
  const formattedDate = data.issuedAt ? new Date(data.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Valid Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Valid Certificate</span>
          </div>
        </div>

        {/* Certificate Card */}
        <Card className={`${styles.bg} ${styles.border} border-2`}>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Award className={`h-16 w-16 ${styles.icon}`} />
            </div>
            <Badge className={`${styles.badge} text-sm px-3 py-1 mb-4`}>
              {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)} Certificate
            </Badge>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Certificate of Achievement
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {/* Recipient */}
            <div>
              <p className="text-sm text-slate-500 mb-2">Awarded to</p>
              <div className="flex items-center justify-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={data.recipientImage || undefined} />
                  <AvatarFallback>
                    {data.recipientName?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-2xl font-semibold text-slate-900">
                  {data.recipientName}
                </span>
              </div>
            </div>

            {/* Course */}
            <div>
              <p className="text-sm text-slate-500 mb-1">For completing</p>
              <p className="text-xl font-medium text-slate-800">
                {data.courseName}
              </p>
            </div>

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div>
                <p className="text-sm text-slate-500 mb-2">Skills Acquired</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {data.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Issue Date</p>
                  <div className="flex items-center justify-center gap-1 text-slate-700">
                    <Calendar className="h-4 w-4" />
                    {formattedDate}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500">Credential ID</p>
                  <p className="font-mono text-slate-700">{data.credentialId}</p>
                </div>
              </div>
            </div>

            {/* Expiration */}
            {data.expiresAt && (
              <p className="text-sm text-slate-500">
                Valid until: {new Date(data.expiresAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-slate-600">
            This certificate was issued by <strong>LearnFlow AI</strong> and has been verified as authentic.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://learnflow.ai" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit LearnFlow
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
