import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Camera,
  Cpu,
  Tv,
  Receipt,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  HeartHandshake,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 rounded-3xl p-8 sm:p-14 border border-emerald-100 max-w-6xl mx-auto shadow-sm">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Powered by Google Gemini Multimodal Vision & Spring AI
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Diagnose household repairs <span className="text-emerald-600">safely & smartly</span> with AI.
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload a photo, describe your problem, and let HomeFix AI instantly analyze potential causes, assess hazard risks, and guide you with safe first steps — while knowing exactly when to call a qualified pro.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Safety Notice Callout */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-amber-950 text-base">Safety-First Home Diagnostics</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              HomeFix AI treats findings as potential causes, not definitive diagnoses. Dangerous DIY tasks on live electrical wiring, gas appliances, or structural load-bearing elements are strictly flagged with emergency stop notices and qualified contractor recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Everything you need to maintain your home</h2>
          <p className="text-slate-500 text-sm">Built for homeowners, renters, and property caretakers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Multimodal Photo Analysis</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Snap a picture of that leaking pipe, buzzing breaker, or cracked fixture. Gemini AI processes the image to uncover visible failure points.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Appliance & Warranty Vault</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never hunt for lost user manuals or warranty papers again. Store model numbers, purchase dates, and active warranty statuses in one place.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Expense & Receipt Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Log replacement parts, contractor invoices, and repair receipts linked directly to each incident report for accurate tax and home records.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">How HomeFix AI Protects You</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto">1</div>
              <h4 className="font-bold text-sm text-slate-900">Submit Details</h4>
              <p className="text-xs text-slate-500">Provide a clear description and optional photo of the problem.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto">2</div>
              <h4 className="font-bold text-sm text-slate-900">Risk Evaluation</h4>
              <p className="text-xs text-slate-500">AI rates the risk from Low (Safe DIY) up to Urgent Hazard.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto">3</div>
              <h4 className="font-bold text-sm text-slate-900">Immediate Action</h4>
              <p className="text-xs text-slate-500">Follow structured immediate steps and critical things NOT to do.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto">4</div>
              <h4 className="font-bold text-sm text-slate-900">Track & Resolve</h4>
              <p className="text-xs text-slate-500">Log repair costs, update repair status, and set future maintenance reminders.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
