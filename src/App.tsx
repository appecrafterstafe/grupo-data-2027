import React, { useState, useEffect } from 'react';
import { ActiveTab, PresupuestoData, OrdenTrabajoData, ManoObraData } from './types';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { PresupuestoView } from './components/PresupuestoView';
import { OrdenTrabajoView } from './components/OrdenTrabajoView';
import { ManoObraView } from './components/ManoObraView';
import { AuditView } from './components/AuditView';

const INITIAL_PRESUPUESTO: PresupuestoData = {
  numero: '0001-00000124',
  fecha: new Date().toISOString().split('T')[0],
  validez: '15 días hábiles',
  cliente: 'Empresa Constructora del Litoral S.A.',
  obra: 'Instalación Eléctrica Integral Tablero Principal y Fuerza Motriz',
  lugar: 'Parque Industrial Sauce Viejo, Santa Fe',
  items: [
    {
      id: '1',
      desc: 'Provisión y montaje de tablero principal estanco IP65 con interruptor termomagnético 4x63A y disyuntor diferencial 30mA',
      cant: 1,
      uni: 'Unid',
      precio: 485000,
    },
    {
      id: '2',
      desc: 'Tendido de alimentador subterráneo 4x16mm² XLPE con canalización bajo norma IRAM 2178',
      cant: 45,
      uni: 'Mts',
      precio: 24500,
    },
    {
      id: '3',
      desc: 'Sistema de puesta a tierra con jabalina de cobre 5/8" x 1.5m, cámara de inspección y protocolo de medición SRT 900/15',
      cant: 2,
      uni: 'Kit',
      precio: 160000,
    },
    {
      id: '4',
      desc: 'Circuito independiente de iluminación LED industrial High Bay con comando selector manual/automático',
      cant: 8,
      uni: 'Bocas',
      precio: 38000,
    },
  ],
  obs: 'Todos los materiales responden a normativas IRAM y reglamentación AEA 90364. No incluye tasas municipales ni trámites de conexión con la distribuidora EPE.',
  plazo: '12 días hábiles a partir de la firma de conformidad',
  pago: '50% anticipo al ordenar insumos y 50% al finalizar las pruebas de carga',
};

const INITIAL_ORDEN: OrdenTrabajoData = {
  numero: 'OT-2026-0042',
  fecha: new Date().toISOString().split('T')[0],
  cliente: 'Cooperativa Agropecuaria Santa Fe Ltda.',
  lugar: 'Planta de Silos - Ruta Prov. 1 Km 14',
  personal: 'Ing. Marcelo Gómez / Téc. Cristian Vega / 2 Operarios',
  prioridad: 'Alta',
  items: [
    {
      id: '1',
      desc: 'Inspección termográfica preventiva de tableros seccionales de motores y sinfines',
      cant: '1 relevamiento',
    },
    {
      id: '2',
      desc: 'Reajuste de torque y reemplazo de contactor electromagnético bobina 220V 40A en elevador primario',
      cant: '2 unidades',
    },
    {
      id: '3',
      desc: 'Verificación de continuidad en conductor de protección PE en toda la línea de molienda',
      cant: '1 protocolo',
    },
    {
      id: '4',
      desc: 'Prueba de disparo por pulsador test en disyuntores diferenciales de seguridad',
      cant: '4 módulos',
    },
  ],
  obs: 'Realizar desenergización programada y bloqueo con candados de seguridad (LOTO) previo a la intervención en barra colectora principal.',
};

const INITIAL_MANO_OBRA: ManoObraData = {
  numero: 'MO-2026-088',
  fecha: new Date().toISOString().split('T')[0],
  obra: 'Readecuación Eléctrica y Montaje de Bombas Pluviales',
  lugar: 'Costanera Este, Santa Fe Capital',
  responsable: 'Téc. Fernando Ruiz (Mat. COPITEC 14.892)',
  items: [
    {
      id: '1',
      desc: 'Oficial electricista especialista en automatización y cuadros de comando',
      cant: 32,
      precio: 18500,
    },
    {
      id: '2',
      desc: 'Medio oficial electricista en tendido y fijación de bandejas portacables perforadas',
      cant: 40,
      precio: 13200,
    },
    {
      id: '3',
      desc: 'Ayudante montador de canalizaciones y zanjeo de acometida',
      cant: 24,
      precio: 9800,
    },
    {
      id: '4',
      desc: 'Ingeniería de campo, supervisión técnica y confección de planos unifilares conformes a obra',
      cant: 12,
      precio: 29000,
    },
  ],
  obs: 'Las jornadas incluyen dotación completa de EPP dieléctricos, seguro de ART con cláusula de no repetición y movilidad propia.',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Load from LocalStorage if existing, or use defaults
  const [presupuesto, setPresupuesto] = useState<PresupuestoData>(() => {
    try {
      const saved = localStorage.getItem('gd_presupuesto_data');
      return saved ? JSON.parse(saved) : INITIAL_PRESUPUESTO;
    } catch {
      return INITIAL_PRESUPUESTO;
    }
  });

  const [orden, setOrden] = useState<OrdenTrabajoData>(() => {
    try {
      const saved = localStorage.getItem('gd_orden_data');
      return saved ? JSON.parse(saved) : INITIAL_ORDEN;
    } catch {
      return INITIAL_ORDEN;
    }
  });

  const [manoObra, setManoObra] = useState<ManoObraData>(() => {
    try {
      const saved = localStorage.getItem('gd_mano_obra_data');
      return saved ? JSON.parse(saved) : INITIAL_MANO_OBRA;
    } catch {
      return INITIAL_MANO_OBRA;
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

  const handleResetCurrent = () => {
    if (!window.confirm('¿Desea restablecer los datos de este documento a los valores por defecto?')) return;
    if (activeTab === 'presupuesto') setPresupuesto(INITIAL_PRESUPUESTO);
    if (activeTab === 'orden') setOrden(INITIAL_ORDEN);
    if (activeTab === 'mano_obra') setManoObra(INITIAL_MANO_OBRA);
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
          />
        )}

        {activeTab === 'presupuesto' && (
          <PresupuestoView
            data={presupuesto}
            onChange={setPresupuesto}
            onLoadSample={() => setPresupuesto(INITIAL_PRESUPUESTO)}
          />
        )}

        {activeTab === 'orden' && (
          <OrdenTrabajoView
            data={orden}
            onChange={setOrden}
            onLoadSample={() => setOrden(INITIAL_ORDEN)}
          />
        )}

        {activeTab === 'mano_obra' && (
          <ManoObraView
            data={manoObra}
            onChange={setManoObra}
            onLoadSample={() => setManoObra(INITIAL_MANO_OBRA)}
          />
        )}

        {activeTab === 'audit' && <AuditView />}
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
            <span className="text-slate-400 font-mono">v1.2 (Vercel Ready)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
