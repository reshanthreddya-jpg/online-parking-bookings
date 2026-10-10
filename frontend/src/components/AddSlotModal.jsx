import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2, AlertCircle, Layers, Zap } from 'lucide-react';
import { api } from '../services/api';

export default function AddSlotModal({ onClose, onSuccess }) {
  const [slotNumber, setSlotNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [slotType, setSlotType] = useState('standard');
  const [hourlyRate, setHourlyRate] = useState(3.0);
  const [isChargingAvailable, setIsChargingAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slotNumber.trim()) {
      setError('Please provide a slot number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.createSlot({
        slotNumber: slotNumber.trim().toUpperCase(),
        floor: parseInt(floor, 10),
        slotType,
        hourlyRate: parseFloat(hourlyRate),
        isChargingAvailable: isChargingAvailable || slotType === 'ev'
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Add Parking Bay</h2>
              <p className="text-xs text-slate-400">Provision a new slot in the facility</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Slot Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. F1-EV07 or F2-17"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Floor / Level *
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={1}>Level 1 - Priority & EV</option>
                <option value={2}>Level 2 - General & Compact</option>
                <option value={3}>Level 3 - Premium & SUV</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Slot Type
              </label>
              <select
                value={slotType}
                onChange={(e) => {
                  setSlotType(e.target.value);
                  if (e.target.value === 'ev') setIsChargingAvailable(true);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="standard">Standard (Sedan)</option>
                <option value="compact">Compact Car</option>
                <option value="suv">SUV / Wide Bay</option>
                <option value="ev">Electric Vehicle (EV)</option>
                <option value="handicapped">Accessible Priority</option>
                <option value="motorcycle">Two-Wheeler</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isChargingAvailable}
              onChange={(e) => setIsChargingAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-600"
            />
            <div className="text-xs text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Equipped with EV Fast Charger
            </div>
          </label>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Creating...' : 'Provision Slot'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
