import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Incident, VerificationStatus } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  CheckCircle2,
  XCircle,
  Copy,
  AlertTriangle,
  Flame,
  Clock,
  Users,
  ShieldCheck,
  Search,
  Sparkles,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('Confirmed via field reconnaissance / aerial drone.');
  const [confidenceRating, setConfidenceRating] = useState(5);
  const [duplicateOfId, setDuplicateOfId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (e) {
      console.error('Failed to load verification queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleVerify = async (newStatus: VerificationStatus) => {
    if (!selectedIncident) return;
    setSubmitting(true);
    try {
      await api.verifyIncident(selectedIncident.id, {
        new_status: newStatus,
        notes: verificationNotes,
        confidence_rating: confidenceRating,
        duplicate_of_id: duplicateOfId ? Number(duplicateOfId) : undefined,
      });
      alert(`Incident ${selectedIncident.incident_code} marked as ${newStatus}.`);
      await fetchIncidents();
      setSelectedIncident((prev) => (prev ? { ...prev, verification_status: newStatus } : null));
    } catch (e: any) {
      alert(`Verification error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const unverifiedList = incidents.filter((i) => i.verification_status === 'UNVERIFIED');
  const otherList = incidents.filter((i) => i.verification_status !== 'UNVERIFIED');

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            Triage & Incident Verification Command
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Human-in-the-loop validation queue. Inspect explainable triage scoring breakdown and review duplicate submissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Verification Queue */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Verification ({unverifiedList.length})
              </h2>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {unverifiedList.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-lg border cursor-pointer transition space-y-1.5 ${
                    selectedIncident?.id === inc.id
                      ? 'bg-sky-950/50 border-sky-500'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">{inc.incident_code}</span>
                    <PriorityBadge level={inc.priority_level} score={inc.priority_score} />
                  </div>
                  <h3 className="text-xs font-semibold text-white line-clamp-1">{inc.title}</h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{inc.location_name}</span>
                    <span className="text-amber-400 font-medium">Unverified</span>
                  </div>
                </div>
              ))}

              {unverifiedList.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">
                  No unverified reports pending review.
                </div>
              )}
            </div>

            {/* Other Reviewed Incidents */}
            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Already Reviewed ({otherList.length})
              </h3>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {otherList.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                      selectedIncident?.id === inc.id
                        ? 'bg-sky-950/40 border-sky-500 text-sky-200'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="truncate max-w-[170px]">{inc.title}</span>
                    <span className="font-mono text-[10px]">{inc.verification_status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Incident Inspection & Explainability Breakdown (2 Cols) */}
        {selectedIncident ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-slate-400">{selectedIncident.incident_code}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedIncident.category}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        selectedIncident.verification_status === 'VERIFIED'
                          ? 'bg-emerald-950 text-emerald-300'
                          : selectedIncident.verification_status === 'DUPLICATE'
                          ? 'bg-indigo-950 text-indigo-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {selectedIncident.verification_status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedIncident.title}</h2>
                  <p className="text-xs text-slate-400">Location: {selectedIncident.location_name} ({selectedIncident.zone_name})</p>
                </div>

                <div className="text-right">
                  <PriorityBadge level={selectedIncident.priority_level} score={selectedIncident.priority_score} />
                  <p className="text-[10px] text-slate-400 mt-1">Multi-Factor Triage Score</p>
                </div>
              </div>

              {/* Description & Impact Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Report Description
                </h3>
                <p className="text-xs text-slate-200 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                  {selectedIncident.description}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">People Affected</span>
                    <span className="font-bold text-sky-400 text-sm">{selectedIncident.people_affected}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Threat to Life</span>
                    <span className={`font-bold text-sm ${selectedIncident.immediate_threat_to_life ? 'text-red-400' : 'text-slate-300'}`}>
                      {selectedIncident.immediate_threat_to_life ? 'CRITICAL (YES)' : 'No'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Urgency Rating</span>
                    <span className="font-bold text-amber-400 text-sm">{selectedIncident.urgency_level}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Reporter Phone</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate block">
                      {selectedIncident.reporter_contact || 'Protected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explainable Factor Score Breakdown */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    Explainable Prioritization Factor Breakdown
                  </h3>
                  <span className="font-mono text-xs font-bold text-sky-400">
                    Score: {selectedIncident.priority_score} / 100
                  </span>
                </div>

                {selectedIncident.score_breakdown && (
                  <div className="space-y-2.5 pt-1">
                    {/* Factor 1: Threat to life */}
                    {selectedIncident.score_breakdown.threat_to_life && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">1. Immediate Threat to Life (Weight: {selectedIncident.score_breakdown.threat_to_life.weight}%)</span>
                          <span className="font-mono text-red-400">+{selectedIncident.score_breakdown.threat_to_life.points} pts</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                          <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{ width: `${(selectedIncident.score_breakdown.threat_to_life.points / selectedIncident.score_breakdown.threat_to_life.weight) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Factor 2: People affected */}
                    {selectedIncident.score_breakdown.people_affected && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">2. Population Impact Scale ({selectedIncident.score_breakdown.people_affected.count} people)</span>
                          <span className="font-mono text-sky-400">+{selectedIncident.score_breakdown.people_affected.points} pts</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                          <div
                            className="bg-sky-500 h-1.5 rounded-full"
                            style={{ width: `${(selectedIncident.score_breakdown.people_affected.points / selectedIncident.score_breakdown.people_affected.weight) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Factor 3: Urgency */}
                    {selectedIncident.score_breakdown.urgency && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">3. Urgency Level Multiplier ({selectedIncident.score_breakdown.urgency.level})</span>
                          <span className="font-mono text-amber-400">+{selectedIncident.score_breakdown.urgency.points} pts</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                          <div
                            className="bg-amber-500 h-1.5 rounded-full"
                            style={{ width: `${(selectedIncident.score_breakdown.urgency.points / selectedIncident.score_breakdown.urgency.weight) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Factor 4: Elapsed Time */}
                    {selectedIncident.score_breakdown.time_elapsed && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">4. Time Aging / Unaddressed Decay</span>
                          <span className="font-mono text-indigo-400">+{selectedIncident.score_breakdown.time_elapsed.points} pts</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${(selectedIncident.score_breakdown.time_elapsed.points / selectedIncident.score_breakdown.time_elapsed.weight) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-900">
                  {selectedIncident.score_breakdown?.disclaimer || 'Decision-support triage score only. Not a clinical diagnosis.'}
                </p>
              </div>

              {/* Potential Duplicate Candidate Notice */}
              {selectedIncident.is_duplicate && (
                <div className="bg-indigo-950/40 border border-indigo-800 rounded-xl p-3.5 space-y-1 text-xs">
                  <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Copy className="w-4 h-4" />
                    Automated Duplicate Candidate Flagged
                  </p>
                  <p className="text-indigo-200/90">
                    This incident matches proximity thresholds with Incident #{selectedIncident.duplicate_of_id || 'earlier report'}. Review details before dispatching duplicate teams.
                  </p>
                </div>
              )}

              {/* Human Responder Verification Action Panel */}
              <div className="border-t border-slate-800 pt-4 space-y-4">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Responder Verification Decision
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Verifier Notes / Ground Validation</label>
                    <input
                      type="text"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Confidence Rating (1-5)</label>
                    <select
                      value={confidenceRating}
                      onChange={(e) => setConfidenceRating(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value={5}>5 - Confirmed by Official Unit</option>
                      <option value={4}>4 - High (Multiple citizen calls)</option>
                      <option value={3}>3 - Medium (Single report, credible)</option>
                      <option value={2}>2 - Low (Ambiguous coordinates)</option>
                      <option value={1}>1 - Unverified rumor</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => handleVerify('VERIFIED')}
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Verify</span>
                  </button>

                  <button
                    onClick={() => handleVerify('DUPLICATE')}
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Mark as Duplicate</span>
                  </button>

                  <button
                    onClick={() => handleVerify('REJECTED')}
                    disabled={submitting}
                    className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject / False Alarm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
            Select an incident from the queue to inspect.
          </div>
        )}
      </div>
    </div>
  );
};
