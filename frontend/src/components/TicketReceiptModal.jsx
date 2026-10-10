import React from 'react';
import { X, Printer, CheckCircle2, QrCode, Download, Car, Zap } from 'lucide-react';

export default function TicketReceiptModal({ ticket, onClose }) {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCompleted = ticket.status === 'completed' || ticket.paymentStatus === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top decorative receipt cut line */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        {/* Receipt Header */}
        <div className="p-6 text-center border-b border-dashed border-slate-700/80">
          <div className="inline-flex p-3 rounded-2xl bg-slate-800 border border-slate-700 mb-2">
            <Car className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-base font-extrabold text-white tracking-tight">
            Skyline Metro Smart Parking
          </h2>
          <p className="text-[11px] text-slate-400">Automated Smart Slot Management System</p>

          <div className="mt-3 inline-block">
            <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border tracking-wider ${
              isCompleted 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
            }`}>
              {isCompleted ? '✓ PAYMENT COMPLETED' : 'ENTRY TICKET • UNPAID'}
            </span>
          </div>
        </div>

        {/* Receipt Details Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Ticket Number & Barcode simulation */}
          <div className="bg-slate-800/80 p-3 rounded-xl text-center space-y-1.5 border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">Digital Ticket ID</div>
            <div className="font-mono font-black text-sm text-amber-300 tracking-wider">
              {ticket.ticketNumber}
            </div>
            {/* Simulated barcode */}
            <div className="flex justify-center items-center gap-0.5 h-7 pt-1 opacity-80">
              {Array.from({ length: 36 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`bg-slate-200 h-full ${i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-1.5' : 'w-0.5'}`} 
                />
              ))}
            </div>
          </div>

          {/* Key vehicle & slot facts */}
          <div className="space-y-2 border-b border-dashed border-slate-800 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">License Plate</span>
              <span className="font-mono font-black text-amber-300 text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {ticket.licensePlate}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Assigned Bay</span>
              <span className="font-bold text-white font-mono text-sm">
                Slot {ticket.slotNumber} (Floor {ticket.floor})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Vehicle Type</span>
              <span className="font-semibold text-slate-200 capitalize">
                {ticket.vehicleType || 'Car'}
              </span>
            </div>
            {ticket.driverName && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Driver</span>
                <span className="font-semibold text-slate-200">
                  {ticket.driverName}
                </span>
              </div>
            )}
          </div>

          {/* Time & Billing */}
          <div className="space-y-2 border-b border-dashed border-slate-800 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Entry Timestamp</span>
              <span className="font-mono text-slate-300">
                {new Date(ticket.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>

            {ticket.checkOutTime && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Exit Timestamp</span>
                <span className="font-mono text-slate-300">
                  {new Date(ticket.checkOutTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            )}

            {ticket.durationMinutes > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Duration</span>
                <span className="font-bold text-white">
                  {Math.floor(ticket.durationMinutes / 60)}h {ticket.durationMinutes % 60}m
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Hourly Rate</span>
              <span className="font-medium text-slate-300">${ticket.hourlyRate?.toFixed(2)}/hr</span>
            </div>

            {ticket.evChargingFee > 0 && (
              <div className="flex justify-between items-center text-emerald-400">
                <span>⚡ EV Fast Charging</span>
                <span>${ticket.evChargingFee.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Total Amount */}
          {isCompleted ? (
            <div className="flex justify-between items-center pt-1 text-sm font-black">
              <span className="text-white">Amount Paid</span>
              <span className="text-emerald-400 text-lg">
                ${(ticket.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 text-center italic">
              Please present this ticket or license plate number at exit kiosk to settle payment.
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 flex gap-2 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print Ticket
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/30"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
