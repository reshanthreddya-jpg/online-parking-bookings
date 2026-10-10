import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ParkingLotGrid from './components/ParkingLotGrid';
import SlotDetailModal from './components/SlotDetailModal';
import CheckInModal from './components/CheckInModal';
import CheckOutModal from './components/CheckOutModal';
import TicketReceiptModal from './components/TicketReceiptModal';
import ReservationModal from './components/ReservationModal';
import AnalyticsView from './components/AnalyticsView';
import TicketsView from './components/TicketsView';
import AddSlotModal from './components/AddSlotModal';
import { api } from './services/api';
import { 
  Car, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  Zap, 
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'analytics' | 'tickets'
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTickets, setActiveTickets] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(0); // 0 = all
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal states
  const [selectedSlotForDetail, setSelectedSlotForDetail] = useState(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInSlot, setCheckInSlot] = useState(null);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [checkOutSlot, setCheckOutSlot] = useState(null);
  const [isReserveOpen, setIsReserveOpen] = useState(false);
  const [reserveSlot, setReserveSlot] = useState(null);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [activeReceiptTicket, setActiveReceiptTicket] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Data fetching
  const refreshData = useCallback(async () => {
    try {
      const [fetchedSlots, fetchedStats, fetchedTickets] = await Promise.all([
        api.getSlots({
          floor: selectedFloor !== 0 ? selectedFloor : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          slotType: typeFilter !== 'all' ? typeFilter : undefined,
          search: searchTerm || undefined
        }),
        api.getStats(),
        api.getTickets({ status: 'active' })
      ]);

      setSlots(fetchedSlots);
      setStats(fetchedStats);
      setActiveTickets(fetchedTickets);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFloor, statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    refreshData();
    // Live polling every 6 seconds to keep parking states synchronized
    const interval = setInterval(refreshData, 6000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Actions
  const handleReseed = async () => {
    if (!window.confirm('Reset the parking facility demo to fresh default slots and sample cars?')) return;
    try {
      setLoading(true);
      await api.reseedData();
      showToast('Facility database reset to standard demo configuration');
      await refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPark = (slot) => {
    setCheckInSlot(slot);
    setIsCheckInOpen(true);
  };

  const handleSlotCheckInSuccess = (ticket) => {
    setIsCheckInOpen(false);
    setCheckInSlot(null);
    setActiveReceiptTicket(ticket);
    showToast(`Vehicle ${ticket.licensePlate} checked in at ${ticket.slotNumber}!`);
    refreshData();
  };

  const handleCheckOutSuccess = (receipt) => {
    setIsCheckOutOpen(false);
    setCheckOutSlot(null);
    setActiveReceiptTicket(receipt);
    showToast(`Vehicle ${receipt.licensePlate} checked out. Fee: $${receipt.totalAmount.toFixed(2)}`);
    refreshData();
  };

  const handleReserveSuccess = (result) => {
    setIsReserveOpen(false);
    setReserveSlot(null);
    showToast(`Reservation confirmed! Code: ${result.reservationCode}`);
    refreshData();
  };

  const availableSlotsList = slots.filter(s => s.status === 'available');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all animate-bounce bg-slate-900 border-slate-700 text-white">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCheckIn={() => {
          setCheckInSlot(null);
          setIsCheckInOpen(true);
        }}
        onOpenCheckOut={() => {
          setCheckOutSlot(null);
          setIsCheckOutOpen(true);
        }}
        onOpenAddSlot={() => setIsAddSlotOpen(true)}
        onReseed={handleReseed}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner summary bar if stats exist */}
        {stats && (
          <div className="mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {stats.lotName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    IoT Gateways Active
                  </span>
                  <span>•</span>
                  <span>{stats.totalSlots} Smart Slots</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{stats.availableSlots} Available Now</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Pill Cards */}
            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
              <div className="bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Occupancy</span>
                <span className="text-sm font-black text-blue-400 font-mono">{stats.occupancyRate}%</span>
              </div>
              <div className="bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Today's Rev</span>
                <span className="text-sm font-black text-emerald-400 font-mono">${stats.todayRevenue.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900/80 px-3.5 py-2 rounded-2xl border border-slate-700/60 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Inside</span>
                <span className="text-sm font-black text-amber-300 font-mono">{stats.occupiedSlots}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Interactive Parking Grid */}
        {activeTab === 'grid' && (
          <ParkingLotGrid
            slots={slots}
            selectedFloor={selectedFloor}
            setSelectedFloor={setSelectedFloor}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            onSelectSlot={(slot) => setSelectedSlotForDetail(slot)}
            onQuickPark={handleQuickPark}
          />
        )}

        {/* Tab 2: Analytics & Reports */}
        {activeTab === 'analytics' && (
          <AnalyticsView 
            stats={stats} 
            onSelectActivity={(act) => {
              if (act.type === 'ENTRY') {
                const found = slots.find(s => s.slotNumber === act.slotNumber);
                if (found) setSelectedSlotForDetail(found);
              }
            }}
          />
        )}

        {/* Tab 3: Tickets & Historical Logs */}
        {activeTab === 'tickets' && (
          <TicketsView
            onSelectTicket={(ticket) => setActiveReceiptTicket(ticket)}
            onCheckOutTicket={(ticket) => {
              setCheckOutSlot({ currentSession: { ticketNumber: ticket.ticketNumber } });
              setIsCheckOutOpen(true);
            }}
          />
        )}

      </main>

      {/* Modals Container */}
      {selectedSlotForDetail && (
        <SlotDetailModal
          slot={selectedSlotForDetail}
          onClose={() => setSelectedSlotForDetail(null)}
          onCheckIn={(slot) => {
            setCheckInSlot(slot);
            setIsCheckInOpen(true);
          }}
          onCheckOut={(slot) => {
            setCheckOutSlot(slot);
            setIsCheckOutOpen(true);
          }}
          onReserve={(slot) => {
            setReserveSlot(slot);
            setIsReserveOpen(true);
          }}
          onSlotUpdated={refreshData}
        />
      )}

      {isCheckInOpen && (
        <CheckInModal
          preselectedSlot={checkInSlot}
          availableSlots={availableSlotsList}
          onClose={() => {
            setIsCheckInOpen(false);
            setCheckInSlot(null);
          }}
          onSuccess={handleSlotCheckInSuccess}
        />
      )}

      {isCheckOutOpen && (
        <CheckOutModal
          preselectedSlot={checkOutSlot}
          activeTickets={activeTickets}
          onClose={() => {
            setIsCheckOutOpen(false);
            setCheckOutSlot(null);
          }}
          onSuccess={handleCheckOutSuccess}
        />
      )}

      {isReserveOpen && (
        <ReservationModal
          slot={reserveSlot}
          availableSlots={availableSlotsList}
          onClose={() => {
            setIsReserveOpen(false);
            setReserveSlot(null);
          }}
          onSuccess={handleReserveSuccess}
        />
      )}

      {isAddSlotOpen && (
        <AddSlotModal
          onClose={() => setIsAddSlotOpen(false)}
          onSuccess={() => {
            setIsAddSlotOpen(false);
            showToast('New parking bay provisioned successfully!');
            refreshData();
          }}
        />
      )}

      {activeReceiptTicket && (
        <TicketReceiptModal
          ticket={activeReceiptTicket}
          onClose={() => setActiveReceiptTicket(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>ParkPulse MERN Smart Parking System • Real-Time Slot Telemetry & Automated Billing</p>
      </footer>

    </div>
  );
}
