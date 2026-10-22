import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { HealthStatus } from '../types';
import {
  Wrench,
  LayoutDashboard,
  PlusCircle,
  History,
  Tv,
  Bell,
  Receipt,
  FileCode,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => {});
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  HomeFix <span className="text-emerald-600">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Smart Safe Repairs</span>
              </div>
            </Link>

            {/* Desktop Navigation Links (when authenticated) */}
            {user && (
              <div className="hidden md:flex ml-8 space-x-1">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/repairs/new"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/repairs/new') ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  New Repair
                </Link>
                <Link
                  to="/repairs"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/repairs') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </Link>
                <Link
                  to="/appliances"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/appliances') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  Appliances
                </Link>
                <Link
                  to="/reminders"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/reminders') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Reminders
                </Link>
                <Link
                  to="/expenses"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive('/expenses') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  Expenses
                </Link>
              </div>
            )}
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-3">
            {/* AI Status Badge */}
            <div
              title={health?.aiMessage || 'Checking Gemini integration status...'}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                health?.aiReady
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${health?.aiReady ? 'text-emerald-600 animate-pulse' : 'text-amber-500'}`} />
              <span>{health?.aiReady ? 'Gemini Live' : 'AI Offline (No Key)'}</span>
            </div>

            {/* Swagger UI link */}
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              API Docs
            </a>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-semibold text-slate-800 block">{user.fullName}</span>
                  <span className="text-[10px] text-slate-400 block">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="inline-flex items-center gap-1 p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-emerald-600 text-white px-3.5 py-2 rounded-lg hover:bg-emerald-700 shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            {user && (
              <div className="flex md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 px-4 pt-2 pb-4 space-y-1 bg-white">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            to="/repairs/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50"
          >
            <PlusCircle className="w-4 h-4" /> New Repair
          </Link>
          <Link
            to="/repairs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <History className="w-4 h-4" /> History
          </Link>
          <Link
            to="/appliances"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Tv className="w-4 h-4" /> Appliances
          </Link>
          <Link
            to="/reminders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Bell className="w-4 h-4" /> Reminders
          </Link>
          <Link
            to="/expenses"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Receipt className="w-4 h-4" /> Expenses
          </Link>
        </div>
      )}
    </nav>
  );
};
