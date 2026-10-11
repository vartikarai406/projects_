import React, { useState } from 'react';
import { Users, X, Plus, Phone, MessageSquare, Trash2, ShieldCheck, Share2, Copy, Check } from 'lucide-react';

export default function TrustedContactsModal({ isOpen, onClose }) {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Mom", relation: "Parent", phone: "+91 98765 43210", notifySms: true, notifyWhatsApp: true },
    { id: 2, name: "Sneha", relation: "Roommate", phone: "+91 98450 11223", notifySms: true, notifyWhatsApp: true },
    { id: 3, name: "Ananya", relation: "Colleague", phone: "+91 97112 88776", notifySms: false, notifyWhatsApp: true }
  ]);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Friend');
  const [newPhone, setNewPhone] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    setContacts(prev => [
      ...prev,
      { id: Date.now(), name: newName, relation: newRelation, phone: newPhone, notifySms: true, notifyWhatsApp: true }
    ]);
    setNewName('');
    setNewPhone('');
  };

  const handleDelete = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const copyLiveLink = () => {
    navigator.clipboard?.writeText?.("https://herguard.ai/live-share/GUARDIAN-TOKEN-9021");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Trusted Guardian Circle</h3>
            <p className="text-xs text-slate-400">Emergency Contacts & Instant Dispatch</p>
          </div>
        </div>

        {/* Live Link Share Widget */}
        <div className="mt-4 p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-purple-200 block">Personal Live Telemetry Link</span>
            <span className="text-[11px] text-purple-300/80 font-mono">herguard.ai/live-share/GUARDIAN...</span>
          </div>
          <button
            onClick={copyLiveLink}
            className="px-2.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold flex items-center gap-1 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Contacts List */}
        <div className="mt-4 flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
          {contacts.map(c => (
            <div
              key={c.id}
              className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{c.name}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {c.relation}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>{c.phone}</span>
                  <span className="text-emerald-400 text-[10px]">SMS & WhatsApp</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                title="Remove Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleAdd} className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2.5 text-xs">
          <span className="font-bold text-slate-300">Add Trusted Guardian</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              required
              placeholder="Name (e.g. Maya)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              required
              placeholder="Phone (+91...)"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center justify-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Save Contact
          </button>
        </form>
      </div>
    </div>
  );
}
