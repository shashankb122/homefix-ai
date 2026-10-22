import React from 'react';
import { AiAnalysisResult } from '../types';
import { RiskBadge } from './RiskBadge';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Info,
  UserCheck,
  Cpu,
  Flame,
} from 'lucide-react';

interface AiAnalysisCardProps {
  analysis?: AiAnalysisResult;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  analysis,
  onReanalyze,
  isReanalyzing,
}) => {
  if (!analysis) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
        <Cpu className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="font-medium">No AI diagnostic report generated yet.</p>
        <p className="text-sm text-slate-400 mt-1">Submit your problem description to receive safe repair advice.</p>
      </div>
    );
  }

  const isUrgent = analysis.riskLevel === 'URGENT_HAZARD';

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${
      isUrgent ? 'border-rose-300 bg-rose-50/30 ring-2 ring-rose-200' : 'border-slate-200 bg-white'
    }`}>
      {/* AI Live Config Banner */}
      {!analysis.liveAiConfigured && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              <strong>Live AI Offline:</strong> GEMINI_API_KEY is not configured in backend environment. Showing safe general advisory guidelines.
            </span>
          </div>
          <span className="bg-amber-700/60 text-amber-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
            Setup Required
          </span>
        </div>
      )}

      {/* Urgent Warning Header */}
      {isUrgent && (
        <div className="bg-rose-600 text-white px-6 py-4 flex items-start gap-3">
          <Flame className="w-6 h-6 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="font-bold text-base tracking-wide uppercase">Urgent Hazard Detected</h4>
            <p className="text-sm text-rose-100 mt-0.5">
              Keep away from the affected area immediately! Do NOT attempt DIY repairs on live electrical, gas leaks, or collapsing structures. Call emergency services or a licensed professional right away.
            </p>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">AI Diagnostic Safety Assessment</h3>
            <RiskBadge level={analysis.riskLevel} />
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Category: {analysis.problemCategory}</span>
            <span>•</span>
            <span>Assessed on {new Date(analysis.analyzedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {onReanalyze && (
          <button
            onClick={onReanalyze}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Cpu className="w-4 h-4 text-emerald-600" />
            {isReanalyzing ? 'Re-analyzing with Gemini...' : 'Re-Run AI Analysis'}
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Simple Summary */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Summary of Likely Issue
          </h4>
          <p className="text-slate-800 text-sm leading-relaxed font-medium">
            {analysis.simpleSummary}
          </p>
        </div>

        {/* Possible Causes */}
        {analysis.possibleCauses && analysis.possibleCauses.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Possible Causes
            </h4>
            <ul className="space-y-1.5 text-sm text-slate-700 pl-2">
              {analysis.possibleCauses.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 2-Column: Safe Steps vs Things Not to Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Safe Immediate Steps */}
          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100">
            <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Safe Immediate Steps (Do This)
            </h4>
            <ul className="space-y-2 text-xs text-emerald-950">
              {analysis.safeImmediateSteps && analysis.safeImmediateSteps.length > 0 ? (
                analysis.safeImmediateSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-emerald-200/50">
                    <span className="text-emerald-600 font-bold shrink-0">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No immediate steps required.</li>
              )}
            </ul>
          </div>

          {/* Things Not To Do */}
          <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-100">
            <h4 className="text-sm font-bold text-rose-900 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              Things NOT To Do (Avoid Hazard)
            </h4>
            <ul className="space-y-2 text-xs text-rose-950">
              {analysis.thingsNotToDo && analysis.thingsNotToDo.length > 0 ? (
                analysis.thingsNotToDo.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-rose-200/50">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">No specific warnings recorded.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Professional Recommendation Box */}
        {analysis.professionalRecommended && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold text-amber-900">Qualified Professional Recommended</h5>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Due to the potential electrical, structural, water pressure, or equipment warranty factors, it is strongly advised to consult a licensed tradesperson or certified technician for this repair.
              </p>
            </div>
          </div>
        )}

        {/* Clarifying / Follow-up Questions */}
        {analysis.followUpQuestions && analysis.followUpQuestions.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              Follow-Up Diagnostic Questions
            </h4>
            <div className="space-y-1 text-xs text-slate-600">
              {analysis.followUpQuestions.map((q, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-slate-400">?</span>
                  <span>{q}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* AI Disclaimer / Confidence Note */}
        <div className="border-t border-slate-100 pt-3 flex items-start gap-2 text-[11px] text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
          <p>
            <strong>Safety Notice:</strong> {analysis.confidenceNote || 'Image-based findings are possible explanations, not confirmed diagnoses. HomeFix AI does not replace an in-person professional inspection.'}
          </p>
        </div>
      </div>
    </div>
  );
};
