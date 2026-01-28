import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import { getCertificateTemplate, CertificateData } from './templates';

// App base URL for verification links
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://learnflow.ai';

export interface CertificateInput {
  recipientName: string;
  courseName: string;
  tier: 'bronze' | 'silver' | 'gold';
  credentialId: string;
  issuedAt: Date;
  skills?: string[];
  examScore?: number;
  projectDescription?: string;
}

/**
 * Generate QR code data URL for verification
 */
async function generateQRCode(verifyUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
  } catch {
    // Return placeholder if QR generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
}

/**
 * Generate certificate PDF buffer
 */
export async function generateCertificatePDF(input: CertificateInput): Promise<Buffer> {
  const verifyUrl = `${APP_URL}/verify/${input.credentialId}`;
  const qrCodeDataUrl = await generateQRCode(verifyUrl);

  const certificateData: CertificateData = {
    ...input,
    verifyUrl,
    qrCodeDataUrl,
  };

  const html = getCertificateTemplate(certificateData);

  // Launch puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // Set content and wait for fonts to load
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
    });

    // Generate PDF in landscape orientation (certificate style)
    const pdfBuffer = await page.pdf({
      width: '11in',
      height: '8.5in',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
