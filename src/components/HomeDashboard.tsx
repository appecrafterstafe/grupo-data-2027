import React from 'react';
import { ActiveTab, PresupuestoData, OrdenTrabajoData, ManoObraData } from '../types';
import { 
  FileSpreadsheet, 
  ClipboardList, 
  HardHat, 
  ArrowRight, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Building2,
  FileCheck2
} from 'lucide-react';

interface HomeDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  presupuestoData: PresupuestoData;
  ordenData: OrdenTrabajoData;
  manoObraData: ManoObraData;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setActiveTab,
  presupuestoData,
  ordenData,
  manoObraData,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-full text-xs font-semibold mb-4">
          <Building2 className="w-3.5 h-3.5" />
          <span>Santa Fe Capital, Argentina</span>
        </div>
        <div className="flex justify-center mb-4">
          <img 
            src="/logo.png" 
            alt="Grupo Data - Obras Eléctricas" 
            className="h-16 md:h-20 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fb = document.getElementById('home-logo-fb');
              if (fb) fb.style.display = 'block';
            }}
          />
          <div id="home-logo-fb" style={{ display: 'none' }} className="text-3xl font-black text-cyan-700 tracking-wider">
            GRUPO DATA
          </div>
        </div>
        <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-2">
          Sistema de Gestión e Informes
        </p>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Plataforma operativa para la emisión de cotizaciones formales, control de órdenes de trabajo, desglose de mano de obra y exportación de comprobantes oficiales.
        </p>
      </div>

      {/* Main 3 Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Presupuesto */}
        <div 
          onClick={() => setActiveTab('presupuesto')}
          className="group bg-white rounded-2xl p-6 border border-cyan-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-600 group-hover:h-2.5 transition-all" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-700 transition-colors">
              Generar Presupuesto
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Carga de cotizaciones, cómputo métrico de materiales, cálculo de subtotales con moneda argentina y emisión de comprobantes A4.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-800">
              {presupuestoData.items.length} ítems en borrador
            </span>
            <span className="text-xs font-bold text-cyan-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Orden de Trabajo */}
        <div 
          onClick={() => setActiveTab('orden')}
          className="group bg-white rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-600 group-hover:h-2.5 transition-all" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-rose-700 transition-colors">
              Orden de Trabajo
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Asignación técnica de tareas para operarios, control de prioridades, especificación de obra y doble firma de conformidad.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-800">
              {ordenData.items.length} tareas cargadas
            </span>
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Detalle de Mano de Obra */}
        <div 
          onClick={() => setActiveTab('mano_obra')}
          className="group bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-700 group-hover:h-2.5 transition-all" />
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <HardHat className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-800 transition-colors">
              Detalle de Mano de Obra
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Desglose específico de tareas operativas, cómputo de horas hombre, valores por jornal o especialidad y montos totales.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800">
              {manoObraData.items.length} especialidades
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Featured Banner: Vercel Audit & Fixes */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-600 text-white rounded-xl shadow-xs">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                ¿Qué corregir para tu despliegue en Vercel?
              </h3>
              <span className="text-[11px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                Diagnóstico Listo
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Encontramos 6 detalles en tu repositorio (el error con el callback vacío de Google OAuth en <code className="font-mono text-amber-800">mano_obra.html</code>, los botones de basura en PDFs de Google Drive, la falta de <code className="font-mono text-amber-800">vercel.json</code> y la configuración de dominios en Google Cloud). Consulta el informe completo y descarga los archivos corregidos.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('audit')}
          className="shrink-0 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
        >
          <FileCheck2 className="w-4 h-4" />
          Ver Correcciones
        </button>
      </div>
    </div>
  );
};
