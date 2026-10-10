import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Car, 
  Clock, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function CheckOutModal({ 
  preselectedSlot, 
  activeTickets = [], 
  onClose, 
  onSuccess 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [billLoading, setBillLoading] = useState(false);
  const [error, setError] = useState('');

  // If a slot was preselected, find its active ticket
  useEffect(() => {
    if (preselectedSlot && preselectedSlot.currentSession?.ticketNumber) {
      handleSelectTicketByNumber(preselectedSlot.currentSession.ticketNumber);
    }
  }, [preselectedSlot]);

  const handleSelectTicketByNumber = async (ticketNum) => {
    try {
      setBillLoading(true);
      setError('');
      const bill = await api.calculateBill({ ticketNumber: ticketNum });
      setBillDetails(bill);
      const matched = activeTickets.find(t => t.ticketNumber === ticketNum);
      setSelectedTicket(matched || { ticketNumber: ticketNum });
    } catch (err) {
      setError(err.message);
      setBillDetails(null);
    } finally {
      setBillLoading(false);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setBillLoading(true);
      setError('');
      // Try by ticketNumber or license plate
      const bill = await api.calculateBill({
        ticketNumber: searchQuery.trim().toUpperCase(),
        licensePlate: searchQuery.trim().toUpperCase()
      });
      setBillDetails(bill);
      setSelectedTicket({
        ticketNumber: bill.ticketNumber,
        licensePlate: bill.licensePlate,
        slotNumber: bill.slotNumber
      });
    } catch (err) {
      setError(err.message || 'Vehicle or Ticket not found in active sessions');
      setBillDetails(null);
    } finally {
      setBillLoading(false);
    }
  };

  const handleProcessCheckOut = async () => {
    if (!billDetails) return;
    try {
      setLoading(true);
      setError('');

      const result = await api.checkOut({
        ticketNumber: billDetails.ticketNumber,
        paymentMethod
      });

      onSuccess(result.receipt);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { id: 'credit_card', label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'upi', label: 'UPI / QR Code', icon: QrCode },
    { id: 'cash', label: 'Cash at Kiosk', icon: Banknote },
    { id: 'fastag', label: 'FASTag / RFID', icon: Sparkles }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Exit Gate • Bill & Check-Out</h2>
              <p className="text-xs text-slate-400">Calculate parking duration and finalize checkout</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search bar or selector */}
          {!preselectedSlot && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Search Parked Vehicle
              </label>
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter License Plate or Ticket #"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-white uppercase placeholder:font-sans placeholder:font-normal placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={billLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                >
                  {billLoading ? 'Searching...' : 'Find'}
                </button>
              </form>

              {/* Quick select list of active parked cars */}
              {activeTickets.length > 0 && !billDetails && (
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 mb-1.5 font-semibold">Or pick from parked vehicles:</div>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                    {activeTickets.map(t => (
                      <button
                        key={t._id || t.id}
                        type="button"
                        onClick={() => handleSelectTicketByNumber(t.ticketNumber)}
                        className="w-full text-left p-2 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/60 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-300">{t.licensePlate}</span>
                          <span className="text-slate-400">({t.slotNumber})</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px]">{t.ticketNumber}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bill Breakdown Card */}
          {billDetails && (
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-xs text-slate-400">Vehicle:</span>
                  <div className="text-sm font-black font-mono text-amber-300">{billDetails.licensePlate}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Bay / Level:</span>
                  <div className="text-sm font-mono font-black text-white">{billDetails.slotNumber} (Fl. {billDetails.floor})</div>
                </div>
              </div>

              {/* Timing metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Duration Parked</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {billDetails.billedHours} hr ({billDetails.durationMinutes} mins)
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Hourly Rate</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">
                    ${billDetails.hourlyRate.toFixed(2)}/hr
                  </span>
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-1 pt-1 text-xs text-slate-300 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Base Parking ({billDetails.billedHours} hrs @ ${billDetails.hourlyRate})</span>
                  <span>${billDetails.baseAmount.toFixed(2)}</span>
                </div>
                {billDetails.evChargingFee > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>⚡ EV Fast Charging Surcharge</span>
                    <span>+${billDetails.evChargingFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-700">
                  <span>Total Amount Due</span>
                  <span className="text-emerald-400 text-lg">${billDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentOptions.map(m => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-white ring-1 ring-blue-500'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complete checkout button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProcessCheckOut}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm shadow-lg shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {loading ? 'Processing Payment...' : `Pay $${billDetails.totalAmount.toFixed(2)} & Open Gate`}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
