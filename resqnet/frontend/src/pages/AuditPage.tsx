import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditEvent, SystemSetting } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  ShieldCheck,
  Sliders,
  History,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
} from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Configurable weights state
  const [weights, setWeights] = useState({
    threat_to_life: 35,
    people_affected: 25,
    urgency_level: 20,
    time_elapsed: 10,
    assistance_deficit: 10,
  });
  const [savingWeights, setSavingWeights] = useState(false);

  const fetchAuditData = async () => {
    try {
      const [lData, sData] = await Promise.all([
        api.getAuditLogs(selectedAction || undefined),
        api.getSystemSettings(),
      ]);
      setLogs(lData);
      setSettings(sData);

      const triageWeights = sData.find((s) => s.key === 'triage_weights');
      if (triageWeights && triageWeights.value) {
        setWeights({
          threat_to_life: triageWeights.value.threat_to_life ?? 35,
          people_affected: triageWeights.value.people_affected ?? 25,
          urgency_level: triageWeights.value.urgency_level ?? 20,
          time_elapsed: triageWeights.value.time_elapsed ?? 10,
          assistance_deficit: triageWeights.value.assistance_deficit ?? 10,
        });
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [selectedAction]);

  const totalWeight =
    Number(weights.threat_to_life) +
    Number(weights.people_affected) +
    Number(weights.urgency_level) +
    Number(weights.time_elapsed) +
    Number(weights.assistance_deficit);

  const handleSaveWeights = async () => {
    if (totalWeight !== 100) {
      alert(`Weights must sum to 100%. Current total: ${totalWeight}%`);
      return;
    }
    setSavingWeights(true);
    try {
      await api.updateSystemSetting('triage_weights', {
        value: weights,
        description: 'Configurable triage multi-factor scoring weights',
      });
      alert('Triage algorithm weights successfully updated and logged to audit trail.');
      await fetchAuditData();
    } catch (err: any) {
      alert(`Failed to save weights: ${err.message}`);
    } finally {
      setSavingWeights(false);
    }
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Audit Logging & Configurable Governance Rules
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable operation logs, responder accountability records, and dynamic triage weight configuration.
          </p>
        </div>
      </div>

      {/* Configurable Triage Weights Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              Configurable Triage Prioritization Scoring Weights
            </h2>
            <p className="text-xs text-slate-400">Adjust the relative importance of factors in automated triage ranking.</p>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                totalWeight === 100
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-red-950 text-red-300 border-red-800'
              }`}
            >
              Sum: {totalWeight} / 100%
            </span>

            <button
              onClick={handleSaveWeights}
              disabled={savingWeights || totalWeight !== 100}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingWeights ? 'Saving...' : 'Save Weights'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-300 font-semibold block">Threat to Life (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={weights.threat_to_life}
              onChange={(e) => setWeights({ ...weights, threat_to_life: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
            <span className="text-[10px] text-slate-400 block">Acute mortality risk</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-300 font-semibold block">People Affected (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={weights.people_affected}
              onChange={(e) => setWeights({ ...weights, people_affected: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
            <span className="text-[10px] text-slate-400 block">Logarithmic scale</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-300 font-semibold block">Urgency Rating (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={weights.urgency_level}
              onChange={(e) => setWeights({ ...weights, urgency_level: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
            <span className="text-[10px] text-slate-400 block">Severity multiplier</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-300 font-semibold block">Time Decay / Aging (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={weights.time_elapsed}
              onChange={(e) => setWeights({ ...weights, time_elapsed: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
            <span className="text-[10px] text-slate-400 block">Hours unaddressed</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-slate-300 font-semibold block">Deficit / Scarcity (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={weights.assistance_deficit}
              onChange={(e) => setWeights({ ...weights, assistance_deficit: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
            />
            <span className="text-[10px] text-slate-400 block">Multi-need complexity</span>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Immutable Operations Audit Trail
            </h2>
            <p className="text-[11px] text-slate-400">
              Complete chronological ledger of report intake, verifications, inventory adjustments, and dispatches.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="INCIDENT_REPORTED">Incident Reported</option>
              <option value="INCIDENT_VERIFIED">Incident Verified</option>
              <option value="ALLOCATION_OPTIMIZED">Allocation Optimized</option>
              <option value="INVENTORY_RESTOCKED">Inventory Restocked</option>
              <option value="ROAD_HAZARD_REPORTED">Road Hazard Reported</option>
              <option value="SHELTER_OCCUPANCY_UPDATED">Shelter Headcount</option>
              <option value="VOLUNTEER_ASSIGNED">Volunteer Assigned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Action Event</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Resource Target</th>
                <th className="py-2.5 px-3 text-right">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-slate-400 font-sans text-xs">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white font-sans text-xs">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-sky-400">{log.username}</td>
                  <td className="py-2.5 px-3 text-slate-300">{log.role}</td>
                  <td className="py-2.5 px-3 text-amber-300">
                    {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[10px] text-slate-400 max-w-[250px] truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-sans text-xs">
                    No audit records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
