import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { RepairReport, RepairStatus, Expense } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AiAnalysisCard } from '../components/AiAnalysisCard';
import {
  Wrench,
  Calendar,
  MapPin,
  AlertTriangle,
  Receipt,
  Plus,
  Trash2,
  ArrowLeft,
  Upload,
  CheckCircle,
  ExternalLink,
  Cpu,
} from 'lucide-react';

export const RepairDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<RepairReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Expense form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadReport(Number(id));
    }
  }, [id]);

  const loadReport = async (reportId: number) => {
    setLoading(true);
    try {
      const data = await api.getReportById(reportId);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load repair report.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: RepairStatus) => {
    if (!report) return;
    setStatusUpdating(true);
    try {
      const updated = await api.updateReportStatus(report.id, newStatus);
      setReport(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReanalyze = async () => {
    if (!report) return;
    setIsReanalyzing(true);
    try {
      const updated = await api.reanalyzeReport(report.id);
      setReport(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to re-analyze report with Gemini');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    if (window.confirm('Are you sure you want to permanently delete this repair report?')) {
      try {
        await api.deleteReport(report.id);
        navigate('/repairs');
      } catch (err: any) {
        alert(err.message || 'Failed to delete report');
      }
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setExpenseSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('repairReportId', report.id.toString());
      formData.append('description', expenseDesc.trim());
      formData.append('amount', expenseAmount);
      formData.append('currency', 'USD');
      formData.append('expenseDate', expenseDate);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await api.createExpense(formData);
      // Reload report to refresh expenses
      await loadReport(report.id);
      setExpenseDesc('');
      setExpenseAmount('');
      setReceiptFile(null);
      setShowExpenseForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add expense');
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!report) return;
    if (window.confirm('Delete this expense entry?')) {
      try {
        await api.deleteExpense(expenseId);
        await loadReport(report.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete expense');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm">Loading repair report and AI analysis...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Repair Report Not Available</h2>
        <p className="text-sm text-slate-500">{error || 'This report does not exist or you do not have permission to view it.'}</p>
        <Link
          to="/repairs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/repairs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Reports
        </Link>

        <div className="flex items-center gap-3">
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={report.status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value as RepairStatus)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            onClick={handleDeleteReport}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Report"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Report Overview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{report.title}</h1>
              <StatusBadge status={report.status} />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Reported {new Date(report.createdAt).toLocaleDateString()}
              </span>
              {report.roomOrLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {report.roomOrLocation}
                </span>
              )}
              {report.applianceName && (
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Appliance: {report.applianceName}
                </span>
              )}
            </div>

            <div className="pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Issue Description</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {report.issueDescription}
              </p>
            </div>
          </div>

          {/* Photo Preview if attached */}
          {report.hasImage && report.imageUrl && (
            <div className="w-full md:w-64 shrink-0 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Attached Photo</h4>
              <a
                href={report.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="block relative rounded-2xl overflow-hidden border border-slate-200 group"
              >
                <img
                  src={report.imageUrl}
                  alt={report.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-all"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                  <ExternalLink className="w-4 h-4" /> View Full
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Structured AI Analysis Card */}
      <AiAnalysisCard
        analysis={report.aiAnalysis}
        onReanalyze={handleReanalyze}
        isReanalyzing={isReanalyzing}
      />

      {/* Repair Expenses Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">Repair Expenses</h3>
              <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
                Total: ${Number(report.totalExpenses).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Track parts, supplies, and contractor fees for this repair.</p>
          </div>

          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            {showExpenseForm ? 'Cancel Expense' : 'Add Expense'}
          </button>
        </div>

        {/* Add Expense Form Drawer */}
        {showExpenseForm && (
          <form onSubmit={handleAddExpense} className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-purple-950">Record New Expense</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g., Replacement PVC pipe & primer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="24.50"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={expenseSubmitting}
              className="py-2 px-4 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {expenseSubmitting ? 'Saving Expense...' : 'Save Expense'}
            </button>
          </form>
        )}

        {/* Expense List */}
        {report.expenses && report.expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Receipt</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {report.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">{new Date(exp.expenseDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{exp.description}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">${Number(exp.amount).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      {exp.receiptUrl ? (
                        <a
                          href={exp.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Receipt className="w-3.5 h-3.5" /> Receipt
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4 italic">No expenses recorded for this repair yet.</p>
        )}
      </div>
    </div>
  );
};
