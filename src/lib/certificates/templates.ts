// Certificate HTML templates for PDF generation

export interface CertificateData {
  recipientName: string;
  courseName: string;
  tier: 'bronze' | 'silver' | 'gold';
  credentialId: string;
  issuedAt: Date;
  skills?: string[];
  examScore?: number;
  projectDescription?: string;
  verifyUrl: string;
  qrCodeDataUrl: string;
}

const tierColors = {
  bronze: { primary: '#CD7F32', secondary: '#8B4513', accent: '#D4A574' },
  silver: { primary: '#C0C0C0', secondary: '#A8A8A8', accent: '#E8E8E8' },
  gold: { primary: '#FFD700', secondary: '#DAA520', accent: '#FFF8DC' },
};

const tierLabels = {
  bronze: 'Bronze Certificate',
  silver: 'Silver Certificate',
  gold: 'Gold Certificate',
};

const tierDescriptions = {
  bronze: 'has successfully completed all course materials',
  silver: 'has demonstrated proficiency by passing the certification exam',
  gold: 'has achieved excellence by completing a capstone project',
};

export function getCertificateTemplate(data: CertificateData): string {
  const colors = tierColors[data.tier];
  const formattedDate = data.issuedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Open Sans', sans-serif;
      background: white;
    }

    .certificate {
      width: 1056px;
      height: 816px;
      padding: 40px;
      position: relative;
      background: linear-gradient(135deg, ${colors.accent} 0%, white 50%, ${colors.accent} 100%);
    }

    .border-frame {
      width: 100%;
      height: 100%;
      border: 4px solid ${colors.primary};
      border-radius: 8px;
      padding: 30px;
      position: relative;
    }

    .corner-accent {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 3px solid ${colors.secondary};
    }

    .corner-tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
    .corner-tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
    .corner-br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

    .content {
      text-align: center;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .header {
      margin-bottom: 20px;
    }

    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      letter-spacing: 2px;
    }

    .tier-badge {
      display: inline-block;
      padding: 8px 24px;
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      color: ${data.tier === 'gold' ? '#1a1a2e' : 'white'};
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 10px;
    }

    .main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .title {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 20px;
    }

    .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 30px;
    }

    .recipient-name {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 600;
      color: ${colors.secondary};
      margin-bottom: 15px;
    }

    .description {
      font-size: 16px;
      color: #444;
      margin-bottom: 25px;
    }

    .course-name {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 20px;
    }

    .skills {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .skill-tag {
      padding: 5px 15px;
      background: ${colors.accent};
      border: 1px solid ${colors.primary};
      border-radius: 15px;
      font-size: 12px;
      color: #444;
    }

    .exam-score {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .footer-left {
      text-align: left;
    }

    .footer-center {
      text-align: center;
    }

    .footer-right {
      text-align: right;
    }

    .date {
      font-size: 14px;
      color: #666;
    }

    .credential-id {
      font-family: monospace;
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }

    .qr-code {
      width: 80px;
      height: 80px;
    }

    .verify-text {
      font-size: 10px;
      color: #888;
      margin-top: 5px;
    }

    .signature-line {
      width: 200px;
      border-top: 1px solid #ccc;
      margin: 0 auto;
      padding-top: 5px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-frame">
      <div class="corner-accent corner-tl"></div>
      <div class="corner-accent corner-tr"></div>
      <div class="corner-accent corner-bl"></div>
      <div class="corner-accent corner-br"></div>

      <div class="content">
        <div class="header">
          <div class="logo">DRONACHARYA</div>
          <div class="tier-badge">${tierLabels[data.tier]}</div>
        </div>

        <div class="main">
          <div class="title">Certificate of Achievement</div>
          <div class="subtitle">This is to certify that</div>
          <div class="recipient-name">${escapeHtml(data.recipientName)}</div>
          <div class="description">${tierDescriptions[data.tier]}</div>
          <div class="course-name">${escapeHtml(data.courseName)}</div>

          ${data.skills && data.skills.length > 0 ? `
          <div class="skills">
            ${data.skills.slice(0, 5).map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
          </div>
          ` : ''}

          ${data.examScore ? `
          <div class="exam-score">Exam Score: ${data.examScore}%</div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="footer-left">
            <div class="date">Issued: ${formattedDate}</div>
            <div class="credential-id">${data.credentialId}</div>
          </div>

          <div class="footer-center">
            <div class="signature-line">Dronacharya</div>
          </div>

          <div class="footer-right">
            <img src="${data.qrCodeDataUrl}" class="qr-code" alt="Verify QR Code" />
            <div class="verify-text">Scan to verify</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char]);
}
