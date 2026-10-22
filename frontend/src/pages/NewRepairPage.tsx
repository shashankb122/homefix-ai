import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Appliance, HealthStatus } from '../types';
import {
  UploadCloud,
  X,
  Sparkles,
  AlertCircle,
  ShieldAlert,
  Wrench,
  Check,
  Flame,
} from 'lucide-react';

export const NewRepairPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [roomOrLocation, setRoomOrLocation] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [applianceId, setApplianceId] = useState<number | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    api.getAppliances().then(setAppliances).catch(() => {});
    api.getHealth().then(setHealth).catch(() => {});
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!validTypes.includes(file.type)) {
        setError('Please upload a supported image format (JPEG, PNG, or WebP).');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB.');
        return;
      }

      setError(null);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (issueDescription.trim().length < 10) {
      setError('Please provide at least 10 characters describing the issue in detail.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('issueDescription', issueDescription.trim());
      if (roomOrLocation) formData.append('roomOrLocation', roomOrLocation.trim());
      if (urgency) formData.append('urgency', urgency);
      if (applianceId) formData.append('applianceId', applianceId.toString());
      if (imageFile) formData.append('image', imageFile);

      const created = await api.createReport(formData);
      navigate(`/repairs/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit repair report.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">New Repair Report</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Describe the problem and upload a photo for AI hazard assessment and safe immediate steps.
        </p>
      </div>

      {/* AI Readiness Notice */}
      {health && !health.aiReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong>AI Live Status:</strong> Gemini key is unconfigured. A standard safety advisory will be generated automatically.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Issue Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Leaking pipe under kitchen sink"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Issue Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Describe what you see, hear, or smell. When did it start? Is it getting worse?"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-1">Minimum 10 characters. Include any unusual noises or odors.</p>
        </div>

        {/* 2-Column: Room/Location & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Room or Location
            </label>
            <input
              type="text"
              value={roomOrLocation}
              onChange={(e) => setRoomOrLocation(e.target.value)}
              placeholder="e.g., Kitchen, Master Bathroom, Attic"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Urgency Level
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white"
            >
              <option value="LOW">Low (Cosmetic / Non-critical)</option>
              <option value="NORMAL">Normal (Needs attention soon)</option>
              <option value="HIGH">High (Active leak / Power issue)</option>
              <option value="EMERGENCY">Emergency (Smell gas / Sparks / Flooding)</option>
            </select>
          </div>
        </div>

        {/* Appliance Association (Optional) */}
        {appliances.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Linked Appliance (Optional)
            </label>
            <select
              value={applianceId || ''}
              onChange={(e) => setApplianceId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white"
            >
              <option value="">None / General Home Structure</option>
              {appliances.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.brand ? `(${a.brand})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Photo Upload with Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Photo of Problem (Optional but Recommended for Gemini Vision)
          </label>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-sm">
              <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Click to upload or drag & drop</span>
              <span className="text-[11px] text-slate-400 mt-1">JPEG, PNG, or WebP up to 10MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Safety Disclaimer */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            <strong>Safety First:</strong> If you smell gas, observe electrical arcing, or experience major structural movement, evacuate immediately and call emergency services. AI provides preliminary remote assessment only.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              <span>Analyzing with Gemini AI & saving report...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Submit & Generate AI Safety Assessment</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
