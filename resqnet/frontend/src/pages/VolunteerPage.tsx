import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Volunteer, VolunteerAvailability } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Compass,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const VolunteerPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [taskDescription, setTaskDescription] = useState('Medical triage assistance at Central Shelter');
  const [roleType, setRoleType] = useState('First Aid Provider');
  const [submitting, setSubmitting] = useState(false);

  const fetchVolunteers = async () => {
    try {
      const data = await api.getVolunteers();
      setVolunteers(data);
    } catch (e) {
      console.error('Failed to load volunteers', e);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;
    setSubmitting(true);
    try {
      await api.assignVolunteer({
        volunteer_id: selectedVolunteer.id,
        task_description: taskDescription,
        role_type: roleType,
      });
      alert(`Volunteer ${selectedVolunteer.full_name} assigned to task successfully.`);
      setAssignModalOpen(false);
      await fetchVolunteers();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTask = async (asgnId: number) => {
    if (!confirm('Mark this field assignment as completed? Volunteer will return to available pool.')) return;
    try {
      await api.completeVolunteerAssignment(asgnId);
      alert('Assignment completed. Volunteer is now available.');
      await fetchVolunteers();
    } catch (e: any) {
      alert(`Failed to complete task: ${e.message}`);
    }
  };

  const availableCount = volunteers.filter((v) => v.availability_status === 'AVAILABLE').length;
  const deployedCount = volunteers.filter((v) => v.availability_status === 'DEPLOYED').length;

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Volunteer & Search-and-Rescue Teams
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Coordinate specialized SAR operators, medical doctors, and heavy drivers. Conflict prevention guards against double-booking.
          </p>
        </div>
      </div>

      {/* Roster Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Registered Personnel</span>
          <p className="text-2xl font-bold text-white mt-1">{volunteers.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Trained emergency responders & volunteers</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Ready For Deployment</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{availableCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Available for immediate assignment</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Actively Deployed</span>
          <p className="text-2xl font-bold text-sky-400 mt-1">{deployedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">On-scene executing emergency missions</p>
        </div>
      </div>

      {/* Volunteer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((vol) => {
          const isDeployed = vol.availability_status === 'DEPLOYED';
          return (
            <div
              key={vol.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{vol.full_name}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vol.phone}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    isDeployed
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {vol.availability_status}
                </span>
              </div>

              {/* Skills Tags */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Certifications & Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {vol.skills?.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]"
                    >
                      {sk.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Assignment Info */}
              {vol.active_assignment ? (
                <div className="bg-sky-950/40 border border-sky-800/80 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-sky-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {vol.active_assignment.role_type}
                    </span>
                    <span className="text-[10px] font-mono bg-sky-900/60 px-1.5 py-0.2 rounded">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{vol.active_assignment.task_description}</p>
                  <button
                    onClick={() => handleCompleteTask(vol.active_assignment!.id)}
                    className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-semibold border border-slate-700 transition"
                  >
                    Mark Assignment Complete
                  </button>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedVolunteer(vol);
                      setAssignModalOpen(true);
                    }}
                    className="w-full py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Assign Field Task</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {assignModalOpen && selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sky-400" />
              Assign Field Task: {selectedVolunteer.full_name}
            </h3>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operational Role Title</label>
                <input
                  type="text"
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Description & Location</label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Deploying...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
