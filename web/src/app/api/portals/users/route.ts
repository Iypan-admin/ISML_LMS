import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getStaffUsersDb(): any[] {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'lib', 'realDbStaffUsers.json'),
      path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStaffUsers.json'),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    }
  } catch {}
  return [];
}

function saveStaffUsersDb(data: any[]) {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'lib', 'realDbStaffUsers.json'),
      path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStaffUsers.json'),
    ];
    for (const p of candidatePaths) {
      fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Error saving staff users:', e);
  }
}

// Generate strong auto-generated password
export function generateSecurePassword(roleCode: string = 'STAFF'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const specials = '!@#$&';
  let randStr = '';
  for (let i = 0; i < 4; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const spec = specials.charAt(Math.floor(Math.random() * specials.length));
  const year = new Date().getFullYear();

  if (roleCode.includes('ACADEMIC')) return `Acad@${year}${randStr.slice(0, 2)}${spec}`;
  if (roleCode.includes('FINANCE')) return `Fin@${year}${randStr.slice(0, 2)}${spec}`;
  if (roleCode.includes('SALES')) return `Sales@${year}${randStr.slice(0, 2)}${spec}`;
  if (roleCode.includes('TUTOR') || roleCode.includes('TEACHER')) return `Tutor@${year}${randStr.slice(0, 2)}${spec}`;
  if (roleCode.includes('COLLEGE')) return `College@${year}${randStr.slice(0, 2)}${spec}`;
  if (roleCode.includes('SCHOOL')) return `School@${year}${randStr.slice(0, 2)}${spec}`;
  return `Isml@${year}${randStr.slice(0, 2)}${spec}`;
}

export async function GET(request: Request) {
  try {
    const users = getStaffUsersDb();
    return NextResponse.json({
      status: 'success',
      total: users.length,
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const firstName = (body.firstName || body.name?.split(' ')[0] || 'Staff').trim();
    const lastName = (body.lastName || body.name?.split(' ').slice(1).join(' ') || 'User').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = (body.email || '').trim().toLowerCase();
    const mobile = body.mobile || body.phone || '+91 98400 12345';
    const roleId = body.roleId || 'role-academic-manager';
    const roleCode = (body.roleCode || 'ACADEMIC_MANAGER').toUpperCase();
    const roleName = body.roleName || (
      roleCode.includes('ACADEMIC') ? 'Academic Manager' :
      roleCode.includes('FINANCE') ? 'Finance Manager' :
      roleCode.includes('SALES') ? 'Sales Manager' :
      roleCode.includes('TUTOR') ? 'Senior Faculty / Tutor' :
      roleCode.includes('COLLEGE') ? 'College Administrator' :
      roleCode.includes('SCHOOL') ? 'School Principal / Admin' : 'Staff Member'
    );
    const collegeId = body.collegeId || '521323cd-00da-49a6-98ed-6b7918d181b4';
    const collegeName = body.collegeName || 'The American College';

    // 1. Validation: check if email is provided
    if (!email || !email.includes('@')) {
      return NextResponse.json({ status: 'error', message: 'Valid email address is required.' }, { status: 400 });
    }

    // 2. Strict Duplicate Email Validation: Check across Staff, Faculty, and Student databases
    const currentUsers = getStaffUsersDb();
    const isStaffEmailDuplicate = currentUsers.some(
      (u) => u.email?.toLowerCase().trim() === email && u.id !== body.id
    );

    let isDbUserDuplicate = false;
    try {
      const dbPaths = [
        path.join(process.cwd(), 'src', 'lib', 'realDbFaculty.json'),
        path.join(process.cwd(), 'web', 'src', 'lib', 'realDbFaculty.json'),
        path.join(process.cwd(), 'src', 'lib', 'realDbStudents.json'),
        path.join(process.cwd(), 'web', 'src', 'lib', 'realDbStudents.json'),
      ];
      for (const dp of dbPaths) {
        if (fs.existsSync(dp)) {
          const list = JSON.parse(fs.readFileSync(dp, 'utf8'));
          if (Array.isArray(list) && list.some((item: any) => item.email?.toLowerCase().trim() === email)) {
            isDbUserDuplicate = true;
            break;
          }
        }
      }
    } catch {}

    if (isStaffEmailDuplicate || isDbUserDuplicate) {
      return NextResponse.json(
        {
          status: 'error',
          message: `The email address "${email}" is already registered with an existing user. Please use a unique email.`,
        },
        { status: 409 }
      );
    }

    // Auto-generate password
    const autoPassword = body.password || generateSecurePassword(roleCode);

    // Portal route mapping
    let portalRoute = '/super-admin/dashboard';
    if (roleCode.includes('ACADEMIC')) portalRoute = '/academic-manager/dashboard';
    else if (roleCode.includes('FINANCE')) portalRoute = '/finance-manager/dashboard';
    else if (roleCode.includes('SALES')) portalRoute = '/sales-manager/dashboard';
    else if (roleCode.includes('TUTOR') || roleCode.includes('FACULTY') || roleCode.includes('TEACHER')) portalRoute = '/tutor/dashboard';
    else if (roleCode.includes('COLLEGE')) portalRoute = '/college-admin/dashboard';
    else if (roleCode.includes('SCHOOL')) portalRoute = '/school-admin/dashboard';

    const userId = body.id || `USR${Date.now().toString().slice(-6)}`;

    const newUserRecord = {
      id: userId,
      name: fullName,
      firstName,
      lastName,
      email,
      mobile,
      roleId,
      roleName,
      roleCode,
      portalRoute,
      collegeId,
      collegeName,
      plainPassword: autoPassword,
      status: 'ACTIVE',
      emailVerified: true,
      credentialsDelivered: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: 'Never',
    };

    // Save to local staff database
    const existingIdx = currentUsers.findIndex((u) => u.email?.toLowerCase() === email);
    if (existingIdx !== -1) {
      currentUsers[existingIdx] = { ...currentUsers[existingIdx], ...newUserRecord };
    } else {
      currentUsers.unshift(newUserRecord);
    }
    saveStaffUsersDb(currentUsers);

    // Sync to backend NestJS API if available
    fetch('https://ismllms-production.up.railway.app/api/portals/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newUserRecord,
        password: autoPassword,
      }),
    }).catch(() => null);

    // Dispatch Official Credentials Email via Resend API
    let emailSent = false;
    let emailError = '';

    // Robust Resend API Key resolution (fallback to backend/.env if not in process.env)
    let resendApiKey = process.env.RESEND_API_KEY || '';
    if (!resendApiKey) {
      const envCandidates = [
        path.join(process.cwd(), 'backend', '.env'),
        path.join(process.cwd(), '..', 'backend', '.env'),
        path.join(process.cwd(), 'web', '.env.local'),
        path.join(process.cwd(), '.env.local'),
      ];
      for (const ep of envCandidates) {
        if (fs.existsSync(ep)) {
          try {
            const lines = fs.readFileSync(ep, 'utf8').split('\n');
            for (const l of lines) {
              if (l.trim().startsWith('RESEND_API_KEY')) {
                resendApiKey = l.split('=')[1].replace(/["'\r\n]/g, '').trim();
                break;
              }
            }
          } catch {}
        }
        if (resendApiKey) break;
      }
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'ISML LMS <onboarding@joyautomations.in>';
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

    try {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Official Portal Access Credentials - ISML LMS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Top Navy Header -->
    <div style="background: linear-gradient(135deg, #071730 0%, #0B2447 100%); padding: 32px 36px; text-align: left;">
      <p style="margin: 0 0 6px 0; color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Indian School for Modern Languages</p>
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Staff Portal Account Provisioned</h1>
      <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">Official Institutional Credentials & SSO Access Pass</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 36px;">
      <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
        Dear <strong>${fullName}</strong>,
      </p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Your official staff management account has been created by the Super Administrator on the <strong>ISML Higher Education & Language Systems Platform</strong>. You have been assigned the <strong>${roleName}</strong> authorization scope.
      </p>

      <!-- Credentials Box -->
      <div style="background-color: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 22px; margin-bottom: 28px;">
        <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px;">
          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #0052cc;">Authorized Access Details</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">Portal Login URL:</td>
            <td style="padding: 6px 0; color: #0052cc; font-weight: 600;">
              <a href="${loginUrl}" style="color: #0052cc; text-decoration: none;">${loginUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Login Email:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Auto Password:</td>
            <td style="padding: 6px 0;">
              <span style="font-family: monospace; font-size: 14px; font-weight: 800; background-color: #eff6ff; color: #0052cc; padding: 3px 8px; border-radius: 6px; border: 1px solid #bfdbfe;">
                ${autoPassword}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Role:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${roleName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Campus / College:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${collegeName}</td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #0052cc 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 82, 204, 0.2);">
          Sign In to ${roleName} Portal →
        </a>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
          <strong>Security Notice:</strong> This auto-generated password is for your primary sign-in. You can change your password anytime under Profile Settings. Do not disclose these credentials to unauthorized personnel.
        </p>
      </div>

      <p style="margin: 0; font-size: 13px; color: #64748b;">
        Need technical assistance? Reach out to the Super Admin office at <a href="mailto:admin@isml.edu" style="color: #0052cc;">admin@isml.edu</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 36px; text-align: center;">
      <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #0f172a;">ISML Central Governance Desk</p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">© 2026 Indian School for Modern Languages. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
      `.trim();

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: `Your ${roleName} Login Credentials: ISML Education Portal`,
          html: emailHtml,
          text: `Dear ${fullName},\n\nYour ${roleName} account has been provisioned.\n\nPortal: ${loginUrl}\nLogin Email: ${email}\nPassword: ${autoPassword}\nRole: ${roleName}\n\nISML Governance Board`,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok) {
        emailSent = true;
      } else {
        emailError = resendData.message || 'Resend error';
        console.warn('Resend email notice:', resendData);
      }
    } catch (err: any) {
      emailError = err.message;
      console.warn('Failed to send credentials email:', err);
    }

    return NextResponse.json({
      status: 'success',
      message: emailSent
        ? `User account provisioned and credentials sent to ${email}`
        : `User account created successfully (Email status: ${emailError || 'queued'})`,
      data: {
        ...newUserRecord,
        autoPassword,
        emailSent,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

