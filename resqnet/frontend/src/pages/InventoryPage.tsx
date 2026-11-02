import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Depot, ResourceType } from '../types';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  Boxes,
  PlusCircle,
  Package,
  AlertTriangle,
  RefreshCw,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [loading, setLoading] = useState(true);

  // Restock modal state
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockDepotId, setRestockDepotId] = useState<number>(1);
  const [restockResourceType, setRestockResourceType] = useState<ResourceType>('DRINKING_WATER');
  const [restockQty, setRestockQty] = useState<number>(200);
  const [restockReason, setRestockReason] = useState<string>('Air-drop convoy emergency restock');
  const [submittingRestock, setSubmittingRestock] = useState(false);

  const fetchInventory = async () => {
    try {
      const [depRes, sumRes] = await Promise.all([
        api.getDepots(),
        api.getInventorySummary(),
      ]);
      setDepots(depRes);
      setSummary(sumRes);
      if (depRes.length > 0 && !selectedDepot) {
        setSelectedDepot(depRes[0]);
      }
    } catch (e) {
      console.error('Failed to load inventory', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRestock(true);
    try {
      await api.restockItem(restockDepotId, {
        resource_type: restockResourceType,
        quantity_to_add: Number(restockQty),
        reason: restockReason,
      });
      alert(`Restocked ${restockQty} units of ${restockResourceType} successfully.`);
      setRestockModalOpen(false);
      await fetchInventory();
    } catch (e: any) {
      alert(`Restock failed: ${e.message}`);
    } finally {
      setSubmittingRestock(false);
    }
  };

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-purple-400" />
            Resource Depots & Staging Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-depot stock monitoring, inventory reservation states, and restock actions.
          </p>
        </div>

        <button
          onClick={() => {
            if (depots.length > 0) setRestockDepotId(depots[0].id);
            setRestockModalOpen(true);
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-lg shadow-purple-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Restock Depot Inventory</span>
        </button>
      </div>

      {/* Aggregate Overview Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Items in Depots</span>
            <p className="text-2xl font-bold text-white mt-1">
              {(summary.total_items_available + summary.total_items_reserved).toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across {summary.active_depots_count} active logistics depots</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Available For Allocation</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {summary.total_items_available.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Uncommitted stock ready for dispatch</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Reserved / In-Transit</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {summary.total_items_reserved.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Committed to approved allocation plans</p>
          </div>
        </div>
      )}

      {/* Depots List & Detailed Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Depot Selector (1 Col) */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Depots ({depots.length})
          </h2>

          <div className="space-y-2">
            {depots.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDepot(d)}
                className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
                  selectedDepot?.id === d.id
                    ? 'bg-purple-950/40 border-purple-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-purple-400">{d.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {d.capacity_sqm} m²
                  </span>
                </div>
                <h3 className="font-bold text-white text-xs">{d.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">{d.address}</p>
                <p className="text-[10px] text-slate-400">Contact: {d.contact_person} ({d.phone})</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Depot Inventory Table (2 Cols) */}
        {selectedDepot && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    {selectedDepot.name}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedDepot.address}</p>
                </div>
                <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-1 rounded-lg">
                  {selectedDepot.code}
                </span>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Resource Type</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Available</th>
                      <th className="py-2.5 px-3">Reserved</th>
                      <th className="py-2.5 px-3">Threshold</th>
                      <th className="py-2.5 px-3 text-right">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedDepot.inventory_items?.map((item) => {
                      const isLow = item.quantity_available <= item.minimum_threshold;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-medium text-white">
                            {item.resource_type.replace(/_/g, ' ')}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">{item.unit}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                            {item.quantity_available}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-amber-400">
                            {item.quantity_reserved}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">
                            {item.minimum_threshold}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                LOW STOCK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ADEQUATE
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      {restockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-400" />
              Restock Depot Inventory
            </h3>
            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Depot</label>
                <select
                  value={restockDepotId}
                  onChange={(e) => setRestockDepotId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {depots.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resource Commodity</label>
                <select
                  value={restockResourceType}
                  onChange={(e) => setRestockResourceType(e.target.value as ResourceType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="DRINKING_WATER">Drinking Water (Liters)</option>
                  <option value="FOOD_PACKETS">Food Packets (Ration Packs)</option>
                  <option value="FIRST_AID_KITS">First-Aid Kits (Kits)</option>
                  <option value="MEDICINES">Medicines (Doses)</option>
                  <option value="RESCUE_EQUIPMENT">Rescue Equipment (Units)</option>
                  <option value="TRANSPORT_VEHICLES">Transport Vehicles (Vehicles)</option>
                  <option value="TEMPORARY_SHELTER">Temporary Shelter (Tents)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quantity to Add</label>
                <input
                  type="number"
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Restock Authorization Reason</label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRestock}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  {submittingRestock ? 'Recording...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
