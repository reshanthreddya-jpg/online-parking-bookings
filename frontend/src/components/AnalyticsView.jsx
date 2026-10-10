import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Car, 
  Zap, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Truck,
  Bike,
  Accessibility
} from 'lucide-react';

export default function AnalyticsView({ stats, onSelectActivity }) {
  if (!stats) return null;

  const {
    totalSlots,
    availableSlots,
    occupiedSlots,
    reservedSlots,
    maintenanceSlots,
    occupancyRate,
    todayRevenue,
    totalRevenue,
    totalCompletedSessions,
    vehicleTypeCounts = {},
    floorStats = [],
    recentActivity = []
  } = stats;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Slots & Available */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Live Available</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">{availableSlots}</span>
            <span className="text-xs text-slate-400 font-medium">/ {totalSlots} total</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Capacity Utilization:</span>
            <span className="font-bold text-white">{occupancyRate}%</span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Occupancy Rate</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-400 font-mono">{occupancyRate}%</span>
            <span className="text-xs text-slate-400">active bays</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/60">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, occupancyRate)}%` }}
            />
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Today's Revenue</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-amber-300 font-mono">${todayRevenue.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>All-time Total:</span>
            <span className="font-bold text-white">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Total Parked Vehicles */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Vehicles Parked</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Car className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">{occupiedSlots}</span>
            <span className="text-xs text-slate-400">vehicles inside</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Completed Sessions:</span>
            <span className="font-bold text-white">{totalCompletedSessions}</span>
          </div>
        </div>

      </div>

      {/* Floor Breakdown & Vehicle Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Floor Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Floor-by-Floor Occupancy
              </h3>
            </div>
            <span className="text-xs text-slate-400">3 Level Facility</span>
          </div>

          <div className="space-y-4">
            {floorStats.map(f => (
              <div key={f.floor} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{f.name}</span>
                    <span className="text-slate-400 text-xs ml-2 font-mono">({f.occupied} / {f.total} Bays)</span>
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    f.occupancyRate > 75 ? 'bg-rose-500/20 text-rose-400' :
                    f.occupancyRate > 40 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {f.occupancyRate}% Full
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                  <div 
                    className="bg-rose-500 transition-all duration-500" 
                    style={{ width: `${(f.occupied / f.total) * 100}%` }}
                    title={`${f.occupied} Occupied`}
                  />
                  <div 
                    className="bg-amber-500 transition-all duration-500" 
                    style={{ width: `${(f.reserved / f.total) * 100}%` }}
                    title={`${f.reserved} Reserved`}
                  />
                  <div 
                    className="bg-slate-600 transition-all duration-500" 
                    style={{ width: `${(f.maintenance / f.total) * 100}%` }}
                    title={`${f.maintenance} Maintenance`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="text-emerald-400 font-semibold">{f.available} Available</span>
                  <span>{f.occupied} Occupied</span>
                  <span>{f.reserved} Reserved</span>
                  <span>{f.maintenance} Maintenance</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Category Distribution */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Parked Fleet Breakdown
            </h3>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Sedans / Cars', count: vehicleTypeCounts.car || 0, icon: Car, color: 'text-blue-400', bar: 'bg-blue-500' },
              { label: 'SUVs & 4x4s', count: vehicleTypeCounts.suv || 0, icon: Truck, color: 'text-amber-400', bar: 'bg-amber-500' },
              { label: 'Electric (EV)', count: vehicleTypeCounts.ev || 0, icon: Zap, color: 'text-emerald-400', bar: 'bg-emerald-500' },
              { label: 'Two-Wheelers', count: vehicleTypeCounts.motorcycle || 0, icon: Bike, color: 'text-purple-400', bar: 'bg-purple-500' },
              { label: 'Accessible Bays', count: vehicleTypeCounts.accessible || 0, icon: Accessibility, color: 'text-cyan-400', bar: 'bg-cyan-500' }
            ].map(v => (
              <div key={v.label} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <v.icon className={`w-4 h-4 ${v.color}`} />
                    <span className="font-semibold text-slate-200">{v.label}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{v.count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/40 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">💡 Smart Routing Active:</div>
            <p>EV slots prioritize high-speed chargers on Floor 1. Wide SUV bays are prioritized on Floor 3.</p>
          </div>
        </div>

      </div>

      {/* Recent Activity Log Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Gate Movements
            </h3>
          </div>
          <span className="text-xs text-slate-400">Live IoT gate telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Event</th>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Plate #</th>
                <th className="p-3">Bay</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Time</th>
                <th className="p-3 text-right">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {recentActivity.map((act) => {
                const isEntry = act.type === 'ENTRY';
                return (
                  <tr key={act.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                        isEntry ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {isEntry ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {act.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-300">{act.ticketNumber}</td>
                    <td className="p-3 font-mono font-bold text-amber-300">{act.licensePlate}</td>
                    <td className="p-3 font-mono text-white">{act.slotNumber}</td>
                    <td className="p-3 capitalize text-slate-300">{act.vehicleType}</td>
                    <td className="p-3 text-slate-400">
                      {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {act.amount > 0 ? `$${act.amount.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
