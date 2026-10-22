import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { DashboardStats, HealthStatus } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  Tv,
  Bell,
  Receipt,
  PlusCircle,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboardStats(), api.getHealth()])
      .then(([statsData, healthData]) => {
        setStats(statsData);
        setHealth(healthData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm">Loading your home repair workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Live AI Configuration Advisory (if offline) */}
      {health && !health.aiReady && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">Gemini Live AI is Unconfigured</h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Backend is currently operating with general safety guidelines. Set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">GEMINI_API_KEY</code> in your environment to enable real-time Gemini vision & diagnostic analysis.
              </p>
            </div>
          </div>
          <a
            href="https://aistudio.google.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 shrink-0"
          >
            Get Gemini Key
          </a>
        </div>
      )}

      {/* Top Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Home Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Track repairs, monitor appliance life cycles, and prevent home hazards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/repairs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Reports</span>
            <Wrench className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalReports || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.inProgressReports || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.completedReports || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Appliances</span>
            <Tv className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalAppliances || 0}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Overdue Alerts</span>
            <Bell className={`w-4 h-4 ${(stats?.overdueReminders || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-black ${(stats?.overdueReminders || 0) > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {stats?.overdueReminders || 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Expenses</span>
            <Receipt className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${Number(stats?.totalExpenses || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Quick Shortcuts Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/repairs/new"
          className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Submit New Repair</h3>
              <p className="text-xs text-slate-500">Upload photo for Gemini AI assessment</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/appliances"
          className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Manage Appliances</h3>
              <p className="text-xs text-slate-500">Track warranties & service history</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/reminders"
          className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 rounded-2xl hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Maintenance Schedule</h3>
              <p className="text-xs text-slate-500">Filter checks, HVAC, & smoke alarms</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Repair Reports Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Repair Reports</h2>
            <p className="text-xs text-slate-500">Latest household issues and their AI safety diagnoses</p>
          </div>
          <Link
            to="/repairs"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            View All ({stats?.totalReports || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentReports && stats.recentReports.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recentReports.map((report) => (
              <div key={report.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-2xl transition-all">
                <div className="flex items-start gap-4">
                  {report.hasImage && report.imageUrl ? (
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Wrench className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Link
                      to={`/repairs/${report.id}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors"
                    >
                      {report.title}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                      {report.issueDescription}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <StatusBadge status={report.status} />
                      {report.aiAnalysis && <RiskBadge level={report.aiAnalysis.riskLevel} />}
                      {report.roomOrLocation && (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          📍 {report.roomOrLocation}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center">
                  {report.totalExpenses > 0 && (
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      ${Number(report.totalExpenses).toFixed(2)}
                    </span>
                  )}
                  <Link
                    to={`/repairs/${report.id}`}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white hover:border-slate-300 transition-all inline-flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <Wrench className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm">No repair reports saved yet.</p>
            <Link
              to="/repairs/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Create First Repair Report
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
