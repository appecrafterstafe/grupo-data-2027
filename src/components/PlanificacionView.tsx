import React, { useState, useRef } from 'react';
import { PlanificacionData, PlanTareaItem } from '../types';
import { generatePdfBlob, downloadPdfDirectly } from '../utils/pdfExport';
import { requestGoogleAccessToken, uploadPdfToDrive } from '../utils/googleDrive';
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  CloudUpload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Users,
  Building,
  Check,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface PlanificacionViewProps {
  data: PlanificacionData;
  onChange: (data: PlanificacionData) => void;
}

const DIAS_SEMANA: Array<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'> = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const PlanificacionView: React.FC<PlanificacionViewProps> = ({
  data,
  onChange,
}) => {
  const docRef = useRef<HTMLDivElement>(null);

  // Form state for adding new task
  const [newDia, setNewDia] = useState<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'>('Lunes');
  const [newObra, setNewObra] = useState('');
  const [newTarea, setNewTarea] = useState('');
  const [newPersonal, setNewPersonal] = useState('');
  const [newMovil, setNewMovil] = useState('');
  const [newEstado, setNewEstado] = useState<'Programado' | 'En curso' | 'Finalizado' | 'Pendiente'>('Programado');

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newObra.trim() || !newTarea.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor complete al menos la Obra y la Tarea a realizar.' });
      return;
    }

    const newTask: PlanTareaItem = {
      id: Date.now().toString(),
      dia: newDia,
      obra: newObra.trim(),
      tarea: newTarea.trim(),
      personal: newPersonal.trim() || 'A designar',
      movil: newMovil.trim() || '-',
      estado: newEstado,
    };

    onChange({
      ...data,
      tareas: [...data.tareas, newTask],
    });

    setNewObra('');
    setNewTarea('');
    setNewPersonal('');
    setNewMovil('');
    setStatusMessage(null);
  };

  const handleRemoveTask = (id: string) => {
    onChange({
      ...data,
      tareas: data.tareas.filter((t) => t.id !== id),
    });
  };

  const handleDownloadPdf = async () => {
    if (!docRef.current) return;
    try {
      setIsExporting(true);
      setStatusMessage({ type: 'info', text: 'Generando PDF de Planificación Semanal...' });
      const filename = `Planificacion_Semanal_${data.semanaNumero.replace(/\s+/g, '_') || 'Semana'}.pdf`;
      await downloadPdfDirectly(docRef.current, filename);
      setStatusMessage({ type: 'success', text: '¡Planificación descargada en PDF con éxito!' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: `Error al generar PDF: ${err.message}` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!docRef.current) return;
    try {
      setIsExporting(true);
      setStatusMessage({ type: 'info', text: 'Conectando con Google Drive...' });
      
      const token = await requestGoogleAccessToken();
      setStatusMessage({ type: 'info', text: 'Subiendo Planificación Semanal a Google Drive...' });
      
      const filename = `Planificacion_Semanal_${data.semanaNumero.replace(/\s+/g, '_') || 'Semana'}.pdf`;
      const pdfBlob = await generatePdfBlob(docRef.current, filename);
      
      await uploadPdfToDrive(pdfBlob, filename, token);
      setStatusMessage({ type: 'success', text: '¡Planificación guardada con éxito en Google Drive!' });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        type: 'error', 
        text: `Error en Google Drive: ${err.message}` 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return '--/--/----';
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) return isoDate;
    return `${d}/${m}/${y}`;
  };

  const getEstadoBadge = (estado: PlanTareaItem['estado']) => {
    switch (estado) {
      case 'Finalizado':
        return <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">Finalizado</span>;
      case 'En curso':
        return <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">En curso</span>;
      case 'Pendiente':
        return <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">Pendiente</span>;
      default:
        return <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">Programado</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Status banner */}
      {statusMessage && (
        <div 
          className={`mb-6 p-4 rounded-xl flex items-center justify-between no-print transition-all ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
            {statusMessage.type === 'info' && <CalendarDays className="w-5 h-5 text-indigo-600 animate-pulse" />}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-xs font-semibold px-2 py-1 rounded-md hover:bg-black/5"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Editor Form Column */}
        <div className="xl:col-span-5 space-y-6 no-print">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 border-t-4 border-t-indigo-600">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-indigo-950 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Carga de Planificación Semanal
              </h2>
            </div>

            {/* General Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Semana / Período
                </label>
                <input
                  type="text"
                  value={data.semanaNumero}
                  onChange={(e) => onChange({ ...data, semanaNumero: e.target.value })}
                  placeholder="Ej. Semana 45 (10 al 15 de Noviembre)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Fecha Desde (Lunes)
                </label>
                <input
                  type="date"
                  value={data.fechaInicio}
                  onChange={(e) => onChange({ ...data, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Fecha Hasta (Viernes/Sáb)
                </label>
                <input
                  type="date"
                  value={data.fechaFin}
                  onChange={(e) => onChange({ ...data, fechaFin: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Coordinador de Operaciones
                </label>
                <input
                  type="text"
                  value={data.coordinador}
                  onChange={(e) => onChange({ ...data, coordinador: e.target.value })}
                  placeholder="Ej. Ing. Martín Benítez / Téc. Cristian Vega"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Add Task Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">
                Asignar Tarea Operativa
              </h3>
              <form onSubmit={handleAddTask} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Día
                    </label>
                    <select
                      value={newDia}
                      onChange={(e) => setNewDia(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-900"
                    >
                      {DIAS_SEMANA.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Estado
                    </label>
                    <select
                      value={newEstado}
                      onChange={(e) => setNewEstado(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Programado">Programado</option>
                      <option value="En curso">En curso</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Obra / Cliente / Frente
                  </label>
                  <input
                    type="text"
                    value={newObra}
                    onChange={(e) => setNewObra(e.target.value)}
                    placeholder="Ej. Planta Silos / Barrio Los Sauces"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Trabajos y Tareas a Desarrollar
                  </label>
                  <input
                    type="text"
                    value={newTarea}
                    onChange={(e) => setNewTarea(e.target.value)}
                    placeholder="Ej. Tendido de acometida y conexionado de tablero seccional"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Personal Asignado
                    </label>
                    <input
                      type="text"
                      value={newPersonal}
                      onChange={(e) => setNewPersonal(e.target.value)}
                      placeholder="Ej. Vega / Roldán (2)"
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Móvil / Vehículo
                    </label>
                    <input
                      type="text"
                      value={newMovil}
                      onChange={(e) => setNewMovil(e.target.value)}
                      placeholder="Ej. Camioneta 01"
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Agregar a la Planificación
                </button>
              </form>
            </div>

            {/* Critical materials & Safety */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Materiales Críticos a Despachar / Retirar
                </label>
                <textarea
                  rows={2}
                  value={data.materialesCriticos}
                  onChange={(e) => onChange({ ...data, materialesCriticos: e.target.value })}
                  placeholder="Ej. 150m conductor subterráneo 4x10, jabalinas, borneras de seccionamiento..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Avisos de Seguridad / Cortes Programados EPE
                </label>
                <textarea
                  rows={2}
                  value={data.seguridadYClima}
                  onChange={(e) => onChange({ ...data, seguridadYClima: e.target.value })}
                  placeholder="Ej. Miércoles 08:00hs corte EPE subestación. Obligatorio arnés y detector de tensión."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Observaciones Generales
                </label>
                <input
                  type="text"
                  value={data.obs}
                  onChange={(e) => onChange({ ...data, obs: e.target.value })}
                  placeholder="Reunión de coordinación lunes 07:30hs en base."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleSaveToDrive}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                Guardar en Drive
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Live A4 Sheet Preview Column */}
        <div className="xl:col-span-7 flex justify-center overflow-x-auto pb-8">
          <div 
            ref={docRef} 
            className="a4-document border border-slate-200 shadow-md text-slate-800 bg-white"
          >
            {/* Top Header */}
            <div>
              <div className="flex items-start justify-between border-b-4 border-indigo-700 pb-3 mb-4">
                <div className="flex flex-col">
                  <img
                    src="/logo.png"
                    alt="Grupo Data"
                    className="max-w-[210px] h-auto object-contain mb-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.getElementById('preview-logo-fallback-plan');
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div id="preview-logo-fallback-plan" style={{ display: 'none' }}>
                    <div className="text-2xl font-extrabold text-indigo-900 tracking-wider">GRUPO DATA</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Obras Eléctricas</div>
                  </div>
                </div>

                <div className="text-right">
                  <h1 className="text-2xl font-black text-indigo-800 tracking-wide">
                    PLANIFICACIÓN SEMANAL
                  </h1>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-bold text-slate-700">Período:</span> {data.semanaNumero || '----'}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Rango:</span> {formatDateDisplay(data.fechaInicio)} al {formatDateDisplay(data.fechaFin)}
                  </p>
                </div>
              </div>

              {/* Coordinator and Summary Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 mb-5 text-xs">
                <div>
                  <span className="font-bold text-indigo-900">Coordinador Operativo:</span> {data.coordinador || '----'}
                </div>
                <div>
                  <span className="font-bold text-indigo-900">Total Tareas Programadas:</span> {data.tareas.length} frentes de obra
                </div>
              </div>

              {/* Tasks Table */}
              <table className="w-full text-xs border-collapse mb-5">
                <thead>
                  <tr className="bg-indigo-800 text-white font-semibold">
                    <th className="py-2 px-2 text-center w-20">Día</th>
                    <th className="py-2 px-2 text-left w-36">Obra / Frente</th>
                    <th className="py-2 px-3 text-left">Tareas a Realizar</th>
                    <th className="py-2 px-2 text-center w-28">Personal</th>
                    <th className="py-2 px-2 text-center w-24">Móvil</th>
                    <th className="py-2 px-2 text-center w-24">Estado</th>
                    <th className="py-2 px-1 text-center w-8 no-print">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.tareas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No hay tareas programadas en esta semana.
                      </td>
                    </tr>
                  ) : (
                    data.tareas.map((task, index) => (
                      <tr key={task.id} className={index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                        <td className="py-2 px-2 text-center font-bold text-indigo-950">{task.dia}</td>
                        <td className="py-2 px-2 text-slate-800 font-semibold break-words leading-tight">{task.obra}</td>
                        <td className="py-2 px-3 text-slate-700 break-words leading-tight">{task.tarea}</td>
                        <td className="py-2 px-2 text-center text-slate-600 text-[11px]">{task.personal}</td>
                        <td className="py-2 px-2 text-center text-slate-600 text-[11px]">{task.movil}</td>
                        <td className="py-2 px-2 text-center">{getEstadoBadge(task.estado)}</td>
                        <td className="py-2 px-1 text-center no-print">
                          <button
                            onClick={() => handleRemoveTask(task.id)}
                            title="Eliminar esta tarea"
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Critical Materials, Safety and Dual Signatures */}
            <div className="page-break-avoid">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-[11px]">
                  <span className="font-bold text-amber-900 uppercase block mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Materiales Críticos a Retirar / Despachar
                  </span>
                  <p className="text-slate-700 whitespace-pre-wrap">{data.materialesCriticos || '----'}</p>
                </div>

                <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-3 text-[11px]">
                  <span className="font-bold text-rose-900 uppercase block mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Seguridad y Cortes Programados EPE
                  </span>
                  <p className="text-slate-700 whitespace-pre-wrap">{data.seguridadYClima || '----'}</p>
                </div>
              </div>

              {data.obs && (
                <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-6">
                  <span className="font-bold text-slate-800 uppercase block mb-0.5">Observaciones:</span>
                  <p>{data.obs}</p>
                </div>
              )}

              {/* Dual Signature Lines */}
              <div className="grid grid-cols-2 gap-8 mb-6 pt-4">
                <div className="border-t border-dashed border-slate-400 text-center text-[10px] text-slate-600 pt-1 font-medium">
                  COORDINADOR DE OPERACIONES
                </div>
                <div className="border-t border-dashed border-slate-400 text-center text-[10px] text-slate-600 pt-1 font-medium">
                  DIRECCIÓN TÉCNICA
                </div>
              </div>

              {/* Bottom Contact Bar */}
              <div className="bg-cyan-700 text-white text-[10px] py-2 px-4 rounded-md flex flex-wrap items-center justify-around gap-2 font-medium tracking-wide">
                <span>GRUPO DATA | OBRAS ELÉCTRICAS</span>
                <span>info@grupodata.com.ar</span>
                <span>342 551 9662</span>
                <span>www.grupodata.com.ar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
