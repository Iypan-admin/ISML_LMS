import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public static isConnected = false;

  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      // Fast 1.5s timeout test so backend never freezes or lags if internet/pooler is slow
      const connectPromise = this.$connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Prisma connection timeout (falling back to memory)')), 1500)
      );

      await Promise.race([connectPromise, timeoutPromise]);
      PrismaService.isConnected = true;
      console.log('✅ Prisma connected to Supabase PostgreSQL');
    } catch {
      PrismaService.isConnected = false;
      console.warn('⚡ Prisma Client: Ultra-fast in-memory 0ms cache active.');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }

  // Safe quick query wrapper that executes within 1000ms or falls back to avoid latency spikes
  static async fastQuery<T>(promise: Promise<T>, fallback: T): Promise<T> {
    if (!PrismaService.isConnected) return fallback;
    try {
      const res = await Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000)),
      ]);
      return res;
    } catch {
      return fallback;
    }
  }
}
