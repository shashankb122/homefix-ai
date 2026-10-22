import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MaintenanceReminder, Appliance } from '../types';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  RotateCcw,
  X,
} from 'lucide-react';

export const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [applianceId, setApplianceId] = useState<number | undefined>(undefined);
  const [recurrenceDays, setRecurrenceDays] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [remData, appData] = await Promise.all([
        api.getReminders(),
        api.getAppliances(),
      ]);
      setReminders(remData);
      setAppliances(appData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.toggleReminder(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update reminder');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this maintenance reminder?')) {
      try {
        await api.deleteReminder(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete reminder');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        applianceId: applianceId || undefined,
        recurrenceDays: recurrenceDays || undefined,
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setApplianceId(undefined);
      setRecurrenceDays(undefined);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create reminder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Maintenance Reminders</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Prevent costly breakdowns with recurring tasks for filters, smoke alarms, and seasonal checks.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Task
        </button>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm">Loading maintenance tasks...</p>
        </div>
      ) : reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                r.completed
                  ? 'bg-slate-50/70 border-slate-200 opacity-60'
                  : r.overdue
                  ? 'bg-rose-50/50 border-rose-200 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggle(r.id)}
                  className={`mt-0.5 shrink-0 transition-colors ${
                    r.completed ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-500'
                  }`}
                  title={r.completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {r.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-sm text-slate-900 ${r.completed ? 'line-through text-slate-500' : ''}`}>
                      {r.title}
                    </h3>
                    {r.overdue && !r.completed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                    {r.recurrenceDays && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                        <RotateCcw className="w-2.5 h-2.5" /> Every {r.recurrenceDays} days
                      </span>
                    )}
                  </div>

                  {r.description && (
                    <p className="text-xs text-slate-500 max-w-xl">{r.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(r.dueDate).toLocaleDateString()}
                    </span>
                    {r.applianceName && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        Appliance: {r.applianceName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Bell className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-700">No maintenance reminders scheduled</h3>
          <p className="text-xs text-slate-400">Set recurring reminders like changing HVAC furnace filters every 90 days.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Schedule First Reminder
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Schedule Maintenance Reminder</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Replace HVAC furnace air filter"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Size 16x25x1 MERV 11 filter in basement intake"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Auto-Repeat Frequency</label>
                <select
                  value={recurrenceDays || ''}
                  onChange={(e) => setRecurrenceDays(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">One-time task (no repeat)</option>
                  <option value="30">Monthly (30 days)</option>
                  <option value="90">Quarterly (90 days - recommended for filters)</option>
                  <option value="180">Semi-annually (6 months)</option>
                  <option value="365">Annually (Smoke alarm batteries / roof check)</option>
                </select>
              </div>

              {appliances.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Linked Appliance (Optional)</label>
                  <select
                    value={applianceId || ''}
                    onChange={(e) => setApplianceId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">General Home Routine</option>
                    {appliances.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}

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
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? 'Scheduling...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
