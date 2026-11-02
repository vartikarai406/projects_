import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shelter, ShelterStatus } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Home,
  Users,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Phone,
  MapPin,
} from 'lucide-react';

export const ShelterPage: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [occupancyModalOpen, setOccupancyModalOpen] = useState(false);
  const [newOccupancy, setNewOccupancy] = useState<number>(0);
  const [headcountNotes, setHeadcountNotes] = useState('Hourly ground headcount check');
  const [submitting, setSubmitting] = useState(false);

  const fetchShelters = async () => {
    try {
      const data = await api.getShelters();
      setShelters(data);
    } catch (e) {
      console.error('Failed to load shelters', e);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const handleUpdateOccupancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelter) return;
    setSubmitting(true);
    try {
      await api.updateOccupancy(selectedShelter.id, {
        new_occupancy: Number(newOccupancy),
        notes: headcountNotes,
      });
      alert(`Occupancy updated for ${selectedShelter.name}.`);
      setOccupancyModalOpen(false);
      await fetchShelters();
    } catch (err: any) {
      alert(`Failed to update occupancy: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCap = shelters.reduce((acc, s) => acc + s.max_capacity, 0);
  const totalOcc = shelters.reduce((acc, s) => acc + s.current_occupancy, 0);
  const totalBedsLeft = Math.max(0, totalCap - totalOcc);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-400" />
            Shelter Capacity & Evacuee Coordination
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time occupancy tracking, facilities accessibility inventory, and intake verification.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Shelter Capacity</span>
          <p className="text-2xl font-bold text-white mt-1">{totalCap.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {shelters.length} registered emergency shelters</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Current Occupancy</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalOcc.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0}% aggregate occupancy rate</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Available Beds Remaining</span>
          <p className="text-2xl font-bold text-sky-400 mt-1">{totalBedsLeft.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Estimated intake capacity across sectors</p>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((shelter) => {
          const pct = Math.round((shelter.current_occupancy / Math.max(1, shelter.max_capacity)) * 100);
          const isFull = shelter.status === 'FULL' || pct >= 95;

          return (
            <div
              key={shelter.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isFull
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {isFull ? 'FULL / NEAR CAPACITY' : 'ACCEPTING EVACUEES'}
                    </span>
                    <span className="text-[10px] text-slate-400">ID: #{shelter.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{shelter.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{shelter.address}</span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedShelter(shelter);
                    setNewOccupancy(shelter.current_occupancy);
                    setOccupancyModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  Update Headcount
                </button>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Occupancy Level:</span>
                  <span className="font-mono font-bold text-white">
                    {shelter.current_occupancy} / {shelter.max_capacity} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>Available Beds: <strong className="text-slate-200">{Math.max(0, shelter.max_capacity - shelter.current_occupancy)}</strong></span>
                  <span>Contact: {shelter.contact_phone}</span>
                </div>
              </div>

              {/* Facilities Checklist */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Available Facilities & Accessibility
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {shelter.facilities?.map((f, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[10px] flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{f.replace(/_/g, ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Headcount Update Modal */}
      {occupancyModalOpen && selectedShelter && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Update Shelter Headcount: {selectedShelter.name}
            </h3>

            <form onSubmit={handleUpdateOccupancy} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Headcount (Capacity: {selectedShelter.max_capacity})
                </label>
                <input
                  type="number"
                  min={0}
                  value={newOccupancy}
                  onChange={(e) => setNewOccupancy(parseInt(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Intake Notes / Verification Source</label>
                <input
                  type="text"
                  value={headcountNotes}
                  onChange={(e) => setHeadcountNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOccupancyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Headcount Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
