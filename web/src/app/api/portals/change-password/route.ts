import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getCredentialsFilePath() {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'realDbCredentials.json'),
    path.join(process.cwd(), 'web', 'src', 'lib', 'realDbCredentials.json'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[1] || candidatePaths[0];
}

function loadCredentials(): any[] {
  try {
    const filePath = getCredentialsFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load credentials:', e);
  }
  return [];
}

function saveCredentials(data: any[]) {
  try {
    const filePath = getCredentialsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save credentials:', e);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const verifyPassword = searchParams.get('verifyPassword');
    const creds = loadCredentials();

    if (email) {
      const found = creds.find((c: any) => c.email.toLowerCase() === email.toLowerCase());
      if (found) {
        if (verifyPassword !== null && verifyPassword !== undefined) {
          const isValid = found.password === verifyPassword;
          return NextResponse.json({
            status: 'success',
            isValid,
            hasCustomPassword: !!found.hasCustomPassword,
            user: {
              email: found.email,
              role: found.role,
              name: found.name,
            },
          });
        }
        return NextResponse.json({
          status: 'success',
          data: { email: found.email, role: found.role, name: found.name, hasCustomPassword: !!found.hasCustomPassword },
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      total: creds.length,
      data: creds.map((c: any) => ({ email: c.email, role: c.role, name: c.name })),
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, currentPassword, newPassword, confirmPassword } = body;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { status: 'error', message: 'Email, current password, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { status: 'error', message: 'New password and confirmation password do not match.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { status: 'error', message: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const creds = loadCredentials();
    const userIndex = creds.findIndex((c: any) => c.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return NextResponse.json(
        { status: 'error', message: 'Account not found for the given email.' },
        { status: 404 }
      );
    }

    const user = creds[userIndex];

    // Check current password
    if (user.password !== currentPassword) {
      return NextResponse.json(
        { status: 'error', message: 'Old password does not match our records.' },
        { status: 401 }
      );
    }

    // Update password
    creds[userIndex] = {
      ...user,
      password: newPassword,
      hasCustomPassword: true,
      updatedAt: new Date().toISOString(),
    };

    saveCredentials(creds);

    return NextResponse.json({
      status: 'success',
      message: 'Password successfully updated! You can now log in with your new password.',
      email: user.email,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

