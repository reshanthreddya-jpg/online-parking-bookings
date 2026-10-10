import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Zap, 
  Bike, 
  Truck, 
  Accessibility, 
  User, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

export default function CheckInModal({ 
  preselectedSlot, 
  availableSlots, 
  onClose, 
  onSuccess 
}) {
  const isReservedSlot = preselectedSlot?.status === 'reserved';
  const initialPlate = isReservedSlot && preselectedSlot?.currentSession?.licensePlate && preselectedSlot.currentSession.licensePlate !== 'RESERVED'
    ? preselectedSlot.currentSession.licensePlate
    : '';
  const [licensePlate, setLicensePlate] = useState(initialPlate);
  const [driverName, setDriverName] = useState(isReservedSlot ? (preselectedSlot?.currentSession?.driverName || '') : '');
  const [driverPhone, setDriverPhone] = useState(isReservedSlot ? (preselectedSlot?.currentSession?.driverPhone || '') : '');
  const [vehicleType, setVehicleType] = useState(
    isReservedSlot && preselectedSlot?.currentSession?.vehicleType
      ? preselectedSlot.currentSession.vehicleType
      : (preselectedSlot?.slotType === 'ev' ? 'ev' : preselectedSlot?.slotType === 'motorcycle' ? 'motorcycle' : preselectedSlot?.slotType === 'handicapped' ? 'accessible' : preselectedSlot?.slotType === 'suv' ? 'suv' : 'car')
  );
  const [slotId, setSlotId] = useState(preselectedSlot ? (preselectedSlot._id || preselectedSlot.id) : '');
  const [isChargingNeeded, setIsChargingNeeded] = useState(Boolean(preselectedSlot?.isChargingAvailable));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectableSlots = React.useMemo(() => {
    if (!preselectedSlot) return availableSlots;
    const preId = preselectedSlot._id || preselectedSlot.id;
    if (availableSlots.some(s => (s._id || s.id) === preId)) return availableSlots;
    return [preselectedSlot, ...availableSlots];
  }, [preselectedSlot, availableSlots]);

  const vehicleOptions = [
    { id: 'car', label: 'Car / Sedan', icon: Car },
    { id: 'suv', label: 'SUV / 4x4', icon: Truck },
    { id: 'ev', label: 'Electric (EV)', icon: Zap },
    { id: 'motorcycle', label: 'Two-Wheeler', icon: Bike },
    { id: 'accessible', label: 'Priority / Accessible', icon: Accessibility }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!licensePlate.trim()) {
      setError('Please enter a vehicle license plate number');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await api.checkIn({
        licensePlate: licensePlate.trim().toUpperCase(),
        driverName: driverName.trim() || 'Guest Driver',
        driverPhone: driverPhone.trim(),
        vehicleType,
        slotId: slotId || undefined,
        isChargingNeeded: isChargingNeeded || vehicleType === 'ev'
      });

      onSuccess(result.ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Entry Gate • Vehicle Check-In</h2>
              <p className="text-xs text-slate-400">Assign slot and issue digital parking token</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
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

          {/* License Plate Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              License Plate Number *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. DL-01-AB-1234 or TESLA-99"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 font-mono font-black text-lg text-amber-300 tracking-wider placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
              />
            </div>
          </div>

          {/* Vehicle Type Selection Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Select Vehicle Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {vehicleOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = vehicleType === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => {
                      setVehicleType(opt.id);
                      if (opt.id === 'ev') setIsChargingNeeded(true);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-500'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-semibold leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Driver Contact info (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Driver Name (Optional)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Phone # (Optional)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="+1-555-0100"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Slot Allocation Strategy */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Slot Assignment</span>
              {!slotId && (
                <span className="text-[11px] font-normal text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-Optimized
                </span>
              )}
            </label>
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">✨ Auto-Assign Optimal Available Slot (Recommended)</option>
              {selectableSlots.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.slotNumber} - Floor {s.floor} ({s.slotType.toUpperCase()}) - ${s.hourlyRate.toFixed(2)}/hr {s.isChargingAvailable ? '⚡' : ''} {s.status === 'reserved' ? '[RESERVED]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* EV Charging Add-on Checkbox */}
          {(vehicleType === 'ev' || availableSlots.some(s => s.isChargingAvailable)) && (
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={isChargingNeeded}
                onChange={(e) => setIsChargingNeeded(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-600"
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Request Fast EV Charging Bay
                </div>
                <div className="text-[11px] text-slate-400">
                  +$5.00 flat charging session utility charge
                </div>
              </div>
            </label>
          )}

          {/* Submit Gate Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {loading ? 'Processing Gate Entry...' : 'Confirm Entry & Print Ticket'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
