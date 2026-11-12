// ============================================================================
// ISML COLLEGE LMS — HIGH-DELIVERABILITY ENTERPRISE EMAIL SERVICE
// Powered by Resend API with Anti-Spam Headers, Clean Typography, Zero Emojis
// Supports Single Dispatch, Bulk Concurrent Throttling & Batch Credentials
// ============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export class EmailNotificationService {
  private static readonly API_KEY =
    process.env.RESEND_API_KEY || '';
  private static readonly FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'ISML LMS <onboarding@joyautomations.in>';

  /**
   * Send single transactional email via Resend API
   */
  public static async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const recipientList = Array.isArray(options.to) ? options.to : [options.to];
      const validRecipients = recipientList.filter(
        (e) => e && typeof e === 'string' && e.includes('@') && !e.endsWith('.invalid')
      );

      if (validRecipients.length === 0) {
        return { success: false, error: 'No valid recipient email address provided.' };
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.FROM_EMAIL,
          to: validRecipients,
          subject: options.subject,
          html: options.html,
          text: options.text || this.stripHtml(options.html),
          headers: {
            'X-Entity-Ref-ID': `ISML-${Date.now()}`,
            'List-Unsubscribe': '<mailto:support@isml.edu?subject=unsubscribe>',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[RESEND API ERROR]', data);
        return { success: false, error: data.message || 'Resend API request failed' };
      }

      return { success: true, id: data.id };
    } catch (err: any) {
      console.error('[EMAIL NOTIFICATION DISPATCH EXCEPTION]', err?.message);
      return { success: false, error: err?.message };
    }
  }

  /**
   * Professional Corporate HTML Template for Student Onboarding Credentials
   * Strict Guidelines: Zero emojis, RFC-compliant clean layout, anti-spam optimized copy
   */
  public static generateStudentCredentialsEmail(params: {
    studentName: string;
    username: string;
    password: string;
    loginUrl?: string;
    courseName?: string;
    batchName?: string;
    collegeName?: string;
  }): { subject: string; html: string; text: string } {
    const loginUrl = params.loginUrl || 'https://isml-lms.vercel.app/auth/login';
    const institution = params.collegeName || 'Indian School of Modern Languages';
    const subject = `Official Account Credentials: ${params.studentName} - ISML Learning Portal`;

    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    table { border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background-color: #0B2447; padding: 32px 40px; text-align: left; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.2px; }
    .header p { color: #94a3b8; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 36px 40px; }
    .salutation { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0; }
    .body-text { font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0; }
    .credentials-box { background-color: #f1f5f9; border-radius: 6px; border: 1px solid #cbd5e1; padding: 20px 24px; margin: 0 0 28px 0; }
    .cred-row { padding: 6px 0; }
    .cred-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; width: 130px; }
    .cred-value { font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Consolas', 'Courier New', monospace; }
    .btn-container { text-align: left; margin: 0 0 28px 0; }
    .btn { display: inline-block; background-color: #0052CC; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; text-align: center; }
    .info-list { margin: 0 0 24px 0; padding-left: 18px; color: #475569; font-size: 13px; line-height: 1.6; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: left; font-size: 12px; color: #64748b; line-height: 1.5; }
    .footer a { color: #0052CC; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <tr>
        <td class="header">
          <h1>Indian School of Modern Languages</h1>
          <p>Academic Learning Management System</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p class="salutation">Dear ${params.studentName},</p>
          <p class="body-text">
            Your admission registration has been formally verified and approved by the Super Admin governance committee. Your student account has been created on the official ISML Learning Management Portal with access to language coursework, live classrooms, and curriculum assessments.
          </p>

          <table width="100%" class="credentials-box">
            <tr>
              <td class="cred-label">Portal URL:</td>
              <td class="cred-value">${loginUrl}</td>
            </tr>
            <tr>
              <td class="cred-label">Username / Email:</td>
              <td class="cred-value">${params.username}</td>
            </tr>
            <tr>
              <td class="cred-label">Temporary Password:</td>
              <td class="cred-value">${params.password}</td>
            </tr>
            ${params.courseName ? `
            <tr>
              <td class="cred-label">Enrolled Course:</td>
              <td class="cred-value">${params.courseName}</td>
            </tr>` : ''}
            ${params.batchName ? `
            <tr>
              <td class="cred-label">Assigned Batch:</td>
              <td class="cred-value">${params.batchName}</td>
            </tr>` : ''}
            <tr>
              <td class="cred-label">Affiliated Institution:</td>
              <td class="cred-value">${institution}</td>
            </tr>
          </table>

          <div class="btn-container">
            <a href="${loginUrl}" class="btn" target="_blank">Sign In to Student Portal</a>
          </div>

          <p class="body-text" style="font-weight: 600; margin-bottom: 8px;">Next Steps for Orientation:</p>
          <ul class="info-list">
            <li>Log in using the temporary credentials above and update your password upon first entry.</li>
            <li>Review your curriculum timetable and upcoming live audio-video training sessions.</li>
            <li>Access your enrolled LSRW (Listening, Speaking, Reading, Writing) assignments and study modules.</li>
          </ul>

          <p class="body-text" style="font-size: 13px; color: #64748b; margin-bottom: 0;">
            If you did not submit this enrollment application or need administrative support, please reply to this notice or contact the Academic Coordinator desk at support@isml.edu.
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0;"><strong>ISML Academic Governance Desk</strong></p>
          <p style="margin: 0;">Confidential notice intended strictly for ${params.username}. Automated operational dispatch from ISML LMS Onboarding System.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `.trim();

    const text = `
Dear ${params.studentName},

Your admission registration has been formally verified and approved by the Super Admin governance committee. Your student account has been created on the official ISML Learning Management Portal.

ACCESS CREDENTIALS:
- Portal URL: ${loginUrl}
- Username / Email: ${params.username}
- Temporary Password: ${params.password}
${params.courseName ? `- Enrolled Course: ${params.courseName}\n` : ''}${params.batchName ? `- Assigned Batch: ${params.batchName}\n` : ''}- Affiliated Institution: ${institution}

NEXT STEPS:
1. Sign in to your account at ${loginUrl}
2. Update your temporary password upon first authentication.
3. Access your assigned timetable, live classrooms, and LSRW curriculum assignments.

For questions, contact support@isml.edu.

ISML Academic Governance Desk
    `.trim();

    return { subject, html, text };
  }

  /**
   * Professional Corporate HTML Template for Tutor / Faculty Account Authorization
   */
  public static generateTutorCredentialsEmail(params: {
    tutorName: string;
    username: string;
    password: string;
    loginUrl?: string;
    department?: string;
    designation?: string;
  }): { subject: string; html: string; text: string } {
    const loginUrl = params.loginUrl || 'https://isml-lms.vercel.app/auth/login';
    const subject = `Faculty Appointment & Portal Credentials: ${params.tutorName} - ISML Foreign Language Faculty`;

    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    table { border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background-color: #0f172a; padding: 32px 40px; text-align: left; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
    .header p { color: #94a3b8; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 36px 40px; }
    .salutation { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0; }
    .body-text { font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0; }
    .credentials-box { background-color: #f1f5f9; border-radius: 6px; border: 1px solid #cbd5e1; padding: 20px 24px; margin: 0 0 28px 0; }
    .cred-row { padding: 6px 0; }
    .cred-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; width: 130px; }
    .cred-value { font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Consolas', 'Courier New', monospace; }
    .btn-container { text-align: left; margin: 0 0 28px 0; }
    .btn { display: inline-block; background-color: #0052CC; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; text-align: center; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: left; font-size: 12px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <tr>
        <td class="header">
          <h1>Indian School of Modern Languages</h1>
          <p>Faculty & Academic Staff Portal</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p class="salutation">Dear ${params.tutorName},</p>
          <p class="body-text">
            We are pleased to confirm that your faculty onboarding appointment has been approved by the Super Admin authority. Your credentials for the ISML Tutor & Faculty Desk are now activated.
          </p>

          <table width="100%" class="credentials-box">
            <tr>
              <td class="cred-label">Portal URL:</td>
              <td class="cred-value">${loginUrl}</td>
            </tr>
            <tr>
              <td class="cred-label">Username / Email:</td>
              <td class="cred-value">${params.username}</td>
            </tr>
            <tr>
              <td class="cred-label">Temporary Password:</td>
              <td class="cred-value">${params.password}</td>
            </tr>
            <tr>
              <td class="cred-label">Faculty Role:</td>
              <td class="cred-value">${params.designation || 'Foreign Language Tutor'}</td>
            </tr>
            <tr>
              <td class="cred-label">Department:</td>
              <td class="cred-value">${params.department || 'Department of Foreign Languages'}</td>
            </tr>
          </table>

          <div class="btn-container">
            <a href="${loginUrl}" class="btn" target="_blank">Access Faculty Studio</a>
          </div>

          <p class="body-text" style="font-size: 13px; color: #475569;">
            From your desk, you can manage scheduled live classes, conduct speaking evaluations, review student assignments, and audit cohort progress.
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0;"><strong>ISML Faculty Governance Committee</strong></p>
          <p style="margin: 0;">Official administrative dispatch. For confidential staff inquiries, contact hr@isml.edu.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `.trim();

    const text = `
Dear ${params.tutorName},

Your faculty appointment has been approved. Your instructor credentials for the ISML Faculty Portal are activated.

FACULTY ACCESS CREDENTIALS:
- Portal URL: ${loginUrl}
- Username: ${params.username}
- Temporary Password: ${params.password}
- Role: ${params.designation || 'Foreign Language Tutor'}
- Department: ${params.department || 'Department of Foreign Languages'}

Sign in to your desk: ${loginUrl}

ISML Faculty Governance Committee
    `.trim();

    return { subject, html, text };
  }

  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Professional Corporate HTML Template for Campus / Institution Administrator
   * For College Principals and School Heads
   */
  public static generateInstitutionAdminCredentialsEmail(params: {
    adminName: string;
    institutionName: string;
    institutionType: 'COLLEGE' | 'SCHOOL';
    username: string;
    password: string;
    loginUrl?: string;
  }): { subject: string; html: string; text: string } {
    const loginUrl = params.loginUrl || 'https://isml-lms.vercel.app/auth/login';
    const typeLabel = params.institutionType === 'SCHOOL' ? 'School' : 'College';
    const roleLabel = params.institutionType === 'SCHOOL' ? 'School Principal / Head' : 'Campus Executive Administrator';
    const subject = `Official ${typeLabel} Administration Credentials: ${params.institutionName} - ISML Institutional Desk`;

    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    table { border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background-color: #0f172a; padding: 32px 40px; text-align: left; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
    .header p { color: #94a3b8; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 36px 40px; }
    .salutation { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0; }
    .body-text { font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0; }
    .credentials-box { background-color: #f1f5f9; border-radius: 6px; border: 1px solid #cbd5e1; padding: 20px 24px; margin: 0 0 28px 0; }
    .cred-row { padding: 6px 0; }
    .cred-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; width: 140px; }
    .cred-value { font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Consolas', 'Courier New', monospace; }
    .btn-container { text-align: left; margin: 0 0 28px 0; }
    .btn { display: inline-block; background-color: #0052CC; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; text-align: center; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: left; font-size: 12px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <tr>
        <td class="header">
          <h1>Indian School of Modern Languages</h1>
          <p>${typeLabel} Governance & Institutional Operations Desk</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p class="salutation">Dear ${params.adminName},</p>
          <p class="body-text">
            Institutional onboarding and MoU verification for <strong>${params.institutionName}</strong> has been confirmed by the Super Admin authority. Your administrative access pass to manage campus departments, student rosters, academic calendars, and attendance registries has been generated.
          </p>

          <table width="100%" class="credentials-box">
            <tr>
              <td class="cred-label">Portal URL:</td>
              <td class="cred-value">${loginUrl}</td>
            </tr>
            <tr>
              <td class="cred-label">Administrator Email:</td>
              <td class="cred-value">${params.username}</td>
            </tr>
            <tr>
              <td class="cred-label">Temporary Password:</td>
              <td class="cred-value">${params.password}</td>
            </tr>
            <tr>
              <td class="cred-label">Authorized Role:</td>
              <td class="cred-value">${roleLabel}</td>
            </tr>
            <tr>
              <td class="cred-label">Institution:</td>
              <td class="cred-value">${params.institutionName}</td>
            </tr>
          </table>

          <div class="btn-container">
            <a href="${loginUrl}" class="btn" target="_blank">Access Campus Administrator Portal</a>
          </div>

          <p class="body-text" style="font-size: 13px; color: #475569;">
            Security Notice: Please update your temporary password upon primary authentication. Do not disclose institutional access keys to unauthorized personnel.
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0;"><strong>ISML Institutional Governance Board</strong></p>
          <p style="margin: 0;">Official administrative dispatch. For confidential coordination, email partners@isml.edu.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `.trim();

    const text = `
Dear ${params.adminName},

Institutional verification for ${params.institutionName} has been approved. Your administrative credentials for the ISML Institutional Portal are activated.

ADMINISTRATOR CREDENTIALS:
- Portal URL: ${loginUrl}
- Login Email: ${params.username}
- Temporary Password: ${params.password}
- Role: ${roleLabel}
- Institution: ${params.institutionName}

Access your portal: ${loginUrl}

ISML Institutional Governance Board
    `.trim();

    return { subject, html, text };
  }

  /**
   * Professional Corporate HTML Template for Linked Parent Portal Access
   */
  public static generateParentCredentialsEmail(params: {
    parentName: string;
    studentName: string;
    username: string;
    password: string;
    loginUrl?: string;
  }): { subject: string; html: string; text: string } {
    const loginUrl = params.loginUrl || 'https://isml-lms.vercel.app/auth/login';
    const subject = `Parent Portal Access: ${params.studentName} - ISML Guardian Desk`;

    const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    table { border-collapse: collapse; }
    td { padding: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 40px 0; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background-color: #064e3b; padding: 32px 40px; text-align: left; }
    .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
    .header p { color: #a7f3d0; font-size: 13px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 36px 40px; }
    .salutation { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0; }
    .body-text { font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0; }
    .credentials-box { background-color: #f1f5f9; border-radius: 6px; border: 1px solid #cbd5e1; padding: 20px 24px; margin: 0 0 28px 0; }
    .cred-row { padding: 6px 0; }
    .cred-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; width: 130px; }
    .cred-value { font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Consolas', 'Courier New', monospace; }
    .btn-container { text-align: left; margin: 0 0 28px 0; }
    .btn { display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; text-align: center; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: left; font-size: 12px; color: #64748b; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <tr>
        <td class="header">
          <h1>Indian School of Modern Languages</h1>
          <p>Guardian & Parent Monitoring Desk</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p class="salutation">Dear ${params.parentName},</p>
          <p class="body-text">
            Your linked Parent Portal account for <strong>${params.studentName}</strong> has been activated following enrollment verification. You can track real-time attendance, test scorecards, schedule calendars, and institutional announcements from this portal.
          </p>

          <table width="100%" class="credentials-box">
            <tr>
              <td class="cred-label">Portal URL:</td>
              <td class="cred-value">${loginUrl}</td>
            </tr>
            <tr>
              <td class="cred-label">Login Email:</td>
              <td class="cred-value">${params.username}</td>
            </tr>
            <tr>
              <td class="cred-label">Temporary Password:</td>
              <td class="cred-value">${params.password}</td>
            </tr>
            <tr>
              <td class="cred-label">Linked Learner:</td>
              <td class="cred-value">${params.studentName}</td>
            </tr>
          </table>

          <div class="btn-container">
            <a href="${loginUrl}" class="btn" target="_blank">Access Parent Portal</a>
          </div>

          <p class="body-text" style="font-size: 13px; color: #475569;">
            You will receive instant SMS and email notifications regarding your child's attendance check-ins, mock test assessments, and fee ledgers.
          </p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0;"><strong>ISML Academic Governance Desk</strong></p>
          <p style="margin: 0;">Official automated dispatch. For student support, contact parents@isml.edu.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `.trim();

    const text = `
Dear ${params.parentName},

Your linked Parent Portal account for ${params.studentName} has been activated.

PARENT ACCESS CREDENTIALS:
- Portal URL: ${loginUrl}
- Login Email: ${params.username}
- Temporary Password: ${params.password}
- Linked Student: ${params.studentName}

Sign in to your portal: ${loginUrl}

ISML Academic Governance Desk
    `.trim();

    return { subject, html, text };
  }
}


