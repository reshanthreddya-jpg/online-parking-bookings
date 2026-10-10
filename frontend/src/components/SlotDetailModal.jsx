import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Zap, 
  Wrench, 
  Calendar, 
  Trash2, 
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function SlotDetailModal({ 
  slot, 
  onClose, 
  onCheckIn, 
  onCheckOut, 
  onReserve,
  onSlotUpdated 
}) {
  const [loading, setLoading] = useState(false);
  const [liveBill, setLiveBill] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editSlotType, setEditSlotType] = useState(slot?.slotType || 'standard');
  const [editHourlyRate, setEditHourlyRate] = useState(slot?.hourlyRate || 3.0);
  const [editCharging, setEditCharging] = useState(Boolean(slot?.isChargingAvailable));

  // Fetch live running bill if occupied
  useEffect(() => {
    if (slot) {
      setEditSlotType(slot.slotType || 'standard');
      setEditHourlyRate(slot.hourlyRate || 3.0);
      setEditCharging(Boolean(slot.isChargingAvailable));
    }
    if (slot && slot.status === 'occupied' && slot.currentSession?.ticketNumber) {
      api.calculateBill({ ticketNumber: slot.currentSession.ticketNumber })
        .then(res => setLiveBill(res))
        .catch(() => setLiveBill(null));
    }
  }, [slot]);

  if (!slot) return null;

  const handleSaveSlotConfig = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.updateSlot(slot._id || slot.id, {
        slotType: editSlotType,
        hourlyRate: parseFloat(editHourlyRate),
        isChargingAvailable: Boolean(editCharging)
      });
      setIsEditing(false);
      onSlotUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      setLoading(true);
      setError('');
      await api.toggleMaintenance(slot._id || slot.id);
      onSlotUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      setLoading(true);
      setError('');
      await api.cancelReservation(slot._id || slot.id);
      onSlotUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!window.confirm(`Are you sure you want to delete slot ${slot.slotNumber}?`)) return;
    try {
      setLoading(true);
      setError('');
      await api.deleteSlot(slot._id || slot.id);
      onSlotUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-black text-lg">
              {slot.slotNumber.split('-')[1] || slot.slotNumber}
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
                Slot {slot.slotNumber}
                <span className={`text-xs font-sans font-bold px-2.5 py-0.5 rounded-full border ${
                  slot.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  slot.status === 'occupied' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                  slot.status === 'reserved' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-slate-700 text-slate-300 border-slate-600'
                }`}>
                  {slot.status.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Floor {slot.floor} • {slot.floorName || `Level ${slot.floor}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Specifications & Edit Config */}
          {!isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bay Specifications</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Edit Slot Config
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-medium">Slot Type</div>
                  <div className="text-sm font-bold text-white capitalize mt-0.5">{slot.slotType}</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-medium">Base Rate</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">${slot.hourlyRate.toFixed(2)}/hr</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 text-center">
                  <div className="text-[11px] text-slate-400 font-medium">EV Charging</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {slot.isChargingAvailable ? '⚡ Active' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveSlotConfig} className="bg-slate-900/90 border border-blue-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Configure Slot Parameters</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Slot Type</label>
                  <select
                    value={editSlotType}
                    onChange={(e) => {
                      setEditSlotType(e.target.value);
                      if (e.target.value === 'ev') setEditCharging(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="compact">Compact</option>
                    <option value="suv">SUV / Wide</option>
                    <option value="ev">EV Charging</option>
                    <option value="handicapped">Priority / Accessible</option>
                    <option value="motorcycle">Two-Wheeler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editCharging}
                  onChange={(e) => setEditCharging(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-blue-600"
                />
                <span>⚡ Equipped with EV Fast Charger</span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all"
              >
                {loading ? 'Saving...' : 'Save Slot Changes'}
              </button>
            </form>
          )}

          {/* Status Specific Section */}
          {slot.status === 'occupied' && slot.currentSession && (
            <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Parked Vehicle</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  #{slot.currentSession.ticketNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-slate-400">License Plate</div>
                  <div className="text-base font-black font-mono text-amber-300 tracking-wider">
                    {slot.currentSession.licensePlate}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Vehicle Type</div>
                  <div className="text-sm font-bold text-white capitalize">
                    {slot.currentSession.vehicleType || 'Car'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Driver</div>
                  <div className="text-xs font-semibold text-slate-200">
                    {slot.currentSession.driverName || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Checked In At</div>
                  <div className="text-xs font-semibold text-slate-300">
                    {new Date(slot.currentSession.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Running bill preview */}
              {liveBill && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Elapsed: </span>
                    <span className="font-bold text-white">{liveBill.billedHours} hr ({liveBill.durationMinutes} mins)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Accrued: </span>
                    <span className="font-extrabold text-emerald-400 text-sm">${liveBill.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {slot.status === 'reserved' && slot.currentSession && (
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Reservation Details
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {slot.currentSession.reservationCode}
                </span>
              </div>
              <div className="text-xs text-slate-300">
                <div><strong className="text-slate-400">Guest:</strong> {slot.currentSession.driverName}</div>
                {slot.currentSession.driverPhone && (
                  <div><strong className="text-slate-400">Phone:</strong> {slot.currentSession.driverPhone}</div>
                )}
                <div><strong className="text-slate-400">Expected Vehicle:</strong> {slot.currentSession.licensePlate}</div>
              </div>
            </div>
          )}

          {slot.status === 'maintenance' && (
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-center space-y-2">
              <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-300">Under Scheduled Maintenance</div>
              <p className="text-xs text-slate-400">
                This bay is flagged for sensor recalibration or resurfacing.
              </p>
            </div>
          )}

          {/* Action buttons based on status */}
          <div className="space-y-2 pt-2">
            {slot.status === 'available' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onCheckIn(slot);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Car className="w-4 h-4" /> Park Vehicle
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onReserve(slot);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Pre-Book / Reserve
                </button>
              </div>
            )}

            {slot.status === 'occupied' && (
              <button
                onClick={() => {
                  onClose();
                  onCheckOut(slot);
                }}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Proceed to Check-Out & Pay
              </button>
            )}

            {slot.status === 'reserved' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onCheckIn(slot);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Check-In Guest
                </button>
                <button
                  onClick={handleCancelReservation}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm active:scale-95 transition-all"
                >
                  Cancel Booking
                </button>
              </div>
            )}

            {/* Utility actions: Maintenance & Delete */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-xs">
              {slot.status !== 'occupied' && (
                <button
                  onClick={handleToggleMaintenance}
                  disabled={loading}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  {slot.status === 'maintenance' ? 'Reopen Slot' : 'Set to Maintenance'}
                </button>
              )}

              {slot.status !== 'occupied' && (
                <button
                  onClick={handleDeleteSlot}
                  disabled={loading}
                  className="text-rose-400/80 hover:text-rose-300 flex items-center gap-1.5 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Bay
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
