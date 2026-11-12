// ============================================================================
// ISML LMS — SALES & ADMISSION CRM MOCK DATA STORE
// Pre-seeded with College and School Admissions, CRM Leads, Counselors & Public Form Submissions
// ============================================================================

import { AdmissionApplication, SalesDashboardMetrics } from '@/types/sales';

[];

[];

// In-Memory Reactive Store for Sales Portal and Admissions
class SalesStore {
  private applications: AdmissionApplication[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('isml_sales_applications');
        this.applications = [];
      } catch {
        this.applications = [];
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('isml_sales_applications', JSON.stringify(this.applications));
      } catch {
        // Ignore
      }
    }
    this.notify();
  }

  public getApplications(): AdmissionApplication[] {
    return [...this.applications];
  }

  public getApplicationById(id: string): AdmissionApplication | undefined {
    return this.applications.find((app) => app.id === id || app.applicationNumber === id);
  }

  public addApplication(app: Omit<AdmissionApplication, 'id' | 'applicationNumber' | 'submittedAt' | 'updatedAt'>): AdmissionApplication {
    const isSchool = app.category === 'SCHOOL';
    const count = this.applications.filter((a) => a.category === app.category).length + 1;
    const pad = String(count).padStart(3, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const newApp: AdmissionApplication = {
      ...app,
      id: isSchool ? `ADM-SCH-2026-${pad}` : `ADM-COL-2026-${pad}`,
      applicationNumber: isSchool ? `ISML-SCH-2026-${randomSuffix}` : `ISML-COL-2026-${randomSuffix}`,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.applications.unshift(newApp);
    this.persist();
    return newApp;
  }

  public updateStage(id: string, stage: AdmissionApplication['stage'], note?: string): boolean {
    const app = this.applications.find((a) => a.id === id);
    if (!app) return false;
    app.stage = stage;
    app.updatedAt = new Date().toISOString();
    if (note) {
      app.notes.unshift(`[${new Date().toLocaleDateString('en-IN')}] ${note}`);
    }
    this.persist();
    return true;
  }

  public recordPayment(id: string, amount: number, refId: string): boolean {
    const app = this.applications.find((a) => a.id === id);
    if (!app) return false;
    app.amountPaid += amount;
    if (app.amountPaid >= app.finalPayable) {
      app.paymentStatus = 'PAID';
      if (app.stage === 'SEAT_OFFERED' || app.stage === 'DOCS_PENDING' || app.stage === 'NEW_INQUIRY') {
        app.stage = 'ENROLLED';
      }
    } else if (app.amountPaid > 0) {
      app.paymentStatus = 'PARTIAL';
    }
    app.paymentRefId = refId;
    app.updatedAt = new Date().toISOString();
    app.notes.unshift(`[${new Date().toLocaleDateString('en-IN')}] Payment of ₹${amount.toLocaleString()} received (Ref: ${refId}).`);
    this.persist();
    return true;
  }

  public getMetrics(): SalesDashboardMetrics {
    const apps = this.applications;
    const totalInquiries = apps.length;
    const collegeAdmissions = apps.filter((a) => a.category === 'COLLEGE').length;
    const schoolAdmissions = apps.filter((a) => a.category === 'SCHOOL').length;
    const enrolledStudentsCount = apps.filter((a) => a.stage === 'ENROLLED').length;
    const conversionRate = totalInquiries > 0 ? Math.round((enrolledStudentsCount / totalInquiries) * 100) : 0;
    const revenueCollected = apps.reduce((sum, a) => sum + (a.amountPaid || 0), 0);
    const revenuePipeline = apps.reduce((sum, a) => sum + (a.finalPayable - (a.amountPaid || 0)), 0);
    const counselingPending = apps.filter((a) => a.stage === 'NEW_INQUIRY' || a.stage === 'COUNSELING_SCHEDULED').length;
    const formsUnderVerification = apps.filter((a) => a.stage === 'FORM_SUBMITTED' || a.stage === 'DOCS_PENDING' || a.stage === 'UNDER_VERIFICATION').length;

    return {
      totalInquiries,
      collegeAdmissions,
      schoolAdmissions,
      conversionRate,
      revenueCollected,
      revenuePipeline,
      counselingPending,
      formsUnderVerification,
      enrolledStudentsCount,
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const salesStore = new SalesStore();
