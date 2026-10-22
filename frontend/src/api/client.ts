import {
  AuthResponse,
  DashboardStats,
  HealthStatus,
  RepairReport,
  RepairStatus,
  Expense,
  Appliance,
  MaintenanceReminder,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(isMultipart = false): HeadersInit {
  const token = localStorage.getItem('homefix_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.message) {
        errorMsg = errJson.message;
      } else if (errJson.error) {
        errorMsg = errJson.error;
      }
      if (errJson.validationErrors) {
        const details = Object.entries(errJson.validationErrors)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        errorMsg += ` (${details})`;
      }
    } catch {
      // Use fallback errorMsg
    }
    throw new Error(errorMsg);
  }
  if (response.status === 204) {
    return {} as T;
  }
  return response.json();
}

export const api = {
  // Health
  getHealth: async (): Promise<HealthStatus> => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<HealthStatus>(res);
  },

  // Auth
  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    return handleResponse<AuthResponse>(res);
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AuthResponse>(res);
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  // Reports
  getReports: async (): Promise<RepairReport[]> => {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<RepairReport[]>(res);
  },

  getReportById: async (id: number): Promise<RepairReport> => {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<RepairReport>(res);
  },

  createReport: async (formData: FormData): Promise<RepairReport> => {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse<RepairReport>(res);
  },

  updateReportStatus: async (id: number, status: RepairStatus): Promise<RepairReport> => {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<RepairReport>(res);
  },

  reanalyzeReport: async (id: number): Promise<RepairReport> => {
    const res = await fetch(`${API_BASE}/reports/${id}/reanalyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<RepairReport>(res);
  },

  deleteReport: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    const res = await fetch(`${API_BASE}/expenses`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Expense[]>(res);
  },

  getExpensesForReport: async (reportId: number): Promise<Expense[]> => {
    const res = await fetch(`${API_BASE}/expenses/report/${reportId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Expense[]>(res);
  },

  createExpense: async (formData: FormData): Promise<Expense> => {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse<Expense>(res);
  },

  deleteExpense: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Appliances
  getAppliances: async (): Promise<Appliance[]> => {
    const res = await fetch(`${API_BASE}/appliances`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Appliance[]>(res);
  },

  getApplianceById: async (id: number): Promise<Appliance> => {
    const res = await fetch(`${API_BASE}/appliances/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Appliance>(res);
  },

  createAppliance: async (appliance: Partial<Appliance>): Promise<Appliance> => {
    const res = await fetch(`${API_BASE}/appliances`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appliance),
    });
    return handleResponse<Appliance>(res);
  },

  updateAppliance: async (id: number, appliance: Partial<Appliance>): Promise<Appliance> => {
    const res = await fetch(`${API_BASE}/appliances/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(appliance),
    });
    return handleResponse<Appliance>(res);
  },

  deleteAppliance: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/appliances/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Maintenance Reminders
  getReminders: async (): Promise<MaintenanceReminder[]> => {
    const res = await fetch(`${API_BASE}/reminders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<MaintenanceReminder[]>(res);
  },

  createReminder: async (reminder: Partial<MaintenanceReminder>): Promise<MaintenanceReminder> => {
    const res = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminder),
    });
    return handleResponse<MaintenanceReminder>(res);
  },

  toggleReminder: async (id: number): Promise<MaintenanceReminder> => {
    const res = await fetch(`${API_BASE}/reminders/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse<MaintenanceReminder>(res);
  },

  deleteReminder: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },
};
