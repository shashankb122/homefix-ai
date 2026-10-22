import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Expense, RepairReport } from '../types';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  DollarSign,
  Wrench,
  X,
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reports, setReports] = useState<RepairReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [repairReportId, setRepairReportId] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, repData] = await Promise.all([
        api.getExpenses(),
        api.getReports(),
      ]);
      setExpenses(expData);
      setReports(repData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairReportId) {
      alert('Please select a repair report to link this expense to.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('repairReportId', repairReportId.toString());
      formData.append('description', description.trim());
      formData.append('amount', amount);
      formData.append('currency', 'USD');
      formData.append('expenseDate', expenseDate);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await api.createExpense(formData);
      setShowModal(false);
      setDescription('');
      setAmount('');
      setReceiptFile(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await api.deleteExpense(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete expense');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Repair Expenses</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track replacement parts, plumbing supplies, and contractor service bills.
          </p>
        </div>

        {reports.length > 0 && (
          <button
            onClick={() => {
              setRepairReportId(reports[0]?.id);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs sm:text-sm hover:bg-purple-700 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        )}
      </div>

      {/* Spend Summary Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-purple-200 font-semibold block">Total Home Repair Spend</span>
          <div className="text-3xl sm:text-4xl font-black mt-1 tracking-tight">
            ${totalSpent.toFixed(2)}
          </div>
        </div>
        <div className="text-xs text-purple-200">
          <span>Logged across <strong>{expenses.length}</strong> purchase receipts</span>
        </div>
      </div>

      {/* Expense Table / Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm">Loading expenses...</p>
        </div>
      ) : expenses.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Linked Repair Report</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Receipt</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-500">
                      {new Date(exp.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <Link to={`/repairs/${exp.repairReportId}`} className="hover:text-purple-600 hover:underline">
                        {exp.repairReportTitle}
                      </Link>
                    </td>
                    <td className="py-3.5 px-5 font-medium">{exp.description}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                      ${Number(exp.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5">
                      {exp.receiptUrl ? (
                        <a
                          href={exp.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 hover:underline font-semibold"
                        >
                          <Receipt className="w-3.5 h-3.5" /> View Photo
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
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
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Receipt className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-700">No repair expenses recorded yet</h3>
          <p className="text-xs text-slate-400">Keep receipts and cost logs for contractor visits or hardware store supplies.</p>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Record Repair Expense</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Linked Repair Report *</label>
                <select
                  required
                  value={repairReportId || ''}
                  onChange={(e) => setRepairReportId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Replacement heating element"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="45.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
