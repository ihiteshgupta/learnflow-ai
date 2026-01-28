// Server-side only exports (puppeteer-dependent)
export { generateCertificatePDF } from './generator';
export type { CertificateInput } from './generator';
export type { CertificateData } from './templates';

// Client-safe exports (re-exported for convenience in server components)
export { generateLinkedInShareUrl, getVerificationUrl } from './utils';
