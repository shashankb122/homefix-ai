export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT_HAZARD';

export type RepairStatus = 'SUBMITTED' | 'IN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface AiAnalysisResult {
  id: number;
  problemCategory: string;
  simpleSummary: string;
  riskLevel: RiskLevel;
  possibleCauses: string[];
  safeImmediateSteps: string[];
  thingsNotToDo: string[];
  professionalRecommended: boolean;
  followUpQuestions: string[];
  confidenceNote: string;
  liveAiConfigured: boolean;
  statusMessage?: string;
  analyzedAt: string;
}

export interface Expense {
  id: number;
  repairReportId: number;
  repairReportTitle: string;
  description: string;
  amount: number;
  currency: string;
  expenseDate: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface RepairReport {
  id: number;
  title: string;
  issueDescription: string;
  roomOrLocation?: string;
  urgency: string;
  status: RepairStatus;
  imageUrl?: string;
  hasImage: boolean;
  applianceId?: number;
  applianceName?: string;
  aiAnalysis?: AiAnalysisResult;
  expenses: Expense[];
  totalExpenses: number;
  createdAt: string;
  updatedAt: string;
}

export interface Appliance {
  id: number;
  name: string;
  brand?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiryDate?: string;
  warrantyActive: boolean;
  notes?: string;
  serviceHistory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceReminder {
  id: number;
  applianceId?: number;
  applianceName?: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  overdue: boolean;
  recurrenceDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalReports: number;
  submittedReports: number;
  inProgressReports: number;
  completedReports: number;
  totalAppliances: number;
  pendingReminders: number;
  overdueReminders: number;
  totalExpenses: number;
  recentReports: RepairReport[];
}

export interface HealthStatus {
  status: string;
  database: string;
  aiReady: boolean;
  aiModel: string;
  aiProvider: string;
  aiMessage: string;
  timestamp: string;
}
