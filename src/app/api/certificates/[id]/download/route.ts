import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { certifications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateCertificatePDF } from '@/lib/certificates';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = await context.params;

    // Get certification - must belong to the authenticated user
    const certification = await db.query.certifications.findFirst({
      where: and(
        eq(certifications.id, id),
        eq(certifications.userId, session.user.id)
      ),
      with: {
        course: true,
        user: {
          columns: {
            name: true,
          },
        },
      },
    });

    if (!certification) {
      return new Response(JSON.stringify({ error: 'Certificate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Don't allow downloading pending certificates
    if (certification.credentialId.startsWith('PENDING-')) {
      return new Response(
        JSON.stringify({ error: 'Certificate is pending approval' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract exam score from metadata if available
    const examScore = certification.metadata?.reviewerNotes?.match(/Exam score: (\d+\.?\d*)%/)?.[1];

    // Generate PDF
    const pdfBuffer = await generateCertificatePDF({
      recipientName: certification.user?.name || 'Unknown',
      courseName: certification.course?.name || 'Course',
      tier: certification.tier as 'bronze' | 'silver' | 'gold',
      credentialId: certification.credentialId,
      issuedAt: certification.issuedAt || new Date(),
      skills: certification.metadata?.skills,
      examScore: examScore ? parseFloat(examScore) : undefined,
      projectDescription: certification.metadata?.projectDescription,
    });

    // Return PDF with appropriate headers
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certification.credentialId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Certificate download error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate certificate' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
