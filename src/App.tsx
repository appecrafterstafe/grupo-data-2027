import React, { useState, useEffect } from 'react';
import { ActiveTab, PresupuestoData, OrdenTrabajoData, ManoObraData, PlanificacionData } from './types';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { PresupuestoView } from './components/PresupuestoView';
import { OrdenTrabajoView } from './components/OrdenTrabajoView';
import { ManoObraView } from './components/ManoObraView';
import { PlanificacionView } from './components/PlanificacionView';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const EMPTY_PRESUPUESTO: PresupuestoData = {
  numero: '',
  fecha: getTodayDate(),
  validez: '',
  cliente: '',
  obra: '',
  lugar: '',
  items: [],
  obs: '',
  plazo: '',
  pago: '',
};

const EMPTY_ORDEN: OrdenTrabajoData = {
  numero: '',
  fecha: getTodayDate(),
  cliente: '',
  lugar: '',
  personal: '',
  prioridad: 'Normal',
  items: [],
  obs: '',
};

const EMPTY_MANO_OBRA: ManoObraData = {
  numero: '',
  fecha: getTodayDate(),
  obra: '',
  lugar: '',
  responsable: '',
  items: [],
  obs: '',
};

const EMPTY_PLANIFICACION: PlanificacionData = {
  semanaNumero: '',
  fechaInicio: '',
  fechaFin: '',
  coordinador: '',
  tareas: [],
  materialesCriticos: '',
  seguridadYClima: '',
  obs: '',
};

const STORAGE_KEY_RESET = 'gd_clean_slate_v3';

// Clear previous dummy sample data from localStorage if existing
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(STORAGE_KEY_RESET) !== 'clean') {
      localStorage.removeItem('gd_presupuesto_data');
      localStorage.removeItem('gd_orden_data');
      localStorage.removeItem('gd_mano_obra_data');
      localStorage.removeItem('gd_planificacion_data');
      localStorage.setItem(STORAGE_KEY_RESET, 'clean');
    }
  } catch (e) {
    console.error(e);
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const [presupuesto, setPresupuesto] = useState<PresupuestoData>(() => {
    try {
      const saved = localStorage.getItem('gd_presupuesto_data');
      return saved ? JSON.parse(saved) : EMPTY_PRESUPUESTO;
    } catch {
      return EMPTY_PRESUPUESTO;
    }
  });

  const [orden, setOrden] = useState<OrdenTrabajoData>(() => {
    try {
      const saved = localStorage.getItem('gd_orden_data');
      return saved ? JSON.parse(saved) : EMPTY_ORDEN;
    } catch {
      return EMPTY_ORDEN;
    }
  });

  const [manoObra, setManoObra] = useState<ManoObraData>(() => {
    try {
      const saved = localStorage.getItem('gd_mano_obra_data');
      return saved ? JSON.parse(saved) : EMPTY_MANO_OBRA;
    } catch {
      return EMPTY_MANO_OBRA;
    }
  });

  const [planificacion, setPlanificacion] = useState<PlanificacionData>(() => {
    try {
      const saved = localStorage.getItem('gd_planificacion_data');
      return saved ? JSON.parse(saved) : EMPTY_PLANIFICACION;
    } catch {
      return EMPTY_PLANIFICACION;
    }
  });

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('gd_presupuesto_data', JSON.stringify(presupuesto));
    } catch (e) {
      console.error(e);
    }
  }, [presupuesto]);

  useEffect(() => {
    try {
      localStorage.setItem('gd_orden_data', JSON.stringify(orden));
    } catch (e) {
      console.error(e);
    }
  }, [orden]);

  useEffect(() => {
    try {
      localStorage.setItem('gd_mano_obra_data', JSON.stringify(manoObra));
    } catch (e) {
      console.error(e);
    }
  }, [manoObra]);

  useEffect(() => {
    try {
      localStorage.setItem('gd_planificacion_data', JSON.stringify(planificacion));
    } catch (e) {
      console.error(e);
    }
  }, [planificacion]);

  const handleResetCurrent = () => {
    if (!window.confirm('¿Desea limpiar todos los campos de este formulario?')) return;
    if (activeTab === 'presupuesto') setPresupuesto(EMPTY_PRESUPUESTO);
    if (activeTab === 'orden') setOrden(EMPTY_ORDEN);
    if (activeTab === 'mano_obra') setManoObra(EMPTY_MANO_OBRA);
    if (activeTab === 'planificacion') setPlanificacion(EMPTY_PLANIFICACION);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f6] text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetCurrent}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeDashboard
            setActiveTab={setActiveTab}
            presupuestoData={presupuesto}
            ordenData={orden}
            manoObraData={manoObra}
            planificacionData={planificacion}
          />
        )}

        {activeTab === 'presupuesto' && (
          <PresupuestoView
            data={presupuesto}
            onChange={setPresupuesto}
          />
        )}

        {activeTab === 'orden' && (
          <OrdenTrabajoView
            data={orden}
            onChange={setOrden}
          />
        )}

        {activeTab === 'mano_obra' && (
          <ManoObraView
            data={manoObra}
            onChange={setManoObra}
          />
        )}

        {activeTab === 'planificacion' && (
          <PlanificacionView
            data={planificacion}
            onChange={setPlanificacion}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-800">GRUPO DATA</span>
            <span>| Obras Eléctricas</span>
            <span className="text-slate-400">• Santa Fe Capital, Argentina</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <a href="mailto:info@grupodata.com.ar" className="hover:text-cyan-700 transition">
              info@grupodata.com.ar
            </a>
            <span>•</span>
            <span>Tel: 342 551 9662</span>
            <span>•</span>
            <span className="text-slate-400 font-mono">v1.3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
