import React from 'react';
import { ActiveTab } from '../types';
import { 
  FileSpreadsheet, 
  ClipboardList, 
  HardHat, 
  Home, 
  Wrench, 
  Printer, 
  Download, 
  CloudUpload,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  onUploadDrive?: () => void;
  onResetData?: () => void;
  isProcessing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onPrint,
  onDownloadPdf,
  onUploadDrive,
  onResetData,
  isProcessing,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <img 
              src="/logo.png" 
              alt="Grupo Data" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                // If logo fails, fallback to styled text
                e.currentTarget.style.display = 'none';
                const el = document.getElementById('navbar-brand-fallback');
                if (el) el.style.display = 'block';
              }}
            />
            <div id="navbar-brand-fallback" style={{ display: 'none' }} className="font-bold text-lg text-cyan-700 tracking-wider">
              GRUPO DATA
            </div>
            <span className="hidden md:inline-block text-xs font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Obras Eléctricas
            </span>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Inicio</span>
            </button>

            <button
              onClick={() => setActiveTab('presupuesto')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'presupuesto'
                  ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-cyan-700 hover:bg-cyan-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Presupuesto</span>
            </button>

            <button
              onClick={() => setActiveTab('orden')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'orden'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Orden de Trabajo</span>
              <span className="sm:hidden">OT</span>
            </button>

            <button
              onClick={() => setActiveTab('mano_obra')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'mano_obra'
                  ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span className="hidden sm:inline">Mano de Obra</span>
              <span className="sm:hidden">MO</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span className="font-semibold">Correcciones Vercel</span>
            </button>
          </nav>

          {/* Quick Actions for active document */}
          {activeTab !== 'home' && activeTab !== 'audit' && (
            <div className="hidden lg:flex items-center gap-2">
              {onResetData && (
                <button
                  onClick={onResetData}
                  title="Reiniciar datos de este documento"
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              {onDownloadPdf && (
                <button
                  onClick={onDownloadPdf}
                  disabled={isProcessing}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-1 shadow-xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              )}
              {onUploadDrive && (
                <button
                  onClick={onUploadDrive}
                  disabled={isProcessing}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1 shadow-xs disabled:opacity-50"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Drive</span>
                </button>
              )}
              {onPrint && (
                <button
                  onClick={onPrint}
                  className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
