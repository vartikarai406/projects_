import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  ThumbsUp, 
  CheckCircle, 
  MapPin, 
  Clock, 
  Filter, 
  ShieldAlert,
  Send
} from 'lucide-react';

export default function IncidentFeed({
  incidents = [],
  onReportIncident,
  onUpvoteIncident
}) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('poor_lighting');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');

  const filteredIncidents = filterCategory === 'all'
    ? incidents
    : incidents.filter(i => i.category === filterCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;

    onReportIncident({
      title,
      category,
      severity,
      description,
      coordinates: [12.9700 + (Math.random() - 0.5) * 0.02, 77.6000 + (Math.random() - 0.5) * 0.02]
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'poor_lighting':
        return { label: 'Poor Lighting', color: 'bg-yellow-950 text-yellow-300 border-yellow-500/30' };
      case 'harassment':
        return { label: 'Harassment', color: 'bg-rose-950 text-rose-300 border-rose-500/30' };
      case 'isolated_area':
        return { label: 'Isolated Alley', color: 'bg-purple-950 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'Suspicious Activity', color: 'bg-amber-950 text-amber-300 border-amber-500/30' };
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="glass-card rounded-2xl p-5 border border-purple-900/40 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Community Incident Intelligence
            </h2>
            <p className="text-[10px] text-slate-400">
              Verified crowdsourced safety hazards & real-time risk alerts
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Report Hazard
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {[
            { id: 'all', label: 'All Incidents' },
            { id: 'poor_lighting', label: 'Lighting' },
            { id: 'harassment', label: 'Harassment' },
            { id: 'isolated_area', label: 'Isolated' },
            { id: 'suspicious_activity', label: 'Suspicious' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                filterCategory === f.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Incidents List */}
        <div className="mt-4 flex flex-col gap-3">
          {filteredIncidents.map(inc => {
            const badge = getCategoryBadge(inc.category);

            return (
              <div
                key={inc.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        inc.severity === 'high' ? 'bg-red-950 text-red-300' :
                        inc.severity === 'medium' ? 'bg-amber-950 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {inc.severity} Severity
                      </span>
                      {inc.verified && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white mt-1.5">
                      {inc.title}
                    </h3>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => onUpvoteIncident(inc.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 text-xs font-bold transition shrink-0 cursor-pointer"
                    title="Confirm / Upvote this hazard report"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{inc.upvotes}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {inc.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {inc.time_reported}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    [{inc.coordinates[0].toFixed(3)}, {inc.coordinates[1].toFixed(3)}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-white mb-1">Report Safety Hazard</h3>
            <p className="text-xs text-slate-400 mb-4">
              Contribute to the safety map to alert other women in this neighborhood.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken street lamp near underpass"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="poor_lighting">Poor Lighting</option>
                    <option value="harassment">Harassment</option>
                    <option value="isolated_area">Isolated Alley</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide brief details to help assess safety..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg shadow-purple-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
