import React, { useState, useEffect } from 'react';
import { Search, Filter, History, Receipt, CreditCard, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function TicketsView({ onSelectTicket, onCheckOutTicket }) {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getTickets({
        status: statusFilter,
        search: searchTerm
      });
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTickets();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Filter Controls */}
      <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
            <Filter className="w-4 h-4 text-blue-400" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Tickets' },
            { id: 'active', label: 'Active (Parked)' },
            { id: 'completed', label: 'Paid & Completed' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Plate, Ticket #, Slot..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-14 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
          >
            Go
          </button>
        </form>

      </div>

      {/* Tickets Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300">No parking tickets found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3.5">Ticket #</th>
                  <th className="p-3.5">Plate #</th>
                  <th className="p-3.5">Slot / Floor</th>
                  <th className="p-3.5">Driver</th>
                  <th className="p-3.5">Entry Time</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {tickets.map(t => {
                  const isActive = t.status === 'active';
                  return (
                    <tr key={t._id || t.id} className="hover:bg-slate-700/25 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-200">
                        {t.ticketNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-black text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {t.licensePlate}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-white">
                        {t.slotNumber} <span className="text-slate-400 text-[11px]">(Fl. {t.floor})</span>
                      </td>
                      <td className="p-3.5 text-slate-300 truncate max-w-[120px]">
                        {t.driverName || 'Guest'}
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(t.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {t.durationMinutes ? `${Math.floor(t.durationMinutes / 60)}h ${t.durationMinutes % 60}m` : 'In Progress'}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isActive 
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isActive ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {isActive ? 'Active' : 'Paid'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-sm">
                        {t.totalAmount ? `$${t.totalAmount.toFixed(2)}` : '—'}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectTicket(t)}
                            title="View Digital Receipt"
                            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          {isActive && (
                            <button
                              onClick={() => onCheckOutTicket(t)}
                              title="Checkout Vehicle"
                              className="px-2 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-bold transition-colors"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
