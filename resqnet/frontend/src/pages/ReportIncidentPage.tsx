import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useOffline } from '../context/OfflineContext';
import { IncidentCategory, UrgencyLevel } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  FilePlus2,
  MapPin,
  AlertTriangle,
  Upload,
  CheckCircle2,
  WifiOff,
  Flame,
  Search,
  Sparkles,
} from 'lucide-react';

const ASSISTANCE_OPTIONS = [
  { id: 'drinking_water', label: 'Drinking Water' },
  { id: 'food_packets', label: 'Food Rations / Packets' },
  { id: 'first_aid_kits', label: 'First-Aid Kits' },
  { id: 'medicines', label: 'Prescription Medicines / Insulin' },
  { id: 'search_and_rescue', label: 'Search & Rescue Boats / Teams' },
  { id: 'transport_vehicles', label: 'Evacuation Transport / 4x4' },
  { id: 'temporary_shelter', label: 'Temporary Shelter / Tents' },
];

export const ReportIncidentPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline, enqueueDraft } = useOffline();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('FLOOD');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [zoneName, setZoneName] = useState('Metro-River-Basin');
  const [latitude, setLatitude] = useState(37.7780);
  const [longitude, setLongitude] = useState(-122.4170);
  const [peopleAffected, setPeopleAffected] = useState(5);
  const [requestedAssistance, setRequestedAssistance] = useState<string[]>(['drinking_water', 'food_packets']);
  const [immediateThreat, setImmediateThreat] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('HIGH');
  const [reporterContact, setReporterContact] = useState('+1-555-0188');

  // Image Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Duplicate Check
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // Pre-flight duplicate check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isOnline || !latitude || !longitude) return;
      try {
        const res = await api.checkDuplicate(latitude, longitude, category);
        if (res.is_potential_duplicate) {
          setDuplicateWarning(res);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        // silent fail for duplicate pre-check
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [latitude, longitude, category, isOnline]);

  const toggleAssistance = (id: string) => {
    setRequestedAssistance((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds maximum allowed limit (5MB).');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
        },
        () => {
          alert('Location access denied or unavailable. Using default simulated coordinates.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let uploadedUrl: string | undefined = undefined;
      if (selectedFile && isOnline) {
        try {
          const upRes = await api.uploadIncidentImage(selectedFile);
          uploadedUrl = upRes.image_url;
        } catch (upErr: any) {
          console.warn('Image upload failed, submitting report without image:', upErr);
        }
      }

      const payload = {
        title,
        category,
        description,
        latitude: Number(latitude),
        longitude: Number(longitude),
        location_name: locationName || 'Central Metro District',
        zone_name: zoneName,
        people_affected: Number(peopleAffected),
        requested_assistance: requestedAssistance,
        immediate_threat_to_life: immediateThreat,
        urgency_level: urgencyLevel,
        reporter_contact: reporterContact,
        image_url: uploadedUrl,
      };

      if (!isOnline) {
        // Queue in offline storage
        enqueueDraft(payload);
        alert('You are currently offline. Your emergency report has been queued locally and will synchronize automatically once connectivity is restored.');
        navigate('/');
        return;
      }

      const res = await api.createIncident(payload);
      setSuccessCode(res.incident_code);
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (successCode) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Emergency Report Submitted</h2>
        <p className="text-slate-400 text-sm">
          Your report has been logged with assigned tracking reference:
        </p>
        <div className="font-mono text-lg font-bold text-sky-400 bg-slate-900 border border-slate-800 p-3 rounded-xl inline-block">
          {successCode}
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The report is queued for responder validation. Priority score was automatically calculated based on life safety and urgency factors.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => {
              setSuccessCode(null);
              setTitle('');
              setDescription('');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Submit Another Report
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <DisclaimerBanner />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FilePlus2 className="w-5 h-5 text-sky-400" />
              Emergency Incident Intake Form
            </h1>
            {!isOnline && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-red-950 text-red-300 border border-red-800">
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                Offline Draft Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Capture field requests for assistance. Reports undergo triage calculation and human validation before dispatch.
          </p>
        </div>

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="bg-amber-950/60 border border-amber-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Potential Duplicate Incident Detected Nearby</span>
            </div>
            <p className="text-xs text-amber-200/90">
              An existing report ({duplicateWarning.candidates[0]?.incident_code}: "{duplicateWarning.candidates[0]?.title}") was reported within {duplicateWarning.candidates[0]?.distance_meters} meters.
            </p>
            <p className="text-[11px] text-amber-300/80 italic">
              You can still submit; our verification engine will link it for human review.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Submerged Basement at Elderly Care Home"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="FLOOD">Flood / Waterlogging</option>
                <option value="EARTHQUAKE">Earthquake</option>
                <option value="MEDICAL">Medical Surge</option>
                <option value="STRUCTURAL_COLLAPSE">Structural Collapse</option>
                <option value="FIRE">Fire</option>
                <option value="STORM">Storm / Wind Damage</option>
                <option value="HAZMAT">Hazmat / Chemical</option>
                <option value="OTHER">Other Request</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Description & Current Status *
            </label>
            <textarea
              rows={3}
              placeholder="Describe current water levels, trapped individuals, mobility constraints, structural hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            ></textarea>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location Landmark / Street *
              </label>
              <input
                type="text"
                placeholder="e.g. 5th & Harrison Blvd"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GPS Latitude *
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GPS Longitude *
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Use Device Location</span>
            </button>
          </div>

          {/* Impact and Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                People Affected *
              </label>
              <input
                type="number"
                min={1}
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(parseInt(e.target.value) || 1)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Urgency Rating
              </label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="CRITICAL">Critical (Immediate danger)</option>
                <option value="HIGH">High (Urgent intervention)</option>
                <option value="MEDIUM">Medium (Stable for 4-6 hrs)</option>
                <option value="LOW">Low (Non-life threatening)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reporter Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1-555-0100"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Immediate Threat to Life Highlight Box */}
          <div
            onClick={() => setImmediateThreat(!immediateThreat)}
            className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              immediateThreat
                ? 'bg-red-950/40 border-red-600 text-red-200'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Flame className={`w-5 h-5 ${immediateThreat ? 'text-red-400' : 'text-slate-400'}`} />
              <div>
                <p className="font-bold text-xs">Immediate Threat to Human Life</p>
                <p className="text-[11px] text-slate-400">
                  Check if individuals are actively drowning, trapped with rising water, or in acute medical arrest.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={immediateThreat}
              onChange={() => {}}
              className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-slate-900 border-slate-700"
            />
          </div>

          {/* Requested Assistance Multi-Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Requested Assistance Items
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ASSISTANCE_OPTIONS.map((opt) => {
                const checked = requestedAssistance.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleAssistance(opt.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                      checked
                        ? 'bg-sky-950/50 border-sky-600 text-sky-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-sky-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Image Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Field Image Attachment (Optional, Max 5MB JPEG/PNG/WebP)
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center space-x-2">
                <Upload className="w-4 h-4 text-sky-400" />
                <span>{selectedFile ? selectedFile.name : 'Choose Field Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                />
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition shadow-lg shadow-sky-600/20 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>
              {submitting
                ? 'Processing Triage...'
                : isOnline
                ? 'Submit Emergency Report'
                : 'Save as Offline Draft'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
