// ============================================================================
// ISML ENTERPRISE API SERVICE LAYER (Connecting 8 Frontend Portals to NestJS Backend)
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ismllms-production.up.railway.app/api';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data: T;
  total?: number;
}

// 1. Live Classes API (Scheduling, Roster, Starting/Ending)
export const liveClassesApi = {
  async getAll(campusId?: string): Promise<any[]> {
    try {
      const url = campusId ? `${API_BASE_URL}/live-classes?campusId=${encodeURIComponent(campusId)}` : `${API_BASE_URL}/live-classes`;
      const res = await fetch(url, { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async schedule(payload: any): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/live-classes/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async startClass(id: string): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/live-classes/${id}/start`, { method: 'POST' });
    return res.json();
  },

  async endClass(id: string): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/live-classes/${id}/end`, { method: 'POST' });
    return res.json();
  },
};

// 2. Approvals Center API (Super Admin, Academic Manager, Finance Manager)
export const approvalsApi = {
  async getAll(status?: string): Promise<any[]> {
    try {
      const url = status ? `${API_BASE_URL}/portals/approvals?status=${status}` : `${API_BASE_URL}/portals/approvals`;
      const res = await fetch(url, { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async submit(payload: any): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/portals/approvals/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async takeAction(id: string, action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/portals/approvals/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, remarks }),
    });
    return res.json();
  },
};

// 3. Sales Manager Admissions API
export const admissionsApi = {
  async getAll(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/portals/admissions`, { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async registerStudent(payload: any): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/portals/admissions/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

// 4. College Admin Bulk Fees & LMS Access Unlock
export const collegeAdminApi = {
  async getBulkPayments(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/portals/college/bulk-payments`, { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async submitBulkPayUnlock(payload: any): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/portals/college/bulk-pay-unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

// 5. 1:1 Human Speaking Viva API (Online Slot Booking)
export const speakingVivaApi = {
  async getSessions(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/portals/tutor/speaking-viva`, { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async bookSlot(payload: any): Promise<ApiResponse> {
    const res = await fetch(`${API_BASE_URL}/portals/tutor/speaking-viva/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

// 6. Multi-Tenant Institutions & Courses (From Supabase Database)
export const masterDataApi = {
  async getInstitutions(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/portals/institutions`, { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async getCourses(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/portals/courses`, { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },
};


// 6. Auth API (Login & Verification)
export const authApi = {
  async login(email: string, password?: string, role?: string): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      return await res.json();
    } catch (e: any) {
      console.warn('[AUTH API FETCH FAILED, USING FAST PORTAL REDIRECT]:', e?.message);
      return {
        status: 'error',
        message: e?.message || 'Failed to fetch',
        data: null,
      };
    }
  },

  async getSeedCredentials(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/seed-credentials`, { cache: 'no-store' });
      const json: ApiResponse = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },
};
