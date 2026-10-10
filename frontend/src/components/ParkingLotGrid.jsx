import React, { useState } from 'react';
import { 
  Zap, 
  Accessibility, 
  Bike, 
  Car, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Search, 
  Filter, 
  Layers,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export default function ParkingLotGrid({ 
  slots, 
  selectedFloor, 
  setSelectedFloor, 
  onSelectSlot, 
  onQuickPark,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter
}) {
  // Helpers for icons and labels
  const getSlotTypeBadge = (type, isCharging) => {
    switch (type) {
      case 'ev':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" /> EV Charger
          </span>
        );
      case 'handicapped':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Accessibility className="w-3 h-3" /> Priority
          </span>
        );
      case 'motorcycle':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Bike className="w-3 h-3" /> Two-Wheeler
          </span>
        );
      case 'suv':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Truck className="w-3 h-3" /> SUV / Wide
          </span>
        );
      case 'compact':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Car className="w-3 h-3" /> Compact
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/50">
            <Car className="w-3 h-3" /> Standard
          </span>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return {
          cardBg: 'bg-slate-800/80 hover:bg-emerald-950/30 border-slate-700/80 hover:border-emerald-500/60 shadow-emerald-500/5',
          indicator: 'bg-emerald-500 shadow-emerald-500/50 text-emerald-400',
          text: 'Available',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'occupied':
        return {
          cardBg: 'bg-rose-950/20 border-rose-900/60 hover:border-rose-500/70 shadow-rose-500/10',
          indicator: 'bg-rose-500 shadow-rose-500/50 text-rose-400 animate-pulse',
          text: 'Occupied',
          badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40'
        };
      case 'reserved':
        return {
          cardBg: 'bg-amber-950/20 border-amber-900/60 hover:border-amber-500/70 shadow-amber-500/10',
          indicator: 'bg-amber-500 shadow-amber-500/50 text-amber-400',
          text: 'Reserved',
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40'
        };
      case 'maintenance':
        return {
          cardBg: 'bg-slate-800/40 border-slate-700/50 opacity-70 hover:opacity-100',
          indicator: 'bg-slate-500 text-slate-400',
          text: 'Maintenance',
          badge: 'bg-slate-700/50 text-slate-400 border-slate-600/50'
        };
      default:
        return {
          cardBg: 'bg-slate-800 border-slate-700',
          indicator: 'bg-slate-400 text-slate-300',
          text: status,
          badge: 'bg-slate-700 text-slate-300'
        };
    }
  };

  const calculateDuration = (checkInTime) => {
    if (!checkInTime) return '';
    const diffMs = Date.now() - new Date(checkInTime).getTime();
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours === 0) return `${remMins}m`;
    return `${hours}h ${remMins}m`;
  };

  const filteredSlots = slots;

  return (
    <div className="space-y-6">
      
      {/* Floor Selection & Filter Control Toolbar */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/70 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Floor tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-2">
              <Layers className="w-4 h-4 text-blue-400" /> Floor:
            </span>
            {[
              { id: 0, label: 'All Levels' },
              { id: 1, label: 'L1: EV & Priority' },
              { id: 2, label: 'L2: General' },
              { id: 3, label: 'L3: SUV & Roof' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFloor(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedFloor === f.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Slot (e.g. F1-EV01), Plate, Driver..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Status & Type Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/50 text-xs">
          
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'available', label: 'Available', dot: 'bg-emerald-500' },
              { id: 'occupied', label: 'Occupied', dot: 'bg-rose-500' },
              { id: 'reserved', label: 'Reserved', dot: 'bg-amber-500' },
              { id: 'maintenance', label: 'Maintenance', dot: 'bg-slate-400' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === st.id
                    ? 'bg-slate-700 text-white font-bold ring-1 ring-slate-500'
                    : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {st.dot && <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>}
                {st.label}
              </button>
            ))}
          </div>

          {/* Slot Type filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Type:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'ev', label: '⚡ EV' },
              { id: 'standard', label: '🚗 Standard' },
              { id: 'compact', label: '🚘 Compact' },
              { id: 'suv', label: '🚙 SUV' },
              { id: 'handicapped', label: '♿ Priority' },
              { id: 'motorcycle', label: '🏍️ Moto' }
            ].map(tp => (
              <button
                key={tp.id}
                onClick={() => setTypeFilter(tp.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  typeFilter === tp.id
                    ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                    : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Grid Legend & Status Counter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span>Available ({slots.filter(s => s.status === 'available').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500"></span>
            <span>Occupied ({slots.filter(s => s.status === 'occupied').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span>Reserved ({slots.filter(s => s.status === 'reserved').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-500"></span>
            <span>Maintenance ({slots.filter(s => s.status === 'maintenance').length})</span>
          </div>
        </div>
        <div className="text-slate-500 font-medium">
          Showing {filteredSlots.length} slots
        </div>
      </div>

      {/* Slot Card Grid View */}
      {filteredSlots.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No Parking Slots Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, floor selector, or filter settings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSlots.map(slot => {
            const statusConfig = getStatusColor(slot.status);
            const isOccupied = slot.status === 'occupied';
            const isReserved = slot.status === 'reserved';
            const isAvailable = slot.status === 'available';
            const isMaintenance = slot.status === 'maintenance';

            return (
              <div
                key={slot._id || slot.id}
                onClick={() => onSelectSlot(slot)}
                className={`relative rounded-2xl border transition-all duration-200 cursor-pointer p-4 group overflow-hidden ${statusConfig.cardBg} shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
              >
                {/* Visual Top Bay Border Line (like painted floor parking spot lines) */}
                <div className={`absolute top-0 left-3 right-3 h-1 rounded-full ${
                  isOccupied ? 'bg-rose-500' :
                  isAvailable ? 'bg-emerald-500' :
                  isReserved ? 'bg-amber-500' : 'bg-slate-600'
                }`} />

                {/* Slot Header: ID + Status + Type */}
                <div className="flex items-start justify-between gap-2 pt-1 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors font-mono">
                        {slot.slotNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Fl. {slot.floor}
                      </span>
                    </div>
                    <div className="mt-1">
                      {getSlotTypeBadge(slot.slotType, slot.isChargingAvailable)}
                    </div>
                  </div>

                  {/* Status Indicator Pill */}
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${statusConfig.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.indicator}`} />
                    {statusConfig.text}
                  </span>
                </div>

                {/* Middle Slot Content: depends on status */}
                <div className="py-2 min-h-[72px] flex flex-col justify-center border-t border-b border-slate-700/40 my-2">
                  {isOccupied && slot.currentSession ? (
                    <div className="space-y-1.5">
                      {/* Vehicle License Plate display badge */}
                      <div className="flex items-center justify-between">
                        <div className="bg-slate-900 border border-slate-600 rounded px-2 py-0.5 font-mono font-black text-xs text-amber-300 tracking-wider flex items-center gap-1 shadow-inner">
                          <Car className="w-3 h-3 text-slate-400" />
                          {slot.currentSession.licensePlate}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>{calculateDuration(slot.currentSession.checkInTime)}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center justify-between">
                        <span>{slot.currentSession.driverName || 'Guest Driver'}</span>
                        <span className="text-slate-300 font-semibold">${slot.hourlyRate}/hr</span>
                      </div>
                    </div>
                  ) : isReserved && slot.currentSession ? (
                    <div className="space-y-1 text-center py-1">
                      <div className="text-xs font-mono font-bold text-amber-400">
                        {slot.currentSession.reservationCode}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">
                        {slot.currentSession.driverName || 'Reserved Guest'}
                      </div>
                      <div className="text-[10px] text-amber-500/80">Awaiting Arrival</div>
                    </div>
                  ) : isMaintenance ? (
                    <div className="flex items-center justify-center gap-2 text-slate-400 py-1 text-xs">
                      <Wrench className="w-4 h-4 text-slate-500" />
                      <span>Sensor Inspection</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1">
                      <div>
                        <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Park
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          ${slot.hourlyRate.toFixed(2)} / hour
                        </div>
                      </div>
                      {slot.isChargingAvailable && (
                        <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Fast EV
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {slot.floorName ? slot.floorName.split('-')[0].trim() : `Floor ${slot.floor}`}
                  </span>
                  
                  {isAvailable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickPark(slot);
                      }}
                      className="px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold text-[11px] transition-all flex items-center gap-1"
                    >
                      Park here →
                    </button>
                  )}

                  {isOccupied && (
                    <span className="text-[11px] text-blue-400 hover:text-blue-300 font-medium group-hover:underline">
                      Manage →
                    </span>
                  )}

                  {isReserved && (
                    <span className="text-[11px] text-amber-400 hover:text-amber-300 font-medium group-hover:underline">
                      View →
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
