import React from 'react';
import { ActiveTab, PresupuestoData, OrdenTrabajoData, ManoObraData, PlanificacionData } from '../types';
import { 
  FileSpreadsheet, 
  ClipboardList, 
  HardHat, 
  CalendarDays, 
  ArrowRight, 
  Building2,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface HomeDashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  presupuestoData: PresupuestoData;
  ordenData: OrdenTrabajoData;
  manoObraData: ManoObraData;
  planificacionData: PlanificacionData;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  setActiveTab,
  presupuestoData,
  ordenData,
  manoObraData,
  planificacionData,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
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
          Sistema de Gestión e Informes Operativos
        </p>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Plataforma para la emisión de cotizaciones formales, control de órdenes de trabajo, desglose de mano de obra y planificación semanal de cuadrillas.
        </p>
      </div>

      {/* Main 4 Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Presupuesto */}
        <div 
          onClick={() => setActiveTab('presupuesto')}
          className="group bg-white rounded-2xl p-6 border border-cyan-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-600 group-hover:h-2.5 transition-all" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-cyan-700 transition-colors">
              Generar Presupuesto
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Cotizaciones, cómputo métrico de insumos, cálculo de totales y emisión de comprobantes oficiales A4.
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
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-rose-700 transition-colors">
              Orden de Trabajo
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Asignación técnica de tareas para operarios, prioridades de obra y doble firma de conformidad.
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
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HardHat className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-emerald-800 transition-colors">
              Detalle de Mano de Obra
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Desglose de tareas operativas, cómputo de horas hombre, valores por jornal y montos totales.
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

        {/* Planificación Semanal (Nuevo) */}
        <div 
          onClick={() => setActiveTab('planificacion')}
          className="group bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-700 group-hover:h-2.5 transition-all" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-indigo-800 transition-colors">
              Planificación de Obras
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Cronograma operativo con vista semanal y mensual, asignación de tareas por fecha y personal.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-800">
              {planificacionData.tareas.length} frentes activos
            </span>
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Operational Highlights Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-700" />
          Resumen Operativo de Obra - Grupo Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-1">Presupuesto en Curso</span>
            <span className="text-sm font-bold text-slate-900 block truncate">
              {presupuestoData.obra || 'Sin obra definida'}
            </span>
            <span className="text-[11px] text-cyan-700 font-medium mt-1 block">
              {presupuestoData.cliente || 'Sin cliente asignado'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-1">Última Orden de Trabajo</span>
            <span className="text-sm font-bold text-slate-900 block">
              {ordenData.numero || 'Sin orden activa'}
            </span>
            <span className="text-[11px] text-rose-700 font-medium mt-1 block">
              {ordenData.items.length} tareas asignadas
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-1">Mano de Obra</span>
            <span className="text-sm font-bold text-slate-900 block truncate">
              {manoObraData.responsable || 'Sin responsable asignado'}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
              {manoObraData.items.length} tareas cargadas
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold block mb-1">Planificación Semanal</span>
            <span className="text-sm font-bold text-slate-900 block truncate">
              {planificacionData.semanaNumero || 'Sin cronograma activo'}
            </span>
            <span className="text-[11px] text-indigo-700 font-medium mt-1 block">
              {planificacionData.tareas.length} frentes de cuadrilla
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
