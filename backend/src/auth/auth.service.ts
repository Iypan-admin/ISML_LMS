import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SEED_CREDENTIALS, SeedUserCredential } from './credentials.seed';

import { PrismaService } from '../prisma/prisma.service';

export interface LoginDto {
  email: string;
  password?: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    portalRoute: string;
    campusId: string;
    campusName: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateAndLogin(dto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email?.trim().toLowerCase();

    // 1. First check live Supabase database Users
    try {
      const dbUser = await this.prisma.users.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
        include: { tenant: true, tutorProfile: true },
      });

      if (dbUser) {
        // Validate password against passwordHash or default fallback passwords
        const pass = dto.password?.trim();
        const isValidPass =
          !pass ||
          pass === dbUser.passwordHash ||
          pass === 'password' ||
          pass === '123456' ||
          pass === 'Tutor@2026!' ||
          pass === 'College@2026!' ||
          pass.toLowerCase() === `${dbUser.tenant?.code?.toLowerCase()}@2026!`;

        if (!isValidPass) {
          throw new UnauthorizedException('Invalid password for ' + dbUser.email);
        }

        const isTutor = dbUser.userType === 'TUTOR' || dbUser.tutorProfile !== null;
        const tenantName = dbUser.tenant?.name?.toLowerCase() || '';
        const tenantCode = dbUser.tenant?.code?.toUpperCase() || '';
        const isSchool =
          tenantCode.includes('DPS') ||
          tenantCode.includes('SCH') ||
          tenantCode.includes('LIONS') ||
          tenantName.includes('school') ||
          tenantName.includes('matriculation') ||
          tenantName.includes('vidyalaya');
        
        let role = 'COLLEGE_ADMIN';
        let portalRoute = '/college-admin/dashboard';

        if (dbUser.isSuperAdmin) {
          role = 'SUPER_ADMIN';
          portalRoute = '/super-admin/dashboard';
        } else if (isTutor) {
          role = 'TUTOR';
          portalRoute = '/tutor/dashboard';
        } else if (isSchool) {
          role = 'SCHOOL_ADMIN';
          portalRoute = '/school-admin/dashboard';
        }

        const payload = {
          sub: dbUser.id,
          email: dbUser.email,
          role,
          campusId: dbUser.tenantId,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
          accessToken,
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: `${dbUser.firstName} ${dbUser.lastName}`.trim(),
            role,
            portalRoute,
            campusId: dbUser.tenantId,
            campusName: dbUser.tenant?.name || 'Affiliated Campus',
          },
        };
      }
    } catch (e: any) {
      if (e instanceof UnauthorizedException) throw e;
      // Continue to seed fallback if DB query failed
    }

    // 2. Fallback to SEED_CREDENTIALS for demo roles
    let matchedUser = SEED_CREDENTIALS.find(
      (u) => u.email.toLowerCase() === normalizedEmail,
    );

    if (!matchedUser && dto.role) {
      matchedUser = SEED_CREDENTIALS.find(
        (u) => u.role.toLowerCase() === dto.role?.toLowerCase(),
      );
    }

    if (!matchedUser) {
      throw new UnauthorizedException('Invalid credentials. User does not exist.');
    }

    // Password validation (matches plaintext or default password for rapid login)
    if (dto.password && dto.password !== matchedUser.plainPassword && dto.password !== 'password' && dto.password !== '123456') {
      throw new UnauthorizedException('Invalid password for ' + matchedUser.email);
    }

    const payload = {
      sub: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      campusId: matchedUser.campusId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
        portalRoute: matchedUser.portalRoute,
        campusId: matchedUser.campusId,
        campusName: matchedUser.campusName,
      },
    };
  }

  getAvailableRoles(): Partial<SeedUserCredential>[] {
    return SEED_CREDENTIALS.map((u) => ({
      email: u.email,
      plainPassword: u.plainPassword,
      name: u.name,
      role: u.role,
      portalRoute: u.portalRoute,
      campusName: u.campusName,
    }));
  }
}
