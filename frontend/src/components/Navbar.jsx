import React from 'react';
import { 
  Car, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  RotateCcw, 
  Database,
  BarChart3,
  LayoutGrid,
  History,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ 
  stats, 
  activeTab, 
  setActiveTab, 
  onOpenCheckIn, 
  onOpenCheckOut, 
  onOpenAddSlot, 
  onReseed,
  loading 
}) {
  const isMongo = stats?.dbStatus?.isMongoConnected;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">ParkPulse</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  MERN v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Smart Slot Management & IoT Kiosk</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'grid'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Parking Grid
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tickets'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <History className="w-4 h-4" />
              Tickets & History
            </button>
          </nav>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Database indicator badge */}
            <div 
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                isMongo 
                  ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300' 
                  : 'bg-amber-950/60 border-amber-700/50 text-amber-300'
              }`}
              title={isMongo ? 'Connected to live MongoDB instance' : 'Operating in resilient JSON persistence mode'}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isMongo ? 'MongoDB' : 'Local DB'}</span>
            </div>

            {/* Quick Check-In */}
            <button
              onClick={onOpenCheckIn}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Check-In</span>
            </button>

            {/* Quick Check-Out */}
            <button
              onClick={onOpenCheckOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Check-Out</span>
            </button>

            {/* Add Slot */}
            <button
              onClick={onOpenAddSlot}
              title="Add New Parking Slot"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            {/* Reseed demo button */}
            <button
              onClick={onReseed}
              disabled={loading}
              title="Reset Demo Data"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 active:scale-95 transition-all"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1 text-xs py-1 px-3 rounded-md font-medium ${
              activeTab === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1 text-xs py-1 px-3 rounded-md font-medium ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-1 text-xs py-1 px-3 rounded-md font-medium ${
              activeTab === 'tickets' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Tickets
          </button>
        </div>

      </div>
    </header>
  );
}
