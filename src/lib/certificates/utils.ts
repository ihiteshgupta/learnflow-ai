// Client-safe certificate utilities (no Node.js dependencies)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://learnflow.ai';

/**
 * Generate LinkedIn share URL for certificate
 */
export function generateLinkedInShareUrl(input: {
  courseName: string;
  credentialId: string;
  issuedAt: Date;
}): string {
  const verifyUrl = `${APP_URL}/verify/${input.credentialId}`;
  const year = input.issuedAt.getFullYear();
  const month = input.issuedAt.getMonth() + 1;

  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: `${input.courseName} - LearnFlow Certification`,
    organizationName: 'LearnFlow AI',
    issueYear: year.toString(),
    issueMonth: month.toString(),
    certUrl: verifyUrl,
    certId: input.credentialId,
  });

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/**
 * Get verification URL for a credential
 */
export function getVerificationUrl(credentialId: string): string {
  return `${APP_URL}/verify/${credentialId}`;
}
