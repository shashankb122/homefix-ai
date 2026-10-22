import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { RepairReport, RepairStatus, RiskLevel } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import {
  Wrench,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  MapPin,
  ArrowRight,
  Receipt,
} from 'lucide-react';

export const RepairHistoryPage: React.FC = () => {
  const [reports, setReports] = useState<RepairReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  useEffect(() => {
    api.getReports()
      .then(setReports)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.issueDescription.toLowerCase().includes(search.toLowerCase()) ||
      (r.roomOrLocation && r.roomOrLocation.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || (r.aiAnalysis && r.aiAnalysis.riskLevel === riskFilter);

    return matchesSearch && matchesStatus && matchesRisk;
  });

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm">Loading your repair history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Repair History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and filter all past and ongoing home repair records.
          </p>
        </div>
        <Link
          to="/repairs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          New Report
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, room, or problem..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="URGENT_HAZARD">Urgent Hazard</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                {report.hasImage && report.imageUrl ? (
                  <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={report.status} />
                    </div>
                  </div>
                ) : (
                  <div className="h-28 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-between px-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">{report.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {report.issueDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {report.aiAnalysis && <RiskBadge level={report.aiAnalysis.riskLevel} />}
                    {report.roomOrLocation && (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {report.roomOrLocation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-3">
                  {report.totalExpenses > 0 && (
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-purple-600" />
                      ${Number(report.totalExpenses).toFixed(2)}
                    </span>
                  )}
                  <Link
                    to={`/repairs/${report.id}`}
                    className="font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Wrench className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-semibold text-slate-700">No matching repair reports found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
};
